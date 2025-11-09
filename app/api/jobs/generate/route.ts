import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const { title, skills, experience, culture } = await request.json();

    if (!title || !skills) {
      return NextResponse.json(
        { error: 'Title and skills are required' },
        { status: 400 }
      );
    }

    const prompt = `Generate a professional job description for the following position:

Job Title: ${title}
Required Skills: ${skills}
Experience Level: ${experience || 'Not specified'}
Company Culture: ${culture || 'Not specified'}

Please generate 3 different versions of the job description:
1. Professional/Formal tone
2. Casual/Startup tone
3. Technical/Detailed tone

Each description should include:
- Brief company introduction placeholder
- Role overview
- Key responsibilities (4-6 bullet points)
- Required qualifications
- Nice-to-have skills
- What we offer

Format the response as JSON with this structure:
{
  "formal": "...",
  "casual": "...",
  "technical": "..."
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const descriptions = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      descriptions,
      success: true,
    });
  } catch (error) {
    console.error('Job generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to generate job descriptions',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
