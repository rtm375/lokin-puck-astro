import { useState, useRef, useEffect, type ReactNode } from "react";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "left" | "right" | "full";
  zIndex?: number;
}

export const Dropdown = ({
  trigger,
  children,
  className = "",
  contentClassName = "",
  isOpen: controlledOpen,
  onOpenChange,
  align = "left",
  zIndex = 50
}: DropdownProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (val: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(val);
    }
    onOpenChange?.(val);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const alignClasses = {
    left: "left-0",
    right: "right-0",
    full: "left-0"
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div
          className={`absolute top-full mt-1 bg-white border border-zinc-200 shadow-lg rounded min-w-full ${alignClasses[align]} ${contentClassName}`}
          style={{ zIndex }}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};
