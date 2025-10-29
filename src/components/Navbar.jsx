import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, isAuthenticated } = useAuth();

    return (
        <nav className="bg-white shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Existing nav items */}
                    
                    {isAuthenticated && (
                        <div className="flex space-x-4">
                            {user?.role === 'MAIN_ADMIN' || user?.role === 'ADMIN' ? (
                                <Link 
                                    to="/admin/pending" 
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    Admin Pending Posts
                                </Link>
                            ) : (
                                <Link 
                                    to="/my-pending-posts" 
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    My Pending Posts
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;