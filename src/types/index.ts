export type UserRole =
  | 'owner'
  | 'manager'
  | 'front_desk'
  | 'production'
  | 'dispatch'
  | 'agent'
  | 'super_admin';

export type PlanTier = 'starter' | 'studio' | 'atelier';

export type OrderPriority = 'normal' | 'rush' | 'urgent';

export type OrderStageId =
  | 'enquiry'
  | 'consultation'
  | 'deposit_confirmed'
  | 'measurements_taken'
  | 'fabric_materials'
  | 'pattern_cutting'
  | 'sewing_production'
  | 'first_fitting'
  | 'adjustments_finishing'
  | 'ready_for_delivery'
  | 'delivered'
  | 'cancelled_hold';

export interface StageDefinition {
  id: OrderStageId;
  name: string;
  stepNumber: number;
  description: string;
  isMilestone: boolean;
  defaultTargetDays: number;
  requiresDeposit?: boolean;
  requiresBalancePaid?: boolean;
}

export interface Studio {
  id: string;
  name: string;
  ownerName: string;
  plan: PlanTier;
  billingCycle: 'monthly' | 'annual';
  isFoundingDesigner?: boolean;
  timeZone: string;
  currency: string;
  phone: string;
  address: string;
  tagline?: string;
  logoUrl?: string;
  createdAt: string;
  tenureMonths: number;
  loyaltyFreeMonthsEarned: number;
  loyaltyFreeMonthsUsed: number;
  status: 'active' | 'grace_period' | 'read_only' | 'suspended';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  studioId: string;
  avatar?: string;
  active: boolean;
}

export interface StaffApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  requestedRole: UserRole;
  studioId: string;
  studioName: string;
  specialty?: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface StaffInvitation {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  studioId: string;
  studioName: string;
  invitedDate: string;
  inviteToken: string;
  status: 'pending' | 'accepted';
  acceptedDate?: string;
}

export const PLAN_STAFF_LIMITS: Record<PlanTier, number> = {
  starter: 2,
  studio: 5,
  atelier: 15,
};

export interface BespokeMeasurements {
  // Upper body & torso
  bust?: number;
  underbust?: number;
  waist?: number;
  highHip?: number;
  lowHip?: number;
  acrossFront?: number;
  acrossBack?: number;
  shoulder?: number;
  neck?: number;
  shoulderToNipple?: number;
  shoulderToUnderbust?: number;
  shoulderToWaistFront?: number;
  shoulderToWaistBack?: number;
  nippleToNipple?: number;

  // Arms & Sleeves
  sleeveLength?: number;
  roundArmBicep?: number;
  wrist?: number;
  armhole?: number;

  // Garment Lengths
  blouseLength?: number;
  gownLength?: number;
  skirtLength?: number;

  // Pants / Trousers / Lower Body
  trouserLength?: number;
  waistToKnee?: number;
  inseam?: number;
  outseam?: number;
  thigh?: number;
  knee?: number;
  ankleCuff?: number;
  crotchDepth?: number;

  // Traditional / Specialty
  agbadaSpan?: number;
  capHeadSize?: number;

  unit: 'inches' | 'cm';
  specialNotes?: string;
}

export interface MeasurementSet {
  id: string;
  label: string; // e.g. "Bridal Gown 2026", "Agbada Traditional Fit"
  date: string;
  takenBy: string;
  measurements: BespokeMeasurements;
  customerNotes?: string;
}

export interface Customer {
  id: string;
  studioId: string;
  name: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address?: string;
  source: 'Instagram' | 'WhatsApp' | 'Walk-in' | 'Referral' | 'Event' | 'Other';
  tags: string[]; // e.g. "VIP", "Bridal", "Repeat", "Celebrity"
  notes?: string;
  dateAdded: string;
  consentToContact: boolean;
  whatsappOptOut: boolean;
  measurementSets: MeasurementSet[];
}

export interface GarmentItem {
  id: string;
  type: string; // e.g. "Aso-Ebi Corset Gown", "3-Piece Agbada & Cap", "Silk Kaftan"
  description: string;
  fabric: string;
  fabricSource: 'client_supplied' | 'studio_provided';
  colour: string;
  styleNotes: string;
  price: number;
  sketchUrl?: string;
}

export interface StageHistoryEntry {
  id: string;
  fromStage: OrderStageId | null;
  toStage: OrderStageId;
  timestamp: string;
  userName: string;
  note?: string;
  reason?: string;
}

export interface DeliveryDateChange {
  id: string;
  oldDate: string;
  newDate: string;
  reason: string;
  changedBy: string;
  timestamp: string;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  method: 'Bank Transfer' | 'POS / Card' | 'Cash' | 'Paystack' | 'USSD';
  date: string;
  recordedBy: string;
  notes?: string;
  reference?: string;
}

export interface WhatsAppNotification {
  id: string;
  milestoneStage: OrderStageId;
  templateName: string;
  recipientPhone: string;
  recipientName: string;
  messageText: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  costNaira: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "SE-2026-0042"
  studioId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  occasion: string; // e.g. "Wedding", "Owambe", "Corporate Gala", "Birthday"
  orderDate: string;
  expectedDeliveryDate: string;
  priority: OrderPriority;
  assignedStaff: string; // user name or id
  currentStage: OrderStageId;
  items: GarmentItem[];
  totalPrice: number;
  depositAmount: number;
  payments: PaymentRecord[];
  stageHistory: StageHistoryEntry[];
  deliveryDateChanges: DeliveryDateChange[];
  whatsAppNotifications: WhatsAppNotification[];
  internalNotes?: string;
  publicTrackingToken: string;
  isAtRisk?: boolean;
  atRiskReason?: string;
}

export interface Lead {
  id: string;
  studioId: string;
  name: string;
  phone: string;
  source: string;
  occasion?: string;
  notes?: string;
  followUpDate: string;
  status: 'new' | 'contacted' | 'consulting' | 'converted' | 'lost';
  createdAt: string;
}

// Agent Referral Program [v1.2]
export interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  level: 'standard' | 'senior'; // Senior after 10 concurrent paying studios
  uniqueCode: string; // e.g. "ADE-771"
  shareLink: string;
  dateJoined: string;
  status: 'active' | 'suspended';
  termsAcceptedDate: string;
}

export interface AgentAttribution {
  id: string;
  agentId: string;
  studioId: string;
  studioName: string;
  plan: PlanTier;
  billingCycle: 'monthly' | 'annual';
  status: 'trialling' | 'paid' | 'active' | 'cancelled';
  signUpDate: string;
  trialEndsDate: string; // 21 days for agent referrals
  clearedPaidMonths: number;
  netRevenueEarned: number;
  commissionEarnedTotal: number;
}

export interface CommissionRecord {
  id: string;
  agentId: string;
  studioId: string;
  studioName: string;
  invoiceMonth: number; // 1 to 6
  netAmountReceived: number;
  ratePercentage: number; // 20% or 25% for monthly, 10% or 12.5% for annual
  commissionAmount: number;
  status: 'pending' | 'vested' | 'paid' | 'reversed';
  vestingDate: string; // 30 days after payment cleared
  paidDate?: string;
}

export interface AgentPayout {
  id: string;
  agentId: string;
  agentName: string;
  bankName: string;
  accountNumber: string;
  period: string; // e.g. "October 2026"
  totalAmount: number;
  status: 'processed' | 'pending';
  bankReference: string;
  paidDate: string;
}

