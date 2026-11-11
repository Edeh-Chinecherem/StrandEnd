import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../brand/Logo';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  ArrowRight,
  RotateCcw,
  MessageCircle,
  AlertCircle,
  Building2,
  Lock,
} from 'lucide-react';

interface VerificationPageProps {
  email?: string;
  phone?: string;
  studioName?: string;
  onVerified: () => void;
  onBackToSignUp?: () => void;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({
  email = 'designer@fashionstudio.ng',
  phone = '+234 803 123 4567',
  studioName = 'New Fashion Studio',
  onVerified,
  onBackToSignUp,
}) => {
  const { showToast } = useApp();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [countdown, setCountdown] = useState(55);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    setErrorMsg('');
    const newOtp = [...otp];

    if (value.length > 1) {
      // Handle paste of multiple digits
      const pastedDigits = value.slice(0, 6).split('');
      pastedDigits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      if (pastedDigits.length === 6) {
        verifyCode(newOtp.join(''));
      }
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next box if filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits entered
    if (newOtp.every((digit) => digit !== '')) {
      verifyCode(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
      verifyCode(pasted);
    }
  };

  const verifyCode = (code: string) => {
    setIsVerifying(true);
    setErrorMsg('');

    // Simulate verification delay
    setTimeout(() => {
      setIsVerifying(false);
      // For demo, accept any 6-digit code or specific demo code
      if (code.length === 6) {
        setIsSuccess(true);
        showToast('success', 'Verification Successful', 'Studio identity and phone verified via WhatsApp.');
        setTimeout(() => {
          onVerified();
        }, 1200);
      } else {
        setErrorMsg('Invalid 6-digit verification code. Please check and try again.');
      }
    }, 600);
  };

  const handleResend = (channel: 'whatsapp' | 'sms' | 'email') => {
    setActiveChannel(channel);
    setCountdown(60);
    setCanResend(false);
    setErrorMsg('');
    showToast(
      'info',
      'Security Code Resent',
      `A new 6-digit OTP has been sent via ${channel === 'whatsapp' ? 'WhatsApp' : channel.toUpperCase()}.`
    );
  };

  const handleAutoFillDemo = () => {
    const demoCode = ['8', '3', '9', '2', '1', '0'];
    setOtp(demoCode);
    verifyCode('839210');
  };

  // Mask email and phone for security
  const maskedEmail = email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '***' + c);
  const maskedPhone = phone.replace(/^(\+234\s?\d{3})(.*)(\d{3})$/, (_, a, b, c) => a + ' *** ' + c);

  return (
    <div className="min-h-screen bg-[#F7F2EA] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 select-none font-sans">
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-[#E4DCD0] shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <Logo variant="stitch" theme="light" size="md" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] border border-[#E4DCD0] text-[11px] font-bold uppercase tracking-wider text-[#232A5C]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3F7D5C]" />
            <span>Studio Identity Verification</span>
          </div>
          <h1 className="font-serif font-black text-2xl text-[#232A5C] tracking-tight">
            Verify Your Fashion Studio
          </h1>
          <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
            We sent a 6-digit confirmation code to verify your phone number and email for{' '}
            <strong className="text-[#232A5C]">{studioName}</strong>.
          </p>
        </div>

        {/* Verification Destination Card */}
        <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E4DCD0] space-y-2 text-xs">
          <div className="flex items-center justify-between text-stone-600">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#3F7D5C]" />
              <span>WhatsApp / SMS:</span>
            </div>
            <strong className="font-mono text-[#232A5C]">{maskedPhone}</strong>
          </div>
          <div className="flex items-center justify-between text-stone-600 pt-1 border-t border-stone-200/60">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#232A5C]" />
              <span>Business Email:</span>
            </div>
            <strong className="text-[#232A5C]">{maskedEmail}</strong>
          </div>
        </div>

        {/* 6-Digit OTP Inputs */}
        <div className="space-y-4">
          <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isVerifying || isSuccess}
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono font-black text-xl rounded-xl border-2 transition-all focus:outline-hidden ${
                  digit
                    ? 'border-[#232A5C] bg-white text-[#232A5C] shadow-xs'
                    : 'border-[#E4DCD0] bg-[#FAF6F0] text-stone-800 focus:border-[#232A5C] focus:bg-white'
                } ${isSuccess ? 'border-[#3F7D5C] bg-[#EDF5F0] text-[#3F7D5C]' : ''}`}
              />
            ))}
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-center gap-1.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-xl bg-[#EDF5F0] border border-[#3F7D5C]/30 text-[#3F7D5C] text-xs font-bold flex items-center justify-center gap-2 animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-5 h-5 text-[#3F7D5C]" />
              <span>Identity Verified! Redirecting to Workspace...</span>
            </div>
          )}
        </div>

        {/* Resend Controls */}
        <div className="space-y-3 pt-2 text-center text-xs">
          <div className="text-stone-500">
            {canResend ? (
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleResend('whatsapp')}
                  className="font-semibold text-[#3F7D5C] hover:underline flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Resend WhatsApp</span>
                </button>
                <span className="text-stone-300">•</span>
                <button
                  type="button"
                  onClick={() => handleResend('email')}
                  className="font-semibold text-[#232A5C] hover:underline flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Resend Email</span>
                </button>
              </div>
            ) : (
              <span className="text-stone-400">
                Resend code in <strong className="text-stone-700 font-mono">{countdown}s</strong>
              </span>
            )}
          </div>

          {/* Demo 1-Click Autofill Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleAutoFillDemo}
              className="px-3 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#232A5C] text-stone-600 hover:text-white border border-[#E4DCD0] text-[11px] font-semibold transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3 h-3 text-[#C9A24B]" />
              <span>Demo Quick-Verify (Code: 839210)</span>
            </button>
          </div>
        </div>

        {/* NDPA & WhatsApp Business Compliance Notice (PRD Section 18) */}
        <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E4DCD0] text-[11px] text-stone-500 leading-relaxed">
          <div className="flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-[#C9A24B] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#232A5C] font-serif">Why verify?</strong> In accordance with the Nigeria Data Protection Act (NDPA 2023) and Meta WhatsApp Business Platform policies, verified studio credentials guarantee encrypted client order delivery notifications.
            </div>
          </div>
        </div>

        {/* Back Link */}
        {onBackToSignUp && (
          <div className="text-center pt-2">
            <button
              onClick={onBackToSignUp}
              className="text-xs text-stone-500 hover:text-[#232A5C] font-semibold"
            >
              &larr; Change Email or Phone Number
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
