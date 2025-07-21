
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, X, Home, Building2, Users, FileText, Settings, BarChart3, Phone, Mail, ExternalLink } from "lucide-react";
import Logo from "./Logo";

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Building2 },
    { href: "/services", label: "Services", icon: Settings },
    { href: "/projects", label: "Projects", icon: FileText },
    { href: "/portfolio", label: "Portfolio", icon: FileText },
    { href: "/gallery", label: "Gallery", icon: FileText },
    { href: "/testimonials", label: "Testimonials", icon: Users },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  const adminItems = [
    { href: "/admin", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/projects", label: "Projects", icon: FileText },
    { href: "/admin/clients", label: "Clients", icon: Users },
    { href: "/admin/invoices", label: "Invoices", icon: FileText },
    { href: "/admin/quotes", label: "Quotes", icon: FileText },
    { href: "/admin/inventory", label: "Inventory", icon: Building2 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          </div>
        </SheetHeader>
        
        <div className="py-6 h-full">
          {isAdminRoute ? (
            <div className="space-y-1 px-3">
              <div className="px-3 py-2 mb-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Admin Panel
                </h3>
              </div>
              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              
              <div className="border-t my-4"></div>
              <div className="px-3 py-2">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Main Site
                </h4>
              </div>
              {navItems.slice(0, 5).map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-1 px-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              
              <div className="border-t my-4"></div>
              
              {/* Quick Actions */}
              <div className="px-3 py-2">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Quick Actions
                </h4>
              </div>
              
              <Link
                to="/request-quote"
                onClick={() => setOpen(false)}
                className="flex items-center px-3 py-3 rounded-lg text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors mx-3 mb-2"
              >
                <FileText className="mr-3 h-5 w-5" />
                Request Quote
              </Link>
              
              <Link
                to="/book-visit"
                onClick={() => setOpen(false)}
                className="flex items-center px-3 py-3 rounded-lg text-sm font-medium text-orange-600 border border-orange-600 hover:bg-orange-50 transition-colors mx-3 mb-2"
              >
                <Phone className="mr-3 h-5 w-5" />
                Book Site Visit
              </Link>

              {/* Contact Info */}
              <div className="border-t my-4"></div>
              <div className="px-3 py-2">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Contact Us
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>+254 710 245 118</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>info@akibeks.co.ke</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t my-4"></div>
              <div className="px-3">
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  Admin Panel
                </Link>
              </div>
            </div>
          )}

          {/* Footer in Mobile Nav */}
          <div className="border-t mt-6 pt-4 px-6">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">
                Powered by{" "}
                <a 
                  href="https://wa.me/254710245118" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  onClick={() => setOpen(false)}
                >
                  Intellion Ltd
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
