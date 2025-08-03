import { supabase } from "./supabaseClient";

/**
 * Fetch mentions by keyword, platform, sentiment with filtering and order.
 * PUBLIC_INTERFACE
 */
export async function fetchMentions({
  keyword = "",
  platform = "",
  sentiment = "",
  limit = 20,
}) {
  let query = supabase
    .from("mentions")
    .select("*")
    .order("time", { ascending: false })
    .limit(limit);

  if (keyword) {
    // Search in text or author or by brand/keyword present in text.
    query = query.ilike("text", `%${keyword}%`);
  }
  if (platform) {
    query = query.eq("platform", platform);
  }
  if (sentiment) {
    query = query.eq("sentiment", sentiment);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Fetch the sentiment summary for current mentions.
 * PUBLIC_INTERFACE
 */
export function getSentimentSummary(mentions) {
  let positive = 0, neutral = 0, negative = 0;
  for (const m of mentions) {
    if (m.sentiment === "positive") positive++;
    else if (m.sentiment === "neutral") neutral++;
    else if (m.sentiment === "negative") negative++;
  }
  return {
    positive,
    neutral,
    negative,
    total: positive + neutral + negative,
  };
}

/**
 * Fetch trend series for a keyword.
 * PUBLIC_INTERFACE
 */
export async function fetchTrends({ keyword = "", platform = "", days = 7 }) {
  let since = new Date();
  since.setDate(since.getDate() - days);
  let query = supabase
    .from("trends")
    .select("*")
    .gte("timestamp", since.toISOString())
    .order("timestamp", { ascending: true })
    .limit(days * 3);

  if (keyword) {
    query = query.ilike("keyword", `%${keyword}%`);
  }
  if (platform) {
    query = query.eq("platform", platform);
  }

  const { data, error } = await query;
  if (error) throw error;
  // Map to [{score, timestamp}] and normalize
  return (
    data?.map((row) => ({
      score: Math.max(0, Math.min(1, Number(row.score))),
      timestamp: row.timestamp,
    })) || []
  );
}

/**
 * Subscribe to mentions changes (realtime).
 * PUBLIC_INTERFACE
 */
export function subscribeToMentions(callback) {
  return supabase
    .channel("mentions-db-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "mentions" },
      payload => {
        callback(payload.new || payload.old);
      }
    )
    .subscribe();
}

/**
 * Export mentions as CSV.
 * PUBLIC_INTERFACE
 */
export function mentionsToCSV(mentions) {
  if (!mentions || mentions.length === 0) return "";
  const keys = Object.keys(mentions[0]);
  const csv = [
    keys.join(","),
    ...mentions.map((row) =>
      keys
        .map((k) =>
          ("" + (row[k] ?? ""))
            .replace(/"/g, '""')
            .replace(/\n/g, " ")
        )
        .map((item) => `"${item}"`)
        .join(",")
    ),
  ].join("\n");
  return csv;
}

/**
 * Authentication - sign in with magic link.
 * PUBLIC_INTERFACE
 */
export async function loginWithMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return true;
}

/**
 * PUBLIC_INTERFACE - Logout
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}
