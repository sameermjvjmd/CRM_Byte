import React from 'react';
import type { PermissionCategory } from '../../types/auth';
import { Check, Shield } from 'lucide-react';

interface PermissionListProps {
    groupedPermissions: PermissionCategory[];
    selectedPermissionIds: number[];
    onChange: (ids: number[]) => void;
    readOnly?: boolean;
}

const PermissionList: React.FC<PermissionListProps> = ({
    groupedPermissions,
    selectedPermissionIds,
    onChange,
    readOnly = false
}) => {
    const handleToggle = (permissionId: number) => {
        if (readOnly) return;

        if (selectedPermissionIds.includes(permissionId)) {
            onChange(selectedPermissionIds.filter(id => id !== permissionId));
        } else {
            onChange([...selectedPermissionIds, permissionId]);
        }
    };

    const handleToggleCategory = (categoryPermissions: number[]) => {
        if (readOnly) return;

        // specific logic: if all in category are selected, deselect all. Otherwise, select all.
        const allSelected = categoryPermissions.every(id => selectedPermissionIds.includes(id));

        if (allSelected) {
            onChange(selectedPermissionIds.filter(id => !categoryPermissions.includes(id)));
        } else {
            const newIds = [...selectedPermissionIds];
            categoryPermissions.forEach(id => {
                if (!newIds.includes(id)) {
                    newIds.push(id);
                }
            });
            onChange(newIds);
        }
    };

    return (
        <div className="space-y-6">
            {groupedPermissions.map((group) => {
                const categoryPermissionIds = group.permissions.map(p => p.id);
                const allSelected = categoryPermissionIds.every(id => selectedPermissionIds.includes(id));

                return (
                    <div key={group.category} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-indigo-500" />
                                <h3 className="font-medium text-slate-700">{group.category}</h3>
                            </div>

                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => handleToggleCategory(categoryPermissionIds)}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                                >
                                    {allSelected ? 'Deselect All' : 'Select All'}
                                </button>
                            )}
                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {group.permissions.map((permission) => {
                                const isSelected = selectedPermissionIds.includes(permission.id);

                                return (
                                    <div
                                        key={permission.id}
                                        onClick={() => handleToggle(permission.id)}
                                        className={`
                                            flex items-start gap-3 p-3 rounded-md border text-sm cursor-pointer transition-all
                                            ${isSelected
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'
                                            }
                                            ${readOnly ? 'cursor-default pointer-events-none' : ''}
                                        `}
                                    >
                                        <div className={`
                                            mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors
                                            ${isSelected
                                                ? 'bg-indigo-600 border-indigo-600'
                                                : 'bg-white border-slate-300'
                                            }
                                        `}>
                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                        </div>

                                        <div className="flex-1">
                                            <p className="font-medium">{permission.name}</p>
                                            {permission.description && (
                                                <p className="text-xs text-slate-500 mt-1">{permission.description}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {groupedPermissions.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                    No permissions available.
                </div>
            )}
        </div>
    );
};

export default PermissionList;
