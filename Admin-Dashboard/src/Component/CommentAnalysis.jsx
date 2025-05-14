import { useState, useEffect } from 'react';

const CommentAnalysis = () => {
    const [comment, setComment] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);

    // Fetch comments on component mount
    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            const response = await fetch('http://localhost:8002/api/comments');
            const data = await response.json();
            if (data.success) {
                setComments(data.comments);
            }
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        }
    };

    const handleAnalyze = async () => {
        if (!comment.trim()) {
            setError('Please enter a comment to analyze');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8002/api/analyze-comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ comment }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze comment');
            }

            setResult(data.analysis);

            // Store the comment with its analysis
            const storeResponse = await fetch('http://localhost:8002/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: comment,
                    analysis: data.analysis
                }),
            });

            const storeData = await storeResponse.json();
            if (storeData.success) {
                setComments(prevComments => [...prevComments, storeData.comment]);
                setComment(''); // Clear the input
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await fetch(`http://localhost:8002/api/comments/${commentId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
            } else {
                throw new Error(data.error || 'Failed to delete comment');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Comment Analysis</h1>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                        Enter Comment to Analyze
                    </label>
                    <textarea
                        id="comment"
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Enter comment to analyze..."
                    />
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Analyzing...' : 'Analyze Comment'}
                </button>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {/* Display all analyzed comments */}
                {comments.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Analyzed Comments</h2>
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-gray-700">{comment.text}</p>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this comment?')) {
                                                    handleDeleteComment(comment.id);
                                                }
                                            }}
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                                        >
                                            Delete Comment
                                        </button>
                                    </div>
                                    {comment.analysis.attributeScores && (
                                        <div className="overflow-x-auto mt-2">
                                            <table className="min-w-full border border-gray-300 table-auto text-sm">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="border border-gray-300 px-4 py-2 text-left">Attribute</th>
                                                        <th className="border border-gray-300 px-4 py-2 text-left">Score</th>
                                                        <th className="border border-gray-300 px-4 py-2 text-left">Flagged</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(comment.analysis.attributeScores).map(([attribute, data]) => {
                                                        const score = data.summaryScore?.value || 0;
                                                        return (
                                                            <tr key={attribute} className="hover:bg-gray-50">
                                                                <td className="border px-4 py-2 font-medium">{attribute}</td>
                                                                <td className="border px-4 py-2">{score.toFixed(3)}</td>
                                                                <td className="border px-4 py-2">
                                                                    {score > 0.5 ? "Yes" : "No"}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Display current analysis result */}
                {result && result.attributeScores && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Analysis</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300 table-auto text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border border-gray-300 px-4 py-2 text-left">Attribute</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left">Score</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left">Flagged</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(result.attributeScores).map(([attribute, data]) => {
                                        const score = data.summaryScore?.value || 0;
                                        return (
                                            <tr key={attribute} className="hover:bg-gray-50">
                                                <td className="border px-4 py-2 font-medium">{attribute}</td>
                                                <td className="border px-4 py-2">{score.toFixed(3)}</td>
                                                <td className="border px-4 py-2">
                                                    {score > 0.5 ? "Yes" : "No"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentAnalysis; 