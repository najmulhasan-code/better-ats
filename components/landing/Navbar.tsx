'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar at the top
      if (currentScrollY < 10) {
        setIsVisible(true);
      } 
      // Hide when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);


  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[10000] transition-all duration-300 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(83, 113, 254, 0.1)',
        boxShadow: '0 4px 24px 0 rgba(83, 113, 254, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
      }}
    >
      {/* Enhanced glossy overlay effect - Light mode */}
      <div 
        className="absolute inset-0 pointer-events-none dark:hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.2) 100%)',
        }}
      />
      
      {/* Enhanced glossy overlay effect - Dark mode */}
      <div 
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.03) 50%, rgba(255, 255, 255, 0.08) 100%)',
        }}
      />
      
      {/* Subtle gradient accent */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(83, 113, 254, 0.3), transparent)',
        }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group relative z-10">
            <div className="relative transition-all duration-300 group-hover:scale-105 group-hover:opacity-90">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#5371FE]/20 to-[#8B5CF6]/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Image
                src="/BETTERATS_LOGO.svg"
                alt="Better ATS Logo"
                width={180}
                height={36}
                className="h-8 md:h-10 w-auto object-contain relative z-10 transition-all duration-300"
                priority
              />
            </div>
          </Link>

          {/* Sign In Button - Hidden on login page */}
          {!isLoginPage && (
            <Link
              href="/login"
              className="group flex items-center justify-center gap-2.5 px-5 py-2.5 md:px-7 md:py-3 relative z-10 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden text-white font-semibold text-sm md:text-base"
              style={{
                background: 'linear-gradient(to right, #5371FE, #8B5CF6, #5371FE)',
                boxShadow: '0 4px 20px 0 rgba(83, 113, 254, 0.3), 0 2px 10px -5px rgba(83, 113, 254, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 28px 0 rgba(83, 113, 254, 0.4), 0 4px 15px -5px rgba(83, 113, 254, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px 0 rgba(83, 113, 254, 0.3), 0 2px 10px -5px rgba(83, 113, 254, 0.2)';
              }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, rgba(83, 113, 254, 0.9), rgba(139, 92, 246, 0.9), rgba(83, 113, 254, 0.9))' }}></div>
              <span className="relative z-10">
                Sign In
              </span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

