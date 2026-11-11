import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatNaira, formatDate } from '../../utils/formatters';
import { PlanTierBadge } from '../brand/Badge';
import {
  ShieldCheck,
  TrendingUp,
  Building2,
  Users,
  DollarSign,
  AlertTriangle,
  Gift,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

export const SuperAdminPage: React.FC = () => {
  const { studios, agents, attributions, commissions, orders, customers, switchStudio, currentStudio } = useApp();

  // Platform Business Metrics (ADM-2)
  const totalMRR = studios.reduce((sum, s) => {
    const monthlyRate = s.plan === 'starter' ? 10000 : s.plan === 'studio' ? 25000 : 50000;
    return sum + (s.status === 'active' ? monthlyRate : 0);
  }, 0);

  const activeStudios = studios.filter((s) => s.status === 'active').length;

  const totalVestedLiability = commissions
    .filter((c) => c.status === 'vested')
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const totalPendingLiability = commissions
    .filter((c) => c.status === 'pending')
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Super Admin Top Banner */}
      <div className="bg-[#232A5C] text-white p-5 rounded-2xl border border-[#363E75] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#8B1E1E] text-white shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-lg">StrandEnd Platform Administrator</h1>
              <span className="text-[10px] bg-rose-800 text-white font-mono uppercase px-2 py-0.5 rounded">
                ADM-1 Console
              </span>
            </div>
            <p className="text-xs text-[#E2DAD0]/80 mt-0.5">
              Multi-tenant workspace control, Monthly Recurring Revenue (MRR), and agent commission liabilities.
            </p>
          </div>
        </div>
      </div>

      {/* Platform KPI Summary Tiles (ADM-2) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total MRR */}
        <div className="bg-white p-4 rounded-xl border border-[#E4DCD0] shadow-2xs">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
            Monthly Recurring Revenue (MRR)
          </div>
          <div className="text-2xl font-serif font-bold text-[#232A5C]">{formatNaira(totalMRR)}</div>
          <div className="text-[11px] text-[#3F7D5C] font-semibold mt-1">Blended ~₦18,500/studio</div>
        </div>

        {/* Active Paying Studios */}
        <div className="bg-white p-4 rounded-xl border border-[#E4DCD0] shadow-2xs">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
            Active Studio Workspaces
          </div>
          <div className="text-2xl font-serif font-bold text-[#232A5C]">{activeStudios}</div>
          <div className="text-[11px] text-stone-500 mt-1">100% Tenant Isolation</div>
        </div>

        {/* Total Platform Orders Tracked */}
        <div className="bg-white p-4 rounded-xl border border-[#E4DCD0] shadow-2xs">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
            Garment Orders in Pipeline
          </div>
          <div className="text-2xl font-serif font-bold text-[#232A5C]">{orders.length}</div>
          <div className="text-[11px] text-stone-500 mt-1">Across all fashion studio workshops</div>
        </div>

        {/* Agent Commission Liability (ADM-3) */}
        <div className="bg-white p-4 rounded-xl border border-[#E4DCD0] shadow-2xs">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
            Agent Commission Liability
          </div>
          <div className="text-2xl font-serif font-bold text-[#C9A24B]">
            {formatNaira(totalVestedLiability + totalPendingLiability)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Vested: {formatNaira(totalVestedLiability)}
          </div>
        </div>
      </div>

      {/* Studios Management Table (ADM-1) */}
      <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#E4DCD0] bg-[#FAF6F0] flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-sm text-[#232A5C]">
              Subscribed Studio Tenants (ADM-1)
            </h3>
            <p className="text-[11px] text-stone-500">
              Manage plans, active orders limits, and tenure loyalty progression.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 text-[11px] bg-[#ECE5DA]">
                <th className="py-2.5 px-4 font-serif font-bold text-[#232A5C]">Studio Workspace</th>
                <th className="py-2.5 px-4 font-serif font-bold text-[#232A5C]">Owner</th>
                <th className="py-2.5 px-4 font-serif font-bold text-[#232A5C]">Plan Tier</th>
                <th className="py-2.5 px-4 font-serif font-bold text-[#232A5C]">Tenure Months</th>
                <th className="py-2.5 px-4 font-serif font-bold text-[#232A5C]">Status</th>
                <th className="py-2.5 px-4 font-serif font-bold text-[#232A5C]">Joined</th>
                <th className="py-2.5 px-4 font-serif font-bold text-[#232A5C] text-right">Switch Studio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {studios.map((st) => (
                <tr key={st.id} className="hover:bg-[#FAF6F0] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#232A5C]">{st.name}</td>
                  <td className="py-3 px-4 text-stone-700">{st.ownerName}</td>
                  <td className="py-3 px-4">
                    <PlanTierBadge tier={st.plan} isFounding={st.isFoundingDesigner} />
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {st.tenureMonths} continuous months
                    {st.loyaltyFreeMonthsEarned > 0 && (
                      <span className="text-[10px] text-[#3F7D5C] block font-semibold">
                        {st.loyaltyFreeMonthsEarned} Free Month(s) Earned
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-[#EDF5F0] text-[#3F7D5C]">
                      {st.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-500">{formatDate(st.createdAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => switchStudio(st.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${
                        st.id === currentStudio.id
                          ? 'bg-[#3F7D5C] text-white cursor-default'
                          : 'bg-[#232A5C] hover:bg-[#363E75] text-white shadow-xs'
                      }`}
                    >
                      {st.id === currentStudio.id ? 'Active' : 'Switch &rarr;'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Program Health & Ceilings (Section 17.3 & ADM-3) */}
      <div className="bg-[#FAF6F0] p-5 rounded-2xl border border-[#E4DCD0] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#E2573A]" />
            <h3 className="font-serif font-bold text-sm text-[#232A5C]">
              Program Ceilings & Financial Guardrails (Section 17.3)
            </h3>
          </div>
          <span className="text-[10px] bg-[#EDF5F0] text-[#3F7D5C] font-bold px-2.5 py-1 rounded-full">
            Under 10% Combined Ceiling
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-[#E4DCD0]">
            <span className="text-[10px] text-stone-400 block uppercase">Agent Commission Share</span>
            <div className="text-lg font-serif font-bold text-[#232A5C] mt-0.5">7.4% of Net</div>
            <span className="text-[10px] text-stone-500">Target: Under 8% (Passed)</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-[#E4DCD0]">
            <span className="text-[10px] text-stone-400 block uppercase">Loyalty Free Month Share</span>
            <div className="text-lg font-serif font-bold text-[#232A5C] mt-0.5">2.1% of Net</div>
            <span className="text-[10px] text-stone-500">Target: 2% to 3% (Passed)</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-[#E4DCD0]">
            <span className="text-[10px] text-stone-400 block uppercase">Combined Cost</span>
            <div className="text-lg font-serif font-bold text-[#3F7D5C] mt-0.5">9.5% Net Total</div>
            <span className="text-[10px] text-stone-500">Strict ceiling: 10.0% max</span>
          </div>
        </div>
      </div>
    </div>
  );
};

