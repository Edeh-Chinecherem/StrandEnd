import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderPriority, OrderStageId } from '../../types';
import { DeliveryCountdownBadge, PriorityBadge, StageBadge } from '../brand/Badge';
import { calculateDeliveryCountdown } from '../../utils/dateUtils';
import { formatNaira, formatDate } from '../../utils/formatters';
import {
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  ArrowUpDown,
  Phone,
  MessageCircle,
  Clock,
  Printer,
  Eye,
  Copy,
  ChevronRight,
  Download,
  User,
  CheckCircle2,
  Truck,
} from 'lucide-react';

interface OrdersTableViewProps {
  onOpenOrder: (order: Order) => void;
  onOpenReschedule: (order: Order) => void;
  onPrintJobSheet: (order: Order) => void;
}

export const OrdersTableView: React.FC<OrdersTableViewProps> = ({
  onOpenOrder,
  onOpenReschedule,
  onPrintJobSheet,
}) => {
  const { orders, stages, currentRole, duplicateOrder, reassignOrderStaff, updateOrderStatus } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'deliveryDate' | 'orderNumber' | 'price' | 'customer'>('deliveryDate');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Extract staff list
  const staffList = Array.from(new Set(orders.map((o) => o.assignedStaff).filter(Boolean)));

  // Filter orders
  let filtered = orders.filter((o) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchCust = o.customerName.toLowerCase().includes(q);
      const matchOcc = o.occasion.toLowerCase().includes(q);
      const matchItem = o.items.some((i) => i.type.toLowerCase().includes(q) || i.fabric.toLowerCase().includes(q));
      if (!matchNum && !matchCust && !matchOcc && !matchItem) return false;
    }

    if (stageFilter !== 'all' && o.currentStage !== stageFilter) return false;
    if (priorityFilter !== 'all' && o.priority !== priorityFilter) return false;
    if (staffFilter !== 'all' && o.assignedStaff !== staffFilter) return false;

    return true;
  });

  // Default sorting according to PRD Section 4.4:
  // "Overdue orders show as 'X days overdue' and appear first in the default sort."
  filtered.sort((a, b) => {
    const isClosedA = a.currentStage === 'delivered' || a.currentStage === 'cancelled_hold';
    const isClosedB = b.currentStage === 'delivered' || b.currentStage === 'cancelled_hold';

    const cdA = calculateDeliveryCountdown(a.expectedDeliveryDate, isClosedA);
    const cdB = calculateDeliveryCountdown(b.expectedDeliveryDate, isClosedB);

    if (sortField === 'deliveryDate') {
      // Put overdue first if sortAsc
      if (cdA.urgency === 'overdue' && cdB.urgency !== 'overdue') return sortAsc ? -1 : 1;
      if (cdB.urgency === 'overdue' && cdA.urgency !== 'overdue') return sortAsc ? 1 : -1;

      const dateA = new Date(a.expectedDeliveryDate).getTime();
      const dateB = new Date(b.expectedDeliveryDate).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    }

    if (sortField === 'orderNumber') {
      return sortAsc ? a.orderNumber.localeCompare(b.orderNumber) : b.orderNumber.localeCompare(a.orderNumber);
    }

    if (sortField === 'customer') {
      return sortAsc ? a.customerName.localeCompare(b.customerName) : b.customerName.localeCompare(a.customerName);
    }

    if (sortField === 'price') {
      return sortAsc ? a.totalPrice - b.totalPrice : b.totalPrice - a.totalPrice;
    }

    return 0;
  });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Export Orders CSV (ORD-7)
  const handleExportCSV = () => {
    const headers = [
      'Order Number',
      'Customer Name',
      'Occasion',
      'Current Stage',
      'Priority',
      'Delivery Date',
      'Total Price (NGN)',
      'Total Paid (NGN)',
      'Balance (NGN)',
      'Assigned Tailor',
      'At Risk',
    ];
    const rows = filtered.map((o) => {
      const paid = o.payments.reduce((sum, p) => sum + p.amount, 0);
      const bal = o.totalPrice - paid;
      return [
        `"${o.orderNumber}"`,
        `"${o.customerName}"`,
        `"${o.occasion}"`,
        `"${o.currentStage}"`,
        `"${o.priority}"`,
        `"${o.expectedDeliveryDate}"`,
        o.totalPrice,
        paid,
        bal,
        `"${o.assignedStaff}"`,
        `"${o.isAtRisk ? o.atRiskReason || 'At Risk' : 'Normal'}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `StrandEnd_Orders_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search & Comprehensive Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E4DCD0] shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, Customer, Occasion, Fabric..."
              className="w-full pl-9 pr-3 py-2 bg-[#FAF6F0] border border-[#E4DCD0] rounded-lg focus:outline-hidden focus:border-[#232A5C] text-xs text-[#232A5C]"
            />
          </div>

          {/* Quick Stats in Table Header */}
          <div className="flex items-center gap-3 text-[11px] text-stone-600 font-medium">
            <span>
              Showing <strong className="text-[#232A5C]">{filtered.length}</strong> of{' '}
              {orders.length} orders
            </span>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
          {/* Stage Filter */}
          <div className="flex items-center gap-1.5 bg-[#FAF6F0] px-2.5 py-1.5 rounded-lg border border-[#E4DCD0]">
            <Filter className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-transparent text-xs text-[#232A5C] font-medium focus:outline-hidden"
            >
              <option value="all">All Stages (12)</option>
              {stages.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.stepNumber}. {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-[#FAF6F0] px-2.5 py-1.5 rounded-lg border border-[#E4DCD0]">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-xs text-[#232A5C] font-medium focus:outline-hidden"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="rush">Rush</option>
              <option value="normal">Normal</option>
            </select>
          </div>

          {/* Staff Filter */}
          <div className="flex items-center gap-1.5 bg-[#FAF6F0] px-2.5 py-1.5 rounded-lg border border-[#E4DCD0]">
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="bg-transparent text-xs text-[#232A5C] font-medium focus:outline-hidden"
            >
              <option value="all">All Assigned Tailors</option>
              {staffList.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Production Shortcut: Filter My Assigned Jobs */}
          {currentRole === 'production' && (
            <button
              onClick={() => setStaffFilter(staffFilter === 'Emeka Nwosu' ? 'all' : 'Emeka Nwosu')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${staffFilter === 'Emeka Nwosu'
                  ? 'bg-[#232A5C] text-white shadow-xs'
                  : 'bg-[#FAF6F0] text-stone-700 border border-[#E4DCD0] hover:bg-stone-200'
                }`}
            >
              <User className="w-3.5 h-3.5 text-[#E2573A]" />
              <span>{staffFilter === 'Emeka Nwosu' ? '✓ Showing My Jobs' : 'My Assigned Jobs'}</span>
            </button>
          )}

          {/* Dispatch Shortcut: Filter Ready for Delivery */}
          {currentRole === 'dispatch' && (
            <button
              onClick={() => setStageFilter(stageFilter === 'ready_for_delivery' ? 'all' : 'ready_for_delivery')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${stageFilter === 'ready_for_delivery'
                  ? 'bg-[#3F7D5C] text-white shadow-xs'
                  : 'bg-[#FAF6F0] text-stone-700 border border-[#E4DCD0] hover:bg-stone-200'
                }`}
            >
              <Truck className="w-3.5 h-3.5 text-[#3F7D5C]" />
              <span>{stageFilter === 'ready_for_delivery' ? '✓ Showing Ready for Delivery' : 'Ready for Delivery'}</span>
            </button>
          )}

          {(stageFilter !== 'all' || priorityFilter !== 'all' || staffFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setStageFilter('all');
                setPriorityFilter('all');
                setStaffFilter('all');
                setSearchQuery('');
              }}
              className="text-[11px] text-[#E2573A] hover:underline font-semibold ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Table (PRD Section 4.3 DASH-2) */}
      <div className="bg-white rounded-xl border border-[#E4DCD0] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#ECE5DA] text-[#232A5C] font-serif border-b border-[#E4DCD0]">
                <th
                  onClick={() => toggleSort('orderNumber')}
                  className="py-3 px-3.5 font-bold cursor-pointer hover:bg-[#E3DACD] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Order #</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-500" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('customer')}
                  className="py-3 px-3.5 font-bold cursor-pointer hover:bg-[#E3DACD] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Client & Occasion</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-500" />
                  </div>
                </th>
                <th className="py-3 px-3.5 font-bold">Garment Items</th>
                <th className="py-3 px-3.5 font-bold">Current Stage</th>
                <th className="py-3 px-3.5 font-bold">Assigned Tailor</th>
                <th
                  onClick={() => toggleSort('deliveryDate')}
                  className="py-3 px-3.5 font-bold cursor-pointer hover:bg-[#E3DACD] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Expected Delivery</span>
                    <ArrowUpDown className="w-3 h-3 text-[#E2573A]" />
                  </div>
                </th>
                <th className="py-3 px-3.5 font-bold">Countdown</th>
                {currentRole !== 'production' && (
                  <th
                    onClick={() => toggleSort('price')}
                    className="py-3 px-3.5 font-bold cursor-pointer hover:bg-[#E3DACD] transition-colors text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Total / Balance</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-500" />
                    </div>
                  </th>
                )}
                <th className="py-3 px-3.5 font-bold text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {filtered.map((order) => {
                const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
                const balance = order.totalPrice - totalPaid;
                const isDelivered = order.currentStage === 'delivered';
                const cd = calculateDeliveryCountdown(order.expectedDeliveryDate, isDelivered);
                const isOverdue = cd.urgency === 'overdue';

                return (
                  <tr
                    key={order.id}
                    onClick={() => onOpenOrder(order)}
                    className={`hover:bg-[#FAF6F0] transition-colors cursor-pointer ${isOverdue ? 'bg-rose-50/30' : ''
                      }`}
                  >
                    {/* Order Number & Priority */}
                    <td className="py-3 px-3.5 align-top">
                      <div className="font-mono font-bold text-[#232A5C] flex items-center gap-1">
                        <span>{order.orderNumber}</span>
                      </div>
                      <div className="mt-1">
                        <PriorityBadge priority={order.priority} />
                      </div>
                      {order.isAtRisk && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-[#8B1E1E] font-bold">
                          <AlertTriangle className="w-3 h-3 text-[#8B1E1E]" />
                          <span>At Risk</span>
                        </div>
                      )}
                    </td>

                    {/* Customer & Occasion */}
                    <td className="py-3 px-3.5 align-top max-w-[180px]">
                      <div className="font-semibold text-stone-900 truncate">
                        {order.customerName}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate mt-0.5">
                        {order.occasion}
                      </div>
                      {/* One-tap communication icons (CUS-6) */}
                      <div className="flex items-center gap-2 mt-1.5" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={`https://wa.me/${order.customerWhatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-0.5 text-[10px] text-[#3F7D5C] hover:underline font-medium"
                          title="Open WhatsApp chat"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                        <span className="text-stone-300">•</span>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="inline-flex items-center gap-0.5 text-[10px] text-stone-600 hover:underline font-medium"
                          title="Call client"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>Call</span>
                        </a>
                      </div>
                    </td>

                    {/* Garment Items */}
                    <td className="py-3 px-3.5 align-top max-w-[200px]">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-[11px] leading-snug">
                            <span className="font-medium text-[#232A5C]">{item.type}</span>
                            <span className="text-stone-500 text-[10px] block truncate">
                              {item.fabric} ({item.colour})
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Current Stage */}
                    <td className="py-3 px-3.5 align-top whitespace-nowrap">
                      <StageBadge stageId={order.currentStage} />
                      <div className="text-[10px] text-stone-400 mt-1">
                        Ordered: {formatDate(order.orderDate)}
                      </div>
                    </td>

                    {/* Assigned Staff */}
                    <td className="py-3 px-3.5 align-top whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {currentRole === 'manager' || currentRole === 'owner' ? (
                        <div>
                          <select
                            value={order.assignedStaff}
                            onChange={(e) => reassignOrderStaff(order.id, e.target.value)}
                            className="text-xs font-semibold text-[#232A5C] bg-[#FAF6F0] border border-[#E4DCD0] rounded-lg px-2 py-1 focus:outline-hidden hover:border-[#232A5C] cursor-pointer"
                            title="Manager: Reassign tailor/cutter"
                          >
                            {staffList.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          <div className="text-[10px] text-stone-400 mt-0.5">Click to reassign</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-stone-800 flex items-center gap-1">
                            <span>{order.assignedStaff}</span>
                            {currentRole === 'production' && order.assignedStaff.includes('Emeka') && (
                              <span className="px-1.5 py-0.2 rounded bg-[#EDF5F0] text-[#3F7D5C] font-bold text-[9px]">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-stone-400 mt-0.5">Assigned Lead</div>
                        </div>
                      )}
                    </td>

                    {/* Delivery Date */}
                    <td className="py-3 px-3.5 align-top whitespace-nowrap">
                      <div className="font-semibold text-[#232A5C]">
                        {formatDate(order.expectedDeliveryDate)}
                      </div>
                      {order.deliveryDateChanges.length > 0 && (
                        <div
                          className="text-[10px] text-[#E2573A] font-semibold mt-0.5"
                          title={`Rescheduled ${order.deliveryDateChanges.length} time(s)`}
                        >
                          Revised ({order.deliveryDateChanges.length}x)
                        </div>
                      )}
                    </td>

                    {/* Countdown Badge */}
                    <td className="py-3 px-3.5 align-top whitespace-nowrap">
                      <DeliveryCountdownBadge
                        expectedDeliveryDate={order.expectedDeliveryDate}
                        isDelivered={isDelivered}
                        size="md"
                      />
                    </td>

                    {/* Financials (Hidden for Production role) */}
                    {currentRole !== 'production' && (
                      <td className="py-3 px-3.5 align-top text-right whitespace-nowrap">
                        <div className="font-serif font-bold text-[#232A5C]">
                          {formatNaira(order.totalPrice)}
                        </div>
                        {balance > 0 ? (
                          <div className="text-[11px] text-[#E2573A] font-semibold mt-0.5">
                            Bal: {formatNaira(balance)}
                          </div>
                        ) : (
                          <div className="text-[10px] text-[#3F7D5C] font-semibold mt-0.5">
                            Paid in Full
                          </div>
                        )}
                      </td>
                    )}

                    {/* Quick Row Actions */}
                    <td className="py-3 px-3.5 align-top text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Dispatch action: Record Delivery */}
                        {currentRole === 'dispatch' && order.currentStage === 'ready_for_delivery' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="px-2.5 py-1 bg-[#3F7D5C] hover:bg-[#326449] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                            title="Dispatch: Record customer delivery"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Record Delivery</span>
                          </button>
                        )}

                        {/* Production action: View Job Sheet */}
                        {currentRole === 'production' && (
                          <button
                            onClick={() => onPrintJobSheet(order)}
                            className="px-2.5 py-1 bg-[#232A5C] hover:bg-[#E2573A] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                            title="View cutting measurements & pattern specs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cutting Sheet</span>
                          </button>
                        )}

                        <button
                          onClick={() => onOpenOrder(order)}
                          className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 hover:text-[#232A5C]"
                          title="Open Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Only manager and owner can reschedule deadlines */}
                        {(currentRole === 'manager' || currentRole === 'owner') && (
                          <button
                            onClick={() => onOpenReschedule(order)}
                            className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 hover:text-[#E2573A]"
                            title="Manager: Reschedule delivery date with reason (ORD-5)"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}

                        {currentRole !== 'production' && currentRole !== 'dispatch' && (
                          <button
                            onClick={() => onPrintJobSheet(order)}
                            className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 hover:text-[#232A5C]"
                            title="Print Workshop Job Sheet (ORD-8)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}

                        {currentRole === 'owner' && (
                          <button
                            onClick={() => duplicateOrder(order.id)}
                            className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 hover:text-[#232A5C]"
                            title="Owner: Duplicate as repeat order template (ORD-9)"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-stone-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="font-serif text-sm text-stone-600">No matching orders found</p>
                      <p className="text-xs text-stone-400">
                        Adjust your stage, staff or search filters above.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

