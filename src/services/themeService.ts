export const THEMES = {
    DEFAULT: 'theme-default',
    CYBERPUNK: 'theme-cyberpunk',
    MEDIEVAL: 'theme-medieval',
    MINIMALIST: 'theme-minimalist',
};

export interface Theme {
    id: string;
    name: string;
    description: string;
    price: number;
    previewColor: string;
    is_owned: boolean;
}

const STORAGE_KEY_THEME = 'levelup_current_theme';
const STORAGE_KEY_OWNED = 'levelup_owned_themes';

export const themeService = {
    availableThemes: [
        { id: THEMES.DEFAULT, name: 'Padrão (Dark)', description: 'O visual clássico do sistema.', price: 0, previewColor: '#0f172a' },
        { id: THEMES.CYBERPUNK, name: 'Cyberpunk', description: 'Neon, glitches e alta tecnologia.', price: 1000, previewColor: '#f472b6' }, // Pink neon
        { id: THEMES.MEDIEVAL, name: 'Medieval', description: 'Pergaminhos, madeira e tons terrosos.', price: 800, previewColor: '#78350f' }, // Brown
        { id: THEMES.MINIMALIST, name: 'Minimalista', description: 'Branco, preto e foco total.', price: 500, previewColor: '#e2e8f0' }, // White
    ],

    getCurrentTheme: () => {
        return localStorage.getItem(STORAGE_KEY_THEME) || THEMES.DEFAULT;
    },

    getOwnedThemes: () => {
        const stored = localStorage.getItem(STORAGE_KEY_OWNED);
        const owned = stored ? JSON.parse(stored) : [THEMES.DEFAULT];
        return owned;
    },

    setTheme: (themeId: string) => {
        localStorage.setItem(STORAGE_KEY_THEME, themeId);
        // Apply to document
        document.documentElement.className = themeId; // This presumes we use classes for themes
        // If not using classes yet, we might need to rely on CSS variables injected here
        // For now, let's assume we will toggle classes on <html> or use a Context
        window.dispatchEvent(new Event('levelup_theme_change'));
    },

    buyTheme: (themeId: string) => {
        const owned = themeService.getOwnedThemes();
        if (!owned.includes(themeId)) {
            owned.push(themeId);
            localStorage.setItem(STORAGE_KEY_OWNED, JSON.stringify(owned));
        }
    }
};
