import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStageId, PaymentRecord } from '../../types';
import { DeliveryCountdownBadge, PriorityBadge, StageBadge } from '../brand/Badge';
import { calculateDeliveryCountdown } from '../../utils/dateUtils';
import { formatNaira, formatDate, formatDateTime } from '../../utils/formatters';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import {
  X,
  Clock,
  Printer,
  Copy,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Phone,
  MessageCircle,
  CreditCard,
  History,
  Send,
  Sparkles,
  FileText,
  Plus,
  CheckCircle2,
  Truck,
  ExternalLink,
} from 'lucide-react';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onOpenReschedule: (order: Order) => void;
  onPrintJobSheet: (order: Order) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onOpenReschedule,
  onPrintJobSheet,
}) => {
  const {
    stages,
    updateOrderStatus,
    logPayment,
    markOrderFullyPaid,
    reassignOrderStaff,
    duplicateOrder,
    currentRole,
    currentUser,
    currentStudio,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'garments' | 'payments' | 'history' | 'whatsapp'>('garments');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'POS / Card' | 'Cash' | 'Paystack'>('Bank Transfer');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [stageNote, setStageNote] = useState('');
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<PaymentRecord | null>(null);

  if (!order) return null;

  const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = order.totalPrice - totalPaid;
  const isDelivered = order.currentStage === 'delivered';
  const cd = calculateDeliveryCountdown(order.expectedDeliveryDate, isDelivered);

  const currentStageIndex = stages.findIndex((s) => s.id === order.currentStage);
  const nextStage = currentStageIndex < stages.length - 1 ? stages[currentStageIndex + 1] : null;
  const prevStage = currentStageIndex > 0 ? stages[currentStageIndex - 1] : null;

  const handleAdvanceStage = () => {
    if (!nextStage) return;
    const isOwner = currentRole === 'owner';
    const res = updateOrderStatus(order.id, nextStage.id, stageNote || undefined, undefined, isOwner);
    if (res.success) {
      setStageNote('');
    }
  };

  const handleStepBackStage = () => {
    if (!prevStage) return;
    const reason = window.prompt(
      `Enter reason for moving back from "${stages[currentStageIndex]?.name}" to "${prevStage.name}":`
    );
    if (reason !== null) {
      updateOrderStatus(order.id, prevStage.id, 'Moved backward', reason);
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    logPayment(order.id, {
      amount,
      method: paymentMethod,
      date: new Date().toISOString().split('T')[0],
      notes: paymentNotes || 'Balance payment',
    });

    setPaymentAmount('');
    setPaymentNotes('');
    setShowPaymentForm(false);
  };

  const handleQuickMarkFullyPaid = () => {
    if (balance <= 0) return;
    markOrderFullyPaid(order.id, paymentMethod, 'Final balance settled in full');
    setShowPaymentForm(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#E4DCD0] bg-[#FAF6F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#232A5C] text-white flex items-center justify-center font-mono font-bold text-sm shadow-xs">
              SE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono font-bold text-lg text-[#232A5C]">
                  {order.orderNumber}
                </h2>
                <PriorityBadge priority={order.priority} />
                <StageBadge stageId={order.currentStage} size="sm" />
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {order.customerName} • {order.occasion} • Placed {formatDate(order.orderDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Manager / Owner Reassign Staff (Manager Key Need: Reassigning work) */}
            {(currentRole === 'manager' || currentRole === 'owner') && (
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#E4DCD0] text-xs">
                <span className="text-[10px] text-stone-400 font-semibold uppercase">Lead:</span>
                <select
                  value={order.assignedStaff}
                  onChange={(e) => reassignOrderStaff(order.id, e.target.value)}
                  className="bg-transparent font-semibold text-[#232A5C] text-xs focus:outline-hidden cursor-pointer"
                  title="Manager: Reassign work to another tailor"
                >
                  {['Emeka Nwosu', 'Chidi Okafor', 'Babatunde Adeleke', 'Ngozi Eze', 'Amina Lawal'].map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Delivery Countdown Badge */}
            <DeliveryCountdownBadge
              expectedDeliveryDate={order.expectedDeliveryDate}
              isDelivered={isDelivered}
              size="md"
            />

            <button
              onClick={() => onPrintJobSheet(order)}
              className="p-2 rounded-lg bg-white border border-[#E4DCD0] hover:bg-[#FAF6F0] text-stone-700 transition-colors"
              title="Print Workshop Job Sheet (ORD-8)"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenReschedule(order)}
              className="p-2 rounded-lg bg-white border border-[#E4DCD0] hover:bg-[#FAF6F0] text-[#E2573A] transition-colors"
              title="Reschedule Expected Delivery Date (ORD-5)"
            >
              <Clock className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white border border-[#E4DCD0] hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stage Progress Bar (Horizontal 12-stage stepper) */}
        <div className="px-5 py-3 bg-[#ECE5DA] border-b border-[#E4DCD0] overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-[760px] text-[11px]">
            {stages.map((st, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={st.id} className="flex items-center gap-1 flex-1">
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium truncate w-full transition-colors ${isCurrent
                        ? 'bg-[#232A5C] text-white font-bold shadow-2xs'
                        : isPast
                          ? 'bg-[#EDF5F0] text-[#3F7D5C] font-semibold'
                          : 'bg-white/60 text-stone-400'
                      }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold border border-current shrink-0">
                      {isPast ? '✓' : st.stepNumber}
                    </span>
                    <span className="truncate">{st.name}</span>
                  </div>
                  {idx < stages.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-[#E4DCD0] bg-white px-5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('garments')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'garments'
                ? 'border-[#232A5C] text-[#232A5C] font-bold'
                : 'border-transparent text-stone-500 hover:text-[#232A5C]'
              }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Garment Items ({order.items.length})</span>
          </button>

          {currentRole !== 'production' && (
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'payments'
                  ? 'border-[#232A5C] text-[#232A5C] font-bold'
                  : 'border-transparent text-stone-500 hover:text-[#232A5C]'
                }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Payments & Balance</span>
              {balance > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#FBECE8] text-[#E2573A] font-bold">
                  Due
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'history'
                ? 'border-[#232A5C] text-[#232A5C] font-bold'
                : 'border-transparent text-stone-500 hover:text-[#232A5C]'
              }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Stage Audit History ({order.stageHistory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'whatsapp'
                ? 'border-[#232A5C] text-[#232A5C] font-bold'
                : 'border-transparent text-stone-500 hover:text-[#232A5C]'
              }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#3F7D5C]" />
            <span>WhatsApp Milestones ({order.whatsAppNotifications.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs text-[#232A5C]">
          {/* TAB 1: Garment Items */}
          {activeTab === 'garments' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Client Quick Card */}
                <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E4DCD0] space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 font-serif">
                    Client Details
                  </div>
                  <div className="font-bold text-sm text-[#232A5C]">{order.customerName}</div>
                  <div className="text-stone-600">
                    <div>{order.customerPhone}</div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href={`https://wa.me/${order.customerWhatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 bg-[#EDF5F0] text-[#3F7D5C] rounded-lg font-semibold flex items-center gap-1 hover:bg-[#3F7D5C] hover:text-white transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Chat</span>
                    </a>
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="px-2.5 py-1.5 bg-white border border-[#E4DCD0] text-stone-700 rounded-lg font-medium hover:bg-stone-50 transition-colors flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `https://app.strandend.com/track/${order.publicTrackingToken}`
                        );
                        showToast(
                          'success',
                          'Tracking Link Copied',
                          `Client link: /track/${order.publicTrackingToken}`
                        );
                      }}
                      className="px-2.5 py-1.5 bg-white border border-[#E4DCD0] text-stone-700 rounded-lg font-medium hover:bg-[#232A5C] hover:text-white transition-colors flex items-center gap-1"
                      title="Copy public client tracking link for WhatsApp/SMS (TRK-1)"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#E2573A]" />
                      <span>Client Tracker</span>
                    </button>
                  </div>
                </div>

                {/* Production Assignment Card */}
                <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E4DCD0] space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 font-serif">
                    Workshop Lead
                  </div>
                  <div className="font-bold text-sm text-[#232A5C]">{order.assignedStaff}</div>
                  <p className="text-[11px] text-stone-500">
                    Responsible for pattern cutting, sewing queue, and final hand finishes.
                  </p>
                  <div className="pt-1">
                    <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-[#E4DCD0] text-stone-700">
                      Studio: {currentStudio.name}
                    </span>
                  </div>
                </div>

                {/* Deadlines Card */}
                <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E4DCD0] space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 font-serif">
                    Delivery Target
                  </div>
                  <div className="font-bold text-sm text-[#232A5C]">
                    {formatDate(order.expectedDeliveryDate)}
                  </div>
                  <div className="text-stone-500">
                    Countdown: <strong className="text-[#232A5C]">{cd.label}</strong>
                  </div>
                  {order.deliveryDateChanges.length > 0 && (
                    <div className="text-[10px] text-[#E2573A] font-semibold bg-[#FBECE8] p-1.5 rounded">
                      Rescheduled {order.deliveryDateChanges.length} time(s). Last reason:{' '}
                      {order.deliveryDateChanges[order.deliveryDateChanges.length - 1].reason}
                    </div>
                  )}
                </div>
              </div>

              {/* Garment Items List */}
              <div>
                <h3 className="font-serif font-bold text-sm text-[#232A5C] mb-3">
                  Garment Specifications ({order.items.length})
                </h3>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="bg-white p-4 rounded-xl border border-[#E4DCD0] shadow-2xs space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-serif font-bold text-sm text-[#232A5C]">
                          {idx + 1}. {item.type}
                        </span>
                        {currentRole !== 'production' && (
                          <span className="font-serif font-bold text-sm text-[#232A5C]">
                            {formatNaira(item.price)}
                          </span>
                        )}
                      </div>

                      <p className="text-stone-600 leading-relaxed">{item.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] border-t border-stone-100">
                        <div>
                          <span className="text-stone-400">Fabric & Material:</span>
                          <span className="font-medium text-stone-800 ml-1 block">{item.fabric}</span>
                        </div>
                        <div>
                          <span className="text-stone-400">Fabric Source:</span>
                          <span
                            className={`font-semibold ml-1 block ${item.fabricSource === 'client_supplied'
                                ? 'text-[#C9A24B]'
                                : 'text-[#3F7D5C]'
                              }`}
                          >
                            {item.fabricSource === 'client_supplied'
                              ? 'Client Supplied'
                              : 'Studio Provided'}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400">Colour Palette:</span>
                          <span className="font-medium text-stone-800 ml-1 block">{item.colour}</span>
                        </div>
                      </div>

                      {item.styleNotes && (
                        <div className="bg-[#FAF6F0] p-2 rounded text-[11px] text-stone-700 mt-2">
                          <strong>Style Notes:</strong> {item.styleNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              {order.internalNotes && (
                <div className="bg-[#FAF6F0] p-3.5 rounded-xl border border-[#E4DCD0]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 font-serif mb-1">
                    Internal Workshop Notes
                  </div>
                  <p className="text-stone-700 leading-relaxed">{order.internalNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Payments & Balance (PAY-1, PAY-2) */}
          {activeTab === 'payments' && currentRole !== 'production' && (
            <div className="space-y-4">
              {/* Financial Summary Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E4DCD0]">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 font-serif font-bold">
                    Quoted Total Price
                  </span>
                  <div className="text-2xl font-serif font-bold text-[#232A5C] mt-1">
                    {formatNaira(order.totalPrice)}
                  </div>
                </div>

                <div className="bg-[#EDF5F0] p-4 rounded-xl border border-[#3F7D5C]/30">
                  <span className="text-[11px] uppercase tracking-wider text-[#3F7D5C] font-serif font-bold">
                    Total Paid to Date
                  </span>
                  <div className="text-2xl font-serif font-bold text-[#3F7D5C] mt-1">
                    {formatNaira(totalPaid)}
                  </div>
                  <span className="text-[10px] text-stone-500">
                    {Math.round((totalPaid / order.totalPrice) * 100)}% reconciled
                  </span>
                </div>

                <div
                  className={`p-4 rounded-xl border ${balance > 0
                      ? 'bg-[#FBECE8] border-[#E2573A]/40'
                      : 'bg-white border-[#E4DCD0]'
                    }`}
                >
                  <span
                    className={`text-[11px] uppercase tracking-wider font-serif font-bold ${balance > 0 ? 'text-[#E2573A]' : 'text-stone-500'
                      }`}
                  >
                    Outstanding Balance
                  </span>
                  <div
                    className={`text-2xl font-serif font-bold mt-1 ${balance > 0 ? 'text-[#E2573A]' : 'text-[#3F7D5C]'
                      }`}
                  >
                    {formatNaira(balance)}
                  </div>
                  <span className="text-[10px] text-stone-500">
                    {balance > 0 ? 'Required before Delivery' : 'Fully Paid'}
                  </span>
                </div>
              </div>

              {/* Log Payment Trigger & Form */}
              <div className="bg-white p-4 rounded-xl border border-[#E4DCD0] shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h3 className="font-serif font-bold text-sm text-[#232A5C]">
                    Payment Records ({order.payments.length})
                  </h3>
                  {balance > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleQuickMarkFullyPaid}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#3F7D5C] hover:bg-[#326449] text-white transition-colors flex items-center gap-1 shadow-2xs"
                        title="Mark full remaining balance as completed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Payment Completed ({formatNaira(balance)})</span>
                      </button>
                      <button
                        onClick={() => {
                          setPaymentAmount(balance.toString());
                          setShowPaymentForm(!showPaymentForm);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#232A5C] text-white hover:bg-[#E2573A] transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log Partial Payment</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-bold text-[#3F7D5C] bg-[#EDF5F0] px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#3F7D5C]/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Payment Completed in Full</span>
                    </span>
                  )}
                </div>

                {showPaymentForm && (
                  <form
                    onSubmit={handleRecordPayment}
                    className="mb-4 p-4 rounded-xl bg-[#FAF6F0] border border-[#E4DCD0] space-y-3 animate-in fade-in duration-150"
                  >
                    <div className="font-semibold text-xs text-[#232A5C]">Record Client Payment</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-stone-600 block mb-1">
                          Amount (₦)
                        </label>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder={`Max ${balance}`}
                          max={balance}
                          required
                          className="w-full px-3 py-1.5 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden focus:border-[#232A5C]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-stone-600 block mb-1">
                          Payment Method
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden focus:border-[#232A5C]"
                        >
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="POS / Card">POS / Card</option>
                          <option value="Cash">Cash</option>
                          <option value="Paystack">Paystack</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-stone-600 block mb-1">
                          Payment Notes
                        </label>
                        <input
                          type="text"
                          value={paymentNotes}
                          onChange={(e) => setPaymentNotes(e.target.value)}
                          placeholder="e.g. Balance settlement"
                          className="w-full px-3 py-1.5 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden focus:border-[#232A5C]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowPaymentForm(false)}
                        className="px-3 py-1.5 rounded-lg border border-[#E4DCD0] text-stone-600 text-xs hover:bg-stone-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-[#3F7D5C] text-white font-semibold text-xs hover:bg-[#326449]"
                      >
                        Confirm Payment
                      </button>
                    </div>
                  </form>
                )}

                {/* Payments Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500 text-[11px]">
                        <th className="py-2">Date</th>
                        <th className="py-2">Method</th>
                        <th className="py-2">Amount</th>
                        <th className="py-2">Recorded By</th>
                        <th className="py-2">Notes & Ref</th>
                        <th className="py-2 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {order.payments.map((p) => (
                        <tr key={p.id} className="hover:bg-stone-50">
                          <td className="py-2.5 font-medium">{formatDate(p.date)}</td>
                          <td className="py-2.5">{p.method}</td>
                          <td className="py-2.5 font-serif font-bold text-[#232A5C]">
                            {formatNaira(p.amount)}
                          </td>
                          <td className="py-2.5 text-stone-600">{p.recordedBy}</td>
                          <td className="py-2.5 text-stone-500">
                            {p.notes || '—'} {p.reference ? `(${p.reference})` : ''}
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => setSelectedPaymentForReceipt(p)}
                              className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] hover:bg-[#232A5C] text-[#232A5C] hover:text-white border border-[#E4DCD0] text-[11px] font-semibold transition-colors inline-flex items-center gap-1 shadow-2xs"
                              title="Generate Official Payment Receipt (PAY-2)"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Receipt</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Stage Audit History (ORD-4) */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#232A5C]">
                    Stage Audit Trail & Timestamp Log
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Timestamped history of every stage transition and staff note
                  </p>
                </div>
              </div>

              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4DCD0]">
                {order.stageHistory.map((hist, idx) => (
                  <div key={hist.id} className="relative pl-7 group">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#232A5C] absolute left-1.5 top-1.5 ring-4 ring-white" />
                    <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#E4DCD0] space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-[#232A5C]">
                          Stage: {stages.find((s) => s.id === hist.toStage)?.name || hist.toStage}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {formatDateTime(hist.timestamp)}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-600">
                        Updated by: <strong>{hist.userName}</strong>
                      </div>
                      {hist.note && <div className="text-[11px] text-stone-700 italic">"{hist.note}"</div>}
                      {hist.reason && (
                        <div className="text-[11px] text-[#8B1E1E] bg-[#FDECEC] p-1.5 rounded font-medium mt-1">
                          <strong>Reason:</strong> {hist.reason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WhatsApp Milestone Notifications (NOT-3) */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="bg-[#EDF5F0] p-4 rounded-xl border border-[#3F7D5C]/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#3F7D5C] font-bold text-sm">
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Business Automated Milestones (NOT-3)</span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Triggered automatically on milestone stages: Confirmed, Sewing, Fitting, Ready, Delivered.
                  </p>
                </div>
                <span className="text-[10px] bg-[#3F7D5C] text-white px-2 py-0.5 rounded font-semibold">
                  API Connected
                </span>
              </div>

              <div className="space-y-3">
                {order.whatsAppNotifications.map((wa) => (
                  <div
                    key={wa.id}
                    className="p-3.5 rounded-xl border border-[#E4DCD0] bg-white shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#232A5C]">
                        Recipient: {wa.recipientName} ({wa.recipientPhone})
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${wa.status === 'read'
                              ? 'bg-blue-100 text-blue-800'
                              : wa.status === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                        >
                          {wa.status}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {formatDateTime(wa.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#FAF6F0] border border-[#EBE3D7] text-stone-800 font-mono text-[11px] leading-relaxed">
                      {wa.messageText}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1">
                      <span>Template: {wa.templateName}</span>
                      <span>Meta Fee: ₦{wa.costNaira}</span>
                    </div>
                  </div>
                ))}

                {order.whatsAppNotifications.length === 0 && (
                  <div className="text-center py-10 text-stone-400 text-xs">
                    No WhatsApp milestone messages dispatched for this order yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Stage Control Footer */}
        <div className="p-4 border-t border-[#E4DCD0] bg-[#FAF6F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {prevStage && (
              <button
                onClick={handleStepBackStage}
                className="px-3 py-1.5 rounded-lg border border-[#E4DCD0] hover:bg-stone-100 text-stone-700 font-medium text-xs flex items-center gap-1"
                title="Move back a stage with reason"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Move Back ({prevStage.name})</span>
              </button>
            )}

            {(currentRole === 'owner' || currentRole === 'front_desk') && (
              <button
                onClick={() => duplicateOrder(order.id)}
                className="px-3 py-1.5 rounded-lg border border-[#E4DCD0] hover:bg-stone-100 text-stone-700 font-medium text-xs flex items-center gap-1"
                title="Duplicate as repeat client order template"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate Template</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Dispatch Record Delivery Button */}
            {currentRole === 'dispatch' && order.currentStage === 'ready_for_delivery' && (
              <button
                onClick={() => updateOrderStatus(order.id, 'delivered')}
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-[#3F7D5C] hover:bg-[#326449] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                title="Record final delivery to customer"
              >
                <Truck className="w-4 h-4" />
                <span>Record Customer Delivery</span>
              </button>
            )}

            {nextStage && currentRole !== 'dispatch' && (
              <button
                onClick={handleAdvanceStage}
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-[#232A5C] hover:bg-[#E2573A] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Advance to "{nextStage.name}"</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <PaymentReceiptModal
        isOpen={!!selectedPaymentForReceipt}
        onClose={() => setSelectedPaymentForReceipt(null)}
        order={order}
        payment={selectedPaymentForReceipt}
        studio={currentStudio}
      />
    </div>
  );
};

