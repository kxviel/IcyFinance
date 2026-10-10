import type { ReactNode } from "react";

type PageHeadingProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

const descriptions: Record<string, string> = {
  Overview: "A little clarity for your everyday finances.",
  Budget: "Give every bit of your money a purpose.",
  Transactions: "The details behind your day-to-day.",
  Accounts: "Your balances, all in one place.",
  Targets: "Make room for what matters next.",
  Reports: "A clearer picture of where your money goes.",
  Settings: "Your workspace, just the way you need it.",
};

export function PageHeading({ title, description, actions }: PageHeadingProps) {
  return (
    <div className="page-heading print:pt-0">
      <div className="min-w-0">
        <span className="eyebrow pixel-label">Personal finance / {title}</span>
        <h1>{title}</h1>
        {(description ?? descriptions[title]) && (
          <p className="page-description">{description ?? descriptions[title]}</p>
        )}
      </div>
      {actions && <div className="heading-actions print:hidden">{actions}</div>}
    </div>
  );
}
