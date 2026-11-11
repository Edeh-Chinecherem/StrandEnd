import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlanTier } from '../../types';
import { formatNaira } from '../../utils/formatters';
import { LoyaltyTracker } from './LoyaltyTracker';
import {
  Check,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Zap,
  Building2,
  FileCheck,
  HelpCircle,
} from 'lucide-react';

export const SubscriptionPage: React.FC = () => {
  const { currentStudio, updateStudio, showToast } = useApp();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(
    currentStudio.billingCycle || 'monthly'
  );

  const plans: {
    tier: PlanTier;
    name: string;
    tagline: string;
    monthlyPrice: number;
    annualPrice: number;
    foundingAnnualPrice: number;
    seats: number;
    activeOrders: string;
    customers: string;
    features: string[];
    isPopular?: boolean;
  }[] = [
    {
      tier: 'starter',
      name: 'Starter',
      tagline: 'For independent solo designers and bespoke artisans.',
      monthlyPrice: 10000,
      annualPrice: 110000,
      foundingAnnualPrice: 99000,
      seats: 2,
      activeOrders: '30 active orders',
      customers: '200 customer profiles',
      features: [
        'Days-to-delivery countdown badges',
        'Sortable & filterable orders table',
        'Customer measurement records',
        'Workshop cutting tickets & job sheets',
        'Paystack & local card checkout',
        'Email & help centre support',
      ],
    },
    {
      tier: 'studio',
      name: 'Studio',
      tagline: 'The recommended plan for growing fashion houses & ateliers.',
      monthlyPrice: 25000,
      annualPrice: 275000,
      foundingAnnualPrice: 247500,
      seats: 5,
      activeOrders: '150 active orders',
      customers: '1,500 customer profiles',
      features: [
        'Everything in Starter, plus:',
        '12-Stage Visual Pipeline Kanban',
        'Delivery deadlines calendar view',
        'Daily morning summary email digest',
        'Client live tracking link (no login needed)',
        'Payment receipts & printable invoices',
        'Standard email support',
      ],
      isPopular: true,
    },
    {
      tier: 'atelier',
      name: 'Atelier',
      tagline: 'For luxury couture houses, high-volume tailors and established brands.',
      monthlyPrice: 50000,
      annualPrice: 550000,
      foundingAnnualPrice: 495000,
      seats: 15,
      activeOrders: 'Unlimited active orders',
      customers: 'Unlimited customer profiles',
      features: [
        'Everything in Studio, plus:',
        'Automated WhatsApp milestone notifications',
        'At-risk stage delay alerts',
        'Studio custom branding on client trackers & job sheets',
        'Full operational & revenue analytics',
        'Multi-garment order templates',
        'Priority studio support',
      ],
    },
  ];

  const handleSelectPlan = (tier: PlanTier) => {
    updateStudio({ plan: tier, billingCycle });
    showToast(
      'success',
      'Plan Updated via Paystack',
      `Workspace is now subscribed to the ${tier.toUpperCase()} plan (${billingCycle}).`
    );
  };

  const handleToggleFounding = () => {
    updateStudio({ isFoundingDesigner: !currentStudio.isFoundingDesigner });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Founding-Designer Banner (PRD Section 9.1 & 17) */}
      <div className="bg-gradient-to-r from-[#232A5C] to-[#363E75] text-[#F7F2EA] p-4 sm:p-5 rounded-2xl border border-[#C9A24B]/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#C9A24B] text-black shrink-0">
            <Sparkles className="w-5 h-5 text-[#232A5C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base text-white">
                Founding Designer Lifetime Offer
              </span>
              <span className="text-[10px] bg-[#E2573A] text-white font-bold px-2 py-0.5 rounded-full uppercase">
                First 50 Studios Only
              </span>
            </div>
            <p className="text-xs text-[#E2DAD0] mt-1 leading-relaxed max-w-xl">
              Receive <strong>10% off annual subscriptions for life</strong>. Stacks with the annual plan discount
              (1 month free) plus the 12-month Loyalty Free Month!
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleFounding}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            currentStudio.isFoundingDesigner
              ? 'bg-[#C9A24B] text-[#232A5C] font-bold shadow-xs'
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
          }`}
        >
          {currentStudio.isFoundingDesigner ? '✓ Founding Designer Active' : 'Claim Founding Offer'}
        </button>
      </div>

      {/* Loyalty Free Month Progress Tracker (LOY-1, LOY-2, LOY-3) */}
      <LoyaltyTracker />

      {/* Billing Cycle Switcher */}
      <div className="flex flex-col items-center justify-center space-y-2 pt-2">
        <div className="inline-flex items-center bg-[#ECE5DA] p-1 rounded-xl border border-[#E0D7CA]">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-[#232A5C] text-white shadow-xs'
                : 'text-stone-600 hover:text-[#232A5C]'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              billingCycle === 'annual'
                ? 'bg-[#232A5C] text-white shadow-xs'
                : 'text-stone-600 hover:text-[#232A5C]'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] bg-[#C9A24B] text-black font-bold px-1.5 py-0.2 rounded-full">
              1 Month Free
            </span>
          </button>
        </div>
        <p className="text-[11px] text-stone-500">
          All subscriptions charged in Naira via Paystack. Cards, Bank Transfers and USSD supported.
        </p>
      </div>

      {/* Pricing Tiers Grid (PRD Section 9.1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((p) => {
          const isCurrent = currentStudio.plan === p.tier && currentStudio.billingCycle === billingCycle;
          const displayPrice =
            billingCycle === 'monthly'
              ? p.monthlyPrice
              : currentStudio.isFoundingDesigner
              ? p.foundingAnnualPrice
              : p.annualPrice;

          return (
            <div
              key={p.tier}
              className={`rounded-2xl p-6 border transition-all flex flex-col justify-between relative bg-white ${
                p.isPopular
                  ? 'border-[#232A5C] ring-2 ring-[#232A5C]/20 shadow-lg'
                  : 'border-[#E4DCD0] shadow-2xs hover:border-[#232A5C]/30'
              }`}
            >
              {p.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#232A5C] text-[#F7F2EA] text-[10px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm whitespace-nowrap flex items-center justify-center gap-1.5 border border-[#3A4585] z-10">
                  <Sparkles className="w-3 h-3 text-[#C9A24B] shrink-0" />
                  <span>Most Popular for Studios</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-xl text-[#232A5C]">{p.name}</h3>
                  {isCurrent && (
                    <span className="text-[10px] bg-[#EDF5F0] text-[#3F7D5C] font-bold px-2 py-0.5 rounded-full border border-[#3F7D5C]/30">
                      Current Plan
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-500 mt-1.5 min-h-[32px]">{p.tagline}</p>

                {/* Price Display */}
                <div className="my-5 pb-5 border-b border-stone-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-serif font-bold text-[#232A5C]">
                      {formatNaira(displayPrice)}
                    </span>
                    <span className="text-xs text-stone-500">
                      {billingCycle === 'monthly' ? '/ month' : '/ year'}
                    </span>
                  </div>

                  {billingCycle === 'annual' && (
                    <div className="text-[11px] text-[#3F7D5C] font-semibold mt-1">
                      11 months price (1 month free)
                      {currentStudio.isFoundingDesigner && ' + 10% Founding Discount'}
                    </div>
                  )}

                  {/* Volume limits */}
                  <div className="mt-3 grid grid-cols-3 gap-1 bg-[#FAF6F0] p-2 rounded-lg text-center text-[10px] border border-[#EBE3D7]">
                    <div>
                      <span className="text-stone-400 block">Seats</span>
                      <strong className="text-[#232A5C]">{p.seats} staff</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Orders</span>
                      <strong className="text-[#232A5C]">{p.activeOrders}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Clients</span>
                      <strong className="text-[#232A5C]">{p.customers}</strong>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 mb-6 text-xs text-stone-700">
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="p-0.5 rounded-full bg-[#EDF5F0] text-[#3F7D5C] shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Select Plan Button */}
              <button
                onClick={() => handleSelectPlan(p.tier)}
                disabled={isCurrent}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                  isCurrent
                    ? 'bg-stone-100 text-stone-400 cursor-default'
                    : p.isPopular
                    ? 'bg-[#E2573A] hover:bg-[#D0482B] text-white'
                    : 'bg-[#232A5C] hover:bg-[#343D7B] text-white'
                }`}
              >
                {isCurrent ? 'Current Studio Plan' : `Upgrade to ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Paystack Payment & Guarantee Footer (PRD Section 10) */}
      <div className="bg-[#FAF6F0] p-5 rounded-2xl border border-[#E4DCD0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white border border-[#E4DCD0] text-[#232A5C]">
            <CreditCard className="w-5 h-5 text-[#3F7D5C]" />
          </div>
          <div>
            <div className="font-semibold text-stone-800">
              Secured with Paystack Local & International Subscriptions
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Failed charges include automatic 7-day grace period. Never lose access to your customer measurements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-[11px] text-stone-600 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#3F7D5C]" />
          <span>Tenant Data Isolation Guaranteed</span>
        </div>
      </div>
    </div>
  );
};

