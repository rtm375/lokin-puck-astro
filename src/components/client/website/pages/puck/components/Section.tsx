import { forwardRef, type ReactNode, type CSSProperties } from "react";

export type SectionProps = {
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
};

export const Section = forwardRef<HTMLDivElement, SectionProps>(
  ({ children, className, style = {} }, ref) => {
    return (
      <div
        className={`${className ? `${className}` : ""}`}
        style={{
          ...style,
        }}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);