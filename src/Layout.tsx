import { useEffect, ReactNode } from 'react';
import { Toaster } from "sonner";
import InstallPWA from '@/components/InstallPWA';
import DailySystem from '@/components/DailySystem';
import { initializeDefaultData } from '@/components/storage/LocalStorage';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  useEffect(() => {
    // Inicializar dados ao carregar
    initializeDefaultData();

    // Adicionar meta tags para iOS
    const metaThemeColor = document.createElement('meta');
    metaThemeColor.name = 'theme-color';
    metaThemeColor.content = '#0f172a';
    document.head.appendChild(metaThemeColor);

    const metaAppleMobileWebAppCapable = document.createElement('meta');
    metaAppleMobileWebAppCapable.name = 'apple-mobile-web-app-capable';
    metaAppleMobileWebAppCapable.content = 'yes';
    document.head.appendChild(metaAppleMobileWebAppCapable);

    const metaAppleMobileWebAppStatusBarStyle = document.createElement('meta');
    metaAppleMobileWebAppStatusBarStyle.name = 'apple-mobile-web-app-status-bar-style';
    metaAppleMobileWebAppStatusBarStyle.content = 'black-translucent';
    document.head.appendChild(metaAppleMobileWebAppStatusBarStyle);

    const linkManifest = document.createElement('link');
    linkManifest.rel = 'manifest';
    linkManifest.href = '/manifest.json';
    document.head.appendChild(linkManifest);

    const linkAppleTouch = document.createElement('link');
    linkAppleTouch.rel = 'apple-touch-icon';
    linkAppleTouch.href = '/apple-touch-icon.png';
    document.head.appendChild(linkAppleTouch);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <style>{`
        :root {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
          --card: 222.2 84% 4.9%;
          --card-foreground: 210 40% 98%;
          --popover: 222.2 84% 4.9%;
          --popover-foreground: 210 40% 98%;
          --primary: 210 40% 98%;
          --primary-foreground: 222.2 47.4% 11.2%;
          --secondary: 217.2 32.6% 17.5%;
          --secondary-foreground: 210 40% 98%;
          --muted: 217.2 32.6% 17.5%;
          --muted-foreground: 215 20.2% 65.1%;
          --accent: 217.2 32.6% 17.5%;
          --accent-foreground: 210 40% 98%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 210 40% 98%;
          --border: 217.2 32.6% 17.5%;
          --input: 217.2 32.6% 17.5%;
          --ring: 212.7 26.8% 83.9%;
        }
        
        body {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          min-height: 100vh;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1e293b;
        }
        ::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>


      <InstallPWA />
      <DailySystem />

      {children}
    </div>
  );
}
