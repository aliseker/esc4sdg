'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Animation = 'fade-up' | 'scale-in';

interface AnimateInViewProps {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  className?: string;
  rootMargin?: string;
}

const animationClass: Record<Animation, string> = {
  'fade-up': 'animate-fade-up',
  'scale-in': 'animate-scale-in',
};

export default function AnimateInView({
  children,
  animation = 'fade-up',
  delay = 0,
  className = '',
  rootMargin = '0px 0px -8% 0px',
}: AnimateInViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  const show = animationClass[animation];

  return (
    <div
      ref={ref}
      className={visible ? `${show} ${className}`.trim() : `opacity-0 ${className}`.trim()}
      style={visible && delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
