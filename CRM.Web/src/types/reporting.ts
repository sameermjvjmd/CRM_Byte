export interface ReportField {
    name: string;
    displayName: string;
    dataType: 'string' | 'number' | 'date' | 'boolean';
    isFilterable: boolean;
    isSortable: boolean;
    isGroupable: boolean;
}

export interface ReportCategory {
    category: string;
    fields: ReportField[];
}

export interface ReportFilter {
    field: string;
    operator: string;
    value?: string;
    value2?: string;
}

export interface ReportSorting {
    field: string;
    direction: 'asc' | 'desc';
}

export interface SavedReport {
    id: number;
    name: string;
    description?: string;
    category: string;
    reportType: string;
    configuration?: string;
    columns?: string; // JSON string
    filters?: string; // JSON string
    sorting?: string; // JSON string
    grouping?: string; // JSON string
    chartSettings?: string; // JSON string
    isPublic: boolean;
    isScheduled: boolean;
    scheduleFrequency?: string;
    createdAt: string;
    lastRunAt?: string;
    runCount: number;
    createdByUserId: number;
}

export interface ReportResult {
    category: string;
    columns: string[];
    rows: any[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    summary?: {
        rowCount: number;
        aggregations?: Record<string, any>;
    };
}

export interface DashboardSummary {
    contacts: {
        total: number;
        newThisMonth: number;
    };
    companies: {
        total: number;
        newThisMonth: number;
    };
    opportunities: {
        total: number;
        open: number;
        wonThisMonth: number;
        pipelineValue: number;
    };
    activities: {
        total: number;
        completedThisMonth: number;
        overdue: number;
    };
}

export interface RunReportRequest {
    category: string;
    columns?: string[];
    filters?: ReportFilter[];
    sorting?: ReportSorting;
    groupBy?: string;
    page: number;
    pageSize: number;
    exportFormat?: string;
}
