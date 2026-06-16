"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl'; // ✨ Import qilindi
export default function WritePage() {

    const t = useTranslations('WritePage'); // ✨ Alohida yangi obyekt ulandi
    const params = useParams();
    const locale = (params.locale as string) || 'ru'; // ✨ Faol tilni aniqlaymiz

    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const [aiInstruction, setAiInstruction] = useState('');

    const [aiDescLoading, setAiDescLoading] = useState(false);
    const [aiContentLoading, setAiContentLoading] = useState(false);

    useEffect(() => {
        async function fetchCategories() {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name')
                .order('id', { ascending: true });

            if (error) {
                console.error("Xatolik:", error);
            } else if (data) {
                setCategories(Array.isArray(data) ? data : []);
            }
        }
        fetchCategories();
    }, []);

    const generateDescription = async () => {
    if (!title.trim()) {
        toast.warning(t('toastTitleWarning'));
        return;
    }
    setAiDescLoading(true);
    try {
        const promptPayload = aiInstruction.trim()
            ? `Заголовок: ${title}. Учти это направление: ${aiInstruction}`
            : title;

        // MANA SHU YERDA MANZILNI TEKSHIRAMIZ
        const url = `${window.location.origin}/api/generate`;
        console.log("So'rov yuborilayotgan manzil:", url);

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: promptPayload, type: 'title' }),
        });

        // Agar server 200 (OK) kodidan boshqa narsa qaytarsa, xatoni ushlaymiz
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Server xatosi: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        if (data.text) {
            setDescription(data.text);
        } else {
            toast.error(t('aiDescError'));
        }
    } catch (err) {
        console.error("GENERATSIYA XATOLIGI:", err); // Brauzer konsolida ko'rinadi
        toast.error("Generatsiya amalga oshmadi, konsolni tekshiring.");
    } finally {
        setAiDescLoading(false);
    }
};

    const generateContent = async () => {
        if (!title.trim()) {
            toast.warning(t('toastContentWarning'));
            return;
        }
        setAiContentLoading(true);
        try {
            const combinedPrompt = aiInstruction.trim()
                ? `Главная тема: ${title}. Конкретное направление/задание для статьи: ${aiInstruction}`
                : `Главная тема: ${title}. Также можешь учесть краткое описание, если оно есть: ${description}`;

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: combinedPrompt, type: 'text' }),
            });
            const data = await res.json();
            if (data.text) {
                setContent(data.text);
            } else {
                toast.error(t('aiContentError'));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setAiContentLoading(false);
        }
    };

    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error(t('toastLoginWarning'));
            setLoading(false);
            return;
        }

        let imageUrl = null;

        if (image) {
            const fileExt = image.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('posts')
                .upload(fileName, image);

            if (uploadError) {
                console.error("Rasm yuklashda xatolik:", uploadError);
                toast.error(`${t('imgUploadError')}${uploadError.message}`);
                setLoading(false);
                return;
            }

            const { data: publicUrlData } = supabase.storage
                .from('posts')
                .getPublicUrl(fileName);

            imageUrl = publicUrlData.publicUrl;
        }

        const { error: insertError } = await supabase.from('posts').insert({
            title,
            description,
            content,
            category_id: categoryId,
            image_url: imageUrl,
            user_id: user.id,
        });

        if (insertError) {
            toast.error(`${t('dbError')}${insertError.message}`)
        } else {
           router.push(`/${locale}`);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto py-5 sm:py-12 px-4 sm:px-8">
            {/* ASOSIY TITLE: Dark Mode moslashtirildi */}
            <h1 className="text-lg sm:text-3xl font-bold mb-5 sm:mb-8 text-[var(--color-text-main)] transition-colors duration-200">
             {t('mainTitle')}
            </h1>

            <form onSubmit={handlePublish} className="space-y-4 sm:space-y-6 pb-20 md:pb-4">

                {/* Rasm Yuklash (Imagebox): Dark mode ranglari moslashtirildi */}
                <div className="w-full">
                    {image ? (
                        <div className="relative w-full aspect-video max-h-64 sm:max-h-80 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm sm:shadow-md bg-zinc-50 dark:bg-zinc-900 group">
                            <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setImage(null)} className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-full transition cursor-pointer backdrop-blur-sm">
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full aspect-video max-h-40 sm:max-h-48 rounded-xl sm:rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer p-4 group">
                            <div className="flex flex-col items-center justify-center space-y-2 text-center">
                                <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-800 rounded-full border border-zinc-100 dark:border-zinc-700 shadow-xs sm:shadow-sm text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                                    <ImageIcon size={20} />
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">{t('uploadCover')}</p>
                                <p className="text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">{t('uploadHint')}</p>
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                        </label>
                    )}
                </div>

                {/* Kategoriya Select: Dark Mode moslashtirildi */}
                <div className="relative w-full">
                    <select
                        required
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 pr-10 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 focus:ring-1 focus:ring-[var(--color-text-main)] focus:border-[var(--color-text-main)] outline-none transition-all尊 cursor-pointer shadow-xs sm:shadow-sm appearance-none"
                    >
                        <option value="" className="dark:bg-zinc-900">{categories.length > 0 ? t('selectCategory') : t('loadingCategories')}</option>
                        {categories.map((cat) => <option key={cat.id} value={cat.id} className="dark:bg-zinc-900">{cat.name}</option>)}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                </div>

                {/* Title Input: Dark Mode moslashtirildi */}
                <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    type="text"
                    placeholder={t('titlePlaceholder')}
                    className="w-full text-base sm:text-2xl font-medium sm:font-bold placeholder:text-zinc-300 dark:placeholder:text-zinc-600 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 sm:p-4 text-[var(--color-text-main)] focus:border-[var(--color-text-main)] outline-none transition-all shadow-xs sm:shadow-sm"
                />

                {/* Subtitle / AI Instruction Label va Input: Dark Mode moslashtirildi */}
                <div className="space-y-1">
                    <label className="text-[11px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider transition-colors duration-200">
                        {t('aiLabel')}
                    </label>
                    <input
                        type="text"
                        value={aiInstruction}
                        onChange={(e) => setAiInstruction(e.target.value)}
                        placeholder={t('aiPlaceholder')}
                        className="w-full text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-[var(--color-text-main)] focus:bg-transparent focus:border-[var(--color-text-main)] outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-2xs"
                    />
                </div>

                {/* Description Textarea + AI Button: Dark Mode moslashtirildi */}
                <div className="space-y-1.5">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={generateDescription}
                            disabled={aiDescLoading}
                            className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50 select-none border border-zinc-200/50 dark:border-zinc-700"
                        >
                            <span>{aiDescLoading ? t('aiDescLoading') : t('aiDescBtn')}</span>
                        </button>
                    </div>
                    <textarea
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                       placeholder={t('descPlaceholder')}
                        className="w-full text-xs sm:text-base bg-transparent text-[var(--color-text-main)] placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 sm:p-4 focus:border-[var(--color-text-main)] outline-none transition-all h-20 resize-none shadow-xs sm:shadow-sm leading-normal"
                    />
                </div>

                {/* TextContent Textarea + AI Button: Dark Mode moslashtirildi */}
                <div className="space-y-1.5">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={generateContent}
                            disabled={aiContentLoading}
                            className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50 select-none border border-zinc-200/50 dark:border-zinc-700"
                        >
                           <span>{aiContentLoading ? t('aiContentLoading') : t('aiContentBtn')}</span>
                        </button>
                    </div>
                    <textarea
                        required
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                       placeholder={t('contentPlaceholder')}
                        className="w-full h-72 sm:h-96 text-xs sm:text-base bg-transparent text-[var(--color-text-main)] placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 sm:p-4 focus:border-[var(--color-text-main)] outline-none leading-relaxed resize-none shadow-xs sm:shadow-sm"
                    />
                </div>

                {/* Footer Submit Button: Dark Mode moslashtirildi */}
                <div className="flex items-center justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800 transition-colors duration-200">
                    <button
                        disabled={loading || aiDescLoading || aiContentLoading}
                        type="submit"
                        className="w-full sm:w-auto bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 px-8 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-zinc-800 dark:hover:bg-white border border-transparent transition-all disabled:opacity-50 active:scale-[0.99] shadow-sm sm:shadow-md cursor-pointer"
                    >
                       {loading ? t('btnPublishing') : t('btnPublish')}
                    </button>
                </div>
            </form>
        </div>
    );
}