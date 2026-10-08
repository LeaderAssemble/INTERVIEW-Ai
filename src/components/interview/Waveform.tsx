import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface WaveformProps {
  isActive: boolean;
  barCount?: number;
}

export function Waveform({ isActive, barCount = 5 }: WaveformProps) {
  const [barHeights, setBarHeights] = useState<number[]>(Array(barCount).fill(20));

  useEffect(() => {
    if (!isActive) {
      setBarHeights(Array(barCount).fill(20));
      return;
    }

    const interval = setInterval(() => {
      setBarHeights(
        Array(barCount)
          .fill(0)
          .map(() => 20 + Math.random() * 30)
      );
    }, 150);

    return () => clearInterval(interval);
  }, [isActive, barCount]);

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {barHeights.map((height, index) => (
        <motion.div
          key={index}
          className="w-1 bg-primary-400 rounded-full"
          initial={{ height: 20 }}
          animate={{ height: isActive ? height : 20 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
}
