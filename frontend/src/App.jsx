
import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import BookList from './components/BookList';
import AddBook from './components/AddBook';
import EditBook from './components/EditBook';
import Login from './components/Login';
import Register from './components/Register';
import BookDetails from './components/BookDetails';
import Profile from './components/Profile';


function App() {
  const { user, logout } = useAuth();
  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  const handleLogout = () => {
    logout();
    alert('Logged out successfully!');
  };

  return (
    <div>
      <nav className="navbar">
        <div className="nav-left">
          <Link className="nav-link" to="/">Home</Link>
          <Link className="nav-link" to="/add-book">Add Book</Link>
          <Link className="nav-link" to="/profile">Profile</Link>
        </div>
        <div className="nav-right">
          {user ? (
            <>
              <span className="muted">{user.name || user.email}</span>
              <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login">Login</Link>
              <Link className="nav-link" to="/register">Register</Link>
            </>
          )}
          <button className="btn btn-secondary" onClick={toggleTheme}>Toggle Theme</button>
        </div>
      </nav>
      {/* Theme initialization */}
      {(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
        const theme = saved || 'light';
        if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', theme);
        return null;
      })()}
      <Routes>
        <Route path="/" element={<BookList />} />
        <Route path="/add-book" element={user ? <AddBook /> : <Navigate to="/login" replace />} />
        <Route path="/edit-book/:id" element={user ? <EditBook /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/book/:id" element={<BookDetails />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
