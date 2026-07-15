"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import useSWR from "swr";
import type { StopSearchEntry } from "@/lib/types";
import { searchStops } from "@/lib/stops/search-index";
import { fetchJson } from "@/lib/api";
import { Input } from "@/components/ui";
import { ro } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  onSelect: (stop: StopSearchEntry) => void;
  className?: string;
};

export function StopSearch({ onSelect, className }: Props) {
  const { data: index } = useSWR<StopSearchEntry[]>("/api/stops-index", fetchJson, {
    revalidateOnFocus: false,
  });
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!index || query.length < 2) return [];
    return searchStops(index, query);
  }, [index, query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = useCallback(
    (stop: StopSearchEntry) => {
      setQuery(stop.stop_name);
      setOpen(false);
      onSelect(stop);
    },
    [onSelect]
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <MagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          type="search"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-autocomplete="list"
          placeholder={ro.map.searchPlaceholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="pl-11"
        />
      </div>
      {open && query.length >= 2 && (
        <ul
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-2xl bg-card py-2 shadow-xl"
        >
          {results.length === 0 && (
            <li className="px-4 py-3 text-[14px] text-muted">{ro.map.noSearchResults}</li>
          )}
          {results.map((stop) => (
            <li key={stop.stop_id} role="option">
              <button
                type="button"
                className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-elevated"
                onClick={() => handleSelect(stop)}
              >
                <span className="text-[14px] font-medium text-foreground">{stop.stop_name}</span>
                <span className="text-[12px] text-muted">ID {stop.stop_id}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
