
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';

const Header: React.FC = () => {
  const { isLoggedIn, logout, shop } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <Link to={isLoggedIn ? "/shop/dashboard" : "/"} className="text-2xl font-bold text-gray-800">
          Affiliate Platform
        </Link>
        <div className="flex items-center space-x-4">
          {isLoggedIn && shop && (
            <>
              <div className="flex items-center space-x-4">
                <Link to="/shop/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link to="/shop/bloggers" className="text-gray-600 hover:text-gray-900">Bloggers</Link>
                <span className="text-gray-600 hidden sm:block">Welcome, {shop.name}</span>
                <Button onClick={logout} variant="secondary">
                  Logout
                </Button>
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
