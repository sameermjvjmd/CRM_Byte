import type { Contact } from './contact';
import type { Company } from './company';

// =============================================
// Opportunity Stage Types
// =============================================
export type OpportunityStage =
    | 'Lead'
    | 'Qualified'
    | 'Proposal'
    | 'Negotiation'
    | 'Closed Won'
    | 'Closed Lost'
    | 'Initial' // Backwards compatibility
    | 'Qualification'; // Backwards compatibility

// =============================================
// Main Opportunity Interface
// =============================================
export interface Opportunity {
    id?: number;
    name: string;
    amount: number;
    stage: OpportunityStage;
    probability: number;
    expectedCloseDate: string;

    // Actual Close & Win/Loss
    actualCloseDate?: string;
    wonDate?: string;
    lostDate?: string;
    winReason?: string;
    lostReason?: string;
    winLossNotes?: string;

    // Stage Tracking
    lastStageChangeDate?: string;
    daysInCurrentStage?: number;
    totalDaysToClose?: number;

    // Deal Health & Scoring
    dealScore?: number;
    dealHealth?: 'Hot' | 'Healthy' | 'At Risk' | 'Stalled';
    riskFactors?: string; // JSON array

    // Next Steps
    nextAction?: string;
    nextActionDate?: string;
    nextActionOwner?: string;

    // Competitors
    competitors?: string; // JSON array
    primaryCompetitor?: string;
    competitivePosition?: 'Ahead' | 'Behind' | 'Even' | 'Unknown';

    // Value & Forecasting
    weightedValue?: number;
    recurringValue?: number;
    currency?: string;
    forecastCategory?: 'Pipeline' | 'Best Case' | 'Commit' | 'Closed' | 'Omitted';

    // Relationships
    contactId?: number;
    contact?: Contact;
    companyId?: number;
    company?: Company;
    owner?: string;
    ownerId?: number;

    // Source & Type
    source?: string;
    type?: string;

    // Description & Notes
    description?: string;
    tags?: string; // JSON string array

    // Timestamps
    createdAt?: string;
    lastModifiedAt?: string;

    // Navigation
    stageHistory?: StageHistory[];
    products?: OpportunityProduct[];
}

// =============================================
// Opportunity Product/Line Item
// =============================================
export interface OpportunityProduct {
    id?: number;
    opportunityId: number;
    productName: string;
    productCode?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    discountType?: 'Percentage' | 'Fixed';
    totalPrice: number;
    description?: string;
    createdAt?: string;
}

// =============================================
// Stage History
// =============================================
export interface StageHistory {
    id?: number;
    opportunityId: number;
    fromStage: string;
    toStage: string;
    changedAt: string;
    changedByUserId?: number;
    daysInPreviousStage?: number;
}

// =============================================
// Pipeline Card (for Kanban view)
// =============================================
export interface PipelineCard {
    id: number;
    name: string;
    amount: number;
    weightedValue: number;
    probability: number;
    expectedCloseDate: string;
    dealScore?: number;
    dealHealth?: string;
    nextAction?: string;
    owner?: string;
    contactName?: string;
    companyName?: string;
    daysInStage?: number;
    color?: string;
}

// =============================================
// Stats & Analytics
// =============================================
export interface OpportunityStats {
    totalOpportunities: number;
    openOpportunities: number;
    wonOpportunities: number;
    lostOpportunities: number;

    totalPipelineValue: number;
    weightedPipelineValue: number;
    totalWonValue: number;
    totalLostValue: number;

    winRate: number;
    avgDealSize: number;
    avgDaysToClose: number;

    byStage: StageSummary[];
    byForecast: ForecastSummary[];

    atRiskDeals: number;
    hotDeals: number;
}

export interface StageSummary {
    stage: string;
    count: number;
    totalValue: number;
    weightedValue: number;
    color: string;
}

export interface ForecastSummary {
    category: string;
    count: number;
    value: number;
}

export interface VelocityMetrics {
    avgSalesCycle: number;
    dealsClosed30Days: number;
    revenueClosed30Days: number;
    winRate30Days: number;
    avgDaysByStage: { stage: string; avgDaysInStage: number }[];
}

export interface LeaderboardEntry {
    owner: string;
    totalDeals: number;
    wonDeals: number;
    lostDeals: number;
    openDeals: number;
    wonValue: number;
    pipelineValue: number;
    winRate: number;
}

// =============================================
// Constants
// =============================================
export const OPPORTUNITY_STAGES: OpportunityStage[] = [
    'Lead',
    'Qualified',
    'Proposal',
    'Negotiation',
    'Closed Won',
    'Closed Lost'
];

export const STAGE_COLORS: Record<string, string> = {
    'Lead': '#6366F1',
    'Qualified': '#3B82F6',
    'Proposal': '#F59E0B',
    'Negotiation': '#8B5CF6',
    'Closed Won': '#22C55E',
    'Closed Lost': '#EF4444',
    // Backwards compatibility
    'Initial': '#6366F1',
    'Qualification': '#3B82F6'
};

export const DEFAULT_PROBABILITIES: Record<string, number> = {
    'Lead': 10,
    'Qualified': 25,
    'Proposal': 50,
    'Negotiation': 75,
    'Closed Won': 100,
    'Closed Lost': 0,
    'Initial': 10,
    'Qualification': 25
};

export const WIN_REASONS = [
    'Price', 'Features', 'Relationship', 'Brand Trust',
    'Speed', 'Support', 'Customization', 'Integration', 'Other'
];

export const LOSS_REASONS = [
    'Price Too High', 'Lost to Competition', 'No Budget', 'Bad Timing', 'No Decision',
    'Missing Features', 'Poor Fit', 'Champion Left', 'Project Cancelled', 'Other'
];

export const SOURCES = [
    'Website', 'Referral', 'Cold Call', 'Trade Show', 'Partner', 'Social Media',
    'Email Campaign', 'Inbound', 'Outbound', 'Existing Customer', 'Other'
];

export const OPPORTUNITY_TYPES = [
    'New Business', 'Upsell', 'Cross-sell', 'Renewal', 'Expansion', 'Replacement'
];

export const FORECAST_CATEGORIES = [
    'Pipeline', 'Best Case', 'Commit', 'Closed', 'Omitted'
];

export const DEAL_HEALTH_OPTIONS = ['Hot', 'Healthy', 'At Risk', 'Stalled'];
