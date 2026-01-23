import React, { useState } from 'react';
import { Search, ChevronRight, BookOpen, Menu } from 'lucide-react';
import { userGuideSections } from '../data/userGuideData.tsx';

const UserGuidePage = () => {
    const [activeSection, setActiveSection] = useState(userGuideSections[0].id);
    const [searchQuery, setSearchQuery] = useState('');

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(id);
        }
    };

    const filteredSections = userGuideSections.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full flex-shrink-0 z-10 shadow-sm md:shadow-none">
                <div className="p-6 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <BookOpen className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">User Guide</h1>
                            <p className="text-xs text-slate-500 font-medium">Documentation & Help</p>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search guide..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {filteredSections.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${isActive
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                                <span>{section.title}</span>
                                {isActive && (
                                    <ChevronRight className="h-4 w-4 ml-auto text-indigo-400" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto scroll-smooth p-6 md:p-12 relative" id="main-scroll">
                <div className="max-w-4xl mx-auto space-y-12 pb-24">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Nexus CRM Documentation</h1>
                        <p className="text-slate-500 mt-2">Complete guide to managing your business relationships.</p>
                    </div>

                    {filteredSections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <section
                                key={section.id}
                                id={section.id}
                                className="scroll-mt-6 border-b border-slate-100 pb-12 last:border-0"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
                                </div>

                                <div className="prose max-w-none text-slate-600">
                                    {section.content}
                                </div>
                            </section>
                        );
                    })}

                    {/* Footer */}
                    <div className="mt-12 p-8 bg-indigo-900 text-white rounded-2xl shadow-xl">
                        <h3 className="text-xl font-bold mb-2">Need more help?</h3>
                        <p className="text-indigo-100 mb-6">
                            If you couldn't find what you were looking for, our support team is here to assist.
                        </p>
                        <button className="bg-white text-indigo-900 px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserGuidePage;
