"use client";

export type CheckboxListItem = {
  value: string;
  label: string;
};

type CheckboxListProps = {
  items: CheckboxListItem[];
  selectedValues: Set<string>;
  onToggle: (value: string) => void;
  emptyLabel?: string;
};

export function CheckboxList({
  items,
  selectedValues,
  onToggle,
  emptyLabel = "Tidak ada data.",
}: CheckboxListProps) {
  if (!items.length) {
    return <div className="px-1 py-2 text-sm text-gray-500">{emptyLabel}</div>;
  }

  return (
    <div className="space-y-1">
      {items.map((it) => {
        const checked = selectedValues.has(it.value);
        return (
          <label
            key={it.value}
            className="flex cursor-pointer select-none items-start gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(it.value)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-900">{it.label}</span>
          </label>
        );
      })}
    </div>
  );
}
