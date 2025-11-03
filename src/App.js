// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// Note: Assuming AuthProvider is correctly exported from this path based on your original file.
import { AuthProvider } from './features/Auth/AuthContext';  // Import directly from AuthContext

// --- Core Feature Imports ---
import RegisterPage from './features/Auth/RegisterPage'; 
import LoginPage from './features/Auth/LoginPage'; 
import ProfilePage from "./features/Profile/ProfilePage";
import MembersPage from "./features/Members/MembersPage";
import FeedPage from './features/Feed/FeedPage';
import UploadPage from './features/Upload/UploadPage';
import { OrganizationPage } from './features/Organization';

// --- NEW ADMIN IMPORT ---
import AdminReviewPage from './features/Admin/AdminReviewPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import UserPendingPosts from './features/User/UserPendingPosts';
import SharePage from './features/Share/SharePage';
import MainLayout  from './components/layouts/MainLayout';
// import StatusTabs from './components/StatusTabs';
// D:\IDMS1.23.50\ARDU-FEND\src\components\layouts\MainLayout.jsx
const AppContent = () => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    // Split routes: auth pages render without the MainLayout; all other app pages render inside MainLayout
    const authRoutes = (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
        </Routes>
    );

    const appRoutes = (
        <Routes>
            {/* Protected/User Routes */}
            <Route path="/dashboard" element={<h1>Dashboard (Protected)</h1>} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/org" element={<OrganizationPage />} />
            <Route path="/organization" element={<OrganizationPage />} />

            {/* Admin Routes - Now Protected */}
            <Route
                path="/admin"
                element={
                    <ProtectedAdminRoute>
                        <AdminReviewPage />
                    </ProtectedAdminRoute>
                }
            />
            <Route
                path="/admin/pending"
                element={
                    <ProtectedAdminRoute>
                        <AdminReviewPage />
                    </ProtectedAdminRoute>
                }
            />
            <Route
                path="/admin/review"
                element={
                    <ProtectedAdminRoute>
                        <AdminReviewPage />
                    </ProtectedAdminRoute>
                }
            />
            <Route
                path="/my-pending-posts"
                element={
                    <ProtectedRoute>
                        <UserPendingPosts />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/accept-posts"
                element={
                    <ProtectedAdminRoute>
                        <AdminReviewPage />
                    </ProtectedAdminRoute>
                }
            />
            <Route path="/community" element={<FeedPage />} />
            <Route path="/share/p/:shareId" element={<SharePage />} />
        </Routes>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {isAuthPage ? (
                authRoutes
            ) : (
                <MainLayout>
                    {appRoutes}
                </MainLayout>
            )}
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
