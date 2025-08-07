import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/auth/signup', { email, password, name });
      navigate('/login');
    } catch {
      setError('Signup failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSignup} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4">Sign Up</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required className="mb-3 w-full p-2 border rounded" />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mb-3 w-full p-2 border rounded" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mb-3 w-full p-2 border rounded" />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Sign Up</button>
        <p className="mt-2 text-sm">Already have an account? <a href="/login" className="text-blue-600">Login</a></p>
      </form>
    </div>
  );
};

export default Signup;