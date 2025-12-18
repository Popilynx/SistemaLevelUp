import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Mostrar o prompt apenas se não foi instalado ainda
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
      if (!isInstalled) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false);
    }

    // Registrar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => console.log('SW registered:', registration))
        .catch((error) => console.log('SW registration failed:', error));
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }

    setDeferredPrompt(null);
  };

  // Detectar iOS
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

  return (
    <AnimatePresence>
      {showInstallPrompt && !isInStandaloneMode && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-4 shadow-2xl border border-cyan-400/30">
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="absolute top-2 right-2 text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold mb-1">Instalar Level Up</h3>
                {isIOS ? (
                  <p className="text-white/90 text-sm mb-3">
                    Toque em <span className="font-bold">⎙</span> e depois em{' '}
                    <span className="font-bold">"Adicionar à Tela Inicial"</span>
                  </p>
                ) : (
                  <p className="text-white/90 text-sm mb-3">
                    Instale o app para acesso rápido e uso offline
                  </p>
                )}
                {!isIOS && deferredPrompt && (
                  <Button
                    onClick={handleInstallClick}
                    className="bg-white text-cyan-600 hover:bg-white/90 w-full"
                    size="sm"
                  >
                    Instalar Agora
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}