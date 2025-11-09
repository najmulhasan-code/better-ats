'use client';

import Link from 'next/link';
import { useEffect, useRef, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signInWithGoogle } from '@/lib/auth/client';
import Navbar from './Navbar';

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(to bottom right, rgba(83, 113, 254, 0.05), rgba(139, 92, 246, 0.03), rgba(83, 113, 254, 0.02))' }}>
      {/* Navbar */}
      <Navbar />


      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse animate-gradient-xy"
          style={{ 
            background: 'rgba(83, 113, 254, 0.15)',
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          }}
        ></div>
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse animate-gradient-xy"
          style={{ 
            background: 'rgba(139, 92, 246, 0.15)',
            animationDelay: '1s',
            transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)`,
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl animate-gradient-xy"
          style={{ 
            background: 'rgba(83, 113, 254, 0.08)',
            transform: `translate(${-mousePosition.x * 0.2}px, ${-mousePosition.y * 0.2}px)`,
          }}
        ></div>
        <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full blur-2xl animate-float-slow" style={{ background: 'rgba(83, 113, 254, 0.12)' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full blur-2xl animate-float-slow" style={{ background: 'rgba(139, 92, 246, 0.12)', animationDelay: '2s' }}></div>
      </div>

      {/* Animated grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(#5371FE 1px, transparent 1px),
            linear-gradient(90deg, #5371FE 1px, transparent 1px)
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
              <h1 className="text-4xl font-bold bg-clip-text text-transparent" style={{ background: 'linear-gradient(to right, #5371FE, #8B5CF6, #5371FE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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
            className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-300 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#5371FE';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgb(203 213 225)';
            }}
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
            <span className="text-slate-700 font-semibold text-base transition-colors" style={{ color: 'inherit' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#5371FE';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgb(51 65 85)';
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </span>
          </button>

          {/* Back to home */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-slate-600 transition-colors inline-flex items-center gap-1"
              style={{ color: 'inherit' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#5371FE';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgb(71 85 105)';
              }}
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

