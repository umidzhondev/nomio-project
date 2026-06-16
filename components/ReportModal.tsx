'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

// Sabablar ro'yxati to'liq Rus tiliga o'girildi
const reasons = [
  "Спам или реклама",
  "Оскорбительный контент",
  "Неподобающий контент",
  "Ложная информация",
  "Другое"
];

export default function ReportModal({ isOpen, onClose, postId }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedReason) return toast.error("Пожалуйста, выберите причину!");

    setIsSubmitting(true);
    const { error } = await supabase
      .from('reports')
      .insert({ post_id: postId, reason: selectedReason });

    setIsSubmitting(false);

    if (error) {
      toast.error("Произошла ошибка: " + error.message);
    } else {
      toast.error("Спасибо за сообщение, мы обязательно его рассмотрим!");
      onClose();
      setSelectedReason(""); // Tanlovni tozalash
    }
  };

  return (
    // p-4 orqali chekkadagi majburiy xavfsizlik masofasi ta'minlandi
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* max-[400px]:p-4 orqali ultra-kichik ekranlarda ichki padding ixchamlashtirildi */}
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 sm:p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-base sm:text-lg font-bold mb-4 text-zinc-900">
          Пожаловаться на пост
        </h3>

        {/* Sabablar ro'yxati: Mobil ekranlarda tugma paddinglari va shrifti ixchamlashtirildi */}
        <div className="space-y-2 mb-5 sm:mb-6">
          {reasons.map((reason) => (
            <button
              key={reason}
              onClick={() => setSelectedReason(reason)}
              className={`w-full text-left px-4 py-2.5 max-[400px]:py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                selectedReason === reason
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                  : 'border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300 text-zinc-700'
              }`}
            >
              {reason}
            </button>
          ))}
        </div>

        {/* Pastki Harakat Tugmalari: text-xs sm:text-sm responsive shriftlar berildi */}
        <div className="flex gap-3 text-xs sm:text-sm font-semibold">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-zinc-600 hover:bg-zinc-100 cursor-pointer transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReason}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
          >
            {isSubmitting ? "Отправка..." : "Отправить"}
          </button>
        </div>
      </div>
    </div>
  );
}