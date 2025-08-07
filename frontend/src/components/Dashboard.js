import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleStartInterview = () => {
    navigate('/interview');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Welcome to the Interview Dashboard</h1>
      <button
        onClick={handleStartInterview}
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Start Interview
      </button>
    </div>
  );
};

export default Dashboard;