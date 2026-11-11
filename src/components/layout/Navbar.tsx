import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../brand/Logo';
import { UserRole } from '../../types';
import {
  Bell,
  Plus,
  Building2,
  ChevronDown,
  UserCheck,
  AlertCircle,
  Menu,
  X,
  Sparkles,
  RotateCcw,
  LogOut,
  User,
  Scale,
  ShieldCheck,
  Gift,
  Lock,
} from 'lucide-react';
import { calculateDeliveryCountdown } from '../../utils/dateUtils';

interface NavbarProps {
  onOpenQuickEnquiry: () => void;
  onOpenCreateOrder: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup' | 'verify' | 'agent') => void;
  onOpenOnboarding: () => void;
  onOpenLegal: () => void;
  onSelectTab?: (tab: any) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenQuickEnquiry,
  onOpenCreateOrder,
  onOpenAuth,
  onOpenOnboarding,
  onOpenLegal,
  onSelectTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const {
    studios,
    currentStudio,
    switchStudio,
    currentRole,
    switchRole,
    currentUser,
    orders,
    staffApplications,
    isStaffUser,
    isOwnerUser,
    isSuperAdminUser,
    signOut,
    resetAllData,
  } = useApp();

  const [showStudioDropdown, setShowStudioDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Compute pending staff applications for owner & manager
  const pendingStaffApplications =
    currentRole === 'owner' || currentRole === 'manager'
      ? (staffApplications || []).filter(
          (a) => a.studioId === currentStudio.id && a.status === 'pending'
        )
      : [];

  // Compute urgent and overdue orders for notifications
  const overdueOrders = orders.filter((o) => {
    if (o.currentStage === 'delivered' || o.currentStage === 'cancelled_hold') return false;
    const cd = calculateDeliveryCountdown(o.expectedDeliveryDate);
    return cd.urgency === 'overdue';
  });

  const urgentOrders = orders.filter((o) => {
    if (o.currentStage === 'delivered' || o.currentStage === 'cancelled_hold') return false;
    const cd = calculateDeliveryCountdown(o.expectedDeliveryDate);
    return cd.urgency === 'urgent';
  });

  const notificationCount =
    overdueOrders.length + urgentOrders.length + pendingStaffApplications.length;

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    {
      role: 'owner',
      label: 'Owner / Designer',
      desc: 'The designer and business owner • Full visibility, reports, settings and pricing control',
    },
    {
      role: 'manager',
      label: 'Manager',
      desc: 'Oversees daily operations • Pipeline overview, deadlines, reassigning work, customer records',
    },
    {
      role: 'front_desk',
      label: 'Front desk / Sales assistant',
      desc: 'Handles enquiries, bookings and client communication • Create customers and orders, log payments, update delivery info',
    },
    {
      role: 'production',
      label: 'Production staff (Cutter, tailor, finisher)',
      desc: 'See assigned jobs, mark stages complete, view measurements and notes (No pricing)',
    },
    {
      role: 'dispatch',
      label: 'Dispatch / Delivery',
      desc: 'Handles pickup and delivery • See ready orders, record delivery',
    },
    {
      role: 'agent',
      label: 'Independent Agent',
      desc: 'Promote studios • Unique link, 21-day trial, commissions & payouts',
    },
    {
      role: 'super_admin',
      label: 'Super Admin',
      desc: 'Platform administration • Platform MRR, all studios, cost ceiling',
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#232A5C] text-[#F7F2EA] border-b border-[#363E75] shadow-xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#F7F2EA] hover:bg-[#363E75] focus:outline-hidden"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <a href="#" className="flex items-center gap-2">
            <Logo variant="full" theme="dark" size="md" showTagline={false} />
          </a>
        </div>

        {/* Center / Right: Studio Selector, Role Switcher, Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Studio Workspace Switcher (PRD Multi-tenant) - Super Admin can freely switch; others locked */}
          {currentRole === 'agent' && !isSuperAdminUser ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B214A] border border-[#C9A24B]/40 text-xs font-semibold text-[#C9A24B]">
              <Gift className="w-3.5 h-3.5 text-[#E2573A]" />
              <span className="hidden sm:inline">Independent Agent</span>
              <span className="sm:hidden">Agent</span>
            </div>
          ) : isSuperAdminUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowStudioDropdown(!showStudioDropdown);
                  setShowRoleDropdown(false);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1B214A] hover:bg-[#2A336E] text-xs sm:text-sm font-medium border border-[#3A4585] transition-colors"
                title="Super Admin: Switch Studio Workspace (Unlocked)"
              >
                <Building2 className="w-4 h-4 text-[#C9A24B]" />
                <span className="hidden sm:inline max-w-[130px] truncate">{currentStudio.name}</span>
                <span className="sm:hidden text-xs">Studio</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#F7F2EA]/60" />
              </button>

              {showStudioDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowStudioDropdown(false)}
                  />
                  <div className="absolute left-0 mt-2 w-64 sm:w-72 bg-white text-[#232A5C] rounded-xl shadow-2xl border border-[#E4DCD0] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500 border-b border-stone-100 flex items-center justify-between">
                      <span>Super Admin: Switch Studio</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Unlocked</span>
                    </div>
                    {studios.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          switchStudio(st.id);
                          setShowStudioDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-[#FAF6F0] transition-colors ${
                          st.id === currentStudio.id ? 'bg-[#FAF6F0] font-semibold text-[#232A5C]' : ''
                        }`}
                      >
                        <div>
                          <div className="font-medium">{st.name}</div>
                          <div className="text-[11px] text-stone-500 capitalize">
                            {st.plan} Plan • {st.billingCycle}
                          </div>
                        </div>
                        {st.id === currentStudio.id && (
                          <span className="w-2 h-2 rounded-full bg-[#E2573A]" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : currentRole === 'owner' ? (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B214A] border border-[#C9A24B]/30 text-xs sm:text-sm font-medium text-[#F7F2EA]"
              title={`Fashion Studio Workspace: ${currentStudio.name} (Owner Access)`}
            >
              <Building2 className="w-4 h-4 text-[#C9A24B]" />
              <span className="hidden sm:inline max-w-[135px] truncate font-semibold">{currentStudio.name}</span>
              <span className="sm:hidden text-xs">{currentStudio.name.split(' ')[0]}</span>
              <span className="text-[9px] bg-[#C9A24B]/20 text-[#C9A24B] border border-[#C9A24B]/30 px-1.5 py-0.2 rounded font-mono font-bold">Owner</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B214A] border border-[#3A4585] text-xs font-medium text-[#F7F2EA]"
              title={`Staff member of ${currentStudio.name}`}
            >
              <Building2 className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden sm:inline max-w-[130px] truncate">{currentStudio.name}</span>
              <span className="sm:hidden text-xs">Studio</span>
              <span className="text-[9px] bg-[#2A336E] text-stone-300 px-1 py-0.2 rounded font-mono">Staff</span>
            </div>
          )}

          {/* Role Pill - Unlocked for Super Admin (Simulate any role freely), locked for Owner & Staff */}
          {isSuperAdminUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleDropdown(!showRoleDropdown);
                  setShowStudioDropdown(false);
                  setShowNotifications(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  currentRole === 'super_admin'
                    ? 'bg-[#2D3672] hover:bg-[#3B4791] border-[#44529E]'
                    : 'bg-[#C9A24B]/20 hover:bg-[#C9A24B]/30 border-[#C9A24B]/60 text-amber-200'
                }`}
                title="Super Admin: Click to simulate any role view (Unlocked)"
              >
                <UserCheck className={`w-3.5 h-3.5 ${currentRole === 'super_admin' ? 'text-[#E2573A]' : 'text-[#C9A24B]'}`} />
                <span className="hidden md:inline text-[#E2DAD0]">
                  {currentRole === 'super_admin' ? 'Role:' : 'Simulating:'}
                </span>
                <span className="font-semibold text-white capitalize">
                  {currentRole.replace('_', ' ')}
                </span>
                <ChevronDown className="w-3 h-3 text-[#F7F2EA]/60" />
              </button>

              {showRoleDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowRoleDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white text-[#232A5C] rounded-xl shadow-2xl border border-[#E4DCD0] py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500 border-b border-stone-100 flex items-center justify-between">
                    <span>Super Admin: Simulate Role</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Unlocked</span>
                  </div>
                  {rolesList.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-[#FAF6F0] transition-colors ${
                        r.role === currentRole ? 'bg-[#FAF6F0] font-semibold text-[#232A5C]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{r.label}</span>
                        {r.role === currentRole && (
                          <span className="text-[10px] bg-[#232A5C] text-white px-1.5 py-0.5 rounded">Active</span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 mt-0.5">{r.desc}</span>
                    </button>
                  ))}
                  {currentRole !== 'super_admin' && (
                    <div className="p-2 border-t border-stone-100 bg-stone-50 mt-1">
                      <button
                        onClick={() => {
                          switchRole('super_admin');
                          setShowRoleDropdown(false);
                        }}
                        className="w-full py-1.5 px-2 bg-[#232A5C] hover:bg-[#1B214A] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#C9A24B]" />
                        <span>Return to Super Admin</span>
                      </button>
                    </div>
                  )}
                  </div>
                </>
              )}
            </div>
          ) : currentRole === 'owner' ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2D3672] text-xs font-medium border border-[#44529E]"
              title="Verified Studio Owner: Full control over reports, pipeline, pricing & staff"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A24B]" />
              <span className="hidden md:inline text-[#E2DAD0]">Role:</span>
              <span className="font-semibold text-white capitalize">Owner / Designer</span>
              <span className="text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-700/50 px-1.5 py-0.2 rounded font-mono font-bold">Owner View</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2D3672] text-xs font-medium border border-[#44529E]"
              title={`Staff account locked to ${currentRole.replace('_', ' ').toUpperCase()} interface`}
            >
              <UserCheck className="w-3.5 h-3.5 text-[#3F7D5C]" />
              <span className="hidden md:inline text-[#E2DAD0]">Role:</span>
              <span className="font-semibold text-white capitalize">
                {currentRole.replace('_', ' ')}
              </span>
              <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-mono flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" />
                <span>Locked</span>
              </span>
            </div>
          )}

          {/* Super Admin Quick Console / Exit Sim Shortcuts */}
          {isSuperAdminUser && (
            currentRole === 'super_admin' ? (
              onSelectTab && (
                <button
                  onClick={() => onSelectTab('admin')}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#8B1E1E] hover:bg-[#A32424] text-white text-xs font-bold transition-colors shadow-xs"
                  title="Open Platform Administration Console (ADM-1)"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Console</span>
                </button>
              )
            ) : (
              <button
                onClick={() => {
                  switchRole('super_admin');
                  onSelectTab?.('dashboard');
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#E2573A] hover:bg-[#D0482B] text-white text-xs font-bold transition-all shadow-xs"
                title="Exit role simulation and return to Super Admin"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit Sim</span>
                <span className="sm:hidden">&times; Sim</span>
              </button>
            )
          )}

          {/* Quick Action: New Order or Enquiry */}
          {currentRole !== 'agent' && currentRole !== 'production' && currentRole !== 'dispatch' && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={onOpenQuickEnquiry}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#363E75] hover:bg-[#434D8F] text-[#F7F2EA] transition-colors border border-[#4D589E]"
                title="Log an enquiry in under 30 seconds (LEAD-1)"
              >
                + Quick Enquiry
              </button>
              <button
                onClick={onOpenCreateOrder}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#E2573A] hover:bg-[#D0482B] text-white shadow-xs transition-colors flex items-center gap-1.5"
                title="Create a new client order (ORD-1)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Order</span>
              </button>
            </div>
          )}

          {/* User Account / Auth Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAccountMenu(!showAccountMenu);
                setShowStudioDropdown(false);
                setShowRoleDropdown(false);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl bg-[#1B214A] hover:bg-[#2A336E] border border-[#3A4585] text-xs transition-colors"
              title="User Account & Auth"
            >
              <div className="w-6 h-6 rounded-lg bg-[#E2573A] text-white flex items-center justify-center font-bold text-[10px]">
                {currentUser.name[0]}
              </div>
              <span className="hidden lg:inline font-semibold text-white max-w-[100px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-[#F7F2EA]/60" />
            </button>

            {showAccountMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowAccountMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white text-[#232A5C] rounded-2xl shadow-2xl border border-[#E4DCD0] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-stone-100">
                  <div className="font-bold text-xs text-[#232A5C]">{currentUser.name}</div>
                  <div className="text-[10px] text-stone-500">
                    {currentUser.email}
                  </div>
                  {isSuperAdminUser ? (
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-rose-800 bg-rose-50 px-2 py-0.5 rounded font-semibold border border-rose-200">
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5 text-rose-600" />
                        <span>SUPER ADMIN</span>
                      </div>
                      {currentRole !== 'super_admin' && (
                        <span className="text-amber-700 font-mono font-bold">(Sim: {currentRole})</span>
                      )}
                    </div>
                  ) : isStaffUser ? (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                      <Lock className="w-2.5 h-2.5 text-emerald-600" />
                      <span>{currentRole.replace('_', ' ').toUpperCase()} (ROLE LOCKED)</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-stone-500 capitalize mt-0.5">
                      {currentRole === 'agent'
                        ? 'Independent Promoter • Code: AML-902'
                        : `${currentRole.replace('_', ' ')} • ${currentStudio.name}`}
                    </div>
                  )}
                </div>

                <div className="py-1">
                  {isSuperAdminUser ? (
                    <>
                      {currentRole !== 'super_admin' && (
                        <button
                          onClick={() => {
                            setShowAccountMenu(false);
                            switchRole('super_admin');
                            onSelectTab?.('dashboard');
                          }}
                          className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-[#FAF6F0] text-[#E2573A] font-semibold"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#E2573A]" />
                          <span>Exit Simulation &rarr; Super Admin</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          switchRole('super_admin');
                          onSelectTab?.('admin');
                        }}
                        className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-[#FAF6F0] text-[#8B1E1E] font-semibold"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#8B1E1E]" />
                        <span>Platform Super Admin Console</span>
                      </button>
                    </>
                  ) : currentRole === 'agent' ? (
                    <>
                      <div className="px-4 py-2 text-[11px] text-stone-600 bg-[#FAF6F0] mx-2 rounded-lg mb-1">
                        <div className="font-semibold text-[#232A5C]">Payout Details:</div>
                        <div>Bank: GTBank • 0123456789</div>
                        <div>Commission Rate: 25% (Senior)</div>
                      </div>
                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          onOpenLegal();
                        }}
                        className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-[#FAF6F0] text-stone-700"
                      >
                        <Scale className="w-3.5 h-3.5 text-stone-500" />
                        <span>Schedule A: Agent Terms of Service</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          onOpenOnboarding();
                        }}
                        className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-[#FAF6F0] text-stone-700 font-medium"
                      >
                        <User className="w-3.5 h-3.5 text-[#E2573A]" />
                        <span>Profile</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="border-t border-stone-100 pt-1">
                  <button
                    onClick={() => {
                      setShowAccountMenu(false);
                      signOut();
                      onOpenAuth('signin');
                    }}
                    className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-rose-50 text-[#8B1E1E] font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out / Switch Account</span>
                  </button>
                </div>
              </div>
            </>
          )}
          </div>

          {/* Demo Reset Button for testing */}
          <button
            onClick={resetAllData}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#363E75] transition-colors"
            title="Reset to fresh demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Notifications Bell (Positioned at Far Right per User Instruction - Hidden for Agent who has no studio orders) */}
          {currentRole !== 'agent' && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowStudioDropdown(false);
                  setShowRoleDropdown(false);
                  setShowAccountMenu(false);
                }}
                className="relative p-2 rounded-lg hover:bg-[#363E75] text-[#F7F2EA] transition-colors"
                title="Studio Alerts"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E2573A] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white text-[#232A5C] rounded-xl shadow-2xl border border-[#E4DCD0] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between">
                    <div className="font-semibold text-sm">Studio Alerts</div>
                    <span className="text-xs text-stone-500">{notificationCount} pending</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                    {pendingStaffApplications.map((app) => (
                      <div key={app.id} className="p-3 hover:bg-stone-50 text-xs bg-amber-50/60">
                        <div className="flex items-center gap-1.5 text-[#232A5C] font-bold">
                          <UserCheck className="w-3.5 h-3.5 text-[#E2573A]" />
                          <span>Staff Registration Request</span>
                        </div>
                        <div className="text-stone-700 mt-1">
                          <strong>{app.name}</strong> applied as{' '}
                          <span className="font-semibold text-stone-900 capitalize">
                            {app.requestedRole.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Review & approve in Team & Staff tab
                        </div>
                      </div>
                    ))}
                    {overdueOrders.map((o) => (
                      <div key={o.id} className="p-3 hover:bg-stone-50 text-xs">
                        <div className="flex items-center gap-1.5 text-[#8B1E1E] font-bold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Order {o.orderNumber} Overdue!</span>
                        </div>
                        <div className="text-stone-600 mt-1">
                          Client: <strong>{o.customerName}</strong> ({o.occasion})
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Due: {o.expectedDeliveryDate} • Stage: {o.currentStage}
                        </div>
                      </div>
                    ))}
                    {urgentOrders.map((o) => (
                      <div key={o.id} className="p-3 hover:bg-stone-50 text-xs">
                        <div className="flex items-center gap-1.5 text-[#E2573A] font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Order {o.orderNumber} Due in &le;2 Days</span>
                        </div>
                        <div className="text-stone-600 mt-1">
                          Client: <strong>{o.customerName}</strong>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Due: {o.expectedDeliveryDate}
                        </div>
                      </div>
                    ))}
                    {notificationCount === 0 && (
                      <div className="p-6 text-center text-xs text-stone-500">
                        No overdue or urgent orders. All studio pipelines running smoothly!
                      </div>
                    )}
                  </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

