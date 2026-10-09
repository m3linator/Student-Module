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
      className="animate-row-in flex min-h-28 flex-col gap-1 rounded-xl border border-gray-200 p-3 transition-colors duration-150 hover:bg-gray-50 active:bg-gray-100"
    >
      <span className="flex items-start justify-between gap-2">
        <span className="line-clamp-3 min-w-0 leading-snug font-semibold break-words hyphens-auto">
          {module.name}
        </span>
        {module.ects !== null && (
          <span className="shrink-0 pt-0.5 text-xs whitespace-nowrap text-gray-500">
            {formatEcts(module.ects)}
          </span>
        )}
      </span>
      {module.professor && (
        <span className="truncate text-[13px] text-gray-600">{module.professor}</span>
      )}
      <span className="mt-auto pt-2 text-[13px] text-gray-500">{formatOpenCount(openCount)}</span>
    </Link>
  );
}
