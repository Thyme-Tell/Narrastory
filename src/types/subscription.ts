
import { SubscriptionData } from "@/hooks/useSubscription";

export type PlanType = 'free' | 'plus' | 'lifetime' | 'monthly' | 'annual';

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';

export interface SubscriptionPlanChange {
  fromPlan: PlanType;
  toPlan: PlanType;
  userId: string;
}

export interface BookCreditUsage {
  profileId: string;
  bookId?: string;
  amount: number;
}

export interface UsageRecord {
  profileId: string;
  featureType: 'call' | 'book' | 'minutes';
  amount: number;
  metadata?: Record<string, unknown>;
}

export interface SubscriptionResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: any;
}

export interface CreditResult {
  success: boolean;
  remainingCredits: number;
  message?: string;
  error?: any;
}

export interface UsageResult {
  success: boolean;
  message?: string;
  error?: any;
}

export interface SubscriptionChangeResult {
  success: boolean;
  newPlan?: PlanType;
  message?: string;
  error?: any;
}

export interface SubscriptionStatusResult {
  isPremium: boolean;
  hasActiveSubscription: boolean;
  planType: PlanType;
  status: SubscriptionStatus | null;
  bookCredits: number;
  expirationDate: Date | null;
  isLifetime: boolean;
  cancelAtPeriodEnd?: boolean;
  subscription: SubscriptionData | null;
  features?: SubscriptionFeatures;
  lastPaymentStatus?: string;
  orderId?: string;
  purchaseDate?: Date;
}

export interface SubscriptionFeatures {
  storageLimit: number;
  booksLimit: number;
  collaboratorsLimit: number;
  aiGeneration: boolean;
  customTTS: boolean;
  advancedEditing: boolean;
  prioritySupport: boolean;
}

/**
 * Represents a payment in the user's payment history
 */
export interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  date: string;
  description: string;
  receiptUrl?: string;
}

/**
 * Represents the usage metrics for a user
 */
export interface UsageMetrics {
  storiesCreated: number;
  booksPublished: number;
  minutesUsed: number;
  lastUpdated: string;
  quotaLimits: {
    stories: number;
    books: number;
    minutes: number;
  };
}

/**
 * Represents details of a subscription plan
 */
export interface PlanDetails {
  id: string;
  name: string;
  type: 'lifetime' | 'monthly' | 'annual' | 'free';
  price: number;
  currency: string;
  features: SubscriptionFeatures;
  stripeProductId?: string;
  stripePriceId?: string;
}

/**
 * Maps subscription types to their corresponding feature sets
 */
export const PLAN_FEATURES: Record<PlanType, SubscriptionFeatures> = {
  'free': {
    storageLimit: 100, // MB
    booksLimit: 0,
    collaboratorsLimit: 0,
    aiGeneration: false,
    customTTS: false,
    advancedEditing: false,
    prioritySupport: false
  },
  'monthly': {
    storageLimit: 1000, // MB
    booksLimit: 5,
    collaboratorsLimit: 3,
    aiGeneration: true,
    customTTS: true,
    advancedEditing: true,
    prioritySupport: false
  },
  'annual': {
    storageLimit: 5000, // MB
    booksLimit: 20,
    collaboratorsLimit: 10,
    aiGeneration: true,
    customTTS: true,
    advancedEditing: true,
    prioritySupport: true
  },
  'plus': { // Legacy plan type - keeping for backwards compatibility
    storageLimit: 5000, // MB
    booksLimit: 20,
    collaboratorsLimit: 10,
    aiGeneration: true,
    customTTS: true,
    advancedEditing: true,
    prioritySupport: true
  },
  'lifetime': {
    storageLimit: 10000, // MB
    booksLimit: 50,
    collaboratorsLimit: 20,
    aiGeneration: true,
    customTTS: true,
    advancedEditing: true,
    prioritySupport: true
  }
};

/**
 * Maps plan types to their prices and details
 */
export const PLAN_DETAILS: Record<PlanType, PlanDetails> = {
  'free': {
    id: 'free',
    name: 'Free',
    type: 'free',
    price: 0,
    currency: 'USD',
    features: PLAN_FEATURES.free
  },
  'monthly': {
    id: 'monthly',
    name: 'Premium Monthly',
    type: 'monthly',
    price: 24.99,
    currency: 'USD',
    features: PLAN_FEATURES.monthly
  },
  'annual': {
    id: 'annual',
    name: 'Premium Annual',
    type: 'annual',
    price: 249.00,
    currency: 'USD',
    features: PLAN_FEATURES.annual
  },
  'plus': { // Legacy plan type
    id: 'plus',
    name: 'Plus Annual',
    type: 'annual',
    price: 249.00,
    currency: 'USD',
    features: PLAN_FEATURES.plus
  },
  'lifetime': {
    id: 'lifetime',
    name: 'Lifetime Access',
    type: 'lifetime',
    price: 399.00,
    currency: 'USD',
    features: PLAN_FEATURES.lifetime
  }
};
