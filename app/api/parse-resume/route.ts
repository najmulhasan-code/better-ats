/**
 * PDF Resume Parsing API
 * 
 * HTTP endpoint for parsing resume PDFs
 * Uses LLM extraction from lib/resume module
 */

import { NextResponse } from 'next/server';
import { parsePdfBuffer, parsePdfFromUrl } from '@/lib/resume';

/**
 * POST /api/parse-resume
 * Parse resume PDF from file upload or URL
 * 
 * Query parameters:
 * - useLLM: boolean (default: true) - Whether to use LLM extraction
 * 
 * Body (JSON):
 * - resumeUrl: string - URL of resume PDF to parse
 * 
 * Body (Form Data):
 * - file: File - Resume PDF file to parse
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const requestUrl = new URL(request.url);
    const useLLM = requestUrl.searchParams.get('useLLM') !== 'false';
    
    if (contentType.includes('application/json')) {
      // Handle URL-based input
      const body = await request.json();
      const { resumeUrl } = body;
      
      if (!resumeUrl) {
        return NextResponse.json(
          { error: 'resumeUrl is required' },
          { status: 400 }
        );
      }
      
      // Parse PDF directly from URL
      const parsedData = await parsePdfFromUrl(resumeUrl, useLLM);
      
      return NextResponse.json({
        success: true,
        extractionMethod: useLLM && process.env.ANTHROPIC_API_KEY ? 'llm' : 'raw',
        ...parsedData,
      });
    } else if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json(
          { error: 'File is required' },
          { status: 400 }
        );
      }
      
      // Check if it's a PDF
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        return NextResponse.json(
          { error: 'File must be a PDF' },
          { status: 400 }
        );
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdfBuffer = Buffer.from(arrayBuffer);
      
      // Parse PDF (with LLM if available, fallback to raw text)
      const parsedData = await parsePdfBuffer(pdfBuffer, useLLM);
      
      return NextResponse.json({
        success: true,
        extractionMethod: useLLM && process.env.ANTHROPIC_API_KEY ? 'llm' : 'raw',
        ...parsedData,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid content type. Use application/json with resumeUrl or multipart/form-data with file' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Resume parsing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to parse resume',
      },
      { status: 500 }
    );
  }
}
