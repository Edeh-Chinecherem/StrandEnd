export type CountdownUrgency = 'on_track' | 'due_soon' | 'urgent' | 'overdue' | 'completed';

export interface CountdownInfo {
  urgency: CountdownUrgency;
  daysRemaining: number;
  label: string;
  badgeText: string;
  badgeBg: string;
  badgeTextCol: string;
  badgeBorder: string;
}

/**
 * Calculates days to delivery according to PRD section 4.3 & 4.4:
 * Green (more than 7 days): "On track: X days"
 * Amber (3 to 7 days): "Due soon: X days"
 * Red (0 to 2 days): "Urgent: X days" or "Urgent: Today"
 * Dark Red (<0 days): "X days overdue"
 */
export function calculateDeliveryCountdown(
  expectedDeliveryDateStr: string,
  isClosedOrDelivered: boolean = false
): CountdownInfo {
  if (isClosedOrDelivered) {
    return {
      urgency: 'completed',
      daysRemaining: 0,
      label: 'Delivered / Closed',
      badgeText: 'Delivered',
      badgeBg: 'bg-[#EDF5F0]',
      badgeTextCol: 'text-[#3F7D5C]',
      badgeBorder: 'border-[#3F7D5C]/30',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deliveryDate = new Date(expectedDeliveryDateStr);
  deliveryDate.setHours(0, 0, 0, 0);

  const diffTime = deliveryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      urgency: 'overdue',
      daysRemaining: diffDays,
      label: `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`,
      badgeText: `Overdue: ${overdueDays}d`,
      badgeBg: 'bg-[#FDECEC]',
      badgeTextCol: 'text-[#8B1E1E]',
      badgeBorder: 'border-[#8B1E1E]/40',
    };
  } else if (diffDays <= 2) {
    return {
      urgency: 'urgent',
      daysRemaining: diffDays,
      label: diffDays === 0 ? 'Urgent: Due today' : `Urgent: ${diffDays} day${diffDays > 1 ? 's' : ''} left`,
      badgeText: diffDays === 0 ? 'Due Today' : `Urgent: ${diffDays}d left`,
      badgeBg: 'bg-[#FBECE8]',
      badgeTextCol: 'text-[#E2573A]',
      badgeBorder: 'border-[#E2573A]/40',
    };
  } else if (diffDays <= 7) {
    return {
      urgency: 'due_soon',
      daysRemaining: diffDays,
      label: `Due soon: ${diffDays} days left`,
      badgeText: `Due soon: ${diffDays}d`,
      badgeBg: 'bg-[#FBF6EB]',
      badgeTextCol: 'text-[#A07A28]',
      badgeBorder: 'border-[#C9A24B]/40',
    };
  } else {
    return {
      urgency: 'on_track',
      daysRemaining: diffDays,
      label: `On track: ${diffDays} days left`,
      badgeText: `On track: ${diffDays}d`,
      badgeBg: 'bg-[#EDF5F0]',
      badgeTextCol: 'text-[#3F7D5C]',
      badgeBorder: 'border-[#3F7D5C]/40',
    };
  }
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRelativeTimeString(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

/**
 * Dynamic At-Risk Calculation (PRD DASH-6 & ORD-7):
 * Flags an order if:
 * 1. It has been in the current stage longer than that stage's target duration
 * 2. Remaining days to delivery < sum of target durations for all remaining stages
 */
export function evaluateOrderRisk(
  currentStageId: string,
  expectedDeliveryDate: string,
  stageHistory: { toStage: string; timestamp: string }[],
  stages: { id: string; name: string; stepNumber: number; defaultTargetDays: number }[]
): { isAtRisk: boolean; reason?: string } {
  if (currentStageId === 'delivered' || currentStageId === 'cancelled_hold') {
    return { isAtRisk: false };
  }

  const currentStageIndex = stages.findIndex((s) => s.id === currentStageId);
  if (currentStageIndex === -1) return { isAtRisk: false };

  const currentStage = stages[currentStageIndex];

  // 1. Check days in current stage
  const lastHistoryEntry = [...stageHistory].reverse().find((h) => h.toStage === currentStageId);
  if (lastHistoryEntry) {
    const entryDate = new Date(lastHistoryEntry.timestamp);
    const now = new Date();
    const daysInCurrentStage = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    if (currentStage.defaultTargetDays > 0 && daysInCurrentStage > currentStage.defaultTargetDays) {
      return {
        isAtRisk: true,
        reason: `In ${currentStage.name} for ${daysInCurrentStage}d (target: ${currentStage.defaultTargetDays}d)`,
      };
    }
  }

  // 2. Check remaining days vs sum of remaining stage targets
  const cd = calculateDeliveryCountdown(expectedDeliveryDate);
  if (cd.urgency === 'overdue') {
    return {
      isAtRisk: true,
      reason: `Overdue by ${Math.abs(cd.daysRemaining)} day(s)`,
    };
  }

  const remainingStages = stages.slice(currentStageIndex + 1, stages.length - 1); // up to ready_for_delivery
  const sumRemainingTargets = remainingStages.reduce((acc, st) => acc + st.defaultTargetDays, 0);

  if (cd.daysRemaining < sumRemainingTargets && sumRemainingTargets > 0) {
    return {
      isAtRisk: true,
      reason: `Tight schedule: ${cd.daysRemaining}d left for ${sumRemainingTargets}d target work`,
    };
  }

  return { isAtRisk: false };
}


