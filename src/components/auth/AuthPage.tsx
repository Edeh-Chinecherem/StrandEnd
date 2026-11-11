import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../brand/Logo';
import { LegalTermsModal } from './LegalTermsModal';
import { OnboardingWizardModal } from './OnboardingWizardModal';
import { SignUpPage } from './SignUpPage';
import { VerificationPage } from './VerificationPage';
import { UserRole } from '../../types';
import {
  Sparkles,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  Building2,
  Gift,
  ArrowRight,
  UserCheck,
  Phone,
  Mail,
  Lock,
  AlertCircle,
} from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
  defaultMode?: 'signin' | 'signup' | 'verify' | 'agent';
  inviteData?: {
    token?: string;
    studioId?: string;
    role?: UserRole;
    name?: string;
    email?: string;
    phone?: string;
  };
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccess,
  defaultMode = 'signin',
  inviteData,
}) => {
  const {
    studios,
    switchStudio,
    switchRole,
    agents,
    createAgent,
    signIn,
    registerStudio,
    showToast,
  } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup' | 'verify' | 'agent'>(defaultMode);
  const [signInError, setSignInError] = useState<string | null>(null);

  const [pendingStudio, setPendingStudio] = useState<{
    studioName: string;
    ownerName: string;
    email: string;
    phone: string;
    city: string;
    plan: 'starter' | 'studio' | 'atelier';
    referralCode?: string;
  }>({
    studioName: 'Kari Couture Fashion Studio',
    ownerName: 'Kari Adeleke',
    email: 'kari@karicouture.ng',
    phone: '+234 802 881 9920',
    city: 'Lagos',
    plan: 'studio',
    referralCode: 'AGT-21DAY-AMINA',
  });

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  // Sign Up State (SAAS-1, LEGAL-1, AGT-2)
  const [newStudioName, setNewStudioName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+234 ');
  const [newPassword, setNewPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Agent Registration State (AGT-1)
  const [agentName, setAgentName] = useState('');
  const [agentPhone, setAgentPhone] = useState('+234 ');
  const [agentEmail, setAgentEmail] = useState('');
  const [bankName, setBankName] = useState('Guaranty Trust Bank (GTBank)');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [acceptedAgentTerms, setAcceptedAgentTerms] = useState(false);

  // Legal Modal
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalDocType, setLegalDocType] = useState<'terms' | 'agent' | 'privacy'>('terms');

  // Onboarding Wizard
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Check referral code validity (e.g. AML-902, TBK-441)
  const matchedAgent = agents.find(
    (a) => a.uniqueCode.toLowerCase() === referralCode.trim().toLowerCase()
  );

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    const res = signIn(signInEmail, signInPassword);
    if (res.success) {
      onSuccess();
    } else {
      setSignInError(res.message);
    }
  };

  const handleQuickDemoSignIn = (role: any, studioId: string) => {
    const demoEmail =
      role === 'owner'
        ? 'deola@ateliersagoe.ng'
        : role === 'manager'
        ? 'folake@ateliersagoe.ng'
        : role === 'production'
        ? 'emeka@ateliersagoe.ng'
        : role === 'dispatch'
        ? 'dispatch@ateliersagoe.ng'
        : role === 'front_desk'
        ? 'zainab@ateliersagoe.ng'
        : 'amina.agent@strandend.ng';

    const res = signIn(demoEmail);
    if (res.success) {
      onSuccess();
    } else {
      switchStudio(studioId);
      switchRole(role);
      onSuccess();
    }
  };

  const handleStudioSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert('Please accept the Terms & Conditions and Privacy Policy to create your studio account (LEGAL-1).');
      return;
    }

    showToast(
      'success',
      'Studio Workspace Created!',
      `Welcome ${newOwnerName || 'Designer'}! Launching your studio onboarding wizard.`
    );
    setIsOnboardingOpen(true);
  };

  const handleAgentSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedAgentTerms) {
      alert('Please accept Schedule A: Agent Terms and Code of Conduct to register as an Agent.');
      return;
    }

    const created = createAgent({
      name: agentName,
      phone: agentPhone,
      email: agentEmail,
      bankName,
      accountNumber,
      accountName: accountName || agentName,
    });

    switchRole('agent');
    showToast(
      'success',
      'Agent Registration Approved',
      `Welcome ${agentName}! Your unique referral link is ready: ${created.shareLink}`
    );
    onSuccess();
  };

  if (mode === 'signup') {
    return (
      <SignUpPage
        inviteData={inviteData}
        onStaffRegistered={onSuccess}
        onGoToSignIn={() => setMode('signin')}
        onSignUpComplete={(data) => {
          setPendingStudio(data);
          setMode('verify');
        }}
      />
    );
  }

  if (mode === 'verify') {
    return (
      <>
        <VerificationPage
          email={pendingStudio.email}
          phone={pendingStudio.phone}
          studioName={pendingStudio.studioName}
          onVerified={() => {
            registerStudio(pendingStudio);
            setIsOnboardingOpen(true);
          }}
          onBackToSignUp={() => setMode('signup')}
        />
        <OnboardingWizardModal
          isOpen={isOnboardingOpen}
          initialData={{
            studioName: pendingStudio.studioName,
            phone: pendingStudio.phone,
            city: pendingStudio.city,
            ownerName: pendingStudio.ownerName,
          }}
          onClose={() => {
            setIsOnboardingOpen(false);
            onSuccess();
          }}
          onComplete={() => {
            setIsOnboardingOpen(false);
            onSuccess();
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F2EA] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 select-none font-sans">
      <div className="max-w-4xl w-full mx-auto bg-white rounded-3xl border border-[#E4DCD0] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Brand Panel (Desktop) */}
        <div className="md:col-span-5 bg-[#232A5C] text-[#F7F2EA] p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle thread decorative curves */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full border border-white/5 pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <Logo variant="full" theme="dark" size="lg" showTagline={true} />

            <div className="pt-4">
              <h2 className="font-serif font-bold text-2xl text-white leading-tight">
                Where every thread finds its end.
              </h2>
              <p className="text-xs text-[#E2DAD0]/90 mt-2 leading-relaxed">
                The purpose-built workflow management system designed for African couture ateliers,
                bespoke tailors, and independent designers.
              </p>
            </div>

            {/* Value bullets */}
            <div className="space-y-3 pt-2 text-xs text-[#E2DAD0]">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#E2573A] text-white flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <span>10-Second Manager Delivery Overview</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#E2573A] text-white flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <span>Bespoke Measurement Archives & Job Sheets</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#E2573A] text-white flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <span>Automated WhatsApp Milestone Updates</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#C9A24B] text-black flex items-center justify-center font-bold text-[10px]">
                  ★
                </div>
                <span>12-Month Loyalty Free Month Program</span>
              </div>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="pt-8 border-t border-white/10 relative z-10 text-xs">
            <p className="italic text-[#E2DAD0]/90 leading-snug">
              “Before StrandEnd, delivery dates were promised on WhatsApp and forgotten. Now our tailors,
              cutters and clients are always aligned.”
            </p>
            <div className="mt-2 font-serif font-bold text-white">Deola Adeyemi</div>
            <div className="text-[10px] text-[#C9A24B]">Creative Director, Deola Sagoe Fashion Studio</div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          {/* Top Auth Mode Tabs */}
          <div className="flex rounded-xl bg-[#FAF6F0] p-1 border border-[#E4DCD0] text-xs font-semibold">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-[#232A5C] text-white shadow-xs'
                  : 'text-stone-600 hover:text-[#232A5C]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className="flex-1 py-2 rounded-lg transition-all text-stone-600 hover:text-[#232A5C]"
            >
              Sign Up
            </button>
            <button
              onClick={() => setMode('verify')}
              className="flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1 text-stone-600 hover:text-[#232A5C]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#3F7D5C]" />
              <span>Verify</span>
            </button>
            <button
              onClick={() => setMode('agent')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                mode === 'agent'
                  ? 'bg-[#232A5C] text-white shadow-xs'
                  : 'text-stone-600 hover:text-[#232A5C]'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-[#E2573A]" />
              <span>Become Agent</span>
            </button>
          </div>

          {/* TAB 1: Sign In */}
          {mode === 'signin' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h2 className="font-serif font-bold text-xl text-[#232A5C]">
                  Sign In to Your Studio
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Access your fashion studio pipeline, customer measurements, and orders.
                </p>
              </div>

              {signInError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">
                    {signInError}
                  </div>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-3.5 text-xs text-[#232A5C]">
                <div>
                  <label className="text-[11px] font-medium text-stone-700 block mb-1">
                    Email Address or Phone Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="Enter your email or phone number"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E4DCD0] text-xs focus:outline-hidden focus:border-[#232A5C]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-stone-700">Password</label>
                    <button
                      type="button"
                      onClick={() => alert('Password reset link sent to registered email.')}
                      className="text-[11px] text-[#E2573A] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-9 pr-9 py-2 rounded-lg border border-[#E4DCD0] text-xs focus:outline-hidden focus:border-[#232A5C]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="rounded border-stone-300 text-[#232A5C]"
                    />
                    <span className="text-[11px] text-stone-600">Remember this workshop device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#232A5C] hover:bg-[#343D7B] text-white rounded-xl font-semibold text-xs transition-colors shadow-xs"
                >
                  Sign In to Studio Workspace
                </button>
              </form>

              {/* Instant Demo Role Quick Login */}
              <div className="pt-3 border-t border-stone-100">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 block mb-2">
                  One-Tap Demo Switcher (Simulate Any PRD Role)
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    onClick={() => handleQuickDemoSignIn('owner', 'studio-1')}
                    className="p-2 rounded-lg bg-[#FAF6F0] hover:bg-[#F2EDE4] border border-[#E4DCD0] text-left text-[#232A5C]"
                  >
                    <strong>Deola Adeyemi</strong>
                    <span className="block text-[10px] text-stone-500">Studio Owner</span>
                  </button>
                  <button
                    onClick={() => handleQuickDemoSignIn('manager', 'studio-1')}
                    className="p-2 rounded-lg bg-[#FAF6F0] hover:bg-[#F2EDE4] border border-[#E4DCD0] text-left text-[#232A5C]"
                  >
                    <strong>Folake Adeleke</strong>
                    <span className="block text-[10px] text-stone-500">Studio Manager</span>
                  </button>
                  <button
                    onClick={() => handleQuickDemoSignIn('production', 'studio-1')}
                    className="p-2 rounded-lg bg-[#FAF6F0] hover:bg-[#F2EDE4] border border-[#E4DCD0] text-left text-[#232A5C]"
                  >
                    <strong>Emeka Nwosu</strong>
                    <span className="block text-[10px] text-stone-500">Master Cutter (No pricing)</span>
                  </button>
                  <button
                    onClick={() => handleQuickDemoSignIn('agent', 'studio-1')}
                    className="p-2 rounded-lg bg-[#FAF6F0] hover:bg-[#F2EDE4] border border-[#E4DCD0] text-left text-[#232A5C]"
                  >
                    <strong>Amina Lawal</strong>
                    <span className="block text-[10px] text-stone-500">Senior Agent (25%)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Agent Registration (AGT-1, Schedule A) */}
          {mode === 'agent' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif font-bold text-xl text-[#232A5C]">
                    Agent Referral Registration
                  </h2>
                  <span className="text-[10px] bg-[#FBF6EB] text-[#C9A24B] font-bold px-2 py-0.5 rounded-full border border-[#C9A24B]/30 uppercase">
                    20% - 25% Commission
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Earn recurring cash commissions paid in Naira for every fashion studio you refer (Section 17.1).
                </p>
              </div>

              <form onSubmit={handleAgentSignUp} className="space-y-3 text-xs text-[#232A5C]">
                <div>
                  <label className="text-[11px] font-medium text-stone-700 block mb-0.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="e.g. Babatunde Fashion Stylist"
                    required
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E4DCD0] text-xs focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-medium text-stone-700 block mb-0.5">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      value={agentPhone}
                      onChange={(e) => setAgentPhone(e.target.value)}
                      placeholder="+234 802 000 0000"
                      required
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E4DCD0] text-xs focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-stone-700 block mb-0.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={agentEmail}
                      onChange={(e) => setAgentEmail(e.target.value)}
                      placeholder="agent@network.ng"
                      required
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E4DCD0] text-xs focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Nigerian Bank Account Verification (AGT-1, AGT-6) */}
                <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#E4DCD0] space-y-2">
                  <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#232A5C]">
                    Commission Payout Bank Details (Paystack Transfers)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-stone-500 block mb-0.5">Bank Name</label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-md border border-[#E4DCD0] bg-white text-xs focus:outline-hidden"
                      >
                        <option value="Guaranty Trust Bank (GTBank)">GTBank</option>
                        <option value="Access Bank">Access Bank</option>
                        <option value="Zenith Bank">Zenith Bank</option>
                        <option value="First Bank of Nigeria">First Bank</option>
                        <option value="United Bank for Africa (UBA)">UBA</option>
                        <option value="Stanbic IBTC">Stanbic IBTC</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500 block mb-0.5">Account Number (10 Digits)</label>
                      <input
                        type="text"
                        maxLength={10}
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="0123456789"
                        required
                        className="w-full px-2 py-1.5 rounded-md border border-[#E4DCD0] bg-white font-mono text-xs focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Agent Terms Acceptance (LEGAL-1 Schedule A) */}
                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedAgentTerms}
                      onChange={(e) => setAcceptedAgentTerms(e.target.checked)}
                      required
                      className="mt-0.5 rounded border-stone-300 text-[#232A5C]"
                    />
                    <span className="text-[11px] text-stone-600 leading-tight">
                      I agree to{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setLegalDocType('agent');
                          setIsLegalModalOpen(true);
                        }}
                        className="text-[#232A5C] font-semibold underline"
                      >
                        Schedule A: Agent Terms
                      </button>
                      . I understand self-referral is prohibited and commissions vest 30 days after cleared studio payments.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#232A5C] hover:bg-[#343D7B] text-white rounded-xl font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 mt-2"
                >
                  <Sparkles className="w-4 h-4 text-[#C9A24B]" />
                  <span>Register & Generate My Referral Link</span>
                </button>
              </form>
            </div>
          )}

          {/* Bottom Security Seal */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#3F7D5C]" />
              <span>TLS 1.3 Encrypted & NDPA 2023 Compliant</span>
            </span>
            <button
              onClick={() => {
                setLegalDocType('terms');
                setIsLegalModalOpen(true);
              }}
              className="text-stone-400 hover:text-stone-700 underline"
            >
              Legal & Privacy
            </button>
          </div>
        </div>
      </div>

      {/* Legal Terms Modal */}
      <LegalTermsModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        defaultDoc={legalDocType}
      />

      {/* Studio Onboarding Wizard (SAAS-8) */}
      <OnboardingWizardModal
        isOpen={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
          onSuccess();
        }}
        onComplete={() => {
          setIsOnboardingOpen(false);
          onSuccess();
        }}
      />
    </div>
  );
};

