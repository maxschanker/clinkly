import { useEffect, useState } from 'react';

interface FloatingEmoji {
  id: number;
  emoji: string;
  side: 'left' | 'right';
}

const FloatingEmojis = () => {
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([]);
  const emojiList = ['💌', '❣️', '💝', '🎁', '🫶'];

  useEffect(() => {
    let counter = 0;
    
    const spawnEmoji = () => {
      const newEmoji: FloatingEmoji = {
        id: counter++,
        emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
        side: Math.random() > 0.5 ? 'left' : 'right',
      };

      setEmojis(prev => [...prev, newEmoji]);

      // Remove emoji after animation completes (8 seconds)
      setTimeout(() => {
        setEmojis(prev => prev.filter(emoji => emoji.id !== newEmoji.id));
      }, 8000);
    };

    // Spawn first emoji immediately
    spawnEmoji();

    // Then spawn every 3 seconds
    const interval = setInterval(spawnEmoji, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {emojis.map((emoji) => (
        <div
          key={emoji.id}
          className={`absolute text-4xl ${
            emoji.side === 'left' 
              ? 'left-0 animate-float-left' 
              : 'right-0 animate-float-right'
          }`}
          style={{
            bottom: '0px',
            animationFillMode: 'forwards',
          }}
        >
          {emoji.emoji}
        </div>
      ))}
    </div>
  );
};

export default FloatingEmojis;