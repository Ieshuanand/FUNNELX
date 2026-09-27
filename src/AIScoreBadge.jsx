import React, { useState, useEffect } from "react";

/**
 * AIScoreBadge — FunnelX Agentic System
 * Calls the backend scorer at http://localhost:8001/score
 * Displays tier (HOT/WARM/COLD) with cyberpunk styling.
 */

const AIScoreBadge = ({ lead }) => {
  const [score, setScore] = useState(null);
  const [tier, setTier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        setLoading(true);
        setError(false);

        const payload = {
          follower_count: lead.followers || 0,
          engagement_rate: lead.engagement_rate || 0,
          post_frequency: lead.post_frequency || 0,
          has_website: lead.has_website || 0,
          bio_word_count: lead.bio_word_count || 0,
          mentions_business: lead.mentions_business || 0,
          profile_completeness: lead.profile_completeness || 0,
        };

        // FIXED: Port changed from 8000 to 8001
        const res = await fetch("http://localhost:8001/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        setScore(data.conversion_score);
        setTier(data.tier);
      } catch (err) {
        console.error("Score fetch failed:", err);
        setError(true);
        // Graceful fallback
        setScore(0);
        setTier("COLD");
      } finally {
        setLoading(false);
      }
    };

    if (lead) fetchScore();
  }, [lead?.id]);

  const tierStyles = {
    HOT: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
    WARM: "bg-amber-500/20 text-amber-400 border-amber-500/50",
    COLD: "bg-slate-500/20 text-slate-400 border-slate-500/50",
  };

  if (loading) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border border-cyan-500/30 text-cyan-400 animate-pulse">
        SCORING...
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${
        tierStyles[tier] || tierStyles.COLD
      }`}
      title={error ? "Backend unreachable — showing fallback" : "AI conversion score"}
    >
      {error && <span className="mr-1 text-red-400">⚠</span>}
      {tier} {Number(score).toFixed(1)}
      {/* FIXED: .toFixed(1) prevents 15.600000000000001 */}
    </span>
  );
};

export default AIScoreBadge;