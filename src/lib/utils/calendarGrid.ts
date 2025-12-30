export type CalendarCell = {
  date: Date;
  inCurrentMonth: boolean;
  key: string; // YYYY-MM-DD (local)
};

const pad2 = (n: number) => String(n).padStart(2, "0");

export const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

export function buildMonthGrid(monthDate: Date): CalendarCell[] {
  const firstOfMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth(),
    1
  );
  const lastOfMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0
  );

  // Start on Sunday (0) to Saturday (6)
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({
      date: d,
      inCurrentMonth:
        d.getFullYear() === firstOfMonth.getFullYear() &&
        d.getMonth() === firstOfMonth.getMonth(),
      key: toDateKey(d),
    });
  }

  // Ensure it covers month end (rare edge cases), else extend to 49 cells
  const lastKey = cells[cells.length - 1]?.date;
  if (lastKey && lastKey < lastOfMonth) {
    const extraStart = new Date(cells[cells.length - 1].date);
    extraStart.setDate(extraStart.getDate() + 1);
    for (let i = 0; i < 7; i++) {
      const d = new Date(extraStart);
      d.setDate(extraStart.getDate() + i);
      cells.push({
        date: d,
        inCurrentMonth:
          d.getFullYear() === firstOfMonth.getFullYear() &&
          d.getMonth() === firstOfMonth.getMonth(),
        key: toDateKey(d),
      });
    }
  }

  return cells;
}
