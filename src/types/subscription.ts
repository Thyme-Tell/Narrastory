
import { SubscriptionData } from "@/hooks/useSubscription";

export type PlanType = 'free' | 'plus' | 'lifetime';

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
  subscription: SubscriptionData | null;
}
