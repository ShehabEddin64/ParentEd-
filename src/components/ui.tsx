import type { ReactNode } from "react";
import { ArrowUpRight, Sprout, BookOpen, Compass } from "lucide-react";
export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}
export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}
export function Art({
  variant = 0,
  large = false,
}: {
  variant?: number;
  large?: boolean;
}) {
  const Icon = [Sprout, Compass, BookOpen][variant % 3];
  return (
    <div
      className={`art art-${variant % 3} ${large ? "art-large" : ""}`}
      aria-hidden="true"
    >
      <div className="art-orbit" />
      <div className="paper paper-back" />
      <div className="paper">
        <Icon strokeWidth={1.3} />
        <span />
        <span />
        <span />
      </div>
      <div className="art-dot" />
      <div className="art-star">✳</div>
    </div>
  );
}
export function External({
  url,
  children,
}: {
  url: string;
  children: ReactNode;
}) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="text-link">
      {children}
      <ArrowUpRight size={16} />
      <span className="sr-only"> (nouvel onglet)</span>
    </a>
  );
}
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
