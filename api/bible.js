export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { book, chapter } = req.query;
  if (!book || !chapter) return res.status(400).json({ error: "book and chapter required" });
  try {
    const r = await fetch(`https://bible-api.com/${encodeURIComponent(book)}+${chapter}`);
    const data = await r.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch bible" });
  }
}
