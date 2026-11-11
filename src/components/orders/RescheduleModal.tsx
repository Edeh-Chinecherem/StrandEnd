import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { X, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface RescheduleModalProps {
  order: Order | null;
  onClose: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({ order, onClose }) => {
  const { rescheduleOrderDelivery } = useApp();

  const [newDate, setNewDate] = useState(
    order?.expectedDeliveryDate || new Date().toISOString().split('T')[0]
  );
  const [reason, setReason] = useState('');

  if (!order) return null;

  const quickReasons = [
    'Client requested fitting alteration & extra time',
    'Fabric delivery delayed from textile supplier',
    'Client postponed occasion date',
    'Hand embroidery & embellishment extension',
    'Studio quality check rework required',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('A recorded reason is mandatory when rescheduling an expected delivery date (PRD Section 4.2).');
      return;
    }

    rescheduleOrderDelivery(order.id, newDate, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-[#E4DCD0] bg-[#FAF6F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#E2573A]" />
            <h3 className="font-serif font-bold text-sm text-[#232A5C]">
              Reschedule Delivery Date (ORD-5)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-[#232A5C]">
          <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#E4DCD0]">
            <div className="text-[11px] text-stone-500">Order Reference:</div>
            <div className="font-bold text-sm text-[#232A5C]">
              {order.orderNumber} — {order.customerName}
            </div>
            <div className="text-[11px] text-stone-600 mt-1">
              Current Target Date:{' '}
              <strong className="text-[#232A5C]">{formatDate(order.expectedDeliveryDate)}</strong>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-stone-700 block mb-1">
              New Expected Delivery Date *
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] text-xs focus:outline-hidden focus:border-[#232A5C]"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-stone-700 block mb-1">
              Mandatory Reschedule Reason (Logged into Audit Trail) *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Client requested 3-day extension after first fitting..."
              required
              className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] text-xs focus:outline-hidden focus:border-[#232A5C]"
            />

            {/* Quick Reason Suggestions */}
            <div className="mt-2 space-y-1">
              <span className="text-[10px] text-stone-400 block font-medium">Quick suggestions:</span>
              <div className="flex flex-wrap gap-1">
                {quickReasons.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReason(q)}
                    className="text-[10px] bg-[#FAF6F0] hover:bg-[#F2EDE4] px-2 py-0.5 rounded border border-[#E4DCD0] text-stone-700 text-left transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#FBECE8] rounded-lg text-[11px] text-[#E2573A] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              This update will adjust the delivery countdown badge and be logged with your user timestamp.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[#E4DCD0] text-stone-600 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#E2573A] text-white font-semibold text-xs hover:bg-[#D0482B] transition-colors"
            >
              Save & Log Reschedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

