import { cn } from '@/lib/cn';

/**
 * @brief Subtle placeholder block shown while data is loading.
 * @param props.className Size/shape classes.
 * @returns Decorative placeholder.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-xl bg-fill motion-reduce:animate-none', className)}
    />
  );
}
