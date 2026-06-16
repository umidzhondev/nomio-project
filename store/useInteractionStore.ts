import { create } from 'zustand';

interface InteractionState {
    // Har bir post ID si uchun o'zgarishlarni saqlaymiz
    overrides: Record<string, { isLiked?: boolean; likesCount?: number; isSaved?: boolean; commentCount?: number; }>;
    setInteraction: (postId: string, data: { isLiked?: boolean; likesCount?: number; isSaved?: boolean; commentCount?: number; }) => void;
}

export const useInteractionStore = create<InteractionState>((set) => ({
    overrides: {},
    setInteraction: (postId, data) => set((state) => ({
        overrides: {
            ...state.overrides,
            [postId]: {
                ...(state.overrides[postId] || {}), // Oldingi qiymatlarni saqlab qolish
                ...data                             // Yangi qiymatni ustidan yozish
            }
        }
    }))
}));