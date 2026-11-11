import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../brand/Logo';
import { LegalTermsModal } from './LegalTermsModal';
import {
  Building2,
  Sparkles,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Lock,
  Gift,
  ArrowRight,
  User,
  MapPin,
  CheckCircle2,
  Briefcase,
  HelpCircle,
  Scissors,
  Truck,
  Users,
  Clock,
} from 'lucide-react';
import { UserRole } from '../../types';

interface SignUpPageProps {
  onGoToSignIn: () => void;
  onSignUpComplete: (studioData: {
    studioName: string;
    ownerName: string;
    email: string;
    phone: string;
    city: string;
    plan: 'starter' | 'studio' | 'atelier';
    referralCode?: string;
  }) => void;
  onStaffRegistered?: () => void;
  inviteData?: {
    token?: string;
    studioId?: string;
    role?: UserRole;
    name?: string;
    email?: string;
    phone?: string;
  };
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  onGoToSignIn,
  onSignUpComplete,
  onStaffRegistered,
  inviteData,
}) => {
  const { studios, agents, applyForStaffRole, registerAndActivateInvitedStaff, showToast } = useApp();

  // Registration Type: Studio Owner (Register Fashion Studio) vs Staff Applicant (Join Fashion Studio)
  const [regType, setRegType] = useState<'owner' | 'staff'>('owner');
  const [isFromInvite, setIsFromInvite] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | undefined>(inviteData?.token);

  // Studio Owner Fields
  const [studioName, setStudioName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('+234 ');
  const [city, setCity] = useState('Lagos');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'studio' | 'atelier'>('studio');
  const [referralCode, setReferralCode] = useState('AGT-21DAY-AMINA');
  const [acceptedOwnerTerms, setAcceptedOwnerTerms] = useState(false);

  // Staff Applicant Fields
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('+234 ');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [selectedStudioId, setSelectedStudioId] = useState(studios[0]?.id || 'studio-1');
  const [selectedRole, setSelectedRole] = useState<'manager' | 'front_desk' | 'production' | 'dispatch'>('production');
  const [specialty, setSpecialty] = useState('');
  const [acceptedStaffTerms, setAcceptedStaffTerms] = useState(false);
  const [staffApplicationSuccess, setStaffApplicationSuccess] = useState<{
    name: string;
    role: string;
    studioName: string;
  } | null>(null);

  // Check URL query parameters or inviteData on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('inviteToken') || params.get('token') || inviteData?.token;
    const studioIdParam = params.get('studioId') || inviteData?.studioId;
    const roleParam = (params.get('role') || inviteData?.role) as UserRole;
    const emailParam = params.get('email') || inviteData?.email;
    const nameParam = params.get('name') || inviteData?.name;
    const phoneParam = params.get('phone') || inviteData?.phone;

    if (token || studioIdParam || roleParam || inviteData) {
      setRegType('staff');
      setIsFromInvite(true);
      if (token) setInviteToken(token);
      if (studioIdParam) setSelectedStudioId(studioIdParam);
      if (roleParam && ['manager', 'front_desk', 'production', 'dispatch'].includes(roleParam)) {
        setSelectedRole(roleParam as any);
      }
      if (nameParam) setStaffName(decodeURIComponent(nameParam));
      if (emailParam) setStaffEmail(decodeURIComponent(emailParam));
      if (phoneParam) setStaffPhone(decodeURIComponent(phoneParam));
    }
  }, [inviteData]);

  // Legal Modal
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalDocType, setLegalDocType] = useState<'terms' | 'agent' | 'privacy' | 'dpa'>('terms');

  // Check referral code validity
  const matchedAgent = agents.find(
    (a) =>
      a.uniqueCode.toLowerCase() === referralCode.trim().toLowerCase() ||
      referralCode.trim().toUpperCase() === 'AGT-21DAY-AMINA'
  );

  // Password strength helper
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: '', color: '', width: '0%' };
    if (pass.length < 6) return { label: 'Weak', color: 'bg-rose-500', width: '25%' };
    if (pass.length < 8) return { label: 'Fair', color: 'bg-amber-500', width: '50%' };
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) {
      return { label: 'Strong', color: 'bg-[#3F7D5C]', width: '100%' };
    }
    return { label: 'Good', color: 'bg-blue-500', width: '75%' };
  };

  const ownerStrength = getPasswordStrength(ownerPassword);
  const staffStrength = getPasswordStrength(staffPassword);

  const selectedStudio = studios.find((s) => s.id === selectedStudioId) || studios[0];

  // Owner Form Submit
  const handleOwnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedOwnerTerms) {
      alert('Please read and accept the Terms of Service and Privacy Policy before creating your fashion studio account.');
      return;
    }

    if (!studioName.trim() || !ownerName.trim() || !ownerEmail.trim() || !ownerPhone.trim() || !ownerPassword) {
      alert('Please fill out all required fields.');
      return;
    }

    showToast('info', 'Studio Registered', 'Please enter the 6-digit verification code to activate your fashion studio.');
    onSignUpComplete({
      studioName,
      ownerName,
      email: ownerEmail,
      phone: ownerPhone,
      city,
      plan: selectedPlan,
      referralCode: referralCode.trim() || undefined,
    });
  };

  // Staff Form Submit
  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedStaffTerms) {
      alert('Please read and accept the Terms of Service and Privacy Policy before registering.');
      return;
    }

    if (!staffName.trim() || !staffEmail.trim() || !staffPassword) {
      alert('Please fill out all required fields.');
      return;
    }

    // Direct registration for owner-invited staff
    if (isFromInvite || inviteToken) {
      const res = registerAndActivateInvitedStaff({
        token: inviteToken,
        name: staffName.trim(),
        email: staffEmail.trim(),
        phone: staffPhone.trim() || '+234 800 000 0000',
        role: selectedRole,
        studioId: selectedStudio.id,
        password: staffPassword,
      });

      if (res.success) {
        if (window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        if (onStaffRegistered) {
          onStaffRegistered();
        } else {
          onGoToSignIn();
        }
      }
      return;
    }

    // Standard application requiring studio owner review
    const res = applyForStaffRole({
      name: staffName.trim(),
      email: staffEmail.trim(),
      phone: staffPhone.trim(),
      requestedRole: selectedRole,
      studioId: selectedStudio.id,
      studioName: selectedStudio.name,
      specialty: specialty.trim() || undefined,
    });

    if (res.success) {
      setStaffApplicationSuccess({
        name: staffName.trim(),
        role: selectedRole,
        studioName: selectedStudio.name,
      });
    }
  };

  const roleDescriptions: Record<string, { label: string; desc: string; icon: any }> = {
    manager: {
      label: 'Operations Manager',
      desc: 'Oversees daily studio operations, pipeline kanban, deadlines, and reassigns cutting/sewing jobs.',
      icon: Briefcase,
    },
    front_desk: {
      label: 'Front Desk / Sales Assistant',
      desc: 'Handles customer enquiries, books new orders, logs deposit/cash payments, and updates client records.',
      icon: HelpCircle,
    },
    production: {
      label: 'Production Staff (Cutter / Tailor)',
      desc: 'Views assigned garment jobs, client bespoke measurements, cutting job sheets, and updates stage progress.',
      icon: Scissors,
    },
    dispatch: {
      label: 'Dispatch & Logistics Officer',
      desc: 'Monitors orders ready for delivery, prepares courier parcels, and records completed deliveries.',
      icon: Truck,
    },
  };

  return (
    <div className="min-h-screen bg-[#F7F2EA] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 select-none font-sans">
      <div className="max-w-4xl w-full mx-auto bg-white rounded-3xl border border-[#E4DCD0] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Branding Hero Panel */}
        <div className="md:col-span-5 bg-[#232A5C] text-[#F7F2EA] p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full border border-white/5 pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <Logo variant="full" theme="dark" size="lg" showTagline={true} />

            <div className="pt-4">
              <span className="text-[11px] uppercase tracking-widest text-[#C9A24B] font-bold block">
                {regType === 'owner' ? 'Studio Owner Registration' : 'Fashion Studio Team Application'}
              </span>
              <h2 className="font-serif font-bold text-2xl text-white leading-tight mt-1">
                {regType === 'owner'
                  ? 'Start your bespoke fashion studio workspace.'
                  : 'Join your fashion studio workspace.'}
              </h2>
              <p className="text-xs text-[#E2DAD0]/90 mt-2 leading-relaxed">
                {regType === 'owner'
                  ? 'Join prestigious fashion houses and custom tailors managing client measurements, 12-stage production deadlines, and automated WhatsApp delivery notices.'
                  : 'Apply to join your studio team. Once approved by the studio owner within the plan seat quota, you can access your assigned jobs and measurements.'}
              </p>
            </div>

            {/* Trial & Seat Callout */}
            {regType === 'owner' ? (
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#C9A24B] font-serif font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {matchedAgent ? '21-Day Extended Free Trial' : '14-Day Free Studio Trial'}
                  </span>
                </div>
                <p className="text-[11px] text-[#E2DAD0] leading-snug">
                  No credit card required. Full access to client measurement archives, cutting job tickets, and team dispatch.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#C9A24B] font-serif font-bold text-sm">
                  <Users className="w-4 h-4" />
                  <span>Owner-Approved Staff Access</span>
                </div>
                <p className="text-[11px] text-[#E2DAD0] leading-snug">
                  Your application will be sent to the studio owner. Seat limits (Starter: 2, Studio: 5, Atelier: 15) are strictly maintained.
                </p>
              </div>
            )}

            {/* Value checklist */}
            <div className="space-y-2.5 text-xs text-[#E2DAD0]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#3F7D5C] text-white flex items-center justify-center font-bold text-[9px]">
                  ✓
                </div>
                <span>Strict multi-tenant workspace data isolation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#3F7D5C] text-white flex items-center justify-center font-bold text-[9px]">
                  ✓
                </div>
                <span>NDPA 2023 Nigerian Data Privacy compliance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#3F7D5C] text-white flex items-center justify-center font-bold text-[9px]">
                  ✓
                </div>
                <span>Role-based access & staff seat capacity enforcement</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-[11px] text-[#E2DAD0]/80">
            Already have an approved account?{' '}
            <button
              onClick={onGoToSignIn}
              className="text-[#E2573A] font-bold hover:underline"
            >
              Sign In &rarr;
            </button>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
          {/* Header & Registration Type Toggle */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="font-serif font-black text-xl text-[#232A5C]">
                  {regType === 'owner' ? 'Register Your Fashion Studio' : 'Apply to Join a Team'}
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  {regType === 'owner'
                    ? 'Create your studio workspace and invite your team'
                    : 'Select your fashion studio and requested workshop position'}
                </p>
              </div>
              <button
                onClick={onGoToSignIn}
                className="text-xs text-[#E2573A] hover:underline font-semibold"
              >
                Sign In instead
              </button>
            </div>

            {/* Role / Registration Type Switcher */}
            <div className="grid grid-cols-2 p-1 bg-[#FAF6F0] rounded-2xl border border-[#E4DCD0]">
              <button
                type="button"
                onClick={() => {
                  setRegType('owner');
                  setStaffApplicationSuccess(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  regType === 'owner'
                    ? 'bg-[#232A5C] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Studio Owner (Register Fashion Studio)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRegType('staff');
                  setStaffApplicationSuccess(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  regType === 'staff'
                    ? 'bg-[#232A5C] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Join Fashion Studio Team (Staff / Tailor)</span>
              </button>
            </div>
          </div>

          {/* STAFF APPLICATION SUCCESS VIEW */}
          {staffApplicationSuccess ? (
            <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-4 text-center my-auto">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-emerald-900">
                  Registration Submitted!
                </h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{staffApplicationSuccess.name}</strong>. Your request to join{' '}
                  <strong>{staffApplicationSuccess.studioName}</strong> as a{' '}
                  <span className="font-semibold uppercase tracking-wider text-emerald-900">
                    {staffApplicationSuccess.role.replace('_', ' ')}
                  </span>{' '}
                  has been sent to the studio owner.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-left text-xs text-stone-600 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-stone-800">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Status: Pending Owner Approval</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-normal">
                  The studio owner reviews new team registrations against their subscription seat quota.
                  Once approved, your account will be activated and you can sign in directly.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onGoToSignIn}
                  className="px-5 py-2.5 bg-[#232A5C] hover:bg-[#343D7B] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Proceed to Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setStaffApplicationSuccess(null)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : regType === 'owner' ? (
            /* =================== STUDIO OWNER REGISTRATION FORM =================== */
            <form onSubmit={handleOwnerSubmit} className="space-y-3.5 text-xs">
              {/* Studio Name & Owner Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Fashion Studio / Brand Name *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={studioName}
                      onChange={(e) => setStudioName(e.target.value)}
                      placeholder="e.g. Kari Couture Fashion Studio"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] text-xs focus:outline-hidden focus:border-[#232A5C] focus:bg-white text-[#232A5C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Creative Director / Owner *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Folake Adeleke"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] text-xs focus:outline-hidden focus:border-[#232A5C] focus:bg-white text-[#232A5C]"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Business Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="owner@youratelier.ng"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] text-xs focus:outline-hidden focus:border-[#232A5C] focus:bg-white text-[#232A5C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    WhatsApp Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="+234 803 000 0000"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] text-xs focus:outline-hidden focus:border-[#232A5C] focus:bg-white text-[#232A5C]"
                    />
                  </div>
                </div>
              </div>

              {/* City & Plan Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Primary Studio Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] text-xs focus:outline-hidden focus:border-[#232A5C] text-[#232A5C]"
                    >
                      <option value="Lagos">Lagos (Victoria Island / Lekki / Ikeja)</option>
                      <option value="Abuja">Abuja (Maitama / Wuse II / Garki)</option>
                      <option value="Port Harcourt">Port Harcourt</option>
                      <option value="Ibadan">Ibadan</option>
                      <option value="Enugu">Enugu</option>
                      <option value="London">London, UK</option>
                      <option value="Atlanta">Atlanta / USA</option>
                      <option value="Other">Other International</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Intended Plan Tier
                  </label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] text-xs font-semibold focus:outline-hidden focus:border-[#232A5C] text-[#232A5C]"
                  >
                    <option value="starter">Starter — ₦10,000 / mo (2 Staff, 30 Orders)</option>
                    <option value="studio">Studio — ₦25,000 / mo (5 Staff, 150 Orders)</option>
                    <option value="atelier">Atelier — ₦50,000 / mo (15 Staff, Unlimited)</option>
                  </select>
                </div>
              </div>

              {/* Password with Strength Indicator */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type={showOwnerPassword ? 'text' : 'password'}
                    required
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    placeholder="Create a strong password (min 8 chars)"
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] text-xs focus:outline-hidden focus:border-[#232A5C] focus:bg-white text-[#232A5C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                  >
                    {showOwnerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {ownerPassword && (
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${ownerStrength.color} transition-all duration-300`}
                        style={{ width: ownerStrength.width }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-stone-500">
                      {ownerStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Referral / Promo Code (AGT-2) */}
              <div className="p-3 rounded-2xl bg-[#FAF6F0] border border-[#E4DCD0] space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-[#E2573A]" />
                    <span>Agent Referral or Promo Code (Optional)</span>
                  </span>
                  <span className="text-[10px] text-stone-500">Code: AGT-21DAY-AMINA</span>
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Enter 6-digit agent code or promo..."
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E4DCD0] bg-white font-mono text-xs uppercase focus:outline-hidden focus:border-[#232A5C]"
                />

                {matchedAgent ? (
                  <div className="text-[11px] font-semibold text-[#3F7D5C] flex items-center gap-1 pt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      Valid agent code! 7 bonus days applied (21-Day Extended Free Trial).
                    </span>
                  </div>
                ) : referralCode.trim() ? (
                  <div className="text-[11px] text-stone-500">Standard 14-day trial applies.</div>
                ) : null}
              </div>

              {/* Legal Agreement Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-stone-600 leading-snug">
                  <input
                    type="checkbox"
                    required
                    checked={acceptedOwnerTerms}
                    onChange={(e) => setAcceptedOwnerTerms(e.target.checked)}
                    className="mt-0.5 rounded border-stone-300 text-[#232A5C] focus:ring-[#232A5C]"
                  />
                  <span>
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setLegalDocType('terms');
                        setIsLegalModalOpen(true);
                      }}
                      className="text-[#232A5C] font-bold underline hover:text-[#E2573A]"
                    >
                      Terms of Service (v1.2)
                    </button>
                    ,{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setLegalDocType('privacy');
                        setIsLegalModalOpen(true);
                      }}
                      className="text-[#232A5C] font-bold underline hover:text-[#E2573A]"
                    >
                      Privacy Policy (NDPA 2023)
                    </button>{' '}
                    and the Data Processing Agreement.
                  </span>
                </label>
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#E2573A] hover:bg-[#D0482B] text-white rounded-xl text-xs font-bold tracking-wide shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Continue to Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* =================== STAFF APPLICATION FORM =================== */
            <form onSubmit={handleStaffSubmit} className="space-y-3.5 text-xs">
              {/* Invitation Welcome Banner */}
              {isFromInvite && (
                <div className="p-3 bg-[#FAF6F0] border-2 border-[#232A5C]/20 rounded-xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#232A5C] text-[#C9A24B] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#232A5C]">Official Fashion Studio Invitation</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#3F7D5C]/15 text-[#3F7D5C]">
                        Instant Access
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                      You've been invited by <span className="font-semibold text-stone-800">{selectedStudio.ownerName}</span> to join <span className="font-semibold text-[#232A5C]">{selectedStudio.name}</span> as <span className="font-semibold text-[#E2573A]">{roleDescriptions[selectedRole]?.label || selectedRole}</span>. Set your password to activate your workspace immediately.
                    </p>
                  </div>
                </div>
              )}

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="e.g. Chidi Okafor"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] text-xs focus:outline-hidden focus:border-[#232A5C] focus:bg-white text-[#232A5C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      placeholder="+234 809 332 1199"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] text-xs focus:outline-hidden focus:border-[#232A5C] focus:bg-white text-[#232A5C]"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="chidi.cutter@tailorhub.ng"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] text-xs focus:outline-hidden focus:border-[#232A5C] focus:bg-white text-[#232A5C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type={showStaffPassword ? 'text' : 'password'}
                      required
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="Create your login password"
                      className="w-full pl-9 pr-9 py-2 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] text-xs focus:outline-hidden focus:border-[#232A5C] focus:bg-white text-[#232A5C]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffPassword(!showStaffPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                    >
                      {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {staffPassword && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 bg-stone-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${staffStrength.color} transition-all duration-300`}
                          style={{ width: staffStrength.width }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-stone-500">
                        {staffStrength.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Studio Selection */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  {isFromInvite ? 'Inviting Fashion Studio' : 'Select Fashion Studio to Join *'}
                </label>
                {isFromInvite ? (
                  <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#232A5C]/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#232A5C] text-white flex items-center justify-center font-bold text-xs">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#232A5C] flex items-center gap-1.5">
                          <span>{selectedStudio.name}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-semibold">Verified Fashion Studio</span>
                        </div>
                        <p className="text-[10px] text-stone-500">{selectedStudio.address} &bull; Owner: {selectedStudio.ownerName}</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                ) : (
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <select
                      value={selectedStudioId}
                      onChange={(e) => setSelectedStudioId(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] text-xs font-semibold focus:outline-hidden focus:border-[#232A5C] text-[#232A5C]"
                    >
                      {studios.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} &bull; {s.address} (Owner: {s.ownerName})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Requested Role Selection */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1.5">
                  {isFromInvite ? 'Assigned Workshop Role *' : `Select Your Role at ${selectedStudio.name} *`}
                </label>
                {isFromInvite ? (
                  <div className="p-3 rounded-xl border-2 border-[#232A5C] bg-[#232A5C]/5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#232A5C] text-white flex items-center justify-center shrink-0">
                      {React.createElement(roleDescriptions[selectedRole]?.icon || Briefcase, { className: 'w-4 h-4 text-[#C9A24B]' })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#232A5C]">{roleDescriptions[selectedRole]?.label}</span>
                        <span className="text-[10px] font-semibold text-[#3F7D5C] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Pre-assigned by Owner
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-600 mt-0.5 leading-snug">
                        {roleDescriptions[selectedRole]?.desc}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(Object.keys(roleDescriptions) as Array<keyof typeof roleDescriptions>).map((rKey) => {
                      const info = roleDescriptions[rKey];
                      const Icon = info.icon;
                      const isSelected = selectedRole === rKey;
                      return (
                        <div
                          key={rKey}
                          onClick={() => setSelectedRole(rKey as any)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#232A5C] bg-[#232A5C]/5 text-[#232A5C]'
                              : 'border-[#E4DCD0] bg-white text-stone-700 hover:border-stone-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold text-xs mb-1">
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#E2573A]' : 'text-stone-400'}`} />
                            <span>{info.label}</span>
                          </div>
                          <p className="text-[10px] text-stone-500 leading-tight">
                            {info.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Experience / Specialty Notes */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Specialty, Skills & Experience (Optional)
                </label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g. Master cutter with 7 years couture suits & agbada embroidery experience"
                  className="w-full px-3 py-2 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] text-xs focus:outline-hidden focus:border-[#232A5C] text-[#232A5C]"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-stone-600 leading-snug">
                  <input
                    type="checkbox"
                    required
                    checked={acceptedStaffTerms}
                    onChange={(e) => setAcceptedStaffTerms(e.target.checked)}
                    className="mt-0.5 rounded border-stone-300 text-[#232A5C] focus:ring-[#232A5C]"
                  />
                  <span>
                    I confirm my registration details are accurate and agree to abide by the studio’s
                    workshop policies and StrandEnd’s{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setLegalDocType('terms');
                        setIsLegalModalOpen(true);
                      }}
                      className="text-[#232A5C] font-bold underline hover:text-[#E2573A]"
                    >
                      Terms of Service
                    </button>
                    .
                  </span>
                </label>
              </div>

              {/* Submit Staff Application Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#232A5C] hover:bg-[#343D7B] text-white rounded-xl text-xs font-bold tracking-wide shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  {isFromInvite ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#C9A24B]" />
                      <span>Complete Registration & Access Workspace &rarr;</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 text-[#C9A24B]" />
                      <span>Submit Application for Studio Approval</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Legal Documents Modal */}
      <LegalTermsModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        defaultDoc={legalDocType}
      />
    </div>
  );
};
