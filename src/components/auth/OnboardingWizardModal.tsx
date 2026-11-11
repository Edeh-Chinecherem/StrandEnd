import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, StaffInvitation } from '../../types';
import {
  Sparkles,
  Building2,
  Sliders,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
  Trash2,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Phone,
  Mail,
  Scissors,
  Briefcase,
  HelpCircle,
  Truck,
  Lock,
} from 'lucide-react';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  initialData?: {
    studioName?: string;
    phone?: string;
    city?: string;
    ownerName?: string;
    specialty?: string;
  };
  onOpenStaffRegistration?: (inv: StaffInvitation) => void;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialData,
  onOpenStaffRegistration,
}) => {
  const {
    currentStudio,
    updateStudio,
    showToast,
    staffInvitations,
    createStaffInvitation,
    cancelStaffInvitation,
    activeStaffCount,
    staffLimitForStudio,
  } = useApp();

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Studio Details
  const [studioName, setStudioName] = useState(initialData?.studioName || currentStudio.name || '');
  const [studioCity, setStudioCity] = useState(initialData?.city || 'Lagos');
  const [studioPhone, setStudioPhone] = useState(initialData?.phone || currentStudio.phone || '+234 800 000 0000');
  const [studioTagline, setStudioTagline] = useState(
    currentStudio.tagline || 'Bespoke tailoring and luxury bridal fashion studio'
  );

  // Automatically populate registered information into the inputs whenever modal opens or initialData/currentStudio updates
  React.useEffect(() => {
    if (isOpen) {
      const name = initialData?.studioName || currentStudio?.name || '';
      const phone = initialData?.phone || currentStudio?.phone || '';
      const rawCity = initialData?.city || currentStudio?.address || 'Lagos';
      const matchedCity = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'London', 'Other'].find((c) =>
        rawCity.toLowerCase().includes(c.toLowerCase())
      ) || 'Lagos';

      setStudioName(name);
      setStudioPhone(phone);
      setStudioCity(matchedCity);

      if (initialData?.specialty) {
        setStudioTagline(initialData.specialty);
      } else if (currentStudio?.tagline && !currentStudio.tagline.includes('atelier')) {
        setStudioTagline(currentStudio.tagline);
      } else if (name) {
        setStudioTagline(`${name} — Bespoke couture, tailoring & luxury fashion.`);
      }
    }
  }, [isOpen, initialData, currentStudio]);

  // Step 2: Delivery Rules
  const [deliveryCalculation, setDeliveryCalculation] = useState<'calendar' | 'working'>('calendar');
  const [depositRequiredForProduction, setDepositRequiredForProduction] = useState(true);

  // Step 3: Staff invites
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('production');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('+234 ');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const currentStudioInvites = staffInvitations.filter(
    (inv) => inv.studioId === currentStudio.id
  );
  const activeCount = activeStaffCount(currentStudio.id);
  const limit = staffLimitForStudio(currentStudio.id);
  const pendingCount = currentStudioInvites.filter((inv) => inv.status === 'pending').length;

  if (!isOpen) return null;

  const getInviteUrl = (inv: StaffInvitation) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?inviteToken=${inv.inviteToken}&studioId=${inv.studioId}&role=${inv.role}&email=${encodeURIComponent(
      inv.email
    )}&name=${encodeURIComponent(inv.name)}`;
  };

  const handleAddStaff = () => {
    if (!newStaffName.trim()) {
      showToast('error', 'Staff Name Required', 'Please provide a name for the staff member.');
      return;
    }
    const cleanEmail =
      newStaffEmail.trim() ||
      `${newStaffName.trim().toLowerCase().replace(/\s+/g, '.')}@${currentStudio.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')}.ng`;

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
    }
  };

  const handleCopyInviteLink = (inv: StaffInvitation) => {
    const url = getInviteUrl(inv);
    navigator.clipboard.writeText(url);
    setCopiedToken(inv.inviteToken);
    showToast(
      'success',
      'Invitation Link Copied!',
      `Link copied for ${inv.name} (${inv.role.replace('_', ' ').toUpperCase()}).`
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

  const handleCopyAllInvites = () => {
    if (currentStudioInvites.length === 0) return;
    const header = `*${currentStudio.name} - Team Workspace Invitations on StrandEnd*\n`;
    const links = currentStudioInvites
      .map(
        (inv, idx) =>
          `${idx + 1}. *${inv.name}* (${inv.role.replace('_', ' ').toUpperCase()}):\n${getInviteUrl(inv)}`
      )
      .join('\n\n');
    const fullText = `${header}\n${links}\n\nPlease click your link to set your password and access your assigned fashion studio workspace!`;
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    showToast('success', 'All Invite Links Copied!', 'Paste in your team WhatsApp group chat.');
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleTestRegister = (inv: StaffInvitation) => {
    onClose();
    if (onOpenStaffRegistration) {
      onOpenStaffRegistration(inv);
    } else {
      window.location.href = getInviteUrl(inv);
    }
  };

  const handleFinish = () => {
    updateStudio({
      name: studioName,
      phone: studioPhone,
      address: `${studioCity}, Nigeria`,
      tagline: studioTagline,
    });
    showToast(
      'success',
      'Studio Profile Saved!',
      `Welcome to StrandEnd! Your workspace "${studioName}" is now fully configured.`
    );
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E4DCD0] bg-[#FAF6F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#232A5C] text-white">
              <Sparkles className="w-5 h-5 text-[#E2573A]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#232A5C]">
                Studio Profile & Workshop Setup
              </h2>
              <p className="text-xs text-stone-500">
                Step {currentStep} of 4 • Set up your fashion studio workflow in under 2 minutes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#E4DCD0] hover:bg-stone-100 text-stone-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-5 py-3 bg-[#ECE5DA] border-b border-[#E4DCD0] flex items-center justify-between text-xs font-serif font-bold text-[#232A5C]">
          <span className={currentStep >= 1 ? 'text-[#E2573A]' : 'opacity-40'}>
            1. Studio Profile
          </span>
          <span>&rarr;</span>
          <span className={currentStep >= 2 ? 'text-[#E2573A]' : 'opacity-40'}>
            2. Delivery Rules
          </span>
          <span>&rarr;</span>
          <span className={currentStep >= 3 ? 'text-[#E2573A]' : 'opacity-40'}>
            3. Workshop Team
          </span>
          <span>&rarr;</span>
          <span className={currentStep >= 4 ? 'text-[#3F7D5C]' : 'opacity-40'}>
            4. Ready!
          </span>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-[#232A5C] space-y-4">
          {/* STEP 1: Studio Profile */}
          {currentStep === 1 && (
            <div className="space-y-3.5">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#232A5C]">
                  Tell us about your fashion studio
                </h3>
                <p className="text-stone-500 text-[11px]">
                  This appears on your workshop cutting tickets, client receipts, and public tracking link.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-medium text-stone-700 block mb-1">
                  Fashion Studio / Brand Name *
                </label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  placeholder="e.g. Alara Bespoke Haute Couture"
                  className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] text-xs focus:outline-hidden focus:border-[#232A5C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-stone-700 block mb-1">City / Base</label>
                  <select
                    value={studioCity}
                    onChange={(e) => setStudioCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] text-xs focus:outline-hidden"
                  >
                    <option value="Lagos">Lagos (VI, Ikoyi, Lekki)</option>
                    <option value="Abuja">Abuja (Maitama, Wuse)</option>
                    <option value="Port Harcourt">Port Harcourt</option>
                    <option value="Ibadan">Ibadan</option>
                    <option value="London">London (UK Fashion Studio)</option>
                    <option value="Other">Other International</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-stone-700 block mb-1">Studio Phone *</label>
                  <input
                    type="text"
                    value={studioPhone}
                    onChange={(e) => setStudioPhone(e.target.value)}
                    placeholder="+234 803 000 0000"
                    className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-stone-700 block mb-1">Studio Specialty</label>
                <input
                  type="text"
                  value={studioTagline}
                  onChange={(e) => setStudioTagline(e.target.value)}
                  placeholder="e.g. Traditional Agbada, Modern Corsetry, Ready-to-Wear"
                  className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] text-xs focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Rules & Guardrails */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#232A5C]">
                  Delivery Rules & Workshop Guardrails (Section 3 & 4.4)
                </h3>
                <p className="text-stone-500 text-[11px]">
                  Configure how days to delivery countdowns and workshop stage blocks operate.
                </p>
              </div>

              <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E4DCD0] space-y-3">
                <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#232A5C]">
                  Delivery Countdown Calculation
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryCalculation('calendar')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      deliveryCalculation === 'calendar'
                        ? 'bg-white border-[#232A5C] ring-2 ring-[#232A5C]/20 font-bold'
                        : 'border-stone-200 hover:bg-white'
                    }`}
                  >
                    <div className="text-xs text-[#232A5C]">Calendar Days (Default)</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      Counts all 7 days of the week, including weekends.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryCalculation('working')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      deliveryCalculation === 'working'
                        ? 'bg-white border-[#232A5C] ring-2 ring-[#232A5C]/20 font-bold'
                        : 'border-stone-200 hover:bg-white'
                    }`}
                  >
                    <div className="text-xs text-[#232A5C]">Working Days Only</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      Excludes Sundays or designated workshop rest days.
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E4DCD0] space-y-2">
                <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#232A5C]">
                  Production Deposit Guardrail
                </span>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={depositRequiredForProduction}
                    onChange={(e) => setDepositRequiredForProduction(e.target.checked)}
                    className="mt-0.5 rounded border-stone-300 text-[#232A5C]"
                  />
                  <div>
                    <span className="font-semibold text-xs text-[#232A5C]">
                      Require confirmed deposit before entering Sewing / Production
                    </span>
                    <p className="text-[11px] text-stone-500">
                      Prevents workshop tailors from cutting or assembling garments before the client pays.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: Workshop Team */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#232A5C]">
                    Invite Your Workshop Team
                  </h3>
                  <p className="text-stone-500 text-[11px]">
                    Each staff member receives a unique invitation link to register and access their designated role interface.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold border border-stone-200">
                    Seats: {activeCount + pendingCount}/{limit} ({currentStudio.plan.toUpperCase()})
                  </span>
                </div>
              </div>

              {/* Add Staff Row */}
              <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E4DCD0] space-y-3">
                <div className="text-[11px] font-bold text-[#232A5C] uppercase tracking-wider flex items-center justify-between">
                  <span>Add New Team Member</span>
                  <span className="text-stone-400 font-normal">Role-Based Access Control</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-semibold text-stone-600 block mb-0.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      placeholder="e.g. Emeka Nwosu (Cutter)"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden focus:border-[#232A5C]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-stone-600 block mb-0.5">
                      Assigned Workshop Role *
                    </label>
                    <select
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value as UserRole)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E4DCD0] bg-white text-xs font-semibold focus:outline-hidden"
                    >
                      <option value="production">Production Staff (Cutter / Tailor / Finisher)</option>
                      <option value="manager">Studio Operations Manager</option>
                      <option value="front_desk">Front Desk / Sales Assistant</option>
                      <option value="dispatch">Dispatch & Logistics Officer</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-stone-600 block mb-0.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      placeholder="e.g. emeka@youratelier.ng"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-stone-600 block mb-0.5">
                      WhatsApp Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={newStaffPhone}
                      onChange={(e) => setNewStaffPhone(e.target.value)}
                      placeholder="+234 803 000 0000"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddStaff}
                    className="px-4 py-2 rounded-xl bg-[#232A5C] text-white font-semibold text-xs hover:bg-[#E2573A] transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C9A24B]" />
                    <span>Generate Staff Invite Link</span>
                  </button>
                </div>
              </div>

              {/* Staff List & Copyable Links */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#232A5C]">
                    Staff Invitations ({currentStudioInvites.length})
                  </span>
                  {currentStudioInvites.length > 0 && (
                    <button
                      type="button"
                      onClick={handleCopyAllInvites}
                      className="text-xs text-[#E2573A] font-semibold hover:underline flex items-center gap-1"
                    >
                      {copiedAll ? <Check className="w-3 h-3 text-[#3F7D5C]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedAll ? 'All Copied!' : 'Copy All Links for WhatsApp'}</span>
                    </button>
                  )}
                </div>

                {currentStudioInvites.length === 0 ? (
                  <div className="p-6 text-center text-stone-400 bg-stone-50 rounded-xl border border-stone-200">
                    No team members invited yet. Add your tailors, cutters, and managers above to generate their unique registration links.
                  </div>
                ) : (
                  currentStudioInvites.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3.5 rounded-xl border border-[#E4DCD0] bg-white space-y-2 shadow-2xs hover:border-[#232A5C]/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#232A5C]">{inv.name}</span>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                inv.role === 'production'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : inv.role === 'manager'
                                  ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                  : inv.role === 'front_desk'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-blue-50 text-blue-800 border border-blue-200'
                              }`}
                            >
                              {inv.role.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-3">
                            <span>{inv.email}</span>
                            {inv.phone && inv.phone !== '+234 ' && (
                              <span>&bull; {inv.phone}</span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => cancelStaffInvitation(inv.id)}
                          className="text-stone-300 hover:text-rose-600 p-1 rounded transition-colors"
                          title="Revoke invitation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Action Pills */}
                      <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[10px] text-stone-500 flex items-center gap-1 font-mono">
                          <Lock className="w-2.5 h-2.5 text-[#3F7D5C]" />
                          <span>Pre-approved for {inv.role.replace('_', ' ').toUpperCase()}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyInviteLink(inv)}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                          >
                            {copiedToken === inv.inviteToken ? (
                              <>
                                <Check className="w-3 h-3 text-[#3F7D5C]" />
                                <span className="text-[#3F7D5C]">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-stone-500" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleWhatsAppShare(inv)}
                            className="px-2.5 py-1 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-semibold text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTestRegister(inv)}
                            className="px-2.5 py-1 rounded-lg bg-[#232A5C] hover:bg-[#343D7B] text-white font-semibold text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
                            title="Test the staff registration experience directly"
                          >
                            <span>Register &rarr;</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Ready to Launch */}
          {currentStep === 4 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#EDF5F0] text-[#3F7D5C] flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-[#232A5C]">
                  Your Studio Workspace is Ready!
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto mt-1 leading-relaxed">
                  We've configured <strong>{studioName}</strong> with all 12 default order lifecycle stages,
                  automated WhatsApp milestone templates, and preloaded sample client fitting records.
                </p>
              </div>

              {/* Team Invites Summary */}
              {currentStudioInvites.length > 0 && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-left max-w-md mx-auto text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-700" />
                      <span>{currentStudioInvites.length} Staff Invitation(s) Generated</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAllInvites}
                      className="text-[11px] text-[#E2573A] font-bold hover:underline flex items-center gap-1"
                    >
                      {copiedAll ? <Check className="w-3 h-3 text-[#3F7D5C]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedAll ? 'Copied!' : 'Copy Links'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Each invited staff member can register with their unique link and immediately access their designated role interface.
                  </p>
                </div>
              )}

              <div className="p-4 bg-[#FAF6F0] border border-[#E4DCD0] rounded-xl text-left max-w-md mx-auto text-xs space-y-2">
                <div className="font-bold text-[#232A5C]">Next recommended actions:</div>
                <div className="flex items-center gap-2 text-stone-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E2573A]" />
                  <span>Send invitation links to your tailors and workshop manager</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E2573A]" />
                  <span>Log your first client enquiry in under 30 seconds</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E2573A]" />
                  <span>Print a workshop cutting ticket to test your workshop clipboard layout</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Navigation Buttons */}
        <div className="p-4 border-t border-[#E4DCD0] bg-[#FAF6F0] flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 rounded-xl border border-[#E4DCD0] text-stone-700 font-semibold text-xs flex items-center gap-1 hover:bg-stone-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-5 py-2 rounded-xl bg-[#232A5C] text-white font-semibold text-xs flex items-center gap-1 hover:bg-[#E2573A] transition-colors shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2 rounded-xl bg-[#E2573A] text-white font-semibold text-xs flex items-center gap-1 hover:bg-[#D0482B] transition-colors shadow-xs"
            >
              <span>Enter Studio Dashboard &rarr;</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

