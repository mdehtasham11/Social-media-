import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import config from '../config';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // If already logged in, redirect to dashboard
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            navigate('/');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userName || !password) {
            toast.error('Please enter username and password');
            return;
        }
        try {
            setLoading(true);
            const response = await axios.post(`${config.API_BASE_URL}/auth/login-admin`, {
                userName,
                password,
            });

            const { data: res } = response;
            const token = res?.data?.token;

            if (token) {
                localStorage.setItem('adminToken', token);
                toast.success('Login successful');
                navigate('/');
            } else {
                toast.error(res?.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin; 