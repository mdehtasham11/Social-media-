import React, { useState, useEffect } from 'react';

const PostsModal = ({ isOpen, onClose }) => {
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch posts
                const postsResponse = await fetch('http://localhost:8002/api/admin/posts');
                const postsData = await postsResponse.json();

                if (!postsData.success) {
                    throw new Error(postsData.error || 'Failed to fetch posts');
                }

                setPosts(postsData.data);

                // Fetch users
                const usersResponse = await fetch('http://localhost:8002/api/admin/users');
                const usersData = await usersResponse.json();

                if (!usersData.success) {
                    throw new Error(usersData.error || 'Failed to fetch users');
                }

                setUsers(usersData.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    // const getScoreColor = (score) => {
    //     if (score < 0.4) return 'text-green-600';
    //     if (score < 0.7) return 'text-yellow-600';
    //     return 'text-red-600';
    // };

    // const formatScore = (score) => {
    //     return score.toFixed(3);
    // };

    const filteredPosts = posts.filter(post => {
        if (!post) return false;
        const postText = post.caption || '';
        const userName = post.user?.name || '';
        const matchesSearch = postText.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesUser = !selectedUser || post.user?._id === selectedUser;
        return matchesSearch && matchesUser;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">User Posts</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex gap-4 mb-4">
                    <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="p-2 border rounded flex-shrink-0"
                    >
                        <option value="">All Users</option>
                        {users.map((user) => (
                            <option key={user._id} value={user._id}>
                                {user.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Search by user name or post content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="overflow-y-auto flex-grow">
                    {loading ? (
                        <div className="text-center py-4">Loading posts...</div>
                    ) : error ? (
                        <div className="text-center py-4 text-red-500">{error}</div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-4">No posts found</div>
                    ) : (
                        <div className="space-y-4">
                            {filteredPosts.map((post) => (
                                <div key={post._id} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-start gap-4">
                                        {post.image && (
                                            <img
                                                src={post.image}
                                                alt="Post"
                                                className="w-24 h-24 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-grow">
                                            <p className="text-gray-700">{post.caption}</p>
                                            <p className="text-sm text-gray-500">
                                                Posted by: {post.user?.name || 'Unknown User'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Posted on: {new Date(post.createdAt).toLocaleString()}
                                            </p>
                                            <div className="mt-2 flex gap-2 text-sm text-gray-500">
                                                <span>Likes: {post.likeCount || 0}</span>
                                                <span>Comments: {post.comments?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* {post.analysis && post.analysis.attributeScores && (
                                        <div className="mt-2">
                                            <table className="min-w-full bg-white border border-gray-200">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Attribute</th>
                                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Score</th>
                                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(post.analysis.attributeScores).map(([attribute, data]) => {
                                                        const score = data.summaryScore?.value || 0;
                                                        return (
                                                            <tr key={attribute}>
                                                                <td className="px-4 py-2 border-t font-medium">
                                                                    {attribute.replace(/_/g, ' ')}
                                                                </td>
                                                                <td className="px-4 py-2 border-t">
                                                                    <span className={getScoreColor(score)}>
                                                                        {formatScore(score)}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-2 border-t">
                                                                    {score < 0.4 ? '✅' :
                                                                        score < 0.7 ? '⚠️' : '❌'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )} */}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostsModal; 