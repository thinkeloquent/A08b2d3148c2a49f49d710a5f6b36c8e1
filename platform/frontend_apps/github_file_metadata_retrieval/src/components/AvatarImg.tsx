import { useState } from 'react';
import { hashColor } from '@/utils/colors';

interface AvatarImgProps {
  src: string;
  name: string;
  size?: number;
  className?: string;
  borderColor?: string;
}

export function AvatarImg({ src, name, size = 16, className = '', borderColor }: AvatarImgProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    const bg = borderColor ?? hashColor(name);
    const fontSize = Math.max(8, Math.round(size * 0.45));
    return (
      <div
        className={`rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${className}`}
        style={{ width: size, height: size, background: bg, fontSize, lineHeight: 1 }}
      >
        {(name[0] ?? '?').toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      className={`rounded-full shrink-0 ${className}`}
      style={{ width: size, height: size, ...(borderColor ? { borderColor } : {}) }}
    />
  );
}
