import { useState } from 'react';

const TextAnalysis = () => {
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAnalyze = async () => {
        if (!text.trim()) {
            setError('Please enter some text to analyze');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8002/api/analyze-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze text');
            }

            setResult(data.results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Text Analysis</h1>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                    <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                        Enter Text to Analyze
                    </label>
                    <textarea
                        id="text"
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text to analyze..."
                    />
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Analyzing...' : 'Analyze Text'}
                </button>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Analysis Results</h2>
                        <div className="bg-gray-50 p-4 rounded-md">
                            <pre className="whitespace-pre-wrap text-sm">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TextAnalysis; 