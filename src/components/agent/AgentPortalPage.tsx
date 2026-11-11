import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatNaira, formatDate } from '../../utils/formatters';
import {
  Gift,
  Copy,
  Check,
  Share2,
  TrendingUp,
  DollarSign,
  Users,
  ShieldCheck,
  Sparkles,
  Building2,
  Calendar,
  AlertCircle,
  CreditCard,
  UserCheck,
  Clock,
} from 'lucide-react';

export const AgentPortalPage: React.FC = () => {
  const {
    agents,
    attributions,
    commissions,
    payouts,
    processAgentPayout,
    createAgent,
    showToast,
  } = useApp();

  // Selected agent (defaults to Amina Lawal, Senior Agent)
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [activeTab, setActiveTab] = useState<'studios' | 'commissions' | 'payouts'>('studios');

  const agent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  const agentAttributions = attributions.filter((attr) => attr.agentId === agent?.id);
  const agentCommissions = commissions.filter((c) => c.agentId === agent?.id);
  const agentPayouts = payouts.filter((p) => p.agentId === agent?.id);

  // Compute metrics (PRD Section 17.1 & AGT-4)
  const totalClicks = 184; // Simulated tracking clicks
  const totalSignups = agentAttributions.length + 3; // Active + trialling
  const triallingCount = 2;
  const activePaidStudios = agentAttributions.filter((a) => a.status === 'active').length;

  const pendingCommissions = agentCommissions
    .filter((c) => c.status === 'pending')
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const vestedCommissions = agentCommissions
    .filter((c) => c.status === 'vested')
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const totalPaidOut = agentPayouts.reduce((sum, p) => sum + p.totalAmount, 0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(agent.shareLink);
    setCopiedLink(true);
    showToast('success', 'Referral Link Copied', 'Share with fashion designers to give them a 21-day trial!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(agent.uniqueCode);
    setCopiedCode(true);
    showToast('success', 'Referral Code Copied', `Code: ${agent.uniqueCode}`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Agent Header & Unique Code Card */}
      <div className="bg-[#232A5C] text-[#F7F2EA] p-5 sm:p-6 rounded-2xl border border-[#363E75] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#E2573A] text-white flex items-center justify-center font-serif font-bold text-lg shadow-xs">
              {agent.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-xl text-white">{agent.name}</h1>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    agent.level === 'senior'
                      ? 'bg-[#C9A24B] text-black font-serif'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {agent.level === 'senior' ? '★ Senior Agent (25%)' : 'Standard Agent (20%)'}
                </span>
              </div>
              <p className="text-xs text-[#E2DAD0]/80">
                Independent Promoter • Joined {formatDate(agent.dateJoined)} • Payout Bank:{' '}
                {agent.bankName}
              </p>
            </div>
          </div>

          <div className="text-xs text-[#E2DAD0] bg-white/5 p-2.5 rounded-xl border border-white/10 max-w-xl">
            <strong>21-Day Extended Trial Advantage:</strong> Designers who sign up through your link or enter
            code <code className="text-[#C9A24B] font-bold">{agent.uniqueCode}</code> get <strong>21 free trial days</strong> (14 standard + 7 bonus days).
          </div>
        </div>

        {/* Share Link & Code Buttons */}
        <div className="bg-[#171C3D] p-3.5 rounded-xl border border-[#363E75] space-y-2.5 shrink-0 self-stretch sm:self-auto min-w-[280px]">
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block mb-1">
              Your Unique Referral Link
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={agent.shareLink}
                className="w-full bg-[#232A5C] px-2.5 py-1.5 rounded-lg border border-[#3A4585] text-xs font-mono text-[#F7F2EA] focus:outline-hidden"
              />
              <button
                onClick={handleCopyLink}
                className="p-1.5 rounded-lg bg-[#E2573A] hover:bg-[#D0482B] text-white transition-colors shrink-0"
                title="Copy share link"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
            <span className="text-stone-300">
              Referral Code: <strong className="text-[#C9A24B]">{agent.uniqueCode}</strong>
            </span>
            <button
              onClick={handleCopyCode}
              className="text-[11px] text-[#E2573A] hover:underline font-semibold flex items-center gap-1"
            >
              {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>Copy Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Agent Performance Metric Tiles (PRD Section 17.1 & AGT-4) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Active Paying Studios */}
        <div className="bg-white p-4 rounded-xl border border-[#E4DCD0] shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Paying Studios</span>
            <Building2 className="w-4 h-4 text-[#232A5C]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#232A5C]">{activePaidStudios}</div>
          <div className="text-[11px] text-[#3F7D5C] font-semibold mt-1">
            {agent.level === 'senior' ? 'Senior Tier Reached (10+)' : `${10 - activePaidStudios} more to Senior 25%`}
          </div>
        </div>

        {/* Pending Commissions (Vesting 30 Days) */}
        <div className="bg-white p-4 rounded-xl border border-[#E4DCD0] shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending (30-Day Vest)</span>
            <Clock className="w-4 h-4 text-[#C9A24B]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#C9A24B]">
            {formatNaira(pendingCommissions)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Vests after refund window</div>
        </div>

        {/* Vested Commissions Ready for Payout */}
        <div className="bg-white p-4 rounded-xl border border-[#E4DCD0] shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Vested Balance</span>
            <DollarSign className="w-4 h-4 text-[#3F7D5C]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#3F7D5C]">
            {formatNaira(vestedCommissions)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {vestedCommissions >= 20000 ? (
              <span className="text-[#3F7D5C] font-semibold">Eligible for 15th Payout</span>
            ) : (
              `₦${(20000 - vestedCommissions).toLocaleString()} to min ₦20,000 threshold`
            )}
          </div>
        </div>

        {/* Total Paid Out to Nigerian Bank Account */}
        <div className="bg-white p-4 rounded-xl border border-[#E4DCD0] shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Paid Out</span>
            <Check className="w-4 h-4 text-[#232A5C]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#232A5C]">
            {formatNaira(totalPaidOut)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Paid to {agent.accountName}</div>
        </div>
      </div>

      {/* Tabs for Referred Studios, Commission Ledger & Payouts */}
      <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-2xs overflow-hidden">
        <div className="flex border-b border-[#E4DCD0] bg-[#FAF6F0] px-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('studios')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'studios'
                ? 'border-[#232A5C] text-[#232A5C] font-bold'
                : 'border-transparent text-stone-500 hover:text-[#232A5C]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Referred Studios ({agentAttributions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'commissions'
                ? 'border-[#232A5C] text-[#232A5C] font-bold'
                : 'border-transparent text-stone-500 hover:text-[#232A5C]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Commission Ledger ({agentCommissions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'payouts'
                ? 'border-[#232A5C] text-[#232A5C] font-bold'
                : 'border-transparent text-stone-500 hover:text-[#232A5C]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Monthly Payouts ({agentPayouts.length})</span>
          </button>
        </div>

        <div className="p-5 text-xs text-[#232A5C]">
          {/* TAB 1: Referred Studios */}
          {activeTab === 'studios' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#232A5C]">
                    Attributed Studio Workspaces
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Earn 20% commission (25% Senior) on net revenue for the first 6 paid months of each referred studio.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 text-[11px]">
                      <th className="py-2.5">Studio Display Name</th>
                      <th className="py-2.5">Plan & Cycle</th>
                      <th className="py-2.5">Sign-up Date</th>
                      <th className="py-2.5">Trial Status</th>
                      <th className="py-2.5">Paid Months</th>
                      <th className="py-2.5 text-right">Commission Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {agentAttributions.map((attr) => (
                      <tr key={attr.id} className="hover:bg-[#FAF6F0] transition-colors">
                        <td className="py-3 font-semibold text-[#232A5C]">{attr.studioName}</td>
                        <td className="py-3 uppercase text-[11px] font-medium text-stone-700">
                          {attr.plan} ({attr.billingCycle})
                        </td>
                        <td className="py-3 text-stone-500">{formatDate(attr.signUpDate)}</td>
                        <td className="py-3">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EDF5F0] text-[#3F7D5C] font-bold">
                            Paid Subscriber
                          </span>
                        </td>
                        <td className="py-3 font-medium">
                          {attr.clearedPaidMonths} of 6 commission months
                        </td>
                        <td className="py-3 text-right font-serif font-bold text-[#232A5C]">
                          {formatNaira(attr.commissionEarnedTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Privacy Notice (PRD Section 17.1) */}
              <div className="bg-[#FAF6F0] p-3 rounded-lg border border-[#E4DCD0] text-[11px] text-stone-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3F7D5C] shrink-0" />
                <span>
                  <strong>Data Protection & Privacy Notice:</strong> Agents see only studio display names and subscription
                  statuses. No client orders, bespoke measurements or internal notes are visible to agents.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Commission Ledger (AGT-5) */}
          {activeTab === 'commissions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#232A5C]">
                    Commission Invoices & Vesting Schedule
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Commissions vest 30 days after cleared studio payment with no refunds (PRD Section 17.3).
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 text-[11px]">
                      <th className="py-2.5">Studio</th>
                      <th className="py-2.5">Invoice Month</th>
                      <th className="py-2.5">Net Revenue Received</th>
                      <th className="py-2.5">Commission Rate</th>
                      <th className="py-2.5">Commission Amount</th>
                      <th className="py-2.5">Vesting Date</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {agentCommissions.map((comm) => (
                      <tr key={comm.id} className="hover:bg-stone-50">
                        <td className="py-2.5 font-medium">{comm.studioName}</td>
                        <td className="py-2.5 text-stone-600">Month #{comm.invoiceMonth}</td>
                        <td className="py-2.5 font-serif">{formatNaira(comm.netAmountReceived)}</td>
                        <td className="py-2.5 font-semibold text-[#232A5C]">
                          {comm.ratePercentage}%
                        </td>
                        <td className="py-2.5 font-serif font-bold text-[#232A5C]">
                          {formatNaira(comm.commissionAmount)}
                        </td>
                        <td className="py-2.5 text-stone-500">{formatDate(comm.vestingDate)}</td>
                        <td className="py-2.5">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              comm.status === 'vested'
                                ? 'bg-[#EDF5F0] text-[#3F7D5C]'
                                : comm.status === 'pending'
                                ? 'bg-[#FBF6EB] text-[#C9A24B]'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {comm.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Monthly Payouts (AGT-6) */}
          {activeTab === 'payouts' && (
            <div className="space-y-4">
              <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E4DCD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#232A5C]">
                    Paystack Direct Bank Transfer Payout Run (AGT-6)
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Monthly payouts process on the 15th for vested balances meeting the ₦20,000 threshold.
                  </p>
                </div>

                <button
                  onClick={() => processAgentPayout(agent.id)}
                  disabled={vestedCommissions < 20000}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors ${
                    vestedCommissions >= 20000
                      ? 'bg-[#3F7D5C] hover:bg-[#326449] text-white cursor-pointer'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  Process ₦{vestedCommissions.toLocaleString()} Payout Run
                </button>
              </div>

              {/* Bank Account Verification Details */}
              <div className="bg-white p-4 rounded-xl border border-[#E4DCD0] space-y-2">
                <div className="font-semibold text-xs text-[#232A5C] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#3F7D5C]" />
                  <span>Verified Nigerian Bank Account Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Bank Name</span>
                    <strong className="text-stone-800">{agent.bankName}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Account Number</span>
                    <strong className="text-stone-800 font-mono">{agent.accountNumber}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Account Name</span>
                    <strong className="text-stone-800">{agent.accountName}</strong>
                  </div>
                </div>
              </div>

              {/* Past Payouts History */}
              <div className="space-y-2 pt-2">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#232A5C]">
                  Payout Statements History
                </h4>
                <div className="divide-y divide-stone-100 border border-[#E4DCD0] rounded-xl overflow-hidden bg-white">
                  {agentPayouts.map((pay) => (
                    <div
                      key={pay.id}
                      className="p-3.5 flex items-center justify-between text-xs hover:bg-[#FAF6F0]"
                    >
                      <div>
                        <div className="font-bold text-[#232A5C]">{pay.period} Statement</div>
                        <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                          Ref: {pay.bankReference} • Paid: {formatDate(pay.paidDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif font-bold text-sm text-[#3F7D5C]">
                          {formatNaira(pay.totalAmount)}
                        </div>
                        <span className="text-[10px] text-stone-400">Processed via Paystack</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
