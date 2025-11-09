'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useMemo, useState } from 'react';
import Navbar from './Navbar';
import { FeatureAnimationWrapper } from './features/FeatureAnimationWrapper';
import { CandidateSourcingAnimation } from './features/CandidateSourcingAnimation';
import { ResumeScreeningAnimation } from './features/ResumeScreeningAnimation';
import { ScoringRankingAnimation } from './features/ScoringRankingAnimation';

export default function Hero() {
  const cardRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  // Mouse tracking for parallax and 3D effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Update mouse position for parallax
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });

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

    const handleMouseLeave = () => {
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
    };
  }, []);

  // Scroll animation observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Handle both id and data-feature attributes
          const id = entry.target.id || entry.target.getAttribute('data-feature');
          if (id) {
            setVisibleSections((prev) => new Set(prev).add(id));
          }
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('[data-scroll-section]');
    sections.forEach((section) => observer.observe(section));

    // Also observe individual feature sections
    const featureSections = document.querySelectorAll('[data-feature]');
    featureSections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <div className="relative">
      {/* Navbar */}
      <Navbar />
      

      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 z-[9997]" style={{ background: 'rgba(83, 113, 254, 0.1)' }}>
        <div
          className="h-full transition-all duration-150 ease-out shadow-lg"
          style={{ 
            width: `${scrollProgress}%`,
            background: 'linear-gradient(to right, #5371FE, #8B5CF6, #5371FE)',
          }}
        ></div>
      </div>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20 md:pt-24"
        style={{
          background: 'linear-gradient(to bottom right, rgba(83, 113, 254, 0.05), rgba(139, 92, 246, 0.03), rgba(83, 113, 254, 0.02))',
          transform: `translateY(${scrollY * 0.3}px)`,
          opacity: Math.max(0, 1 - scrollY / 500),
        }}
      >
        {/* Animated gradient background */}
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
            <div className="absolute inset-0 rounded-full backdrop-blur-sm border border-white/20 shadow-2xl" style={{ background: 'linear-gradient(to bottom right, rgba(83, 113, 254, 0.25), rgba(139, 92, 246, 0.25))' }}></div>
            <div className="absolute inset-2 rounded-full" style={{ background: 'linear-gradient(to top right, rgba(139, 92, 246, 0.2), rgba(83, 113, 254, 0.2))' }}></div>
            <div className="absolute inset-4 rounded-full" style={{ background: 'linear-gradient(to bottom right, rgba(83, 113, 254, 0.15), rgba(139, 92, 246, 0.15))' }}></div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Main Heading with animated glow */}
            <div className="mb-8 animate-fade-in-up">
              <h1 className="text-7xl sm:text-8xl lg:text-9xl font-bold mb-4 leading-tight tracking-tight relative">
                <span 
                  className="relative z-10 animate-text-shimmer inline-block"
                  style={{ 
                    background: 'linear-gradient(to right, #5371FE, #8B5CF6, #5371FE)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  Better ATS
                </span>
                <span 
                  className="absolute inset-0 text-7xl sm:text-8xl lg:text-9xl font-bold blur-xl opacity-50 animate-pulse-slow pointer-events-none" 
                  style={{ 
                    background: 'linear-gradient(to right, rgba(83, 113, 254, 0.6), rgba(139, 92, 246, 0.6), rgba(83, 113, 254, 0.6))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
          Better ATS
                </span>
        </h1>
              <div className="h-1 w-32 mx-auto rounded-full mb-6 animate-expand-width" style={{ background: 'linear-gradient(to right, #5371FE, #8B5CF6)' }}></div>
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
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto transition-transform duration-300 ease-out animate-fade-in-up"
              style={{ transformStyle: 'preserve-3d', animationDelay: '0.6s' }}
            >
              <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden" style={{ border: '1px solid rgba(83, 113, 254, 0.2)' }}>
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(to bottom right, rgba(83, 113, 254, 0.12), rgba(139, 92, 246, 0.12))' }}></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#5371FE] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 mb-6 flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 rounded-2xl p-3" style={{ background: 'linear-gradient(135deg, rgba(83, 113, 254, 0.15), rgba(139, 92, 246, 0.15))' }}>
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#5371FE' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-[#5371FE] transition-colors duration-300">AI-Powered</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Intelligent candidate matching and evaluation</p>
                </div>
              </div>

              <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden" style={{ border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(to bottom right, rgba(139, 92, 246, 0.12), rgba(83, 113, 254, 0.12))' }}></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-18 h-18 mb-6 flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 rounded-2xl p-3" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(83, 113, 254, 0.15))' }}>
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#8B5CF6' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-[#8B5CF6] transition-colors duration-300">Smart Hiring</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Find the perfect fit beyond keywords</p>
                </div>
              </div>

              <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden" style={{ border: '1px solid rgba(83, 113, 254, 0.2)' }}>
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(to bottom right, rgba(83, 113, 254, 0.12), rgba(139, 92, 246, 0.12))' }}></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#5371FE] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 mb-6 flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 rounded-2xl p-3" style={{ background: 'linear-gradient(135deg, rgba(83, 113, 254, 0.15), rgba(139, 92, 246, 0.15))' }}>
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#5371FE' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-[#5371FE] transition-colors duration-300">Lightning Fast</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Streamlined workflow for recruiters</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
        <Link 
              href="/login"
              className="group relative inline-block px-10 py-5 text-white text-lg font-semibold rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 animate-fade-in-up"
              style={{ 
                animationDelay: '0.8s',
                background: 'linear-gradient(to right, #5371FE, #8B5CF6, #5371FE)',
                boxShadow: '0 20px 25px -5px rgba(83, 113, 254, 0.3), 0 10px 10px -5px rgba(83, 113, 254, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 25px 30px -5px rgba(83, 113, 254, 0.4), 0 15px 15px -5px rgba(83, 113, 254, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(83, 113, 254, 0.3), 0 10px 10px -5px rgba(83, 113, 254, 0.2)';
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
          Get Started
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, rgba(83, 113, 254, 0.9), rgba(139, 92, 246, 0.9), rgba(83, 113, 254, 0.9))' }}></div>
        </Link>

            {/* Trust indicators */}
            <div className="mt-16 pt-12 border-t animate-fade-in-up" style={{ animationDelay: '1s', borderColor: 'rgba(83, 113, 254, 0.2)' }}>
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
                background: `radial-gradient(circle, rgba(83, 113, 254, 0.4), rgba(139, 92, 246, 0.2))`,
                boxShadow: `0 0 ${particle.size * 2}px rgba(83, 113, 254, 0.3)`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
              }}
            ></div>
          ))}
        </div>
      </section>

      {/* Features Section - Redesigned with Alternating Layout */}
      <section 
        id="features"
        data-scroll-section
        className="py-32 bg-gradient-to-b from-white via-slate-50/50 to-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl font-bold text-slate-800 mb-4">Powerful Features</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Everything you need to revolutionize your hiring process</p>
          </div>

          {/* Feature 1: Candidate Sourcing & Posting - Animation Right, Text Left */}
          <div className="mb-32 min-h-[500px] flex items-center" data-feature="feature-1">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isVisible('feature-1') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`}>
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6" style={{ background: 'rgba(83, 113, 254, 0.1)', color: '#5371FE' }}>
                  <span>01</span>
                  <span>Candidate Sourcing & Posting</span>
                </div>
                <h3 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6">Reach Candidates Everywhere</h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  Publish jobs to 50+ boards with one click, build branded career sites, leverage employee networks, and automate talent sourcing—all from one powerful platform.
                </p>
                <ul className="space-y-3">
                  {['Multi-board job posting - Publish jobs to 50+ boards simultaneously with one click', 'Career site builder - Create branded career pages to showcase company culture', 'Employee referral system - Tap into employee networks for quality candidates', 'Job board integrations - Connect with LinkedIn, Indeed, Glassdoor, ZipRecruiter', 'Automated talent sourcing - Continuously identify and engage potential candidates'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700">
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: '#5371FE' }}></div>
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-1 lg:order-2 h-[500px] lg:h-[600px] rounded-3xl bg-gradient-to-br from-[#5371FE]/10 to-[#8B5CF6]/10 backdrop-blur-sm flex items-center justify-center p-4">
                <FeatureAnimationWrapper Component={CandidateSourcingAnimation} />
              </div>
            </div>
          </div>

          {/* Feature 2: Resume Management & Screening - Animation Left, Text Right */}
          <div className="mb-32 min-h-[500px] flex items-center" data-feature="feature-2">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isVisible('feature-2') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`}>
              <div className="h-[500px] lg:h-[600px] rounded-3xl bg-gradient-to-br from-[#8B5CF6]/10 to-[#5371FE]/10 backdrop-blur-sm flex items-center justify-center p-4">
                <FeatureAnimationWrapper Component={ResumeScreeningAnimation} />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
                  <span>02</span>
                  <span>Resume Management & Screening</span>
                </div>
                <h3 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6">Intelligent Resume Processing</h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  Automatically extract and organize candidate information, filter high volumes instantly, match candidates to roles using AI, and maintain a comprehensive database with customizable profiles.
                </p>
                <ul className="space-y-3">
                  {['AI resume parsing - Automatically extract and organize candidate information', 'Automated resume screening - Filter high volumes of applications instantly', 'Smart candidate matching - Match candidates to roles using AI algorithms', 'Centralized candidate database - Store and access all candidate data in one place', 'Customizable candidate profiles - Tailor profile fields to your needs', 'Candidate tagging system - Organize and segment applicants efficiently'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700">
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: '#8B5CF6' }}></div>
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Feature 3: Scoring & Ranking - Animation Right, Text Left */}
          <div className="mb-32 min-h-[500px] flex items-center" data-feature="feature-3">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isVisible('feature-3') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`}>
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
                  <span>03</span>
                  <span>Scoring & Ranking</span>
                </div>
                <h3 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6">Advanced Candidate Scoring</h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  Analyze resumes against job requirements, quantify candidate fit with numerical scores, leverage machine learning for improved accuracy, and forecast candidate success with predictive analytics.
                </p>
                <ul className="space-y-3">
                  {['Keyword matching engine - Analyze resumes against job requirements', 'Point-based scoring system - Quantify candidate fit with numerical scores', 'Percentage-based scoring system - Rank candidates by match percentage', 'Machine learning ranking - Improve accuracy by learning from hiring patterns', 'Custom qualification weighting - Prioritize criteria important to your organization', 'Predictive analytics - Forecast candidate success before interviews'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700">
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: '#8B5CF6' }}></div>
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-1 lg:order-2 h-[500px] lg:h-[600px] rounded-3xl bg-gradient-to-br from-[#8B5CF6]/10 to-[#5371FE]/10 backdrop-blur-sm flex items-center justify-center p-4">
                <FeatureAnimationWrapper Component={ScoringRankingAnimation} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section 
        id="about"
        data-scroll-section
        className={`py-24 transition-all duration-1000 ${isVisible('about') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ background: 'linear-gradient(to bottom, rgba(83, 113, 254, 0.05), rgba(139, 92, 246, 0.06))' }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl sm:text-6xl font-bold text-slate-800 mb-4">About Us</h2>
              <div className="h-1 w-24 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #5371FE, #8B5CF6)' }}></div>
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl" style={{ border: '1px solid rgba(83, 113, 254, 0.2)' }}>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                Better ATS is the future of talent acquisition. Built by the <span className="font-semibold" style={{ color: '#5371FE' }}>AI@UNCP Team at UNC Pembroke</span>, we're revolutionizing how companies discover and hire exceptional talent.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                Our mission is simple: <span className="font-semibold" style={{ color: '#8B5CF6' }}>Hire Talent, Not Template</span>. We believe that every candidate is unique, and traditional ATS systems that rely on keyword matching miss out on exceptional talent. Our AI-native platform goes beyond resumes to understand skills, potential, and cultural fit.
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
                  className={`text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg ${isVisible('about') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                  style={{ 
                    transitionDelay: `${(idx + 1) * 150}ms`,
                    border: '1px solid rgba(83, 113, 254, 0.2)',
                  }}
                >
                  <div className="text-5xl font-bold bg-clip-text text-transparent mb-2" style={{ background: 'linear-gradient(to right, #5371FE, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.number}</div>
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
        className={`py-24 transition-all duration-1000 ${isVisible('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ background: 'linear-gradient(to bottom, rgba(139, 92, 246, 0.06), white)' }}
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
                  className={`group flex flex-col md:flex-row items-center gap-8 bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden ${isVisible('how-it-works') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'} ${item.highlight ? 'ring-2 ring-offset-2' : ''}`}
                  style={{ 
                    transitionDelay: `${idx * 200}ms`,
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    ...(item.highlight ? { ringColor: '#5371FE' } : {}),
                  }}
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(to bottom right, rgba(83, 113, 254, 0.08), rgba(139, 92, 246, 0.08))' }}></div>
                  
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" style={{ background: 'linear-gradient(to bottom right, #5371FE, #8B5CF6)' }}>
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

      {/* Trusted By Companies Section */}
      <section 
        id="trusted-by"
        data-scroll-section
        className={`py-24 transition-all duration-1000 ${isVisible('trusted-by') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ background: 'linear-gradient(to bottom, rgba(83, 113, 254, 0.03), rgba(139, 92, 246, 0.05), white)' }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6" style={{ background: 'rgba(83, 113, 254, 0.1)', color: '#5371FE' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Trusted by Industry Leaders
            </div>
            <h2 className="text-5xl sm:text-6xl font-bold text-slate-800 mb-4">Companies That Trust Us</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join forward-thinking companies revolutionizing their hiring process
            </p>
          </div>

          {/* Logo Carousel */}
          <div className="relative overflow-hidden py-12">
            {/* Gradient overlays for fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))' }}></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))' }}></div>
            
            {/* Scrolling container */}
            <div className="flex gap-16 animate-scroll-left">
              {/* Company logos array - duplicated for seamless loop */}
              {[
                '/Company1.png',
                '/Company2.png',
                '/Company3.png',
                '/Company1.png',
                '/Company2.png',
                '/Company3.png',
              ].map((logo, i) => (
                <div
                  key={`first-${i}`}
                  className="group flex-shrink-0 flex items-center justify-center w-80 h-48 transition-all duration-300 cursor-pointer p-8"
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={logo}
                      alt={`Company ${i + 1}`}
                      width={240}
                      height={120}
                      className="object-contain w-full h-full transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg"
                      style={{ maxWidth: '100%', maxHeight: '100%', filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))' }}
                      unoptimized
                    />
                  </div>
                </div>
              ))}
              
              {/* Duplicate set for seamless loop */}
              {[
                '/Company1.png',
                '/Company2.png',
                '/Company3.png',
                '/Company1.png',
                '/Company2.png',
                '/Company3.png',
              ].map((logo, i) => (
                <div
                  key={`second-${i}`}
                  className="group flex-shrink-0 flex items-center justify-center w-80 h-48 transition-all duration-300 cursor-pointer p-8"
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={logo}
                      alt={`Company ${i + 1}`}
                      width={240}
                      height={120}
                      className="object-contain w-full h-full transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg"
                      style={{ maxWidth: '100%', maxHeight: '100%', filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))' }}
                      unoptimized
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
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
              Developed by <span className="font-semibold" style={{ color: '#5371FE' }}>AI@UNCP Team</span> at UNC Pembroke
            </div>
          </div>
      </div>
      </footer>
    </div>
  );
}