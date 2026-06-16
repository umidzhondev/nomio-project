'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner'; // или 'react-hot-toast', в зависимости от вашего проекта
import { useTranslations } from 'next-intl'; // ✨ Import qilindi
export default function EditPage() {
  const t = useTranslations('EditPage'); // ✨ Alohida yangi obyekt ulandi
  const { id, locale } = useParams(); // ✨ locale parametrini ham shu yerdan sug'urib olamiz
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', description: '', content: '', image_url: '', category_id: '' });
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [newImage, setNewImage] = useState<File | null>(null);
  // Komponent tepasidagi boshqa state'lar yoniga qo'shing:
  const [isCatMenuOpen, setIsCatMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('posts').select('*').eq('id', id).single();
      if (data) setFormData(data);

      // Kategoriyalarni ID bo'yicha tartiblab olish majburiy qilindi
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name')
        .order('id', { ascending: true });

      if (catData) setCategories(catData);

      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalImageUrl = formData.image_url;

    if (newImage) {
      const fileName = `${Date.now()}_${newImage.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, newImage);

      if (uploadError) {
       toast.error(t('imgUploadError') + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('posts').getPublicUrl(fileName);
      finalImageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from('posts')
      .update({ ...formData, image_url: finalImageUrl })
      .eq('id', id);

    if (error) toast.error(t('dbError') + error.message);
    else router.push(`/${locale}/profile`);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-5 sm:py-12 px-4 sm:px-8">
      {/* ASOSIY TITLE: Dark Mode moslashtirildi */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-5 sm:mb-8 text-[var(--color-text-main)] transition-colors duration-200">
        {t('mainTitle')}
      </h1>

      {/* pb-20 orqali 760px (md) gacha bo'lgan ekranlarda tugma navigatsiya paneli ostida qolishi butunlay tuzatildi */}
      <form onSubmit={handleUpdate} className="space-y-4 sm:space-y-6 pb-20 md:pb-4">

        {/* Rasm yuklash dizayni (ImageBox): Dark mode ranglari moslashtirildi */}
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 transition-colors duration-200">{t('coverLabel')}</label>
          <div className="relative w-full aspect-video max-h-64 sm:max-h-80 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-200">
            {newImage ? (
              <img src={URL.createObjectURL(newImage)} className="w-full h-full object-cover" alt="Preview" />
            ) : formData.image_url ? (
              <img src={formData.image_url} className="w-full h-full object-cover" alt="Current" />
            ) : (
              <ImageIcon size={40} className="text-zinc-400 sm:size-[48px] dark:text-zinc-500" />
            )}

            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={(e) => setNewImage(e.target.files?.[0] || null)}
            />
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 font-medium transition-colors duration-200">{t('coverHint')}</p>
        </div>

        {/* Kategoriya Custom Dropdown: To'liq Dark Mode moslashtirildi */}
        <div className="relative w-full">
          <button
            type="button"
            onClick={() => {
              if (categories.length > 0) setIsCatMenuOpen(!isCatMenuOpen);
            }}
            className="w-full flex items-center justify-between border border-zinc-200 dark:border-zinc-700 p-3 pr-4 rounded-xl bg-white dark:bg-zinc-900 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 text-left focus:border-[var(--color-text-main)] outline-none transition-all cursor-pointer shadow-xs sm:shadow-sm"
          >
            <span className="truncate">
              {formData.category_id
                ? categories.find(c => String(c.id) === String(formData.category_id))?.name || t('selectCategory')
                : t('selectCategory')}
            </span>
            <svg
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 transition-transform duration-200 ${isCatMenuOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* Dropdown Ro'yxati: Dark mode fon va borderlari to'g'rilandi */}
          {isCatMenuOpen && (
            <div className="absolute left-0 mt-1 w-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-xl z-30 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, category_id: '' });
                  setIsCatMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer font-medium"
              >
               {t('selectCategory')}
              </button>

              {categories.map((cat) => {
                const isSelected = String(formData.category_id) === String(cat.id);

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, category_id: String(cat.id) });
                      setIsCatMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${isSelected
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                  >
                    <span>{cat.name}</span>

                    {isSelected && (
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-900 dark:text-zinc-100 animate-in zoom-in-75 duration-700"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Title Input: Dark Mode moslashtirildi */}
        <input
          required
          placeholder={t('titlePlaceholder')}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full text-base sm:text-2xl font-medium sm:font-bold bg-transparent placeholder:text-zinc-300 dark:placeholder:text-zinc-600 border border-zinc-200 dark:border-zinc-700 text-[var(--color-text-main)] rounded-xl p-3 sm:p-4 focus:border-[var(--color-text-main)] outline-none transition-all shadow-xs sm:shadow-sm"
        />

        {/* Description: Dark Mode moslashtirildi */}
        <textarea
          required
          placeholder={t('descPlaceholder')}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full text-xs sm:text-base bg-transparent text-[var(--color-text-main)] placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 sm:p-4 focus:border-[var(--color-text-main)] outline-none transition-all h-20 resize-none shadow-xs sm:shadow-sm leading-normal"
        />

        {/* Content Textarea: Dark Mode moslashtirildi */}
        <textarea
          required
        placeholder={t('contentPlaceholder')}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full h-72 sm:h-96 text-xs sm:text-base bg-transparent text-[var(--color-text-main)] placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 sm:p-4 focus:border-[var(--color-text-main)] outline-none leading-relaxed resize-none shadow-xs sm:shadow-sm"
        />

        {/* Submit Button (Submit button): Dark Mode moslashtirildi */}
        <div className="flex items-center justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800 transition-colors duration-200">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 px-8 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-zinc-800 dark:hover:bg-white border border-transparent transition-all disabled:opacity-50 active:scale-[0.99] shadow-sm sm:shadow-md cursor-pointer"
          >
            {loading ? t('btnSaving') : t('btnSave')}
          </button>
        </div>


      </form>
    </div>
  );
}