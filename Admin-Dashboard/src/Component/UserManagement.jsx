import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import config from '../config';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('date_desc');
    const [status, setStatus] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState('');
    const [reason, setReason] = useState('');
    const [actionModal, setActionModal] = useState({ show: false, type: '', user: null });
    const [actionReason, setActionReason] = useState('');

    // Get token from localStorage
    const getAuthToken = () => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            toast.error('Please login to access this feature');
            return null;
        }
        return token;
    };

    // Configure axios defaults
    const setupAxiosAuth = () => {
        const token = getAuthToken();
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    };

    const fetchUsers = async () => {
        setupAxiosAuth();
        try {
            const response = await axios.get(`${config.API_BASE_URL}/admin/users?search=${search}&sort=${sort}&status=${status}`);
            if (response.data.success) {
                setUsers(response.data.data);
            } else {
                toast.error(response.data.message || 'Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            if (error.response?.status === 401) {
                toast.error('Please login to access this feature');
                // You might want to redirect to login page here
            } else {
                toast.error(error.response?.data?.message || 'Failed to fetch users');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [search, sort, status]);

    const handleUserAction = async (userId, action) => {
        setSelectedUser(userId);
        setActionType(action);
        setShowModal(true);
    };

    const confirmAction = async () => {
        try {
            if (actionType === 'delete') {
                await axios.delete(`/api/admin/users/${selectedUser}`);
                toast.success('User deleted successfully');
            } else {
                await axios.patch(`/api/admin/users/${selectedUser}/status`, {
                    status: actionType,
                    reason
                });
                toast.success(`User ${actionType} successfully`);
            }
            setShowModal(false);
            setReason('');
            fetchUsers();
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error('Please login to access this feature');
                // Redirect to login page or handle unauthorized access
            } else {
                toast.error('Action failed');
            }
        }
    };

    const handleStatusChange = async (userId, newStatus, reason = '') => {
        try {
            const response = await axios.patch(`/api/admin/users/${userId}/status`, {
                status: newStatus,
                reason
            });

            if (response.data.success) {
                toast.success(`User ${newStatus === 'active' ? 'unbanned' : newStatus} successfully`);
                fetchUsers(); // Refresh the user list
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            toast.error(error.response?.data?.message || 'Failed to update user status');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            const response = await axios.delete(`/api/admin/users/${userId}`);
            if (response.data.success) {
                toast.success('User deleted successfully');
                fetchUsers(); // Refresh the user list
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const renderActionMenu = (user) => {
        const isBanned = user.status === 'banned';
        const isSuspended = user.status === 'suspended';

        return (
            <div className="relative">
                <button
                    onClick={() => setSelectedUser(user)}
                    className="text-gray-600 hover:text-gray-900"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                    </svg>
                </button>
                {selectedUser?._id === user._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                        <div className="py-1">
                            {!isBanned && !isSuspended && (
                                <>
                                    <button
                                        onClick={() => {
                                            setActionModal({
                                                show: true,
                                                type: 'ban',
                                                user: user
                                            });
                                            setSelectedUser(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        Ban User
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActionModal({
                                                show: true,
                                                type: 'suspend',
                                                user: user
                                            });
                                            setSelectedUser(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                                    >
                                        Suspend User
                                    </button>
                                </>
                            )}
                            {isBanned && (
                                <button
                                    onClick={() => {
                                        setActionModal({
                                            show: true,
                                            type: 'unban',
                                            user: user
                                        });
                                        setSelectedUser(null);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                >
                                    Unban User
                                </button>
                            )}
                            {isSuspended && (
                                <button
                                    onClick={() => {
                                        setActionModal({
                                            show: true,
                                            type: 'unsuspend',
                                            user: user
                                        });
                                        setSelectedUser(null);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                >
                                    Unsuspend User
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setActionModal({
                                        show: true,
                                        type: 'delete',
                                        user: user
                                    });
                                    setSelectedUser(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const handleActionConfirm = async () => {
        if (!actionModal.user) return;

        try {
            switch (actionModal.type) {
                case 'ban':
                    await handleStatusChange(actionModal.user._id, 'banned', actionReason);
                    break;
                case 'suspend':
                    await handleStatusChange(actionModal.user._id, 'suspended', actionReason);
                    break;
                case 'unban':
                    await handleStatusChange(actionModal.user._id, 'active', actionReason);
                    break;
                case 'unsuspend':
                    await handleStatusChange(actionModal.user._id, 'active', actionReason);
                    break;
                case 'delete':
                    await handleDeleteUser(actionModal.user._id);
                    break;
            }
            setActionModal({ show: false, type: '', user: null });
            setActionReason('');
        } catch (error) {
            console.error('Error performing action:', error);
            toast.error('Failed to perform action');
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-wrap gap-4">
                <input
                    type="text"
                    placeholder="Search users..."
                    className="px-4 py-2 border rounded-lg"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="px-4 py-2 border rounded-lg"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                >
                    <option value="date_desc">Newest First</option>
                    <option value="date_asc">Oldest First</option>
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                </select>
                <select
                    className="px-4 py-2 border rounded-lg"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center">Loading...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Join Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Posts
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img
                                                className="h-10 w-10 rounded-full"
                                                src={user.profile}
                                                alt=""
                                            />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    @{user.userName}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.postCount}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                                                user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {renderActionMenu(user)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Action Modal */}
            {actionModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">
                            {actionModal.type === 'ban' && 'Ban User'}
                            {actionModal.type === 'suspend' && 'Suspend User'}
                            {actionModal.type === 'unban' && 'Unban User'}
                            {actionModal.type === 'unsuspend' && 'Unsuspend User'}
                            {actionModal.type === 'delete' && 'Delete User'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {actionModal.type === 'ban' && 'Are you sure you want to ban this user?'}
                            {actionModal.type === 'suspend' && 'Are you sure you want to suspend this user?'}
                            {actionModal.type === 'unban' && 'Are you sure you want to unban this user?'}
                            {actionModal.type === 'unsuspend' && 'Are you sure you want to unsuspend this user?'}
                            {actionModal.type === 'delete' && 'Are you sure you want to delete this user? This action cannot be undone.'}
                        </p>
                        {(actionModal.type === 'ban' || actionModal.type === 'suspend' || actionModal.type === 'unban' || actionModal.type === 'unsuspend') && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason
                                </label>
                                <input
                                    type="text"
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Enter reason for action"
                                />
                            </div>
                        )}
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setActionModal({ show: false, type: '', user: null });
                                    setActionReason('');
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleActionConfirm}
                                className={`px-4 py-2 rounded-md ${actionModal.type === 'delete'
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : actionModal.type === 'unban' || actionModal.type === 'unsuspend'
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                    }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement; 