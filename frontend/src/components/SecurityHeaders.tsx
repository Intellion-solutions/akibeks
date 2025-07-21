
import { useEffect } from 'react';

const SecurityHeaders = () => {
  useEffect(() => {
    // Content Security Policy - Enhanced
    const cspMeta = document.createElement('meta');
    cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
    cspMeta.setAttribute('content', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://www.google.com https://www.gstatic.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https://api.supabase.co https://*.supabase.co; " +
      "frame-src 'self' https://www.google.com; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';"
    );
    document.head.appendChild(cspMeta);

    // X-Content-Type-Options
    const noSniffMeta = document.createElement('meta');
    noSniffMeta.setAttribute('http-equiv', 'X-Content-Type-Options');
    noSniffMeta.setAttribute('content', 'nosniff');
    document.head.appendChild(noSniffMeta);

    // X-Frame-Options - Enhanced
    const frameOptionsMeta = document.createElement('meta');
    frameOptionsMeta.setAttribute('http-equiv', 'X-Frame-Options');
    frameOptionsMeta.setAttribute('content', 'DENY');
    document.head.appendChild(frameOptionsMeta);

    // X-XSS-Protection
    const xssProtectionMeta = document.createElement('meta');
    xssProtectionMeta.setAttribute('http-equiv', 'X-XSS-Protection');
    xssProtectionMeta.setAttribute('content', '1; mode=block');
    document.head.appendChild(xssProtectionMeta);

    // Referrer Policy - Enhanced
    const referrerMeta = document.createElement('meta');
    referrerMeta.setAttribute('name', 'referrer');
    referrerMeta.setAttribute('content', 'strict-origin-when-cross-origin');
    document.head.appendChild(referrerMeta);

    // Permissions Policy - Enhanced
    const permissionsMeta = document.createElement('meta');
    permissionsMeta.setAttribute('http-equiv', 'Permissions-Policy');
    permissionsMeta.setAttribute('content', 
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), ' +
      'magnetometer=(), gyroscope=(), accelerometer=(), fullscreen=(self), ' +
      'picture-in-picture=(), autoplay=(), encrypted-media=()'
    );
    document.head.appendChild(permissionsMeta);

    // Strict Transport Security (client-side indication)
    const hstsMeta = document.createElement('meta');
    hstsMeta.setAttribute('http-equiv', 'Strict-Transport-Security');
    hstsMeta.setAttribute('content', 'max-age=31536000; includeSubDomains; preload');
    document.head.appendChild(hstsMeta);

    // Content-Type for IE
    const compatMeta = document.createElement('meta');
    compatMeta.setAttribute('http-equiv', 'X-UA-Compatible');
    compatMeta.setAttribute('content', 'IE=edge');
    document.head.appendChild(compatMeta);

    // Force HTTPS redirect
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }

    // Disable right-click context menu in production
    if (process.env.NODE_ENV === 'production') {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };
      document.addEventListener('contextmenu', handleContextMenu);
      
      // Disable common keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C')) ||
            (e.ctrlKey && e.key === 'u')) {
          e.preventDefault();
          return false;
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }

    // Cleanup function
    return () => {
      [cspMeta, noSniffMeta, frameOptionsMeta, xssProtectionMeta, referrerMeta, permissionsMeta, hstsMeta, compatMeta].forEach(meta => {
        if (document.head.contains(meta)) {
          document.head.removeChild(meta);
        }
      });
    };
  }, []);

  return null;
};

export default SecurityHeaders;
