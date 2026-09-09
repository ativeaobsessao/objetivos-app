import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm active:scale-95 transition-transform"
      >
        <Download className="w-4 h-4" />
        Instalar App
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <Download className="w-4 h-4" />
          Instalar no iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl relative animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95">
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Instalar no iOS</h3>
              <div className="space-y-4 text-gray-600 mb-6">
                <p>
                  1. Toque no botão <strong>Compartilhar</strong> na barra inferior do Safari.
                </p>
                <p>
                  2. Role para baixo e toque em <strong>Adicionar à Tela de Início</strong>.
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-200"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
