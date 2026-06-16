'use client'; // Eng tepaga majburiy qo'shiladi

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client'; // Client mijozi ulandi
import UserCard from '@/components/UserCard';
import { useParams } from 'next/navigation'; // params'ni clientda o'qish uchun


export default function UsersPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ru';

  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // useEffect orqali seansni va foydalanuvchilarni dinamik qidiramiz
  useEffect(() => {
    const fetchUsers = async () => {
      // 1. Hozirgi sessiyani olish
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);

      // 2. Qidiruv matni bo'yicha profilarni olish
      let query = supabase.from('profiles').select('*');
      
      if (searchQuery.trim() !== '') {
        query = query.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
      }

      const { data } = await query.order('username', { ascending: true });
      setUsers(data || []);
    };

    fetchUsers();
  }, [searchQuery]); // Har safar searchQuery o'zgarganda qidiruv qayta ishlaydi

  return (
    // pb-20 orqali pastki navigatsiyaga yopishib qolish muammosi hal etildi
    <div className="py-4 md:py-8 pb-20 md:pb-4 max-w-2xl mx-auto px-4 sm:px-0">
      
      {/* SARLAVHA BLOCKI - DARK MODEGA MOSLASHTIRILDI */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight transition-colors duration-200">
          Пользователи
        </h1>
        <div className="w-10 md:w-12 h-1 bg-zinc-900 dark:bg-zinc-400 mt-2 md:mt-3 rounded-full transition-colors duration-200"></div>
      </div>
      
      {/* Chiroyli Responsive Search Bar */}
      <div className="mb-6">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-zinc-400">
            <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Поиск пользователей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-zinc-400 text-zinc-800 shadow-xs"
          />
        </div>
      </div>

      {/* Foydalanuvchilar ro'yxati Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {users.length > 0 ? (
          users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              locale={locale}
              isOwnProfile={user.id === currentUserId}
            />
          ))
        ) : (
          <p className="text-zinc-500 text-sm py-4">Ничего не найдено.</p>
        )}
      </div>

    </div>
  );
}