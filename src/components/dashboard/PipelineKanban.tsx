import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStageId } from '../../types';
import { DeliveryCountdownBadge, PriorityBadge } from '../brand/Badge';
import {
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Flame,
  AlertTriangle,
  User,
  Sparkles,
  Phone,
  Eye,
} from 'lucide-react';
import { formatNaira } from '../../utils/formatters';

interface PipelineKanbanProps {
  onOpenOrder: (order: Order) => void;
  onOpenReschedule: (order: Order) => void;
}

export const PipelineKanban: React.FC<PipelineKanbanProps> = ({
  onOpenOrder,
  onOpenReschedule,
}) => {
  const { stages, orders, updateOrderStatus, currentUser, currentRole } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [draggingOrderId, setDraggingOrderId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<OrderStageId | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchCust = o.customerName.toLowerCase().includes(q);
      const matchOcc = o.occasion.toLowerCase().includes(q);
      if (!matchNum && !matchCust && !matchOcc) return false;
    }

    if (selectedStaff !== 'all' && o.assignedStaff !== selectedStaff) return false;
    if (selectedPriority !== 'all' && o.priority !== selectedPriority) return false;

    return true;
  });

  // Unique staff list
  const staffList = Array.from(new Set(orders.map((o) => o.assignedStaff).filter(Boolean)));

  const handleAdvanceStage = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    const currentIndex = stages.findIndex((s) => s.id === order.currentStage);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1].id;
      // If owner or manager, allow override if prompted
      const isOwner = currentRole === 'owner';
      updateOrderStatus(order.id, nextStage, undefined, undefined, isOwner);
    }
  };

  const handleStepBackStage = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    const currentIndex = stages.findIndex((s) => s.id === order.currentStage);
    if (currentIndex > 0) {
      const prevStage = stages[currentIndex - 1].id;
      const reason = window.prompt(
        `Please state reason for moving Order ${order.orderNumber} backward (e.g. "Failed QC", "Fittings adjustment"):`
      );
      if (reason !== null) {
        updateOrderStatus(order.id, prevStage, 'Moved backward', reason);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Kanban Filters & Search Header */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E4DCD0] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, customer, occasion or style..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF6F0] border border-[#E4DCD0] rounded-lg focus:outline-hidden focus:border-[#232A5C] text-xs text-[#232A5C]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Staff Filter */}
          <div className="flex items-center gap-1.5 bg-[#FAF6F0] px-2.5 py-1.5 rounded-lg border border-[#E4DCD0]">
            <Filter className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="bg-transparent text-xs text-[#232A5C] font-medium focus:outline-hidden"
            >
              <option value="all">All Assigned Staff</option>
              {staffList.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-[#FAF6F0] px-2.5 py-1.5 rounded-lg border border-[#E4DCD0]">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-transparent text-xs text-[#232A5C] font-medium focus:outline-hidden"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="rush">Rush</option>
              <option value="normal">Normal</option>
            </select>
          </div>

          {/* Production Shortcut: Filter My Assigned Jobs */}
          {currentRole === 'production' && (
            <button
              onClick={() => setSelectedStaff(selectedStaff === 'Emeka Nwosu' ? 'all' : 'Emeka Nwosu')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                selectedStaff === 'Emeka Nwosu'
                  ? 'bg-[#232A5C] text-white shadow-xs'
                  : 'bg-[#FAF6F0] text-stone-700 border border-[#E4DCD0] hover:bg-stone-200'
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#E2573A]" />
              <span>{selectedStaff === 'Emeka Nwosu' ? '✓ Showing My Jobs' : 'My Assigned Jobs'}</span>
            </button>
          )}

          <div className="text-stone-500 text-[11px] font-medium ml-1">
            Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} across 12 stages
          </div>
        </div>
      </div>

      {/* Horizontal Kanban Scroll Columns (PRD Section 3 - 12 Stages) */}
      <div className="overflow-x-auto pb-4 pt-1">
        <div className="flex gap-3.5 min-w-[3200px]">
          {stages.map((stage) => {
            const columnOrders = filteredOrders.filter((o) => o.currentStage === stage.id);
            const isMilestone = stage.isMilestone;
            const isOver = dragOverStageId === stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverStageId !== stage.id) setDragOverStageId(stage.id);
                }}
                onDragLeave={(e) => {
                  // Only reset if leaving the column itself
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverStageId(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverStageId(null);
                  const orderId = e.dataTransfer.getData('text/plain');
                  if (orderId) {
                    const droppedOrder = orders.find((o) => o.id === orderId);
                    if (droppedOrder && droppedOrder.currentStage !== stage.id) {
                      const isOwner = currentRole === 'owner';
                      updateOrderStatus(orderId, stage.id, 'Moved via Drag & Drop', undefined, isOwner);
                    }
                  }
                }}
                className={`w-72 shrink-0 rounded-xl border flex flex-col max-h-[75vh] transition-all duration-150 ${
                  isOver
                    ? 'bg-[#EAE4D7] border-[#232A5C] ring-2 ring-[#232A5C]/20 shadow-md'
                    : 'bg-[#F2EDE4]/70 border-[#E4DCD0]'
                }`}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-[#E4DCD0] bg-[#ECE5DA] rounded-t-xl sticky top-0 z-10">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#232A5C] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {stage.stepNumber}
                      </span>
                      <h3 className="font-serif font-bold text-xs text-[#232A5C] truncate">
                        {stage.name}
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-[#232A5C] border border-[#E0D7CA]">
                      {columnOrders.length}
                    </span>
                  </div>

                  {/* Milestone Indicator */}
                  {isMilestone && (
                    <div className="flex items-center gap-1 text-[10px] text-[#E2573A] font-semibold mt-1.5">
                      <Sparkles className="w-3 h-3 shrink-0" />
                      <span>WhatsApp Milestone Stage</span>
                    </div>
                  )}
                  <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{stage.description}</p>
                </div>

                {/* Column Cards */}
                <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1">
                  {columnOrders.map((order) => {
                    const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
                    const balance = order.totalPrice - totalPaid;
                    const isDelivered = order.currentStage === 'delivered';

                    const isDragging = draggingOrderId === order.id;

                    return (
                      <div
                        key={order.id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', order.id);
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggingOrderId(order.id);
                        }}
                        onDragEnd={() => setDraggingOrderId(null)}
                        onClick={() => onOpenOrder(order)}
                        className={`bg-white rounded-xl p-3 border shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative select-none ${
                          isDragging ? 'opacity-40 scale-95 border-dashed border-[#232A5C]' : ''
                        } ${
                          order.isAtRisk
                            ? 'border-[#8B1E1E]/50 bg-rose-50/20'
                            : 'border-[#E4DCD0] hover:border-[#232A5C]/40'
                        }`}
                      >
                        {/* Top: Order # & Priority */}
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="font-mono text-xs font-bold text-[#232A5C] group-hover:text-[#E2573A] transition-colors">
                            {order.orderNumber}
                          </span>
                          <PriorityBadge priority={order.priority} />
                        </div>

                        {/* Customer & Occasion */}
                        <div className="text-xs font-bold text-[#232A5C] truncate">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate mt-0.5">
                          {order.occasion}
                        </div>

                        {/* Garment Summary */}
                        <div className="text-[11px] text-stone-600 bg-[#FAF6F0] p-1.5 rounded-md mt-2 border border-[#EBE3D7] line-clamp-2">
                          {order.items.map((i) => i.type).join(' • ')}
                        </div>

                        {/* Assigned Staff */}
                        <div className="flex items-center gap-1 text-[10px] text-stone-500 mt-2 truncate">
                          <User className="w-3 h-3 shrink-0 text-stone-400" />
                          <span className="truncate">{order.assignedStaff}</span>
                        </div>

                        {/* Financial balance note if role has permission */}
                        {currentRole !== 'production' && balance > 0 && (
                          <div className="mt-1 text-[10px] text-[#A07A28] font-medium flex items-center justify-between">
                            <span>Balance due:</span>
                            <span className="font-bold">{formatNaira(balance)}</span>
                          </div>
                        )}

                        {/* At Risk alert */}
                        {order.isAtRisk && (
                          <div className="mt-1.5 text-[10px] text-[#8B1E1E] bg-[#FDECEC] p-1 rounded font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span className="truncate">{order.atRiskReason || 'Stage delayed'}</span>
                          </div>
                        )}

                        {/* Delivery Countdown Badge */}
                        <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
                          <DeliveryCountdownBadge
                            expectedDeliveryDate={order.expectedDeliveryDate}
                            isDelivered={isDelivered}
                            size="sm"
                          />

                          {/* Quick Advance / Back Stage Action Buttons */}
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {stage.stepNumber > 1 && (
                              <button
                                onClick={(e) => handleStepBackStage(e, order)}
                                className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700"
                                title="Move back a stage with reason"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {stage.stepNumber < 11 && (
                              <button
                                onClick={(e) => handleAdvanceStage(e, order)}
                                className="p-1 px-1.5 rounded bg-[#232A5C] text-white hover:bg-[#E2573A] text-[10px] font-semibold flex items-center gap-0.5 transition-colors"
                                title="Advance to next production stage"
                              >
                                <span>Next</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {columnOrders.length === 0 && (
                    <div className="text-center py-8 text-stone-400 text-xs italic">
                      No orders in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

