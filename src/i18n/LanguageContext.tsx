import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Language, Translations } from './translations';
import { translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Détecte la langue du navigateur
 */
function detectBrowserLanguage(): Language {
  const browserLang = navigator.language.toLowerCase();
  
  // Si la langue du navigateur commence par 'fr', on retourne 'fr'
  if (browserLang.startsWith('fr')) {
    return 'fr';
  }
  
  // Par défaut, on retourne l'anglais
  return 'en';
}

/**
 * Récupère la langue sauvegardée ou détecte celle du navigateur
 */
function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem('app_language');
    if (saved === 'fr' || saved === 'en') {
      return saved;
    }
  } catch {
    // localStorage non disponible
  }
  
  return detectBrowserLanguage();
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('app_language', lang);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la langue:', error);
    }
  };

  useEffect(() => {
    // Mettre à jour l'attribut lang du HTML
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook pour accéder aux traductions
 */
export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
