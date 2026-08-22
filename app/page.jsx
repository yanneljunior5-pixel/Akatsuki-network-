"use client";

import { useState, useEffect, useCallback } from "react";

function useLocalApi(path, deps = []) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch(path);
      const json = await res.json();
      setData(json.data || []);
      setStatus("ready");
    } catch (e) {
      setStatus("error");
    }
  }, [path]);

  useEffect(() => {
    load();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, status, reload: load };
}

function LiveClock() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return null;
  return now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function Home() {
  const { data: episodes, status: epStatus, reload: reloadEp } = useLocalApi("/api/episodes");
  const { data: airing, status: airStatus } = useLocalApi("/api/airing");
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    setLastSync(new Date());
  }, [episodes]);

  useEffect(() => {
    const t = setInterval(() => reloadEp(), 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [reloadEp]);

  const tickerItems =
    episodes && episodes.length > 0
      ? episodes
          .slice(0, 10)
          .map((e) => `${e.entry?.title || "Titre inconnu"} — ${e.episodes?.[0]?.title || "Nouvel épisode"}`)
      : ["Connexion au flux en direct…"];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <span style={styles.brandDot} />
          AKATSUKI <span style={{ color: "#ff6b4a" }}>NETWORK</span>
        </div>
        <div style={styles.clock}>
          <span style={styles.liveDot} />
          EN DIRECT — <LiveClock />
        </div>
      </header>

      <div style={styles.tickerWrap}>
        <div style={styles.tickerLabel}>DERNIERS ÉPISODES</div>
        <div style={styles.tickerTrack}>
          <div style={styles.tickerScroll}>
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} style={styles.tickerItem}>
                {item} <span style={styles.tickerSep}>◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <section style={styles.hero}>
        <div style={styles.heroEyebrow}>ACTUALITÉS ANIME — FLUX TEMPS RÉEL</div>
        <h1 style={styles.heroTitle}>
          Chaque nouvel épisode,
          <br />
          au moment où il sort.
        </h1>
        <p style={styles.heroSub}>
          Contenu actualisé automatiquement, sans intervention manuelle.
          {lastSync ? ` Dernière synchro à ${lastSync.toLocaleTimeString("fr-FR")}.` : ""}
        </p>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHead}>
          <h2 style={styles.sectionTitle}>Épisodes récents</h2>
          <button style={styles.refreshBtn} onClick={() => reloadEp()}>
            ↻ Actualiser
          </button>
        </div>

        {epStatus === "loading" && <p style={styles.muted}>Chargement du flux…</p>}
        {epStatus === "error" && (
          <p style={styles.muted}>Impossible de joindre l'API en ce moment. Nouvelle tentative au prochain cycle.</p>
        )}

        <div style={styles.grid}>
          {episodes &&
            episodes.slice(0, 9).map((e, i) => (
              <a key={i} href={e.entry?.url} target="_blank" rel="noreferrer" style={styles.card}>
                <div style={styles.cardImgWrap}>
                  {e.entry?.images?.jpg?.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.entry.images.jpg.image_url} alt="" style={styles.cardImg} />
                  )}
                  <span style={styles.cardBadge}>NOUVEAU</span>
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardTitle}>{e.entry?.title}</div>
                  <div style={styles.cardEp}>{e.episodes?.[0]?.title || "Épisode disponible"}</div>
                </div>
              </a>
            ))}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Diffusions de la saison</h2>
        {airStatus === "loading" && <p style={styles.muted}>Chargement…</p>}
        <div style={styles.airingRow}>
          {airing &&
            airing.slice(0, 8).map((a, i) => (
              <a key={i} href={a.url} target="_blank" rel="noreferrer" style={styles.airingCard}>
                {a.images?.jpg?.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.images.jpg.image_url} alt="" style={styles.airingImg} />
                )}
                <div style={styles.airingTitle}>{a.title}</div>
              </a>
            ))}
        </div>
      </section>

      <footer style={styles.footer}>
        Akatsuki Network — données fournies par l'API Jikan (non affiliée à MyAnimeList officiellement).
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #12122b 0%, #1a1b3a 22%, #2b2454 48%, #5a3a5e 72%, #8a4a52 100%)",
    color: "#f5f0e8",
    fontFamily: "'Inter', sans-serif",
    paddingBottom: 48,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 28px",
    borderBottom: "1px solid rgba(245,240,232,0.12)",
  },
  brand: {
    fontFamily: "'Archivo Black', sans-serif",
    fontSize: 18,
    letterSpacing: "0.04em",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#d4a574",
    display: "inline-block",
  },
  clock: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    color: "#d8cfe0",
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 160,
    justifyContent: "flex-end",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#ff6b4a",
    display: "inline-block",
    animation: "pulse 1.4s infinite",
  },
  tickerWrap: {
    display: "flex",
    alignItems: "stretch",
    borderBottom: "1px solid rgba(245,240,232,0.12)",
    background: "rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  tickerLabel: {
    background: "#ff6b4a",
    color: "#1a1b3a",
    fontFamily: "'Archivo Black', sans-serif",
    fontSize: 11,
    letterSpacing: "0.06em",
    padding: "8px 14px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
  },
  tickerTrack: {
    overflow: "hidden",
    flex: 1,
    display: "flex",
    alignItems: "center",
  },
  tickerScroll: {
    display: "flex",
    whiteSpace: "nowrap",
    animation: "scrollTicker 30s linear infinite",
  },
  tickerItem: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    color: "#f5f0e8",
    padding: "8px 18px 8px 0",
  },
  tickerSep: {
    color: "#d4a574",
    marginLeft: 18,
  },
  hero: {
    padding: "64px 28px 40px",
    maxWidth: 760,
  },
  heroEyebrow: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    letterSpacing: "0.12em",
    color: "#d4a574",
    marginBottom: 18,
  },
  heroTitle: {
    fontFamily: "'Archivo Black', sans-serif",
    fontSize: "clamp(32px, 6vw, 56px)",
    lineHeight: 1.05,
    margin: "0 0 18px",
  },
  heroSub: {
    fontSize: 15,
    color: "#d8cfe0",
    lineHeight: 1.6,
    maxWidth: 560,
  },
  section: {
    padding: "24px 28px",
  },
  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  sectionTitle: {
    fontFamily: "'Archivo Black', sans-serif",
    fontSize: 22,
    margin: 0,
  },
  refreshBtn: {
    background: "transparent",
    border: "1px solid rgba(245,240,232,0.3)",
    color: "#f5f0e8",
    borderRadius: 20,
    padding: "8px 16px",
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    cursor: "pointer",
  },
  muted: {
    color: "#a89bc0",
    fontSize: 14,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 16,
  },
  card: {
    display: "block",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(245,240,232,0.1)",
    borderRadius: 10,
    overflow: "hidden",
    textDecoration: "none",
    color: "inherit",
  },
  cardImgWrap: {
    position: "relative",
    aspectRatio: "16/9",
    background: "rgba(0,0,0,0.3)",
  },
  cardImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  cardBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    background: "#ff6b4a",
    color: "#1a1b3a",
    fontFamily: "'Archivo Black', sans-serif",
    fontSize: 10,
    padding: "3px 8px",
    borderRadius: 4,
  },
  cardBody: {
    padding: "12px 14px",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cardEp: {
    fontSize: 12,
    color: "#a89bc0",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  airingRow: {
    display: "flex",
    gap: 14,
    overflowX: "auto",
    paddingBottom: 8,
  },
  airingCard: {
    flex: "0 0 130px",
    textDecoration: "none",
    color: "inherit",
  },
  airingImg: {
    width: 130,
    height: 180,
    objectFit: "cover",
    borderRadius: 8,
    display: "block",
    marginBottom: 8,
  },
  airingTitle: {
    fontSize: 12,
    lineHeight: 1.3,
    color: "#d8cfe0",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#7c6f92",
    padding: "32px 28px 0",
  },
};
