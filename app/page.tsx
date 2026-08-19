'use client';

import Image from "next/image";
import { useQuery } from "@apollo/client/react";
import gql from "graphql-tag";
import { ICharacter, ICharResp } from "@/types";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { encryptId } from "@/lib/idCrypto";


const GET_CHAR = gql`
  query GetCharacters($next:Int) {
    characters (page:$next) {
      info {
        count
        pages
        next
        prev
      }
      results {
        id
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
  }
`;
export default function Home() {
  const { data, loading, error, fetchMore } = useQuery<ICharResp>(GET_CHAR, {
    variables: { next : 1 },
  });
  const characters = data?.characters?.results ?? [];
  const nextPage = data?.characters?.info.next ?? null;
  const [loadingMore, setLoadingMore] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const nextPageRef = useRef(nextPage);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    nextPageRef.current = nextPage;
  }, [nextPage]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(([entry]) => {
      const page = nextPageRef.current;
      if (!entry.isIntersecting || loadingMoreRef.current || page === null) return;

      loadingMoreRef.current = true;
      setLoadingMore(true);
      fetchMore<{ characters: ICharResp["characters"] }>({
        variables: { next: page },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult?.characters) return previousResult;

          return {
            ...previousResult,
            characters: {
              ...fetchMoreResult.characters,
              results: [
                ...previousResult.characters.results,
                ...fetchMoreResult.characters.results,
              ],
            },
          };
        },
      })
        .catch(() => setToast("Gagal memuat karakter berikutnya. Silakan coba lagi."))
        .finally(() => {
          loadingMoreRef.current = false;
          setLoadingMore(false);
        });
    }, { rootMargin: "300px" });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchMore]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white [overflow-anchor:none] sm:px-8 lg:px-12">
      {toast && (
        <div role="alert" className="fixed right-4 top-4 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-red-400/30 bg-red-950/95 px-4 py-3 text-sm text-red-100 shadow-2xl shadow-red-950/40 backdrop-blur">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 font-bold">!</span>
          <span className="flex-1">{toast}</span>
          <button aria-label="Tutup notifikasi" onClick={() => setToast(null)} className="text-lg text-red-200 hover:text-white">×</button>
        </div>
      )}

      <section className="mx-auto mb-10 max-w-7xl overflow-hidden rounded-[2rem] border border-cyan-300/10 bg-gradient-to-br from-indigo-600 via-violet-700 to-cyan-600 p-8 shadow-2xl shadow-indigo-950/40 sm:p-12">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-100">Rick & Morty archive</p>
        <h1 className="max-w-2xl text-4xl font-black tracking-tight sm:text-6xl">Meet the <span className="text-cyan-200">characters</span>.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-indigo-100 sm:text-lg">Jelajahi seluruh karakter dari dimensi Rick and Morty. Scroll ke bawah untuk memuat lebih banyak.</p>
        <div className="mt-8 flex items-center gap-3 text-sm text-indigo-100">
          <span className="rounded-full bg-white/15 px-4 py-2 backdrop-blur">{data?.characters.info.count ?? "—"} characters</span>
          <span className="rounded-full bg-white/15 px-4 py-2 backdrop-blur">Infinite scroll</span>
        </div>
        <Link href="/locations" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-indigo-700 transition hover:bg-cyan-100">View by location →</Link>
      </section>

      {loading && characters.length === 0 && <p className="mx-auto max-w-7xl py-10 text-center text-slate-300">Loading characters...</p>}
      {characters.length > 0 && (
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {characters.map((character: ICharacter) => (
            <Link key={character.id} href={`/detail-char/${encryptId(character.id)}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/50 hover:bg-white/[0.12] hover:shadow-cyan-950/50">
              <div className="relative aspect-square overflow-hidden bg-slate-800">
                <Image loading="eager" unoptimized fill src={character.image} alt={character.name} className="object-cover transition duration-500 group-hover:scale-110" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>
              <div className="p-4">
                <p className="truncate font-bold text-white">{character.name}</p>
                <p className="mt-1 text-xs capitalize text-slate-400">{character.species} · {character.status}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      <div ref={sentinelRef} aria-hidden="true" className="h-10" />
      {loadingMore && <p className="py-6 text-center text-sm text-cyan-200">Loading more characters...</p>}
    </main>
  );
}
