import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#f87171', '#34d399', '#a78bfa', '#fbbf24', '#f472b6'];
const CATEGORY_COLOR_MAP = {
  'Transportation': '#3b82f6',
  'Food & Dining': '#f87171',
  'Groceries': '#34d399',
  'Entertainment': '#a78bfa',
  'Utilities': '#fbbf24',
  'Other': '#f472b6',
};

const Analytics = () => {
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

  // Category Breakdown (Bar Chart)
  const categoryData = (() => {
    const map = {};
    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  // Top Categories
  const topCategories = categoryData.slice().sort((a, b) => b.value - a.value);

  // Insights
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonth = (() => {
    const now = new Date();
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((sum, e) => sum + e.amount, 0);
  })();
  const avgDaily = (() => {
    if (!expenses.length) return 0;
    const dates = expenses.map(e => new Date(e.date).setHours(0,0,0,0));
    const min = Math.min(...dates);
    const max = Math.max(...dates);
    const days = Math.max(1, Math.round((max - min) / (1000*60*60*24)) + 1);
    return total / days;
  })();
  const categoriesUsed = Array.from(new Set(expenses.map(e => e.category))).length;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="flex-1 p-10">
        <h1 className="text-2xl font-bold text-white mb-8">Analytics</h1>
        <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto">
          {/* Monthly Spending Trends */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
            <h2 className="text-lg font-semibold text-white mb-4">Monthly Spending Trends</h2>
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
          {/* Category Breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
            <h2 className="text-lg font-semibold text-white mb-4">Category Breakdown</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 40, right: 20, top: 10, bottom: 10 }}>
                  <XAxis type="number" tickFormatter={v => `₹${v}`} />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip formatter={v => `₹${v}`} />
                  <Bar dataKey="value">
                    {categoryData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={CATEGORY_COLOR_MAP[entry.name] || COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 col-span-2">
              <h2 className="text-lg font-semibold text-white mb-4">Top Categories</h2>
              <div className="flex flex-col gap-2">
                {topCategories.length === 0 && <div className="text-gray-500">No data</div>}
                {topCategories.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full" style={{ background: CATEGORY_COLOR_MAP[cat.name] || COLORS[idx % COLORS.length] }}></span>
                      <span className="font-semibold text-white">{cat.name}</span>
                    </div>
                    <span className="font-semibold text-white">₹{cat.value.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Spending Insights</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Total Expenses</span>
                  <span className="text-white font-semibold">₹{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>This Month</span>
                  <span className="text-white font-semibold">₹{thisMonth.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Average per Day</span>
                  <span className="text-white font-semibold">₹{avgDaily.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Categories Used</span>
                  <span className="text-white font-semibold">{categoriesUsed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 