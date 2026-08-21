import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeId, ThemeDefinition, AVAILABLE_THEMES } from '../types/theme';

interface ThemeContextType {
  currentThemeId: ThemeId;
  currentTheme: ThemeDefinition;
  setTheme: (themeId: ThemeId) => void;
  isThemeGalleryOpen: boolean;
  openThemeGallery: () => void;
  closeThemeGallery: () => void;
  availableThemes: Record<ThemeId, ThemeDefinition>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('chronostudy_active_theme');
    if (saved && (saved === 'niond' || saved === 'intelly' || saved === 'tasklab')) {
      return saved as ThemeId;
    }
    return 'tasklab';
  });

  const [isThemeGalleryOpen, setIsThemeGalleryOpen] = useState(false);

  const currentTheme = AVAILABLE_THEMES[currentThemeId] || AVAILABLE_THEMES.tasklab;

  // Apply theme class and CSS variables to document root
  useEffect(() => {
    try {
      localStorage.setItem('chronostudy_active_theme', currentThemeId);
    } catch (e) {
      console.error('Failed to save theme in localStorage', e);
    }

    const root = document.documentElement;
    const body = document.body;

    // Remove previous theme classes and set current
    root.classList.remove('theme-niond', 'theme-intelly', 'theme-tasklab');
    root.classList.add(`theme-${currentThemeId}`);
    root.setAttribute('data-theme', currentThemeId);

    if (body) {
      body.classList.remove('theme-niond', 'theme-intelly', 'theme-tasklab');
      body.classList.add(`theme-${currentThemeId}`);
      body.setAttribute('data-theme', currentThemeId);
    }

    // Update dynamic CSS variables on document
    root.style.setProperty('--theme-accent', currentTheme.accentColor);
    root.style.setProperty('--theme-accent-text', currentTheme.accentTextColor);
    root.style.setProperty('--theme-canvas-light', currentTheme.canvasBgLight);
    root.style.setProperty('--theme-canvas-dark', currentTheme.canvasBgDark);
    root.style.setProperty('--theme-sidebar-light', currentTheme.sidebarBgLight);
    root.style.setProperty('--theme-sidebar-dark', currentTheme.sidebarBgDark);
    root.style.setProperty('--theme-sidebar-active-light', currentTheme.sidebarActiveBgLight);
    root.style.setProperty('--theme-sidebar-active-dark', currentTheme.sidebarActiveBgDark);
    root.style.setProperty('--theme-card-light', currentTheme.cardBgLight);
    root.style.setProperty('--theme-card-dark', currentTheme.cardBgDark);
    root.style.setProperty('--theme-border-light', currentTheme.cardBorderLight);
    root.style.setProperty('--theme-border-dark', currentTheme.cardBorderDark);
  }, [currentThemeId, currentTheme]);

  const setTheme = (id: ThemeId) => {
    if (AVAILABLE_THEMES[id]) {
      setCurrentThemeId(id);
    }
  };

  const openThemeGallery = () => setIsThemeGalleryOpen(true);
  const closeThemeGallery = () => setIsThemeGalleryOpen(false);

  return (
    <ThemeContext.Provider
      value={{
        currentThemeId,
        currentTheme,
        setTheme,
        isThemeGalleryOpen,
        openThemeGallery,
        closeThemeGallery,
        availableThemes: AVAILABLE_THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
