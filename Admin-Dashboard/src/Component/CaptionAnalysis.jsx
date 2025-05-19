import { useState } from 'react';
import config from '../config';

const CaptionAnalysis = () => {
    const [caption, setCaption] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAnalyze = async () => {
        if (!caption.trim()) {
            setError('Please enter a caption to analyze');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${config.API_BASE_URL}/analyze-caption`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ caption }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze caption');
            }

            setResult(data.analysis);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Caption Analysis</h1>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                    <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
                        Enter Caption to Analyze
                    </label>
                    <textarea
                        id="caption"
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Enter caption to analyze..."
                    />
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Analyzing...' : 'Analyze Caption'}
                </button>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {result && result.attributeScores && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Analysis Summary</h2>
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

export default CaptionAnalysis; 