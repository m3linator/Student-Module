import { AutoThemeIcon, MoonIcon, SunIcon } from '@/components/ui/icons';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { useTheme } from '@/hooks/useTheme';
import type { ThemePreference } from '@/lib/theme';

/** @brief Appearance options. */
const OPTIONS: readonly Segment<ThemePreference>[] = [
  { value: 'light', label: 'Hell', icon: <SunIcon className="size-4" /> },
  { value: 'dark', label: 'Dunkel', icon: <MoonIcon className="size-4" /> },
  { value: 'system', label: 'Auto', icon: <AutoThemeIcon className="size-4" /> },
];

/**
 * @brief "Darstellung" picker: light, dark or following the system (stored per device).
 * @returns Heading plus segmented control.
 */
export function ThemePicker() {
  const { preference, setPreference } = useTheme();
  return (
    <div className="flex flex-col gap-2 px-2 pt-1.5 pb-2">
      <span className="text-[13px] font-medium text-label-2">Darstellung</span>
      <SegmentedControl
        label="Darstellung"
        options={OPTIONS}
        value={preference}
        onChange={setPreference}
        fullWidth
      />
    </div>
  );
}

/**
 * @brief Icon matching the current appearance preference (for the desktop trigger).
 * @returns Sun, moon or half-filled circle.
 */
export function ThemeIcon() {
  const { preference } = useTheme();
  if (preference === 'light') return <SunIcon className="size-[22px]" />;
  if (preference === 'dark') return <MoonIcon className="size-[22px]" />;
  return <AutoThemeIcon className="size-[22px]" />;
}
