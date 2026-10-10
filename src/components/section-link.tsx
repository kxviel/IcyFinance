import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function SectionLink({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" className="section-link" onClick={onClick} disabled={disabled}>
      {children}
      <ArrowUpRight size={16} />
    </button>
  );
}
