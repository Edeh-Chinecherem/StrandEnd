import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../brand/Logo';
import { formatDate } from '../../utils/formatters';
import { calculateDeliveryCountdown } from '../../utils/dateUtils';
import {
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageCircle,
  Scissors,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const PublicTrackingPage: React.FC = () => {
  const { orders, currentStudio, stages } = useApp();

  const [inputToken, setInputToken] = useState(orders[0]?.publicTrackingToken || 'TRK-NNENNA-42');
  const [activeOrder, setActiveOrder] = useState(orders[0]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = orders.find(
      (o) =>
        o.publicTrackingToken.toLowerCase() === inputToken.trim().toLowerCase() ||
        o.orderNumber.toLowerCase() === inputToken.trim().toLowerCase()
    );
    if (found) {
      setActiveOrder(found);
    } else {
      alert('Order tracking token not found. Please verify the link from your studio notification.');
    }
  };

  const isDelivered = activeOrder?.currentStage === 'delivered';
  const cd = activeOrder ? calculateDeliveryCountdown(activeOrder.expectedDeliveryDate, isDelivered) : null;
  const currentStageIndex = activeOrder
    ? stages.findIndex((s) => s.id === activeOrder.currentStage)
    : 0;

  return (
    <div className="min-h-screen bg-[#F7F2EA] text-[#232A5C] flex flex-col justify-between select-none">
      {/* Public Branded Top Nav */}
      <header className="bg-white border-b border-[#E4DCD0] py-4 px-6 shadow-2xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Logo variant="full" theme="light" size="md" showTagline={true} />
          <div className="text-right">
            <span className="text-[11px] text-stone-500 block">Studio Partner</span>
            <span className="font-serif font-bold text-xs text-[#232A5C]">{currentStudio.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 w-full flex-1 space-y-6">
        {/* Token Search Bar */}
        <form
          onSubmit={handleSearch}
          className="bg-white p-3.5 rounded-2xl border border-[#E4DCD0] shadow-xs flex items-center gap-2"
        >
          <Search className="w-4 h-4 text-stone-400 ml-2" />
          <input
            type="text"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            placeholder="Enter Order # or Tracking Code (e.g. TRK-NNENNA-42)..."
            className="flex-1 bg-transparent text-xs text-[#232A5C] font-mono focus:outline-hidden"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#232A5C] hover:bg-[#E2573A] text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Track Order
          </button>
        </form>

        {activeOrder ? (
          <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-md p-6 sm:p-8 space-y-6">
            {/* Top Order Overview Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E4DCD0] gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#E2573A]">
                  Client Order Tracking
                </span>
                <h1 className="font-serif font-bold text-2xl text-[#232A5C] mt-0.5">
                  {activeOrder.customerName}
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Occasion: <strong>{activeOrder.occasion}</strong> • Order #{activeOrder.orderNumber}
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">
                  Expected Delivery
                </span>
                <div className="font-serif font-bold text-lg text-[#232A5C] mt-0.5">
                  {formatDate(activeOrder.expectedDeliveryDate)}
                </div>
                {cd && (
                  <span className="text-xs font-semibold text-[#3F7D5C] mt-0.5 inline-block">
                    {cd.label}
                  </span>
                )}
              </div>
            </div>

            {/* Stage Progress Stepper (TRK-1: Simple visual status without pricing) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-serif font-bold text-sm text-[#232A5C]">
                  Current Fashion Studio Stage:
                </span>
                <span className="px-3 py-1 rounded-full bg-[#FAF6F0] font-bold text-[#E2573A] border border-[#E4DCD0]">
                  {stages[currentStageIndex]?.name || activeOrder.currentStage}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#FAF6F0] h-3.5 rounded-full overflow-hidden border border-[#E4DCD0] p-0.5">
                <div
                  className="bg-gradient-to-r from-[#232A5C] via-[#C9A24B] to-[#E2573A] h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.round(((currentStageIndex + 1) / 11) * 100))}%`,
                  }}
                />
              </div>

              {/* Key Client Milestones */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
                {[
                  { name: 'Deposit Confirmed', step: 3 },
                  { name: 'Sewing Assembly', step: 7 },
                  { name: 'Fitting Ready', step: 8 },
                  { name: 'Delivered / Ready', step: 10 },
                ].map((ms) => {
                  const passed = currentStageIndex + 1 >= ms.step;
                  return (
                    <div
                      key={ms.name}
                      className={`p-2 rounded-xl border transition-colors ${
                        passed
                          ? 'bg-[#EDF5F0] border-[#3F7D5C]/30 text-[#3F7D5C] font-semibold'
                          : 'bg-[#FAF6F0] border-[#E4DCD0] text-stone-400'
                      }`}
                    >
                      <div className="text-[10px] uppercase tracking-wider">{passed ? '✓ Done' : 'Next'}</div>
                      <div className="text-xs mt-0.5">{ms.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Garment Pieces (No internal costs/pricing shown, honoring TRK-1) */}
            <div className="pt-4 border-t border-[#E4DCD0] space-y-3">
              <h3 className="font-serif font-bold text-sm text-[#232A5C]">
                Garments Tailored for this Order
              </h3>
              <div className="space-y-2">
                {activeOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-[#E4DCD0] bg-[#FAF6F0] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#232A5C]">{item.type}</div>
                      <div className="text-stone-500 text-[11px] mt-0.5">
                        Fabric: {item.fabric} ({item.colour})
                      </div>
                    </div>
                    <span className="text-[11px] bg-white px-2.5 py-1 rounded-md border border-[#E4DCD0] font-medium text-stone-700">
                      In Hand-Tailoring
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Studio Contact Footer */}
            <div className="pt-6 border-t border-[#E4DCD0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-serif font-bold text-sm text-[#232A5C]">{currentStudio.name}</div>
                <div className="text-[11px] text-stone-500">{currentStudio.address}</div>
              </div>

              <a
                href={`https://wa.me/${currentStudio.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#3F7D5C] hover:bg-[#326449] text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message Studio on WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-[#E4DCD0] text-stone-400">
            No active order selected.
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="py-4 text-center text-xs text-stone-500 border-t border-[#E4DCD0]">
        Powered by{' '}
        <strong className="text-[#232A5C]">
          Strand<span className="text-[#E2573A]">End</span>
        </strong>{' '}
        — End the stranded feeling for fashion studios.
      </footer>
    </div>
  );
};

