
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Shield, ExternalLink } from "lucide-react";
import Logo from "./Logo";
import { useAdmin } from "@/contexts/AdminContext";

const Footer = () => {
  const { companySettings } = useAdmin();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Company Info - Enhanced for mobile */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 space-y-4">
            <div className="mb-4">
              <Logo variant="white" size="md" />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">
              Leading construction and engineering company in Kenya, delivering excellence with over 15 years of experience. 
              We specialize in residential, commercial, and civil engineering projects.
            </p>
            
            {/* Contact Info - Better mobile layout */}
            <div className="space-y-2">
              <div className="flex items-start space-x-3 text-gray-300 text-sm">
                <Phone className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="break-all">{companySettings.phone || '+254 710 245 118'}</span>
              </div>
              <div className="flex items-start space-x-3 text-gray-300 text-sm">
                <Mail className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="break-all">{companySettings.email || 'info@akibeks.co.ke'}</span>
              </div>
              <div className="flex items-start space-x-3 text-gray-300 text-sm">
                <MapPin className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span>{companySettings.address || 'Nairobi, Kenya'}</span>
              </div>
            </div>

            {/* Social Media - Better spacing for mobile */}
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors p-1">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors p-1">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors p-1">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors p-1">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links - Enhanced */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-orange-400">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-300 hover:text-orange-400 transition-colors block py-1">About Us</Link></li>
              <li><Link to="/services" className="text-gray-300 hover:text-orange-400 transition-colors block py-1">Services</Link></li>
              <li><Link to="/projects" className="text-gray-300 hover:text-orange-400 transition-colors block py-1">Projects</Link></li>
              <li><Link to="/gallery" className="text-gray-300 hover:text-orange-400 transition-colors block py-1">Gallery</Link></li>
              <li><Link to="/testimonials" className="text-gray-300 hover:text-orange-400 transition-colors block py-1">Testimonials</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-orange-400 transition-colors block py-1">Contact</Link></li>
            </ul>
          </div>

          {/* Services - Enhanced */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-orange-400">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-300 py-1">Residential Construction</li>
              <li className="text-gray-300 py-1">Commercial Projects</li>
              <li className="text-gray-300 py-1">Civil Engineering</li>
              <li className="text-gray-300 py-1">Project Management</li>
              <li className="text-gray-300 py-1">Renovation Services</li>
              <li className="text-gray-300 py-1">Structural Design</li>
            </ul>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Business Hours */}
            <div>
              <h4 className="text-sm font-semibold text-orange-400 mb-3">Business Hours</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                <p>Saturday: 8:00 AM - 4:00 PM</p>
                <p>Sunday: Emergency Services Only</p>
                <p className="text-orange-400 mt-2">24/7 Emergency Support Available</p>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <h4 className="text-sm font-semibold text-orange-400 mb-3">Why Choose Us</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p>✓ Licensed & Insured Professionals</p>
                <p>✓ Quality Materials & Workmanship</p>
                <p>✓ Competitive Pricing</p>
                <p>✓ On-Time Project Delivery</p>
                <p>✓ Free Consultations & Quotes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="text-sm text-gray-300">
              © 2024 {companySettings.company_name || 'AKIBEKS Engineering Solutions'}. All rights reserved.
            </div>
            
            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link to="/privacy" className="text-gray-300 hover:text-orange-400 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-600 hidden sm:inline">•</span>
              <Link to="/terms" className="text-gray-300 hover:text-orange-400 transition-colors">
                Terms of Service
              </Link>
              <span className="text-gray-600 hidden sm:inline">•</span>
              <Link to="/faq" className="text-gray-300 hover:text-orange-400 transition-colors">
                FAQ
              </Link>
            </div>

            {/* Certifications & Admin Access */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <span className="bg-gray-800 px-2 py-1 rounded text-xs">NCA Registered</span>
              <span className="bg-gray-800 px-2 py-1 rounded text-xs">ISO Certified</span>
              <div className="flex items-center gap-2">
                <Link 
                  to="/admin" 
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs transition-colors font-medium"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Admin Dashboard
                </Link>
                <Link 
                  to="/client-portal" 
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs transition-colors font-medium"
                >
                  Client Portal
                </Link>
              </div>
            </div>
          </div>

          {/* Powered By Section */}
          <div className="border-t border-gray-800 mt-6 pt-4 text-center">
            <p className="text-xs text-gray-400 mb-2">
              Website Powered By{" "}
              <a 
                href="https://wa.me/254710245118" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 transition-colors font-medium inline-flex items-center gap-1"
              >
                Intellion Ltd
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
            <p className="text-xs text-gray-500">
              Professional Web Development & Digital Solutions
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
