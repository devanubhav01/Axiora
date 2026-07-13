import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "username required" }, { status: 400 });
  }

  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              username
              profile {
                realName
                ranking
                reputation
                starRating
                userAvatar
              }
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                  submissions
                }
              }
            }
          }
        `,
        variables: { username },
      }),
      next: { revalidate: 3600 },
    });

    const json = await res.json();
    const user = json?.data?.matchedUser;

    if (!user) {
      return NextResponse.json({ error: "LeetCode user not found" }, { status: 404 });
    }

    const stats = user.submitStats?.acSubmissionNum || [];
    const all = stats.find((s) => s.difficulty === "All") || {};
    const easy = stats.find((s) => s.difficulty === "Easy") || {};
    const medium = stats.find((s) => s.difficulty === "Medium") || {};
    const hard = stats.find((s) => s.difficulty === "Hard") || {};

    return NextResponse.json({
      username: user.username,
      realName: user.profile?.realName,
      ranking: user.profile?.ranking,
      avatar: user.profile?.userAvatar,
      totalSolved: all.count || 0,
      easySolved: easy.count || 0,
      mediumSolved: medium.count || 0,
      hardSolved: hard.count || 0,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
