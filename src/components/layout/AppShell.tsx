import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Navbar } from './Navbar';
import { Sidebar, NavTabId } from './Sidebar';
import { MetricsOverview } from '../dashboard/MetricsOverview';
import { PipelineKanban } from '../dashboard/PipelineKanban';
import { OrdersTableView } from '../dashboard/OrdersTableView';
import { DeliveryCalendar } from '../dashboard/DeliveryCalendar';
import { CustomerList } from '../customers/CustomerList';
import { FinancialRecordsPage } from '../finance/FinancialRecordsPage';
import { SubscriptionPage } from '../subscription/SubscriptionPage';
import { AgentPortalPage } from '../agent/AgentPortalPage';
import { SuperAdminPage } from '../admin/SuperAdminPage';
import { PublicTrackingPage } from '../public/PublicTrackingPage';
import { TeamManagementPage } from '../team/TeamManagementPage';

// Modals
import { OrderDetailModal } from '../orders/OrderDetailModal';
import { CreateOrderModal } from '../orders/CreateOrderModal';
import { RescheduleModal } from '../orders/RescheduleModal';
import { JobSheetModal } from '../orders/JobSheetModal';
import { CustomerDetailModal } from '../customers/CustomerDetailModal';
import { MeasurementModal } from '../customers/MeasurementModal';
import { QuickEnquiryModal } from '../customers/QuickEnquiryModal';
import { AuthPage } from '../auth/AuthPage';
import { OnboardingWizardModal } from '../auth/OnboardingWizardModal';
import { LegalTermsModal } from '../auth/LegalTermsModal';

import { Order, Customer } from '../../types';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  LayoutDashboard,
  KanbanSquare,
  ShoppingBag,
  Users,
  Menu,
  Gift,
  Printer,
  Truck,
} from 'lucide-react';
import { UserRole } from '../../types';

const ROLE_ALLOWED_TABS: Record<UserRole, NavTabId[]> = {
  owner: ['dashboard', 'pipeline', 'orders', 'finance', 'calendar', 'customers', 'leads', 'jobsheets', 'team', 'billing', 'tracking'],
  manager: ['dashboard', 'pipeline', 'orders', 'finance', 'calendar', 'customers', 'leads', 'jobsheets', 'team', 'tracking'],
  front_desk: ['dashboard', 'pipeline', 'orders', 'finance', 'calendar', 'customers', 'leads', 'tracking'],
  production: ['pipeline', 'orders', 'customers', 'jobsheets', 'tracking'],
  dispatch: ['orders', 'pipeline', 'calendar', 'tracking'],
  agent: ['agents'],
  super_admin: ['dashboard', 'pipeline', 'orders', 'finance', 'calendar', 'customers', 'leads', 'jobsheets', 'team', 'billing', 'agents', 'admin', 'tracking'],
};

const ROLE_DEFAULT_TABS: Record<UserRole, NavTabId> = {
  owner: 'dashboard',
  manager: 'dashboard',
  front_desk: 'dashboard',
  production: 'pipeline',
  dispatch: 'orders',
  agent: 'agents',
  super_admin: 'dashboard',
};

export const AppShell: React.FC = () => {
  const { toasts, removeToast, currentRole, switchRole, isSuperAdminUser, currentStudio } = useApp();

  const [activeTab, setActiveTab] = useState<NavTabId>(ROLE_DEFAULT_TABS[currentRole] || 'dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Enforce role-based access: when role changes or activeTab is not allowed for this role, auto-redirect to their primary interface
  useEffect(() => {
    const allowed = isSuperAdminUser
      ? [...(ROLE_ALLOWED_TABS[currentRole] || []), 'admin']
      : (ROLE_ALLOWED_TABS[currentRole] || ['pipeline']);

    if (!allowed.includes(activeTab)) {
      setActiveTab(ROLE_DEFAULT_TABS[currentRole] || allowed[0]);
    }
  }, [currentRole, activeTab, isSuperAdminUser]);

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [rescheduleOrder, setRescheduleOrder] = useState<Order | null>(null);
  const [jobSheetOrder, setJobSheetOrder] = useState<Order | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [measurementCustomer, setMeasurementCustomer] = useState<Customer | null>(null);
  const [isQuickEnquiryOpen, setIsQuickEnquiryOpen] = useState(false);

  // Auth & Onboarding States
  const [isAuthPageOpen, setIsAuthPageOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'verify' | 'agent'>('signin');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState<{
    token?: string;
    studioId?: string;
    role?: UserRole;
    name?: string;
    email?: string;
    phone?: string;
  } | null>(null);

  // Auto-detect invitation query params (?inviteToken=... or ?studioId=...&regType=staff)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const inviteToken = params.get('inviteToken') || params.get('token');
      const studioId = params.get('studioId');
      const role = params.get('role') as UserRole;
      const email = params.get('email');
      const name = params.get('name');
      const phone = params.get('phone');
      const regType = params.get('regType');

      if (inviteToken || (studioId && regType === 'staff') || (inviteToken && role)) {
        setInviteData({
          token: inviteToken || undefined,
          studioId: studioId || undefined,
          role: role || undefined,
          name: name ? decodeURIComponent(name) : undefined,
          email: email ? decodeURIComponent(email) : undefined,
          phone: phone ? decodeURIComponent(phone) : undefined,
        });
        setAuthMode('signup');
        setIsAuthPageOpen(true);
      }
    }
  }, []);

  // If viewing the full Auth experience
  if (isAuthPageOpen) {
    return (
      <div className="relative">
        <button
          onClick={() => {
            setIsAuthPageOpen(false);
            setInviteData(null);
            if (window.history.replaceState) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }}
          className="fixed top-3 right-3 z-50 px-3 py-1.5 bg-[#232A5C] text-white rounded-lg text-xs font-semibold shadow-lg hover:bg-[#E2573A] transition-colors"
        >
          &larr; Skip to Studio Workspace Demo
        </button>
        <AuthPage
          defaultMode={authMode}
          inviteData={inviteData || undefined}
          onSuccess={() => {
            setIsAuthPageOpen(false);
            setInviteData(null);
            if (window.history.replaceState) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }}
        />
      </div>
    );
  }

  // If viewing the public tracking link directly
  if (activeTab === 'tracking') {
    return (
      <div className="relative">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="fixed top-3 right-3 z-50 px-3 py-1.5 bg-[#232A5C] text-white rounded-lg text-xs font-semibold shadow-lg hover:bg-[#E2573A] transition-colors"
        >
          &larr; Return to Studio Workspace
        </button>
        <PublicTrackingPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F2EA] flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenQuickEnquiry={() => setIsQuickEnquiryOpen(true)}
        onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'signin');
          setIsAuthPageOpen(true);
        }}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenLegal={() => setIsLegalModalOpen(true)}
        onSelectTab={(tab) => setActiveTab(tab)}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Super Admin Role Simulation Banner */}
      {isSuperAdminUser && currentRole !== 'super_admin' && (
        <div className="bg-[#232A5C] text-white border-b border-[#3A4585] px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs select-none">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#E2573A] text-white rounded font-mono font-bold text-[10px] uppercase tracking-wide">
              Simulating
            </span>
            <span className="text-stone-200">
              You are simulating the <strong className="text-[#C9A24B] capitalize">{currentRole.replace('_', ' ')}</strong> view for <strong>{currentStudio.name}</strong>.
            </span>
            <span className="text-[11px] text-[#E2DAD0]/70 hidden md:inline">
              (Studio & Role switchers remain unlocked)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                switchRole('super_admin');
                setActiveTab('dashboard');
              }}
              className="px-2.5 py-1 bg-white hover:bg-stone-100 text-[#232A5C] rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
            >
              <span>Exit Simulation</span>
              <span className="text-[#E2573A] font-mono">&rarr; Super Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Responsive Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileMenuOpen}
          closeMobileMenu={() => setIsMobileMenuOpen(false)}
          onOpenQuickEnquiry={() => setIsQuickEnquiryOpen(true)}
          onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="font-serif font-bold text-2xl text-[#232A5C]">
                    Manager Overview
                  </h1>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Live operational metrics, active garment pipeline and deadline tracking.
                  </p>
                </div>
              </div>

              {/* 10-Second KPI Overview */}
              <MetricsOverview
                onSelectTab={setActiveTab}
                onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
                onOpenQuickEnquiry={() => setIsQuickEnquiryOpen(true)}
              />

              {/* Primary Pipeline View */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif font-bold text-base text-[#232A5C]">
                    Active Garment Pipeline
                  </h2>
                  <button
                    onClick={() => setActiveTab('pipeline')}
                    className="text-xs font-semibold text-[#E2573A] hover:underline"
                  >
                    View Full 12-Stage Kanban &rarr;
                  </button>
                </div>
                <PipelineKanban
                  onOpenOrder={(order) => setSelectedOrder(order)}
                  onOpenReschedule={(order) => setRescheduleOrder(order)}
                />
              </div>
            </div>
          )}

          {/* Pipeline Kanban Tab */}
          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <div>
                <h1 className="font-serif font-bold text-2xl text-[#232A5C]">
                  Workshop Pipeline Kanban
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  12 sequential stages from Enquiry to Final Delivery. Drag or tap to advance stages.
                </p>
              </div>
              <PipelineKanban
                onOpenOrder={(order) => setSelectedOrder(order)}
                onOpenReschedule={(order) => setRescheduleOrder(order)}
              />
            </div>
          )}

          {/* Orders Table Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div>
                <h1 className="font-serif font-bold text-2xl text-[#232A5C]">
                  Orders Directory & Countdown Tracker
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Overdue orders prioritized first. Sort, filter by stage, assigned tailor, or customer.
                </p>
              </div>
              <OrdersTableView
                onOpenOrder={(order) => setSelectedOrder(order)}
                onOpenReschedule={(order) => setRescheduleOrder(order)}
                onPrintJobSheet={(order) => setJobSheetOrder(order)}
              />
            </div>
          )}

          {/* Financial Records & Ledger Tab */}
          {activeTab === 'finance' && (
            <FinancialRecordsPage onOpenOrder={(order) => setSelectedOrder(order)} />
          )}

          {/* Delivery Deadlines Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div>
                <h1 className="font-serif font-bold text-2xl text-[#232A5C]">
                  Delivery Deadlines & Workshop Capacity
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Calendar view of upcoming deliveries and staff workload capacity.
                </p>
              </div>
              <DeliveryCalendar onOpenOrder={(order) => setSelectedOrder(order)} />
            </div>
          )}

          {/* Clients & Measurements Tab */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div>
                <h1 className="font-serif font-bold text-2xl text-[#232A5C]">
                  Client Profiles & Bespoke Measurements
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Central directory for customer contacts, multiple dated measurement sets and order histories.
                </p>
              </div>
              <CustomerList
                onOpenCustomer={(c) => setSelectedCustomer(c)}
                onOpenCreateCustomer={() => setIsCreateOrderOpen(true)}
                onOpenAddMeasurement={(c) => setMeasurementCustomer(c)}
              />
            </div>
          )}

          {/* Enquiries & Leads Tab */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div>
                <h1 className="font-serif font-bold text-2xl text-[#232A5C]">
                  Enquiries & Lead Conversion (&lt;30s)
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Log leads instantly from WhatsApp or Instagram. Convert to active client orders with one click.
                </p>
              </div>
              <button
                onClick={() => setIsQuickEnquiryOpen(true)}
                className="px-4 py-2 bg-[#E2573A] text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                + Open Quick Lead Logger
              </button>
            </div>
          )}

          {/* Workshop Job Sheets Tab */}
          {activeTab === 'jobsheets' && (
            <div className="space-y-4">
              <div>
                <h1 className="font-serif font-bold text-2xl text-[#232A5C]">
                  Workshop Cutting Tickets & Job Sheets
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Select any active order to generate and print a workshop-ready cutting ticket with full measurements.
                </p>
              </div>
              <OrdersTableView
                onOpenOrder={(order) => setSelectedOrder(order)}
                onOpenReschedule={(order) => setRescheduleOrder(order)}
                onPrintJobSheet={(order) => setJobSheetOrder(order)}
              />
            </div>
          )}

          {/* Team & Staff Management Tab */}
          {activeTab === 'team' && (
            <TeamManagementPage onNavigateToBilling={() => setActiveTab('billing')} />
          )}

          {/* Subscription & Loyalty Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-4">
              <div>
                <h1 className="font-serif font-bold text-2xl text-[#232A5C]">
                  Studio Subscription & Loyalty Free Month
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Tiered pricing in Naira, Paystack billing, and the 12-Month Loyalty Free Month tracker.
                </p>
              </div>
              <SubscriptionPage />
            </div>
          )}

          {/* Agent Referral Portal Tab (v1.2) */}
          {activeTab === 'agents' && (
            <div className="space-y-4">
              <div>
                <h1 className="font-serif font-bold text-2xl text-[#232A5C]">
                  Agent Referral Program Portal
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Unique links, 21-day trial tracking, 20%–25% commission vesting, and monthly Naira bank payouts.
                </p>
              </div>
              <AgentPortalPage />
            </div>
          )}

          {/* Super Admin Console Tab */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div>
                <h1 className="font-serif font-bold text-2xl text-[#232A5C]">
                  Platform Administration Console
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Platform-wide MRR, tenant isolation status, churn, and agent liabilities.
                </p>
              </div>
              <SuperAdminPage />
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOpenReschedule={(order) => setRescheduleOrder(order)}
        onPrintJobSheet={(order) => setJobSheetOrder(order)}
      />

      <CreateOrderModal
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
      />

      <RescheduleModal
        order={rescheduleOrder}
        onClose={() => setRescheduleOrder(null)}
      />

      <JobSheetModal
        order={jobSheetOrder}
        onClose={() => setJobSheetOrder(null)}
      />

      <CustomerDetailModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onOpenAddMeasurement={(c) => setMeasurementCustomer(c)}
        onOpenOrder={(o) => setSelectedOrder(o)}
      />

      <MeasurementModal
        customer={measurementCustomer}
        onClose={() => setMeasurementCustomer(null)}
      />

      <QuickEnquiryModal
        isOpen={isQuickEnquiryOpen}
        onClose={() => setIsQuickEnquiryOpen(false)}
        onOpenOrder={(order) => setSelectedOrder(order)}
      />

      <OnboardingWizardModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={() => setIsOnboardingOpen(false)}
        initialData={{
          studioName: currentStudio?.name,
          phone: currentStudio?.phone,
          city: currentStudio?.address,
          ownerName: currentStudio?.ownerName,
          specialty: currentStudio?.tagline,
        }}
        onOpenStaffRegistration={(inv) => {
          setIsOnboardingOpen(false);
          setInviteData({
            token: inv.inviteToken,
            studioId: inv.studioId,
            role: inv.role,
            name: inv.name,
            email: inv.email,
            phone: inv.phone,
          });
          setAuthMode('signup');
          setIsAuthPageOpen(true);
        }}
      />

      <LegalTermsModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar (md:hidden) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#232A5C] text-[#F7F2EA] border-t border-[#363E75] shadow-lg md:hidden">
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {currentRole === 'agent' ? (
            <>
              <button
                onClick={() => {
                  setActiveTab('agents');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  activeTab === 'agents' ? 'text-[#E2573A]' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Gift className="w-5 h-5" />
                <span className="text-[10px] font-semibold mt-1">Portal</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('tracking');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  (activeTab as string) === 'tracking' ? 'text-[#E2573A]' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Truck className="w-5 h-5" />
                <span className="text-[10px] font-semibold mt-1">Tracking</span>
              </button>
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setIsQuickEnquiryOpen(true)}
                  className="w-10 h-10 rounded-full bg-[#E2573A] text-white flex items-center justify-center shadow-md -mt-3 border-2 border-[#232A5C]"
                  title="Quick Enquiry"
                >
                  <span className="text-xl font-bold leading-none">+</span>
                </button>
              </div>
              <button
                onClick={() => setIsLegalModalOpen(true)}
                className="flex flex-col items-center justify-center py-1 text-stone-300 hover:text-white transition-colors"
              >
                <Info className="w-5 h-5" />
                <span className="text-[10px] font-semibold mt-1">Terms</span>
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  isMobileMenuOpen ? 'text-[#E2573A]' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Menu className="w-5 h-5" />
                <span className="text-[10px] font-semibold mt-1">Menu</span>
              </button>
            </>
          ) : currentRole === 'production' ? (
            <>
              <button
                onClick={() => {
                  setActiveTab('pipeline');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  activeTab === 'pipeline' ? 'text-[#E2573A]' : 'text-stone-300 hover:text-white'
                }`}
              >
                <KanbanSquare className="w-5 h-5" />
                <span className="text-[10px] font-semibold mt-1">Pipeline</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('orders');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  activeTab === 'orders' ? 'text-[#E2573A]' : 'text-stone-300 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="text-[10px] font-semibold mt-1">Orders</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('jobsheets');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  activeTab === 'jobsheets' ? 'text-[#E2573A]' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Printer className="w-5 h-5" />
                <span className="text-[10px] font-semibold mt-1">Job Sheets</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('customers');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  activeTab === 'customers' ? 'text-[#E2573A]' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-[10px] font-semibold mt-1">Clients</span>
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`relative flex flex-col items-center justify-center py-1 transition-colors ${
                  isMobileMenuOpen || !['pipeline', 'orders', 'jobsheets', 'customers'].includes(activeTab)
                    ? 'text-[#E2573A]'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Menu className="w-5 h-5" />
                <span className="text-[10px] font-semibold mt-1">Menu</span>
                {!['pipeline', 'orders', 'jobsheets', 'customers'].includes(activeTab) && (
                  <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#E2573A]" />
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  activeTab === 'dashboard' ? 'text-[#E2573A]' : 'text-stone-300 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-[10px] font-semibold mt-1">Dashboard</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('pipeline');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  activeTab === 'pipeline' ? 'text-[#E2573A]' : 'text-stone-300 hover:text-white'
                }`}
              >
                <KanbanSquare className="w-5 h-5" />
                <span className="text-[10px] font-semibold mt-1">Pipeline</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('orders');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  activeTab === 'orders' ? 'text-[#E2573A]' : 'text-stone-300 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="text-[10px] font-semibold mt-1">Orders</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('customers');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  activeTab === 'customers' ? 'text-[#E2573A]' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-[10px] font-semibold mt-1">Clients</span>
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`relative flex flex-col items-center justify-center py-1 transition-colors ${
                  isMobileMenuOpen || !['dashboard', 'pipeline', 'orders', 'customers'].includes(activeTab)
                    ? 'text-[#E2573A]'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Menu className="w-5 h-5" />
                <span className="text-[10px] font-semibold mt-1">Menu</span>
                {!['dashboard', 'pipeline', 'orders', 'customers'].includes(activeTab) && (
                  <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#E2573A]" />
                )}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Toast Notification Container */}
      <div className="fixed bottom-20 md:bottom-4 right-4 z-[70] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-full pointer-events-none select-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-start gap-2.5 animate-in slide-in-from-bottom-5 duration-200 ${
              toast.type === 'success'
                ? 'bg-[#EDF5F0] border-[#3F7D5C]/40 text-[#232A5C]'
                : toast.type === 'error'
                ? 'bg-[#FDECEC] border-[#8B1E1E]/40 text-[#8B1E1E]'
                : toast.type === 'warning'
                ? 'bg-[#FBF6EB] border-[#C9A24B]/40 text-[#232A5C]'
                : 'bg-[#232A5C] border-[#363E75] text-[#F7F2EA]'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#3F7D5C] shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[#8B1E1E] shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <div className="font-bold leading-tight">{toast.title}</div>
              {toast.message && (
                <div className="text-[11px] opacity-90 mt-0.5 leading-snug">
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

