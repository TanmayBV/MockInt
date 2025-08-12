import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageWrapper from './PageWrapper';
import Header from './Header';
import API from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [interviewName, setInterviewName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [level, setLevel] = useState('Beginner');
  // No question generation here; questions will be generated on the interview page

  useEffect(() => {
    fetchInterviews();
    // Refetch whenever route changes back to dashboard (e.g., after End Interview)
  }, [location.key]);

  const fetchInterviews = async () => {
    try {
      setIsLoading(true);
      const response = await API.get('/interview/');
      if (response.data.status === 'success') {
        const sortedInterviews = response.data.interviews.sort((a, b) =>
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setInterviews(sortedInterviews);
      } else {
        setError('Failed to fetch interviews');
      }
    } catch (error) {
      setError('Failed to load interview history');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setInterviewName('');
    setJobRole('');
    setLevel('Beginner');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Removed question generation from Dashboard; it will be handled in the interview page

  const startInterview = () => {
    if (!interviewName.trim() || !jobRole.trim()) {
      return;
    }
    setShowModal(false);
    navigate('/interview', {
      state: {
        interviewName,
        jobRole,
        level,
      },
    });
  };

  const handleStartInterview = () => {
    openModal();
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatConfidence = (confidence) => `${Math.round(confidence)}%`;

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Header />
        <div className="pt-16 px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">Interview Dashboard</h1>
      <button
        onClick={handleStartInterview}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-8 rounded-lg shadow-lg shadow-blue-500/20 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-600 transition-all duration-200"
              >
                Start New Interview
              </button>
            </div>

            {/* Interview History Section */}
            <div className="bg-gray-900/60 backdrop-blur border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Interview History</h2>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-white">Loading interviews...</div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button onClick={fetchInterviews} className="text-blue-400 hover:text-blue-300 underline">Try again</button>
                </div>
              ) : interviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">No interviews yet</div>
                  <p className="text-gray-500 text-sm">Start your first interview to see your history here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {interviews.map((interview, index) => (
                    <div key={interview.id || index} className="bg-gray-800/50 border border-white/10 rounded-xl p-6 hover:bg-gray-800/70 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                            <h3 className="text-lg font-semibold text-white">
                              {interview.job_role || 'Interview'}
                            </h3>
                            <span className="text-sm text-gray-400">{formatTimestamp(interview.timestamp)}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-gray-400">Confidence:</span>
                            <span className={`text-sm font-medium px-2 py-1 rounded ${
                              interview.confidence >= 80 ? 'text-green-400 bg-green-500/10' :
                              interview.confidence >= 60 ? 'text-yellow-400 bg-yellow-500/10' :
                              'text-red-400 bg-red-500/10'
                            }`}>
                              {formatConfidence(interview.confidence)}
                            </span>
                          </div>
                          {interview.answers && interview.answers.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-400 mb-2">Answers ({interview.answers.length}):</p>
                              <div className="space-y-1">
                                {interview.answers.slice(0, 2).map((answer, answerIndex) => (
                                  <p key={answerIndex} className="text-sm text-gray-300 truncate">{answer}</p>
                                ))}
                                {interview.answers.length > 2 && (
                                  <p className="text-sm text-gray-500">+{interview.answers.length - 2} more answers</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => console.log('View interview details:', interview)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">View Details</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pre-Interview Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
            <div className="relative w-full max-w-lg bg-gray-900/90 backdrop-blur border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Setup Interview</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Interview Name</label>
                  <input
                    value={interviewName}
                    onChange={(e) => setInterviewName(e.target.value)}
                    placeholder="e.g., Frontend Screen with ACME"
                    className="w-full rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/60 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Job Role</label>
                  <input
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="e.g., React Developer"
                    className="w-full rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/60 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full rounded-lg bg-gray-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/60 px-4 py-2"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Hard</option>
                  </select>
                </div>
                {/* Questions are generated on the interview page */}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-300 hover:text-white">Cancel</button>
                <button
                  onClick={startInterview}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:brightness-110"
      >
        Start Interview
      </button>
    </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Dashboard;