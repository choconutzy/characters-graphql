'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface AssignedCharacter {
  id: number;
  name: string;
  image: string;
  status: string;
  species: string;
  type: string;
}

function readLocationData() {
  const assignments = JSON.parse(window.localStorage.getItem("character-location-assignments") ?? "{}");
  const details = JSON.parse(window.localStorage.getItem("character-location-details") ?? "{}");
  const grouped: Record<string, AssignedCharacter[]> = {};

  Object.entries(assignments as Record<string, string>).forEach(([id, location]) => {
    if (!grouped[location]) grouped[location] = [];
    const character = details[id] as AssignedCharacter | undefined;
    grouped[location].push(character ?? {
      id: Number(id), name: `Character #${id}`, image: "", status: "unknown", species: "unknown", type: "",
    });
  });
  return grouped;
}

export default function LocationsPage() {
  const initialLocationData = readLocationData();
  const [locationData, setLocationData] = useState<Record<string, AssignedCharacter[]>>(initialLocationData);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(() => Object.keys(initialLocationData)[0] ?? null);

  function refreshLocations() {
    try {
      const next = readLocationData();
      setLocationData(next);
      setSelectedLocation((current) => (current && next[current]) ? current : Object.keys(next)[0] ?? null);
    } catch {
      setLocationData({});
      setSelectedLocation(null);
    }
  }

  useEffect(() => {
    window.addEventListener("storage", refreshLocations);
    return () => window.removeEventListener("storage", refreshLocations);
  }, []);

  const locations = useMemo(() => Object.keys(locationData), [locationData]);
  const characters = selectedLocation ? locationData[selectedLocation] ?? [] : [];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8 lg:px-12">
      <section className="mx-auto mb-8 max-w-7xl overflow-hidden rounded-[2rem] border border-cyan-300/10 bg-gradient-to-br from-indigo-600 via-violet-700 to-cyan-600 p-8 shadow-2xl shadow-indigo-950/40 sm:p-12">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-100">Character directory</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Character <span className="text-cyan-200">By Location</span></h1>
        <p className="mt-4 max-w-xl text-indigo-100">Pilih location untuk melihat character yang sudah kamu assign.</p>
      </section>

      {locations.length === 0 ? (
        <section className="mx-auto max-w-3xl rounded-3xl border border-dashed border-white/20 bg-white/[0.04] px-6 py-20 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-3xl">⌖</div>
          <h2 className="text-2xl font-bold">Belum ada location</h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">Assign character ke location dari halaman detail character. Location akan tersimpan dan tetap tersedia setelah refresh.</p>
          <Link href="/" className="mt-7 inline-flex rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-3 font-semibold transition hover:brightness-110">Jelajahi characters</Link>
        </section>
      ) : (
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.06] p-3 shadow-xl shadow-black/20">
            <p className="px-3 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Locations · {locations.length}</p>
            <div className="space-y-1">
              {locations.map((location) => (
                <button key={location} onClick={() => setSelectedLocation(location)} className={`w-full rounded-2xl px-4 py-3 text-left transition ${selectedLocation === location ? "bg-gradient-to-r from-cyan-500 to-indigo-500 font-semibold shadow-lg shadow-indigo-950/40" : "text-slate-300 hover:bg-white/10"}`}>
                  <span className="block truncate">{location}</span>
                  <span className="text-xs opacity-70">{locationData[location].length} character{locationData[location].length === 1 ? "" : "s"}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/20 sm:p-7">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-cyan-300">Selected location</p>
                <h2 className="mt-1 text-3xl font-black">{selectedLocation}</h2>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">{characters.length} total</span>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {characters.map((character) => (
                <Link key={character.id} href={`/detail-char/${character.id}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 transition hover:-translate-y-1 hover:border-cyan-300/50">
                  <div className="relative aspect-square bg-slate-800">
                    {character.image && <Image unoptimized fill src={character.image} alt={character.name} className="object-cover transition duration-500 group-hover:scale-110" sizes="(max-width: 640px) 50vw, 20vw" />}
                  </div>
                  <div className="p-3"><p className="truncate font-semibold">{character.name}</p><p className="mt-1 text-xs text-slate-400">{character.species} · {character.status}</p></div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
