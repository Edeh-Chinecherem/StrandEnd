import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateDeliveryCountdown } from '../../utils/dateUtils';
import {
  ShoppingBag,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { formatNaira } from '../../utils/formatters';

interface MetricsOverviewProps {
  onSelectTab: (tab: any) => void;
  onOpenCreateOrder: () => void;
  onOpenQuickEnquiry: () => void;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  onSelectTab,
  onOpenCreateOrder,
  onOpenQuickEnquiry,
}) => {
  const { orders, leads, currentStudio } = useApp();

  const activeOrders = orders.filter(
    (o) => o.currentStage !== 'delivered' && o.currentStage !== 'cancelled_hold'
  );

  const overdueOrders = activeOrders.filter((o) => {
    const cd = calculateDeliveryCountdown(o.expectedDeliveryDate);
    return cd.urgency === 'overdue';
  });

  const dueThisWeekOrders = activeOrders.filter((o) => {
    const cd = calculateDeliveryCountdown(o.expectedDeliveryDate);
    return cd.urgency === 'urgent' || cd.urgency === 'due_soon';
  });

  const readyForDeliveryOrders = orders.filter(
    (o) => o.currentStage === 'ready_for_delivery'
  );

  const deliveredOrders = orders.filter((o) => o.currentStage === 'delivered');

  const onTimeDeliveryRate =
    deliveredOrders.length > 0
      ? Math.round(
          (deliveredOrders.filter((o) => o.deliveryDateChanges.length === 0).length /
            deliveredOrders.length) *
            100
        )
      : 96;

  const activePipelineValue = activeOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="space-y-4">
      {/* 10-Second Manager Overview Notice Bar if Overdue Orders exist */}
      {overdueOrders.length > 0 && (
        <div className="bg-[#FDECEC] border border-[#8B1E1E]/30 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5 text-[#8B1E1E]">
            <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce" />
            <div>
              <span className="font-bold text-sm">
                Attention Required: {overdueOrders.length} Order{overdueOrders.length > 1 ? 's' : ''} Overdue
              </span>
              <p className="text-[#8B1E1E]/80 text-[11px] mt-0.5">
                Review workshop floor stages or proactively reschedule client delivery dates with recorded reasons.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('orders')}
            className="px-3 py-1.5 bg-[#8B1E1E] text-white rounded-lg font-semibold hover:bg-[#721818] transition-colors self-start sm:self-auto shrink-0"
          >
            Resolve Overdue Orders &rarr;
          </button>
        </div>
      )}

      {/* KPI Tiles (PRD Section 4.3 DASH-4) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Active Orders */}
        <div
          onClick={() => onSelectTab('pipeline')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E4DCD0] shadow-2xs hover:border-[#232A5C]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Orders</span>
            <div className="p-1.5 rounded-lg bg-[#EBF1FA] text-[#232A5C] group-hover:bg-[#232A5C] group-hover:text-white transition-colors">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#232A5C]">
            {activeOrders.length}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 truncate">
            {formatNaira(activePipelineValue)} active value
          </div>
        </div>

        {/* Overdue Orders */}
        <div
          onClick={() => onSelectTab('orders')}
          className={`p-3.5 sm:p-4 rounded-xl border shadow-2xs transition-all cursor-pointer group ${
            overdueOrders.length > 0
              ? 'bg-[#FDECEC] border-[#8B1E1E]/40 hover:border-[#8B1E1E]'
              : 'bg-white border-[#E4DCD0]'
          }`}
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                overdueOrders.length > 0 ? 'text-[#8B1E1E] font-bold' : ''
              }`}
            >
              Overdue
            </span>
            <div
              className={`p-1.5 rounded-lg transition-colors ${
                overdueOrders.length > 0
                  ? 'bg-[#8B1E1E] text-white'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-serif font-bold ${
              overdueOrders.length > 0 ? 'text-[#8B1E1E]' : 'text-stone-700'
            }`}
          >
            {overdueOrders.length}
          </div>
          <div
            className={`text-[11px] mt-1 ${
              overdueOrders.length > 0 ? 'text-[#8B1E1E]/80 font-medium' : 'text-stone-500'
            }`}
          >
            {overdueOrders.length > 0 ? 'Needs immediate review' : 'No late orders'}
          </div>
        </div>

        {/* Due This Week */}
        <div
          onClick={() => onSelectTab('calendar')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E4DCD0] shadow-2xs hover:border-[#C9A24B] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Due In &le;7 Days</span>
            <div className="p-1.5 rounded-lg bg-[#FBF6EB] text-[#C9A24B] group-hover:bg-[#C9A24B] group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#232A5C]">
            {dueThisWeekOrders.length}
          </div>
          <div className="text-[11px] text-[#A07A28] font-medium mt-1">
            Approaching studio deadline
          </div>
        </div>

        {/* Ready for Delivery */}
        <div
          onClick={() => onSelectTab('orders')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E4DCD0] shadow-2xs hover:border-[#3F7D5C] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Ready for Delivery</span>
            <div className="p-1.5 rounded-lg bg-[#EDF5F0] text-[#3F7D5C] group-hover:bg-[#3F7D5C] group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#3F7D5C]">
            {readyForDeliveryOrders.length}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Check balance payment status
          </div>
        </div>

        {/* On-Time Rate / Studio Health */}
        <div className="col-span-2 lg:col-span-1 bg-[#232A5C] text-[#F7F2EA] p-3.5 sm:p-4 rounded-xl border border-[#363E75] shadow-2xs">
          <div className="flex items-center justify-between text-[#E2DAD0] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">On-Time Rate</span>
            <TrendingUp className="w-4 h-4 text-[#C9A24B]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-baseline gap-1">
            <span>{onTimeDeliveryRate}%</span>
            <span className="text-xs text-[#3F7D5C] font-sans font-medium">+25%</span>
          </div>
          <div className="text-[11px] text-[#E2DAD0]/80 mt-1">
            Target met for {currentStudio.name}
          </div>
        </div>
      </div>
    </div>
  );
};

