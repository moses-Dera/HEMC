'use client';

import { useState, useTransition } from 'react';
import { User, Shield, KeyRound, LogOut, Building, GraduationCap, Hash, Mail, Settings, Palette, CheckCircle2, AlertCircle, Save, HeartPulse, Phone, Home } from 'lucide-react';
import ThemeToggleItem from '@/components/ui/ThemeToggleItem';
import { updateProfile, updatePassword } from '@/lib/profile';
import { logout } from '@/lib/auth';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  reg_number?: string | null;
  department?: string | null;
  level?: string | null;
  phone_number?: string | null;
  blood_group?: string | null;
  genotype?: string | null;
  allergies?: string | null;
  emergency_contact?: string | null;
  hostel?: string | null;
}

type Tab = 'general' | 'academic' | 'medical' | 'security' | 'preferences';

export default function ProfileClient({ user }: { user: UserData }) {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [isPending, startTransition] = useTransition();
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'general', label: 'General & Contact', icon: User },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'medical', label: 'Medical & Emergency', icon: HeartPulse },
    { id: 'security', label: 'Security', icon: KeyRound },
    { id: 'preferences', label: 'Appearance', icon: Palette },
  ];

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileMsg(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateProfile(formData);
      if (res?.error) {
        setProfileMsg({ type: 'error', text: res.error });
      } else {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
      }
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMsg(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const res = await updatePassword(formData);
      if (res?.error) {
        setPasswordMsg({ type: 'error', text: res.error });
      } else {
        setPasswordMsg({ type: 'success', text: 'Password updated successfully' });
        form.reset();
      }
    });
  };

  return (
    <div className="flex-1 overflow-y-auto w-full flex justify-center bg-white dark:bg-[#0a0a0a] min-h-screen">
      <div className="w-full max-w-6xl px-6 md:px-12 lg:px-16 py-12 md:py-20 pb-32 lg:pb-20 flex flex-col lg:flex-row gap-12 lg:gap-24">
        
        {/* Navigation Column */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col">
          <div className="mb-12">
            <h1 className="text-3xl font-medium tracking-tight text-slate-900 dark:text-white mb-2">Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-light">
              Manage your account and preferences.
            </p>
          </div>

          <nav className="flex flex-col gap-1 w-full border-b lg:border-b-0 lg:border-l border-slate-200 dark:border-white/10 pb-6 lg:pb-0 lg:pl-6">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center justify-start text-left gap-3 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'text-slate-900 dark:text-white' 
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-slate-900 dark:bg-white rounded-full -ml-3 lg:-ml-9 opacity-100 transition-opacity" />
                  )}
                  {tab.label}
                </button>
              );
            })}

            <div className="my-6 lg:my-8 border-t border-slate-200 dark:border-white/10 w-8" />
            
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center justify-start text-left gap-3 py-2.5 px-3 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </nav>
        </div>

        {/* Content Column */}
        <div className="flex-1 w-full max-w-2xl pt-2 lg:pt-12">
          
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-xl font-medium tracking-tight text-slate-900 dark:text-white mb-8 pb-4 border-b border-slate-200 dark:border-white/10">
                General Information
              </h2>
              
              {profileMsg && (
                <div className={`mb-8 py-3 px-4 rounded-lg text-sm font-medium flex items-center gap-3 ${
                  profileMsg.type === 'success' 
                    ? 'text-emerald-700 bg-emerald-50/50 dark:text-emerald-400 dark:bg-emerald-500/10' 
                    : 'text-red-700 bg-red-50/50 dark:text-red-400 dark:bg-red-500/10'
                }`}>
                  {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-8">
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={user.name}
                      required
                      className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                    />
                  </div>
                  
                  <div className="group opacity-70 cursor-not-allowed">
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full bg-transparent border-b border-slate-200/50 dark:border-white/5 py-3 text-base text-slate-600 dark:text-slate-400 focus:outline-none cursor-not-allowed"
                    />
                    <p className="text-[11px] text-slate-400 mt-2 font-light">Official UNN credentials cannot be changed directly.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Mobile Phone Number</label>
                      <input
                        type="tel"
                        name="phone_number"
                        defaultValue={user.phone_number || ''}
                        placeholder="e.g. +234 803 000 0000"
                        className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Hall of Residence / Hostel</label>
                      <input
                        type="text"
                        name="hostel"
                        defaultValue={user.hostel || ''}
                        placeholder="e.g. Franco, Zik's Flat, Off-Campus"
                        className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    {isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Academic Tab */}
          {activeTab === 'academic' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-xl font-medium tracking-tight text-slate-900 dark:text-white mb-8 pb-4 border-b border-slate-200 dark:border-white/10">
                Academic Details
              </h2>
              
              {profileMsg && (
                <div className={`mb-8 py-3 px-4 rounded-lg text-sm font-medium flex items-center gap-3 ${
                  profileMsg.type === 'success' 
                    ? 'text-emerald-700 bg-emerald-50/50 dark:text-emerald-400 dark:bg-emerald-500/10' 
                    : 'text-red-700 bg-red-50/50 dark:text-red-400 dark:bg-red-500/10'
                }`}>
                  {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-8">
                <input type="hidden" name="name" value={user.name} />
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Registration Number</label>
                    <input
                      type="text"
                      name="reg_number"
                      defaultValue={user.reg_number || ''}
                      placeholder="e.g. 2020/248192"
                      className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Department</label>
                      <input
                        type="text"
                        name="department"
                        defaultValue={user.department || ''}
                        placeholder="e.g. Computer Science"
                        className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Academic Level</label>
                      <select
                        name="level"
                        defaultValue={user.level || '100'}
                        className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors appearance-none cursor-pointer"
                      >
                        <option value="100" className="bg-white dark:bg-bg-dark">100 Level</option>
                        <option value="200" className="bg-white dark:bg-bg-dark">200 Level</option>
                        <option value="300" className="bg-white dark:bg-bg-dark">300 Level</option>
                        <option value="400" className="bg-white dark:bg-bg-dark">400 Level</option>
                        <option value="500" className="bg-white dark:bg-bg-dark">500 Level</option>
                        <option value="Postgraduate" className="bg-white dark:bg-bg-dark">Postgraduate</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    {isPending ? 'Saving...' : 'Save Details'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Medical & Emergency Tab */}
          {activeTab === 'medical' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-xl font-medium tracking-tight text-slate-900 dark:text-white mb-2">
                Medical & Emergency Record
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 pb-4 border-b border-slate-200 dark:border-white/10 font-light">
                Essential clinical parameters shared with UNN Medical Centre doctors during appointments and triage.
              </p>
              
              {profileMsg && (
                <div className={`mb-8 py-3 px-4 rounded-lg text-sm font-medium flex items-center gap-3 ${
                  profileMsg.type === 'success' 
                    ? 'text-emerald-700 bg-emerald-50/50 dark:text-emerald-400 dark:bg-emerald-500/10' 
                    : 'text-red-700 bg-red-50/50 dark:text-red-400 dark:bg-red-500/10'
                }`}>
                  {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-8">
                <input type="hidden" name="name" value={user.name} />
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Blood Group</label>
                      <select
                        name="blood_group"
                        defaultValue={user.blood_group || ''}
                        className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors cursor-pointer"
                      >
                        <option value="" className="bg-white dark:bg-bg-dark">Select Blood Group</option>
                        <option value="O+" className="bg-white dark:bg-bg-dark">O Positive (O+)</option>
                        <option value="O-" className="bg-white dark:bg-bg-dark">O Negative (O-)</option>
                        <option value="A+" className="bg-white dark:bg-bg-dark">A Positive (A+)</option>
                        <option value="A-" className="bg-white dark:bg-bg-dark">A Negative (A-)</option>
                        <option value="B+" className="bg-white dark:bg-bg-dark">B Positive (B+)</option>
                        <option value="B-" className="bg-white dark:bg-bg-dark">B Negative (B-)</option>
                        <option value="AB+" className="bg-white dark:bg-bg-dark">AB Positive (AB+)</option>
                        <option value="AB-" className="bg-white dark:bg-bg-dark">AB Negative (AB-)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Genotype</label>
                      <select
                        name="genotype"
                        defaultValue={user.genotype || ''}
                        className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors cursor-pointer"
                      >
                        <option value="" className="bg-white dark:bg-bg-dark">Select Genotype</option>
                        <option value="AA" className="bg-white dark:bg-bg-dark">AA (Normal)</option>
                        <option value="AS" className="bg-white dark:bg-bg-dark">AS (Sickle Trait)</option>
                        <option value="SS" className="bg-white dark:bg-bg-dark">SS (Sickle Cell)</option>
                        <option value="AC" className="bg-white dark:bg-bg-dark">AC</option>
                        <option value="SC" className="bg-white dark:bg-bg-dark">SC</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Known Allergies / Sensitivities</label>
                    <input
                      type="text"
                      name="allergies"
                      defaultValue={user.allergies || ''}
                      placeholder="e.g. Penicillin, Sulfa drugs, Aspirin, Peanuts, None known"
                      className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                    <p className="text-[11px] text-slate-400 mt-2 font-light">Critical for doctor prescription accuracy and safe medication dispensing.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Emergency Contact</label>
                    <input
                      type="text"
                      name="emergency_contact"
                      defaultValue={user.emergency_contact || ''}
                      placeholder="e.g. Mrs. Ngozi Okonkwo (Mother) - +234 803 123 4567"
                      className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                    <p className="text-[11px] text-slate-400 mt-2 font-light">Next of kin or guardian contacted in case of medical emergency.</p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    {isPending ? 'Saving...' : 'Save Medical Record'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-xl font-medium tracking-tight text-slate-900 dark:text-white mb-8 pb-4 border-b border-slate-200 dark:border-white/10">
                Security
              </h2>
              
              {passwordMsg && (
                <div className={`mb-8 py-3 px-4 rounded-lg text-sm font-medium flex items-center gap-3 ${
                  passwordMsg.type === 'success' 
                    ? 'text-emerald-700 bg-emerald-50/50 dark:text-emerald-400 dark:bg-emerald-500/10' 
                    : 'text-red-700 bg-red-50/50 dark:text-red-400 dark:bg-red-500/10'
                }`}>
                  {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                    <input
                      type="password"
                      name="new_password"
                      placeholder="Min. 6 characters"
                      required
                      className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirm_password"
                      placeholder="Repeat new password"
                      required
                      className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                  </div>
                </div>
                
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    {isPending ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-xl font-medium tracking-tight text-slate-900 dark:text-white mb-8 pb-4 border-b border-slate-200 dark:border-white/10">
                Appearance
              </h2>
              
              <div className="pt-4">
                <ThemeToggleItem />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

