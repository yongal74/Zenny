/**
 * Zenny — Starlight Color System
 * Theme: Deep Space Navy × Indigo × Pink Accent
 */
export const COLORS = {
    // Backgrounds
    bg: '#0F1528', // Deep space navy
    bg2: '#141D38', // Midnight teal
    surface: '#16203A', // Surface
    surface2: '#1E2D4A', // Surface elevated

    // Brand
    primary: '#6366F1', // Indigo
    secondary: '#8B5CF6', // Purple
    accent: '#EC4899', // Pink

    // Text
    text: '#F2EEF9', // Cream white
    text2: '#8A9ABE', // Muted
    text3: '#4A5880', // Placeholder

    // Utility
    border: '#263050',
    success: '#10B981',
    gold: '#F59E0B', // Zen Coins

    // Character glow layers
    charGlow1: 'rgba(236, 72, 153, 0.08)',  // Outer ring
    charGlow2: 'rgba(236, 72, 153, 0.13)',  // Mid ring
    charGlow3: 'rgba(236, 72, 153, 0.19)',  // Inner

    // Gradient presets (for LinearGradient)
    gradientHeader: ['#141D38', '#0F1528'] as const,
    gradientCard: ['#16203A', '#1E2D4A'] as const,
} as const;

/** Skin → Background Theme Mapping */
export const SKIN_THEMES: Record<string, {
    bg: string;
    glow: string;
    accentColor: string;
}> = {
    starlight: { bg: '#0F1528', glow: '#EC4899', accentColor: '#8B5CF6' },
    sakura: { bg: '#1A0A10', glow: '#F472B6', accentColor: '#FB7185' },
    ocean: { bg: '#061B2A', glow: '#22D3EE', accentColor: '#06B6D4' },
    forest: { bg: '#021A06', glow: '#4ADE80', accentColor: '#22C55E' },
    aurora: { bg: '#07101F', glow: '#34D399', accentColor: '#818CF8' },
    desert: { bg: '#1C100A', glow: '#F59E0B', accentColor: '#F97316' },
    arctic: { bg: '#091524', glow: '#93C5FD', accentColor: '#60A5FA' },
    zenGarden: { bg: '#141008', glow: '#D4C5A9', accentColor: '#B8A68A' },
    neonCity: { bg: '#0D000F', glow: '#EC4899', accentColor: '#00FFFF' },
    deepSea: { bg: '#020815', glow: '#2DD4BF', accentColor: '#06B6D4' },
    moonlight: { bg: '#0A0A14', glow: '#C4B5FD', accentColor: '#A5B4FC' },
    sunfire: { bg: '#180800', glow: '#F97316', accentColor: '#EF4444' },
    bamboo: { bg: '#041208', glow: '#86EFAC', accentColor: '#4ADE80' },
    crystal: { bg: '#060E18', glow: '#BAE6FD', accentColor: '#67E8F9' },
    autumn: { bg: '#120800', glow: '#FB923C', accentColor: '#A16207' },
    midnight: { bg: '#000000', glow: '#7C3AED', accentColor: '#4F46E5' },
    cloud: { bg: '#0C1520', glow: '#E0F2FE', accentColor: '#BFDBFE' },
    rainbow: { bg: '#0A0A0A', glow: '#A78BFA', accentColor: '#F472B6' },
    gold: { bg: '#120E00', glow: '#F59E0B', accentColor: '#D97706' }, // Premium
    cherry: { bg: '#0F0005', glow: '#FB7185', accentColor: '#BE123C' },
};
