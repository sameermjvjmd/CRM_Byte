import api from '../api/api';

export interface ExportOptions {
    endpoint: string;
    filename: string;
    format: 'pdf' | 'excel';
}

/**
 * Export data to PDF
 */
export const exportToPdf = async (endpoint: string, filename: string): Promise<void> => {
    try {
        const response = await api.get(endpoint, {
            responseType: 'blob',
        });

        downloadBlob(response.data, `${filename}.pdf`, 'application/pdf');
    } catch (error) {
        console.error('PDF export failed:', error);
        throw new Error('Failed to export to PDF');
    }
};

/**
 * Export data to Excel
 */
export const exportToExcel = async (endpoint: string, filename: string): Promise<void> => {
    try {
        const response = await api.get(endpoint, {
            responseType: 'blob',
        });

        downloadBlob(
            response.data,
            `${filename}.xlsx`,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
    } catch (error) {
        console.error('Excel export failed:', error);
        throw new Error('Failed to export to Excel');
    }
};

/**
 * Download a blob as a file
 */
const downloadBlob = (blob: Blob, filename: string, mimeType: string): void => {
    const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

/**
 * Generic export function
 */
export const exportData = async (options: ExportOptions): Promise<void> => {
    const { endpoint, filename, format } = options;

    if (format === 'pdf') {
        return exportToPdf(endpoint, filename);
    } else {
        return exportToExcel(endpoint, filename);
    }
};
