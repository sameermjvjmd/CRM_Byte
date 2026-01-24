
import React, { useEffect, useState } from 'react';
import { ArrowLeft, BarChart3, PieChart, CheckCircle, XCircle, TrendingUp, Users, Building, Calendar } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { reportsApi } from '../../api/reportsApi';
import { formatCurrency } from '../../utils/formatters';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

interface ViewProps {
    onBack: () => void;
}

const ChartContainer = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
        <h3 className="font-bold text-slate-800 mb-6">{title}</h3>
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                {children}
            </ResponsiveContainer>
        </div>
    </div>
);

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
        <div>
            <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
    </div>
);

export const ContactsReportView = ({ onBack }: ViewProps) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        reportsApi.getContactsReport().then(setData).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center">Loading report...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-slate-900">Contacts Analysis</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Contacts" value={data.totalContacts} icon={Users} color="bg-blue-500" />
                <StatCard title="With Email" value={data.withEmail} icon={CheckCircle} color="bg-emerald-500" />
                <StatCard title="With Phone" value={data.withPhone} icon={CheckCircle} color="bg-indigo-500" />
                <StatCard title="Linked to Company" value={data.withCompany} icon={Building} color="bg-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Contacts by Status">
                    <RePieChart>
                        <Pie data={data.byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label>
                            {data.byStatus.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </RePieChart>
                </ChartContainer>

                <ChartContainer title="Contacts by Source">
                    <BarChart data={data.bySource} layout="vertical" margin={{ left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="source" width={100} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                            {data.bySource.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </div>
        </div>
    );
};

export const CompaniesReportView = ({ onBack }: ViewProps) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        reportsApi.getCompaniesReport().then(setData).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center">Loading report...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-slate-900">Companies Analysis</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Companies" value={data.totalCompanies} icon={Building} color="bg-indigo-500" />
                <StatCard title="Total Contacts Linked" value={data.totalContactsAtCompanies} icon={Users} color="bg-blue-500" />
                <StatCard title="Total Opportunity Value" value={formatCurrency(data.totalOpportunityValue)} icon={TrendingUp} color="bg-emerald-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Companies by Industry">
                    <RePieChart>
                        <Pie data={data.byIndustry} dataKey="count" nameKey="industry" cx="50%" cy="50%" outerRadius={100} label>
                            {data.byIndustry.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </RePieChart>
                </ChartContainer>

                <ChartContainer title="Top Companies by Revenue">
                    <BarChart data={data.topByRevenue} margin={{ bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={60} tick={{ fontSize: 10 }} />
                        <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                        <Tooltip formatter={(val: any) => formatCurrency(val)} />
                        <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </div>
        </div>
    );
};

export const OpportunitiesReportView = ({ onBack }: ViewProps) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        reportsApi.getOpportunitiesReport().then(setData).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center">Loading report...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-slate-900">Opportunities Analysis</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Pipeline" value={formatCurrency(data.totalValue)} icon={TrendingUp} color="bg-emerald-500" />
                <StatCard title="Open Deals" value={data.open} icon={BarChart3} color="bg-blue-500" />
                <StatCard title="Won Deals" value={data.won} icon={CheckCircle} color="bg-green-500" />
                <StatCard title="Lost Deals" value={data.lost} icon={XCircle} color="bg-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Won vs Lost (Count)">
                    <RePieChart>
                        <Pie data={[
                            { name: 'Won', value: data.won },
                            { name: 'Lost', value: data.lost },
                            { name: 'Open', value: data.open }
                        ]} dataKey="value" cx="50%" cy="50%" outerRadius={100} label>
                            <Cell fill="#10b981" />
                            <Cell fill="#ef4444" />
                            <Cell fill="#3b82f6" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </RePieChart>
                </ChartContainer>

                <ChartContainer title="Revenue by Source">
                    <BarChart data={data.bySource}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="source" />
                        <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                        <Tooltip formatter={(val: any) => formatCurrency(val)} />
                        <Bar dataKey="value" name="Total Value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </div>
        </div>
    );
};

export const ActivitiesReportView = ({ onBack }: ViewProps) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        reportsApi.getActivitySummary().then(setData).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center">Loading report...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-slate-900">Activity Log Analysis</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Activities" value={data.totalActivities} icon={Calendar} color="bg-blue-500" />
                <StatCard title="Completed" value={data.completed} icon={CheckCircle} color="bg-emerald-500" />
                <StatCard title="Pending" value={data.pending} icon={Calendar} color="bg-amber-500" />
                <StatCard title="Completion Rate" value={`${Math.round(data.completionRate)}%`} icon={TrendingUp} color="bg-indigo-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Activities by Type">
                    <BarChart data={data.byType}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" name="Total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>

                <ChartContainer title="Activities by Category">
                    <RePieChart>
                        <Pie data={data.byCategory} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={100} label>
                            {data.byCategory.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </RePieChart>
                </ChartContainer>
            </div>
        </div>
    );
};
