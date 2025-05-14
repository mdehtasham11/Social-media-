import React, { useState, useEffect } from 'react';

const PostModeration = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://localhost:8002/api/admin/posts');
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch posts');
            }

            setPosts(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8002/api/admin/posts/${postId}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to delete post');
            }

            // Refresh posts list
            fetchPosts();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateStatus = async (postId, status) => {
        try {
            const response = await fetch(`http://localhost:8002/api/admin/posts/${postId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to update post status');
            }

            // Refresh posts list
            fetchPosts();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleViewComments = async (postId) => {
        try {
            const response = await fetch(`http://localhost:8002/api/admin/posts/${postId}/comments`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch comments');
            }

            setComments(data.data);
            setSelectedPost(postId);
            setShowComments(true);
        } catch (err) {
            setError(err.message);
        }
    };

    const filteredPosts = posts.filter(post => {
        const content = post.text?.toLowerCase() || '';
        const author = post.user?.name?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        return content.includes(search) || author.includes(search);
    });

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-600">Loading posts...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-700 p-4 rounded-md">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Post & Comment Moderation</h1>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by content or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Content Preview
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Author
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stats
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
                        {filteredPosts.map((post) => (
                            <tr key={post._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                        {post.text}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {post.user?.name || 'Unknown User'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        <div>👍 {post.likeCount}</div>
                                        <div>💬 {post.commentCount}</div>
                                        <div>⚠️ {post.reportCount}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm">
                                        {post.isSpam ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                Spam
                                            </span>
                                        ) : post.isSafe ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Safe
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleViewComments(post._id)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            View Comments
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(post._id, 'safe')}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            Mark Safe
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(post._id, 'spam')}
                                            className="text-yellow-600 hover:text-yellow-900"
                                        >
                                            Mark Spam
                                        </button>
                                        <button
                                            onClick={() => handleDeletePost(post._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Comments Modal */}
            {showComments && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Post Comments</h2>
                            <button
                                onClick={() => setShowComments(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-grow">
                            {comments.length === 0 ? (
                                <div className="text-center py-4">No comments found</div>
                            ) : (
                                <div className="space-y-4">
                                    {comments.map((comment) => (
                                        <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-700">{comment.comment}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                By: {comment.user?.name || 'Unknown User'} on{' '}
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostModeration; 