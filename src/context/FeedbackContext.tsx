import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ModuleAnnotation, Priority, AnnotationStatus } from '../types';

const STORAGE_KEY = 'lifeos_user_feedback_annotations';

const INITIAL_ANNOTATIONS: ModuleAnnotation[] = [
  {
    id: 'ann-1',
    moduleId: 'dashboard',
    moduleName: 'Tableau de Bord',
    author: 'Utilisateur',
    text: 'Ajuster l\'espacement des widgets en mode compact et ajouter un indicateur de progression globale.',
    codeReference: 'src/components/DashboardView.tsx',
    status: 'open',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ann-2',
    moduleId: 'finance',
    moduleName: 'FinVault — Bourse & Capital',
    author: 'Utilisateur',
    text: 'Permettre de filtrer les transactions par catégorie d\'investissement et exporter au format CSV.',
    codeReference: 'src/components/FinanceView.tsx',
    status: 'open',
    priority: 'high',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface FeedbackContextType {
  annotations: ModuleAnnotation[];
  addAnnotation: (
    moduleId: string,
    moduleName: string,
    text: string,
    codeReference?: string,
    priority?: Priority
  ) => ModuleAnnotation;
  updateAnnotation: (id: string, updates: Partial<ModuleAnnotation>) => void;
  deleteAnnotation: (id: string) => void;
  toggleAnnotationStatus: (id: string) => void;
  clearAllAnnotations: () => void;
  getAnnotationsByModule: (moduleId: string) => ModuleAnnotation[];
  exportFormattedForAI: () => string;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [annotations, setAnnotations] = useState<ModuleAnnotation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ANNOTATIONS;
    } catch (e) {
      console.error('Erreur lecture localStorage annotations:', e);
      return INITIAL_ANNOTATIONS;
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string>('dashboard');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
    } catch (e) {
      console.error('Erreur sauvegarde localStorage annotations:', e);
    }
  }, [annotations]);

  const addAnnotation = (
    moduleId: string,
    moduleName: string,
    text: string,
    codeReference?: string,
    priority: Priority = 'medium'
  ): ModuleAnnotation => {
    const newAnn: ModuleAnnotation = {
      id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      moduleId,
      moduleName,
      author: 'Utilisateur',
      text,
      codeReference,
      status: 'open',
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAnnotations((prev) => [newAnn, ...prev]);
    return newAnn;
  };

  const updateAnnotation = (id: string, updates: Partial<ModuleAnnotation>) => {
    setAnnotations((prev) =>
      prev.map((ann) =>
        ann.id === id
          ? { ...ann, ...updates, updatedAt: new Date().toISOString() }
          : ann
      )
    );
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
  };

  const toggleAnnotationStatus = (id: string) => {
    setAnnotations((prev) =>
      prev.map((ann) => {
        if (ann.id !== id) return ann;
        const nextStatus: AnnotationStatus =
          ann.status === 'open' ? 'addressed' : ann.status === 'addressed' ? 'archived' : 'open';
        return {
          ...ann,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const clearAllAnnotations = () => {
    setAnnotations([]);
  };

  const getAnnotationsByModule = (moduleId: string) => {
    return annotations.filter((ann) => ann.moduleId === moduleId);
  };

  const exportFormattedForAI = (): string => {
    const openItems = annotations.filter((a) => a.status === 'open');
    if (openItems.length === 0) {
      return 'Aucune annotation ou directive utilisateur en attente dans le projet.';
    }

    let report = `### 📋 ANNOTATIONS ET DIRECTIVES UTILISATEUR (${openItems.length} en attente)\n\n`;
    report += `Voici la liste des retours et commentaires laissés sur l'application par l'utilisateur :\n\n`;

    openItems.forEach((item, idx) => {
      report += `**${idx + 1}. Module : ${item.moduleName}** (\`${item.moduleId}\`)\n`;
      report += `- **Priorité**: ${item.priority.toUpperCase()}\n`;
      if (item.codeReference) {
        report += `- **Fichier cible**: \`${item.codeReference}\`\n`;
      }
      report += `- **Consigne**: "${item.text}"\n`;
      report += `- **Date**: ${new Date(item.createdAt).toLocaleDateString('fr-FR')} ${new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}\n\n`;
    });

    report += `\n*Veuillez appliquer ces modifications dans le code source.*`;
    return report;
  };

  return (
    <FeedbackContext.Provider
      value={{
        annotations,
        addAnnotation,
        updateAnnotation,
        deleteAnnotation,
        toggleAnnotationStatus,
        clearAllAnnotations,
        getAnnotationsByModule,
        exportFormattedForAI,
        isDrawerOpen,
        setIsDrawerOpen,
        activeModuleId,
        setActiveModuleId,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback doit être utilisé au sein d\'un FeedbackProvider');
  }
  return context;
};
