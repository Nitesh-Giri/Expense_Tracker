import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#34d399', '#3b82f6', '#f87171', '#a78bfa', '#fbbf24', '#f472b6'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchExpenses();
    }
    // eslint-disable-next-line
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

  // Calculate stats
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonth = (() => {
    const now = new Date();
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((sum, e) => sum + e.amount, 0);
  })();
  const categories = Array.from(new Set(expenses.map(e => e.category)));
  const avgDaily = (() => {
    if (!expenses.length) return 0;
    const dates = expenses.map(e => new Date(e.date).setHours(0,0,0,0));
    const min = Math.min(...dates);
    const max = Math.max(...dates);
    const days = Math.max(1, Math.round((max - min) / (1000*60*60*24)) + 1);
    return total / days;
  })();

  // Monthly Spending Trends
  const monthlyTrends = (() => {
    const map = {};
    expenses.forEach(e => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      map[key] = (map[key] || 0) + e.amount;
    });
    const keys = Object.keys(map).sort();
    return keys.map(k => ({ month: k, amount: map[k] }));
  })();

  // Spending by Category
  const categoryData = (() => {
    const map = {};
    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  // Top Categories
  const topCategories = categoryData.slice().sort((a, b) => b.value - a.value);

  return (
    <div className="flex-1 p-10 min-h-0 min-w-0 overflow-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <span className="text-gray-400 text-lg">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-start">
          <span className="text-gray-400 mb-2">Total Expenses</span>
          <span className="text-2xl font-bold">₹{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          <span className="mt-2 bg-blue-900 text-blue-300 px-2 py-1 rounded">
            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
          </span>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-start">
          <span className="text-gray-400 mb-2">This Month</span>
          <span className="text-2xl font-bold">₹{thisMonth.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          <span className="mt-2 bg-green-900 text-green-300 px-2 py-1 rounded">
            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </span>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-start">
          <span className="text-gray-400 mb-2">Categories</span>
          <span className="text-2xl font-bold">{categories.length}</span>
          <span className="mt-2 bg-purple-900 text-purple-300 px-2 py-1 rounded">
            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </span>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-start">
          <span className="text-gray-400 mb-2">Avg Daily</span>
          <span className="text-2xl font-bold">₹{avgDaily.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          <span className="mt-2 bg-orange-900 text-orange-300 px-2 py-1 rounded">
            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m4 4h-1v-4h-1m4 4h-1v-4h-1m4 4h-1v-4h-1" /></svg>
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Spending Trends</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tickFormatter={m => {
                  const [y, mo] = m.split('-');
                  return new Date(y, mo-1).toLocaleString('default', { month: 'short', year: 'numeric' });
                }} />
                <YAxis tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={v => `₹${v}`} labelFormatter={l => l} />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {categoryData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={v => `₹${v}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Top Categories</h2>
        <div className="flex flex-col gap-2">
          {topCategories.length === 0 && <div className="text-gray-500">No data</div>}
          {topCategories.map((cat, idx) => (
            <div key={cat.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-purple-600 text-white font-bold">{idx+1}</span>
                <span className="font-semibold text-white">{cat.name}</span>
              </div>
              <span className="font-semibold text-white">₹{cat.value.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 