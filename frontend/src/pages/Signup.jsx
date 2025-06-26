import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:8008/api/v1/user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors ? data.errors.join(', ') : data.message || 'Signup failed');
        return;
      }
      setSuccess('Signup successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Sign Up</h2>
        {error && <div className="mb-4 text-red-400 text-center">{error}</div>}
        {success && <div className="mb-4 text-green-400 text-center">{success}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-300">First Name</label>
          <input type="text" name="firstName" className="w-full border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600" value={form.firstName} onChange={handleChange} required />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-300">Last Name</label>
          <input type="text" name="lastName" className="w-full border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600" value={form.lastName} onChange={handleChange} required />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-300">Email</label>
          <input type="email" name="email" className="w-full border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600" value={form.email} onChange={handleChange} required />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-semibold text-gray-300">Password</label>
          <input type="password" name="password" className="w-full border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600" value={form.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold transition">Sign Up</button>
        <div className="mt-4 text-center text-gray-400">
          Already have an account? <a href="/login" className="text-blue-400 hover:underline">Login</a>
        </div>
      </form>
    </div>
  );
};

export default Signup; 