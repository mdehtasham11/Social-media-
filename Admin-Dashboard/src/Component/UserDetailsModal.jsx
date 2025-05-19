import { useState, useEffect } from 'react';
import config from '../config';

const UserDetailsModal = ({ isOpen, onClose }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${config.API_BASE_URL}/admin/users`);
                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || 'Failed to fetch users');
                }

                setUsers(data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-11/12 max-w-4xl max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">User Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-4 overflow-auto max-h-[calc(80vh-8rem)]">
                    {loading ? (
                        <div className="text-center py-4">Loading users...</div>
                    ) : error ? (
                        <div className="text-red-500 text-center py-4">{error}</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    className="bg-gray-50 p-4 rounded-lg shadow-sm"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Name</p>
                                            <p className="font-medium">{user.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium">{user.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Role</p>
                                            <p className="font-medium">{user.role}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Last Login</p>
                                            <p className="font-medium">
                                                {new Date(user.lastLogin).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <p className="font-medium">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${user.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal; 