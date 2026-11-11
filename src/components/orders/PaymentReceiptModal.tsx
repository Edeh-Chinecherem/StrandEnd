import React from 'react';
import { Order, PaymentRecord, Studio } from '../../types';
import { Logo } from '../brand/Logo';
import { formatNaira, formatDate, formatDateTime } from '../../utils/formatters';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  payment: PaymentRecord | null;
  studio: Studio;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  payment,
  studio,
}) => {
  if (!isOpen || !order || !payment) return null;

  const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingBalance = Math.max(0, order.totalPrice - totalPaid);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-2xl w-full max-w-xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-full">
        {/* Top Control Bar (Hidden during print) */}
        <div className="p-3 sm:p-4 border-b border-[#E4DCD0] bg-[#FAF6F0] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-serif text-[#232A5C] uppercase tracking-wider">
              Official Payment Receipt (PAY-2)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#232A5C] hover:bg-[#E2573A] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 font-sans text-stone-800 bg-white print:p-6 print:overflow-visible">
          {/* Receipt Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-[#232A5C]">
            <div>
              <div className="flex items-center gap-2">
                <Logo variant="stitch" theme="light" size="sm" />
                <h1 className="font-serif font-black text-xl text-[#232A5C] tracking-tight">
                  {studio.name}
                </h1>
              </div>
              <div className="text-xs text-stone-600 mt-1 max-w-xs leading-relaxed">
                {studio.tagline || 'Luxury Bespoke Tailoring & Fashion Studio'}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                {studio.address || 'Lagos, Nigeria'} • {studio.phone || '+234 800 000 0000'}
              </div>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-2.5 py-0.5 rounded bg-[#FAF6F0] border border-[#E4DCD0] text-[10px] font-bold uppercase tracking-widest text-[#232A5C]">
                Payment Receipt
              </span>
              <div className="font-mono text-sm font-bold text-[#232A5C] mt-1.5">
                RCP-{payment.id.toUpperCase().slice(-8)}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                Date: {formatDate(payment.date)}
              </div>
            </div>
          </div>

          {/* Client & Order Reference */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF6F0] border border-[#E4DCD0] text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 font-serif block">
                Received From
              </span>
              <div className="font-bold text-sm text-[#232A5C] mt-0.5">
                {order.customerName}
              </div>
              <div className="text-stone-600 mt-0.5">{order.customerPhone}</div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 font-serif block">
                Order Reference
              </span>
              <div className="font-mono font-bold text-[#232A5C] mt-0.5">
                {order.orderNumber}
              </div>
              <div className="text-stone-600 mt-0.5">
                {order.occasion} • Due: {formatDate(order.expectedDeliveryDate)}
              </div>
            </div>
          </div>

          {/* Amount Paid Callout */}
          <div className="p-5 rounded-2xl bg-[#EDF5F0] border border-[#3F7D5C]/30 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3F7D5C] block">
              Amount Received
            </span>
            <div className="font-serif font-black text-3xl sm:text-4xl text-[#3F7D5C] mt-1">
              {formatNaira(payment.amount)}
            </div>
            <div className="text-xs text-stone-600 mt-1 font-medium">
              Payment Method: <span className="font-bold text-[#232A5C]">{payment.method}</span>
              {payment.reference && ` • Ref: ${payment.reference}`}
            </div>
          </div>

          {/* Breakdown Ledger Table */}
          <div className="border border-[#E4DCD0] rounded-xl overflow-hidden text-xs">
            <div className="bg-[#FAF6F0] px-4 py-2 font-bold font-serif text-[#232A5C] border-b border-[#E4DCD0]">
              Account Summary for Order {order.orderNumber}
            </div>
            <div className="divide-y divide-[#E4DCD0]">
              <div className="px-4 py-2.5 flex justify-between text-stone-600">
                <span>Total Quoted Garments Price:</span>
                <span className="font-medium text-stone-900">{formatNaira(order.totalPrice)}</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between text-stone-600">
                <span>Total Cumulative Payments:</span>
                <span className="font-medium text-[#3F7D5C]">{formatNaira(totalPaid)}</span>
              </div>
              <div className="px-4 py-3 flex justify-between font-bold bg-[#FAF6F0] text-[#232A5C]">
                <span>Outstanding Balance Remaining:</span>
                <span className={remainingBalance > 0 ? 'text-[#E2573A]' : 'text-[#3F7D5C]'}>
                  {formatNaira(remainingBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Notes & Recorded By */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 text-xs text-stone-600 pt-2">
            <div>
              {payment.notes && (
                <div className="text-[11px] bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                  <span className="font-semibold text-stone-700">Payment Notes:</span> {payment.notes}
                </div>
              )}
              <div className="text-[11px] text-stone-400 mt-1">
                Recorded by: <span className="font-medium text-stone-700">{payment.recordedBy}</span>
              </div>
            </div>

            <div className="text-center sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 sm:ml-auto">
              <div className="w-36 h-10 border-b border-stone-400 mx-auto sm:ml-auto"></div>
              <span className="text-[10px] text-stone-500 font-medium block mt-1">
                Authorized Studio Stamp / Signature
              </span>
            </div>
          </div>

          {/* Terms Footer */}
          <div className="pt-4 border-t border-stone-200 text-[10px] text-stone-400 text-center leading-relaxed">
            All custom tailoring orders are subject to studio terms. Minimum 70% deposit is required before pattern drafting and cutting. Balance must be fully reconciled prior to garment collection or dispatch.
            <div className="font-serif text-[#232A5C] font-semibold mt-1">
              StrandEnd Fashion Studio Workflow • "End the stranded feeling."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
