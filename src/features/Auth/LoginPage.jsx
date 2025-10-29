// src/features/Auth/LoginPage.jsx
import React, { useState } from 'react'; // 🛑 Import useState
import AuthLayout from '../../components/layouts/AuthLayout';
import LoginForm from './components/LoginForm';
import AutoRickshawLoader from '../../components/loaders/AutoRickshawLoader'; // 🛑 Import the loader

const LoginPage = () => {
    // New state to control the loader visibility
    const [isRouting, setIsRouting] = useState(false);

    // Function passed to LoginForm to trigger the loader on successful login
    const startRoutingLoader = () => {
        setIsRouting(true);
    };

    return (
        <>
            {/* 1. Conditionally render the full-screen loader */}
            {isRouting && <AutoRickshawLoader />}
            
            {/* 2. Main content is rendered below the loader */}
            <AuthLayout>
                <LoginForm onLoginSuccess={startRoutingLoader} /> 
            </AuthLayout>
        </>
    );
};

export default LoginPage;