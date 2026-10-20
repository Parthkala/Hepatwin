// src/components/layout/LeftRailNav.tsx
import React from 'react';
import { useTwinStore, ActiveNavTab } from '../../store/twinStore';
import { 
  Activity, 
  Layers, 
  Sliders, 
  History, 
  Radio,
  FileSpreadsheet,
  Utensils,
  UserPlus,
  LogIn,
  LogOut,
  User
} from 'lucide-react';

interface NavItem {
  id: ActiveNavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hotkey: string;
}

const CLINICIAN_NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Activity, hotkey: '1' },
  { id: 'simulate', label: 'Simulate', icon: Sliders, hotkey: '2' },
  { id: 'timeline', label: 'Timeline', icon: History, hotkey: '3' },
  { id: 'streamFusion', label: 'IoT Stream Fusion', icon: Radio, hotkey: '4' },
  { id: 'culinary', label: 'Culinary Guidance', icon: Utensils, hotkey: '5' },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet, hotkey: '6' },
];

const PATIENT_NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Activity, hotkey: '1' },
  { id: 'twin', label: 'HepaTwin', icon: Layers, hotkey: '2' },
  { id: 'culinary', label: 'Culinary Guidance', icon: Utensils, hotkey: '3' },
  { id: 'simulate', label: 'What-If Simulator', icon: Sliders, hotkey: '4' },
  { id: 'timeline', label: 'Lab Timeline', icon: History, hotkey: '5' },
  { id: 'streamFusion', label: 'IoT Stream Fusion', icon: Radio, hotkey: '6' },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet, hotkey: '7' },
];

export const LeftRailNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeRole,
    getFibrosisMetrics,
    getActivePersona,
    patientUser,
    setIsAddPatientModalOpen,
    setIsAuthModalOpen,
    clinicianUser,
    logoutClinician,
    logoutPatient,
  } = useTwinStore();

  const persona = getActivePersona();
  const metrics = getFibrosisMetrics();

  const navItems = activeRole === 'physician' ? CLINICIAN_NAV_ITEMS : PATIENT_NAV_ITEMS;

  // If clinician was somehow on 'twin', redirect to 'overview'
  React.useEffect(() => {
    if (activeRole === 'physician' && activeTab === 'twin') {
      setActiveTab('overview');
    }
  }, [activeRole, activeTab, setActiveTab]);

  // Global Alt+1..Alt+N hotkey support for clinical navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (e.altKey) {
        const item = navItems.find((n) => n.hotkey === e.key);
        if (item) {
          e.preventDefault();
          setActiveTab(item.id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navItems, setActiveTab]);

  return (
    <aside className="w-16 md:w-56 bg-ink border-r border-ink-border flex flex-col justify-between shrink-0 select-none">
      {/* Primary Navigation Rail */}
      <div className="py-3">
        <div className="px-3 pb-2 text-xxs font-mono uppercase tracking-wider text-slate-400 hidden md:block">
          Clinical Navigation
        </div>
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-sharp text-xs font-mono transition-colors text-left ${
                  isActive
                    ? 'bg-accent-primary text-white font-semibold'
                    : 'text-slate-300 hover:bg-ink-light hover:text-white'
                }`}
                title={`${item.label} (Alt+${item.hotkey})`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="hidden md:inline truncate">{item.label}</span>
                <span className="ml-auto hidden md:inline text-xxs opacity-50 font-mono">
                  [{item.hotkey}]
                </span>
              </button>
            );
          })}
        </nav>

        {/* Action: Add Patient Twin (Clinician ONLY) */}
        {activeRole === 'physician' && (
          <div className="px-2 pt-3 mt-3 border-t border-ink-border">
            <button
              onClick={() => setIsAddPatientModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sharp text-xs font-mono bg-accent-secondary/20 hover:bg-accent-secondary/30 text-amber-300 border border-accent-secondary/50 transition-colors text-left"
              title="Register New Patient Twin"
            >
              <UserPlus className="w-4 h-4 shrink-0 text-accent-secondary" />
              <span className="hidden md:inline font-bold">+ Add Twin</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile & Quick Status Pill at Base of Rail */}
      <div className="p-3 border-t border-ink-border space-y-2">
        {/* Account Status Card (Clinician vs Patient) */}
        <div className="hidden md:block bg-ink-light/70 p-2 rounded-sharp border border-ink-border text-xxs font-mono">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-slate-300">
              <User className="w-3 h-3 text-teal-400" />
              <span>{activeRole === 'physician' ? 'Clinician Account' : 'Patient Account'}</span>
            </span>
            {activeRole === 'physician' ? (
              clinicianUser ? (
                <button
                  onClick={logoutClinician}
                  className="text-slate-400 hover:text-rose-400 font-bold"
                  title="Log Out"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-teal-300 hover:text-white font-bold"
                >
                  Login
                </button>
              )
            ) : (
              <button
                onClick={logoutPatient}
                className="text-slate-400 hover:text-rose-400 font-bold"
                title="Log Out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="font-semibold text-white truncate">
            {activeRole === 'physician'
              ? clinicianUser || 'Dr. Parth'
              : patientUser || persona.name}
          </div>
        </div>

        {/* Quick Risk Status Pill */}
        <div className="hidden md:block">
          <div className="text-xxs font-mono text-slate-400 uppercase tracking-wider mb-1">
            Active Risk Status
          </div>
          <div
            className={`flex items-center gap-2 p-2 rounded-sharp border text-xs font-mono ${
              metrics.overallRiskLevel === 'critical'
                ? 'bg-red-950/40 border-status-critical text-red-300'
                : metrics.overallRiskLevel === 'caution'
                ? 'bg-amber-950/40 border-status-caution text-amber-300'
                : 'bg-emerald-950/40 border-status-normal text-emerald-300'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                metrics.overallRiskLevel === 'critical'
                  ? 'bg-status-critical animate-ping'
                  : metrics.overallRiskLevel === 'caution'
                  ? 'bg-status-caution'
                  : 'bg-status-normal'
              }`}
            />
            <span className="font-bold uppercase">{metrics.overallRiskLevel}</span>
            <span className="ml-auto text-xxs font-bold">F{metrics.metavirStage.slice(1)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
