import { useEffect } from "react";

interface KeyboardNavigationOptions {
  onFocusInput?: () => void;
  onClear?: () => void;
  onSubmit?: () => void;
}

export function useKeyboardNavigation({
  onFocusInput,
  onClear,
  onSubmit,
}: KeyboardNavigationOptions): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Cmd/Ctrl+K: Focus input
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onFocusInput?.();
      }

      // Escape: Clear
      if (e.key === "Escape") {
        e.preventDefault();
        onClear?.();
      }

      // Cmd/Ctrl+Enter: Submit comparison
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        onSubmit?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onFocusInput, onClear, onSubmit]);
}
