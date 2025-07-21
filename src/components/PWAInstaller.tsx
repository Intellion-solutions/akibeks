import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Smartphone, Monitor, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installable, setInstallable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallable(false);
      setDeferredPrompt(null);
      toast({
        title: "App Installed!",
        description: "Admin Dashboard has been installed successfully.",
      });
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "Installing...",
          description: "Admin Dashboard is being installed.",
        });
      }
      
      setDeferredPrompt(null);
      setInstallable(false);
    } catch (error) {
      console.error('Error during installation:', error);
      toast({
        title: "Installation Error",
        description: "Failed to install the app. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInstallationInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome')) {
      return "Click the install button or look for the install icon in your address bar.";
    } else if (userAgent.includes('firefox')) {
      return "Look for the install option in your browser menu.";
    } else if (userAgent.includes('safari')) {
      return "Tap the share button and select 'Add to Home Screen'.";
    }
    
    return "Look for install options in your browser menu.";
  };

  if (isInstalled) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
            <Smartphone className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-green-700">App Installed!</CardTitle>
          <CardDescription>
            Admin Dashboard is running as an installed app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Monitor className="w-3 h-3 mr-1" />
              Installed
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Connection:</span>
            <Badge variant={isOnline ? "secondary" : "destructive"}>
              {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
          {!isOnline && (
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              You're offline, but the app will continue to work with cached data.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
          <Download className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Install Admin Dashboard</CardTitle>
        <CardDescription>
          Get the full app experience with offline support
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {installable && (
          <>
            <Button onClick={handleInstall} className="w-full" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Install App
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Install for faster access and offline capabilities
            </p>
          </>
        )}
        
        {!installable && (
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              {getInstallationInstructions()}
            </p>
            <Badge variant="outline">PWA Ready</Badge>
          </div>
        )}
        
        <div className="border-t pt-4 space-y-2">
          <h4 className="font-medium text-sm">Features:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Offline access to dashboard</li>
            <li>• Push notifications</li>
            <li>• Native app experience</li>
            <li>• Quick access from home screen</li>
            <li>• Background sync</li>
          </ul>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Connection:</span>
          <Badge variant={isOnline ? "secondary" : "destructive"} className="text-xs">
            {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstaller;