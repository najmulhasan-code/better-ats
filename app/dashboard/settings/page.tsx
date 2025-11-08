'use client';

import { useState } from 'react';
import { Building2, MapPin, Briefcase, Tag, Plus, X, Save, Check } from 'lucide-react';
import { CURRENT_COMPANY } from '@/lib/auth';
import { COMPANY_SETTINGS } from '@/lib/companySettings';

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState(CURRENT_COMPANY.name);
  const [companyDescription, setCompanyDescription] = useState('Building the future of enterprise software');
  const [departments, setDepartments] = useState(COMPANY_SETTINGS.departments);
  const [locations, setLocations] = useState(COMPANY_SETTINGS.locations);
  const [jobTypes, setJobTypes] = useState(COMPANY_SETTINGS.jobTypes);

  const [newDepartment, setNewDepartment] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newJobType, setNewJobType] = useState('');
  const [saved, setSaved] = useState(false);

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

  const handleSave = () => {
    // In production, this would save to Supabase
    console.log('Saving settings:', {
      companyName,
      companyDescription,
      departments,
      locations,
      jobTypes,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Company Settings</h1>
        <p className="text-slate-600">
          Configure your company information and job posting options
        </p>
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <Building2 size={20} strokeWidth={2.5} className="text-slate-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Company Information</h2>
            <p className="text-sm text-slate-600">This appears on your public careers page</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 transition-all font-medium"
              placeholder="Your Company Name"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Company Description
            </label>
            <textarea
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900 transition-all font-medium resize-none"
              placeholder="Brief description of your company..."
            />
            <p className="text-xs text-slate-500 mt-1">
              This appears in the hero section of your careers page
            </p>
          </div>
        </div>
      </div>

      {/* Departments */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border-2 border-blue-200">
            <Tag size={20} strokeWidth={2.5} className="text-blue-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Departments</h2>
            <p className="text-sm text-slate-600">Job categories for filtering</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addDepartment()}
              className="flex-1 px-4 py-2.5 border-2 border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 transition-all"
              placeholder="Add department (e.g., Engineering, Sales)"
            />
            <button
              onClick={addDepartment}
              className="px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold transition-colors flex items-center gap-2"
            >
              <Plus size={18} strokeWidth={2.5} />
              Add
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {departments.map((dept) => (
            <div
              key={dept}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-lg font-semibold"
            >
              <span>{dept}</span>
              <button
                onClick={() => removeDepartment(dept)}
                className="hover:bg-blue-200 rounded p-0.5 transition-colors"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          ))}
          {departments.length === 0 && (
            <p className="text-slate-500 text-sm py-2">No departments added yet</p>
          )}
        </div>
      </div>

      {/* Locations */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border-2 border-emerald-200">
            <MapPin size={20} strokeWidth={2.5} className="text-emerald-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Locations</h2>
            <p className="text-sm text-slate-600">Office locations and remote options</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addLocation()}
              className="flex-1 px-4 py-2.5 border-2 border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 transition-all"
              placeholder="Add location (e.g., San Francisco, CA)"
            />
            <button
              onClick={addLocation}
              className="px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold transition-colors flex items-center gap-2"
            >
              <Plus size={18} strokeWidth={2.5} />
              Add
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {locations.map((loc) => (
            <div
              key={loc}
              className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 border-2 border-emerald-200 rounded-lg font-semibold"
            >
              <span>{loc}</span>
              <button
                onClick={() => removeLocation(loc)}
                className="hover:bg-emerald-200 rounded p-0.5 transition-colors"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          ))}
          {locations.length === 0 && (
            <p className="text-slate-500 text-sm py-2">No locations added yet</p>
          )}
        </div>
      </div>

      {/* Job Types */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center border-2 border-purple-200">
            <Briefcase size={20} strokeWidth={2.5} className="text-purple-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Job Types</h2>
            <p className="text-sm text-slate-600">Employment types for your positions</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newJobType}
              onChange={(e) => setNewJobType(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addJobType()}
              className="flex-1 px-4 py-2.5 border-2 border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 transition-all"
              placeholder="Add job type (e.g., Full-time, Contract)"
            />
            <button
              onClick={addJobType}
              className="px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold transition-colors flex items-center gap-2"
            >
              <Plus size={18} strokeWidth={2.5} />
              Add
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {jobTypes.map((type) => (
            <div
              key={type}
              className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 border-2 border-purple-200 rounded-lg font-semibold"
            >
              <span>{type}</span>
              <button
                onClick={() => removeJobType(type)}
                className="hover:bg-purple-200 rounded p-0.5 transition-colors"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          ))}
          {jobTypes.length === 0 && (
            <p className="text-slate-500 text-sm py-2">No job types added yet</p>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-6 flex items-center justify-end gap-3">
        <button
          onClick={handleSave}
          className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg'
          }`}
        >
          {saved ? (
            <>
              <Check size={20} strokeWidth={2.5} />
              Saved!
            </>
          ) : (
            <>
              <Save size={20} strokeWidth={2.5} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
