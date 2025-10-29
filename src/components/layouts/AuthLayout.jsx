import React from 'react';
import loginBg from '../../Assets/login/login.png'; // ✅ correct import path

/**
 * Auth layout with modern full white theme and left image section.
 * Works seamlessly with LoginForm.
 */
const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
            {/* Left side - Image section */}
            <div className="hidden md:flex md:w-1/2 items-center justify-center p-10">
                <img
                    src={loginBg}
                    alt="Login Illustration"
                    className="w-4/5 h-auto object-contain"
                />
            </div>

            {/* Right side - Form section */}
            <div className="flex w-full md:w-1/2 items-center justify-center p-6 md:p-12">
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
