import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, Order } from '../../types';
import { StageBadge } from '../brand/Badge';
import { formatNaira, formatDate } from '../../utils/formatters';
import {
  X,
  Phone,
  MessageCircle,
  Ruler,
  ShoppingBag,
  Plus,
  ShieldCheck,
  Calendar,
  Tag,
  Edit2,
  Check,
} from 'lucide-react';

interface CustomerDetailModalProps {
  customer: Customer | null;
  onClose: () => void;
  onOpenAddMeasurement: (customer: Customer) => void;
  onOpenOrder: (order: Order) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
  onOpenAddMeasurement,
  onOpenOrder,
}) => {
  const { orders, updateCustomer, currentRole } = useApp();

  const [activeTab, setActiveTab] = useState<'measurements' | 'orders' | 'notes'>('measurements');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(customer?.notes || '');

  if (!customer) return null;

  const clientOrders = orders.filter((o) => o.customerId === customer.id);
  const totalSpend = clientOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  const handleSaveNotes = () => {
    updateCustomer(customer.id, { notes: editedNotes });
    setIsEditingNotes(false);
  };

  const toggleConsent = () => {
    updateCustomer(customer.id, { consentToContact: !customer.consentToContact });
  };

  const toggleWhatsAppOptOut = () => {
    updateCustomer(customer.id, { whatsappOptOut: !customer.whatsappOptOut });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#E4DCD0] bg-[#FAF6F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#232A5C] text-[#F7F2EA] font-serif font-bold text-lg flex items-center justify-center shrink-0">
              {customer.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg text-[#232A5C]">{customer.name}</h2>
                {customer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-[#FBF6EB] text-[#C9A24B] font-bold border border-[#C9A24B]/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-xs text-stone-500 mt-0.5">
                Client since {formatDate(customer.dateAdded)} • Source: {customer.source}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${customer.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#EDF5F0] hover:bg-[#3F7D5C] hover:text-white text-[#3F7D5C] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
            <a
              href={`tel:${customer.phone}`}
              className="px-3 py-1.5 rounded-lg border border-[#E4DCD0] bg-white text-stone-700 hover:bg-stone-100 text-xs font-medium flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Call</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#E4DCD0] hover:bg-stone-100 text-stone-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Client KPI & Contact Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-[#ECE5DA] border-b border-[#E4DCD0] text-xs">
          <div>
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Phone & SMS</span>
            <div className="font-semibold text-[#232A5C] mt-0.5 truncate">{customer.phone}</div>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Email Address</span>
            <div className="font-semibold text-[#232A5C] mt-0.5 truncate">
              {customer.email || 'None on file'}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
              {currentRole === 'production' ? 'Studio Orders' : 'Orders & Spend'}
            </span>
            <div className="font-serif font-bold text-[#232A5C] mt-0.5">
              {clientOrders.length} orders {currentRole !== 'production' && `(${formatNaira(totalSpend)})`}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Fitting Sets</span>
            <div className="font-semibold text-[#232A5C] mt-0.5">
              {customer.measurementSets.length} recorded sets
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-[#E4DCD0] bg-white px-5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('measurements')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'measurements'
                ? 'border-[#232A5C] text-[#232A5C] font-bold'
                : 'border-transparent text-stone-500 hover:text-[#232A5C]'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Measurement Sets ({customer.measurementSets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-[#232A5C] text-[#232A5C] font-bold'
                : 'border-transparent text-stone-500 hover:text-[#232A5C]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Order History ({clientOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-[#232A5C] text-[#232A5C] font-bold'
                : 'border-transparent text-stone-500 hover:text-[#232A5C]'
            }`}
          >
            <span>Notes & Privacy</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-[#232A5C]">
          {/* TAB 1: Measurement Sets (CUS-4) */}
          {activeTab === 'measurements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#232A5C]">
                    Recorded Fitting Measurement Sets
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Dated sets preserve measurements for wedding seasons, traditional Agbada or casual wear.
                  </p>
                </div>
                <button
                  onClick={() => onOpenAddMeasurement(customer)}
                  className="px-3 py-1.5 rounded-lg bg-[#232A5C] hover:bg-[#E2573A] text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Record New Set</span>
                </button>
              </div>

              <div className="space-y-4">
                {customer.measurementSets.map((set) => (
                  <div
                    key={set.id}
                    className="p-4 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-[#232A5C]">
                          {set.label}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          Taken: {formatDate(set.date)} by {set.takenBy}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-stone-700 border border-[#E0D7CA]">
                        Unit: {set.measurements?.unit || 'inches'}
                      </span>
                    </div>

                    {/* Measurements Values Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {Object.entries(set.measurements || {})
                        .filter(
                          ([k, v]) => k !== 'unit' && k !== 'specialNotes' && v !== undefined
                        )
                        .map(([key, val]) => (
                          <div
                            key={key}
                            className="bg-white p-2 rounded-lg border border-[#EBE3D7] text-center"
                          >
                            <span className="text-[10px] text-stone-500 block truncate capitalize">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </span>
                            <span className="font-mono font-bold text-sm text-[#232A5C] mt-0.5 block">
                              {String(val)}"
                            </span>
                          </div>
                        ))}
                    </div>

                    {set.measurements?.specialNotes && (
                      <div className="bg-white p-2.5 rounded-lg border border-[#EBE3D7] text-[11px] text-stone-700">
                        <strong>Tailoring Notes:</strong> {set.measurements.specialNotes}
                      </div>
                    )}
                  </div>
                ))}

                {customer.measurementSets.length === 0 && (
                  <div className="text-center py-10 text-stone-400">
                    <Ruler className="w-8 h-8 mx-auto text-stone-300 mb-1" />
                    <p className="text-sm font-serif">No measurement sets recorded yet</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Take client measurements to link to workshop cutting tickets.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Order History (CUS-5) */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-sm text-[#232A5C]">
                Order History & Lifetime Purchases
              </h3>
              <div className="divide-y divide-stone-100 border border-[#E4DCD0] rounded-xl overflow-hidden bg-white">
                {clientOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => onOpenOrder(ord)}
                    className="p-3.5 hover:bg-[#FAF6F0] transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#232A5C]">
                          {ord.orderNumber}
                        </span>
                        <StageBadge stageId={ord.currentStage} size="sm" />
                      </div>
                      <div className="font-semibold text-xs text-stone-800 mt-1">{ord.occasion}</div>
                      <div className="text-[11px] text-stone-500">
                        {ord.items.map((i) => i.type).join(', ')} • Ordered: {formatDate(ord.orderDate)}
                      </div>
                    </div>

                    <div className="text-right">
                      {currentRole !== 'production' && (
                        <div className="font-serif font-bold text-sm text-[#232A5C]">
                          {formatNaira(ord.totalPrice)}
                        </div>
                      )}
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        Due: {formatDate(ord.expectedDeliveryDate)}
                      </div>
                    </div>
                  </div>
                ))}

                {clientOrders.length === 0 && (
                  <div className="text-center py-8 text-stone-400 text-xs">
                    No orders placed by this client yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Notes & Privacy (NDPA 2023 Compliance) */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Client Notes */}
              <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E4DCD0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#232A5C]">
                    Style Preferences & Studio Notes
                  </span>
                  {!isEditingNotes ? (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="text-stone-500 hover:text-[#232A5C] text-xs flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveNotes}
                      className="text-[#3F7D5C] font-semibold text-xs flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                  )}
                </div>

                {!isEditingNotes ? (
                  <p className="text-stone-700 leading-relaxed">
                    {customer.notes || 'No specific style preferences recorded.'}
                  </p>
                ) : (
                  <textarea
                    rows={3}
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#E4DCD0] text-xs focus:outline-hidden"
                  />
                )}
              </div>

              {/* Nigeria Data Protection Act 2023 Consent & Preferences (Section 5) */}
              <div className="bg-white p-4 rounded-xl border border-[#E4DCD0] space-y-3">
                <div className="flex items-center gap-2 text-stone-800 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#3F7D5C]" />
                  <span>Privacy & Notification Consent (NDPA 2023)</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Consent records allow sending automated milestone status updates to the client's WhatsApp number.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customer.consentToContact}
                      onChange={toggleConsent}
                      className="rounded border-stone-300 text-[#232A5C] focus:ring-0"
                    />
                    <span className="text-xs text-stone-700">Consent to contact recorded</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customer.whatsappOptOut}
                      onChange={toggleWhatsAppOptOut}
                      className="rounded border-stone-300 text-[#E2573A] focus:ring-0"
                    />
                    <span className="text-xs text-stone-700">Opt out of WhatsApp milestone updates</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

