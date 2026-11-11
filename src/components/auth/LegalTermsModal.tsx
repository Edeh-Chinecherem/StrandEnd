import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Scale } from 'lucide-react';

interface LegalTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDoc?: 'terms' | 'agent' | 'privacy' | 'dpa';
}

export const LegalTermsModal: React.FC<LegalTermsModalProps> = ({
  isOpen,
  onClose,
  defaultDoc = 'terms',
}) => {
  const [activeDoc, setActiveDoc] = useState<'terms' | 'agent' | 'privacy' | 'dpa'>(defaultDoc);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E4DCD0] bg-[#FAF6F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#232A5C] text-white">
              <Scale className="w-5 h-5 text-[#C9A24B]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#232A5C]">
                StrandEnd Legal Documents & Compliance
              </h2>
              <p className="text-xs text-stone-500">
                PRD Section 18 • Version 1.2 • Governed under the Laws of the Federal Republic of Nigeria
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

        {/* Document Selector Tabs */}
        <div className="flex border-b border-[#E4DCD0] bg-white px-4 text-xs font-medium">
          <button
            onClick={() => setActiveDoc('terms')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeDoc === 'terms'
                ? 'border-[#232A5C] text-[#232A5C] font-bold'
                : 'border-transparent text-stone-500 hover:text-[#232A5C]'
            }`}
          >
            Terms & Conditions (v1.2)
          </button>
          <button
            onClick={() => setActiveDoc('agent')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeDoc === 'agent'
                ? 'border-[#232A5C] text-[#232A5C] font-bold'
                : 'border-transparent text-stone-500 hover:text-[#232A5C]'
            }`}
          >
            Schedule A: Agent Terms
          </button>
          <button
            onClick={() => setActiveDoc('privacy')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeDoc === 'privacy'
                ? 'border-[#232A5C] text-[#232A5C] font-bold'
                : 'border-transparent text-stone-500 hover:text-[#232A5C]'
            }`}
          >
            Privacy Policy (NDPA 2023)
          </button>
          <button
            onClick={() => setActiveDoc('dpa')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeDoc === 'dpa'
                ? 'border-[#232A5C] text-[#232A5C] font-bold'
                : 'border-transparent text-stone-500 hover:text-[#232A5C]'
            }`}
          >
            Data Processing Terms
          </button>
        </div>

        {/* Document Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-stone-700 space-y-4 leading-relaxed font-sans">
          {activeDoc === 'terms' && (
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-sm text-[#232A5C]">
                1. StrandEnd Studio Subscription Terms and Conditions
              </h3>
              <p>
                <strong>Last Updated:</strong> 8 November 2026 • <strong>Applicable To:</strong> Studio Owners,
                Managers, and Workshop Staff.
              </p>
              <h4 className="font-bold text-[#232A5C] pt-2">1.1 Subscription & Tenant Isolation</h4>
              <p>
                StrandEnd provides a multi-tenant software-as-a-service application designed for bespoke fashion
                designers, tailors, and ateliers. Each subscriber operates an isolated workspace. No studio can
                access, inspect, or query another studio's client data, measurements, orders, or financials.
              </p>
              <h4 className="font-bold text-[#232A5C] pt-2">1.2 Pricing & Billing in Naira</h4>
              <p>
                Subscription fees are charged in Nigerian Naira (₦) through Paystack. Current tier pricing: Starter
                (₦10,000/mo), Studio (₦25,000/mo), and Atelier (₦50,000/mo). Annual plans are charged at 11 times
                the monthly price (providing 1 free month).
              </p>
              <h4 className="font-bold text-[#232A5C] pt-2">1.3 12-Month Loyalty Free Month</h4>
              <p>
                Studios maintaining continuous paid subscription tenure for twelve (12) consecutive billing months
                earn one (1) free subscription month, applied on the 13th invoice. Stacks with annual plans.
              </p>
              <h4 className="font-bold text-[#232A5C] pt-2">1.4 Failed Payment Grace Period</h4>
              <p>
                If recurring card billing fails, a 7-day grace period is provided with automatic retries. If unpaid
                after 7 days, the studio enters read-only mode. Studio measurements and records are never deleted.
              </p>
            </div>
          )}

          {activeDoc === 'agent' && (
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-sm text-[#232A5C]">
                Schedule A: Agent Referral Program Terms
              </h3>
              <p>
                <strong>Applicable To:</strong> Independent Agents and Promoters registered under Section 17.1.
              </p>
              <h4 className="font-bold text-[#232A5C] pt-2">2.1 Relationship & Independence</h4>
              <p>
                An Agent is an independent promoter and is not an employee, partner, or agent of StrandEnd. Agents
                have no authority to bind StrandEnd and have no access to studio orders, client profiles, or
                measurements.
              </p>
              <h4 className="font-bold text-[#232A5C] pt-2">2.2 Commission Structure & Vesting</h4>
              <p>
                Standard Agents earn 20% of net subscription revenue received for the first six (6) paid billing
                months of each referred studio (or 10% once on annual plans). Senior Agents (agents with 10+
                concurrent paying referred studios) earn 25% (or 12.5% on annuals).
              </p>
              <p>
                Commissions vest thirty (30) days following cleared payment without refund or chargeback.
              </p>
              <h4 className="font-bold text-[#232A5C] pt-2">2.3 Payouts & Threshold</h4>
              <p>
                Vested commissions are paid on the 15th of each month by direct bank transfer to verified Nigerian
                bank accounts. Minimum payout threshold is ₦20,000; smaller balances carry forward.
              </p>
              <h4 className="font-bold text-[#232A5C] pt-2">2.4 Anti-Fraud & Self-Referral Prohibition</h4>
              <p>
                Self-referral, bidding on StrandEnd trademarks, deceptive advertising, and spam are strictly prohibited
                and result in immediate forfeiture of unpaid commissions and account termination.
              </p>
            </div>
          )}

          {activeDoc === 'privacy' && (
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-sm text-[#232A5C]">
                3. Privacy Policy & Nigeria Data Protection Act (NDPA 2023)
              </h3>
              <p>
                StrandEnd complies fully with the Nigeria Data Protection Act (2023). We process client names, phone
                numbers, and body measurements solely on behalf of subscribing studios.
              </p>
              <h4 className="font-bold text-[#232A5C] pt-2">3.1 Customer Consent for WhatsApp Notifications</h4>
              <p>
                Under Section 4.5 (NOT-3), milestone notifications are transmitted to studio clients via the
                WhatsApp Business Platform. Messages are dispatched only where the studio records affirmative client
                consent. Clients who opt out receive no further automated messages.
              </p>
              <h4 className="font-bold text-[#232A5C] pt-2">3.2 Data Export & Deletion</h4>
              <p>
                Studios maintain absolute ownership of their client lists and measurement archives. Studio owners
                may export all records via CSV or request complete tenant deletion at any time.
              </p>
            </div>
          )}

          {activeDoc === 'dpa' && (
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-sm text-[#232A5C]">
                4. Data Processing Agreement (DPA)
              </h3>
              <p>
                This agreement governs the processing of personal data entered into StrandEnd by fashion studios.
                The Studio acts as Data Controller, and StrandEnd acts as Data Processor.
              </p>
              <p>
                Data is encrypted in transit via TLS 1.3 and encrypted at rest with daily automated backups.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E4DCD0] bg-[#FAF6F0] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#232A5C] text-white font-semibold text-xs hover:bg-[#343D7B] transition-colors"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};

