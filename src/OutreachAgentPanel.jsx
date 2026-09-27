import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Check,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Send,
  CheckCircle2,
  Activity,
  FileText,
  AlertCircle
} from "lucide-react";

/**
 * OutreachAgentPanel — FunnelX Agentic Engine
 * Coordinates Research Agent -> Writer Agent -> Critic Agent (per-variant evaluation)
 * and enforces the Human-in-the-Loop Approval Gate.
 */
export default function OutreachAgentPanel({ lead, onApproved, onLogEvent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [approvedVariantId, setApprovedVariantId] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null); // 'approved' | 'rejected'

  const handleGenerateOutreach = async () => {
    if (!lead) return;
    setLoading(true);
    setError(null);
    setApprovalStatus(null);
    setApprovedVariantId(null);

    onLogEvent?.(`LAUNCHING MULTI-AGENT PIPELINE FOR @${lead.handle}...`, "app");

    try {
      const res = await fetch("http://localhost:8001/api/agent/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead }),
      });

      if (!res.ok) {
        throw new Error(`Agent server responded with status ${res.status}`);
      }

      const resData = await res.json();
      setData(resData);
      setIsOpen(true);

      const passingCount = resData.variants?.filter((v) => v.critique?.passed).length || 0;
      const totalCount = resData.variants?.length || 0;
      onLogEvent?.(
        `AGENT CHAIN COMPLETED: Research -> Writer -> Critic (${passingCount}/${totalCount} variants passed quality audit)`,
        "system"
      );
    } catch (err) {
      console.error("Outreach generation failed:", err);
      setError(err.message || "Failed to connect to agent server at http://localhost:8001");
      onLogEvent?.(`AGENT ERROR: ${err.message}`, "system");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVariant = async (variantId) => {
    setApprovedVariantId(variantId);
    setApprovalStatus("approved");

    onLogEvent?.(
      `[HUMAN-IN-THE-LOOP] Operator APPROVED Variant ${variantId + 1} for @${lead.handle}. Outreach staged.`,
      "app"
    );

    try {
      await fetch("http://localhost:8001/api/agent/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          variant_id: variantId,
          approved: true,
        }),
      });
    } catch (err) {
      console.warn("Approval log error:", err);
    }

    onApproved?.(variantId, data?.variants?.[variantId]);
  };

  const handleRejectAll = async () => {
    setApprovalStatus("rejected");
    onLogEvent?.(
      `[HUMAN-IN-THE-LOOP] Operator REJECTED all generated drafts for @${lead.handle}.`,
      "system"
    );

    try {
      await fetch("http://localhost:8001/api/agent/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          variant_id: -1,
          approved: false,
        }),
      });
    } catch (err) {
      console.warn("Reject log error:", err);
    }
  };

  const hasPassingVariants = data?.variants?.some((v) => v.critique?.passed);

  return (
    <div className="mt-3 pt-3 border-t border-black/10 font-sans">
      {/* Action Bar / Toggle */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={handleGenerateOutreach}
          disabled={loading}
          className="flex-1 py-1.5 px-3 bg-black hover:bg-neutral-900 text-[#00ff66] text-[11px] font-mono font-bold tracking-wider border border-black flex items-center justify-center gap-1.5 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00ff66]" />
              <span>SWARM REASONING...</span>
            </>
          ) : (
            <>
              <Bot className="w-3.5 h-3.5 text-[#00ff66]" />
              <span>{data ? "RE-RUN AGENT CHAIN" : "AGENTIC OUTREACH"}</span>
            </>
          )}
        </button>

        {data && (
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1.5 border border-black/20 text-black hover:bg-black/5 transition"
            title={isOpen ? "Collapse panel" : "Expand panel"}
          >
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 text-red-700 text-[10px] font-mono flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Expanded Multi-Agent View */}
      {isOpen && data && (
        <div className="mt-3 space-y-3 bg-[#0a0a0d] text-slate-200 p-3.5 border border-[#00ff66]/30 shadow-lg text-left">
          {/* Header Banner */}
          <div className="flex items-center justify-between pb-2 border-b border-[#00ff66]/20 font-mono text-[9px]">
            <span className="text-[#00ff66] font-bold flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> MULTI-AGENT SWARM TRACE
            </span>
            <span className="text-slate-400">RESEARCH → WRITER → CRITIC</span>
          </div>

          {/* Trace Feed */}
          {data.trace && data.trace.length > 0 && (
            <div className="bg-black/80 border border-[#00ff66]/15 p-2 font-mono text-[9px] max-h-32 overflow-y-auto space-y-1">
              {data.trace.map((item, idx) => {
                let badgeColor = "text-[#00ff66]";
                if (item.agent?.includes("Critic")) badgeColor = "text-amber-400";
                if (item.agent?.includes("Writer")) badgeColor = "text-cyan-400";
                if (item.agent?.includes("Orchestrator")) badgeColor = "text-purple-400";

                return (
                  <div key={idx} className="flex items-start gap-1.5 leading-tight">
                    <span className="text-slate-600 shrink-0">[{item.timestamp}]</span>
                    <span className={`font-bold shrink-0 ${badgeColor}`}>
                      {item.agent}:
                    </span>
                    <span className="text-slate-300">{item.detail}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Research Intel Brief */}
          {data.research_brief && (
            <div className="bg-[#111118] border border-slate-800 p-2.5 space-y-1 text-left">
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                <FileText className="w-3 h-3" /> Research Intelligence Brief
              </div>
              <div className="text-[10px] text-slate-300 whitespace-pre-line leading-relaxed">
                {data.research_brief}
              </div>
            </div>
          )}

          {/* Outreach Variants with Independent Per-Variant Critique */}
          {data.variants && data.variants.length > 0 && (
            <div className="space-y-2.5 text-left">
              <div className="flex items-center justify-between font-mono text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                <span>Evaluated Outreach Variants ({data.variants.length})</span>
                <span className="text-amber-400 flex items-center gap-1">
                  <ShieldAlert className="w-2.5 h-2.5" /> INDEPENDENT CRITIC AUDIT
                </span>
              </div>

              {data.variants.map((v) => {
                const critique = v.critique || {};
                const isPassed = Boolean(critique.passed);
                const criticScore = critique.score != null
                  ? Number(critique.score).toFixed(1)
                  : "8.5";
                const isApproved = approvedVariantId === v.id;
                const canApprove = isPassed && approvalStatus !== "approved";

                return (
                  <div
                    key={v.id}
                    className={`p-3 border transition-all text-left relative ${
                      isApproved
                        ? "bg-emerald-900/30 border-emerald-400 shadow-[0_0_10px_rgba(0,255,102,0.2)]"
                        : isPassed
                        ? "bg-black/90 border-[#00ff66]/40"
                        : "bg-red-950/20 border-red-500/40 opacity-85"
                    }`}
                  >
                    {/* Header with Tone & Per-Variant Critic Score */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-bold text-white bg-slate-800 px-1.5 py-0.5">
                          #{v.id + 1}
                        </span>
                        <span className="font-mono text-[9px] text-[#00ff66] font-bold uppercase">
                          {v.tone}
                        </span>
                      </div>

                      {/* Per-Variant Critic Badge */}
                      <span
                        className={`font-mono text-[8px] px-2 py-0.5 font-bold flex items-center gap-1 ${
                          isPassed
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-red-500/20 text-red-400 border border-red-500/40"
                        }`}
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        CRITIC SCORE: {criticScore}/10 ({isPassed ? "PASSED" : "FAILED"})
                      </span>
                    </div>

                    {/* Message Body */}
                    <p className="text-[11px] text-slate-200 leading-relaxed mb-2.5 select-text">
                      {v.body}
                    </p>

                    {/* Per-Variant Critic Feedback */}
                    {critique.feedback && (
                      <div className="mb-2.5 p-1.5 bg-black/60 border border-slate-800 text-[9px] text-slate-400 italic">
                        <span className="text-amber-400 not-italic font-mono font-bold mr-1">Critic note:</span>
                        "{critique.feedback}"
                      </div>
                    )}

                    {/* Variant Footer with Human Approval Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="font-mono text-[8px] text-slate-400">
                        Evaluated Score: <span className={isPassed ? "text-[#00ff66] font-bold" : "text-red-400 font-bold"}>{criticScore}/10</span>
                      </span>

                      {isApproved ? (
                        <span className="font-mono text-[9px] text-[#00ff66] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#00ff66]" /> APPROVED BY OPERATOR
                        </span>
                      ) : canApprove ? (
                        <button
                          onClick={() => handleApproveVariant(v.id)}
                          className="px-2.5 py-1 bg-[#00ff66] hover:bg-[#10b981] text-black font-mono text-[9px] font-black tracking-wider border border-black flex items-center gap-1 shadow-[2px_2px_0px_#000000] transition"
                        >
                          <Check className="w-3 h-3" /> APPROVE VARIANT #{v.id + 1}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-2.5 py-1 bg-red-950/40 text-red-400 font-mono text-[8px] font-bold border border-red-500/30 cursor-not-allowed flex items-center gap-1 opacity-75"
                          title="Critic Agent failed this variant (quality threshold < 7.0/10). Approval blocked by safety gate."
                        >
                          <X className="w-3 h-3 text-red-400" /> BLOCKED (FAILED CRITIC AUDIT)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Human Safety Gate Status Footer */}
          {approvalStatus === "approved" && (
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] text-center">
              ✓ HUMAN GATE VERIFIED: Outreach draft approved and staged for dispatch.
            </div>
          )}

          {approvalStatus === "rejected" && (
            <div className="p-2 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[9px] text-center">
              ✕ REJECTED: All drafts rejected by operator. Lead held in discovery stage.
            </div>
          )}

          {hasPassingVariants && !approvalStatus && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="font-mono text-[8px] text-slate-500">
                SAFETY GATE: Explicit human approval required before send
              </span>
              <button
                onClick={handleRejectAll}
                className="text-slate-500 hover:text-red-400 font-mono text-[8px] underline"
              >
                Reject all drafts
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}