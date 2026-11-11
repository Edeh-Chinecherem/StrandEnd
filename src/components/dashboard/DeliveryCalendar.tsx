import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { DeliveryCountdownBadge, PriorityBadge } from '../brand/Badge';
import { formatDate } from '../../utils/formatters';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

interface DeliveryCalendarProps {
  onOpenOrder: (order: Order) => void;
}

export const DeliveryCalendar: React.FC<DeliveryCalendarProps> = ({ onOpenOrder }) => {
  const { orders } = useApp();

  // Current viewed month (defaults to November 2026 based on PRD timestamp)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // 0-indexed: 10 = November

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Days in month calculation
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Map orders to date strings "YYYY-MM-DD"
  const ordersByDate: Record<string, Order[]> = {};
  orders.forEach((order) => {
    if (order.currentStage === 'cancelled_hold') return;
    const dateKey = order.expectedDeliveryDate;
    if (!ordersByDate[dateKey]) {
      ordersByDate[dateKey] = [];
    }
    ordersByDate[dateKey].push(order);
  });

  // Tailor workload breakdown (DASH-7)
  const tailorWorkload: Record<string, { active: number; urgent: number }> = {};
  orders.forEach((o) => {
    if (o.currentStage === 'delivered' || o.currentStage === 'cancelled_hold') return;
    const staff = o.assignedStaff || 'Unassigned';
    if (!tailorWorkload[staff]) {
      tailorWorkload[staff] = { active: 0, urgent: 0 };
    }
    tailorWorkload[staff].active++;
    if (o.priority === 'urgent' || o.priority === 'rush') {
      tailorWorkload[staff].urgent++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Calendar Header with Navigation */}
      <div className="bg-white p-4 rounded-xl border border-[#E4DCD0] shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-5 h-5 text-[#232A5C]" />
          <div>
            <h2 className="font-serif font-bold text-lg text-[#232A5C]">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <p className="text-xs text-stone-500">
              Scheduled garment deliveries and workshop completion targets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-[#E4DCD0] hover:bg-[#FAF6F0] text-stone-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCurrentYear(2026);
              setCurrentMonth(10);
            }}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#E4DCD0] hover:bg-[#FAF6F0] text-[#232A5C]"
          >
            Today (Nov 2026)
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-[#E4DCD0] hover:bg-[#FAF6F0] text-stone-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-[#E4DCD0] shadow-2xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-[#E4DCD0] bg-[#ECE5DA] text-center font-serif text-xs font-bold text-[#232A5C] py-2.5">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#E4DCD0]">
          {/* Empty cells before month starts */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="min-h-[110px] bg-[#FAF6F0]/50 p-2" />
          ))}

          {/* Days of month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
              dayNum
            ).padStart(2, '0')}`;
            const dayOrders = ordersByDate[dateStr] || [];
            const isToday = currentYear === 2026 && currentMonth === 10 && dayNum === 10;

            return (
              <div
                key={dateStr}
                className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                  isToday ? 'bg-[#FBECE8]/30 font-bold' : 'hover:bg-[#FAF6F0]'
                }`}
              >
                {/* Date header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs ${
                      isToday
                        ? 'w-6 h-6 rounded-full bg-[#E2573A] text-white flex items-center justify-center font-bold'
                        : 'text-stone-700 font-medium'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayOrders.length > 0 && (
                    <span className="text-[10px] font-bold text-[#232A5C] bg-[#ECE5DA] px-1.5 py-0.2 rounded-full">
                      {dayOrders.length}
                    </span>
                  )}
                </div>

                {/* Orders list for day */}
                <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-24">
                  {dayOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => onOpenOrder(order)}
                      className="p-1 rounded bg-[#FAF6F0] hover:bg-[#F2EDE4] border border-[#E0D7CA] text-[10px] leading-tight cursor-pointer transition-colors"
                      title={`${order.orderNumber} - ${order.customerName} (${order.occasion})`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono font-bold text-[#232A5C] truncate">
                          {order.orderNumber}
                        </span>
                        {order.priority === 'urgent' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E2573A] shrink-0" />
                        )}
                      </div>
                      <div className="text-stone-600 truncate font-medium">
                        {order.customerName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workshop Staff Workload Overview (DASH-7) */}
      <div className="bg-white p-4 rounded-xl border border-[#E4DCD0] shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-serif font-bold text-sm text-[#232A5C]">
              Workshop Staff Workload & Capacity
            </h3>
            <p className="text-xs text-stone-500">
              Active assigned garments across cutters, tailors and finishers
            </p>
          </div>
          <span className="text-xs text-[#3F7D5C] font-semibold bg-[#EDF5F0] px-2.5 py-1 rounded-full">
            All stations staffed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(tailorWorkload).map(([staff, data]) => (
            <div
              key={staff}
              className="p-3 rounded-lg border border-[#E4DCD0] bg-[#FAF6F0] flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="w-8 h-8 rounded-full bg-[#232A5C] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {staff[0]}
                </div>
                <div className="truncate">
                  <div className="font-semibold text-[#232A5C] truncate">{staff}</div>
                  <div className="text-[10px] text-stone-500">
                    {data.urgent > 0 ? (
                      <span className="text-[#E2573A] font-bold">
                        {data.urgent} rush/urgent
                      </span>
                    ) : (
                      'Normal pacing'
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className="text-lg font-serif font-bold text-[#232A5C]">
                  {data.active}
                </span>
                <span className="text-[10px] text-stone-400 block">orders</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

