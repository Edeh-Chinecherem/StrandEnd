import React from 'react';
import { calculateDeliveryCountdown } from '../../utils/dateUtils';
import { OrderPriority, OrderStageId, PlanTier, UserRole } from '../../types';
import { DEFAULT_STAGES } from '../../data/initialData';
import { Clock, AlertTriangle, CheckCircle2, Sparkles, Flame, Shield, User } from 'lucide-react';

interface CountdownBadgeProps {
  expectedDeliveryDate: string;
  isDelivered?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DeliveryCountdownBadge: React.FC<CountdownBadgeProps> = ({
  expectedDeliveryDate,
  isDelivered = false,
  size = 'md',
  className = '',
}) => {
  const info = calculateDeliveryCountdown(expectedDeliveryDate, isDelivered);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  const getIcon = () => {
    switch (info.urgency) {
      case 'overdue':
        return <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#8B1E1E] animate-pulse" />;
      case 'urgent':
        return <Flame className="w-3.5 h-3.5 shrink-0 text-[#E2573A]" />;
      case 'due_soon':
        return <Clock className="w-3.5 h-3.5 shrink-0 text-[#C9A24B]" />;
      case 'on_track':
        return <Clock className="w-3.5 h-3.5 shrink-0 text-[#3F7D5C]" />;
      case 'completed':
        return <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#3F7D5C]" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-2xs whitespace-nowrap transition-colors ${info.badgeBg} ${info.badgeTextCol} ${info.badgeBorder} ${sizeClasses} ${className}`}
      title={`Delivery Date: ${expectedDeliveryDate} (${info.label})`}
    >
      {getIcon()}
      <span className="font-semibold tracking-tight">{info.badgeText}</span>
    </span>
  );
};

export const StageBadge: React.FC<{
  stageId: OrderStageId;
  size?: 'sm' | 'md';
  className?: string;
}> = ({ stageId, size = 'md', className = '' }) => {
  const stage = DEFAULT_STAGES.find((s) => s.id === stageId);
  const name = stage ? stage.name : stageId;
  const isMilestone = stage?.isMilestone;

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  let bgClass = 'bg-[#F2EDE4] text-[#232A5C] border-[#E2DAD0]';
  if (stageId === 'delivered') {
    bgClass = 'bg-[#EDF5F0] text-[#3F7D5C] border-[#3F7D5C]/30';
  } else if (stageId === 'cancelled_hold') {
    bgClass = 'bg-gray-100 text-gray-600 border-gray-300';
  } else if (stageId === 'ready_for_delivery') {
    bgClass = 'bg-[#FBF6EB] text-[#C9A24B] border-[#C9A24B]/40 font-semibold';
  } else if (stageId === 'sewing_production') {
    bgClass = 'bg-[#EBF1FA] text-[#232A5C] border-[#232A5C]/20';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${bgClass} ${sizeClasses} ${className}`}
    >
      {isMilestone && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#E2573A]"
          title="Milestone Stage (Triggers WhatsApp update to client)"
        />
      )}
      <span>{name}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{
  priority: OrderPriority;
  className?: string;
}> = ({ priority, className = '' }) => {
  if (priority === 'urgent') {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-[#FDECEC] text-[#8B1E1E] border border-[#8B1E1E]/30 uppercase tracking-wider ${className}`}
      >
        <Flame className="w-3 h-3 text-[#8B1E1E]" />
        Urgent
      </span>
    );
  }
  if (priority === 'rush') {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-[#FBECE8] text-[#E2573A] border border-[#E2573A]/30 uppercase tracking-wider ${className}`}
      >
        Rush
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded bg-[#F4EFE6] text-[#71695F] ${className}`}
    >
      Normal
    </span>
  );
};

export const PlanTierBadge: React.FC<{
  tier: PlanTier;
  isFounding?: boolean;
  className?: string;
}> = ({ tier, isFounding = false, className = '' }) => {
  const configs = {
    starter: { label: 'Starter', bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-300' },
    studio: { label: 'Studio', bg: 'bg-[#EBF1FA]', text: 'text-[#232A5C]', border: 'border-[#232A5C]/30' },
    atelier: { label: 'Atelier', bg: 'bg-[#FBF6EB]', text: 'text-[#967425]', border: 'border-[#C9A24B]/40' },
  }[tier];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`text-xs px-2.5 py-0.5 rounded-full font-serif font-bold uppercase tracking-wider border ${configs.bg} ${configs.text} ${configs.border}`}
      >
        {configs.label}
      </span>
      {isFounding && (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E2573A] text-white font-medium shadow-2xs flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" /> Founding 10%
        </span>
      )}
    </div>
  );
};

export const RoleBadge: React.FC<{ role: UserRole; className?: string }> = ({
  role,
  className = '',
}) => {
  const roleNames: Record<UserRole, { label: string; icon: any; color: string }> = {
    owner: { label: 'Studio Owner', icon: Shield, color: 'bg-[#232A5C] text-white' },
    manager: { label: 'Manager', icon: Shield, color: 'bg-[#3F7D5C] text-white' },
    front_desk: { label: 'Front Desk', icon: User, color: 'bg-[#C9A24B] text-white' },
    production: { label: 'Master Tailor / Cutter', icon: User, color: 'bg-[#E2573A] text-white' },
    dispatch: { label: 'Dispatch', icon: User, color: 'bg-amber-800 text-white' },
    agent: { label: 'Independent Agent', icon: Sparkles, color: 'bg-purple-700 text-white' },
    super_admin: { label: 'Platform Admin', icon: Shield, color: 'bg-rose-900 text-white' },
  };

  const item = roleNames[role] || roleNames.owner;
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium shadow-2xs ${item.color} ${className}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{item.label}</span>
    </span>
  );
};

