import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      shortcuts.forEach((shortcut) => {
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const matchesShift = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const matchesAlt = shortcut.altKey ? event.altKey : !event.altKey;

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
};

// Common shortcuts for the app
export const useAppShortcuts = (onSearch?: () => void) => {
  const navigate = useNavigate();

  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      action: () => {
        if (onSearch) {
          onSearch();
        }
      },
      description: 'Cerca',
    },
    {
      key: 'n',
      ctrlKey: true,
      action: () => {
        // Open expense dialog if on expenses page, otherwise navigate to expenses
        const currentPath = window.location.pathname;
        if (currentPath.includes('/expenses')) {
          // Trigger FAB click if available
          const fab = document.querySelector('[aria-label="add expense"]') as HTMLElement;
          if (fab) fab.click();
        } else {
          navigate('/expenses');
        }
      },
      description: 'Nuova spesa',
    },
    {
      key: 't',
      ctrlKey: true,
      action: () => {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/tasks')) {
          const fab = document.querySelector('[aria-label="add task"]') as HTMLElement;
          if (fab) fab.click();
        } else {
          navigate('/tasks');
        }
      },
      description: 'Nuovo task',
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/shopping-list')) {
          const fab = document.querySelector('[aria-label="add item"]') as HTMLElement;
          if (fab) fab.click();
        } else {
          navigate('/shopping-list');
        }
      },
      description: 'Aggiungi alla lista spesa',
    },
    {
      key: '1',
      ctrlKey: true,
      action: () => navigate('/'),
      description: 'Dashboard',
    },
    {
      key: '2',
      ctrlKey: true,
      action: () => navigate('/expenses'),
      description: 'Spese',
    },
    {
      key: '3',
      ctrlKey: true,
      action: () => navigate('/shopping-list'),
      description: 'Lista spesa',
    },
    {
      key: '4',
      ctrlKey: true,
      action: () => navigate('/tasks'),
      description: 'Task',
    },
    {
      key: '5',
      ctrlKey: true,
      action: () => navigate('/inventory'),
      description: 'Inventario',
    },
  ]);
};

