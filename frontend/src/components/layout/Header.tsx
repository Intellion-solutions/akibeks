import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_CONFIG, PAGES_CONFIG } from '../../../shared/constants';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const isActivePage = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top Contact Bar */}
      <div className="bg-blue-900 text-white py-2 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{APP_CONFIG.contact.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>{APP_CONFIG.contact.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{APP_CONFIG.contact.workingHours}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{APP_CONFIG.contact.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3" onClick={closeMenu}>
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <div className="font-bold text-xl">A</div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AKIBEKS</h1>
              <p className="text-sm text-gray-600">Engineering Solutions</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {PAGES_CONFIG.navigation.map((page) => (
              <Link
                key={page.path}
                to={page.path}
                className={`font-medium transition-colors hover:text-blue-600 ${
                  isActivePage(page.path, page.exact)
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                    : 'text-gray-700'
                }`}
              >
                {page.name}
              </Link>
            ))}
            
            {/* Admin Access Button */}
            <Link to="/admin">
              <Button 
                variant="outline" 
                size="sm"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                Admin Panel
              </Button>
            </Link>
            
            {/* Get Quote Button */}
            <Link to="/request-quote">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Get Quote
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 border-t border-gray-200 pt-4">
            <nav className="flex flex-col space-y-4">
              {PAGES_CONFIG.navigation.map((page) => (
                <Link
                  key={page.path}
                  to={page.path}
                  onClick={closeMenu}
                  className={`font-medium py-2 px-3 rounded-md transition-colors ${
                    isActivePage(page.path, page.exact)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {page.name}
                </Link>
              ))}
              
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <Link to="/admin" onClick={closeMenu}>
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    Admin Panel
                  </Button>
                </Link>
                
                <Link to="/request-quote" onClick={closeMenu}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Get Quote
                  </Button>
                </Link>
              </div>

              {/* Mobile Contact Info */}
              <div className="border-t border-gray-200 pt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{APP_CONFIG.contact.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{APP_CONFIG.contact.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{APP_CONFIG.contact.address}</span>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;