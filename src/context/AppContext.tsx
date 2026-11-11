import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Studio,
  User,
  UserRole,
  Customer,
  Order,
  OrderStageId,
  Lead,
  Agent,
  AgentAttribution,
  CommissionRecord,
  AgentPayout,
  PaymentRecord,
  MeasurementSet,
  WhatsAppNotification,
  StaffApplication,
  StaffInvitation,
  PLAN_STAFF_LIMITS,
  PlanTier,
} from '../types';
import {
  DEFAULT_STAGES,
  INITIAL_STUDIOS,
  INITIAL_USERS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_LEADS,
  INITIAL_AGENTS,
  INITIAL_ATTRIBUTIONS,
  INITIAL_COMMISSIONS,
  INITIAL_PAYOUTS,
  INITIAL_STAFF_APPLICATIONS,
  INITIAL_STAFF_INVITATIONS,
} from '../data/initialData';
import { generateOrderNumber } from '../utils/formatters';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  // Tenant & Studio
  studios: Studio[];
  currentStudio: Studio;
  switchStudio: (studioId: string) => void;
  updateStudio: (data: Partial<Studio>) => void;
  registerStudio: (data: {
    studioName: string;
    ownerName: string;
    email: string;
    phone: string;
    city: string;
    plan: PlanTier;
    referralCode?: string;
  }) => { studio: Studio; ownerUser: User };

  // Users & Role Switcher
  users: User[];
  currentUser: User;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  signIn: (emailOrPhone: string, password?: string) => { success: boolean; message: string; user?: User };
  signOut: () => void;
  isStaffUser: boolean;
  isOwnerUser: boolean;
  isSuperAdminUser: boolean;

  // Stages
  stages: typeof DEFAULT_STAGES;
  toggleStageMilestone: (stageId: OrderStageId) => void;

  // Orders
  orders: Order[];
  createOrder: (orderData: Partial<Order>) => Order;
  updateOrderStatus: (
    orderId: string,
    newStage: OrderStageId,
    note?: string,
    reason?: string,
    ownerOverride?: boolean
  ) => { success: boolean; message?: string };
  rescheduleOrderDelivery: (orderId: string, newDate: string, reason: string) => void;
  reassignOrderStaff: (orderId: string, newStaff: string) => void;
  logPayment: (orderId: string, payment: Omit<PaymentRecord, 'id' | 'recordedBy'>) => void;
  markOrderFullyPaid: (orderId: string, method?: PaymentRecord['method'], notes?: string) => void;
  duplicateOrder: (orderId: string) => Order;

  // Customers & Measurements
  customers: Customer[];
  createCustomer: (customerData: Omit<Customer, 'id' | 'studioId' | 'dateAdded'>) => Customer;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  addMeasurementSet: (customerId: string, measurementSet: Omit<MeasurementSet, 'id'>) => void;
  deleteCustomer: (id: string) => void;

  // Leads
  leads: Lead[];
  createLead: (leadData: Omit<Lead, 'id' | 'studioId' | 'createdAt'>) => Lead;
  convertLeadToOrder: (leadId: string) => Order;

  // Agent Program [v1.2]
  agents: Agent[];
  attributions: AgentAttribution[];
  commissions: CommissionRecord[];
  payouts: AgentPayout[];
  createAgent: (agentData: Omit<Agent, 'id' | 'uniqueCode' | 'shareLink' | 'dateJoined' | 'verificationStatus' | 'level' | 'status' | 'termsAcceptedDate'>) => Agent;
  processAgentPayout: (agentId: string) => void;

  // Loyalty Program [v1.2]
  advanceStudioTenure: (monthsToAdd: number) => void;
  redeemLoyaltyFreeMonth: () => void;

  // Staff & Team Applications & Invitations
  staffApplications: StaffApplication[];
  staffInvitations: StaffInvitation[];
  createStaffInvitation: (data: {
    name: string;
    role: UserRole;
    email: string;
    phone?: string;
    studioId?: string;
  }) => { success: boolean; invitation?: StaffInvitation; inviteUrl?: string; message: string };
  cancelStaffInvitation: (invitationId: string) => void;
  registerAndActivateInvitedStaff: (data: {
    token?: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    studioId: string;
    password?: string;
  }) => { success: boolean; message: string; user?: User };
  applyForStaffRole: (data: Omit<StaffApplication, 'id' | 'status' | 'appliedDate'>) => { success: boolean; message: string };
  approveStaffApplication: (applicationId: string) => { success: boolean; message: string; limitReached?: boolean };
  rejectStaffApplication: (applicationId: string, reason?: string) => void;
  removeStaffMember: (userId: string) => { success: boolean; message: string };
  activeStaffCount: (studioId?: string) => number;
  staffLimitForStudio: (studioId?: string) => number;

  // System
  toasts: Toast[];
  showToast: (type: Toast['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'strandend_studio_db_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studios, setStudios] = useState<Studio[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_studios');
    if (saved) {
      try {
        const parsed: Studio[] = JSON.parse(saved);
        return parsed.map((s) => ({
          ...s,
          name: s.name === 'Deola Sagoe Atelier' ? 'Deola Sagoe Fashion Studio' : s.name.replace(/\bAtelier\b/g, 'Fashion Studio'),
        }));
      } catch {
        return INITIAL_STUDIOS;
      }
    }
    return INITIAL_STUDIOS;
  });

  const [currentStudioId, setCurrentStudioId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_currentStudioId');
    return saved || 'studio-1';
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [currentRole, setCurrentRole] = useState<UserRole>('owner');

  const [staffApplications, setStaffApplications] = useState<StaffApplication[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_staff_applications');
    if (saved) {
      try {
        const parsed: StaffApplication[] = JSON.parse(saved);
        return parsed.map((a) => ({
          ...a,
          studioName: a.studioName === 'Deola Sagoe Atelier' ? 'Deola Sagoe Fashion Studio' : a.studioName.replace(/\bAtelier\b/g, 'Fashion Studio'),
        }));
      } catch {
        return INITIAL_STAFF_APPLICATIONS;
      }
    }
    return INITIAL_STAFF_APPLICATIONS;
  });

  const [staffInvitations, setStaffInvitations] = useState<StaffInvitation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_staff_invitations');
    if (saved) {
      try {
        const parsed: StaffInvitation[] = JSON.parse(saved);
        return parsed.map((i) => ({
          ...i,
          studioName: i.studioName === 'Deola Sagoe Atelier' ? 'Deola Sagoe Fashion Studio' : i.studioName.replace(/\bAtelier\b/g, 'Fashion Studio'),
        }));
      } catch {
        return INITIAL_STAFF_INVITATIONS;
      }
    }
    return INITIAL_STAFF_INVITATIONS;
  });

  const [stages, setStages] = useState(DEFAULT_STAGES);

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_agents');
    return saved ? JSON.parse(saved) : INITIAL_AGENTS;
  });

  const [attributions, setAttributions] = useState<AgentAttribution[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_attributions');
    return saved ? JSON.parse(saved) : INITIAL_ATTRIBUTIONS;
  });

  const [commissions, setCommissions] = useState<CommissionRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_commissions');
    return saved ? JSON.parse(saved) : INITIAL_COMMISSIONS;
  });

  const [payouts, setPayouts] = useState<AgentPayout[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_payouts');
    return saved ? JSON.parse(saved) : INITIAL_PAYOUTS;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_studios', JSON.stringify(studios));
  }, [studios]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_currentStudioId', currentStudioId);
  }, [currentStudioId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_agents', JSON.stringify(agents));
    localStorage.setItem(STORAGE_KEY + '_attributions', JSON.stringify(attributions));
    localStorage.setItem(STORAGE_KEY + '_commissions', JSON.stringify(commissions));
    localStorage.setItem(STORAGE_KEY + '_payouts', JSON.stringify(payouts));
  }, [agents, attributions, commissions, payouts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_staff_applications', JSON.stringify(staffApplications));
  }, [staffApplications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_staff_invitations', JSON.stringify(staffInvitations));
  }, [staffInvitations]);

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY + '_currentUserId') || null;
  });

  const [isSuperAdminSession, setIsSuperAdminSession] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_is_super_admin');
    const savedUserId = localStorage.getItem(STORAGE_KEY + '_currentUserId');
    return saved === 'true' || savedUserId === 'usr-superadmin';
  });

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(STORAGE_KEY + '_currentUserId', currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEY + '_currentUserId');
    }
  }, [currentUserId]);

  useEffect(() => {
    if (isSuperAdminSession) {
      localStorage.setItem(STORAGE_KEY + '_is_super_admin', 'true');
    } else {
      localStorage.removeItem(STORAGE_KEY + '_is_super_admin');
    }
  }, [isSuperAdminSession]);

  const currentStudio = studios.find((s) => s.id === currentStudioId) || studios[0];

  const loggedInUser = users.find((u) => u.id === currentUserId);

  const isSuperAdminUser = Boolean(
    isSuperAdminSession ||
    (loggedInUser && loggedInUser.role === 'super_admin') ||
    currentUserId === 'usr-superadmin' ||
    currentRole === 'super_admin'
  );

  const isStaffUser = Boolean(
    !isSuperAdminUser && loggedInUser && loggedInUser.role !== 'owner' && loggedInUser.role !== 'super_admin'
  );
  const isOwnerUser = Boolean(
    !isSuperAdminUser && loggedInUser && loggedInUser.role === 'owner'
  );

  const currentUser: User = (loggedInUser && !isSuperAdminUser) ? loggedInUser : {
    id: loggedInUser?.id || currentUserId || 'usr-1',
    name:
      isSuperAdminUser && currentRole === 'super_admin'
        ? 'Platform Super Administrator'
        : currentRole === 'owner'
        ? currentStudio.ownerName
        : currentRole === 'manager'
        ? 'Folake Adeleke (Manager)'
        : currentRole === 'production'
        ? 'Emeka Nwosu (Cutter)'
        : currentRole === 'front_desk'
        ? 'Zainab Balogun (Front Desk)'
        : currentRole === 'dispatch'
        ? 'Babatunde Gbadamosi (Dispatch)'
        : currentRole === 'agent'
        ? 'Amina Lawal (Agent)'
        : 'Platform Administrator',
    email:
      isSuperAdminUser && currentRole === 'super_admin'
        ? 'admin@strandend.ng'
        : currentRole === 'owner'
        ? 'deola@ateliersagoe.ng'
        : 'staff@strandend.ng',
    phone: currentStudio.phone,
    role: currentRole,
    studioId: currentStudio.id,
    active: true,
  };

  const showToast = (type: Toast['type'], title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchStudio = (studioId: string) => {
    // Only platform super admin can freely switch between isolated studio workspaces
    if (!isSuperAdminUser && currentRole !== 'super_admin') {
      showToast(
        'warning',
        'Workspace Restricted',
        `Multi-studio switching is only permitted for Platform Super Administrators. Each fashion studio operates in complete workspace isolation.`
      );
      return;
    }
    setCurrentStudioId(studioId);
    const target = studios.find((s) => s.id === studioId);
    showToast('info', 'Studio Switched', `Now viewing workspace: ${target?.name}`);
  };

  const updateStudio = (data: Partial<Studio>) => {
    setStudios((prev) =>
      prev.map((s) => (s.id === currentStudioId ? { ...s, ...data } : s))
    );
    showToast('success', 'Studio Settings Saved');
  };

  const switchRole = (role: UserRole) => {
    // When in super admin session, allow switching to ANY role without lock
    if (!isSuperAdminUser && loggedInUser && loggedInUser.role !== 'super_admin' && role !== loggedInUser.role) {
      showToast(
        'warning',
        'Role Restricted',
        `Your account is verified as ${loggedInUser.role.replace('_', ' ').toUpperCase()} at ${currentStudio.name}. Access is restricted to your designated role interface.`
      );
      return;
    }
    if (role === 'super_admin') {
      setIsSuperAdminSession(true);
    }
    setCurrentRole(role);
    showToast('info', 'Active Role Changed', `You are now operating as: ${role.replace('_', ' ').toUpperCase()}`);
  };

  const registerStudio = (data: {
    studioName: string;
    ownerName: string;
    email: string;
    phone: string;
    city: string;
    plan: PlanTier;
    referralCode?: string;
  }): { studio: Studio; ownerUser: User } => {
    const newStudioId = 'studio-' + Date.now().toString(36);
    const newUserId = 'usr-' + Date.now().toString(36);

    const newStudio: Studio = {
      id: newStudioId,
      name: data.studioName,
      ownerName: data.ownerName,
      plan: data.plan,
      billingCycle: 'monthly',
      timeZone: 'Africa/Lagos',
      currency: 'NGN',
      phone: data.phone,
      address: `${data.city}, Nigeria`,
      tagline: `${data.studioName} — Bespoke couture & tailoring.`,
      createdAt: new Date().toISOString().split('T')[0],
      tenureMonths: 1,
      loyaltyFreeMonthsEarned: 0,
      loyaltyFreeMonthsUsed: 0,
      status: 'active',
    };

    const newOwnerUser: User = {
      id: newUserId,
      name: data.ownerName,
      email: data.email,
      phone: data.phone,
      role: 'owner',
      studioId: newStudioId,
      active: true,
    };

    setStudios((prev) => [...prev, newStudio]);
    setUsers((prev) => [...prev, newOwnerUser]);

    setCurrentStudioId(newStudioId);
    setCurrentUserId(newUserId);
    setCurrentRole('owner');

    localStorage.setItem(STORAGE_KEY + '_currentStudioId', newStudioId);
    localStorage.setItem(STORAGE_KEY + '_currentUserId', newUserId);

    if (data.referralCode) {
      const agent = agents.find(
        (a) => a.uniqueCode.toLowerCase() === data.referralCode?.trim().toLowerCase()
      );
      if (agent) {
        const attribution: AgentAttribution = {
          id: 'attr-' + Date.now().toString(36),
          agentId: agent.id,
          studioId: newStudioId,
          studioName: data.studioName,
          plan: data.plan,
          billingCycle: 'monthly',
          status: 'trialling',
          signUpDate: new Date().toISOString().split('T')[0],
          trialEndsDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
          clearedPaidMonths: 0,
          netRevenueEarned: 0,
          commissionEarnedTotal: 0,
        };
        setAttributions((prev) => [...prev, attribution]);
      }
    }

    showToast(
      'success',
      'Studio Registered Successfully!',
      `Welcome, ${data.ownerName}! You are logged in as Studio Owner of ${data.studioName}.`
    );

    return { studio: newStudio, ownerUser: newOwnerUser };
  };

  const signIn = (
    emailOrPhone: string,
    _password?: string
  ): { success: boolean; message: string; user?: User } => {
    const query = emailOrPhone.trim().toLowerCase();

    // Check Super Admin access (sees everything)
    if (
      query === 'admin' ||
      query === 'superadmin' ||
      query === 'admin@strandend.ng' ||
      query === 'superadmin@strandend.ng'
    ) {
      let adminUsr = users.find((u) => u.role === 'super_admin');
      if (!adminUsr) {
        adminUsr = {
          id: 'usr-superadmin',
          name: 'Platform Super Administrator',
          email: 'admin@strandend.ng',
          phone: '+234 800 000 0001',
          role: 'super_admin',
          studioId: currentStudioId,
          active: true,
        };
        setUsers((prev) => [adminUsr!, ...prev]);
      }

      setCurrentUserId(adminUsr.id);
      setCurrentRole('super_admin');
      setIsSuperAdminSession(true);

      showToast(
        'success',
        'Super Admin Authenticated',
        'Full platform visibility unlocked across all studios, metrics, and roles.'
      );

      return {
        success: true,
        message: 'Signed in as Platform Super Administrator.',
        user: adminUsr,
      };
    }

    // Check active registered users
    const matchedUser = users.find(
      (u) =>
        u.email.toLowerCase() === query ||
        u.phone.replace(/[\s+-]/g, '') === query.replace(/[\s+-]/g, '')
    );

    if (matchedUser) {
      if (!matchedUser.active) {
        return {
          success: false,
          message: 'Your account has been deactivated. Please contact your studio administrator.',
        };
      }

      setCurrentUserId(matchedUser.id);
      setCurrentRole(matchedUser.role);
      setCurrentStudioId(matchedUser.studioId);
      setIsSuperAdminSession(false);

      const studio = studios.find((s) => s.id === matchedUser.studioId) || currentStudio;
      showToast(
        'success',
        'Signed In Successfully',
        `Welcome, ${matchedUser.name}! Accessing ${matchedUser.role.replace('_', ' ').toUpperCase()} workspace for ${studio.name}.`
      );

      return {
        success: true,
        message: 'Signed in successfully.',
        user: matchedUser,
      };
    }

    // Check if user has an application pending or rejected
    const pendingApp = staffApplications.find(
      (a) =>
        a.email.toLowerCase() === query ||
        a.phone.replace(/[\s+-]/g, '') === query.replace(/[\s+-]/g, '')
    );

    if (pendingApp) {
      if (pendingApp.status === 'pending') {
        return {
          success: false,
          message: `Your registration for ${pendingApp.studioName} as ${pendingApp.requestedRole.replace('_', ' ').toUpperCase()} is currently PENDING approval by the studio owner. You will have access once approved.`,
        };
      }
      if (pendingApp.status === 'rejected') {
        return {
          success: false,
          message: `Your registration for ${pendingApp.studioName} was declined. Reason: ${
            pendingApp.rejectionReason || 'Staff limit reached or requirements not met.'
          }`,
        };
      }
    }

    // Check if email matches an agent
    const matchedAgent = agents.find(
      (a) => a.email.toLowerCase() === query || a.phone.replace(/[\s+-]/g, '') === query.replace(/[\s+-]/g, '')
    );
    if (matchedAgent) {
      setCurrentRole('agent');
      setIsSuperAdminSession(false);
      showToast('success', 'Signed In as Agent', `Welcome back, ${matchedAgent.name}!`);
      return {
        success: true,
        message: 'Signed in as agent.',
      };
    }

    return {
      success: false,
      message: 'No registered account found with this email. Please check your spelling or submit a registration.',
    };
  };

  const signOut = () => {
    setCurrentUserId(null);
    setIsSuperAdminSession(false);
    localStorage.removeItem(STORAGE_KEY + '_is_super_admin');
    localStorage.removeItem(STORAGE_KEY + '_currentUserId');
    setCurrentRole('owner');
    showToast('info', 'Signed Out', 'You have been signed out of your session.');
  };

  const toggleStageMilestone = (stageId: OrderStageId) => {
    setStages((prev) =>
      prev.map((st) => (st.id === stageId ? { ...st, isMilestone: !st.isMilestone } : st))
    );
    showToast('success', 'Stage Milestone Updated');
  };

  // Create Order
  const createOrder = (orderData: Partial<Order>): Order => {
    const counter = orders.length + 43;
    const orderNumber = generateOrderNumber(counter);
    const trackingToken = `TRK-${orderNumber.replace(/[^a-zA-Z0-9]/g, '')}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      studioId: currentStudio.id,
      customerId: orderData.customerId || 'cust-1',
      customerName: orderData.customerName || 'Walk-in Client',
      customerPhone: orderData.customerPhone || '+234 800 000 0000',
      customerWhatsapp: orderData.customerWhatsapp || '+2348000000000',
      occasion: orderData.occasion || 'Special Event',
      orderDate: orderData.orderDate || new Date().toISOString().split('T')[0],
      expectedDeliveryDate:
        orderData.expectedDeliveryDate ||
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: orderData.priority || 'normal',
      assignedStaff: orderData.assignedStaff || 'Unassigned',
      currentStage: orderData.currentStage || 'deposit_confirmed',
      items: orderData.items || [
        {
          id: `item-${Date.now()}`,
          type: 'Bespoke Garment',
          description: 'Custom made to measure garment.',
          fabric: 'Sourced Fabric',
          fabricSource: 'studio_provided',
          colour: 'Selected Palette',
          styleNotes: 'Standard tailoring.',
          price: orderData.totalPrice || 150000,
        },
      ],
      totalPrice: orderData.totalPrice || 150000,
      depositAmount: orderData.depositAmount || (orderData.totalPrice ? orderData.totalPrice * 0.6 : 90000),
      payments: orderData.payments || [
        {
          id: `pay-${Date.now()}`,
          amount: orderData.depositAmount || 90000,
          method: 'Bank Transfer',
          date: new Date().toISOString().split('T')[0],
          recordedBy: currentUser.name,
          notes: 'Initial deposit',
        },
      ],
      stageHistory: [
        {
          id: `sh-${Date.now()}`,
          fromStage: null,
          toStage: orderData.currentStage || 'deposit_confirmed',
          timestamp: new Date().toISOString(),
          userName: currentUser.name,
          note: 'Order created in StrandEnd.',
        },
      ],
      deliveryDateChanges: [],
      whatsAppNotifications: [
        {
          id: `wa-${Date.now()}`,
          milestoneStage: 'deposit_confirmed',
          templateName: 'order_confirmed_v1',
          recipientPhone: orderData.customerPhone || '+234 800 000 0000',
          recipientName: orderData.customerName || 'Valued Client',
          messageText: `Your order ${orderNumber} is confirmed! Estimated delivery: ${orderData.expectedDeliveryDate}. Track here: https://strandend.com/track/${trackingToken}`,
          timestamp: new Date().toISOString(),
          status: 'sent',
          costNaira: 18.5,
        },
      ],
      internalNotes: orderData.internalNotes || '',
      publicTrackingToken: trackingToken,
      isAtRisk: false,
    };

    setOrders((prev) => [newOrder, ...prev]);
    showToast('success', 'Order Created', `Order ${orderNumber} registered successfully.`);
    return newOrder;
  };

  // Update Order Status with PRD Guardrails
  const updateOrderStatus = (
    orderId: string,
    newStage: OrderStageId,
    note?: string,
    reason?: string,
    ownerOverride: boolean = false
  ): { success: boolean; message?: string } => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    const stageDef = stages.find((s) => s.id === newStage);
    const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);

    // Rule 1: Production Guardrail (stage 7+ requires deposit)
    if (stageDef && stageDef.stepNumber >= 7 && order.depositAmount <= 0 && !ownerOverride) {
      showToast(
        'error',
        'Deposit Required for Production',
        'An order cannot enter Sewing/Production without a confirmed deposit (PRD Section 3).'
      );
      return {
        success: false,
        message: 'Deposit required before entering production floor.',
      };
    }

    // Rule 2: Delivery Guardrail (stage 11 Delivered requires balance paid or owner override)
    if (newStage === 'delivered' && totalPaid < order.totalPrice && !ownerOverride) {
      const balance = order.totalPrice - totalPaid;
      showToast(
        'error',
        'Outstanding Balance Due',
        `Cannot mark Delivered: Outstanding balance of ₦${balance.toLocaleString()} unpaid. Requires full balance or Owner Override.`
      );
      return {
        success: false,
        message: `Outstanding balance of ₦${balance.toLocaleString()} unpaid.`,
      };
    }

    // Check if new stage is a milestone for automatic WhatsApp notification (NOT-3)
    let newWhatsAppLog: WhatsAppNotification | null = null;
    if (stageDef?.isMilestone) {
      newWhatsAppLog = {
        id: `wa-${Date.now()}`,
        milestoneStage: newStage,
        templateName: `${newStage}_milestone_v1`,
        recipientPhone: order.customerPhone,
        recipientName: order.customerName,
        messageText: `Update from ${currentStudio.name}: Your order #${order.orderNumber} has moved to "${stageDef.name}". We are on track!`,
        timestamp: new Date().toISOString(),
        status: 'delivered',
        costNaira: 18.5,
      };
    }

    const newHistoryEntry = {
      id: `sh-${Date.now()}`,
      fromStage: order.currentStage,
      toStage: newStage,
      timestamp: new Date().toISOString(),
      userName: currentUser.name,
      note: note || `Stage moved to ${stageDef?.name}`,
      reason,
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          currentStage: newStage,
          stageHistory: [...o.stageHistory, newHistoryEntry],
          whatsAppNotifications: newWhatsAppLog
            ? [...o.whatsAppNotifications, newWhatsAppLog]
            : o.whatsAppNotifications,
        };
      })
    );

    showToast(
      'success',
      'Stage Updated',
      `Order ${order.orderNumber} moved to "${stageDef?.name}". ${
        newWhatsAppLog ? 'WhatsApp milestone notification sent.' : ''
      }`
    );

    return { success: true };
  };

  // Reschedule Delivery Date with PRD Section 4.4 Mandatory Reason Logging
  const rescheduleOrderDelivery = (orderId: string, newDate: string, reason: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const changeLog = {
      id: `dc-${Date.now()}`,
      oldDate: order.expectedDeliveryDate,
      newDate,
      reason,
      changedBy: currentUser.name,
      timestamp: new Date().toISOString(),
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          expectedDeliveryDate: newDate,
          deliveryDateChanges: [...o.deliveryDateChanges, changeLog],
          isAtRisk: false, // Reset risk after proactive rescheduling
        };
      })
    );

    showToast(
      'info',
      'Delivery Date Rescheduled',
      `Order ${order.orderNumber} revised to ${newDate}. Change reason logged.`
    );
  };

  // Reassign Order Staff (Manager Key Need)
  const reassignOrderStaff = (orderId: string, newStaff: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, assignedStaff: newStaff } : o))
    );
    showToast('info', 'Tailor Reassigned', `Order assigned to ${newStaff}`);
  };

  // Log Payment
  const logPayment = (orderId: string, payment: Omit<PaymentRecord, 'id' | 'recordedBy'>) => {
    const newRecord: PaymentRecord = {
      ...payment,
      id: `pay-${Date.now()}`,
      recordedBy: currentUser.name,
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const updatedPayments = [...o.payments, newRecord];
        return {
          ...o,
          payments: updatedPayments,
        };
      })
    );

    showToast(
      'success',
      'Payment Recorded',
      `₦${payment.amount.toLocaleString()} received via ${payment.method}.`
    );
  };

  // Mark Order Payment as Completed in Full
  const markOrderFullyPaid = (
    orderId: string,
    method: PaymentRecord['method'] = 'Bank Transfer',
    notes?: string
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = Math.max(0, order.totalPrice - totalPaid);

    if (balance <= 0) {
      showToast('info', 'Already Settled', `Order ${order.orderNumber} is already fully paid.`);
      return;
    }

    const newRecord: PaymentRecord = {
      id: `pay-${Date.now()}`,
      amount: balance,
      method,
      date: new Date().toISOString().split('T')[0],
      recordedBy: currentUser.name,
      notes: notes || 'Final balance payment completed in full',
      reference: `FULL-${Date.now().toString().slice(-6)}`,
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          payments: [...o.payments, newRecord],
        };
      })
    );

    showToast(
      'success',
      'Payment Completed in Full!',
      `Order ${order.orderNumber} is now fully settled (₦${balance.toLocaleString()} via ${method}).`
    );
  };

  // Duplicate Order (ORD-9)
  const duplicateOrder = (orderId: string): Order => {
    const source = orders.find((o) => o.id === orderId);
    if (!source) throw new Error('Order not found');

    const counter = orders.length + 45;
    const orderNumber = generateOrderNumber(counter);
    const trackingToken = `TRK-${orderNumber.replace(/[^a-zA-Z0-9]/g, '')}`;

    const newOrder: Order = {
      ...source,
      id: `ord-${Date.now()}`,
      orderNumber,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      currentStage: 'deposit_confirmed',
      payments: [],
      stageHistory: [
        {
          id: `sh-${Date.now()}`,
          fromStage: null,
          toStage: 'deposit_confirmed',
          timestamp: new Date().toISOString(),
          userName: currentUser.name,
          note: `Duplicated from past order ${source.orderNumber} for repeat styling.`,
        },
      ],
      deliveryDateChanges: [],
      whatsAppNotifications: [],
      publicTrackingToken: trackingToken,
      isAtRisk: false,
    };

    setOrders((prev) => [newOrder, ...prev]);
    showToast('success', 'Order Duplicated', `Created template order ${orderNumber}`);
    return newOrder;
  };

  // Customer Management
  const createCustomer = (customerData: Omit<Customer, 'id' | 'studioId' | 'dateAdded'>): Customer => {
    const newCust: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      studioId: currentStudio.id,
      dateAdded: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCust, ...prev]);
    showToast('success', 'Customer Added', `${newCust.name} added to records.`);
    return newCust;
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...customerData } : c))
    );
    showToast('success', 'Customer Updated');
  };

  const addMeasurementSet = (customerId: string, measurementSet: Omit<MeasurementSet, 'id'>) => {
    const newSet: MeasurementSet = {
      ...measurementSet,
      id: `ms-${Date.now()}`,
    };
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c;
        return {
          ...c,
          measurementSets: [newSet, ...c.measurementSets],
        };
      })
    );
    showToast('success', 'Measurement Set Saved', `"${measurementSet.label}" recorded.`);
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast('info', 'Customer Archived');
  };

  // Leads
  const createLead = (leadData: Omit<Lead, 'id' | 'studioId' | 'createdAt'>): Lead => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      studioId: currentStudio.id,
      createdAt: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);
    showToast('success', 'Enquiry Logged', `Quick enquiry for ${newLead.name} saved (<30s).`);
    return newLead;
  };

  const convertLeadToOrder = (leadId: string): Order => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) throw new Error('Lead not found');

    // Create or find customer
    let customer = customers.find((c) => c.phone === lead.phone);
    if (!customer) {
      customer = createCustomer({
        name: lead.name,
        phone: lead.phone,
        whatsapp: lead.phone.replace(/[^0-9+]/g, ''),
        source: (lead.source as any) || 'WhatsApp',
        tags: ['New Client'],
        notes: lead.notes,
        consentToContact: true,
        whatsappOptOut: false,
        measurementSets: [],
      });
    }

    // Convert to order
    const order = createOrder({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerWhatsapp: customer.whatsapp,
      occasion: lead.occasion || 'Custom Order',
      totalPrice: 180000,
      depositAmount: 100000,
      currentStage: 'consultation',
      internalNotes: `Converted from lead: ${lead.notes || 'No notes'}`,
    });

    // Mark lead converted
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: 'converted' } : l))
    );

    showToast(
      'success',
      'Lead Converted to Order',
      `Customer record & Order #${order.orderNumber} created seamlessly!`
    );
    return order;
  };

  // Agent Program [v1.2]
  const createAgent = (
    agentData: Omit<
      Agent,
      'id' | 'uniqueCode' | 'shareLink' | 'dateJoined' | 'verificationStatus' | 'level' | 'status' | 'termsAcceptedDate'
    >
  ): Agent => {
    const initials = agentData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
    const code = `${initials}-${Math.floor(100 + Math.random() * 900)}`;

    const newAgent: Agent = {
      ...agentData,
      id: `agt-${Date.now()}`,
      uniqueCode: code,
      shareLink: `https://strandend.com/ref/${code}`,
      verificationStatus: 'verified',
      level: 'standard',
      status: 'active',
      dateJoined: new Date().toISOString().split('T')[0],
      termsAcceptedDate: new Date().toISOString(),
    };

    setAgents((prev) => [...prev, newAgent]);
    showToast('success', 'Agent Registered', `Your unique referral code is ${code}`);
    return newAgent;
  };

  const processAgentPayout = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    const vested = commissions.filter((c) => c.agentId === agentId && c.status === 'vested');
    const totalVested = vested.reduce((sum, c) => sum + c.commissionAmount, 0);

    if (totalVested < 20000) {
      showToast(
        'warning',
        'Minimum Payout Not Reached',
        `Current vested balance ₦${totalVested.toLocaleString()} is below the ₦20,000 threshold. Balance carries forward to next month.`
      );
      return;
    }

    const newPayout: AgentPayout = {
      id: `payout-${Date.now()}`,
      agentId,
      agentName: agent.name,
      bankName: agent.bankName,
      accountNumber: agent.accountNumber,
      period: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      totalAmount: totalVested,
      status: 'processed',
      bankReference: `PSTK_TRF_${Date.now()}`,
      paidDate: new Date().toISOString().split('T')[0],
    };

    setPayouts((prev) => [newPayout, ...prev]);
    setCommissions((prev) =>
      prev.map((c) =>
        c.agentId === agentId && c.status === 'vested'
          ? { ...c, status: 'paid', paidDate: new Date().toISOString().split('T')[0] }
          : c
      )
    );

    showToast(
      'success',
      'Commission Payout Dispatched',
      `₦${totalVested.toLocaleString()} paid via Paystack Transfers to ${agent.accountName} (${agent.bankName}).`
    );
  };

  // Loyalty Program [v1.2]: Advance Tenure and Unlock Free Month
  const advanceStudioTenure = (monthsToAdd: number) => {
    setStudios((prev) =>
      prev.map((s) => {
        if (s.id !== currentStudio.id) return s;
        const newTenure = s.tenureMonths + monthsToAdd;
        const totalEarned = Math.floor(newTenure / 12);
        return {
          ...s,
          tenureMonths: newTenure,
          loyaltyFreeMonthsEarned: totalEarned,
        };
      })
    );

    showToast(
      'info',
      'Subscription Tenure Advanced',
      `Simulated ${monthsToAdd} month(s) of continuous payment. Check your Loyalty status!`
    );
  };

  const redeemLoyaltyFreeMonth = () => {
    if (currentStudio.loyaltyFreeMonthsEarned <= currentStudio.loyaltyFreeMonthsUsed) {
      showToast('error', 'No Free Months Available', 'Complete 12 continuous paid months to earn your reward!');
      return;
    }

    setStudios((prev) =>
      prev.map((s) =>
        s.id === currentStudio.id
          ? { ...s, loyaltyFreeMonthsUsed: s.loyaltyFreeMonthsUsed + 1 }
          : s
      )
    );

    showToast(
      'success',
      'Loyalty Free Month Applied!',
      'Your next subscription billing cycle fee is waived (₦0 charged). Thank you for being a loyal studio partner!'
    );
  };

  // Staff & Team Capacity Enforcement
  const activeStaffCount = (studioId?: string): number => {
    const targetStudioId = studioId || currentStudioId;
    return users.filter((u) => u.studioId === targetStudioId && u.active).length;
  };

  const staffLimitForStudio = (studioId?: string): number => {
    const targetStudioId = studioId || currentStudioId;
    const studio = studios.find((s) => s.id === targetStudioId) || currentStudio;
    return PLAN_STAFF_LIMITS[studio.plan] ?? 2;
  };

  const createStaffInvitation = (data: {
    name: string;
    role: UserRole;
    email: string;
    phone?: string;
    studioId?: string;
  }): { success: boolean; invitation?: StaffInvitation; inviteUrl?: string; message: string } => {
    const targetStudioId = data.studioId || currentStudioId;
    const studio = studios.find((s) => s.id === targetStudioId) || currentStudio;
    const currentCount = activeStaffCount(targetStudioId);
    const limit = staffLimitForStudio(targetStudioId);

    const pendingInvites = staffInvitations.filter(
      (inv) => inv.studioId === targetStudioId && inv.status === 'pending'
    ).length;

    if (currentCount + pendingInvites >= limit) {
      showToast(
        'error',
        'Staff Seat Limit Reached',
        `Your ${studio.plan.toUpperCase()} plan allows a maximum of ${limit} staff seats (${currentCount} active, ${pendingInvites} invited). Upgrade to Atelier (15 seats) to invite more staff.`
      );
      return {
        success: false,
        message: `Plan seat limit reached (${currentCount}/${limit} active seats). Upgrade plan to invite additional staff.`,
      };
    }

    const inviteToken = `inv-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newInvitation: StaffInvitation = {
      id: 'inv-' + Date.now().toString(36),
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || '+234 800 000 0000',
      role: data.role,
      studioId: studio.id,
      studioName: studio.name,
      invitedDate: new Date().toISOString(),
      inviteToken,
      status: 'pending',
    };

    setStaffInvitations((prev) => [newInvitation, ...prev]);

    const baseUrl = window.location.origin + window.location.pathname;
    const inviteUrl = `${baseUrl}?inviteToken=${inviteToken}&studioId=${studio.id}&role=${data.role}&email=${encodeURIComponent(
      data.email.trim()
    )}&name=${encodeURIComponent(data.name.trim())}`;

    showToast(
      'success',
      'Staff Invitation Created',
      `Invite link ready for ${data.name} (${data.role.replace('_', ' ').toUpperCase()}). Share it so they can register and access their interface.`
    );

    return {
      success: true,
      invitation: newInvitation,
      inviteUrl,
      message: `Invitation generated successfully for ${data.name}.`,
    };
  };

  const cancelStaffInvitation = (invitationId: string) => {
    setStaffInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    showToast('info', 'Invitation Cancelled', 'The invitation link has been revoked.');
  };

  const registerAndActivateInvitedStaff = (data: {
    token?: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    studioId: string;
    password?: string;
  }): { success: boolean; message: string; user?: User } => {
    const studio = studios.find((s) => s.id === data.studioId) || currentStudio;
    const cleanEmail = data.email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      const updatedUser: User = {
        ...existingUser,
        name: data.name.trim(),
        role: data.role,
        studioId: studio.id,
        active: true,
      };
      setUsers((prev) => prev.map((u) => (u.id === existingUser.id ? updatedUser : u)));
      setCurrentUserId(updatedUser.id);
      setCurrentRole(updatedUser.role);
      setCurrentStudioId(updatedUser.studioId);
      setIsSuperAdminSession(false);

      if (data.token) {
        setStaffInvitations((prev) =>
          prev.map((inv) =>
            inv.inviteToken === data.token
              ? { ...inv, status: 'accepted', acceptedDate: new Date().toISOString() }
              : inv
          )
        );
      }

      showToast(
        'success',
        'Staff Account Activated',
        `Welcome back, ${data.name}! You are now logged in as ${data.role.replace('_', ' ').toUpperCase()} at ${studio.name}.`
      );
      return { success: true, message: 'Account activated.', user: updatedUser };
    }

    // Check seat limits
    const currentCount = activeStaffCount(studio.id);
    const limit = staffLimitForStudio(studio.id);
    if (currentCount >= limit) {
      showToast(
        'error',
        'Staff Seat Limit Reached',
        `Studio ${studio.name} has reached its staff limit (${currentCount}/${limit} seats). Please contact the studio owner.`
      );
      return { success: false, message: 'Staff seat limit reached for this fashion studio.' };
    }

    // Create new active User
    const newUserId = 'usr-' + Date.now().toString(36);
    const newUser: User = {
      id: newUserId,
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      role: data.role,
      studioId: studio.id,
      active: true,
    };

    setUsers((prev) => [...prev, newUser]);

    // Mark invitation as accepted if token provided or matches email
    setStaffInvitations((prev) =>
      prev.map((inv) =>
        inv.inviteToken === data.token || inv.email.toLowerCase() === cleanEmail
          ? { ...inv, status: 'accepted', acceptedDate: new Date().toISOString() }
          : inv
      )
    );

    // Also record pre-approved StaffApplication record for auditing
    const newApplication: StaffApplication = {
      id: 'app-' + Date.now().toString(36),
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      requestedRole: data.role,
      studioId: studio.id,
      studioName: studio.name,
      status: 'approved',
      appliedDate: new Date().toISOString(),
      reviewedDate: new Date().toISOString(),
      reviewedBy: studio.ownerName,
    };
    setStaffApplications((prev) => [newApplication, ...prev]);

    // Immediately sign the user in to their assigned role and studio
    setCurrentUserId(newUserId);
    setCurrentRole(data.role);
    setCurrentStudioId(studio.id);
    setIsSuperAdminSession(false);

    showToast(
      'success',
      'Registration Complete & Verified!',
      `Welcome to ${studio.name}, ${data.name}! You now have direct access to your ${data.role.replace('_', ' ').toUpperCase()} workspace.`
    );

    return {
      success: true,
      message: 'Staff account registered and activated successfully.',
      user: newUser,
    };
  };

  const applyForStaffRole = (
    data: Omit<StaffApplication, 'id' | 'status' | 'appliedDate'>
  ): { success: boolean; message: string } => {
    const existing = staffApplications.find(
      (a) =>
        a.email.toLowerCase() === data.email.toLowerCase() &&
        a.studioId === data.studioId &&
        a.status === 'pending'
    );
    if (existing) {
      return {
        success: false,
        message: 'You already have a pending registration for this fashion studio. The studio owner has been notified.',
      };
    }

    const newApp: StaffApplication = {
      ...data,
      id: 'app-' + Date.now().toString(36),
      status: 'pending',
      appliedDate: new Date().toISOString(),
    };

    setStaffApplications((prev) => [newApp, ...prev]);
    showToast(
      'success',
      'Application Submitted!',
      `Your request to join ${data.studioName} as ${data.requestedRole.replace('_', ' ').toUpperCase()} has been sent to the studio owner.`
    );
    return {
      success: true,
      message: 'Application submitted successfully. Waiting for studio owner approval.',
    };
  };

  const approveStaffApplication = (
    applicationId: string
  ): { success: boolean; message: string; limitReached?: boolean } => {
    const app = staffApplications.find((a) => a.id === applicationId);
    if (!app) {
      return { success: false, message: 'Application not found.' };
    }

    const currentCount = activeStaffCount(app.studioId);
    const limit = staffLimitForStudio(app.studioId);

    if (currentCount >= limit) {
      const studio = studios.find((s) => s.id === app.studioId) || currentStudio;
      const planName = studio.plan.toUpperCase();
      showToast(
        'error',
        'Staff Seat Limit Reached',
        `Your ${planName} plan allows a maximum of ${limit} staff seats (${currentCount}/${limit} active). Please upgrade your subscription to Atelier (15 seats) or remove an existing member before approving.`
      );
      return {
        success: false,
        message: `Plan seat limit reached (${currentCount}/${limit} seats). Upgrade your subscription to approve additional staff.`,
        limitReached: true,
      };
    }

    // Approve the application
    setStaffApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: 'approved' as const,
              reviewedDate: new Date().toISOString(),
              reviewedBy: currentUser.name,
            }
          : a
      )
    );

    // Create and add the active User
    const newUser: User = {
      id: 'usr-' + Date.now().toString(36),
      name: app.name,
      email: app.email,
      phone: app.phone,
      role: app.requestedRole,
      studioId: app.studioId,
      active: true,
    };

    setUsers((prev) => [...prev, newUser]);

    showToast(
      'success',
      'Staff Application Approved',
      `${app.name} has been approved as ${app.requestedRole.replace('_', ' ').toUpperCase()} at ${app.studioName}. Active team: ${currentCount + 1}/${limit} seats.`
    );

    return {
      success: true,
      message: `${app.name} approved and added to team roster.`,
    };
  };

  const rejectStaffApplication = (applicationId: string, reason?: string) => {
    const app = staffApplications.find((a) => a.id === applicationId);
    if (!app) return;

    setStaffApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: 'rejected' as const,
              reviewedDate: new Date().toISOString(),
              reviewedBy: currentUser.name,
              rejectionReason: reason || 'Application declined by studio owner.',
            }
          : a
      )
    );

    showToast(
      'info',
      'Application Declined',
      `The staff application for ${app.name} has been rejected.`
    );
  };

  const removeStaffMember = (userId: string): { success: boolean; message: string } => {
    const userToRemove = users.find((u) => u.id === userId);
    if (!userToRemove) {
      return { success: false, message: 'Staff member not found.' };
    }

    if (userToRemove.role === 'owner') {
      showToast(
        'error',
        'Action Forbidden',
        'The Studio Owner cannot be removed. Transfer studio ownership or adjust account settings.'
      );
      return { success: false, message: 'Cannot remove studio owner.' };
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));

    showToast(
      'info',
      'Staff Member Removed',
      `${userToRemove.name} has been removed from the studio team. 1 seat freed up.`
    );
    return { success: true, message: 'Staff member removed successfully.' };
  };

  const resetAllData = () => {
    localStorage.clear();
    setStudios(INITIAL_STUDIOS);
    setCurrentStudioId('studio-1');
    setUsers(INITIAL_USERS);
    setStaffApplications(INITIAL_STAFF_APPLICATIONS);
    setStaffInvitations(INITIAL_STAFF_INVITATIONS);
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setLeads(INITIAL_LEADS);
    setAgents(INITIAL_AGENTS);
    setAttributions(INITIAL_ATTRIBUTIONS);
    setCommissions(INITIAL_COMMISSIONS);
    setPayouts(INITIAL_PAYOUTS);
    showToast('info', 'Demo Data Re-initialized', 'Sample Lagos ateliers & orders restored.');
  };

  return (
    <AppContext.Provider
      value={{
        studios,
        currentStudio,
        switchStudio,
        updateStudio,
        registerStudio,
        users,
        currentUser,
        currentRole,
        switchRole,
        signIn,
        signOut,
        isStaffUser,
        isOwnerUser,
        isSuperAdminUser,
        stages,
        toggleStageMilestone,
        orders,
        createOrder,
        updateOrderStatus,
        rescheduleOrderDelivery,
        reassignOrderStaff,
        logPayment,
        markOrderFullyPaid,
        duplicateOrder,
        customers,
        createCustomer,
        updateCustomer,
        addMeasurementSet,
        deleteCustomer,
        leads,
        createLead,
        convertLeadToOrder,
        agents,
        attributions,
        commissions,
        payouts,
        createAgent,
        processAgentPayout,
        advanceStudioTenure,
        redeemLoyaltyFreeMonth,
        staffApplications,
        staffInvitations,
        createStaffInvitation,
        cancelStaffInvitation,
        registerAndActivateInvitedStaff,
        applyForStaffRole,
        approveStaffApplication,
        rejectStaffApplication,
        removeStaffMember,
        activeStaffCount,
        staffLimitForStudio,
        toasts,
        showToast,
        removeToast,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

