import React from 'react';

const AnalysisDetailsModal = ({ isOpen, onClose, type, data }) => {
    if (!isOpen) return null;

    const getTitle = () => {
        switch (type) {
            case 'total':
                return 'Total Analysis Details';
            case 'text':
                return 'Text Analysis Details';
            case 'comment':
                return 'Comment Analysis Details';
            case 'caption':
                return 'Caption Analysis Details';
            default:
                return 'Analysis Details';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{getTitle()}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="overflow-y-auto flex-grow">
                    {data && data.length > 0 ? (
                        <div className="space-y-4">
                            {data.map((item, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="mb-2">
                                        <p className="text-gray-700">{item.text || item.comment || item.caption}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Analyzed on: {formatDate(item.createdAt)}
                                        </p>
                                    </div>
                                    {item.analysis && item.analysis.attributeScores && (
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
                                                    {Object.entries(item.analysis.attributeScores).map(([attribute, data]) => {
                                                        const score = data.summaryScore?.value || 0;
                                                        return (
                                                            <tr key={attribute}>
                                                                <td className="px-4 py-2 border-t font-medium">
                                                                    {attribute.replace(/_/g, ' ')}
                                                                </td>
                                                                <td className="px-4 py-2 border-t">
                                                                    {score.toFixed(3)}
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
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            No analysis data available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalysisDetailsModal; 