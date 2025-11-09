'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Briefcase, Users } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  departments: string[];
  locations: string[];
  jobTypes: string[];
}

export default function SettingsPage() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);

  // Temporary input states for adding new items
  const [newDepartment, setNewDepartment] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newJobType, setNewJobType] = useState('');

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const response = await fetch('/api/dashboard/company');
      if (!response.ok) throw new Error('Failed to fetch company data');

      const data = await response.json();
      setCompany(data.company);
      setName(data.company.name);
      setDescription(data.company.description || '');
      setDepartments(data.company.departments || []);
      setLocations(data.company.locations || []);
      setJobTypes(data.company.jobTypes || []);
    } catch (error) {
      console.error('Error fetching company:', error);
      setSaveError('Failed to load company settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const response = await fetch('/api/dashboard/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          departments,
          locations,
          jobTypes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save settings');
      }

      const data = await response.json();
      setCompany(data.company);
      setSaveSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setSaveError(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const addDepartment = () => {
    if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
      setDepartments([...departments, newDepartment.trim()]);
      setNewDepartment('');
    }
  };

  const removeDepartment = (dept: string) => {
    setDepartments(departments.filter(d => d !== dept));
  };

  const addLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation('');
    }
  };

  const removeLocation = (loc: string) => {
    setLocations(locations.filter(l => l !== loc));
  };

  const addJobType = () => {
    if (newJobType.trim() && !jobTypes.includes(newJobType.trim())) {
      setJobTypes([...jobTypes, newJobType.trim()]);
      setNewJobType('');
    }
  };

  const removeJobType = (type: string) => {
    setJobTypes(jobTypes.filter(t => t !== type));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600 text-[15px]">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[40px] font-bold text-slate-900 mb-2">Company Settings</h1>
          <p className="text-[15px] text-slate-600">Manage your company information and preferences</p>
        </div>

        {/* Error Alert */}
        {saveError && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-xl border border-red-200/80 rounded-xl">
            <p className="text-[13px] font-semibold text-red-800">{saveError}</p>
          </div>
        )}

        {/* Success Alert */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50/80 backdrop-blur-xl border border-green-200/80 rounded-xl">
            <p className="text-[13px] font-semibold text-green-800">Settings saved successfully!</p>
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Company Name */}
            <div>
              <label className="flex items-center gap-2 text-[13px] font-semibold text-slate-700 mb-3">
                <Building2 size={16} className="text-[#5371FE]" />
                Company Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5371FE]/20 focus:border-[#5371FE] transition-all"
                placeholder="Enter company name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-3">
                Company Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5371FE]/20 focus:border-[#5371FE] transition-all resize-none"
                placeholder="Brief description of your company"
              />
            </div>

            {/* Departments */}
            <div>
              <label className="flex items-center gap-2 text-[13px] font-semibold text-slate-700 mb-3">
                <Users size={16} className="text-[#5371FE]" />
                Departments
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addDepartment()}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5371FE]/20 focus:border-[#5371FE] transition-all"
                  placeholder="Add department (e.g., Engineering)"
                />
                <button
                  onClick={addDepartment}
                  className="px-5 py-2.5 bg-[#5371FE] text-white text-[13px] font-semibold rounded-xl hover:bg-[#4461ED] active:bg-[#3551DC] transition-all"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => (
                  <div
                    key={dept}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg"
                  >
                    <span className="text-[13px] text-slate-700">{dept}</span>
                    <button
                      onClick={() => removeDepartment(dept)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div>
              <label className="flex items-center gap-2 text-[13px] font-semibold text-slate-700 mb-3">
                <MapPin size={16} className="text-[#5371FE]" />
                Locations
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5371FE]/20 focus:border-[#5371FE] transition-all"
                  placeholder="Add location (e.g., San Francisco, CA)"
                />
                <button
                  onClick={addLocation}
                  className="px-5 py-2.5 bg-[#5371FE] text-white text-[13px] font-semibold rounded-xl hover:bg-[#4461ED] active:bg-[#3551DC] transition-all"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {locations.map((loc) => (
                  <div
                    key={loc}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg"
                  >
                    <span className="text-[13px] text-slate-700">{loc}</span>
                    <button
                      onClick={() => removeLocation(loc)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Types */}
            <div>
              <label className="flex items-center gap-2 text-[13px] font-semibold text-slate-700 mb-3">
                <Briefcase size={16} className="text-[#5371FE]" />
                Job Types
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newJobType}
                  onChange={(e) => setNewJobType(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addJobType()}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5371FE]/20 focus:border-[#5371FE] transition-all"
                  placeholder="Add job type (e.g., Full-time, Contract)"
                />
                <button
                  onClick={addJobType}
                  className="px-5 py-2.5 bg-[#5371FE] text-white text-[13px] font-semibold rounded-xl hover:bg-[#4461ED] active:bg-[#3551DC] transition-all"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {jobTypes.map((type) => (
                  <div
                    key={type}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg"
                  >
                    <span className="text-[13px] text-slate-700">{type}</span>
                    <button
                      onClick={() => removeJobType(type)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer with Save Button */}
          <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-200/80 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 bg-[#5371FE] text-white text-[15px] font-semibold rounded-xl hover:bg-[#4461ED] active:bg-[#3551DC] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
