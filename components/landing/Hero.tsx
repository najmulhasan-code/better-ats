import Link from 'next/link';

export default function Hero() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Better ATS
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          AI-Native Applicant Tracking System
        </p>
        <Link 
          href="/dashboard"
          className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}