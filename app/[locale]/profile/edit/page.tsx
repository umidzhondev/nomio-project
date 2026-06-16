"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl'; // ✨ Import qilindi
export default function EditProfilePage() {

    const t = useTranslations('EditProfilePage'); // ✨ Alohida obyekt ulandi
    const params = useParams();
    const locale = (params.locale as string) || 'ru'; // ✨ Faol tilni aniqlaymiz

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const router = useRouter();

    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setUsername(data.username || '');
                    setFullName(data.full_name || '');
                    setBio(data.bio || '');
                    setAvatarUrl(data.avatar_url || '');
                }
            }
            setLoading(false);
        }
        fetchProfile();
    }, []);

    const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `user-avatars/${fileName}`;

        const { error } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (!error) {
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(data.publicUrl);
        }
    };

    const handleUpdate = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            await supabase
                .from('profiles')
                .update({ username, full_name: fullName, bio, avatar_url: avatarUrl })
                .eq('id', user.id);
            router.push(`/${locale}/profile`);
        }
        setSaving(false);
    };

    if (loading) return null;

    return (
        <div className="max-w-xl mx-auto py-4 sm:py-10 px-4 sm:px-6">
            {/* DARK MODEGA MOSLASHTIRILGAN ASOSIY TITLE */}
            <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-[var(--color-text-main)] transition-colors duration-200">
                {t('mainTitle')}
            </h1>

            {/* Avatar Section: Imagebox va fon ranglari Dark Mode uchun to'liq moslashtirildi */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 mb-6 sm:mb-8 p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 transition-colors duration-200">
                
                {/* 1. Rasm (Avatar Imagebox) */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex items-center justify-center shrink-0 border-4 border-white dark:border-zinc-800 shadow-sm transition-colors duration-200">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-xl sm:text-2xl font-bold text-zinc-400 dark:text-zinc-500">
                            {username ? username[0]?.toUpperCase() : "?"}
                        </span>
                    )}
                </div>

                {/* 2. "Изменить фото" tugmasi - Dark modeda to'q rang va mos nozik borderga o'tadi */}
                <div className="flex flex-col items-center sm:items-start gap-1.5 min-w-0 w-full sm:pt-2">
                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 w-max px-5 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-xs font-semibold text-zinc-900 dark:text-zinc-100 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all active:scale-[0.98] duration-200">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-zinc-500 dark:text-zinc-400"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" x2="12" y1="3" y2="15" />
                        </svg>
                       {t('changePhoto')} {/* ✨ Изменить фото */}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={uploadAvatar}
                        />
                    </label>
                    <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium px-1 mt-0.5 transition-colors duration-200">
                    {t('uploadHint')}
                    </p>
                </div>
            </div>

            {/* Input Forma qismi */}
            <div className="space-y-4 sm:space-y-5">
                <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1 text-zinc-500 dark:text-zinc-400 transition-colors duration-200">{t('usernameLabel')}</label>
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2.5 sm:p-3 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-[var(--color-text-main)] focus:border-[var(--color-text-main)] outline-none text-sm sm:text-base text-[var(--color-text-main)] transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1 text-zinc-500 dark:text-zinc-400 transition-colors duration-200">{t('fullNameLabel')}</label>
                    <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-2.5 sm:p-3 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-[var(--color-text-main)] focus:border-[var(--color-text-main)] outline-none text-sm sm:text-base text-[var(--color-text-main)] transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1 text-zinc-500 dark:text-zinc-400 transition-colors duration-200">{t('bioLabel')}</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full p-2.5 sm:p-3 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-[var(--color-text-main)] focus:border-[var(--color-text-main)] outline-none text-sm sm:text-base text-[var(--color-text-main)] transition-all resize-none"
                        rows={3}
                    />
                </div>

                {/* Pastki Harakat Tugmalari */}
                <div className="flex gap-3 pt-3 sm:pt-4 text-xs sm:text-sm">
                    <button 
                        onClick={() => router.back()} 
                        className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold border border-transparent dark:border-zinc-700 transition-all active:scale-[0.99] duration-200"
                    >
                        {t('btnCancel')}
                    </button>
                    <button 
                        onClick={handleUpdate} 
                        disabled={saving} 
                        className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white disabled:opacity-50 border border-transparent transition-all active:scale-[0.99] duration-200"
                    >
                     {saving ? t('btnSaving') : t('btnSave')}
                    </button>
                </div>
            </div>
        </div>
    );
}