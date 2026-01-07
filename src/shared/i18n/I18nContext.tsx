import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Language } from '../types';
import en from './en.json';
import es from './es.json';
import zhCN from './zh-CN.json';
import ptBR from './pt-BR.json';

export type { Language };

// Translation type - nested object structure
type TranslationValue = string | TranslationValue[] | { [key: string]: TranslationValue };
type Translations = Record<string, TranslationValue>;

// Available translations
const translations: Record<string, Translations> = {
  en,
  es,
  'zh-CN': zhCN,
  'pt-BR': ptBR,
};

// Get nested value from object using dot notation
function getNestedValue(obj: Translations, path: string): string | undefined {
  const keys = path.split('.');
  let current: TranslationValue = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && !Array.isArray(current)) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  
  return typeof current === 'string' ? current : undefined;
}

// Replace placeholders like {count}, {site}, etc.
function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  
  return text.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key]?.toString() ?? `{${key}}`;
  });
}

// Detect browser language
function detectBrowserLanguage(): string {
  const browserLang = navigator.language.split('-')[0];
  return translations[browserLang] ? browserLang : 'en';
}

// Context interface
interface I18nContextType {
  language: Language;
  effectiveLanguage: string;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  getQuotes: () => Array<{ text: string; author: string }>;
  getDayName: (dayIndex: number) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>('auto');
  const [effectiveLanguage, setEffectiveLanguage] = useState<string>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load language preference from storage
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const result = await chrome.storage.sync.get('settings');
        const settings = result.settings as { language?: Language } | undefined;
        if (settings?.language) {
          setLanguageState(settings.language);
        }
      } catch (e) {
        console.log('Could not load language preference:', e);
      }
      setIsLoaded(true);
    };
    
    loadLanguage();
  }, []);

  // Update effective language when language setting changes
  useEffect(() => {
    if (language === 'auto') {
      setEffectiveLanguage(detectBrowserLanguage());
    } else {
      setEffectiveLanguage(language);
    }
  }, [language]);

  // Save language preference to storage
  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    
    try {
      const result = await chrome.storage.sync.get('settings');
      const settings = result.settings || {};
      await chrome.storage.sync.set({
        settings: { ...settings, language: lang }
      });
    } catch (e) {
      console.log('Could not save language preference:', e);
    }
  }, []);

  // Translation function
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const currentTranslations = translations[effectiveLanguage] || translations.en;
    const fallbackTranslations = translations.en;
    
    let text = getNestedValue(currentTranslations, key);
    
    // Fallback to English if key not found
    if (text === undefined) {
      text = getNestedValue(fallbackTranslations, key);
    }
    
    // Return key if still not found
    if (text === undefined) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    
    return interpolate(text, params);
  }, [effectiveLanguage]);

  // Get quotes array
  const getQuotes = useCallback((): Array<{ text: string; author: string }> => {
    const currentTranslations = translations[effectiveLanguage] || translations.en;
    return (currentTranslations.quotes as Array<{ text: string; author: string }>) || [];
  }, [effectiveLanguage]);

  // Get day name from index (0 = Sunday)
  const getDayName = useCallback((dayIndex: number): string => {
    const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return t(`days.${dayKeys[dayIndex]}`);
  }, [t]);

  // Don't render until loaded to prevent flash of wrong language
  if (!isLoaded) {
    return null;
  }

  return (
    <I18nContext.Provider value={{
      language,
      effectiveLanguage,
      setLanguage,
      t,
      getQuotes,
      getDayName,
    }}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use translations
export function useTranslation() {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  
  return context;
}

// Standalone translation function for content scripts (outside React)
export async function getTranslator(): Promise<{
  t: (key: string, params?: Record<string, string | number>) => string;
  lang: string;
}> {
  let lang = 'en';
  
  try {
    const result = await chrome.storage.sync.get('settings');
    const settings = result.settings as { language?: Language } | undefined;
    
    if (settings?.language === 'auto') {
      lang = detectBrowserLanguage();
    } else if (settings?.language && translations[settings.language]) {
      lang = settings.language;
    }
  } catch (e) {
    console.log('Could not load language preference:', e);
  }
  
  const currentTranslations = translations[lang] || translations.en;
  const fallbackTranslations = translations.en;
  
  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = getNestedValue(currentTranslations, key);
    
    if (text === undefined) {
      text = getNestedValue(fallbackTranslations, key);
    }
    
    if (text === undefined) {
      return key;
    }
    
    return interpolate(text, params);
  };
  
  return { t, lang };
}

