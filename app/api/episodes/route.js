export const revalidate = 900;

export async function GET() {
  try {
    const res = await fetch("https://api.jikan.moe/v4/watch/episodes", {
      next: { revalidate: 900 },
    });
    if (!res.ok) throw new Error(`Jikan HTTP ${res.status}`);
    const json = await res.json();
    return Response.json({ data: json.data || [] });
  } catch (err) {
    return Response.json({ data: [], error: "fetch_failed" }, { status: 200 });
  }
}
