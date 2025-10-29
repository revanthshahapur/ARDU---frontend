import React, { useState, createContext, useContext } from 'react';

// --- MOCK Dependencies for Single-File Runnability ---
// Mocking Link and useAuth to keep the component runnable outside a router/auth context

const RouterContext = createContext({ navigate: () => {} });
const Link = ({ to, children, className }) => {
    return (
        <a 
            href={to} 
            onClick={(e) => { e.preventDefault(); console.log(`Navigating to ${to}`); }} 
            className={className}
        >
            {children}
        </a>
    );
};

// Mock Auth hook (although token is no longer used, we keep it mocked for structure)
const useAuth = () => ({
    token: 'mock-token-static'
});


// --- STATIC DATA DEFINITION ---
const MOCK_ORGANIZATION_DATA = {
    logo: 'ARDU',
    title: 'Auto Rickshaw Drivers Union',
    subtitle: 'Established in 1974 • Supporting Driver Community',
    kannadaContent: [
        "1974 ರಲ್ಲಿ ಸ್ಥಾಪಿತವಾದ ಆಟೋ ರಿಕ್ಷಾ ಚಾಲಕರ ಒಕ್ಕೂಟ (ARDU) ಚಾಲಕ ಸಮುದಾಯವನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ ಮತ್ತು ಅವರ ಹಕ್ಕುಗಳು ಮತ್ತು ಜವಾಬ್ದಾರಿಗಳ ಬಗ್ಗೆ ಅವರಿಗೆ ಶಿಕ್ಷಣ ನೀಡುತ್ತದೆ. ARDU ಚಾಲಕರಲ್ಲಿ ಜಾಗೃತಿ ಮೂಡಿಸಲು, ಉತ್ತಮ ಅಭ್ಯಾಸಗಳನ್ನು ಉತ್ತೇಜಿಸಲು ಮತ್ತು ಪ್ರಯಾಣಿಕರಿಗೆ ವಿಶ್ವಾಸಾರ್ಹ ಹಾಗೂ ಉನ್ನತ ಸೇವೆಯನ್ನು ಒದಗಿಸಲು ಶ್ರಮಿಸುತ್ತದೆ.",
        "ನಮ್ಮ ಯೂನಿಯನ್ ಮೂಲಕ, ಚಾಲಕರು ಸುರಕ್ಷತೆ, ಸಾಮಾಜಿಕ ಭದ್ರತೆ, ಮತ್ತು ನ್ಯಾಯಯುತ ವೇತನದ ಬಗ್ಗೆ ಜ್ಞಾನ ಮತ್ತು ಬೆಂಬಲವನ್ನು ಪಡೆಯುತ್ತಾರೆ. ನಾವು ಸಮುದಾಯದ ಏಳಿಗೆಗಾಗಿ ನಿರಂತರವಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತೇವೆ."
    ],
    englishContent: [
        "Established in 1974, Auto Rickshaw Drivers Union (ARDU) supports the Driver community and educates them on their rights and responsibilities. ARDU strives to raise awareness, promote best practices amongst Drivers and provide trustworthy reliable service to commuters and to improve rider experience.",
        "Through our union, drivers receive knowledge and support regarding safety, social security, and fair wages. We continuously work towards the prosperity of the community."
    ],
    achievementsTitle: 'Key Achievements & Focus Areas',
    achievements: [
        {
            icon: '🏛️',
            title: 'Government Engagement',
            description: 'Active collaboration with State and Central Government for driver welfare policies.'
        },
        {
            icon: '📱',
            title: 'Digital Innovation',
            description: 'NammaYatri - World\'s first open source mobility app to empower drivers.'
        },
        {
            icon: '🤝',
            title: 'Community Support',
            description: 'Over 50 years of dedicated service to driver and commuter communities.'
        }
    ]
};
// ------------------------------------

const OrganizationPage = () => {
    // We directly use the static data and remove all state/effect hooks for fetching.
    const organizationData = MOCK_ORGANIZATION_DATA;
    
    // We no longer need loading or error states as the data is instant and static.

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            {/* Simple Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/feed" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold">
                            ← Back to Feed
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Organization Details</h1>
                        <div></div>
                    </div>
                </div>
            </header>
            
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header Section (Logo/Title) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-indigo-100 dark:border-indigo-900 p-8 mb-8">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 shadow-lg">
                            {organizationData.logo}
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                            {organizationData.title}
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            {organizationData.subtitle}
                        </p>
                    </div>
                </div>

                {/* Kannada Content */}
                <SectionCard 
                    title="ಕನ್ನಡ" 
                    icon="🇮🇳" 
                    content={organizationData.kannadaContent}
                    theme="border-green-300 bg-green-50 dark:border-green-700 dark:bg-gray-800"
                />

                {/* English Content */}
                <SectionCard 
                    title="English" 
                    icon="🌍" 
                    content={organizationData.englishContent}
                    theme="border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-gray-800"
                />

                {/* Key Achievements */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-2xl p-8 text-white mt-8">
                    <h3 className="text-3xl font-bold mb-8 text-center border-b border-indigo-400 pb-4">
                        {organizationData.achievementsTitle}
                    </h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        {organizationData.achievements.map((achievement, index) => (
                            <div key={index} className="text-center bg-white/10 p-6 rounded-xl backdrop-blur-sm transition hover:bg-white/20">
                                <div className="text-4xl mb-3">{achievement.icon}</div>
                                <h4 className="font-semibold text-xl mb-2">{achievement.title}</h4>
                                <p className="text-sm opacity-90">{achievement.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-12 text-gray-500 dark:text-gray-600">
                    <p className="text-sm">© 2024 {organizationData.title}</p>
                    <p className="text-xs mt-1">Empowering drivers, serving communities</p>
                </div>
            </div>
        </div>
    );
};

// Helper component for content sections
const SectionCard = ({ title, icon, content, theme }) => (
    <div className={`rounded-xl shadow-lg border-2 p-8 mb-8 ${theme}`}>
        <div className="flex items-center gap-3 mb-6 border-b border-current pb-4">
            <span className="text-3xl">{icon}</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>
        
        <div className="prose max-w-none text-gray-800 dark:text-gray-300 leading-relaxed">
            {content.map((paragraph, index) => (
                <p key={index} className="mb-4 text-lg">
                    {paragraph}
                </p>
            ))}
        </div>
    </div>
);


export default OrganizationPage;
