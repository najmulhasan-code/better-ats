'use client';

import { Upload, FileText, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';

interface JobApplicationViewProps {
  job: any;
  isPreview?: boolean; // If true, form fields are disabled
  onSubmit?: (data: any) => void;
  isSubmitting?: boolean;
}

export default function JobApplicationView({
  job,
  isPreview = false,
  onSubmit,
  isSubmitting = false
}: JobApplicationViewProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentLocation: '',
    linkedIn: '',
    portfolio: '',
    coverLetter: '',
    // EEO fields
    veteranStatus: '',
    disability: '',
    gender: '',
    race: '',
  });
  const [resume, setResume] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [knockoutAnswers, setKnockoutAnswers] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCustomAnswerChange = (questionId: string, value: string) => {
    setCustomAnswers({
      ...customAnswers,
      [questionId]: value,
    });
  };

  const handleKnockoutAnswerChange = (questionId: string, value: string) => {
    setKnockoutAnswers({
      ...knockoutAnswers,
      [questionId]: value,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isPreview) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isPreview) return;

    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      setResume(file);
    } else {
      alert('Please upload a PDF file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResume(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPreview && onSubmit) {
      onSubmit({ formData, resume, customAnswers, knockoutAnswers });
    }
  };

  // Get application form configuration (if exists)
  const appForm = job.applicationForm || {};
  const standardFields = appForm.standardFields || [];
  const knockoutQuestions = appForm.knockoutQuestions || [];
  const eeoFields = appForm.eeoFields || {};
  const customQuestions = appForm.customQuestions || [];

  // Helper function to find a field configuration
  const getField = (id: string) => {
    return standardFields.find((f: any) => f.id === id) || { enabled: true, required: id === 'fullName' || id === 'email' || id === 'resume' };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Job Description */}
      {(job.fullDescription || job.description) && (
        <section>
          <h2 className="text-[18px] font-semibold text-slate-900 mb-4 tracking-tight">About the role</h2>
          <p className="text-[15px] text-slate-700 leading-relaxed">{job.fullDescription || job.description}</p>
        </section>
      )}

      {/* Responsibilities */}
      {job.responsibilities && job.responsibilities.length > 0 && (
        <section>
          <h2 className="text-[18px] font-semibold text-slate-900 mb-4 tracking-tight">Responsibilities</h2>
          <ul className="space-y-2.5">
            {job.responsibilities.map((item: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2.5 text-[15px] text-slate-700 leading-relaxed">
                <span className="text-slate-400 mt-1 text-[16px] leading-none">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <section>
          <h2 className="text-[18px] font-semibold text-slate-900 mb-4 tracking-tight">Requirements</h2>
          <ul className="space-y-2.5">
            {job.requirements.map((item: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2.5 text-[15px] text-slate-700 leading-relaxed">
                <span className="text-slate-400 mt-1 text-[16px] leading-none">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Nice to Have */}
      {job.niceToHave && job.niceToHave.length > 0 && (
        <section>
          <h2 className="text-[18px] font-semibold text-slate-900 mb-4 tracking-tight">Nice to have</h2>
          <ul className="space-y-2.5">
            {job.niceToHave.map((item: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2.5 text-[15px] text-slate-700 leading-relaxed">
                <span className="text-slate-400 mt-1 text-[16px] leading-none">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Company Info */}
      {job.company && (
        <section className="pt-6 border-t border-slate-200/60">
          <h2 className="text-[18px] font-semibold text-slate-900 mb-4 tracking-tight">About {job.company.name}</h2>
          <div className="space-y-2.5 text-[14px]">
            <p>
              <span className="font-semibold text-slate-900">Company:</span>{' '}
              <span className="text-slate-700">{job.company.name}</span>
            </p>
            {job.department && (
              <p>
                <span className="font-semibold text-slate-900">Department:</span>{' '}
                <span className="text-slate-700">{job.department}</span>
              </p>
            )}
            {job.company.description && (
              <p className="text-[15px] text-slate-700 leading-relaxed mt-3">
                {job.company.description}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Application Form */}
      <section className="pt-6 border-t border-slate-200/60">
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
          <h2 className="text-[18px] font-semibold text-slate-900 mb-5 tracking-tight">Apply for this position</h2>

          <div className="space-y-5">
            {/* Always show basic required fields */}
            <div>
              <label htmlFor="fullName" className="block text-[13px] font-semibold text-slate-900 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                disabled={isPreview || isSubmitting}
                className="w-full px-4 py-3 border border-slate-300/80 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-slate-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isPreview || isSubmitting}
                className="w-full px-4 py-3 border border-slate-300/80 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
                placeholder="john@example.com"
              />
            </div>

            {/* Phone */}
            {getField('phone').enabled && (
              <div>
                <label htmlFor="phone" className="block text-[13px] font-semibold text-slate-900 mb-2">
                  Phone Number
                  {!getField('phone').required && <span className="text-slate-500 font-normal"> (optional)</span>}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required={getField('phone').required}
                  disabled={isPreview || isSubmitting}
                  className="w-full px-4 py-3 border border-slate-300/80 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            )}

            {/* Current Location */}
            {getField('currentLocation').enabled && (
              <div>
                <label htmlFor="currentLocation" className="block text-[13px] font-semibold text-slate-900 mb-2">
                  Current Location
                  {!getField('currentLocation').required && <span className="text-slate-500 font-normal"> (optional)</span>}
                </label>
                <input
                  type="text"
                  id="currentLocation"
                  name="currentLocation"
                  value={formData.currentLocation}
                  onChange={handleInputChange}
                  required={getField('currentLocation').required}
                  disabled={isPreview || isSubmitting}
                  className="w-full px-4 py-3 border border-slate-300/80 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
                  placeholder="San Francisco, CA"
                />
              </div>
            )}

            {/* LinkedIn */}
            {getField('linkedin').enabled && (
              <div>
                <label htmlFor="linkedIn" className="block text-[13px] font-semibold text-slate-900 mb-2">
                  LinkedIn Profile
                  {!getField('linkedin').required && <span className="text-slate-500 font-normal"> (optional)</span>}
                </label>
                <input
                  type="url"
                  id="linkedIn"
                  name="linkedIn"
                  value={formData.linkedIn}
                  onChange={handleInputChange}
                  required={getField('linkedin').required}
                  disabled={isPreview || isSubmitting}
                  className="w-full px-4 py-3 border border-slate-300/80 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>
            )}

            {/* Portfolio */}
            {getField('portfolio').enabled && (
              <div>
                <label htmlFor="portfolio" className="block text-[13px] font-semibold text-slate-900 mb-2">
                  Portfolio / Website
                  {!getField('portfolio').required && <span className="text-slate-500 font-normal"> (optional)</span>}
                </label>
                <input
                  type="url"
                  id="portfolio"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  required={getField('portfolio').required}
                  disabled={isPreview || isSubmitting}
                  className="w-full px-4 py-3 border border-slate-300/80 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
                  placeholder="https://johndoe.com"
                />
              </div>
            )}

            {/* Resume Upload */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-900 mb-2">
                Resume (PDF)
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isPreview && !isSubmitting && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  isDragging
                    ? 'border-slate-400 bg-slate-50/50'
                    : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/30'
                } ${isPreview || isSubmitting ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  disabled={isPreview || isSubmitting}
                  className="hidden"
                />

                {resume ? (
                  <div className="flex items-center gap-3">
                    <FileText size={28} className="text-slate-600" strokeWidth={2} />
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-[14px] truncate">{resume.name}</p>
                      <p className="text-[13px] text-slate-500">
                        {(resume.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload size={40} className="mx-auto text-slate-400 mb-3" strokeWidth={1.5} />
                    <p className="text-slate-700 font-medium mb-1 text-[14px]">
                      Drop your resume or click to browse
                    </p>
                    <p className="text-[13px] text-slate-500">PDF, max 10MB</p>
                  </div>
                )}
              </div>

              {resume && !isPreview && !isSubmitting && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setResume(null);
                  }}
                  className="mt-2 text-[13px] text-slate-600 hover:text-slate-900 transition-colors font-medium"
                >
                  Remove file
                </button>
              )}
            </div>

            {/* Cover Letter */}
            {getField('coverLetter').enabled && (
              <div>
                <label htmlFor="coverLetter" className="block text-[13px] font-semibold text-slate-900 mb-2">
                  Cover Letter
                  {!getField('coverLetter').required && <span className="text-slate-500 font-normal"> (optional)</span>}
                </label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  required={getField('coverLetter').required}
                  disabled={isPreview || isSubmitting}
                  rows={5}
                  className="w-full px-4 py-3 border border-slate-300/80 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed resize-none transition-all"
                  placeholder="Tell us why you're interested in this role..."
                />
              </div>
            )}

            {/* Screening/Knockout Questions */}
            {knockoutQuestions.length > 0 && (
              <div className="pt-6 border-t border-slate-200/60">
                <h3 className="text-[15px] font-semibold text-slate-900 mb-4">Screening Questions</h3>
                <div className="space-y-4">
                  {knockoutQuestions.map((question: any) => (
                    <div key={question.id}>
                      <label className="block text-[13px] font-semibold text-slate-900 mb-3">
                        {question.question}
                        {question.required && <span className="text-red-600 ml-1">*</span>}
                      </label>
                      <div className="flex gap-3">
                        <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all ${
                          knockoutAnswers[question.id] === 'yes'
                            ? 'border-[#5371FE] bg-blue-50'
                            : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400'
                        } ${isPreview || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <input
                            type="radio"
                            name={question.id}
                            value="yes"
                            checked={knockoutAnswers[question.id] === 'yes'}
                            onChange={(e) => handleKnockoutAnswerChange(question.id, e.target.value)}
                            required={question.required}
                            disabled={isPreview || isSubmitting}
                            className="text-[#5371FE] focus:ring-[#5371FE]"
                          />
                          <span className="text-[14px] font-medium">Yes</span>
                        </label>
                        <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all ${
                          knockoutAnswers[question.id] === 'no'
                            ? 'border-[#5371FE] bg-blue-50'
                            : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400'
                        } ${isPreview || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <input
                            type="radio"
                            name={question.id}
                            value="no"
                            checked={knockoutAnswers[question.id] === 'no'}
                            onChange={(e) => handleKnockoutAnswerChange(question.id, e.target.value)}
                            required={question.required}
                            disabled={isPreview || isSubmitting}
                            className="text-[#5371FE] focus:ring-[#5371FE]"
                          />
                          <span className="text-[14px] font-medium">No</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equal Opportunity Questions */}
            {Object.values(eeoFields).some((f: any) => f.enabled) && (
              <div className="pt-6 border-t border-slate-200/60">
                <h3 className="text-[15px] font-semibold text-slate-900 mb-4">Equal Opportunity (Optional)</h3>
                <p className="text-[12px] text-slate-600 bg-slate-100 px-3 py-2 rounded-lg mb-4">
                  We are an equal opportunity employer. This information is voluntary and will not affect your application.
                </p>
                <div className="space-y-4">
                  {eeoFields.veteran?.enabled && (
                    <div>
                      <label htmlFor="veteranStatus" className="block text-[13px] font-semibold text-slate-900 mb-2">
                        Veteran Status <span className="text-slate-500 font-normal">(optional)</span>
                      </label>
                      <select
                        id="veteranStatus"
                        name="veteranStatus"
                        value={formData.veteranStatus}
                        onChange={handleInputChange}
                        disabled={isPreview || isSubmitting}
                        className="w-full px-4 py-3 border border-slate-300/80 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
                      >
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  )}
                  {eeoFields.disability?.enabled && (
                    <div>
                      <label htmlFor="disability" className="block text-[13px] font-semibold text-slate-900 mb-2">
                        Disability Status <span className="text-slate-500 font-normal">(optional)</span>
                      </label>
                      <select
                        id="disability"
                        name="disability"
                        value={formData.disability}
                        onChange={handleInputChange}
                        disabled={isPreview || isSubmitting}
                        className="w-full px-4 py-3 border border-slate-300/80 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
                      >
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  )}
                  {eeoFields.gender?.enabled && (
                    <div>
                      <label htmlFor="gender" className="block text-[13px] font-semibold text-slate-900 mb-2">
                        Gender <span className="text-slate-500 font-normal">(optional)</span>
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        disabled={isPreview || isSubmitting}
                        className="w-full px-4 py-3 border border-slate-300/80 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
                      >
                        <option value="">Select...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  )}
                  {eeoFields.race?.enabled && (
                    <div>
                      <label htmlFor="race" className="block text-[13px] font-semibold text-slate-900 mb-2">
                        Race / Ethnicity <span className="text-slate-500 font-normal">(optional)</span>
                      </label>
                      <select
                        id="race"
                        name="race"
                        value={formData.race}
                        onChange={handleInputChange}
                        disabled={isPreview || isSubmitting}
                        className="w-full px-4 py-3 border border-slate-300/80 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
                      >
                        <option value="">Select...</option>
                        <option value="american-indian">American Indian or Alaska Native</option>
                        <option value="asian">Asian</option>
                        <option value="black">Black or African American</option>
                        <option value="hispanic">Hispanic or Latino</option>
                        <option value="pacific-islander">Native Hawaiian or Pacific Islander</option>
                        <option value="white">White</option>
                        <option value="two-or-more">Two or more races</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Custom Questions */}
            {customQuestions.length > 0 && (
              <div className="pt-6 border-t border-slate-200/60">
                <h3 className="text-[15px] font-semibold text-slate-900 mb-4">Additional Questions</h3>
                <div className="space-y-4">
                  {customQuestions.map((question: any, idx: number) => (
                    <div key={idx}>
                      <label htmlFor={`custom-${idx}`} className="block text-[13px] font-semibold text-slate-900 mb-2">
                        {question.label}
                        {question.required && <span className="text-red-600 ml-1">*</span>}
                        {!question.required && <span className="text-slate-500 font-normal"> (optional)</span>}
                      </label>
                      {question.type === 'text' && (
                        <input
                          type="text"
                          id={`custom-${idx}`}
                          value={customAnswers[`custom-${idx}`] || ''}
                          onChange={(e) => handleCustomAnswerChange(`custom-${idx}`, e.target.value)}
                          required={question.required}
                          disabled={isPreview || isSubmitting}
                          className="w-full px-4 py-3 border border-slate-300/80 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
                        />
                      )}
                      {question.type === 'textarea' && (
                        <textarea
                          id={`custom-${idx}`}
                          value={customAnswers[`custom-${idx}`] || ''}
                          onChange={(e) => handleCustomAnswerChange(`custom-${idx}`, e.target.value)}
                          required={question.required}
                          disabled={isPreview || isSubmitting}
                          rows={4}
                          className="w-full px-4 py-3 border border-slate-300/80 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed resize-none transition-all"
                        />
                      )}
                      {question.type === 'yesno' && (
                        <div className="flex gap-3">
                          <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all ${
                            customAnswers[`custom-${idx}`] === 'yes'
                              ? 'border-[#5371FE] bg-blue-50'
                              : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400'
                          } ${isPreview || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <input
                              type="radio"
                              name={`custom-${idx}`}
                              value="yes"
                              checked={customAnswers[`custom-${idx}`] === 'yes'}
                              onChange={(e) => handleCustomAnswerChange(`custom-${idx}`, e.target.value)}
                              required={question.required}
                              disabled={isPreview || isSubmitting}
                              className="text-[#5371FE] focus:ring-[#5371FE]"
                            />
                            <span className="text-[14px] font-medium">Yes</span>
                          </label>
                          <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all ${
                            customAnswers[`custom-${idx}`] === 'no'
                              ? 'border-[#5371FE] bg-blue-50'
                              : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400'
                          } ${isPreview || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <input
                              type="radio"
                              name={`custom-${idx}`}
                              value="no"
                              checked={customAnswers[`custom-${idx}`] === 'no'}
                              onChange={(e) => handleCustomAnswerChange(`custom-${idx}`, e.target.value)}
                              required={question.required}
                              disabled={isPreview || isSubmitting}
                              className="text-[#5371FE] focus:ring-[#5371FE]"
                            />
                            <span className="text-[14px] font-medium">No</span>
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          {!isPreview && (
            <>
              <button
                type="submit"
                disabled={isSubmitting || !resume}
                className="w-full mt-8 bg-slate-900 text-white px-6 py-3.5 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-[15px] shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" strokeWidth={2.5} />
                    Submitting Application...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>

              <p className="mt-4 text-[13px] text-slate-500 text-center leading-relaxed">
                By submitting, you agree to our terms and privacy policy.
              </p>
            </>
          )}

          {/* Preview mode - disabled button */}
          {isPreview && (
            <>
              <button
                disabled
                className="w-full mt-8 bg-slate-900 text-white px-6 py-3.5 rounded-xl font-semibold text-[15px] shadow-sm opacity-50 cursor-not-allowed"
              >
                Submit Application
              </button>

              <p className="mt-4 text-[13px] text-slate-500 text-center leading-relaxed">
                By submitting, you agree to our terms and privacy policy.
              </p>
            </>
          )}
        </form>
      </section>
    </div>
  );
}
