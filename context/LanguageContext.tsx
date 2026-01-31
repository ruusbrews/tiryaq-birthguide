import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'ar' | 'en';

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('ar');

    useEffect(() => {
        const loadLanguage = async () => {
            const savedLang = await AsyncStorage.getItem('app_language');
            if (savedLang === 'en' || savedLang === 'ar') {
                setLanguageState(savedLang);
            }
        };
        loadLanguage();
    }, []);

    const setLanguage = async (lang: Language) => {
        setLanguageState(lang);
        await AsyncStorage.setItem('app_language', lang);
    };

    const toggleLanguage = () => {
        const nextLang = language === 'ar' ? 'en' : 'ar';
        setLanguage(nextLang);
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
