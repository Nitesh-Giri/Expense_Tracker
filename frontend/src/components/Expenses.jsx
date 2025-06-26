import { useState, useEffect } from 'react';

const categories = [
  'All Categories',
  'Food',
  'Transport',
  'Entertainment',
  'Health',
  'Utilities',
  'Other',
  'Groceries',
  'Food & Dining',
  'Transportation',
];

const categoryColors = {
  'Groceries': 'bg-green-400',
  'Transportation': 'bg-blue-500',
  'Food & Dining': 'bg-red-500',
  'Food': 'bg-red-500',
  'Transport': 'bg-blue-500',
  'Entertainment': 'bg-pink-500',
  'Health': 'bg-emerald-500',
  'Utilities': 'bg-yellow-400',
  'Other': 'bg-gray-400',
};

function toCSV(expenses) {
  if (!expenses.length) return '';
  const header = ['Description', 'Category', 'Amount', 'Date'];
  const rows = expenses.map(e => [
    '"' + (e.description || '') + '"',
    '"' + (e.category || '') + '"',
    '"' + e.amount + '"',
    '"' + new Date(e.date).toLocaleDateString() + '"',
  ]);
  return [header, ...rows].map(r => r.join(',')).join('\n');
}

const Expenses = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editExpense, setEditExpense] = useState(null);
  const [editForm, setEditForm] = useState({ amount: '', category: '', description: '', date: '' });
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8008/api/v1/expense/all', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.expenses) {
        setExpenses(data.expenses);
      } else {
        setExpenses([]);
      }
    } catch (err) {
      setExpenses([]);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await fetch(`http://localhost:8008/api/v1/expense/delete/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setExpenses(expenses.filter(e => e._id !== id));
      }
    } catch (err) {}
  };

  const handleExport = () => {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Edit logic
  const openEditModal = (expense) => {
    setEditExpense(expense);
    setEditForm({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
    });
    setEditError('');
  };

  const closeEditModal = () => {
    setEditExpense(null);
    setEditForm({ amount: '', category: '', description: '', date: '' });
    setEditError('');
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editForm.amount || !editForm.category || !editForm.date) {
      setEditError('Please fill all required fields.');
      return;
    }
    try {
      const res = await fetch(`http://localhost:8008/api/v1/expense/update/${editExpense._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: parseFloat(editForm.amount),
          category: editForm.category,
          description: editForm.description,
          date: editForm.date,
        }),
      });
      const data = await res.json();
      if (res.ok && data.expense) {
        setExpenses(expenses.map(e => e._id === editExpense._id ? data.expense : e));
        closeEditModal();
      } else {
        setEditError(data.message || 'Failed to update expense');
      }
    } catch (err) {
      setEditError('Network error');
    }
  };

  // Filtering
  const filtered = expenses.filter(e => {
    const matchesSearch = e.description?.toLowerCase().includes(search.toLowerCase()) || e.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All Categories' || e.category === category;
    const date = new Date(e.date);
    const matchesStart = !startDate || date >= new Date(startDate);
    const matchesEnd = !endDate || date <= new Date(endDate);
    return matchesSearch && matchesCategory && matchesStart && matchesEnd;
  });

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="flex-1 p-10">
        <div className="max-w-5xl mx-auto">
          {/* Filters */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
            <div className="flex items-center mb-6">
              <div className="bg-indigo-700 text-white rounded-full p-2 mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-7.414 7.414A1 1 0 0012 15v3a1 1 0 01-2 0v-3a1 1 0 00-.293-.707L2.293 6.707A1 1 0 012 6V4z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-white">Filters</h2>
              <button onClick={handleExport} className="ml-auto flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-lg transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Export CSV
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                className="w-full md:w-1/3 px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="Search expenses..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select
                className="w-full md:w-1/4 px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="date"
                className="w-full md:w-1/6 px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                placeholder="dd/mm/yyyy"
              />
              <input
                type="date"
                className="w-full md:w-1/6 px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                placeholder="dd/mm/yyyy"
              />
            </div>
          </div>

          {/* Expenses List */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Expenses ({filtered.length})</h2>
              <span className="text-white font-bold">Total: ₹{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            {filtered.length === 0 ? (
              <div className="text-gray-400 text-center py-10">
                No expenses found matching your filters.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map(e => (
                  <div key={e._id} className="flex items-center justify-between bg-gray-800 rounded-lg px-6 py-4 mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full ${categoryColors[e.category] || 'bg-gray-400'}`}></span>
                      <div>
                        <div className="font-semibold text-white">{e.description || 'No Description'}</div>
                        <div className="text-gray-400 text-sm">{e.category} &middot; {new Date(e.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-white">₹{e.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      <button className="text-gray-400 hover:text-indigo-400" title="Edit" onClick={() => openEditModal(e)}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h2v2a2 2 0 002 2h2a2 2 0 002-2v-2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2H7a2 2 0 00-2 2v2a2 2 0 002 2h2z" /></svg>
                      </button>
                      <button className="text-gray-400 hover:text-red-500" title="Delete" onClick={() => handleDelete(e._id)}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button onClick={closeEditModal} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl">&times;</button>
            <h2 className="text-xl font-bold mb-6 text-white">Edit Expense</h2>
            {editError && <div className="mb-4 text-red-400 text-center">{editError}</div>}
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-300">Amount</label>
                <input type="number" name="amount" min="0" step="0.01" className="w-full border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600" value={editForm.amount} onChange={handleEditChange} required />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-300">Category</label>
                <select name="category" className="w-full border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600" value={editForm.category} onChange={handleEditChange} required>
                  <option value="">Select a category</option>
                  {categories.filter(c => c !== 'All Categories').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-300">Description</label>
                <input type="text" name="description" className="w-full border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600" value={editForm.description} onChange={handleEditChange} />
              </div>
              <div className="mb-6">
                <label className="block mb-1 font-semibold text-gray-300">Date</label>
                <input type="date" name="date" className="w-full border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600" value={editForm.date} onChange={handleEditChange} required />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold transition">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses; 