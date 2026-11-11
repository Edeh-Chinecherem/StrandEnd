import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlanTierBadge } from '../brand/Badge';
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  Scissors,
  Truck,
  Briefcase,
  HelpCircle,
  Copy,
  Check,
  Plus,
  Trash2,
  Share2,
  Lock,
  X,
} from 'lucide-react';
import { StaffApplication, User, UserRole, StaffInvitation, PLAN_STAFF_LIMITS } from '../../types';

interface TeamManagementPageProps {
  onNavigateToBilling?: () => void;
}

export const TeamManagementPage: React.FC<TeamManagementPageProps> = ({
  onNavigateToBilling,
}) => {
  const {
    currentStudio,
    currentUser,
    currentRole,
    users,
    staffApplications,
    staffInvitations,
    createStaffInvitation,
    cancelStaffInvitation,
    approveStaffApplication,
    rejectStaffApplication,
    removeStaffMember,
    activeStaffCount,
    staffLimitForStudio,
    showToast,
  } = useApp();

  const [filterRole, setFilterRole] = useState<string>('all');
  const [rejectingApp, setRejectingApp] = useState<StaffApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [removingUser, setRemovingUser] = useState<User | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Invite modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'manager' | 'front_desk' | 'production' | 'dispatch'>('production');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('+234 ');

  // Active staff count and limit
  const activeCount = activeStaffCount(currentStudio.id);
  const staffLimit = staffLimitForStudio(currentStudio.id);
  const seatsRemaining = Math.max(0, staffLimit - activeCount);
  const percentageUsed = Math.min(100, Math.round((activeCount / staffLimit) * 100));

  // Staff in this studio
  const studioStaff = users.filter((u) => u.studioId === currentStudio.id);

  // Direct Staff Invitations for this studio
  const studioInvitations = (staffInvitations || []).filter(
    (inv) => inv.studioId === currentStudio.id
  );
  const pendingInvitations = studioInvitations.filter((inv) => inv.status === 'pending');

  // Pending applications for this studio
  const pendingApplications = (staffApplications || []).filter(
    (a) => a.studioId === currentStudio.id && a.status === 'pending'
  );

  // Historical / processed applications
  const processedApplications = (staffApplications || []).filter(
    (a) => a.studioId === currentStudio.id && a.status !== 'pending'
  );

  const getInviteUrl = (inv: StaffInvitation) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    return `${origin}${path}?inviteToken=${inv.inviteToken}&studioId=${inv.studioId}&role=${inv.role}&email=${encodeURIComponent(inv.email)}&name=${encodeURIComponent(inv.name)}&phone=${encodeURIComponent(inv.phone || '')}`;
  };

  const handleCopyInviteLink = (inv: StaffInvitation) => {
    const url = getInviteUrl(inv);
    navigator.clipboard.writeText(url);
    setCopiedToken(inv.inviteToken);
    showToast(
      'success',
      'Invitation Link Copied!',
      `Direct link copied for ${inv.name} (${inv.role.replace('_', ' ').toUpperCase()}).`
    );
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleWhatsAppShare = (inv: StaffInvitation) => {
    const url = getInviteUrl(inv);
    const text = `Hello ${inv.name}! You have been invited by ${currentStudio.ownerName} to join ${currentStudio.name} as ${inv.role.replace('_', ' ').toUpperCase()} on StrandEnd.\n\nClick this invitation link to register and access your workspace:\n${url}`;
    const cleanPhone = (inv.phone || '').replace(/[^0-9]/g, '');
    const waUrl =
      cleanPhone.length >= 10
        ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleCreateInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) {
      showToast('error', 'Missing Information', 'Please provide a name and email.');
      return;
    }

    const cleanEmail = newStaffEmail.trim().toLowerCase();
    const isDuplicate = studioInvitations.some(
      (inv) => inv.email.toLowerCase() === cleanEmail && inv.status === 'pending'
    );
    if (isDuplicate) {
      showToast('error', 'Already Invited', `${cleanEmail} already has a pending invitation.`);
      return;
    }

    const res = createStaffInvitation({
      name: newStaffName.trim(),
      role: newStaffRole,
      email: cleanEmail,
      phone: newStaffPhone.trim() || undefined,
      studioId: currentStudio.id,
    });

    if (res.success) {
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPhone('+234 ');
      setIsInviteModalOpen(false);
    }
  };

  const handleApprove = (app: StaffApplication) => {
    if (activeCount >= staffLimit) {
      showToast(
        'error',
        'Staff Seat Limit Reached',
        `Your ${currentStudio.plan.toUpperCase()} plan is currently at capacity (${activeCount}/${staffLimit} seats). Please upgrade your subscription to add more team members.`
      );
      return;
    }

    const res = approveStaffApplication(app.id);
    if (!res.success && res.limitReached) {
      // Trigger warning
    }
  };

  const confirmReject = () => {
    if (!rejectingApp) return;
    rejectStaffApplication(rejectingApp.id, rejectionReason || undefined);
    setRejectingApp(null);
    setRejectionReason('');
  };

  const confirmRemove = () => {
    if (!removingUser) return;
    removeStaffMember(removingUser.id);
    setRemovingUser(null);
  };

  const handleCopyInvite = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const inviteUrl = `${origin}${path}?studioId=${currentStudio.id}&regType=staff`;
    const inviteText = `Hello! You have been invited to join ${currentStudio.name} on StrandEnd.\nClick here to register and access your workshop role: ${inviteUrl}`;
    navigator.clipboard.writeText(inviteText);
    setCopiedInvite(true);
    showToast('success', 'Studio Invite Link Copied!', 'Share with team members to register under your studio.');
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#232A5C] text-white">
            <ShieldCheck className="w-3 h-3 text-[#C9A24B]" />
            Studio Owner & Designer
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Briefcase className="w-3 h-3" />
            Operations Manager
          </span>
        );
      case 'front_desk':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <HelpCircle className="w-3 h-3" />
            Front Desk & Sales
          </span>
        );
      case 'production':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Scissors className="w-3 h-3 text-[#3F7D5C]" />
            Production Tailor / Cutter
          </span>
        );
      case 'dispatch':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-200">
            <Truck className="w-3 h-3" />
            Dispatch & Logistics
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-700">
            {role}
          </span>
        );
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'Full studio visibility, financial reports, pricing control and team management.';
      case 'manager':
        return 'Pipeline oversight, deadline tracking, work reassignment, and customer records.';
      case 'front_desk':
        return 'Customer enquiries, order booking, payment logging, and delivery updates.';
      case 'production':
        return 'View assigned jobs, cutting tickets, bespoke measurements, and mark production stages complete.';
      case 'dispatch':
        return 'Monitor ready-for-delivery garments and record dispatch confirmations.';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E4DCD0] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif font-bold text-2xl text-[#232A5C]">
              Team & Staff Management
            </h1>
            <PlanTierBadge tier={currentStudio.plan} />
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Review registration requests, enforce staff seat quotas, and assign workshop responsibilities for{' '}
            <span className="font-semibold text-stone-900">{currentStudio.name}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            disabled={activeCount >= staffLimit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#232A5C] hover:bg-[#343D7B] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5 text-[#C9A24B]" />
            <span>Invite Staff Member</span>
          </button>

          <button
            onClick={handleCopyInvite}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F7F2EA] hover:bg-[#EBE3D5] text-[#232A5C] text-xs font-semibold rounded-xl border border-[#E4DCD0] transition-colors"
          >
            {copiedInvite ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#C9A24B]" />
            )}
            <span>{copiedInvite ? 'Invite Copied!' : 'Copy General Link'}</span>
          </button>

          {onNavigateToBilling && (
            <button
              onClick={onNavigateToBilling}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-[#232A5C] text-xs font-semibold rounded-xl border border-[#E4DCD0] transition-colors"
            >
              <span>Upgrade Seats</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#C9A24B]" />
            </button>
          )}
        </div>
      </div>

      {/* Plan Seat Quota Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Seat Usage Overview */}
        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-[#E4DCD0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#232A5C]/10 text-[#232A5C] flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#232A5C]">
                  Staff Seat Capacity (PRD Section 5)
                </h3>
                <p className="text-[11px] text-stone-500">
                  Enforces maximum concurrent active team members per subscription plan tier.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-serif font-bold text-xl text-[#232A5C]">
                {activeCount}
              </span>
              <span className="text-stone-400 font-medium text-sm"> / {staffLimit} seats</span>
            </div>
          </div>

          <div className="py-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-stone-600">
                {seatsRemaining > 0
                  ? `${seatsRemaining} open staff seat${seatsRemaining > 1 ? 's' : ''} available`
                  : 'All staff seats filled'}
              </span>
              <span
                className={`font-semibold ${
                  percentageUsed >= 100
                    ? 'text-[#E2573A]'
                    : percentageUsed >= 80
                    ? 'text-amber-600'
                    : 'text-[#3F7D5C]'
                }`}
              >
                {percentageUsed}% Capacity
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentageUsed >= 100
                    ? 'bg-[#E2573A]'
                    : percentageUsed >= 80
                    ? 'bg-amber-500'
                    : 'bg-[#3F7D5C]'
                }`}
                style={{ width: `${percentageUsed}%` }}
              />
            </div>
          </div>

          {activeCount >= staffLimit ? (
            <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <div className="flex-1">
                <span className="font-semibold">Seat Limit Reached:</span> You cannot approve new
                staff without upgrading your plan or removing an inactive team member.
              </div>
              {onNavigateToBilling && (
                <button
                  onClick={onNavigateToBilling}
                  className="px-2.5 py-1 bg-[#E2573A] hover:bg-[#c9492e] text-white text-[11px] font-semibold rounded-lg shrink-0 transition-colors"
                >
                  Upgrade to Atelier (15 Seats)
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px] text-stone-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3F7D5C]" />
              <span>
                Plan limits:{' '}
                <strong className="text-stone-700">Starter (2)</strong> &bull;{' '}
                <strong className="text-stone-700">Studio (5)</strong> &bull;{' '}
                <strong className="text-stone-700">Atelier (15)</strong>
              </span>
            </div>
          )}
        </div>

        {/* Studio Registration Code & Info */}
        <div className="bg-[#FAF6F0] p-5 rounded-2xl border border-[#E4DCD0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#C9A24B] mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#232A5C]">
                Self-Registration Flow
              </span>
            </div>
            <h4 className="font-serif font-bold text-sm text-[#232A5C] mb-1">
              How New Staff Join
            </h4>
            <p className="text-[11px] text-stone-600 leading-relaxed mb-3">
              Staff members register themselves on the Sign Up page by selecting &ldquo;Join Fashion Studio
              Team&rdquo;, choosing <strong className="text-stone-800">{currentStudio.name}</strong>,
              and choosing their position.
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E4DCD0]">
            <div className="text-[10px] text-stone-500 uppercase tracking-wide">
              Selected Studio ID
            </div>
            <div className="font-mono text-xs font-bold text-[#232A5C] mt-0.5">
              {currentStudio.id} &bull; {currentStudio.name}
            </div>
          </div>
        </div>
      </div>

      {/* DIRECT STAFF INVITATIONS SECTION */}
      <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E4DCD0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h2 className="font-serif font-bold text-lg text-[#232A5C]">
              Direct Staff Invitations
            </h2>
            {pendingInvitations.length > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3F7D5C] text-white">
                {pendingInvitations.length} Active Link{pendingInvitations.length > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                0 Active Links
              </span>
            )}
          </div>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            disabled={activeCount >= staffLimit}
            className="text-xs text-[#E2573A] font-bold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate New Invite Link</span>
          </button>
        </div>

        {pendingInvitations.length === 0 ? (
          <div className="p-8 text-center text-stone-400 bg-stone-50/50">
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              No pending staff invitation links. Click <strong>Generate New Invite Link</strong> above or during studio onboarding to generate pre-approved registration links for your tailors, cutters, and managers.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="p-4 sm:p-5 hover:bg-[#FAF6F0]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-[#232A5C]">{inv.name}</span>
                    {getRoleBadge(inv.role)}
                    <span className="text-[10px] text-stone-400">
                      Invited {new Date(inv.invitedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-600">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      {inv.email}
                    </span>
                    {inv.phone && inv.phone !== '+234 ' && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        {inv.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopyInviteLink(inv)}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#232A5C] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-200"
                  >
                    {copiedToken === inv.inviteToken ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#3F7D5C]" />
                        <span className="text-[#3F7D5C]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleWhatsAppShare(inv)}
                    className="px-3 py-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => cancelStaffInvitation(inv.id)}
                    className="p-1.5 text-stone-300 hover:text-rose-600 rounded-lg transition-colors"
                    title="Revoke invitation link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PENDING STAFF APPLICATIONS SECTION */}
      <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E4DCD0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h2 className="font-serif font-bold text-lg text-[#232A5C]">
              Pending Staff Registrations
            </h2>
            {pendingApplications.length > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E2573A] text-white">
                {pendingApplications.length} Waiting Review
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                0 Pending
              </span>
            )}
          </div>
          <span className="text-xs text-stone-500">
            Studio owners approve or decline before team members can sign in.
          </span>
        </div>

        {pendingApplications.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-700">
              No Pending Registrations
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              All staff registration requests for {currentStudio.name} have been processed. Share
              the registration link with new cutters, tailors, or front desk staff.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {pendingApplications.map((app) => (
              <div
                key={app.id}
                className="p-5 hover:bg-[#FAF6F0]/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-bold text-sm text-[#232A5C]">{app.name}</h3>
                    {getRoleBadge(app.requestedRole)}
                    <span className="flex items-center gap-1 text-[11px] text-stone-400">
                      <Clock className="w-3 h-3" />
                      Applied {new Date(app.appliedDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <a href={`mailto:${app.email}`} className="hover:underline">
                        {app.email}
                      </a>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <a href={`tel:${app.phone}`} className="hover:underline">
                        {app.phone}
                      </a>
                    </span>
                  </div>

                  {app.specialty && (
                    <div className="text-xs text-stone-700 bg-[#F7F2EA] px-3 py-1.5 rounded-lg border border-[#E4DCD0] mt-1">
                      <span className="font-medium text-stone-900">Experience / Specialty: </span>
                      {app.specialty}
                    </div>
                  )}

                  <p className="text-[11px] text-stone-500 italic">
                    Role responsibility: {getRoleDescription(app.requestedRole)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0">
                  <button
                    onClick={() => setRejectingApp(app)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>

                  <button
                    onClick={() => handleApprove(app)}
                    disabled={activeCount >= staffLimit}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs ${
                      activeCount >= staffLimit
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : 'bg-[#3F7D5C] hover:bg-[#34664b] text-white'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{activeCount >= staffLimit ? 'Seat Full' : 'Approve & Admit'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIVE STUDIO STAFF ROSTER SECTION */}
      <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E4DCD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif font-bold text-lg text-[#232A5C]">
              Active Studio Team Roster
            </h2>
            <p className="text-xs text-stone-500">
              {studioStaff.length} active team member{studioStaff.length > 1 ? 's' : ''} with
              access to {currentStudio.name}&apos;s workspace.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Filter:</span>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="text-xs bg-[#FAF6F0] border border-[#E4DCD0] rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-hidden"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner / Designer</option>
              <option value="manager">Manager</option>
              <option value="front_desk">Front Desk</option>
              <option value="production">Production Tailor</option>
              <option value="dispatch">Dispatch</option>
            </select>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6F0] text-stone-600 uppercase font-mono text-[10px] tracking-wider border-b border-[#E4DCD0]">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role & Duties</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Seat Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {studioStaff
                .filter((staff) => filterRole === 'all' || staff.role === filterRole)
                .map((staff) => {
                  const isOwner = staff.role === 'owner';
                  return (
                    <tr key={staff.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#232A5C] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {staff.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900">{staff.name}</div>
                            <div className="text-[11px] text-stone-400">{staff.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {getRoleBadge(staff.role)}
                          <div className="text-[11px] text-stone-500 max-w-xs leading-tight">
                            {getRoleDescription(staff.role)}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 text-stone-600">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-stone-400" />
                            <span>{staff.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-stone-400" />
                            <span>{staff.phone}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active Seat
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isOwner ? (
                          <span className="text-[11px] text-stone-400 italic">
                            Account Founder
                          </span>
                        ) : (
                          <button
                            onClick={() => setRemovingUser(staff)}
                            disabled={currentRole !== 'owner' && currentRole !== 'manager'}
                            className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors border border-transparent hover:border-rose-200"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* REJECT APPLICATION MODAL */}
      {rejectingApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E4DCD0]">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Decline Staff Application
                </h3>
                <p className="text-xs text-stone-500">Applicant: {rejectingApp.name}</p>
              </div>
            </div>

            <p className="text-xs text-stone-600">
              Are you sure you want to decline this registration request for{' '}
              <strong>{rejectingApp.requestedRole.replace('_', ' ').toUpperCase()}</strong>?
            </p>

            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1">
                Reason for Declining (Optional):
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Workshop full capacity or specialty not required at this time."
                rows={3}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#232A5C]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingApp(null)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE STAFF CONFIRMATION MODAL */}
      {removingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E4DCD0]">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Remove Staff Member
                </h3>
                <p className="text-xs text-stone-500">{removingUser.name}</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to remove <strong>{removingUser.name}</strong> from{' '}
              <strong>{currentStudio.name}</strong>? Their access to this studio workspace will be
              revoked immediately and 1 staff seat will be freed up.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRemovingUser(null)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Keep Staff
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Yes, Remove Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVITE NEW STAFF MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E4DCD0]">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#232A5C] text-white flex items-center justify-center">
                  <Plus className="w-5 h-5 text-[#C9A24B]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#232A5C]">
                    Invite Staff Member
                  </h3>
                  <p className="text-xs text-stone-500">
                    Pre-approve role & send unique registration link
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvitation} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Samuel Okon"
                  className="w-full px-3 py-2 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] text-xs focus:outline-hidden focus:border-[#232A5C] text-[#232A5C]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Assigned Workshop Role *
                </label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] text-xs font-semibold focus:outline-hidden focus:border-[#232A5C] text-[#232A5C]"
                >
                  <option value="production">Production Staff (Cutter, Tailor, Finisher)</option>
                  <option value="manager">Operations Manager (Pipeline & Reassigning)</option>
                  <option value="front_desk">Front Desk / Sales (Enquiries & Orders)</option>
                  <option value="dispatch">Dispatch / Delivery (Pickup & Tracking)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="samuel@tailorhub.ng"
                  className="w-full px-3 py-2 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] text-xs focus:outline-hidden focus:border-[#232A5C] text-[#232A5C]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Phone / WhatsApp Number (Optional)
                </label>
                <input
                  type="tel"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  placeholder="+234 803 000 0000"
                  className="w-full px-3 py-2 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] text-xs focus:outline-hidden focus:border-[#232A5C] text-[#232A5C]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#232A5C] hover:bg-[#343D7B] text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C9A24B]" />
                  <span>Create & Generate Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

