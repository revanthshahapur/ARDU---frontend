import api from '../core/config/api';

// Fetch organization content from backend
export const getOrganizationContent = async (token) => {
    try {
        const response = await api.get('/api/organization', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching organization content:', error);
        throw error;
    }
};

// Alternative direct fetch method
export const organizationService = {
    async getContent(token) {
        try {
            const response = await fetch('http://localhost:8080/api/organization', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 403) {
                    console.log('Organization API endpoint not available or access denied');
                } else if (response.status === 404) {
                    console.log('Organization API endpoint not found');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching organization content:', error);
            throw error;
        }
    }
};
