export const revalidate = 3600;

async function fetchWithRetry(url, retries = 2, delayMs = 1000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (res.ok) {
        return await res.json();
      }
      if (res.status < 500) {
        throw new Error(`Jikan HTTP ${res.status}`);
      }
    } catch (err) {
      if (i === retries) throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error("Toutes les tentatives ont échoué");
}

export async function GET() {
  try {
    const json = await fetchWithRetry(
      "https://api.jikan.moe/v4/seasons/now?filter=tv&limit=8"
    );
    return Response.json({ data: json.data || [] });
  } catch (err) {
    return Response.json({ data: [], error: "fetch_failed" }, { status: 200 });
  }
}
