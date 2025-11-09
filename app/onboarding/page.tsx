'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate slug from company name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      setError('Please enter a company name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const slug = generateSlug(companyName);

      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          companySlug: slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create company');
      }

      // Success! Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8 w-full max-w-md">
        {/* Icon */}
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Building2 size={32} className="text-white" strokeWidth={2.5} />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome to Better ATS
          </h1>
          <p className="text-slate-600">
            Let's set up your company profile to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-bold text-slate-700 mb-2">
              Company Name
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Inc."
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 transition-all font-medium"
              disabled={isSubmitting}
              autoFocus
            />
            {companyName && (
              <p className="text-xs text-slate-500 mt-2">
                Your company URL: <span className="font-mono font-semibold">/jobs/{generateSlug(companyName)}</span>
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !companyName.trim()}
            className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Creating your company...
              </>
            ) : (
              'Continue to Dashboard'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-slate-500 text-center mt-6">
          You'll be able to invite team members later
        </p>
      </div>
    </div>
  );
}
