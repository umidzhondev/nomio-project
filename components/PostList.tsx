'use client';

import { useState } from 'react';
import PostCard from './PostCard';

export default function PostList({ initialPosts, currentUserId }: { initialPosts: any[], currentUserId: string | null }) {
  const [posts, setPosts] = useState(initialPosts);

  const handleDelete = (id: string) => {
    // O'chirish logikangiz (masalan, API chaqiruvi)
    setPosts(posts.filter(post => post.id !== id));
  };

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isOwner={post.user_id === currentUserId}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}