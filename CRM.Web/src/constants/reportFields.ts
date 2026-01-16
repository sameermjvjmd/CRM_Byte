import type { ReportCategory } from '../types/reporting';

export const REPORT_CATEGORIES: ReportCategory[] = [
    {
        category: "Contacts",
        fields: [
            { name: "FirstName", displayName: "First Name", dataType: "string", isFilterable: true, isSortable: true, isGroupable: false },
            { name: "LastName", displayName: "Last Name", dataType: "string", isFilterable: true, isSortable: true, isGroupable: false },
            { name: "Email", displayName: "Email", dataType: "string", isFilterable: true, isSortable: true, isGroupable: false },
            { name: "Phone", displayName: "Phone", dataType: "string", isFilterable: true, isSortable: false, isGroupable: false },
            { name: "JobTitle", displayName: "Job Title", dataType: "string", isFilterable: true, isSortable: true, isGroupable: true },
            { name: "Company", displayName: "Company", dataType: "string", isFilterable: true, isSortable: true, isGroupable: true },
            { name: "Status", displayName: "Status", dataType: "string", isFilterable: true, isSortable: true, isGroupable: true },
            { name: "ContactSource", displayName: "Source", dataType: "string", isFilterable: true, isSortable: true, isGroupable: true },
            { name: "CreatedAt", displayName: "Created Date", dataType: "date", isFilterable: true, isSortable: true, isGroupable: false }
        ]
    },
    {
        category: "Companies",
        fields: [
            { name: "Name", displayName: "Company Name", dataType: "string", isFilterable: true, isSortable: true, isGroupable: false },
            { name: "Industry", displayName: "Industry", dataType: "string", isFilterable: true, isSortable: true, isGroupable: true },
            { name: "Website", displayName: "Website", dataType: "string", isFilterable: true, isSortable: false, isGroupable: false },
            { name: "Phone", displayName: "Phone", dataType: "string", isFilterable: true, isSortable: false, isGroupable: false },
            { name: "City", displayName: "City", dataType: "string", isFilterable: true, isSortable: true, isGroupable: true },
            { name: "State", displayName: "State", dataType: "string", isFilterable: true, isSortable: true, isGroupable: true },
            { name: "ContactCount", displayName: "# Contacts", dataType: "number", isFilterable: true, isSortable: true, isGroupable: false },
            { name: "CreatedAt", displayName: "Created Date", dataType: "date", isFilterable: true, isSortable: true, isGroupable: false }
        ]
    },
    {
        category: "Opportunities",
        fields: [
            { name: "Name", displayName: "Deal Name", dataType: "string", isFilterable: true, isSortable: true, isGroupable: false },
            { name: "Amount", displayName: "Amount", dataType: "number", isFilterable: true, isSortable: true, isGroupable: false },
            { name: "Stage", displayName: "Stage", dataType: "string", isFilterable: true, isSortable: true, isGroupable: true },
            { name: "Probability", displayName: "Probability %", dataType: "number", isFilterable: true, isSortable: true, isGroupable: false },
            { name: "Source", displayName: "Source", dataType: "string", isFilterable: true, isSortable: true, isGroupable: true },
            { name: "Type", displayName: "Type", dataType: "string", isFilterable: true, isSortable: true, isGroupable: true },
            { name: "ExpectedCloseDate", displayName: "Expected Close", dataType: "date", isFilterable: true, isSortable: true, isGroupable: false },
            { name: "Contact", displayName: "Contact", dataType: "string", isFilterable: true, isSortable: true, isGroupable: true },
            { name: "Company", displayName: "Company", dataType: "string", isFilterable: true, isSortable: true, isGroupable: true },
            { name: "CreatedAt", displayName: "Created Date", dataType: "date", isFilterable: true, isSortable: true, isGroupable: false }
        ]
    },
    {
        category: "Activities",
        fields: [
            { name: "Subject", displayName: "Subject", dataType: "string", isFilterable: true, isSortable: true, isGroupable: false },
            { name: "Type", displayName: "Type", dataType: "string", isFilterable: true, isSortable: true, isGroupable: true },
            { name: "Category", displayName: "Category", dataType: "string", isFilterable: true, isSortable: true, isGroupable: true },
            { name: "StartTime", displayName: "Start Time", dataType: "date", isFilterable: true, isSortable: true, isGroupable: false },
            { name: "IsCompleted", displayName: "Completed", dataType: "boolean", isFilterable: true, isSortable: true, isGroupable: true },
            { name: "Contact", displayName: "Contact", dataType: "string", isFilterable: true, isSortable: true, isGroupable: true },
            { name: "CreatedAt", displayName: "Created Date", dataType: "date", isFilterable: true, isSortable: true, isGroupable: false }
        ]
    }
];
