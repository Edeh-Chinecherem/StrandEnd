import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, BespokeMeasurements } from '../../types';
import { X, Ruler, Sparkles, Check } from 'lucide-react';

interface MeasurementModalProps {
  customer: Customer | null;
  onClose: () => void;
}

export const MeasurementModal: React.FC<MeasurementModalProps> = ({ customer, onClose }) => {
  const { addMeasurementSet, currentUser } = useApp();

  const [label, setLabel] = useState('New Measurement Set ' + new Date().getFullYear());
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [specialNotes, setSpecialNotes] = useState('');

  // Measurement State
  const [measurements, setMeasurements] = useState<Partial<BespokeMeasurements>>({
    bust: 38,
    underbust: 32,
    waist: 30,
    highHip: 40,
    lowHip: 44,
    shoulder: 16,
    neck: 14,
    acrossFront: 14.5,
    acrossBack: 15,
    shoulderToNipple: 10.5,
    shoulderToUnderbust: 14,
    shoulderToWaistFront: 17,
    shoulderToWaistBack: 15.5,
    nippleToNipple: 8,
    sleeveLength: 24,
    roundArmBicep: 13,
    wrist: 7,
    armhole: 17.5,
    blouseLength: 24,
    gownLength: 60,
    skirtLength: 42,
    trouserLength: 42,
    inseam: 32,
    outseam: 42,
    thigh: 24,
    knee: 17,
    ankleCuff: 14,
    agbadaSpan: 66,
    capHeadSize: 23,
  });

  if (!customer) return null;

  const handleFieldChange = (key: keyof BespokeMeasurements, value: string) => {
    const num = parseFloat(value);
    setMeasurements((prev) => ({
      ...prev,
      [key]: isNaN(num) ? undefined : num,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addMeasurementSet(customer.id, {
      label: label.trim() || 'Bespoke Fit Set',
      date: new Date().toISOString().split('T')[0],
      takenBy: currentUser.name,
      measurements: {
        ...measurements,
        unit,
        specialNotes,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-[#E4DCD0] shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E4DCD0] bg-[#FAF6F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#232A5C] text-white">
              <Ruler className="w-5 h-5 text-[#E2573A]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#232A5C]">
                Record Bespoke Measurements (CUS-4)
              </h2>
              <p className="text-xs text-stone-500">
                Client: <strong className="text-[#232A5C]">{customer.name}</strong> • Taken by {currentUser.name}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-5 text-xs text-[#232A5C]">
          {/* Label & Unit Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAF6F0] p-3.5 rounded-xl border border-[#E4DCD0]">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-medium text-stone-700 block mb-1">
                Measurement Set Label *
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Bridal Reception Ballgown (Nov 2026)"
                required
                className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] bg-white text-xs focus:outline-hidden focus:border-[#232A5C]"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-stone-700 block mb-1">
                Unit of Measurement
              </label>
              <div className="flex rounded-lg border border-[#E4DCD0] overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setUnit('inches')}
                  className={`flex-1 py-2 text-xs font-semibold ${
                    unit === 'inches' ? 'bg-[#232A5C] text-white' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  Inches (")
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('cm')}
                  className={`flex-1 py-2 text-xs font-semibold ${
                    unit === 'cm' ? 'bg-[#232A5C] text-white' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  Centimeters
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Upper Body & Torso */}
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#232A5C] border-b border-[#E4DCD0] pb-1">
              1. Upper Body & Torso
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { key: 'bust', label: 'Bust / Chest' },
                { key: 'underbust', label: 'Underbust' },
                { key: 'waist', label: 'Waist' },
                { key: 'highHip', label: 'High Hip' },
                { key: 'lowHip', label: 'Low Hip' },
                { key: 'shoulder', label: 'Shoulder' },
                { key: 'neck', label: 'Neck' },
                { key: 'acrossFront', label: 'Across Front' },
                { key: 'acrossBack', label: 'Across Back' },
                { key: 'shoulderToNipple', label: 'Shoulder to Nipple' },
                { key: 'shoulderToUnderbust', label: 'Shoulder to Underbust' },
                { key: 'nippleToNipple', label: 'Nipple to Nipple' },
                { key: 'shoulderToWaistFront', label: 'Front Shoulder to Waist' },
                { key: 'shoulderToWaistBack', label: 'Back Shoulder to Waist' },
              ].map((item) => (
                <div key={item.key} className="bg-white p-2 rounded-lg border border-[#E4DCD0]">
                  <label className="text-[10px] text-stone-500 block truncate">{item.label}</label>
                  <input
                    type="number"
                    step="0.25"
                    value={(measurements as any)[item.key] ?? ''}
                    onChange={(e) => handleFieldChange(item.key as any, e.target.value)}
                    className="w-full text-center font-mono font-bold text-sm text-[#232A5C] border-b border-stone-200 focus:outline-hidden focus:border-[#232A5C] py-0.5"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Sleeves & Arms */}
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#232A5C] border-b border-[#E4DCD0] pb-1">
              2. Sleeves & Arms
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { key: 'sleeveLength', label: 'Sleeve Length' },
                { key: 'roundArmBicep', label: 'Round Arm / Bicep' },
                { key: 'wrist', label: 'Wrist' },
                { key: 'armhole', label: 'Armhole' },
              ].map((item) => (
                <div key={item.key} className="bg-white p-2 rounded-lg border border-[#E4DCD0]">
                  <label className="text-[10px] text-stone-500 block truncate">{item.label}</label>
                  <input
                    type="number"
                    step="0.25"
                    value={(measurements as any)[item.key] ?? ''}
                    onChange={(e) => handleFieldChange(item.key as any, e.target.value)}
                    className="w-full text-center font-mono font-bold text-sm text-[#232A5C] border-b border-stone-200 focus:outline-hidden focus:border-[#232A5C] py-0.5"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Garment Lengths & Pants / Traditional */}
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#232A5C] border-b border-[#E4DCD0] pb-1">
              3. Garment Lengths, Trousers & Specialty
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { key: 'blouseLength', label: 'Blouse Length' },
                { key: 'gownLength', label: 'Gown / Dress Length' },
                { key: 'skirtLength', label: 'Skirt Length' },
                { key: 'trouserLength', label: 'Trouser Length' },
                { key: 'inseam', label: 'Inseam' },
                { key: 'thigh', label: 'Thigh' },
                { key: 'ankleCuff', label: 'Ankle / Cuff' },
                { key: 'agbadaSpan', label: 'Agbada Wing Span' },
                { key: 'capHeadSize', label: 'Fila / Cap Size' },
              ].map((item) => (
                <div key={item.key} className="bg-white p-2 rounded-lg border border-[#E4DCD0]">
                  <label className="text-[10px] text-stone-500 block truncate">{item.label}</label>
                  <input
                    type="number"
                    step="0.25"
                    value={(measurements as any)[item.key] ?? ''}
                    onChange={(e) => handleFieldChange(item.key as any, e.target.value)}
                    className="w-full text-center font-mono font-bold text-sm text-[#232A5C] border-b border-stone-200 focus:outline-hidden focus:border-[#232A5C] py-0.5"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Special Fitting Notes */}
          <div>
            <label className="text-[11px] font-medium text-stone-700 block mb-1">
              Posture, Boning & Heel Allowance Notes
            </label>
            <textarea
              rows={2}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="e.g. Victorian corset with 12 bones; add 2 inches to gown length for 4-inch wedding heels."
              className="w-full px-3 py-2 rounded-lg border border-[#E4DCD0] text-xs focus:outline-hidden focus:border-[#232A5C]"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[#E4DCD0] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E4DCD0] text-stone-600 text-xs hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#232A5C] hover:bg-[#E2573A] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Measurement Set</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

