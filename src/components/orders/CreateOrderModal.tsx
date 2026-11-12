import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GarmentItem, OrderPriority } from '../../types';
import { X, Plus, Trash2, Sparkles, UserPlus } from 'lucide-react';
import { formatNaira } from '../../utils/formatters';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose }) => {
  const { customers, createOrder, createCustomer, currentStudio } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers[0]?.id || ''
  );
  const [isInlineCustomer, setIsInlineCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerSource, setNewCustomerSource] = useState<'WhatsApp' | 'Instagram' | 'Walk-in'>('WhatsApp');

  const [occasion, setOccasion] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<OrderPriority>('normal');
  const [assignedStaff, setAssignedStaff] = useState('Emeka Nwosu (Master Cutter)');
  const [internalNotes, setInternalNotes] = useState('');

  // Items list
  const [items, setItems] = useState<GarmentItem[]>([
    {
      id: 'item-init-1',
      type: 'Aso-Ebi Corset Gown',
      description: 'Custom fitted gown with boned corset and side drape.',
      fabric: 'French Cord Lace & Duchess Silk',
      fabricSource: 'client_supplied',
      colour: 'Burnt Orange / Coral',
      styleNotes: 'Floor length with slit.',
      price: 180000,
    },
  ]);

  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'POS / Card' | 'Cash' | 'Paystack'>('Bank Transfer');

  if (!isOpen) return null;

  const totalPrice = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        type: 'Custom Garment',
        description: '',
        fabric: '',
        fabricSource: 'studio_provided',
        colour: '',
        styleNotes: '',
        price: 50000,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleUpdateItem = (index: number, field: keyof GarmentItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let client = customers.find((c) => c.id === selectedCustomerId);

    if (isInlineCustomer) {
      if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
        alert('Please provide new client name and phone.');
        return;
      }
      client = createCustomer({
        name: newCustomerName,
        phone: newCustomerPhone,
        whatsapp: newCustomerPhone.replace(/[^0-9+]/g, ''),
        source: newCustomerSource,
        tags: ['New Client'],
        consentToContact: true,
        whatsappOptOut: false,
        measurementSets: [],
      });
    }

    if (!client) {
      alert('Please select or create a client.');
      return;
    }

    createOrder({
      customerId: client.id,
      customerName: client.name,
      customerPhone: client.phone,
      customerWhatsapp: client.whatsapp,
      occasion: occasion || 'Custom Bespoke Order',
      orderDate,
      expectedDeliveryDate,
      priority,
      assignedStaff,
      items,
      totalPrice,
      depositAmount,
      internalNotes,
      payments: depositAmount > 0 ? [
        {
          id: `pay-${Date.now()}`,
          amount: depositAmount,
          method: paymentMethod,
          date: orderDate,
          recordedBy: currentStudio.ownerName,
          notes: 'Order confirmation deposit',
        }
      ] : [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E4DCD0] bg-[#FAF6F0] flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-serif font-bold text-lg text-[#232A5C]">Create New Studio Order</h2>
            <p className="text-xs text-stone-500">
              Register bespoke garment items, measurements link, delivery deadline and deposit.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#E4DCD0] hover:bg-stone-100 text-stone-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-5 text-xs text-[#232A5C]">
          {/* Customer Selection or Quick Inline Add */}
          <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E4DCD0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#232A5C]">
                1. Client Selection
              </span>
              <button
                type="button"
                onClick={() => setIsInlineCustomer(!isInlineCustomer)}
                className="text-[11px] text-[#E2573A] font-semibold hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isInlineCustomer ? 'Choose Existing Client' : '+ Add New Client Here'}</span>
              </button>
            </div>

            {!isInlineCustomer ? (
              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-1">
                  Select Existing Customer Profile
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] bg-white text-xs text-[#232A5C] focus:outline-hidden focus:border-[#232A5C]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) • {c.measurementSets.length} measurement sets
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="e.g. Mrs. Folashade Alakija"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden focus:border-[#232A5C]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    WhatsApp / Phone *
                  </label>
                  <input
                    type="text"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="+234 803 000 0000"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden focus:border-[#232A5C]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">Source</label>
                  <select
                    value={newCustomerSource}
                    onChange={(e) => setNewCustomerSource(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden focus:border-[#232A5C]"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Walk-in">Walk-in</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Occasion & Scheduling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-medium text-stone-600 block mb-1">
                Occasion / Event Title *
              </label>
              <input
                type="text"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="e.g. Wedding Reception, Owambe, Executive Suit"
                required
                className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden focus:border-[#232A5C]"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-stone-600 block mb-1">
                Expected Delivery Date *
              </label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden focus:border-[#232A5C]"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-stone-600 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden focus:border-[#232A5C]"
              >
                <option value="normal">Normal</option>
                <option value="rush">Rush</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Garment Items Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#232A5C]">
                2. Garment Pieces & Styling Details
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#FAF6F0] border border-[#E4DCD0] text-[#232A5C] hover:bg-[#EAE4D9] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Another Garment</span>
              </button>
            </div>

            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-[#E4DCD0] bg-white space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#232A5C]">Piece #{idx + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-stone-400 hover:text-[#8B1E1E]"
                      title="Remove piece"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">Garment Type *</label>
                    <input
                      type="text"
                      value={item.type}
                      onChange={(e) => handleUpdateItem(idx, 'type', e.target.value)}
                      placeholder="e.g. Corset Dress, 3-Piece Agbada"
                      required
                      className="w-full px-2.5 py-1.5 rounded-md border border-[#E4DCD0] text-xs focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">Fabric & Lace</label>
                    <input
                      type="text"
                      value={item.fabric}
                      onChange={(e) => handleUpdateItem(idx, 'fabric', e.target.value)}
                      placeholder="e.g. French Lace, Silk Wool"
                      className="w-full px-2.5 py-1.5 rounded-md border border-[#E4DCD0] text-xs focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">Fabric Source</label>
                    <select
                      value={item.fabricSource}
                      onChange={(e) => handleUpdateItem(idx, 'fabricSource', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md border border-[#E4DCD0] text-xs focus:outline-hidden"
                    >
                      <option value="client_supplied">Client Supplied Fabric</option>
                      <option value="studio_provided">Studio Provided Fabric</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">Colour Palette</label>
                    <input
                      type="text"
                      value={item.colour}
                      onChange={(e) => handleUpdateItem(idx, 'colour', e.target.value)}
                      placeholder="e.g. Emerald Green, White/Gold"
                      className="w-full px-2.5 py-1.5 rounded-md border border-[#E4DCD0] text-xs focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">Style / Tailoring Notes</label>
                    <input
                      type="text"
                      value={item.styleNotes}
                      onChange={(e) => handleUpdateItem(idx, 'styleNotes', e.target.value)}
                      placeholder="e.g. High slit, beaded neckline"
                      className="w-full px-2.5 py-1.5 rounded-md border border-[#E4DCD0] text-xs focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">Price (₦) *</label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleUpdateItem(idx, 'price', Number(e.target.value))}
                      required
                      className="w-full px-2.5 py-1.5 rounded-md border border-[#E4DCD0] text-xs font-bold font-serif focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing & Deposit Confirmation (PAY-1) */}
          <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E4DCD0] space-y-3">
            <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#232A5C]">
              3. Pricing & Deposit Confirmation
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-1">
                  Total Order Price (₦)
                </label>
                <div className="font-serif font-bold text-lg text-[#232A5C] py-1.5">
                  {formatNaira(totalPrice)}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-1">
                  Deposit Received (₦) *
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  max={totalPrice}
                  className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] bg-white text-xs font-bold text-[#232A5C] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-1">
                  Deposit Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="POS / Card">POS / Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Paystack">Paystack</option>
                </select>
              </div>
            </div>
          </div>

          {/* Workshop Staff Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-stone-600 block mb-1">
                Assigned Workshop Lead *
              </label>
              <select
                value={assignedStaff}
                onChange={(e) => setAssignedStaff(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden"
              >
                <option value="Emeka Nwosu (Master Cutter)">Emeka Nwosu (Master Cutter)</option>
                <option value="Folake Adeleke">Folake Adeleke (Studio Manager)</option>
                <option value="Deola Adeyemi">Deola Adeyemi (Lead Designer)</option>
                <option value="Babatunde Gbadamosi">Babatunde Gbadamosi (Finisher/Dispatch)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-stone-600 block mb-1">
                Internal Workshop Notes
              </label>
              <input
                type="text"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Any special handling, VIP tag, or delivery notes"
                className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[#E4DCD0] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E4DCD0] text-stone-600 text-xs font-medium hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#E2573A] text-white font-semibold text-xs hover:bg-[#D0482B] shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Confirm & Register Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

