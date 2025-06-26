import { useState, useEffect } from 'react';

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

const Settings = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleExport = () => {
    const csv = toCSV(expenses);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) return;
    try {
      // Delete all expenses one by one (since backend has no bulk delete)
      for (const e of expenses) {
        await fetch(`http://localhost:8008/api/v1/expense/delete/${e._id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      }
      setExpenses([]);
    } catch (err) {}
  };

  // Storage info
  const totalExpenses = expenses.length;
  const dataSize = (() => {
    // Rough estimate: JSON string length in KB
    return (JSON.stringify(expenses).length / 1024).toFixed(2);
  })();
  const storageType = 'Backend';

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="flex-1 p-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="bg-indigo-700 text-white rounded-full p-2 mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 0v4m0-4h4m-4 0H8" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
          </div>

          {/* Data Management */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Data Management</h2>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 flex flex-col gap-2">
                <span className="text-gray-300">Export All Data</span>
                <span className="text-gray-500 text-sm">Download all your expense data as a CSV file</span>
              </div>
              <button onClick={handleExport} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-2 rounded-lg transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Export
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mt-6">
              <div className="flex-1 flex flex-col gap-2">
                <span className="text-gray-300">Clear All Data</span>
                <span className="text-gray-500 text-sm">Permanently delete all expense data from backend</span>
              </div>
              <button onClick={handleClear} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-2 rounded-lg transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                Clear Data
              </button>
            </div>
          </div>

          {/* Storage Information */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Storage Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-white">{totalExpenses}</span>
                <span className="text-gray-400">Total Expenses</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-white">{dataSize} KB</span>
                <span className="text-gray-400">Data Size</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-white">{storageType}</span>
                <span className="text-gray-400">Storage Type</span>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">About</h2>
            <p className="text-gray-400 mb-2">
            The Expense Tracker is a full-stack web application built using the MERN stack (MongoDB, Express.js, React.js, and Node.js). 
            It allows users to add, view, update, and delete their expenses, and provides visual insights through interactive charts 
            such as pie charts (category-wise distribution) and bar charts (monthly spending trends).
            </p>
            <p className="text-gray-500">
            Users can:
            Manage their daily expenses with a clean, responsive UI. 
            Securely track data in a connected MongoDB database.
            Visualize spending patterns to better understand financial habits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 