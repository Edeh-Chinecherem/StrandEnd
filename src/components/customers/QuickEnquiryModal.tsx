import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lead } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  X,
  Zap,
  MessageSquare,
  Phone,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface QuickEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrder: (order: any) => void;
}

export const QuickEnquiryModal: React.FC<QuickEnquiryModalProps> = ({
  isOpen,
  onClose,
  onOpenOrder,
}) => {
  const { leads, createLead, convertLeadToOrder } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('WhatsApp');
  const [occasion, setOccasion] = useState('');
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    createLead({
      name,
      phone,
      source,
      occasion,
      followUpDate,
      notes,
      status: 'new',
    });

    setName('');
    setPhone('');
    setOccasion('');
    setNotes('');
  };

  const handleConvert = (leadId: string) => {
    const order = convertLeadToOrder(leadId);
    onClose();
    onOpenOrder(order);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E4DCD0] bg-[#FAF6F0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E2573A] text-white">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#232A5C]">
                Quick Enquiry & Lead Capture (&lt;30s)
              </h2>
              <p className="text-xs text-stone-500">
                Log prospective clients quickly from WhatsApp, IG, or walk-ins. Convert to an order in 1 click!
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6 text-xs text-[#232A5C]">
          {/* Quick-add Form (LEAD-1) */}
          <form onSubmit={handleSubmit} className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E4DCD0] space-y-3">
            <div className="font-serif font-bold text-xs uppercase tracking-wider text-[#232A5C] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E2573A]" />
              <span>Log New Lead (&lt;30 Seconds)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-stone-700 block mb-1">
                  Prospective Client Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bukky Shonibare"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden focus:border-[#232A5C]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-stone-700 block mb-1">
                  Phone / WhatsApp *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 803 000 0000"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden focus:border-[#232A5C]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-stone-700 block mb-1">Lead Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Instagram DM">Instagram DM</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Referral">Referral</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-stone-700 block mb-1">
                  Garment Interest / Occasion
                </label>
                <input
                  type="text"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="e.g. Owambe lace dress for Dec 20"
                  className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-stone-700 block mb-1">
                  Style Notes & Follow-up Target
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Wants samples of champagne brocade sent via WhatsApp"
                    className="flex-1 px-3 py-2 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden"
                  />
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-36 px-2.5 py-2 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#232A5C] hover:bg-[#E2573A] text-white font-semibold text-xs transition-colors shadow-xs"
              >
                Save Enquiry Record
              </button>
            </div>
          </form>

          {/* Existing Leads List with 1-Click Convert (LEAD-2) */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-sm text-[#232A5C]">
              Active Studio Enquiries ({leads.length})
            </h3>

            <div className="divide-y divide-stone-100 border border-[#E4DCD0] rounded-xl overflow-hidden bg-white">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF6F0] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#232A5C]">{lead.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                        {lead.source}
                      </span>
                      {lead.status === 'converted' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EDF5F0] text-[#3F7D5C] font-bold">
                          Converted to Order ✓
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FBECE8] text-[#E2573A] font-bold">
                          Follow-up: {formatDate(lead.followUpDate)}
                        </span>
                      )}
                    </div>
                    <div className="text-stone-600">{lead.phone} • {lead.occasion || 'General Bespoke'}</div>
                    {lead.notes && <div className="text-[11px] text-stone-500 italic">"{lead.notes}"</div>}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <a
                      href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-lg border border-[#E4DCD0] bg-white text-stone-700 hover:bg-stone-50 text-xs font-medium flex items-center gap-1"
                      title="Follow up on WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#3F7D5C]" />
                      <span>WhatsApp</span>
                    </a>

                    {lead.status !== 'converted' && (
                      <button
                        onClick={() => handleConvert(lead.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#E2573A] hover:bg-[#D0482B] text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                        title="1-click convert enquiry into customer & order (LEAD-2)"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Convert to Order</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {leads.length === 0 && (
                <div className="text-center py-8 text-stone-400 text-xs">
                  No active enquiries logged. Use the quick form above to log leads in &lt;30s!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
