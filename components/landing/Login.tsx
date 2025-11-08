'use client';

import Link from 'next/link';
import { useEffect, useRef, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signInWithGoogle } from '@/lib/auth.client';

export default function Login() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get redirect URL from query params
  const redirectTo = searchParams.get('redirect_to') || '/dashboard';
  
  // Check for error in URL
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Generate particles once
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      size: Math.random() * 3 + 1,
    }));
  }, []);

  // Custom cursor and mouse tracking
  useEffect(() => {
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let animationFrameId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      
      setCursorPosition({ x: e.clientX, y: e.clientY });
      
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });

      const target = e.target as HTMLElement;
      const isInteractive = target.closest('a, button, [role="button"]') !== null;
      setIsHovering(isInteractive);
    };

    const animateCursor = () => {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      
      if (cursorRef.current && cursorDotRef.current) {
        cursorRef.current.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
        cursorDotRef.current.style.transform = `translate(${targetX}px, ${targetY}px) translate(-50%, -50%)`;
      }
      animationFrameId = requestAnimationFrame(animateCursor);
    };

    animateCursor();

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50/40 to-sky-50/30">
      {/* Custom Cursor - Outer Ring */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 w-10 h-10 pointer-events-none z-[9999] transition-all duration-300 ease-out ${
          isHovering ? 'scale-150 opacity-100' : 'scale-100 opacity-80'
        }`}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 blur-sm animate-pulse-slow"></div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-300/50 via-cyan-300/50 to-sky-300/50 backdrop-blur-sm border-2 border-teal-400/60"></div>
        <div className="absolute inset-2 rounded-full bg-white/20"></div>
      </div>
      
      {/* Cursor Dot - Inner Core */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-3 h-3 pointer-events-none z-[9998] transition-all duration-100 ease-out"
      >
        <div className="w-full h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/50"></div>
        <div className="absolute inset-0 rounded-full bg-white/40 animate-ping" style={{ animationDuration: '2s' }}></div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 left-10 w-72 h-72 bg-teal-200/25 rounded-full blur-3xl animate-pulse animate-gradient-xy"
          style={{
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          }}
        ></div>
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200/25 rounded-full blur-3xl animate-pulse animate-gradient-xy"
          style={{ 
            animationDelay: '1s',
            transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)`,
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-200/15 rounded-full blur-3xl animate-gradient-xy"
          style={{
            transform: `translate(${-mousePosition.x * 0.2}px, ${-mousePosition.y * 0.2}px)`,
          }}
        ></div>
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-teal-300/20 rounded-full blur-2xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-cyan-300/20 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Animated grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(teal 1px, transparent 1px),
            linear-gradient(90deg, teal 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      ></div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-float glow-particle"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `radial-gradient(circle, rgba(20, 184, 166, 0.4), rgba(6, 182, 212, 0.2))`,
              boxShadow: `0 0 ${particle.size * 2}px rgba(20, 184, 166, 0.3)`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
            }}
          ></div>
        ))}
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-2xl border border-white/50 animate-fade-in-up">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent">
                Better ATS
              </h1>
            </Link>
            <p className="text-slate-600 text-lg">Welcome back! Sign in to continue</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={async () => {
              try {
                setIsLoading(true);
                setError(null);
                await signInWithGoogle(redirectTo);
              } catch (err: any) {
                setError(err.message || 'Failed to sign in with Google');
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-300 rounded-xl hover:border-teal-400 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-slate-700 font-semibold text-base group-hover:text-teal-600 transition-colors">
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/70 text-slate-500">or</span>
            </div>
          </div>

          {/* Google Sign Up Button */}
          <button
            onClick={async () => {
              try {
                setIsLoading(true);
                setError(null);
                await signInWithGoogle(redirectTo);
              } catch (err: any) {
                setError(err.message || 'Failed to sign up with Google');
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="white"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="white"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="white"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="white"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-semibold text-base">
              {isLoading ? 'Signing up...' : 'Sign up with Google'}
            </span>
          </button>

          {/* Back to home */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-slate-600 hover:text-teal-600 transition-colors inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

