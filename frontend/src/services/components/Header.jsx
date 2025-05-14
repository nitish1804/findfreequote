import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <Link to="/" className="logo">
            FindFreeQuote.com
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="mobile-menu-button" onClick={toggleMenu}>
          <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
        </div>

        {/* Desktop navigation */}
        <nav className={`main-nav ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/services" className="nav-link">Services</Link>
            </li>
            <li className="nav-item">
              <Link to="/how-it-works" className="nav-link">How It Works</Link>
            </li>
            <li className="nav-item">
              <Link to="/get-quotes" className="nav-link">Get Quotes</Link>
            </li>
            <li className="nav-item">
              <Link to="/contractors/join" className="nav-link">For Contractors</Link>
            </li>
          </ul>
        </nav>

        {/* Auth section */}
        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-profile">
              <button 
                className="profile-button" 
                onClick={toggleProfileMenu}
              >
                <span className="user-name">{user.firstName}</span>
                <span className="profile-icon">▼</span>
              </button>
              
              {isProfileMenuOpen && (
                <div className="profile-dropdown">
                  <Link to="/dashboard" className="dropdown-item">Dashboard</Link>
                  <Link to="/profile" className="dropdown-item">My Profile</Link>
                  {user.role === 'contractor' && (
                    <Link to="/leads" className="dropdown-item">My Leads</Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item">Admin Panel</Link>
                  )}
                  <button onClick={handleLogout} className="dropdown-item logout-button">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-button">Login</Link>
              <Link to="/register" className="register-button">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;