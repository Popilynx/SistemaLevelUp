import { storage } from "@/components/storage/LocalStorage";

export type ThemeType = 'default' | 'cyberpunk' | 'medieval' | 'zen' | 'void';

export interface Theme {
    id: ThemeType;
    name: string;
    description: string;
    price: number;
    previewColor: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        card: string;
    };
}

class ThemeService {
    private THEMES: Record<ThemeType, Theme> = {
        default: {
            id: 'default',
            name: 'Padrão (Hero)',
            description: 'O visual clássico do caçador de elite.',
            price: 0,
            previewColor: '#ef4444',
            colors: {
                primary: '#ef4444',
                secondary: '#0f172a',
                accent: '#3b82f6',
                background: '#020617',
                card: '#0f172a'
            }
        },
        cyberpunk: {
            id: 'cyberpunk',
            name: 'Cyberpunk 2077',
            description: 'Neon, cromo e alta tecnologia.',
            price: 1500,
            previewColor: '#facc15',
            colors: {
                primary: '#facc15',
                secondary: '#000000',
                accent: '#f472b6',
                background: '#0a0a0a',
                card: '#1a1a1a'
            }
        },
        medieval: {
            id: 'medieval',
            name: 'Reino Antigo',
            description: 'Pedra, madeira e disciplina ancestral.',
            price: 2000,
            previewColor: '#92400e',
            colors: {
                primary: '#92400e',
                secondary: '#1c1917',
                accent: '#15803d',
                background: '#0c0a09',
                card: '#1c stone-900'
            }
        },
        zen: {
            id: 'zen',
            name: 'Equilíbrio Zen',
            description: 'Paz, clareza e minimalismo.',
            price: 1000,
            previewColor: '#059669',
            colors: {
                primary: '#059669',
                secondary: '#f8fafc',
                accent: '#8b5cf6',
                background: '#ffffff',
                card: '#f1f5f9'
            }
        },
        void: {
            id: 'void',
            name: 'O Vazio',
            description: 'Onde o tempo e a procrastinação desaparecem.',
            price: 5000,
            previewColor: '#7c3aed',
            colors: {
                primary: '#7c3aed',
                secondary: '#000000',
                accent: '#ffffff',
                background: '#000000',
                card: '#090909'
            }
        }
    };

    public availableThemes: Theme[] = Object.values(this.THEMES);

    public getCurrentTheme(): ThemeType {
        const char = JSON.parse(localStorage.getItem('levelup_character') || '{}');
        return char.current_theme || 'default';
    }

    public getOwnedThemes(): ThemeType[] {
        const char = JSON.parse(localStorage.getItem('levelup_character') || '{}');
        return char.owned_themes || ['default'];
    }

    public async setTheme(themeId: ThemeType) {
        const char = JSON.parse(localStorage.getItem('levelup_character') || '{}');
        char.current_theme = themeId;
        localStorage.setItem('levelup_character', JSON.stringify(char));

        this.applyToDOM(themeId);
        window.dispatchEvent(new Event('levelup_data_update'));
        window.dispatchEvent(new Event('levelup_theme_change'));
    }

    public async buyTheme(themeId: ThemeType) {
        const char = JSON.parse(localStorage.getItem('levelup_character') || '{}');
        const owned = char.owned_themes || ['default'];
        if (!owned.includes(themeId)) {
            char.owned_themes = [...owned, themeId];
            localStorage.setItem('levelup_character', JSON.stringify(char));
        }
    }

    public applyToDOM(themeType?: ThemeType) {
        const active = themeType || this.getCurrentTheme();
        const theme = this.THEMES[active] || this.THEMES.default;
        const root = document.documentElement;

        root.style.setProperty('--primary', theme.colors.primary);
        root.style.setProperty('--background', theme.colors.background);
        root.style.setProperty('--card', theme.colors.card);

        // For Light themes, we might need a text-color flip
        if (active === 'zen') {
            root.style.setProperty('--foreground', '#0f172a');
            root.classList.add('light');
        } else {
            root.style.setProperty('--foreground', '#ffffff');
            root.classList.remove('light');
        }
    }
}

export const themeService = new ThemeService();
