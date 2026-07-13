import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "username required" }, { status: 400 });
  }

  try {
    // Fetch GitHub profile
    const profileRes = await fetch(`https://api.github.com/users/${username}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 3600 },
    });

    if (!profileRes.ok) {
      return NextResponse.json({ error: "GitHub user not found" }, { status: 404 });
    }

    const profile = await profileRes.json();

    // Fetch top repos
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?sort=stars&per_page=6`,
      {
        headers: { Accept: "application/vnd.github.v3+json" },
        next: { revalidate: 3600 },
      }
    );
    const repos = reposRes.ok ? await reposRes.json() : [];

    // Fetch recent events (up to 3 pages of 100) to build a contribution grid
    const eventCounts = {}; // { "YYYY-MM-DD": count }
    try {
      for (let page = 1; page <= 3; page++) {
        const evRes = await fetch(
          `https://api.github.com/users/${username}/events/public?per_page=100&page=${page}`,
          { headers: { Accept: "application/vnd.github.v3+json" }, next: { revalidate: 3600 } }
        );
        if (!evRes.ok) break;
        const events = await evRes.json();
        if (!Array.isArray(events) || events.length === 0) break;
        for (const ev of events) {
          const day = ev.created_at?.slice(0, 10);
          if (day) eventCounts[day] = (eventCounts[day] || 0) + 1;
        }
      }
    } catch (_) {}

    // Build a 36-week × 7-day activity grid (252 days back from today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDay = new Date(today);
    startDay.setDate(startDay.getDate() - (36 * 7 - 1));

    const contributionGrid = []; // 36 weeks × 7 days, each cell is level 0–4
    for (let w = 0; w < 36; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDay);
        date.setDate(startDay.getDate() + w * 7 + d);
        const key = date.toISOString().slice(0, 10);
        const count = eventCounts[key] || 0;
        const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4;
        week.push(level);
      }
      contributionGrid.push(week);
    }

    return NextResponse.json({
      name: profile.name,
      bio: profile.bio,
      avatar: profile.avatar_url,
      followers: profile.followers,
      following: profile.following,
      public_repos: profile.public_repos,
      location: profile.location,
      blog: profile.blog,
      company: profile.company,
      contributionGrid,
      repos: repos.map((r) => ({
        name: r.name,
        description: r.description,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        url: r.html_url,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
