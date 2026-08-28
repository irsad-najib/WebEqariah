import type { ReactNode } from "react";

/** Bingkai papan LED bergaya masjid: hijau gelap dengan sempadan emas berganda. */
export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md border-2 border-amber-300/80 bg-gradient-to-b from-[#0f3b28] to-[#062117] p-[3px] shadow-lg shadow-black/30 ${className}`}
    >
      <div className="h-full rounded-sm border border-amber-200/40 px-2 py-1.5">
        {children}
      </div>
    </div>
  );
}
