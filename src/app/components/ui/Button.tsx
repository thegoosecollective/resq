/**
 * components/ui/Button.tsx — Reusable Button Component
 *
 * Accessible button with three variants: primary, danger, and outline.
 * Accepts an optional className prop for one-off overrides
 * 
 * Includes focus ring for keyboard navigation and disabled state styling.
 */

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "danger" | "outline";
  className?: string;
};

export default function Button({
  children,
  onClick,
  type = "button",
  disabled,
  variant = "primary",
  className,
}: ButtonProps) {
  const variants = {
    primary:
      "bg-blue-600 text-white border-2 border-blue-600 hover:bg-transparent hover:text-blue-600",
    danger:
      "bg-red-600 text-white border-2 border-red-600 hover:bg-transparent hover:text-red-600",
    outline:
      "bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer px-6 py-3 rounded-lg font-semibold transition-colors 
        disabled:opacity-50 disabled:cursor-not-allowed 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${variants[variant]} ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
