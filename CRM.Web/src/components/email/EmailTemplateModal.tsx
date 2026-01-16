import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save } from 'lucide-react';
import type { EmailTemplate, CreateEmailTemplateDto, UpdateEmailTemplateDto } from '../../api/emailApi';

interface EmailTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateEmailTemplateDto | UpdateEmailTemplateDto) => Promise<void>;
    template?: EmailTemplate;
}

const EmailTemplateModal: React.FC<EmailTemplateModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    template,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setValue,
    } = useForm<CreateEmailTemplateDto & { isActive?: boolean }>();

    useEffect(() => {
        if (template) {
            setValue('name', template.name);
            setValue('subject', template.subject);
            setValue('body', template.body);
            setValue('category', template.category);
            setValue('isActive', template.isActive);
        } else {
            reset({
                name: '',
                subject: '',
                body: '',
                category: 'General',
                isActive: true,
            });
        }
    }, [template, setValue, reset, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {template ? 'Edit Template' : 'Create Template'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name
                            </label>
                            <input
                                {...register('name', { required: 'Name is required' })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                placeholder="e.g. Welcome Email"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Category
                            </label>
                            <input
                                {...register('category')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                placeholder="e.g. Onboarding"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Subject
                        </label>
                        <input
                            {...register('subject', { required: 'Subject is required' })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Email subject line"
                        />
                        {errors.subject && (
                            <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>
                        )}
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Body (HTML supported)
                        </label>
                        <div className="text-xs text-gray-500 mb-2">
                            Use {'{{Placeholder}}'} for dynamic content.
                        </div>
                        <textarea
                            {...register('body', { required: 'Body is required' })}
                            rows={12}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                            placeholder="<html>...</html>"
                        />
                        {errors.body && (
                            <p className="text-red-500 text-xs mt-1">{errors.body.message}</p>
                        )}
                    </div>

                    {template && (
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                {...register('isActive')}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <label className="text-sm text-gray-700 dark:text-gray-300">
                                Active
                            </label>
                        </div>
                    )}
                </form>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-800/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {isSubmitting ? 'Saving...' : 'Save Template'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailTemplateModal;
