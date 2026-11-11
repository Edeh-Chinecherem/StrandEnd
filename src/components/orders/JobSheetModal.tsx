import React from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { Logo } from '../brand/Logo';
import { formatDate } from '../../utils/formatters';
import { X, Printer, Scissors, CheckSquare } from 'lucide-react';

interface JobSheetModalProps {
  order: Order | null;
  onClose: () => void;
}

export const JobSheetModal: React.FC<JobSheetModalProps> = ({ order, onClose }) => {
  const { currentStudio, customers } = useApp();

  if (!order) return null;

  const customer = customers.find((c) => c.id === order.customerId);
  const latestMeasurements = customer?.measurementSets[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print p-4 border-b border-[#E4DCD0] bg-[#FAF6F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#232A5C]" />
            <h3 className="font-serif font-bold text-sm text-[#232A5C]">
              Workshop Cutting Ticket & Job Sheet (ORD-8)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-[#232A5C] hover:bg-[#E2573A] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Job Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#E4DCD0] hover:bg-stone-100 text-stone-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Job Sheet Document */}
        <div className="p-8 overflow-y-auto flex-1 text-black font-sans bg-white print:p-0">
          {/* Header */}
          <div className="border-b-2 border-black pb-4 flex items-start justify-between">
            <div>
              <div className="font-serif text-2xl font-bold tracking-tight text-[#232A5C]">
                {currentStudio.name}
              </div>
              <div className="text-xs text-stone-600 mt-0.5">{currentStudio.address}</div>
              <div className="text-xs text-stone-600">Tel: {currentStudio.phone}</div>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-black text-white font-mono font-bold text-sm rounded">
                JOB SHEET
              </div>
              <div className="font-mono font-bold text-lg text-black mt-1">
                {order.orderNumber}
              </div>
              <div className="text-xs font-semibold uppercase text-stone-700">
                Priority: {order.priority}
              </div>
            </div>
          </div>

          {/* Order & Client Info */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-stone-300 text-xs">
            <div>
              <span className="text-stone-500 block uppercase tracking-wider text-[10px] font-bold">
                Client Details
              </span>
              <div className="font-bold text-sm text-black mt-0.5">{order.customerName}</div>
              <div className="text-stone-700">{order.customerPhone}</div>
              <div className="text-stone-600 mt-1">Occasion: <strong>{order.occasion}</strong></div>
            </div>

            <div>
              <span className="text-stone-500 block uppercase tracking-wider text-[10px] font-bold">
                Production Schedule
              </span>
              <div className="text-stone-700 mt-0.5">
                Date Sourced: <strong>{formatDate(order.orderDate)}</strong>
              </div>
              <div className="text-sm font-bold text-black mt-1">
                DELIVERY TARGET: {formatDate(order.expectedDeliveryDate)}
              </div>
              <div className="text-stone-600 mt-1">
                Assigned Workshop Lead: <strong>{order.assignedStaff}</strong>
              </div>
            </div>
          </div>

          {/* Garments Specifications */}
          <div className="py-4 border-b border-stone-300">
            <h4 className="font-serif font-bold text-sm uppercase tracking-wider mb-2">
              Garment Cutting Specifications
            </h4>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="border border-stone-300 rounded p-3 text-xs bg-stone-50/50">
                  <div className="font-bold text-sm text-black">
                    Piece #{idx + 1}: {item.type}
                  </div>
                  <div className="text-stone-700 mt-1">{item.description}</div>
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-stone-200 text-[11px]">
                    <div>
                      <span className="text-stone-500">Fabric:</span> <strong>{item.fabric}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500">Source:</span>{' '}
                      <strong>
                        {item.fabricSource === 'client_supplied' ? 'Client Supplied' : 'Studio Sourced'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-500">Colour:</span> <strong>{item.colour}</strong>
                    </div>
                  </div>
                  {item.styleNotes && (
                    <div className="mt-2 text-[11px] text-stone-800">
                      <strong>Tailor Notes:</strong> {item.styleNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Client Bespoke Measurements Table */}
          <div className="py-4 border-b border-stone-300">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-serif font-bold text-sm uppercase tracking-wider">
                Bespoke Measurements ({latestMeasurements?.label || 'Studio Profile Fit'})
              </h4>
              <span className="text-[11px] font-mono text-stone-500">
                Unit: {latestMeasurements?.measurements?.unit || 'inches'}
              </span>
            </div>

            {latestMeasurements?.measurements ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-xs">
                {Object.entries(latestMeasurements.measurements)
                  .filter(([key, val]) => key !== 'unit' && key !== 'specialNotes' && val !== undefined)
                  .map(([key, val]) => (
                    <div key={key} className="border border-stone-300 p-2 rounded text-center bg-white">
                      <div className="text-[10px] text-stone-500 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div className="font-mono font-bold text-sm text-black mt-0.5">{String(val)}"</div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic">
                No bespoke measurements recorded on customer profile. Please take measurements.
              </p>
            )}

            {latestMeasurements?.measurements?.specialNotes && (
              <div className="mt-2 text-xs bg-stone-100 p-2 rounded text-stone-800">
                <strong>Fitting Notes:</strong> {latestMeasurements.measurements.specialNotes}
              </div>
            )}
          </div>

          {/* Workshop Checklist Sign-off */}
          <div className="py-4">
            <h4 className="font-serif font-bold text-sm uppercase tracking-wider mb-2">
              Workshop Quality Checklist
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black rounded" />
                <span>Pattern drafted & styled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black rounded" />
                <span>Fabric inspected & cut</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black rounded" />
                <span>Darts, boning & assembly</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black rounded" />
                <span>First fitting alterations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black rounded" />
                <span>Embellishments & pressing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black rounded" />
                <span>Final QC Pass & Packaged</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-stone-300 flex justify-between text-xs text-stone-600">
              <div>
                Master Cutter Signature: __________________________
              </div>
              <div>
                Studio Manager Sign-off: __________________________
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

