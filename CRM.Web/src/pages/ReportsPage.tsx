// Reports Page Component
import React, { useState, useEffect } from 'react';
import { reportsApi } from '../api/reportsApi';
import {
    BarChart3, PieChart, TrendingUp, Users, Building,
    Calendar, FileText, Download, Plus, Filter,
    Play, MoreHorizontal
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell
} from 'recharts';
import type { DashboardSummary, SavedReport } from '../types/reporting';
import { formatCurrency } from '../utils/formatters';
import ReportBuilderModal from '../components/reports/ReportBuilderModal';
import toast from 'react-hot-toast';

const ReportsPage = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'standard' | 'custom'>('dashboard');
    const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
    const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
    const [pipelineData, setPipelineData] = useState<any[]>([]);
    const [activityTypeData, setActivityTypeData] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
        fetchSavedReports();
        fetchChartData();
    }, []);

    const fetchChartData = async () => {
        try {
            const pipelineRes = await reportsApi.getPipelineSummary();
            if (pipelineRes.byStage) {
                setPipelineData(pipelineRes.byStage.map((s: any) => ({
                    name: s.stage,
                    value: s.value,
                    count: s.count
                })));
            }

            const activityRes = await reportsApi.getActivitySummary();
            if (activityRes.byType) {
                setActivityTypeData(activityRes.byType.map((t: any) => ({
                    name: t.type,
                    value: t.count
                })));
            }
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    };

    const fetchDashboardData = async () => {
        try {
            const data = await reportsApi.getDashboardSummary();
            setDashboardData(data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedReports = async () => {
        try {
            const data = await reportsApi.getSavedReports();
            setSavedReports(data);
        } catch (error) {
            console.error('Error fetching saved reports:', error);
        }
    };

    const handleCreateNew = () => {
        setSelectedReport(null);
        setIsBuilderOpen(true);
    };

    const handleEditReport = (report: SavedReport) => {
        setSelectedReport(report);
        setIsBuilderOpen(true);
    };

    const handleDeleteReport = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;
        try {
            await reportsApi.deleteSavedReport(id);
            toast.success('Report deleted');
            fetchSavedReports();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete report');
        }
    };

    const handleExport = async (reportId: string) => {
        const toastId = toast.loading('Generating export...');
        try {
            let blob: any;
            let filename = `${reportId}_export.csv`;

            switch (reportId) {
                case 'contacts':
                    blob = await reportsApi.exportContactsCsv();
                    break;
                case 'companies':
                    blob = await reportsApi.exportCompaniesCsv();
                    break;
                case 'opportunities':
                    blob = await reportsApi.exportOpportunitiesCsv();
                    break;
                case 'activities':
                    blob = await reportsApi.exportActivitiesCsv();
                    break;
                default:
                    throw new Error('Unknown report type');
            }

            // Create download link
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            toast.success('Export downloaded', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Failed to export report', { id: toastId });
        }
    };

    const StatCard = ({ title, value, subValue, icon: Icon, color }: any) => (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
            {subValue && (
                <div className="flex items-center text-sm text-slate-500">
                    <TrendingUp size={16} className="text-emerald-500 mr-1" />
                    <span className="text-emerald-600 font-medium mr-1">{subValue}</span>
                    <span>this month</span>
                </div>
            )}
        </div>
    );

    const renderDashboard = () => {
        if (!dashboardData) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

        return (
            <div className="space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Pipeline"
                        value={formatCurrency(dashboardData.opportunities.pipelineValue)}
                        subValue={dashboardData.opportunities.wonThisMonth + " won"}
                        icon={TrendingUp}
                        color="bg-emerald-500"
                    />
                    <StatCard
                        title="Active Contacts"
                        value={dashboardData.contacts.total}
                        subValue={dashboardData.contacts.newThisMonth + " new"}
                        icon={Users}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Total Companies"
                        value={dashboardData.companies.total}
                        subValue={dashboardData.companies.newThisMonth + " new"}
                        icon={Building}
                        color="bg-indigo-500"
                    />
                    <StatCard
                        title="Activities To-Do"
                        value={dashboardData.activities.total}
                        subValue={dashboardData.activities.completedThisMonth + " done"}
                        icon={Calendar}
                        color="bg-amber-500"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
                        <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wide text-xs">
                            <BarChart3 size={16} className="text-indigo-600" />
                            Pipeline Value by Stage
                        </h3>
                        {pipelineData.length > 0 ? (
                            <div className="h-80 w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={pipelineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                            tickFormatter={(val) => `$${val / 1000}k`}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: any) => [formatCurrency(value), 'Value']}
                                        />
                                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                            {pipelineData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981'][index % 5]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center bg-slate-50/50 rounded-lg text-slate-400 border border-dashed border-slate-200">
                                <TrendingUp size={32} className="mb-2 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest">Pipeline Empty</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
                        <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wide text-xs">
                            <PieChart size={16} className="text-purple-600" />
                            Engagement by Activity Type
                        </h3>
                        {activityTypeData.length > 0 ? (
                            <div className="h-80 w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={activityTypeData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {activityTypeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center bg-slate-50/50 rounded-lg text-slate-400 border border-dashed border-slate-200">
                                <Calendar size={32} className="mb-2 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest">No Recent Activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };


    const renderStandardReports = () => {
        const standardReports = [
            { id: 'contacts', title: 'All Contacts', category: 'Contacts', desc: 'List of all active contacts with contact details.' },
            { id: 'companies', title: 'All Companies', category: 'Companies', desc: 'List of all companies with industry and location.' },
            { id: 'opportunities', title: 'Sales Pipeline', category: 'Opportunities', desc: 'All open and closed opportunities by stage.' },
            { id: 'activities', title: 'Activity Log', category: 'Activities', desc: 'History of all scheduled and completed activities.' },
        ];

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {standardReports.map(report => (
                    <div key={report.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                <FileText className="text-indigo-600" size={24} />
                            </div>
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
                                {report.category}
                            </span>
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2">{report.title}</h3>
                        <p className="text-slate-500 text-sm mb-6 h-10">{report.desc}</p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleExport(report.id)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                            >
                                <Download size={16} />
                                Export CSV
                            </button>
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                                View
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderCustomReports = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Saved Reports</h3>
                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm"
                >
                    <Plus size={18} />
                    Create New Report
                </button>
            </div>

            {savedReports.length > 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Report Name</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold">Created By</th>
                                <th className="px-6 py-4 font-semibold">Last Run</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {savedReports.map((report) => (
                                <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{report.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                            {report.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">You</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {report.lastRunAt ? new Date(report.lastRunAt).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEditReport(report)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Run / Edit"
                                            >
                                                <Play size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReport(report.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Filter size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No Custom Reports Yet</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Create custom reports to analyze your data exactly how you need it. filter, sort, and group your data to find insights.
                    </p>
                    <button
                        onClick={handleCreateNew}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                    >
                        Build Your First Report
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="text-indigo-600" />
                        Reporting & Analytics
                    </h1>
                    <p className="text-slate-500 mt-1">Track performance and generate insights.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm flex items-center gap-2">
                        <Download size={16} />
                        Export All Data
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-slate-200">
                <nav className="flex space-x-8">
                    {[
                        { id: 'dashboard', label: 'Dashboard' },
                        { id: 'standard', label: 'Standard Reports' },
                        { id: 'custom', label: 'Custom Reports' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-slate-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
                        Loading data...
                    </div>
                ) : (
                    <>
                        {activeTab === 'dashboard' && renderDashboard()}
                        {activeTab === 'standard' && renderStandardReports()}
                        {activeTab === 'custom' && renderCustomReports()}
                    </>
                )}
            </div>

            <ReportBuilderModal
                isOpen={isBuilderOpen}
                onClose={() => setIsBuilderOpen(false)}
                onSaveSuccess={fetchSavedReports}
                initialReport={selectedReport}
            />
        </div>
    );
};

export default ReportsPage;
