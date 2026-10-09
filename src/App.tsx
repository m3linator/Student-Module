import { UpdatePrompt } from '@/components/layout/UpdatePrompt';
import { APP_NAME } from '@/config/app';

/**
 * @brief Root component of the application.
 * @returns The rendered app shell.
 */
export default function App() {
  return (
    <>
      <h1 className="p-4 text-lg font-semibold">{APP_NAME}</h1>
      <UpdatePrompt />
    </>
  );
}
