/**
 * components/ui/ErrorMessage.tsx — Reusable Error Message Component
 *
 * Renders a styled error message. Returns null when message is null or empty —
 * safe to render unconditionally without wrapping in a conditional check.
 */

type ErrorMessageProps = {
  message: string | null;
};

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return <p className="text-lg font-bold text-red-500 mt-2.5">{message}</p>;
}
