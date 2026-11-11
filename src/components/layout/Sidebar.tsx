import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  KanbanSquare,
  ShoppingBag,
  Calendar,
  Users,
  MessageSquarePlus,
  Printer,
  CreditCard,
  Gift,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Receipt,
  UserCheck,
} from 'lucide-react';
import { PlanTierBadge } from '../brand/Badge';

export type NavTabId =
  | 'dashboard'
  | 'pipeline'
  | 'orders'
  | 'finance'
  | 'calendar'
  | 'customers'
  | 'leads'
  | 'jobsheets'
  | 'team'
  | 'billing'
  | 'agents'
  | 'admin'
  | 'tracking';

interface SidebarProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  isMobileOpen: boolean;
  closeMobileMenu: () => void;
  onOpenQuickEnquiry: () => void;
  onOpenCreateOrder: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  closeMobileMenu,
  onOpenQuickEnquiry,
  onOpenCreateOrder,
}) => {
  const {
    studios,
    currentStudio,
    currentRole,
    switchRole,
    isSuperAdminUser,
    orders,
    leads,
    staffApplications,
  } = useApp();

  const handleSelectTab = (tab: NavTabId) => {
    if (tab === 'admin' && currentRole !== 'super_admin') {
      switchRole('super_admin');
    }
    setActiveTab(tab);
    closeMobileMenu();
  };

  const activeOrdersCount = orders.filter(
    (o) => o.currentStage !== 'delivered' && o.currentStage !== 'cancelled_hold'
  ).length;

  const unpaidOrdersCount = orders.filter((o) => {
    const totalPaid = o.payments.reduce((sum, p) => sum + p.amount, 0);
    return o.totalPrice - totalPaid > 0 && o.currentStage !== 'cancelled_hold';
  }).length;

  const newLeadsCount = leads.filter((l) => l.status === 'new').length;

  const pendingStaffCount = (staffApplications || []).filter(
    (a) => a.studioId === currentStudio.id && a.status === 'pending'
  ).length;

  const navItems = [
    {
      id: 'dashboard' as NavTabId,
      label: 'Studio Dashboard',
      icon: LayoutDashboard,
      roles: ['owner', 'manager', 'front_desk', 'super_admin'],
    },
    {
      id: 'pipeline' as NavTabId,
      label: 'Pipeline Kanban',
      icon: KanbanSquare,
      roles: ['owner', 'manager', 'front_desk', 'production', 'dispatch'],
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
    },
    {
      id: 'orders' as NavTabId,
      label: 'Order Records',
      icon: ShoppingBag,
      roles: ['owner', 'manager', 'front_desk', 'production', 'dispatch'],
    },
    {
      id: 'finance' as NavTabId,
      label: 'Financial Records',
      icon: Receipt,
      roles: ['owner', 'manager', 'front_desk', 'super_admin'],
      badge: unpaidOrdersCount > 0 ? unpaidOrdersCount : undefined,
      badgeColor: 'bg-[#C9A24B] text-white',
    },
    {
      id: 'calendar' as NavTabId,
      label: 'Delivery Deadlines',
      icon: Calendar,
      roles: ['owner', 'manager', 'front_desk', 'dispatch'],
    },
    {
      id: 'customers' as NavTabId,
      label: 'Clients & Measurements',
      icon: Users,
      roles: ['owner', 'manager', 'front_desk', 'production'],
    },
    {
      id: 'leads' as NavTabId,
      label: 'Enquiries & Leads',
      icon: MessageSquarePlus,
      roles: ['owner', 'manager', 'front_desk'],
      badge: newLeadsCount > 0 ? newLeadsCount : undefined,
      badgeColor: 'bg-[#E2573A] text-white',
    },
    {
      id: 'jobsheets' as NavTabId,
      label: 'Workshop Job Sheets',
      icon: Printer,
      roles: ['owner', 'manager', 'production'],
    },
    {
      id: 'team' as NavTabId,
      label: 'Team & Staff',
      icon: UserCheck,
      roles: ['owner', 'manager', 'super_admin'],
      badge: pendingStaffCount > 0 ? pendingStaffCount : undefined,
      badgeColor: 'bg-[#E2573A] text-white',
    },
    {
      id: 'billing' as NavTabId,
      label: 'Subscription & Loyalty',
      icon: CreditCard,
      roles: ['owner', 'super_admin'],
    },
    {
      id: 'agents' as NavTabId,
      label: 'Agent Referral Portal',
      icon: Gift,
      roles: ['agent', 'super_admin'],
      highlight: true,
    },
    {
      id: 'admin' as NavTabId,
      label: 'Super Admin Console',
      icon: ShieldCheck,
      roles: ['super_admin'],
      highlight: true,
      badge: 'Platform',
      badgeColor: 'bg-[#8B1E1E] text-white',
    },
  ];

  // Super admin sees all navigation items; when simulating, shows simulated role items PLUS Admin Console shortcut
  const baseItems =
    currentRole === 'super_admin'
      ? navItems
      : navItems.filter((item) => item.roles.includes(currentRole));

  const visibleItems =
    isSuperAdminUser && currentRole !== 'super_admin'
      ? [...baseItems, navItems.find((item) => item.id === 'admin')!].filter(Boolean)
      : baseItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-40 md:z-20 h-[calc(100vh-4rem)] w-64 bg-[#F2EDE4] border-r border-[#E4DCD0] flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Navigation Links */}
        <div className="p-3 space-y-1 overflow-y-auto">
          {/* Mobile Quick Action Buttons */}
          <div className="sm:hidden mb-3 space-y-2 pb-2 border-b border-[#E4DCD0]">
            <button
              onClick={() => {
                onOpenCreateOrder();
                closeMobileMenu();
              }}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-[#E2573A] text-white flex items-center justify-center gap-1.5 shadow-xs"
            >
              + New Client Order
            </button>
            <button
              onClick={() => {
                onOpenQuickEnquiry();
                closeMobileMenu();
              }}
              className="w-full py-1.5 px-3 text-xs font-semibold rounded-lg bg-[#232A5C] text-white flex items-center justify-center gap-1.5"
            >
              + Quick Enquiry (&lt;30s)
            </button>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-3 py-1 font-serif">
            Studio Workflow
          </div>

          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${isActive
                    ? 'bg-[#232A5C] text-[#F7F2EA] shadow-xs'
                    : 'text-[#232A5C] hover:bg-[#EAE4D9]'
                  } ${item.highlight && !isActive ? 'text-[#E2573A]' : ''}`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${isActive
                        ? 'text-[#E2573A]'
                        : item.highlight
                          ? 'text-[#E2573A]'
                          : 'text-[#7B7368] group-hover:text-[#232A5C]'
                      }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor ||
                      (isActive
                        ? 'bg-[#E2573A] text-white'
                        : 'bg-[#E4DCD0] text-[#232A5C]')
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Studio Info, Agent Profile, or Super Admin Badge */}
        <div className="p-3 border-t border-[#E4DCD0] bg-[#ECE5DA]">
          {isSuperAdminUser && currentRole !== 'super_admin' ? (
            <div className="p-2.5 rounded-xl bg-[#232A5C] text-white text-xs space-y-2 border border-[#C9A24B]/40 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#C9A24B]" />
                  <span>Role Simulation</span>
                </span>
                <span className="text-[9px] bg-[#E2573A] text-white font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                  Simulating
                </span>
              </div>
              <div className="text-[11px] text-[#E2DAD0] leading-tight">
                Previewing as <span className="text-[#C9A24B] font-semibold capitalize">{currentRole.replace('_', ' ')}</span> for {currentStudio.name}.
              </div>
              <button
                onClick={() => {
                  switchRole('super_admin');
                  setActiveTab('dashboard');
                }}
                className="w-full py-1.5 bg-[#FAF6F0] hover:bg-white text-[#232A5C] rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#E2573A]" />
                <span>Exit Simulation</span>
              </button>
            </div>
          ) : currentRole === 'super_admin' ? (
            <div className="p-2.5 rounded-xl bg-[#232A5C] text-white text-xs space-y-1.5 border border-[#3A4585] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#C9A24B]" />
                  <span>Platform Super Admin</span>
                </span>
                <span className="text-[9px] bg-rose-700 text-white font-mono font-bold px-1.5 py-0.5 rounded">
                  OVERSEER
                </span>
              </div>
              <div className="text-[11px] text-[#E2DAD0]/90 leading-tight">
                Viewing all {studios.length} studios, platform MRR, and full multi-tenant data.
              </div>
            </div>
          ) : currentRole === 'agent' ? (
            <div className="p-2.5 rounded-lg bg-white/80 border border-[#E0D7CA] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-[#232A5C]">Independent Promoter</span>
                <span className="text-[10px] bg-[#EDF5F0] text-[#3F7D5C] font-bold px-2 py-0.5 rounded-full">
                  25% Senior
                </span>
              </div>
              <div className="text-[11px] text-stone-600">
                <div className="font-semibold text-stone-800">Amina Lawal</div>
                <div className="font-mono text-[#E2573A] font-bold text-xs mt-0.5">Code: AML-902</div>
              </div>
              <div className="pt-1.5 border-t border-stone-200 text-[10px] text-stone-500">
                Payout: GTBank • 0123456789
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-white/70 border border-[#E0D7CA] text-xs">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold text-[#232A5C] truncate">{currentStudio.name}</span>
                <PlanTierBadge
                  tier={currentStudio.plan}
                  isFounding={currentStudio.isFoundingDesigner}
                />
              </div>

              {/* 12-Month Loyalty Free Month Miniature Meter */}
              <div className="mt-2 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between text-[10px] text-stone-600 mb-1">
                  <span className="flex items-center gap-1 font-medium">
                    <TrendingUp className="w-3 h-3 text-[#C9A24B]" />
                    Loyalty Tenure
                  </span>
                  <span className="font-bold text-[#232A5C]">
                    {currentStudio.tenureMonths % 12} / 12 mo
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#C9A24B] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, ((currentStudio.tenureMonths % 12) / 12) * 100)}%`,
                    }}
                  />
                </div>
                <div className="text-[9px] text-stone-500 mt-1">
                  {currentStudio.loyaltyFreeMonthsEarned > currentStudio.loyaltyFreeMonthsUsed ? (
                    <span className="text-[#3F7D5C] font-semibold">1 Free Month Available!</span>
                  ) : (
                    `${12 - (currentStudio.tenureMonths % 12)} mo to next free subscription`
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

