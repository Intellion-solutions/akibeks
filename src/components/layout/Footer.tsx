import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  ExternalLink,
  ArrowUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_CONFIG, PAGES_CONFIG } from '../../../config';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <div className="font-bold text-xl">A</div>
              </div>
              <div>
                <h3 className="text-xl font-bold">AKIBEKS</h3>
                <p className="text-gray-400">Engineering Solutions</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed">
              Leading construction and engineering company in Kenya, delivering 
              quality building, renovation, and infrastructure services across 
              all 47 counties.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a 
                href={APP_CONFIG.social.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href={APP_CONFIG.social.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg hover:bg-blue-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href={APP_CONFIG.social.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href={APP_CONFIG.social.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg hover:bg-pink-600 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {PAGES_CONFIG.navigation.map((page) => (
                <li key={page.path}>
                  <Link 
                    to={page.path}
                    className="text-gray-300 hover:text-white transition-colors flex items-center"
                  >
                    {page.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services & Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services & Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/services" className="text-gray-300 hover:text-white transition-colors">
                  Construction Services
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-white transition-colors">
                  Engineering Consulting
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-white transition-colors">
                  Project Management
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-white transition-colors">
                  Renovation & Repair
                </Link>
              </li>
              
              {/* Legal Pages */}
              <div className="border-t border-gray-700 pt-3 mt-3">
                {PAGES_CONFIG.footer.map((page) => (
                  <li key={page.path} className="mb-2">
                    <Link 
                      to={page.path}
                      className="text-gray-400 hover:text-gray-300 transition-colors text-sm"
                    >
                      {page.name}
                    </Link>
                  </li>
                ))}
              </div>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-4">
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">{APP_CONFIG.contact.address}</p>
                  <p className="text-gray-400 text-sm">Kenya</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <a 
                  href={`tel:${APP_CONFIG.contact.phone}`}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {APP_CONFIG.contact.phone}
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <a 
                  href={`mailto:${APP_CONFIG.contact.email}`}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {APP_CONFIG.contact.email}
                </a>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">{APP_CONFIG.contact.workingHours}</p>
                  <p className="text-gray-400 text-sm">East Africa Time (EAT)</p>
                </div>
              </div>

              {/* Get Quote Button */}
              <div className="pt-4">
                <Link to="/request-quote">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Get Free Quote
                  </Button>
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-xl font-semibold mb-2">Stay Updated</h4>
            <p className="text-gray-400 mb-6">
              Subscribe to our newsletter for construction tips, project updates, and industry news.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            <div className="text-center md:text-left">
              <p className="text-gray-400">
                © {currentYear} {APP_CONFIG.name}. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm">
                Licensed Construction Company in Kenya
              </p>
            </div>

            <div className="flex items-center space-x-6">
              {/* Admin Access */}
              <Link 
                to="/admin" 
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors flex items-center space-x-1"
              >
                <span>Admin</span>
                <ExternalLink className="h-3 w-3" />
              </Link>

              {/* Back to Top */}
              <button
                onClick={scrollToTop}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="Back to top"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;