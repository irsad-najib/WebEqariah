"use client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Suspense, useMemo, useState } from "react";
import type { Announcement, Kitab, Speaker } from "@/lib/types";
import { buildMonthGrid, toDateKey } from "@/lib/utils/calendarGrid";
import { useCalendarFilters } from "@/lib/hooks/useCalendarFilters";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BIDANG_ILMU_OPTIONS } from "@/lib/constants/bidangIlmu";
import { FilterGroup } from "@/components/features/calendar/FilterGroup";
import { CheckboxList } from "@/components/features/calendar/CheckboxList";
import { useCalendarData } from "@/lib/hooks/useCalendarData";

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CalendarPageInner />
    </Suspense>
  );
}

function CalendarPageInner() {
  const {
    state,
    monthDate,
    setQ,
    setBidangIlmu,
    toggleBidangIlmu,
    setSpeakerIds,
    toggleSpeakerId,
    setKitabIds,
    toggleKitabId,
    setMasjidIds,
    toggleMasjidId,
    shiftMonth,
  } = useCalendarFilters();

  const { speakers, kitabs, announcements, loading, error } = useCalendarData();

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [bidangIlmuSearch, setBidangIlmuSearch] = useState("");
  const [speakerSearch, setSpeakerSearch] = useState("");
  const [kitabSearch, setKitabSearch] = useState("");
  const [masjidSearch, setMasjidSearch] = useState("");

  const kitabById = useMemo(() => {
    const map = new Map<number, Kitab>();
    for (const k of kitabs || []) map.set(k.id, k);
    return map;
  }, [kitabs]);

  const speakerById = useMemo(() => {
    const map = new Map<number, Speaker>();
    for (const s of speakers || []) map.set(s.id, s);
    return map;
  }, [speakers]);

  const filteredEvents = useMemo(() => {
    const q = state.q.trim().toLowerCase();

    const selectedSpeakerIds = new Set(state.speakerIds);
    const selectedKitabIds = new Set(state.kitabIds);
    const selectedBidangIlmu = new Set(state.bidangIlmu);
    const selectedMasjidIds = new Set(state.masjidIds);

    const selectedSpeakerNames = new Set(
      state.speakerIds
        .map((id) => speakerById.get(id)?.name)
        .filter((v): v is string => Boolean(v))
        .map((v) => v.toLowerCase())
    );

    return (announcements || [])
      .filter(
        (a) =>
          (a?.type === "kajian" || !a?.type) && (a?.event_date || a?.eventDate)
      )
      .filter((a) => {
        if (!q) return true;
        const haystack = [
          a.title,
          a.speaker_name,
          a.speakerName,
          a.kitab_title,
          a.mosqueInfo?.name,
          (a as any)?.mosque?.mosqueName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .filter((a) => {
        if (selectedSpeakerIds.size === 0) return true;
        if (a.speaker_id != null) return selectedSpeakerIds.has(a.speaker_id);
        const name = (a.speaker_name || a.speakerName || "").toLowerCase();
        if (!name) return false;
        return selectedSpeakerNames.has(name);
      })
      .filter((a) => {
        if (selectedKitabIds.size === 0) return true;
        if (a.kitab_id == null) return false;
        return selectedKitabIds.has(a.kitab_id);
      })
      .filter((a) => {
        if (selectedMasjidIds.size === 0) return true;
        const masjidId = a.mosque_id || a.mosqueId || a.mosqueInfo?.id;
        if (!masjidId) return false;
        return selectedMasjidIds.has(masjidId);
      })
      .filter((a) => {
        if (selectedBidangIlmu.size === 0) return true;
        const kitabId = a.kitab_id;
        if (!kitabId) return false;
        const bidang = kitabById.get(kitabId)?.bidang_ilmu;
        return Boolean(bidang) && selectedBidangIlmu.has(bidang as string);
      });
  }, [
    announcements,
    kitabById,
    speakerById,
    state.bidangIlmu,
    state.kitabIds,
    state.masjidIds,
    state.q,
    state.speakerIds,
  ]);

  const eventsByDayKey = useMemo(() => {
    const map = new Map<string, Announcement[]>();
    for (const e of filteredEvents) {
      const raw = e.event_date || e.eventDate;
      if (!raw) continue;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) continue;
      const key = toDateKey(d);
      const prev = map.get(key) ?? [];
      prev.push(e);
      map.set(key, prev);
    }

    for (const [k, list] of map.entries()) {
      list.sort((a, b) => {
        const da = new Date(a.event_date || a.eventDate || "").getTime();
        const db = new Date(b.event_date || b.eventDate || "").getTime();
        return da - db;
      });
      map.set(k, list);
    }

    return map;
  }, [filteredEvents]);

  const grid = useMemo(() => buildMonthGrid(monthDate), [monthDate]);
  const monthLabel = useMemo(
    () =>
      monthDate.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      }),
    [monthDate]
  );

  const todayKey = useMemo(() => toDateKey(new Date()), []);

  const bidangIlmuItems = useMemo(() => {
    const s = bidangIlmuSearch.trim().toLowerCase();
    return BIDANG_ILMU_OPTIONS.filter((x) =>
      s ? x.toLowerCase().includes(s) : true
    ).map((x) => ({ value: x, label: x }));
  }, [bidangIlmuSearch]);

  const speakerItems = useMemo(() => {
    const s = speakerSearch.trim().toLowerCase();
    return (speakers || [])
      .filter((sp) => (s ? sp.name.toLowerCase().includes(s) : true))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((sp) => ({ value: String(sp.id), label: sp.name }));
  }, [speakers, speakerSearch]);

  const kitabItems = useMemo(() => {
    const s = kitabSearch.trim().toLowerCase();
    return (kitabs || [])
      .filter((k) => (s ? (k.judul ?? "").toLowerCase().includes(s) : true))
      .sort((a, b) => (a.judul ?? "").localeCompare(b.judul ?? ""))
      .map((k) => ({ value: String(k.id), label: k.judul }));
  }, [kitabs, kitabSearch]);

  const masjidItems = useMemo(() => {
    const s = masjidSearch.trim().toLowerCase();
    const masjidMap = new Map<number, { id: number; name: string }>();

    for (const a of announcements || []) {
      const id = a.mosque_id || a.mosqueId || a.mosqueInfo?.id;
      const name = a.mosqueInfo?.name || (a as any)?.mosque?.mosqueName;
      if (id && name && !masjidMap.has(id)) {
        masjidMap.set(id, { id, name });
      }
    }

    return Array.from(masjidMap.values())
      .filter((m) => (s ? m.name.toLowerCase().includes(s) : true))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((m) => ({ value: String(m.id), label: m.name }));
  }, [announcements, masjidSearch]);

  const selectedBidangIlmu = useMemo(
    () => new Set(state.bidangIlmu),
    [state.bidangIlmu]
  );
  const selectedSpeakerIds = useMemo(
    () => new Set(state.speakerIds.map(String)),
    [state.speakerIds]
  );
  const selectedKitabIds = useMemo(
    () => new Set(state.kitabIds.map(String)),
    [state.kitabIds]
  );
  const selectedMasjidIds = useMemo(
    () => new Set(state.masjidIds.map(String)),
    [state.masjidIds]
  );

  const filteredMonthEvents = useMemo(() => {
    const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
    return filteredEvents.filter((e) => {
      const raw = e.event_date || e.eventDate;
      if (!raw) return false;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return false;
      return d >= start && d < end;
    });
  }, [filteredEvents, monthDate]);

  const monthEventsByDayKey = useMemo(() => {
    const map = new Map<string, Announcement[]>();
    for (const e of filteredMonthEvents) {
      const raw = e.event_date || e.eventDate;
      if (!raw) continue;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) continue;
      const key = toDateKey(d);
      const prev = map.get(key) ?? [];
      prev.push(e);
      map.set(key, prev);
    }
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => {
        const da = new Date(a.event_date || a.eventDate || "").getTime();
        const db = new Date(b.event_date || b.eventDate || "").getTime();
        return da - db;
      });
      map.set(k, list);
    }
    return map;
  }, [filteredMonthEvents]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 xl:flex-row">
            {/* Sidebar (desktop) */}
            <aside className="hidden w-[320px] shrink-0 xl:block">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  Kalendar
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Tapis kajian berdasarkan bidang ilmu, ustadz, dan kitab.
                </p>

                <div className="mt-5 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Carian
                    </label>
                    <input
                      value={state.q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Cari judul, ustadz, masjid..."
                      className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <FilterGroup
                    title="Bidang Ilmu"
                    selectedCount={state.bidangIlmu.length}
                    searchValue={bidangIlmuSearch}
                    onSearchChange={setBidangIlmuSearch}
                    searchPlaceholder="Cari bidang ilmu...">
                    <CheckboxList
                      items={bidangIlmuItems}
                      selectedValues={selectedBidangIlmu}
                      onToggle={(value) => toggleBidangIlmu(value)}
                    />
                    {state.bidangIlmu.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setBidangIlmu([])}
                        className="mt-2 text-xs font-medium text-gray-600 hover:text-gray-900">
                        Clear bidang ilmu
                      </button>
                    ) : null}
                  </FilterGroup>

                  <FilterGroup
                    title="Ustadz"
                    selectedCount={state.speakerIds.length}
                    searchValue={speakerSearch}
                    onSearchChange={setSpeakerSearch}
                    searchPlaceholder="Cari ustadz...">
                    <CheckboxList
                      items={speakerItems}
                      selectedValues={selectedSpeakerIds}
                      onToggle={(value) => {
                        const id = Number.parseInt(value, 10);
                        if (Number.isFinite(id)) toggleSpeakerId(id);
                      }}
                      emptyLabel={
                        loading ? "Loading ustadz..." : "Tidak ada ustadz."
                      }
                    />
                    {state.speakerIds.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setSpeakerIds([])}
                        className="mt-2 text-xs font-medium text-gray-600 hover:text-gray-900">
                        Clear ustadz
                      </button>
                    ) : null}
                  </FilterGroup>

                  <FilterGroup
                    title="Kitab"
                    selectedCount={state.kitabIds.length}
                    searchValue={kitabSearch}
                    onSearchChange={setKitabSearch}
                    searchPlaceholder="Cari kitab...">
                    <CheckboxList
                      items={kitabItems}
                      selectedValues={selectedKitabIds}
                      onToggle={(value) => {
                        const id = Number.parseInt(value, 10);
                        if (Number.isFinite(id)) toggleKitabId(id);
                      }}
                      emptyLabel={
                        loading ? "Loading kitab..." : "Tidak ada kitab."
                      }
                    />
                    {state.kitabIds.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setKitabIds([])}
                        className="mt-2 text-xs font-medium text-gray-600 hover:text-gray-900">
                        Clear kitab
                      </button>
                    ) : null}
                  </FilterGroup>

                  <FilterGroup
                    title="Masjid"
                    selectedCount={state.masjidIds.length}
                    searchValue={masjidSearch}
                    onSearchChange={setMasjidSearch}
                    searchPlaceholder="Cari masjid...">
                    <CheckboxList
                      items={masjidItems}
                      selectedValues={selectedMasjidIds}
                      onToggle={(value) => {
                        const id = Number.parseInt(value, 10);
                        if (Number.isFinite(id)) toggleMasjidId(id);
                      }}
                      emptyLabel={
                        loading ? "Loading masjid..." : "Tidak ada masjid."
                      }
                    />
                    {state.masjidIds.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setMasjidIds([])}
                        className="mt-2 text-xs font-medium text-gray-600 hover:text-gray-900">
                        Clear masjid
                      </button>
                    ) : null}
                  </FilterGroup>
                </div>
              </div>
            </aside>

            {/* Calendar */}
            <section className="min-w-0 flex-1">
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-200 p-4">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {monthLabel}
                    </div>
                    <div className="mt-0.5 text-sm text-gray-600">
                      Menampilkan {filteredMonthEvents.length} acara (bulan ini)
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFiltersOpen(true)}
                      className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 xl:hidden">
                      Tapis
                    </button>
                    <button
                      type="button"
                      onClick={() => shiftMonth(-1)}
                      className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <ChevronLeft size={16} />
                      Sebelumnya
                    </button>
                    <button
                      type="button"
                      onClick={() => shiftMonth(1)}
                      className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Selanjutnya
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="p-8 text-gray-600">Loading kalender...</div>
                ) : error ? (
                  <div className="p-8 text-red-600">{error}</div>
                ) : (
                  <div className="p-4">
                    {/* Mobile: list view */}
                    <div className="md:hidden">
                      {filteredMonthEvents.length === 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
                          Tidak ada acara untuk bulan ini.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {Array.from(monthEventsByDayKey.entries())
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([dayKey, list]) => {
                              const [yy, mm, dd] = dayKey
                                .split("-")
                                .map((v) => Number.parseInt(v, 10));
                              const d = new Date(yy, (mm || 1) - 1, dd || 1);
                              const label = d.toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "2-digit",
                                month: "long",
                              });
                              const isToday = dayKey === todayKey;
                              return (
                                <div
                                  key={dayKey}
                                  className="rounded-xl border border-gray-200 bg-white p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold text-gray-900">
                                      {label}
                                    </div>
                                    {isToday ? (
                                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                                        Hari ini
                                      </span>
                                    ) : null}
                                  </div>
                                  <div className="mt-3 space-y-2">
                                    {list.map((ev) => {
                                      const t = ev.event_date || ev.eventDate;
                                      const dt = t ? new Date(t) : null;
                                      const time =
                                        dt && !Number.isNaN(dt.getTime())
                                          ? dt.toLocaleTimeString("id-ID", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          : "";
                                      return (
                                        <div
                                          key={ev.id}
                                          className="rounded-xl bg-green-50 px-3 py-2 text-sm text-gray-900 ring-1 ring-green-100">
                                          <div className="flex items-baseline justify-between gap-2">
                                            <div className="text-[11px] font-medium text-gray-600">
                                              {time || ""}
                                            </div>
                                            {(() => {
                                              const kitab =
                                                ev.kitab_id != null
                                                  ? kitabById.get(ev.kitab_id)
                                                  : undefined;
                                              const kitabTitle =
                                                kitab?.judul ||
                                                ev.kitab_title ||
                                                "";
                                              const bidang =
                                                kitab?.bidang_ilmu || "";
                                              const badge =
                                                bidang || kitabTitle;
                                              return badge ? (
                                                <div className="max-w-[60%] truncate rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-gray-700 ring-1 ring-gray-200">
                                                  {badge}
                                                </div>
                                              ) : null;
                                            })()}
                                          </div>

                                          <div className="mt-0.5 font-semibold leading-snug">
                                            {ev.title}
                                          </div>

                                          {ev.speaker_name || ev.speakerName ? (
                                            <div className="mt-1 text-xs text-gray-700">
                                              {ev.speaker_name ||
                                                ev.speakerName}
                                            </div>
                                          ) : null}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>

                    {/* Desktop/tablet: grid view */}
                    <div className="hidden md:block">
                      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-200 md:[--calendar-cell-height:150px] lg:[--calendar-cell-height:185px] xl:[--calendar-cell-height:210px]">
                        {/* Weekday header row (fixed height) */}
                        <div className="grid grid-cols-7 gap-px bg-gray-200">
                          {[
                            "Ahd",
                            "Isn",
                            "Sel",
                            "Rab",
                            "Kam",
                            "Jum",
                            "Sab",
                          ].map((d) => (
                            <div
                              key={d}
                              className="bg-white px-4 py-2 text-[11px] font-semibold tracking-wide text-gray-700">
                              {d}
                            </div>
                          ))}
                        </div>

                        {/* Day cells grid (tall rows) */}
                        <div className="grid grid-cols-7 gap-px bg-gray-200 [grid-auto-rows:var(--calendar-cell-height)]">
                          {grid.map((cell) => {
                            const dayEvents =
                              eventsByDayKey.get(cell.key) ?? [];
                            const isToday = cell.key === todayKey;
                            const showOutside = !cell.inCurrentMonth;

                            const maxEvents = 12;
                            const visibleEvents = dayEvents.slice(0, maxEvents);
                            const remaining =
                              dayEvents.length - visibleEvents.length;

                            return (
                              <div
                                key={cell.key}
                                className={
                                  "flex h-[var(--calendar-cell-height)] flex-col bg-white px-3 py-3 align-top transition " +
                                  (showOutside
                                    ? "bg-gray-50"
                                    : "hover:bg-gray-50 hover:shadow-sm") +
                                  (isToday
                                    ? " ring-2 ring-green-500 ring-inset bg-green-50/40"
                                    : "")
                                }>
                                <div className="flex items-start justify-between gap-2">
                                  <div
                                    className={
                                      "text-sm font-semibold leading-none " +
                                      (showOutside
                                        ? "text-gray-400"
                                        : "text-gray-900")
                                    }>
                                    {cell.date.getDate()}
                                  </div>
                                  {isToday ? (
                                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                                      Hari ini
                                    </span>
                                  ) : null}
                                </div>

                                <div className="mt-2 flex-1 overflow-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:thin]">
                                  <div className="space-y-2">
                                    {visibleEvents.map((ev) => {
                                      const t = ev.event_date || ev.eventDate;
                                      const dt = t ? new Date(t) : null;
                                      const time =
                                        dt && !Number.isNaN(dt.getTime())
                                          ? dt.toLocaleTimeString("id-ID", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          : "";

                                      const ustadz =
                                        ev.speaker_name || ev.speakerName || "";
                                      const kitab =
                                        ev.kitab_id != null
                                          ? kitabById.get(ev.kitab_id)
                                          : undefined;
                                      const kitabTitle =
                                        kitab?.judul || ev.kitab_title || "";
                                      const bidang = kitab?.bidang_ilmu || "";

                                      return (
                                        <div
                                          key={ev.id}
                                          className="rounded-xl bg-green-50 px-3 py-2 text-gray-900 ring-1 ring-green-100"
                                          title={ev.title}>
                                          <div className="flex items-baseline justify-between gap-2">
                                            <div className="text-[11px] font-medium text-gray-600">
                                              {time || ""}
                                            </div>
                                            {bidang || kitabTitle ? (
                                              <div className="max-w-[60%] truncate rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-gray-700 ring-1 ring-gray-200">
                                                {bidang || kitabTitle}
                                              </div>
                                            ) : null}
                                          </div>

                                          <div className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug">
                                            {ev.title}
                                          </div>

                                          {ustadz ? (
                                            <div className="mt-1 line-clamp-1 text-[12px] text-gray-700">
                                              {ustadz}
                                            </div>
                                          ) : null}

                                          {kitabTitle && bidang ? (
                                            <div className="mt-0.5 line-clamp-1 text-[11px] text-gray-600">
                                              {kitabTitle}
                                            </div>
                                          ) : null}
                                        </div>
                                      );
                                    })}

                                    {remaining > 0 ? (
                                      <div className="rounded-lg bg-white/80 px-2 py-1 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200">
                                        +{remaining} lainnya
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-gray-600">
                        Menampilkan {filteredEvents.length} acara (semua hasil
                        filter).
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Filters drawer (tablet/mobile) */}
        {filtersOpen && (
          <>
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 z-40 cursor-default bg-black/40"
            />
            <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-auto rounded-t-2xl bg-white p-4 shadow-2xl md:inset-y-0 md:left-0 md:right-auto md:bottom-auto md:max-h-none md:w-[380px] md:rounded-none md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    Tapis
                  </div>
                  <div className="text-xs text-gray-600">
                    Susun bidang ilmu, ustadz, dan kitab
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Tutup
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Pencarian
                  </label>
                  <input
                    value={state.q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari judul, ustadz, masjid..."
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="mt-5 space-y-5">
                  <FilterGroup
                    title="Bidang Ilmu"
                    selectedCount={state.bidangIlmu.length}
                    searchValue={bidangIlmuSearch}
                    onSearchChange={setBidangIlmuSearch}
                    searchPlaceholder="Cari bidang ilmu...">
                    <CheckboxList
                      items={bidangIlmuItems}
                      selectedValues={selectedBidangIlmu}
                      onToggle={(value) => toggleBidangIlmu(value)}
                    />
                    {state.bidangIlmu.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setBidangIlmu([])}
                        className="mt-2 text-xs font-medium text-gray-600 hover:text-gray-900">
                        Clear bidang ilmu
                      </button>
                    ) : null}
                  </FilterGroup>

                  <FilterGroup
                    title="Ustadz"
                    selectedCount={state.speakerIds.length}
                    searchValue={speakerSearch}
                    onSearchChange={setSpeakerSearch}
                    searchPlaceholder="Cari ustadz...">
                    <CheckboxList
                      items={speakerItems}
                      selectedValues={selectedSpeakerIds}
                      onToggle={(value) => {
                        const id = Number.parseInt(value, 10);
                        if (Number.isFinite(id)) toggleSpeakerId(id);
                      }}
                      emptyLabel={
                        loading ? "Loading ustadz..." : "Tidak ada ustadz."
                      }
                    />
                    {state.speakerIds.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setSpeakerIds([])}
                        className="mt-2 text-xs font-medium text-gray-600 hover:text-gray-900">
                        Clear ustadz
                      </button>
                    ) : null}
                  </FilterGroup>

                  <FilterGroup
                    title="Kitab"
                    selectedCount={state.kitabIds.length}
                    searchValue={kitabSearch}
                    onSearchChange={setKitabSearch}
                    searchPlaceholder="Cari kitab...">
                    <CheckboxList
                      items={kitabItems}
                      selectedValues={selectedKitabIds}
                      onToggle={(value) => {
                        const id = Number.parseInt(value, 10);
                        if (Number.isFinite(id)) toggleKitabId(id);
                      }}
                      emptyLabel={
                        loading ? "Loading kitab..." : "Tidak ada kitab."
                      }
                    />
                    {state.kitabIds.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setKitabIds([])}
                        className="mt-2 text-xs font-medium text-gray-600 hover:text-gray-900">
                        Clear kitab
                      </button>
                    ) : null}
                  </FilterGroup>

                  <FilterGroup
                    title="Masjid"
                    selectedCount={state.masjidIds.length}
                    searchValue={masjidSearch}
                    onSearchChange={setMasjidSearch}
                    searchPlaceholder="Cari masjid...">
                    <CheckboxList
                      items={masjidItems}
                      selectedValues={selectedMasjidIds}
                      onToggle={(value) => {
                        const id = Number.parseInt(value, 10);
                        if (Number.isFinite(id)) toggleMasjidId(id);
                      }}
                      emptyLabel={
                        loading ? "Loading masjid..." : "Tidak ada masjid."
                      }
                    />
                    {state.masjidIds.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setMasjidIds([])}
                        className="mt-2 text-xs font-medium text-gray-600 hover:text-gray-900">
                        Clear masjid
                      </button>
                    ) : null}
                  </FilterGroup>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
