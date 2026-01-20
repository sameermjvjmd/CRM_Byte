export interface QuoteTemplate {
    id: number;
    name: string;
    companyName: string;
    companyAddress: string;
    companyLogoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    showSku: boolean;
    showQuantity: boolean;
    showDiscountColumn: boolean;
    showTaxSummary: boolean;
    showShipping: boolean;
    showNotes: boolean;
    defaultTerms?: string;
    defaultFooter?: string;
    isDefault: boolean;
    createdAt?: string;
}
