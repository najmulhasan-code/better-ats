'use client';

import Link from 'next/link';
import { useEffect, useRef, useMemo, useState } from 'react';

export default function Hero() {
  const cardRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Generate particles once
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      size: Math.random() * 3 + 1,
    }));
  }, []);

  // Parallax scroll effect with smooth progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      
      setScrollY(scrollTop);
      setScrollProgress(progress);
    };
    
    // Smooth scroll with requestAnimationFrame
    let ticking = false;
    const smoothScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', smoothScroll, { passive: true });
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', smoothScroll);
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
      
      // Update cursor position state
      setCursorPosition({ x: e.clientX, y: e.clientY });
      
      // Update mouse position for parallax
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('a, button, [role="button"]') !== null;
      setIsHovering(isInteractive);

      // 3D card tilt effect
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      }

      // 3D sphere effect
      if (sphereRef.current) {
        const rect = sphereRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 30;
        const rotateY = (centerX - x) / 30;
        
        sphereRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
    };

    const animateCursor = () => {
      // Smooth easing for cursor
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      
      if (cursorRef.current && cursorDotRef.current) {
        // Smooth cursor following with easing
        cursorRef.current.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
        cursorDotRef.current.style.transform = `translate(${targetX}px, ${targetY}px) translate(-50%, -50%)`;
      }
      animationFrameId = requestAnimationFrame(animateCursor);
    };

    animateCursor();

    const handleMouseLeave = () => {
      setIsHovering(false);
      if (cardRef.current) {
        cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      }
      if (sphereRef.current) {
        sphereRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Scroll animation observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set(prev).add(entry.target.id));
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('[data-scroll-section]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <div className="relative">
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

      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-teal-100/20 z-[9997]">
        <div
          className="h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 transition-all duration-150 ease-out shadow-lg"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50/40 to-sky-50/30"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          opacity: Math.max(0, 1 - scrollY / 500),
        }}
      >
        {/* Animated gradient background */}
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
            transform: `translate(${scrollY * 0.1}px, ${scrollY * 0.1}px)`,
          }}
        ></div>

        {/* 3D Floating Sphere */}
        <div 
          ref={sphereRef}
          className="absolute top-20 right-20 w-32 h-32 hidden lg:block transition-transform duration-300 ease-out"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400/40 to-cyan-400/40 backdrop-blur-sm border border-white/20 shadow-2xl"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-sky-300/30 to-teal-300/30"></div>
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-300/20 to-mint-300/20"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Main Heading with animated glow */}
            <div className="mb-8 animate-fade-in-up">
              <h1 className="text-7xl sm:text-8xl lg:text-9xl font-bold mb-4 bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent leading-tight tracking-tight relative">
                <span className="relative z-10 animate-text-shimmer">Better ATS</span>
                <span className="absolute inset-0 text-7xl sm:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent blur-xl opacity-50 animate-pulse-slow"></span>
        </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto rounded-full mb-6 animate-expand-width"></div>
            </div>

            {/* Tagline */}
            <p className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-700 mb-4 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Hire Talent, Not Template
            </p>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              AI-Native Applicant Tracking System that transforms how you discover, evaluate, and hire exceptional talent
            </p>

            {/* 3D Feature Cards */}
            <div 
              ref={cardRef}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto transition-transform duration-300 ease-out animate-fade-in-up"
              style={{ transformStyle: 'preserve-3d', animationDelay: '0.6s' }}
            >
              <div className="group relative bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-teal-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 mb-4 flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300 text-slate-700">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">AI-Powered</h3>
                  <p className="text-slate-600 text-sm">Intelligent candidate matching and evaluation</p>
                </div>
              </div>

              <div className="group relative bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-cyan-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-sky-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 mb-4 flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300 text-slate-700">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Smart Hiring</h3>
                  <p className="text-slate-600 text-sm">Find the perfect fit beyond keywords</p>
                </div>
              </div>

              <div className="group relative bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-sky-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 mb-4 flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300 text-slate-700">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Lightning Fast</h3>
                  <p className="text-slate-600 text-sm">Streamlined workflow for recruiters</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Link 
              href="/login"
              className="group relative inline-block px-10 py-5 bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 text-white text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-teal-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: '0.8s' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            {/* Trust indicators */}
            <div className="mt-16 pt-12 border-t border-teal-200/50 animate-fade-in-up" style={{ animationDelay: '1s' }}>
              <p className="text-sm text-slate-500 mb-4">Developed by AI@UNCP Team of UNC Pembroke</p>
              <div className="flex justify-center items-center gap-8 opacity-60">
                <div className="text-2xl font-bold text-slate-400">AI-First</div>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="text-2xl font-bold text-slate-400">Data-Driven</div>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="text-2xl font-bold text-slate-400">Future-Ready</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced floating particles with glow */}
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
      </section>

      {/* AI Video Interview Feature - Highlight Section */}
      <section 
        id="video-interview"
        data-scroll-section
        className={`py-32 bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-600 text-white relative overflow-hidden transition-all duration-1000 ${isVisible('video-interview') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        {/* Animated background waves */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-white/10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            animation: 'wave 20s linear infinite',
          }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Content */}
              <div className={`space-y-6 ${isVisible('video-interview') ? 'animate-slide-in-left' : ''}`}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4 animate-pulse-slow">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Revolutionary Feature
                </div>
                <h2 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
                  AI Video Interviews
                  <span className="block text-4xl mt-2 bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                    Filter Out Bots & Garbage Applications
                  </span>
                </h2>
                <p className="text-xl text-white/90 leading-relaxed mb-6">
                  Every applicant completes a <span className="font-bold text-yellow-200">2-minute AI-powered video interview</span> where our AI asks them about themselves, their experience, and motivation.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center animate-bounce-slow">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">AI-Powered Questions</h3>
                      <p className="text-white/80">Intelligent, personalized questions that reveal true candidate potential</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center animate-bounce-slow" style={{ animationDelay: '0.2s' }}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Bot Detection</h3>
                      <p className="text-white/80">Automatically filters out bot applications and low-quality submissions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center animate-bounce-slow" style={{ animationDelay: '0.4s' }}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Save 80% Time</h3>
                      <p className="text-white/80">No more sifting through hundreds of irrelevant applications</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Visual */}
              <div className={`relative ${isVisible('video-interview') ? 'animate-scale-in' : ''}`}>
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/30 shadow-2xl">
                  {/* Video mockup */}
                  <div className="aspect-video bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/30 to-cyan-500/30 animate-pulse-slow"></div>
                    <div className="relative z-10 text-center">
                      <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <p className="text-white font-semibold">2-Minute AI Interview</p>
                    </div>
                    {/* Recording indicator */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/80 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-xs text-white font-semibold">REC</span>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center bg-white/10 rounded-xl p-4">
                      <div className="text-3xl font-bold mb-1">2min</div>
                      <div className="text-sm text-white/80">Per Interview</div>
                    </div>
                    <div className="text-center bg-white/10 rounded-xl p-4">
                      <div className="text-3xl font-bold mb-1">80%</div>
                      <div className="text-sm text-white/80">Time Saved</div>
                    </div>
                    <div className="text-center bg-white/10 rounded-xl p-4">
                      <div className="text-3xl font-bold mb-1">95%</div>
                      <div className="text-sm text-white/80">Bot Filtered</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400/30 rounded-full blur-xl animate-float-slow"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-orange-400/30 rounded-full blur-xl animate-float-slow" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="features"
        data-scroll-section
        className={`py-24 bg-gradient-to-b from-white to-teal-50/30 transition-all duration-1000 ${isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{
          transform: `translateY(${Math.max(0, (scrollY - 800) * 0.1)}px)`,
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl font-bold text-slate-800 mb-4">Powerful Features</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Everything you need to revolutionize your hiring process</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ), 
                title: 'Smart Matching', 
                desc: 'AI analyzes skills, experience, and cultural fit', 
                color: 'from-teal-500 to-cyan-500' 
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ), 
                title: 'Analytics Dashboard', 
                desc: 'Real-time insights into your hiring pipeline', 
                color: 'from-cyan-500 to-sky-500' 
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                ), 
                title: 'Automated Screening', 
                desc: 'Save time with intelligent resume parsing', 
                color: 'from-sky-500 to-teal-500' 
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ), 
                title: 'AI Video Interviews', 
                desc: '2-minute video interviews filter bots automatically', 
                color: 'from-teal-500 to-cyan-500', 
                highlight: true 
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ), 
                title: 'Secure & Compliant', 
                desc: 'Enterprise-grade security and privacy', 
                color: 'from-cyan-500 to-sky-500' 
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ), 
                title: 'Lightning Speed', 
                desc: 'Process hundreds of applications in minutes', 
                color: 'from-sky-500 to-teal-500' 
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-teal-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden ${isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${feature.highlight ? 'ring-2 ring-teal-400 ring-offset-2' : ''}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                {/* Animated gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-br ${feature.color} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 text-slate-700">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-800 mb-3">{feature.title}</h3>
                  <p className="text-slate-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section 
        id="about"
        data-scroll-section
        className={`py-24 bg-gradient-to-b from-teal-50/30 to-cyan-50/40 transition-all duration-1000 ${isVisible('about') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl sm:text-6xl font-bold text-slate-800 mb-4">About Us</h2>
              <div className="h-1 w-24 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto rounded-full"></div>
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border border-teal-100">
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                Better ATS is the future of talent acquisition. Built by the <span className="font-semibold text-teal-600">AI@UNCP Team at UNC Pembroke</span>, we're revolutionizing how companies discover and hire exceptional talent.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                Our mission is simple: <span className="font-semibold text-cyan-600">Hire Talent, not Template</span>. We believe that every candidate is unique, and traditional ATS systems that rely on keyword matching miss out on exceptional talent. Our AI-native platform goes beyond resumes to understand skills, potential, and cultural fit.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                With cutting-edge machine learning algorithms, we help recruiters make data-driven decisions while maintaining the human touch that makes great hires. Join us in building the future of recruitment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                { number: '10x', label: 'Faster Hiring' },
                { number: '95%', label: 'Accuracy Rate' },
                { number: '50%', label: 'Time Saved' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className={`text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-teal-100 ${isVisible('about') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                  style={{ transitionDelay: `${(idx + 1) * 150}ms` }}
                >
                  <div className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">{stat.number}</div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        id="how-it-works"
        data-scroll-section
        className={`py-24 bg-gradient-to-b from-cyan-50/40 to-white transition-all duration-1000 ${isVisible('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl font-bold text-slate-800 mb-4">How It Works</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Simple, intuitive, and powerful</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="space-y-12">
              {[
                { 
                  step: '01', 
                  title: 'Upload & Parse', 
                  desc: 'Simply upload resumes or connect your job boards. Our AI instantly parses and extracts key information.', 
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ) 
                },
                { 
                  step: '02', 
                  title: 'AI Video Interview', 
                  desc: 'Applicants complete a 2-minute AI video interview. This automatically filters out bots and low-quality applications.', 
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  ), 
                  highlight: true 
                },
                { 
                  step: '03', 
                  title: 'AI Analysis & Matching', 
                  desc: 'Advanced algorithms analyze video responses, skills, experience, and cultural fit to create comprehensive candidate profiles.', 
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  ) 
                },
                { 
                  step: '04', 
                  title: 'Interview & Hire', 
                  desc: 'Schedule interviews, track feedback, and make data-driven hiring decisions all in one platform.', 
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) 
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`group flex flex-col md:flex-row items-center gap-8 bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-cyan-100 hover:shadow-2xl transition-all duration-500 relative overflow-hidden ${isVisible('how-it-works') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'} ${item.highlight ? 'ring-2 ring-teal-400 ring-offset-2' : ''}`}
                  style={{ transitionDelay: `${idx * 200}ms` }}
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      {item.step}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg text-slate-700 animate-bounce-slow">
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left relative z-10">
                    <h3 className="text-2xl font-semibold text-slate-800 mb-3">{item.title}</h3>
                    <p className="text-slate-600 text-lg">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        id="cta"
        data-scroll-section
        className={`py-24 bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-600 text-white transition-all duration-1000 ${isVisible('cta') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl sm:text-6xl font-bold mb-6">Ready to Transform Your Hiring?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Join forward-thinking companies that are already using Better ATS to find exceptional talent
        </p>
        <Link 
          href="/login"
            className="inline-block px-10 py-5 bg-white text-teal-600 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-white/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
        >
            Get Started Free
        </Link>
      </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-600">
              © {new Date().getFullYear()} Better ATS. All rights reserved.
            </div>
            <div className="text-sm text-slate-500">
              Developed by <span className="font-semibold text-teal-600">AI@UNCP Team</span> at UNC Pembroke
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}