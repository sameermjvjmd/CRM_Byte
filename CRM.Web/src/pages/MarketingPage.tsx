import { useState } from 'react';
import { LayoutTemplate, Globe, Users, BarChart3, Mail, PenTool } from 'lucide-react';
import MarketingDashboard from '../components/marketing/MarketingDashboard';
import MarketingLists from '../components/marketing/MarketingLists';
import CampaignsList from '../components/marketing/CampaignsList';
import VisualEmailBuilder from '../components/marketing/VisualEmailBuilder';
import LandingPagesList from '../components/marketing/LandingPagesList';
import LeadScoringRules from '../components/marketing/LeadScoringRules';

const MarketingPage = () => {
    const [activeView, setActiveView] = useState<'Dashboard' | 'Campaigns' | 'Lists' | 'Templates' | 'LandingPages' | 'Scoring'>('Dashboard');

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Marketing Automation</h1>
                    <p className="text-slate-500 text-sm">Create, send, and track automated marketing campaigns.</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-start mb-8 overflow-x-auto">
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setActiveView('Dashboard')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'Dashboard' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                    >
                        <BarChart3 size={16} /> Dashboard
                    </button>
                    <button
                        onClick={() => setActiveView('Campaigns')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'Campaigns' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                    >
                        <Mail size={16} /> Campaigns
                    </button>
                    <button
                        onClick={() => setActiveView('Lists')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'Lists' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                    >
                        <Users size={16} /> Lists
                    </button>
                    <button
                        onClick={() => setActiveView('Templates')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'Templates' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                    >
                        <LayoutTemplate size={16} /> Builder
                    </button>
                    <button
                        onClick={() => setActiveView('LandingPages')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'LandingPages' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                    >
                        <Globe size={16} /> Landing Pages
                    </button>
                    <button
                        onClick={() => setActiveView('Scoring')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'Scoring' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                    >
                        <PenTool size={16} /> Lead Scoring
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
                {activeView === 'Dashboard' && <MarketingDashboard />}
                {activeView === 'Lists' && <MarketingLists />}
                {activeView === 'Campaigns' && <CampaignsList />}

                {activeView === 'Templates' && (
                    <div className="space-y-4">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-center gap-3 text-indigo-700">
                            <PenTool size={20} />
                            <div>
                                <p className="text-sm font-bold">Visual Email Builder</p>
                                <p className="text-xs opacity-80">Drag and drop blocks to design your email template.</p>
                            </div>
                        </div>
                        <VisualEmailBuilder />
                    </div>
                )}

                {activeView === 'LandingPages' && <LandingPagesList />}
                {activeView === 'Scoring' && <LeadScoringRules />}
            </div>
        </div>
    );
};

export default MarketingPage;
