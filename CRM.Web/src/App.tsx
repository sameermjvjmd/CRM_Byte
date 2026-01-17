
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import TopNavigation from './components/TopNavigation';
import ActionToolbar from './components/ActionToolbar';
import ReminderNotification from './components/ReminderNotification';

import Sidebar from './components/Sidebar';
import ContactsPage from './pages/ContactsPage';
import DashboardPage from './pages/DashboardPage';
import PipelineBoardPage from './pages/PipelineBoardPage';
import PipelineAnalyticsPage from './pages/PipelineAnalyticsPage';
import SalesForecastPage from './pages/SalesForecastPage';
import OpportunityDetailPage from './pages/OpportunityDetailPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import ActivitiesPage from './pages/ActivitiesPage';
import ContactDetailPage from './pages/ContactDetailPage';
import CompaniesPage from './pages/CompaniesPage';
import MarketingPage from './pages/MarketingPage';
import GroupsPage from './pages/GroupsPage';
import HistoryPage from './pages/HistoryPage';
import ReportsPage from './pages/ReportsPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import GroupDetailPage from './pages/GroupDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterTenantPage from './pages/RegisterTenantPage';
import ToolsPage from './pages/ToolsPage';
import UserManagementPage from './pages/UserManagementPage';
import TasksPage from './pages/TasksPage';
import LookupPage from './pages/LookupPage';
import WritePage from './pages/WritePage';
import SMSPage from './pages/SMSPage';
import InsightPage from './pages/InsightPage';
import CustomTablesPage from './pages/CustomTablesPage';
import AccountingPage from './pages/AccountingPage';
import ImportDataPage from './pages/tools/ImportDataPage';
import DuplicateScanPage from './pages/tools/DuplicateScanPage';
import DefineFieldsPage from './pages/tools/DefineFieldsPage';
import ActivityDemoPage from './pages/ActivityDemoPage';
import RolesPage from './pages/admin/RolesPage';
import RoleManagePage from './pages/admin/RoleManagePage';
import EmailTemplatesPage from './pages/EmailTemplatesPage';
import EmailSignaturesPage from './pages/EmailSignaturesPage';
import SentEmailsPage from './pages/SentEmailsPage';
import EmailSettingsPage from './pages/settings/EmailSettingsPage';
import ProductsPage from './pages/ProductsPage';
import QuotesPage from './pages/QuotesPage';
import QuoteDetailPage from './pages/QuoteDetailPage';
import WorkflowsPage from './pages/WorkflowsPage';
import CustomFieldsPage from './pages/CustomFieldsPage';

const AppContent = () => {
    const location = useLocation();
    const isPublicPage = location.pathname === '/login' || location.pathname === '/register';

    return (
        <div className="flex flex-col h-screen w-full bg-[#f8fafc] overflow-hidden">
            {!isPublicPage && (
                <>
                    <TopNavigation />
                    <ReminderNotification />
                </>
            )}

            <div className="flex flex-1 min-h-0">
                {!isPublicPage && <Sidebar />}

                <div className="flex-1 flex flex-col min-w-0">
                    {!isPublicPage && <ActionToolbar />}

                    <main className={`flex-1 overflow-y-auto ${isPublicPage ? 'bg-white' : ''}`}>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterTenantPage />} />

                            {/* Protected Routes */}
                            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                            <Route path="/contacts" element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
                            <Route path="/contacts/:id" element={<ProtectedRoute><ContactDetailPage /></ProtectedRoute>} />
                            <Route path="/companies" element={<ProtectedRoute><CompaniesPage /></ProtectedRoute>} />
                            <Route path="/companies/:id" element={<ProtectedRoute><CompanyDetailPage /></ProtectedRoute>} />
                            <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
                            <Route path="/groups/:id" element={<ProtectedRoute><GroupDetailPage /></ProtectedRoute>} />

                            {/* Opportunities */}
                            <Route path="/opportunities" element={<ProtectedRoute><PipelineBoardPage /></ProtectedRoute>} />
                            <Route path="/opportunities/list" element={<ProtectedRoute><OpportunitiesPage /></ProtectedRoute>} />
                            <Route path="/opportunities/:id" element={<ProtectedRoute><OpportunityDetailPage /></ProtectedRoute>} />
                            <Route path="/opportunities/analytics" element={<ProtectedRoute><PipelineAnalyticsPage /></ProtectedRoute>} />
                            <Route path="/opportunities/forecast" element={<ProtectedRoute><SalesForecastPage /></ProtectedRoute>} />

                            {/* Activities */}
                            <Route path="/schedule" element={<ProtectedRoute><ActivitiesPage /></ProtectedRoute>} />
                            <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
                            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />

                            {/* Tools & Others */}
                            <Route path="/lookup" element={<ProtectedRoute><LookupPage /></ProtectedRoute>} />
                            <Route path="/write" element={<ProtectedRoute><WritePage /></ProtectedRoute>} />
                            <Route path="/sms" element={<ProtectedRoute><SMSPage /></ProtectedRoute>} />
                            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                            <Route path="/marketing" element={<ProtectedRoute><MarketingPage /></ProtectedRoute>} />
                            <Route path="/insight" element={<ProtectedRoute><InsightPage /></ProtectedRoute>} />
                            <Route path="/templates" element={<ProtectedRoute><EmailTemplatesPage /></ProtectedRoute>} />
                            <Route path="/signatures" element={<ProtectedRoute><EmailSignaturesPage /></ProtectedRoute>} />
                            <Route path="/sent-emails" element={<ProtectedRoute><SentEmailsPage /></ProtectedRoute>} />

                            <Route path="/tools" element={<ProtectedRoute><ToolsPage /></ProtectedRoute>} />
                            <Route path="/tools/import" element={<ProtectedRoute><ImportDataPage /></ProtectedRoute>} />
                            <Route path="/tools/duplicates" element={<ProtectedRoute><DuplicateScanPage /></ProtectedRoute>} />
                            <Route path="/tools/define-fields" element={<ProtectedRoute><DefineFieldsPage /></ProtectedRoute>} />

                            <Route path="/custom-tables" element={<ProtectedRoute><CustomTablesPage /></ProtectedRoute>} />
                            <Route path="/accounting" element={<ProtectedRoute><AccountingPage /></ProtectedRoute>} />
                            <Route path="/products" element={
                                <ProtectedRoute>
                                    <ProductsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/quotes" element={
                                <ProtectedRoute>
                                    <QuotesPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/quotes/:id" element={
                                <ProtectedRoute>
                                    <QuoteDetailPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/workflows" element={
                                <ProtectedRoute>
                                    <WorkflowsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/custom-fields" element={
                                <ProtectedRoute>
                                    <CustomFieldsPage />
                                </ProtectedRoute>
                            } />

                            {/* Admin Only */}
                            <Route path="/users" element={
                                <ProtectedRoute requiredRole="Admin">
                                    <UserManagementPage />
                                </ProtectedRoute>
                            } />

                            <Route path="/settings/roles" element={
                                <ProtectedRoute requiredRole="Admin">
                                    <RolesPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/settings/roles/new" element={
                                <ProtectedRoute requiredRole="Admin">
                                    <RoleManagePage />
                                </ProtectedRoute>
                            } />
                            <Route path="/settings/roles/:id" element={
                                <ProtectedRoute requiredRole="Admin">
                                    <RoleManagePage />
                                </ProtectedRoute>
                            } />

                            {/* Email Settings - Admin Only */}
                            <Route path="/settings/email" element={
                                <ProtectedRoute requiredRole="Admin">
                                    <EmailSettingsPage />
                                </ProtectedRoute>
                            } />

                            <Route path="/activity-demo" element={<ProtectedRoute><ActivityDemoPage /></ProtectedRoute>} />
                        </Routes>
                    </main>
                </div>
            </div>
        </div>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster position="top-right" />
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;
