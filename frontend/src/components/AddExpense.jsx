import { useState } from 'react';

const categories = [
  'Food',
  'Transport',
  'Entertainment',
  'Health',
  'Utilities',
  'Other',
];

const AddExpense = () => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!amount || !category || !date) {
      setError('Please fill all required fields.');
      return;
    }
    try {
      const res = await fetch('http://localhost:8008/api/v1/expense/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          description,
          date,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors ? data.errors.join(', ') : data.message || 'Failed to add expense');
        return;
      }
      setSuccess('Expense added successfully!');
      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="flex-1 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-10 w-full max-w-xl">
          <div className="flex items-center mb-8">
            <div className="bg-indigo-700 text-white rounded-full p-2 mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Add New Expense</h2>
          </div>
          {error && <div className="mb-4 text-red-400 text-center">{error}</div>}
          {success && <div className="mb-4 text-green-400 text-center">{success}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-1 text-gray-300 font-semibold">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 text-gray-300 font-semibold">Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block mb-1 text-gray-300 font-semibold">Category</label>
            <select
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="mb-8">
            <label className="block mb-1 text-gray-300 font-semibold">Description</label>
            <textarea
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
              rows={3}
              placeholder="Enter expense description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Expense
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense; 