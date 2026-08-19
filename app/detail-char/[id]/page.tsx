"use client"
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";

import Image from "next/image";
import { useQuery } from "@apollo/client/react";
import gql from "graphql-tag";
import { ICharacterResp } from "@/types";
import { decryptId } from "@/lib/idCrypto";

const GET_CHAR_BY_ID = gql`
  query GetCharacterById($id:ID!) {
    character(id:$id){
        id: id
        name
        status
        species
        type
        gender
        image
        created
        origin {
          id
          name
          type
          dimension
          created
        }
        location {
          id
          name
          type
        }
    }
  }
`;

function readAssignments(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const stored = localStorage.getItem("character-location-assignments");
  if (!stored) return {};

  try {
    return JSON.parse(stored) as Record<string, string>;
  } catch {
    localStorage.removeItem("character-location-assignments");
    return {};
  }
}

export default function Character(){
  const params = useParams<{ id: string }>()
  const characterId = decryptId(params.id);
  const [locationName, setLocationName] = useState("");
  const [assignmentMap, setAssignmentMap] = useState<Record<string, string>>(() => readAssignments());
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const { data, loading, error } = useQuery<ICharacterResp>(GET_CHAR_BY_ID, { 
    variables: { id: characterId },
  });

  const assignedLocation = assignmentMap[characterId] ?? readAssignments()[characterId] ?? null;

  function assignLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = locationName.trim();

    if (!name) {
      setMessageType("error");
      setMessage("Nama location wajib diisi.");
      return;
    }

    if (assignedLocation) {
      setMessageType("error");
      setMessage(`Character ini sudah berada di location ${assignedLocation}.`);
      return;
    }

    const stored = localStorage.getItem("character-location-assignments");
    let assignments: Record<string, string> = {};
    if (stored) {
      try {
        assignments = JSON.parse(stored) as Record<string, string>;
      } catch {
        assignments = {};
      }
    }

    const existingLocation = Object.values(assignments).find(
      (location) => location.toLowerCase() === name.toLowerCase(),
    );
    const canonicalName = existingLocation ?? name;
    assignments[characterId] = canonicalName;
    localStorage.setItem("character-location-assignments", JSON.stringify(assignments));
    if (data?.character) {
      const storedCharacters = localStorage.getItem("character-location-details");
      let characterDetails: Record<string, ICharacterResp["character"]> = {};
      if (storedCharacters) {
        try {
          characterDetails = JSON.parse(storedCharacters) as Record<string, ICharacterResp["character"]>;
        } catch {
          characterDetails = {};
        }
      }
      characterDetails[characterId] = data.character;
      localStorage.setItem("character-location-details", JSON.stringify(characterDetails));
    }
    setAssignmentMap(assignments);
    setLocationName("");
    setMessageType("success");
    setMessage(`Character berhasil di-assign ke ${canonicalName}.`);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8 lg:px-12">
      {loading && <p className="mx-auto max-w-5xl py-12 text-center text-slate-300">Loading character...</p>}
      {error && <p className="mx-auto max-w-5xl rounded-2xl bg-red-950/60 p-4 text-red-200">Character gagal dimuat.</p>}
      {data?.character && <>
        <section className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-cyan-300/10 bg-gradient-to-br from-indigo-600 via-violet-700 to-cyan-600 p-8 shadow-2xl shadow-indigo-950/40 sm:p-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-100">Character profile</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">{data.character.name}</h1>
          <p className="mt-3 text-indigo-100">Explore detail dan assign character ini ke location.</p>
        </section>

        <section className="mx-auto mt-6 grid max-w-5xl gap-6 lg:grid-cols-[280px_1fr]">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/30">
            <Image loading="eager" unoptimized fill src={data.character.image} alt={data.character.name} className="object-cover" sizes="280px" />
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/20 sm:p-8">
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-sm text-cyan-200">{data.character.status}</span>
              <span className="rounded-full bg-violet-400/15 px-3 py-1 text-sm text-violet-200">{data.character.species}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">{data.character.gender}</span>
            </div>
            <dl className="grid grid-cols-2 gap-5 text-sm">
              <div><dt className="text-slate-400">Type</dt><dd className="mt-1 font-semibold">{data.character.type || "Unknown"}</dd></div>
              <div><dt className="text-slate-400">Origin</dt><dd className="mt-1 font-semibold">{data.character.origin?.name || "Unknown"}</dd></div>
              {/* <div><dt className="text-slate-400">Current location</dt><dd className="mt-1 font-semibold">{data.character.location?.name || "Unknown"}</dd></div> */}
            </dl>
          </div>
        </section>

      <section className="mx-auto mt-6 max-w-5xl rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/20 sm:p-8">
        <h2 className="text-xl font-bold">Assign ke location</h2>
        <p className="mt-1 text-sm text-slate-400">Satu character hanya dapat memiliki satu location.</p>
        {assignedLocation ? (
          <p className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-emerald-200">Location saat ini: <strong>{assignedLocation}</strong></p>
        ) : (
          <form onSubmit={assignLocation} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="location-name" className="sr-only">Nama location</label>
            <input
              id="location-name"
              value={locationName}
              onChange={(event) => setLocationName(event.target.value)}
              placeholder="Nama location"
              className="flex-1 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
            />
            <button type="submit" className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-3 font-semibold transition hover:brightness-110">
              Assign
            </button>
          </form>
        )}
        {message && (
          <p role="status" className={`mt-4 rounded-xl px-4 py-3 text-sm ${messageType === "error" ? "bg-red-400/10 text-red-300" : "bg-emerald-400/10 text-emerald-300"}`}>
            {message}
          </p>
        )}
      </section>
      </>}
    </main>
  )
}
