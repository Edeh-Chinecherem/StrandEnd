import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { formatNaira, formatDate } from '../../utils/formatters';
import {
  Search,
  Plus,
  Phone,
  MessageCircle,
  Ruler,
  ShoppingBag,
  Tag,
  Download,
  Upload,
  User,
  Sparkles,
} from 'lucide-react';

interface CustomerListProps {
  onOpenCustomer: (customer: Customer) => void;
  onOpenCreateCustomer: () => void;
  onOpenAddMeasurement: (customer: Customer) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  onOpenCustomer,
  onOpenCreateCustomer,
  onOpenAddMeasurement,
}) => {
  const { customers, orders, currentRole } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  // Compute lifetime spend & order counts for each customer (CUS-5)
  const customerStats = customers.map((c) => {
    const custOrders = orders.filter((o) => o.customerId === c.id);
    const totalSpend = custOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    return {
      ...c,
      orderCount: custOrders.length,
      totalSpend,
    };
  });

  // Extract all unique tags
  const allTags = Array.from(new Set(customers.flatMap((c) => c.tags)));

  // Filter
  const filtered = customerStats.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = c.phone.includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail) return false;
    }

    if (selectedTag !== 'all' && !c.tags.includes(selectedTag)) return false;

    return true;
  });

  // Export CSV (CUS-8)
  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'WhatsApp', 'Email', 'Source', 'Tags', 'Date Added', 'Order Count', 'Total Spend'];
    const rows = filtered.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.whatsapp}"`,
      `"${c.email || ''}"`,
      `"${c.source}"`,
      `"${c.tags.join(', ')}"`,
      `"${c.dateAdded}"`,
      c.orderCount,
      c.totalSpend,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StrandEnd_Clients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search, Tag Filters & Action Buttons */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E4DCD0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, phone number or email..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF6F0] border border-[#E4DCD0] rounded-lg focus:outline-hidden focus:border-[#232A5C] text-xs text-[#232A5C]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tag Filter */}
          <div className="flex items-center gap-1.5 bg-[#FAF6F0] px-2.5 py-1.5 rounded-lg border border-[#E4DCD0]">
            <Tag className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-transparent text-xs text-[#232A5C] font-medium focus:outline-hidden"
            >
              <option value="all">All Tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg border border-[#E4DCD0] bg-[#FAF6F0] hover:bg-[#EAE4D9] text-[#232A5C] font-medium text-xs flex items-center gap-1.5 transition-colors"
            title="Export CSV of customer records (CUS-8)"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenCreateCustomer}
            className="px-3.5 py-1.5 rounded-lg bg-[#232A5C] hover:bg-[#E2573A] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Client</span>
          </button>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((customer) => (
          <div
            key={customer.id}
            onClick={() => onOpenCustomer(customer)}
            className="bg-white rounded-xl border border-[#E4DCD0] p-4 shadow-2xs hover:shadow-md hover:border-[#232A5C]/40 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Top: Avatar, Name & Tags */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#FAF6F0] border border-[#E4DCD0] text-[#232A5C] font-serif font-bold text-sm flex items-center justify-center shrink-0 group-hover:bg-[#232A5C] group-hover:text-white transition-colors">
                    {customer.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#232A5C] group-hover:text-[#E2573A] transition-colors leading-tight">
                      {customer.name}
                    </h3>
                    <div className="text-[11px] text-stone-500 mt-0.5">{customer.phone}</div>
                  </div>
                </div>

                {customer.tags.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FBF6EB] text-[#C9A24B] font-bold border border-[#C9A24B]/30 shrink-0">
                    {customer.tags[0]}
                  </span>
                )}
              </div>

              {/* Measurement Sets Count & Source */}
              <div className="grid grid-cols-2 gap-2 my-3 p-2 rounded-lg bg-[#FAF6F0] border border-[#EBE3D7] text-xs">
                <div>
                  <span className="text-[10px] text-stone-500 block">Measurement Sets</span>
                  <div className="font-semibold text-[#232A5C] flex items-center gap-1 mt-0.5">
                    <Ruler className="w-3 h-3 text-[#E2573A]" />
                    <span>{customer.measurementSets.length} sets</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block">Total Studio Orders</span>
                  <div className="font-semibold text-[#232A5C] flex items-center gap-1 mt-0.5">
                    <ShoppingBag className="w-3 h-3 text-[#3F7D5C]" />
                    <span>{customer.orderCount} orders</span>
                  </div>
                </div>
              </div>

              {/* Lifetime Spend (CUS-5 - Hidden from Production role) */}
              {currentRole !== 'production' && (
                <div className="flex items-center justify-between text-xs text-stone-600 mb-2">
                  <span>Lifetime Studio Spend:</span>
                  <span className="font-serif font-bold text-[#232A5C]">
                    {formatNaira(customer.totalSpend)}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Actions: 1-Tap Call & WhatsApp (CUS-6) */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-1.5">
                <a
                  href={`https://wa.me/${customer.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-md bg-[#EDF5F0] hover:bg-[#3F7D5C] hover:text-white text-[#3F7D5C] text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Open WhatsApp chat (CUS-6)"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`tel:${customer.phone}`}
                  className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 hover:text-[#232A5C] transition-colors"
                  title="Direct phone call (CUS-6)"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>

              <button
                onClick={() => onOpenAddMeasurement(customer)}
                className="px-2.5 py-1 rounded-md bg-[#FAF6F0] hover:bg-[#232A5C] hover:text-white text-[#232A5C] text-[11px] font-semibold border border-[#E4DCD0] flex items-center gap-1 transition-colors"
                title="Add new measurement set (CUS-4)"
              >
                <Ruler className="w-3 h-3" />
                <span>+ Measure</span>
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-stone-400 bg-white rounded-xl border border-[#E4DCD0]">
            <User className="w-8 h-8 mx-auto text-stone-300 mb-2" />
            <p className="font-serif text-sm text-stone-600">No matching clients found</p>
            <p className="text-xs text-stone-400 mt-1">Try searching a different name or phone number.</p>
          </div>
        )}
      </div>
    </div>
  );
};

