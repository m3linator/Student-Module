/**
 * @file icons.tsx
 * @brief Small inline SVG icon set (stroke icons, 24 px grid, `currentColor`).
 */
import type { ReactNode, SVGProps } from 'react';

/** @brief Props shared by all icons. */
export type IconProps = SVGProps<SVGSVGElement>;

/**
 * @brief Base wrapper that applies the common SVG attributes.
 * @param props SVG props plus the icon paths as children.
 * @returns Decorative SVG element (hidden from screen readers).
 */
function Icon({ children, className = 'size-5', ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

/** @brief Plus sign. @param props SVG props. @returns Icon. */
export const PlusIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

/** @brief Check mark. @param props SVG props. @returns Icon. */
export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
);

/** @brief Trash can. @param props SVG props. @returns Icon. */
export const TrashIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3" />
  </Icon>
);

/** @brief Pencil. @param props SVG props. @returns Icon. */
export const PencilIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
  </Icon>
);

/** @brief Counter-clockwise arrow (restore / undo). @param props SVG props. @returns Icon. */
export const RestoreIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 010 11H11" />
  </Icon>
);

/** @brief Left chevron. @param props SVG props. @returns Icon. */
export const ChevronLeftIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M15 18l-6-6 6-6" />
  </Icon>
);

/** @brief Right chevron. @param props SVG props. @returns Icon. */
export const ChevronRightIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9 18l6-6-6-6" />
  </Icon>
);

/** @brief Person in a circle (account menu). @param props SVG props. @returns Icon. */
export const AccountIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="10" r="3" />
    <path d="M6.5 18.5a6.5 6.5 0 0111 0" />
  </Icon>
);

/** @brief Door with arrow (sign out). @param props SVG props. @returns Icon. */
export const LogoutIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 16l-4-4 4-4M6 12h10" />
  </Icon>
);

/** @brief Calendar. @param props SVG props. @returns Icon. */
export const CalendarIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="4" y="5" width="16" height="16" rx="2" />
    <path d="M4 10h16M9 3v4M15 3v4" />
  </Icon>
);

/** @brief Cross (close / remove). @param props SVG props. @returns Icon. */
export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

/** @brief Six dots (drag handle). @param props SVG props. @returns Icon. */
export const GripIcon = (props: IconProps) => (
  <Icon {...props} strokeWidth={2.5}>
    <path d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" />
  </Icon>
);

/** @brief Crossed-out cloud (offline). @param props SVG props. @returns Icon. */
export const OfflineIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 3l18 18M8 8a5 5 0 00-1 9.9h9.5M18.5 15.5A3.5 3.5 0 0016 10h-.5A5.5 5.5 0 0010.6 6" />
  </Icon>
);

/** @brief External-link arrow. @param props SVG props. @returns Icon. */
export const ExternalIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M14 5h5v5M19 5l-8 8M18 14v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h4" />
  </Icon>
);
