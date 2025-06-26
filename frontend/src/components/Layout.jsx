import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', icon: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0H7m6 0v6m0 0H7m6 0h6" /></svg>
  ), link: '/dashboard' },
  { name: 'Add Expense', icon: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
  ), link: '/add-expense' },
  { name: 'Expenses', icon: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
  ), link: '/expenses' },
  { name: 'Analytics', icon: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 17a4 4 0 01-4-4V7a4 4 0 018 0v6a4 4 0 01-4 4z" /></svg>
  ), link: '/analytics' },
  { name: 'Settings', icon: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
  ), link: '/settings' },
];

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="w-screen h-screen min-h-0 min-w-0 flex bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col justify-between bg-gray-900 p-6">
        <div>
          <div className="text-2xl font-bold mb-10 tracking-wide">Expense Tracker</div>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.link}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${location.pathname === item.link ? 'bg-indigo-900 text-indigo-400' : 'hover:bg-gray-800 hover:text-indigo-300'}`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-3 rounded-lg bg-red-700 hover:bg-red-800 text-white mt-10"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
          Logout
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 min-h-0 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 