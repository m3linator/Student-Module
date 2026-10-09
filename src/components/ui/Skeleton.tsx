import { cn } from '@/lib/cn';

/**
 * @brief Subtle grey placeholder block shown while data is loading.
 * @param props.className Size/shape classes.
 * @returns Decorative placeholder.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-gray-100 motion-reduce:animate-none', className)}
    />
  );
}
