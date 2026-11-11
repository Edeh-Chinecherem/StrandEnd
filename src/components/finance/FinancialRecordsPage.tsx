import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, PaymentRecord } from '../../types';
import { formatNaira, formatDate, formatDateTime } from '../../utils/formatters';
import { calculateDeliveryCountdown } from '../../utils/dateUtils';
import { DeliveryCountdownBadge } from '../brand/Badge';
import { PaymentReceiptModal } from '../orders/PaymentReceiptModal';
import {
  Receipt,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building2,
  DollarSign,
  TrendingUp,
  Clock,
  Printer,
  ChevronRight,
  ArrowUpDown,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface FinancialRecordsPageProps {
  onOpenOrder: (order: Order) => void;
}

export const FinancialRecordsPage: React.FC<FinancialRecordsPageProps> = ({ onOpenOrder }) => {
  const { orders, currentStudio, markOrderFullyPaid, logPayment, showToast } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'receivables' | 'ledger' | 'breakdown'>('receivables');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'month' | 'week'>('all');

  // Quick Settle Modal State
  const [settleOrder, setSettleOrder] = useState<Order | null>(null);
  const [settleMethod, setSettleMethod] = useState<PaymentRecord['method']>('Bank Transfer');
  const [settleNotes, setSettleNotes] = useState('Final balance payment completed in full');

  // Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [receiptPayment, setReceiptPayment] = useState<PaymentRecord | null>(null);

  // Financial aggregates across all orders in current studio
  const totalQuotedRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  // All individual payments across all orders
  const allPayments: { payment: PaymentRecord; order: Order }[] = orders.flatMap((o) =>
    o.payments.map((p) => ({ payment: p, order: o }))
  );

  const totalCollectedRevenue = allPayments.reduce((sum, { payment }) => sum + payment.amount, 0);
  const totalOutstandingBalance = Math.max(0, totalQuotedRevenue - totalCollectedRevenue);
  const overallCollectionRate =
    totalQuotedRevenue > 0 ? Math.round((totalCollectedRevenue / totalQuotedRevenue) * 100) : 0;

  // Filter orders with outstanding balance
  const ordersWithBalance = orders.filter((o) => {
    if (o.currentStage === 'cancelled_hold') return false;
    const paid = o.payments.reduce((sum, p) => sum + p.amount, 0);
    return o.totalPrice - paid > 0;
  });

  // Fully paid orders
  const fullyPaidOrders = orders.filter((o) => {
    const paid = o.payments.reduce((sum, p) => sum + p.amount, 0);
    return paid >= o.totalPrice && o.totalPrice > 0;
  });

  // Filter receivables list
  const filteredReceivables = ordersWithBalance.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.occasion.toLowerCase().includes(q)
    );
  });

  // Sort receivables: orders due soonest or overdue first
  filteredReceivables.sort((a, b) => {
    const isClosedA = a.currentStage === 'delivered';
    const isClosedB = b.currentStage === 'delivered';
    const cdA = calculateDeliveryCountdown(a.expectedDeliveryDate, isClosedA);
    const cdB = calculateDeliveryCountdown(b.expectedDeliveryDate, isClosedB);
    if (cdA.urgency === 'overdue' && cdB.urgency !== 'overdue') return -1;
    if (cdB.urgency === 'overdue' && cdA.urgency !== 'overdue') return 1;
    return new Date(a.expectedDeliveryDate).getTime() - new Date(b.expectedDeliveryDate).getTime();
  });

  // Filter payments ledger
  const filteredPayments = allPayments.filter(({ payment, order }) => {
    if (methodFilter !== 'all' && payment.method !== methodFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOrder = order.orderNumber.toLowerCase().includes(q);
      const matchCust = order.customerName.toLowerCase().includes(q);
      const matchStaff = payment.recordedBy.toLowerCase().includes(q);
      const matchNotes = (payment.notes || '').toLowerCase().includes(q);
      if (!matchOrder && !matchCust && !matchStaff && !matchNotes) return false;
    }
    return true;
  });

  // Sort payments newest first
  filteredPayments.sort(
    (a, b) => new Date(b.payment.date).getTime() - new Date(a.payment.date).getTime()
  );

  // Method breakdown
  const methodTotals: Record<string, number> = {
    'Bank Transfer': 0,
    'POS / Card': 0,
    'Cash': 0,
    'Paystack': 0,
  };
  allPayments.forEach(({ payment }) => {
    if (methodTotals[payment.method] !== undefined) {
      methodTotals[payment.method] += payment.amount;
    } else {
      methodTotals[payment.method] = payment.amount;
    }
  });

  // Handle Mark Payment Completed confirmation
  const handleConfirmSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleOrder) return;
    const totalPaid = settleOrder.payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = Math.max(0, settleOrder.totalPrice - totalPaid);

    markOrderFullyPaid(settleOrder.id, settleMethod, settleNotes);

    // Create virtual payment for immediate receipt printing
    const paymentForReceipt: PaymentRecord = {
      id: `pay-${Date.now()}`,
      amount: balance,
      method: settleMethod,
      date: new Date().toISOString().split('T')[0],
      recordedBy: 'Studio Staff',
      notes: settleNotes,
      reference: `FULL-${Date.now().toString().slice(-6)}`,
    };

    const targetOrder = settleOrder;
    setSettleOrder(null);

    // Prompt to view receipt
    setReceiptOrder({
      ...targetOrder,
      payments: [...targetOrder.payments, paymentForReceipt],
    });
    setReceiptPayment(paymentForReceipt);
  };

  // Export Financial CSV
  const handleExportCSV = () => {
    const headers = [
      'Payment ID',
      'Date',
      'Order Number',
      'Customer Name',
      'Method',
      'Amount (NGN)',
      'Recorded By',
      'Notes & Reference',
    ];
    const rows = filteredPayments.map(({ payment, order }) => [
      `"${payment.id}"`,
      `"${payment.date}"`,
      `"${order.orderNumber}"`,
      `"${order.customerName}"`,
      `"${payment.method}"`,
      payment.amount,
      `"${payment.recordedBy}"`,
      `"${payment.notes || ''} ${payment.reference ? `(${payment.reference})` : ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `StrandEnd_Financial_Ledger_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif font-bold text-2xl text-[#232A5C] flex items-center gap-2">
            <span>Financial Records & Cashflow Ledger</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Accounts receivable, payment transaction journal, debtor balance clearing, and reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-[#232A5C] text-[#232A5C] hover:text-white border border-[#E4DCD0] rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            title="Download complete transaction journal as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Financial Ledger</span>
          </button>
        </div>
      </div>

      {/* 4 Financial KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Quoted Value */}
        <div className="bg-white p-4 rounded-2xl border border-[#E4DCD0] shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-serif font-bold uppercase tracking-wider text-[11px]">
              Total Quoted Revenue
            </span>
            <div className="p-1.5 rounded-lg bg-[#FAF6F0] text-[#232A5C]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#232A5C] mt-2">
            {formatNaira(totalQuotedRevenue)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Across {orders.length} bespoke commissions
          </div>
        </div>

        {/* Collected Revenue */}
        <div className="bg-[#EDF5F0] p-4 rounded-2xl border border-[#3F7D5C]/30 shadow-2xs">
          <div className="flex items-center justify-between text-[#3F7D5C] text-xs">
            <span className="font-serif font-bold uppercase tracking-wider text-[11px]">
              Reconciled Payments
            </span>
            <div className="p-1.5 rounded-lg bg-white text-[#3F7D5C]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#3F7D5C] mt-2">
            {formatNaira(totalCollectedRevenue)}
          </div>
          <div className="text-[11px] text-stone-600 mt-1">
            {allPayments.length} logged payments collected
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div
          className={`p-4 rounded-2xl border shadow-2xs ${totalOutstandingBalance > 0
            ? 'bg-[#FBECE8] border-[#E2573A]/40'
            : 'bg-white border-[#E4DCD0]'
            }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span
              className={`font-serif font-bold uppercase tracking-wider text-[11px] ${totalOutstandingBalance > 0 ? 'text-[#E2573A]' : 'text-stone-500'
                }`}
            >
              Uncollected Receivables
            </span>
            <div
              className={`p-1.5 rounded-lg ${totalOutstandingBalance > 0 ? 'bg-white text-[#E2573A]' : 'bg-[#FAF6F0] text-stone-500'
                }`}
            >
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-serif font-bold mt-2 ${totalOutstandingBalance > 0 ? 'text-[#E2573A]' : 'text-[#3F7D5C]'
              }`}
          >
            {formatNaira(totalOutstandingBalance)}
          </div>
          <div className="text-[11px] text-stone-600 mt-1 font-medium">
            {ordersWithBalance.length} client orders awaiting settlement
          </div>
        </div>

        {/* Full Settlement Rate */}
        <div className="bg-white p-4 rounded-2xl border border-[#E4DCD0] shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-serif font-bold uppercase tracking-wider text-[11px]">
              Collection Efficiency
            </span>
            <div className="p-1.5 rounded-lg bg-[#FAF6F0] text-[#C9A24B]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#232A5C] mt-2">
            {overallCollectionRate}%
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {fullyPaidOrders.length} of {orders.length} orders 100% paid
          </div>
        </div>
      </div>

      {/* Section Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4DCD0] pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('receivables')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${activeSubTab === 'receivables'
            ? 'bg-[#232A5C] text-white shadow-2xs'
            : 'bg-white text-stone-600 hover:text-[#232A5C] border border-[#E4DCD0]'
            }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Pending Balances & Settlement ({ordersWithBalance.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ledger')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${activeSubTab === 'ledger'
            ? 'bg-[#232A5C] text-white shadow-2xs'
            : 'bg-white text-stone-600 hover:text-[#232A5C] border border-[#E4DCD0]'
            }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Payment Transaction Journal ({allPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('breakdown')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${activeSubTab === 'breakdown'
            ? 'bg-[#232A5C] text-white shadow-2xs'
            : 'bg-white text-stone-600 hover:text-[#232A5C] border border-[#E4DCD0]'
            }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payment Channel Breakdown</span>
        </button>
      </div>

      {/* TAB 1: PENDING BALANCES & ONE-CLICK SETTLEMENT */}
      {activeSubTab === 'receivables' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E4DCD0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders with pending balance by client or order #..."
                className="w-full pl-9 pr-3 py-2 bg-[#FAF6F0] border border-[#E4DCD0] rounded-lg focus:outline-hidden focus:border-[#232A5C] text-xs text-[#232A5C]"
              />
            </div>
            <div className="text-stone-500 text-xs">
              Showing <strong>{filteredReceivables.length}</strong> order{filteredReceivables.length !== 1 ? 's' : ''} with uncollected balance
            </div>
          </div>

          {/* Receivables Table */}
          <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF6F0] border-b border-[#E4DCD0] text-stone-600 font-serif font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Order #</th>
                    <th className="py-3.5 px-4">Client Name & Phone</th>
                    <th className="py-3.5 px-4">Occasion & Stage</th>
                    <th className="py-3.5 px-4">Delivery Due</th>
                    <th className="py-3.5 px-4 text-right">Quoted Total</th>
                    <th className="py-3.5 px-4 text-right">Paid to Date</th>
                    <th className="py-3.5 px-4 text-right">Outstanding Balance</th>
                    <th className="py-3.5 px-4 text-center">Payment Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DCD0]">
                  {filteredReceivables.map((order) => {
                    const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
                    const balance = order.totalPrice - totalPaid;
                    const isDelivered = order.currentStage === 'delivered';

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-stone-50 transition-colors group cursor-pointer"
                        onClick={() => onOpenOrder(order)}
                      >
                        {/* Order # */}
                        <td className="py-3 px-4 font-mono font-bold text-[#232A5C] group-hover:text-[#E2573A]">
                          {order.orderNumber}
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#232A5C]">{order.customerName}</div>
                          <div className="text-stone-500 text-[11px]">{order.customerPhone}</div>
                        </td>

                        {/* Occasion & Stage */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-stone-800">{order.occasion}</div>
                          <div className="text-[11px] text-stone-500 capitalize">
                            {order.currentStage.replace(/_/g, ' ')}
                          </div>
                        </td>

                        {/* Delivery Due */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-[11px] text-stone-600">
                              {formatDate(order.expectedDeliveryDate)}
                            </span>
                            <DeliveryCountdownBadge
                              expectedDeliveryDate={order.expectedDeliveryDate}
                              isDelivered={isDelivered}
                              size="sm"
                            />
                          </div>
                        </td>

                        {/* Quoted Total */}
                        <td className="py-3 px-4 text-right font-serif font-medium text-stone-700">
                          {formatNaira(order.totalPrice)}
                        </td>

                        {/* Paid to Date */}
                        <td className="py-3 px-4 text-right font-serif font-medium text-[#3F7D5C]">
                          {formatNaira(totalPaid)}
                        </td>

                        {/* Outstanding Balance */}
                        <td className="py-3 px-4 text-right font-serif font-black text-sm text-[#E2573A]">
                          {formatNaira(balance)}
                        </td>

                        {/* Settle Action Button */}
                        <td
                          className="py-3 px-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setSettleOrder(order);
                              setSettleMethod('Bank Transfer');
                              setSettleNotes(`Settled final balance for Order ${order.orderNumber}`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#3F7D5C] hover:bg-[#326449] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors mx-auto"
                            title={`Complete payment and record full balance of ${formatNaira(balance)}`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Paid in Full</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredReceivables.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-400">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-[#3F7D5C] opacity-60 mb-2" />
                        <div className="font-semibold text-stone-700 text-sm">
                          All client accounts are fully reconciled!
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">
                          There are no pending accounts receivable or outstanding customer balances.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT TRANSACTION JOURNAL */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E4DCD0] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transaction by Order #, Client Name, Staff, Ref..."
                className="w-full pl-9 pr-3 py-2 bg-[#FAF6F0] border border-[#E4DCD0] rounded-lg focus:outline-hidden focus:border-[#232A5C] text-xs text-[#232A5C]"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#FAF6F0] px-2.5 py-1.5 rounded-lg border border-[#E4DCD0]">
                <Filter className="w-3.5 h-3.5 text-stone-500" />
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="bg-transparent text-xs text-[#232A5C] font-medium focus:outline-hidden"
                >
                  <option value="all">All Payment Channels</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="POS / Card">POS / Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Paystack">Paystack</option>
                </select>
              </div>

              <span className="text-stone-500 text-[11px] font-medium">
                {filteredPayments.length} transaction{filteredPayments.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF6F0] border-b border-[#E4DCD0] text-stone-600 font-serif font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Receipt Ref</th>
                    <th className="py-3.5 px-4">Order # & Client</th>
                    <th className="py-3.5 px-4">Payment Channel</th>
                    <th className="py-3.5 px-4 text-right">Amount Received</th>
                    <th className="py-3.5 px-4">Recorded By</th>
                    <th className="py-3.5 px-4">Notes</th>
                    <th className="py-3.5 px-4 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DCD0]">
                  {filteredPayments.map(({ payment, order }) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-stone-50 transition-colors group cursor-pointer"
                      onClick={() => onOpenOrder(order)}
                    >
                      {/* Date */}
                      <td className="py-3 px-4 font-medium text-stone-700">
                        {formatDate(payment.date)}
                      </td>

                      {/* Receipt Ref */}
                      <td className="py-3 px-4 font-mono text-[11px] font-bold text-stone-600">
                        RCP-{payment.id.toUpperCase().slice(-8)}
                      </td>

                      {/* Order & Client */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#232A5C] group-hover:text-[#E2573A]">
                          {order.orderNumber}
                        </div>
                        <div className="text-stone-500 text-[11px]">{order.customerName}</div>
                      </td>

                      {/* Method */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAF6F0] text-[#232A5C] border border-[#E4DCD0]">
                          {payment.method}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right font-serif font-black text-sm text-[#3F7D5C]">
                        {formatNaira(payment.amount)}
                      </td>

                      {/* Staff */}
                      <td className="py-3 px-4 text-stone-600 text-[11px]">
                        {payment.recordedBy}
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-4 text-stone-500 text-[11px] max-w-[200px] truncate">
                        {payment.notes || '—'} {payment.reference ? `(${payment.reference})` : ''}
                      </td>

                      {/* Receipt Print Action */}
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setReceiptOrder(order);
                            setReceiptPayment(payment);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] hover:bg-[#232A5C] text-[#232A5C] hover:text-white border border-[#E4DCD0] text-[11px] font-semibold transition-colors inline-flex items-center gap-1 shadow-2xs"
                          title="Generate and print official receipt (PAY-2)"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-400">
                        No transactions found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT CHANNEL BREAKDOWN */}
      {activeSubTab === 'breakdown' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              method: 'Bank Transfer',
              amount: methodTotals['Bank Transfer'] || 0,
              desc: 'Direct fashion studio bank account deposits & wire transfers',
              icon: Building2,
              color: 'text-[#232A5C]',
              bg: 'bg-[#232A5C]/10',
            },
            {
              method: 'POS / Card',
              amount: methodTotals['POS / Card'] || 0,
              desc: 'Front desk terminal payments & debit cards',
              icon: CreditCard,
              color: 'text-[#E2573A]',
              bg: 'bg-[#E2573A]/10',
            },
            {
              method: 'Cash',
              amount: methodTotals['Cash'] || 0,
              desc: 'In-studio cash payments received at consultation',
              icon: DollarSign,
              color: 'text-[#C9A24B]',
              bg: 'bg-[#C9A24B]/10',
            },
            {
              method: 'Paystack',
              amount: methodTotals['Paystack'] || 0,
              desc: 'Online invoice links & card gateway collections',
              icon: Sparkles,
              color: 'text-[#3F7D5C]',
              bg: 'bg-[#3F7D5C]/10',
            },
          ].map((channel) => {
            const share =
              totalCollectedRevenue > 0
                ? Math.round((channel.amount / totalCollectedRevenue) * 100)
                : 0;

            return (
              <div
                key={channel.method}
                className="bg-white p-5 rounded-2xl border border-[#E4DCD0] shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${channel.bg} ${channel.color}`}>
                    <channel.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs px-2 py-0.5 rounded-full bg-[#FAF6F0] text-stone-700 border border-[#E4DCD0]">
                    {share}% share
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-sm text-[#232A5C]">
                    {channel.method}
                  </h3>
                  <div className="text-2xl font-serif font-black text-[#232A5C] mt-1">
                    {formatNaira(channel.amount)}
                  </div>
                </div>

                <p className="text-[11px] text-stone-500 leading-relaxed">{channel.desc}</p>

                {/* Micro progress bar */}
                <div className="w-full bg-[#FAF6F0] h-2 rounded-full overflow-hidden border border-[#E4DCD0]">
                  <div
                    className="bg-[#232A5C] h-full rounded-full"
                    style={{ width: `${share}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK SETTLE / COMPLETE PAYMENT MODAL */}
      {settleOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E4DCD0] bg-[#FAF6F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#3F7D5C] text-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#232A5C]">
                    Mark Payment as Completed
                  </h3>
                  <span className="text-[11px] text-stone-500">
                    Order {settleOrder.orderNumber} • {settleOrder.customerName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSettleOrder(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmSettle} className="p-5 space-y-4 text-xs text-[#232A5C]">
              {/* Outstanding Balance Banner */}
              {(() => {
                const totalPaid = settleOrder.payments.reduce((sum, p) => sum + p.amount, 0);
                const remaining = Math.max(0, settleOrder.totalPrice - totalPaid);

                return (
                  <div className="p-4 rounded-xl bg-[#EDF5F0] border border-[#3F7D5C]/30 text-center">
                    <span className="text-[10px] uppercase font-bold text-[#3F7D5C] tracking-wider block font-serif">
                      Full Remaining Balance to Reconcile
                    </span>
                    <div className="text-3xl font-serif font-black text-[#3F7D5C] mt-1">
                      {formatNaira(remaining)}
                    </div>
                    <div className="text-[11px] text-stone-600 mt-1">
                      Total Quoted: {formatNaira(settleOrder.totalPrice)} • Paid to date: {formatNaira(totalPaid)}
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Payment Method Received
                </label>
                <select
                  value={settleMethod}
                  onChange={(e) => setSettleMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] text-xs font-semibold focus:outline-hidden focus:border-[#232A5C]"
                >
                  <option value="Bank Transfer">Bank Transfer (Direct Fashion Studio Deposit)</option>
                  <option value="POS / Card">POS / Card Terminal</option>
                  <option value="Cash">Cash Received at Fashion Studio</option>
                  <option value="Paystack">Paystack Online Payment</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Payment Settlement Notes
                </label>
                <input
                  type="text"
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  placeholder="e.g. Balance settled during collection fitting"
                  className="w-full px-3 py-2 rounded-xl border border-[#E4DCD0] bg-white text-xs focus:outline-hidden focus:border-[#232A5C]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSettleOrder(null)}
                  className="px-4 py-2 rounded-xl border border-[#E4DCD0] text-stone-600 hover:bg-stone-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#3F7D5C] hover:bg-[#326449] text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Full Settlement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT RECEIPT MODAL */}
      <PaymentReceiptModal
        isOpen={!!receiptOrder && !!receiptPayment}
        onClose={() => {
          setReceiptOrder(null);
          setReceiptPayment(null);
        }}
        order={receiptOrder}
        payment={receiptPayment}
        studio={currentStudio}
      />
    </div>
  );
};
