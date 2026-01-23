import React from 'react';
import { Users, Info, CheckCircle2, MousePointerClick, ArrowRight, Layout, Search, Ticket, Calendar, BarChart3, Settings, Edit, Plus, Filter, FileText, Briefcase } from 'lucide-react';

export const userGuideSections = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: Info,
        content: (
            <div className="space-y-6">
                <p className="text-slate-600">
                    This guide is written for everyone. You don't need to be an expert to use Nexus CRM. Follow the simple steps below to manage your contacts and sales.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-blue-900 mb-4">What is the Dashboard?</h3>
                        <p className="text-sm text-blue-800 mb-3">
                            Think of the Dashboard as your "Home Screen". It's the first thing you see when you log in.
                        </p>
                        <ul className="text-sm space-y-2 text-blue-700">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>It tells you how much revenue you have <strong>right now</strong>.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>It shows your active pipeline of deals.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-green-50 border-green-100 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-green-900 mb-4">How to Move Around</h3>
                        <p className="text-sm text-green-800 mb-2">
                            On the left side of your screen, there is a detailed menu (Sidebar).
                        </p>
                        <ul className="text-sm space-y-2 text-green-700">
                            <li className="flex items-start gap-2">
                                <MousePointerClick className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>Click <strong>Contacts</strong> to see people.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <MousePointerClick className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>Click <strong>Opportunities</strong> to manage sales.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'contacts',
        title: 'Contact Management',
        icon: Users,
        content: (
            <div className="space-y-8">
                <p className="text-slate-600">
                    The Contact Manager is the heart of Nexus CRM. It connects people, companies, and deals.
                </p>

                {/* 1. Creating a Contact */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                        <Plus className="h-5 w-5 text-indigo-600" />
                        <h3 className="font-bold text-slate-900 text-lg">Creating Records</h3>
                    </div>
                    <div className="p-6">
                        <ol className="relative border-l border-slate-200 ml-3 space-y-8">
                            <li className="ml-6">
                                <span className="absolute flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full -left-4 ring-4 ring-white">
                                    <span className="text-indigo-600 font-bold">1</span>
                                </span>
                                <h4 className="font-semibold text-slate-900 mb-1">Click "Create New"</h4>
                                <p className="text-sm text-slate-600">Top specific button. Select "Contact" from the dropdown if needed.</p>
                            </li>
                            <li className="ml-6">
                                <span className="absolute flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full -left-4 ring-4 ring-white">
                                    <span className="text-indigo-600 font-bold">2</span>
                                </span>
                                <h4 className="font-semibold text-slate-900 mb-1">Fill Required Fields</h4>
                                <p className="text-sm text-slate-600 mb-2">Name, Email, and Company are critical for tracking.</p>
                            </li>
                            <li className="ml-6">
                                <span className="absolute flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full -left-4 ring-4 ring-white">
                                    <span className="text-indigo-600 font-bold">3</span>
                                </span>
                                <h4 className="font-semibold text-slate-900 mb-1">Custom Fields</h4>
                                <p className="text-sm text-slate-600">Scroll down for business-specific data (e.g., Tier, Budget).</p>
                            </li>
                        </ol>
                    </div>
                </div>

                {/* 2. List Management (Bulk, Sort, Filter) */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="font-bold text-slate-900 mb-4 text-lg">Managing the List</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-blue-100 rounded text-blue-700 mt-1"><CheckCircle2 className="h-4 w-4" /></div>
                                <div>
                                    <h5 className="font-bold text-slate-800">Bulk Actions</h5>
                                    <p className="text-sm text-slate-600">Tick the checkboxes on the left side of the grid. A new menu appears at the top to <strong>Delete</strong> or <strong>Edit</strong> multiple records at once.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-blue-100 rounded text-blue-700 mt-1"><ArrowRight className="h-4 w-4" /></div>
                                <div>
                                    <h5 className="font-bold text-slate-800">Sorting</h5>
                                    <p className="text-sm text-slate-600">Click any column header (e.g., Created Date) to sort ascending or descending.</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-pink-100 rounded text-pink-700 mt-1"><Filter className="h-4 w-4" /></div>
                                <div>
                                    <h5 className="font-bold text-slate-800">Advanced Filters</h5>
                                    <p className="text-sm text-slate-600">Click the Funnel icon. You can filter by City, Status, or even partial email matches.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-orange-100 rounded text-orange-700 mt-1"><Layout className="h-4 w-4" /></div>
                                <div>
                                    <h5 className="font-bold text-slate-800">Switch Views</h5>
                                    <p className="text-sm text-slate-600">Toggle between List (Grid) and Board (Kanban) views using the icons next to the search bar.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Deep Dive: The Profile Tabs */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <h3 className="font-bold text-slate-900 mb-6 text-lg">Inside a Contact Record (The Tabs)</h3>
                    <div className="grid gap-4">
                        <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-100">
                            <span className="font-black text-indigo-900 w-24 flex-shrink-0 text-sm uppercase tracking-wide">History</span>
                            <span className="text-sm text-slate-600">The Master Timeline. Shows every email sent, call made, or note added.</span>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-100">
                            <span className="font-black text-indigo-900 w-24 flex-shrink-0 text-sm uppercase tracking-wide">Notes</span>
                            <span className="text-sm text-slate-600">Internal sticky notes. Use this for things like "Client prefers morning calls".</span>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-100">
                            <span className="font-black text-indigo-900 w-24 flex-shrink-0 text-sm uppercase tracking-wide">Activities</span>
                            <span className="text-sm text-slate-600">Tasks and Calendar events. Schedule future meetings here.</span>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-100">
                            <span className="font-black text-indigo-900 w-24 flex-shrink-0 text-sm uppercase tracking-wide">Opportunities</span>
                            <span className="text-sm text-slate-600">Sales Deals associated with this person. Click to jump to the Deal Pipeline.</span>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-100">
                            <span className="font-black text-indigo-900 w-24 flex-shrink-0 text-sm uppercase tracking-wide">Documents</span>
                            <span className="text-sm text-slate-600">Upload contracts, PDFs, or images related to this contact.</span>
                        </div>
                    </div>
                </div>

                {/* 4. Import / Export */}
                <div className="bg-indigo-900 text-white rounded-xl p-6">
                    <h3 className="font-bold text-lg mb-4">Data Tools</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-bold text-indigo-200 mb-2">Importing Data</h4>
                            <p className="text-sm text-indigo-100 leading-relaxed">
                                Used to bulk-upload contacts from Excel/CSV.
                                Go to <strong>Tools &gt; Import</strong>. Download the template, fill it, and upload.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-indigo-200 mb-2">Exporting Data</h4>
                            <p className="text-sm text-indigo-100 leading-relaxed">
                                Need a backup? Click the <strong>Export</strong> button in the main toolbar to download your current list as a CSV file.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'detail-view',
        title: 'Working with Records',
        icon: Layout,
        content: (
            <div className="space-y-6">
                <p className="text-slate-600">Once you open a contact, here is what you can do.</p>

                <div className="bg-white border rounded-lg p-6 space-y-4">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Edit className="h-5 w-5 text-indigo-600" />
                        Editing Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <span className="font-bold text-slate-800 block mb-1">1. Click "Edit Record"</span>
                            <span className="text-sm text-slate-600">The big blue button in the top right.</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <span className="font-bold text-slate-800 block mb-1">2. Change Details</span>
                            <span className="text-sm text-slate-600">Update emails, phones, or address.</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                        Scheduling Activities
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                        Need to remember to call them?
                    </p>
                    <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2">
                        <li>Click **+ SCHEDULE**.</li>
                        <li>Select **Call** or **Meeting**.</li>
                        <li>Pick a date/time.</li>
                        <li>It will appear on your dashboard!</li>
                    </ol>
                </div>
            </div>
        )
    },
    {
        id: 'admin',
        title: 'Administration',
        icon: Settings,
        content: (
            <div className="space-y-6">
                <p className="text-slate-600">
                    Configuration for system admins.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <h4 className="font-bold text-slate-900 mb-4">Custom Fields</h4>
                    <p className="text-sm text-slate-600 mb-4">Add new fields like "Budget" or "Customer Tier".</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
                        <li>Go to <strong>Admin</strong> &gt; <strong>Custom Fields</strong>.</li>
                        <li>Click <strong>+ Add Field</strong>.</li>
                        <li>Choose the type (Text, Number, Dropdown).</li>
                        <li>Save to apply it to all records immediately.</li>
                    </ol>
                </div>
            </div>
        )
    }
];
