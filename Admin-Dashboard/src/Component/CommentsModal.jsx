import React, { useState, useEffect } from 'react';

const CommentsModal = ({ isOpen, onClose }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch('http://localhost:8002/api/admin/comments');
                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || 'Failed to fetch comments');
                }

                setComments(data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchComments();
        }
    }, [isOpen]);

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8002/api/admin/comments/${commentId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to delete comment');
            }

            // Remove the deleted comment from the state
            setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
        } catch (err) {
            setError(err.message);
        }
    };

    // const getScoreColor = (score) => {
    //     if (score < 0.4) return 'text-green-600';
    //     if (score < 0.7) return 'text-yellow-600';
    //     return 'text-red-600';
    // };

    // const formatScore = (score) => {
    //     return score.toFixed(3);
    // };

    const filteredComments = comments.filter(comment => {
        if (!comment) return false;
        const commentText = comment.comment || '';
        const userName = comment.user?.name || '';
        return commentText.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">User Comments</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by user name or comment content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="overflow-y-auto flex-grow">
                    {loading ? (
                        <div className="text-center py-4">Loading comments...</div>
                    ) : error ? (
                        <div className="text-center py-4 text-red-500">{error}</div>
                    ) : filteredComments.length === 0 ? (
                        <div className="text-center py-4">No comments found</div>
                    ) : (
                        <div className="space-y-4">
                            {filteredComments.map((comment) => (
                                <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-grow">
                                            <p className="text-gray-700">{comment.comment}</p>
                                            <p className="text-sm text-gray-500">
                                                Commented by: {comment.user?.name || 'Unknown User'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Commented on: {new Date(comment.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteComment(comment._id)}
                                            className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    {/* {comment.analysis && comment.analysis.attributeScores && (
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
                                                    {Object.entries(comment.analysis.attributeScores).map(([attribute, data]) => {
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

export default CommentsModal; 