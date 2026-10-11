import { Link } from 'react-router';
import { formatEcts, formatOpenCount } from '@/lib/module';
import type { ModuleRow } from '@/types/database';

/**
 * @brief Module tile on the overview; opens the module page.
 * @param props.module Module to show.
 * @param props.openCount Number of open tasks of this module.
 * @returns Link tile.
 */
export function ModuleTile({ module, openCount }: { module: ModuleRow; openCount: number }) {
  return (
    <Link
      to={`/module/${module.id}`}
      className="card animate-row-in hover:bg-surface-hover flex min-h-28 flex-col gap-1 p-3.5 transition duration-150 active:scale-[0.98]"
    >
      <span className="flex items-start justify-between gap-2">
        <span className="line-clamp-3 min-w-0 leading-snug font-semibold break-words hyphens-auto">
          {module.name}
        </span>
        {module.ects !== null && (
          <span className="text-label-2 shrink-0 pt-0.5 text-xs whitespace-nowrap">
            {formatEcts(module.ects)}
          </span>
        )}
      </span>
      {module.professor && (
        <span className="text-label-2 truncate text-[13px]">{module.professor}</span>
      )}
      <span className="text-label-2 mt-auto pt-2 text-[13px]">{formatOpenCount(openCount)}</span>
    </Link>
  );
}
