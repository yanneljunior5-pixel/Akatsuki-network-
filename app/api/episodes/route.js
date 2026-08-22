export const revalidate = 900;

async function fetchWithRetry(url, retries = 2, delayMs = 1000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { next: { revalidate: 900 } });
      if (res.ok) {
        return await res.json();
      }
      // Si erreur serveur (5xx), on retente ; sinon on arrête tout de suite
      if (res.status < 500) {
        throw new Error(`Jikan HTTP ${res.status}`);
      }
    } catch (err) {
      if (i === retries) throw err;
    }
    // Attendre avant de réessayer
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error("Toutes les tentatives ont échoué");
}

export async function GET() {
  try {
    const json = await fetchWithRetry("https://api.jikan.moe/v4/watch/episodes");
    return Response.json({ data: json.data || [] });
  } catch (err) {
    return Response.json({ data: [], error: "fetch_failed" }, { status: 200 });
  }
}
