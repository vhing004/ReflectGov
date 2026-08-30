import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  score?: number;
  maxScore?: number;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (newScore: number) => void;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  score = 0,
  maxScore = 5,
  readOnly = true,
  size = 'md',
  onChange,
  className = '',
}) => {
  const [hoverScore, setHoverScore] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const currentScore = hoverScore !== null ? hoverScore : score;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {Array.from({ length: maxScore }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= currentScore;

        return (
          <button
            key={index}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(starValue)}
            onMouseEnter={() => !readOnly && setHoverScore(starValue)}
            onMouseLeave={() => !readOnly && setHoverScore(null)}
            className={`transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          >
            <Star
              className={`${starSizes[size]} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-100 text-slate-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
