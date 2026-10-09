import { Sheet } from './Sheet';

/** @brief Props of ConfirmDialog. */
export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  /** Label of the red confirm button (default "Löschen"). */
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * @brief Destructive confirmation pop-up with a red confirm button.
 * @param props Title, explanatory message and callbacks.
 * @returns The dialog.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Löschen',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Sheet
      open={open}
      title={title}
      onClose={onCancel}
      onSubmit={onConfirm}
      submitLabel={confirmLabel}
      submitVariant="danger"
    >
      <p className="text-gray-600">{message}</p>
    </Sheet>
  );
}
