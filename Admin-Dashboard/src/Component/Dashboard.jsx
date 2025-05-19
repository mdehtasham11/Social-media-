import React, { useState, useEffect } from 'react';
import config from '../config';
import UserDetailsModal from './UserDetailsModal';
import CommentsModal from './CommentsModal';
import PostsModal from './PostsModal';
import AnalysisDetailsModal from './AnalysisDetailsModal';

const Dashboard = () => {
  const [stats, setStats] = useState({
    userStats: { totalUsers: 0, activeUsers: 0 },
    contentStats: { totalPosts: 0, totalComments: 0 },
    analysisStats: { totalAnalyses: 0, textAnalyses: 0, commentAnalyses: 0, captionAnalyses: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [isPostsModalOpen, setIsPostsModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisType, setAnalysisType] = useState(null);
  const [analysisData, setAnalysisData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/admin/analysis`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch statistics');
        }

        setStats(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleAnalysisClick = async (type) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/admin/analysis/${type}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch analysis details');
      }

      setAnalysisType(type);
      setAnalysisData(data.data);
      setIsAnalysisModalOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const StatCard = ({ title, value, icon, onClick }) => (
    <div
      className={`bg-white p-6 rounded-lg shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-2xl">
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading statistics...</div>
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
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.userStats.totalUsers}
          icon="👥"
          onClick={() => setIsUserModalOpen(true)}
        />
        <StatCard
          title="Total Posts"
          value={stats.contentStats.totalPosts}
          icon="📝"
          onClick={() => setIsPostsModalOpen(true)}
        />
        <StatCard
          title="Total Comments"
          value={stats.contentStats.totalComments}
          icon="💬"
          onClick={() => setIsCommentsModalOpen(true)}
        />
        <StatCard
          title="Active Users"
          value={stats.userStats.activeUsers}
          icon="✅"
        />
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-8">Analysis Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Analyses"
          value={stats.analysisStats.totalAnalyses}
          icon="📊"
          onClick={() => handleAnalysisClick('total')}
        />
        <StatCard
          title="Text Analyses"
          value={stats.analysisStats.textAnalyses}
          icon="📝"
          onClick={() => handleAnalysisClick('text')}
        />
        <StatCard
          title="Comment Analyses"
          value={stats.analysisStats.commentAnalyses}
          icon="💬"
          onClick={() => handleAnalysisClick('comment')}
        />
        <StatCard
          title="Caption Analyses"
          value={stats.analysisStats.captionAnalyses}
          icon="🖼️"
          onClick={() => handleAnalysisClick('caption')}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">No recent activity to display</p>
        </div>
      </div>

      <UserDetailsModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />

      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
      />

      <PostsModal
        isOpen={isPostsModalOpen}
        onClose={() => setIsPostsModalOpen(false)}
      />

      <AnalysisDetailsModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        type={analysisType}
        data={analysisData}
      />
    </div>
  );
};

export default Dashboard;