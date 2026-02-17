'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

type StarRatingProps = {
    rating: number; // 0 to 5
    count?: number; // total number of ratings
    readOnly?: boolean;
    onRate?: (score: number) => void;
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
};

export function StarRating({
    rating,
    count,
    readOnly = false,
    onRate,
    size = 'md',
    showCount = true,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const stars = [1, 2, 3, 4, 5];
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <div className="flex items-center gap-1.5">
            <div className="flex">
                {stars.map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={readOnly}
                        onClick={() => onRate?.(star)}
                        onMouseEnter={() => !readOnly && setHoverRating(star)}
                        onMouseLeave={() => !readOnly && setHoverRating(0)}
                        className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} transition-colors duration-150`}
                    >
                        <Star
                            className={`${sizeClasses[size]} ${(hoverRating || rating) >= star
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-stone-200 text-stone-200'
                                }`}
                        />
                    </button>
                ))}
            </div>
            {showCount && count !== undefined && (
                <span className="text-sm text-stone-500 font-medium">({count})</span>
            )}
        </div>
    );
}
