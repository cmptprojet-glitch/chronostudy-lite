import { useState, useCallback, useEffect } from 'react';
import { ModuleAnnotation } from '../types';

const STORAGE_KEY = 'lifeos_user_feedback_annotations';

export interface AIScanReport {
  timestamp: string;
  totalAnnotations: number;
  openCount: number;
  addressedCount: number;
  archivedCount: number;
  highPriorityCount: number;
  modulesTagged: string[];
  codeFilesTagged: string[];
  annotations: ModuleAnnotation[];
  formattedPrompt: string;
}

/**
 * Hook spécialisé pour scanner le localStorage à la recherche d'annotations
 * et de commentaires utilisateur destinés aux analyses IA du code.
 */
export const useFeedbackScanner = () => {
  const [scannedAnnotations, setScannedAnnotations] = useState<ModuleAnnotation[]>([]);

  // Fonction de lecture directe depuis localStorage
  const scanLocalStorageAnnotations = useCallback((): ModuleAnnotation[] => {
    try {
      const rawData = localStorage.getItem(STORAGE_KEY);
      if (!rawData) return [];
      const parsed: ModuleAnnotation[] = JSON.parse(rawData);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Erreur lors du scan IA de localStorage [feedback]:', error);
      return [];
    }
  }, []);

  const refreshScanner = useCallback(() => {
    const data = scanLocalStorageAnnotations();
    setScannedAnnotations(data);
  }, [scanLocalStorageAnnotations]);

  useEffect(() => {
    refreshScanner();

    // Écouter les changements dans le localStorage inter-onglets ou événements custom
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        refreshScanner();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshScanner]);

  // Générer un rapport complet lisible par l'IA
  const generateAIScanReport = useCallback((): AIScanReport => {
    const data = scanLocalStorageAnnotations();
    const openItems = data.filter((item) => item.status === 'open');
    const addressedItems = data.filter((item) => item.status === 'addressed');
    const archivedItems = data.filter((item) => item.status === 'archived');
    const highPriorityItems = openItems.filter((item) => item.priority === 'high');

    const modulesTagged: string[] = Array.from(new Set(data.map((item) => item.moduleName || item.moduleId)));
    const codeFilesTagged: string[] = Array.from(
      new Set(data.map((item) => item.codeReference).filter((ref): ref is string => Boolean(ref)))
    );

    let formattedPrompt = `### 🤖 RAPPORT DE SCAN DES ANNOTATIONS EN LOCALSTORAGE (${openItems.length} ACTIVES)\n\n`;

    if (openItems.length === 0) {
      formattedPrompt += `✅ Aucun commentaire ou retour utilisateur non traité trouvé dans le localStorage.\n`;
    } else {
      formattedPrompt += `Voici les annotations saisies par l'utilisateur destinées aux modifications de code :\n\n`;
      openItems.forEach((item, index) => {
        formattedPrompt += `#### [${index + 1}] ${item.moduleName} (${item.priority.toUpperCase()})\n`;
        if (item.codeReference) {
          formattedPrompt += `- 📁 Fichier cible : \`${item.codeReference}\`\n`;
        }
        formattedPrompt += `- 💬 Commentaire : "${item.text}"\n`;
        formattedPrompt += `- 🕒 Saisi le : ${new Date(item.createdAt).toLocaleString('fr-FR')}\n\n`;
      });
    }

    return {
      timestamp: new Date().toISOString(),
      totalAnnotations: data.length,
      openCount: openItems.length,
      addressedCount: addressedItems.length,
      archivedCount: archivedItems.length,
      highPriorityCount: highPriorityItems.length,
      modulesTagged,
      codeFilesTagged,
      annotations: data,
      formattedPrompt,
    };
  }, [scanLocalStorageAnnotations]);

  const formatForAIPrompt = useCallback((): string => {
    return generateAIScanReport().formattedPrompt;
  }, [generateAIScanReport]);

  return {
    scannedAnnotations,
    scanLocalStorageAnnotations,
    generateAIScanReport,
    formatForAIPrompt,
    refreshScanner,
    openCount: scannedAnnotations.filter((a) => a.status === 'open').length,
    highPriorityCount: scannedAnnotations.filter((a) => a.status === 'open' && a.priority === 'high').length,
  };
};
