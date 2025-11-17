export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonalColors {
  primary: string;
  secondary: string;
  accent: string;
  emoji: string;
  gradient: string;
}

export const getCurrentSeason = (): Season => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

export const getSeasonalTheme = (season: Season = getCurrentSeason()): SeasonalColors => {
  const themes: Record<Season, SeasonalColors> = {
    spring: {
      primary: '#FFB86C', // Terracotta (manteniamo il colore base)
      secondary: '#85C88A', // Verde salvia più intenso
      accent: '#FFD4A3', // Pesca chiaro
      emoji: '🌸',
      gradient: 'linear-gradient(135deg, #FFB86C20 0%, #85C88A30 100%)',
    },
    summer: {
      primary: '#FFB86C', // Terracotta
      secondary: '#6A994E', // Verde oliva
      accent: '#FFE5B4', // Albicocca
      emoji: '☀️',
      gradient: 'linear-gradient(135deg, #FFB86C25 0%, #6A994E25 100%)',
    },
    autumn: {
      primary: '#E89A4A', // Terracotta più scura
      secondary: '#D4A574', // Beige caldo
      accent: '#FFB86C', // Terracotta chiara
      emoji: '🍂',
      gradient: 'linear-gradient(135deg, #E89A4A20 0%, #D4A57420 100%)',
    },
    winter: {
      primary: '#FFB86C', // Terracotta
      secondary: '#A8C8B0', // Verde grigio
      accent: '#FFF9F3', // Avorio
      emoji: '❄️',
      gradient: 'linear-gradient(135deg, #FFB86C15 0%, #A8C8B015 100%)',
    },
  };

  return themes[season];
};

export const getSeasonalGreeting = (season: Season = getCurrentSeason()): string => {
  const greetings: Record<Season, string> = {
    spring: 'Spring is in the air 🌸',
    summer: 'Summer is coming ☀️',
    autumn: 'Golden autumn 🍂',
    winter: 'Cozy winter ❄️',
  };
  return greetings[season];
};

