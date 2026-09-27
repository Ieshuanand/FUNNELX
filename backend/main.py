"""
FunnelX Backend — Agentic Multi-Agent Server
Port: 8001 (Flask + Flask-CORS)
"""

import os
import json
import random
import string
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Load .env file from backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from agents import (
    orchestrator,
    compute_lead_score,
    get_gemini_api_key,
    call_gemini_with_tools,
    generate_ishu_chat_reply,
    generate_document_pdf_data,
    generate_business_plan_data,
    is_document_or_pdf_request
)
from pdf_generator import create_document_pdf, create_business_plan_pdf

app = Flask(__name__, static_folder="static")
CORS(app, resources={r"/*": {"origins": "*"}})

# In-memory session stores
_leads_store = {}
_approvals_log = []

# Mock pools for realistic lead extraction
NAMES = [
    "Alex Vance", "Elena Rostova", "Marcus Chen", "Sophia Taylor",
    "Liam Gallagher", "Zara Patel", "David Miller", "Chloe Dubois",
    "Kenji Sato", "Maya Lin", "Julian Thorne", "Amara Okafor"
]
HANDLES = [
    "vance_growth", "elena_ai", "marcus_scale", "sophia_dtc",
    "liam_saas", "zara_ventures", "miller_b2b", "chloe_creative",
    "kenji_tech", "maya_design", "thorne_ops", "amara_fintech"
]
BIOS = [
    "Scaling B2B SaaS pipelines with autonomous AI agents. DM for partnership ops.",
    "Founder @ ScaleEngine. Helping creators build 7-figure recurring revenue.",
    "Growth architect & angel investor. Obsessed with high-converting client funnels.",
    "Building modern DTC e-commerce tech stacks. Open for strategic advisory.",
    "B2B Demand Gen & cold outreach strategist. Turning cold leads into booked calls.",
    "Engineering next-gen UI/UX and web automation workflows for enterprise teams."
]
NICHES = [
    "SaaS Growth", "AI Engineering", "Digital Marketing",
    "E-Commerce Tech", "B2B Automation", "Product Design"
]
LOCATIONS = [
    "San Francisco, CA", "New York, NY", "London, UK",
    "Berlin, Germany", "Toronto, Canada", "Austin, TX", "Singapore"
]


# ───────────────────────────────────────────────────────────────
# Health Endpoint
# ───────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
@app.route("/health", methods=["GET"])
def health():
    key = get_gemini_api_key()
    return jsonify({
        "status": "online",
        "service": "FunnelX Agentic Engine",
        "port": 8001,
        "api_key_configured": bool(key),
        "llm_provider": "gemini-2.5-flash" if key else "heuristic_multi_agent",
        "timestamp": datetime.now().isoformat()
    })


# ───────────────────────────────────────────────────────────────
# Lead Extraction Endpoint (/api/extract-leads)
# ───────────────────────────────────────────────────────────────

@app.route("/api/extract-leads", methods=["POST"])
def extract_leads():
    """
    Extracts / Synthesizes B2B leads based on search query, platform, and follower range.
    Uses Gemini tool-calling when API key is available, with structured heuristic fallback.
    """
    data = request.get_json(force=True, silent=True) or {}
    hashtag = data.get("hashtag", "#marketing, #saas")
    platform = data.get("platform", "Instagram")
    follower_limit = int(data.get("follower_limit", 50000))
    region = data.get("region", "GLOBAL_REDUNDANT")
    count = int(data.get("count", 6))

    tags_list = [t.strip().lstrip("#") for t in hashtag.split(",") if t.strip()]
    if not tags_list:
        tags_list = ["marketing", "growth"]

    leads = []

    # Attempt Gemini tool calling if API key exists
    gemini_key = get_gemini_api_key()
    if gemini_key:
        tool_decl = [{
            "name": "return_leads",
            "description": "Returns extracted structured B2B leads.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "leads": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "name": {"type": "STRING"},
                                "handle": {"type": "STRING"},
                                "niche": {"type": "STRING"},
                                "bio": {"type": "STRING"},
                                "location": {"type": "STRING"},
                                "followers": {"type": "INTEGER"},
                                "engagement_rate": {"type": "STRING"},
                                "email": {"type": "STRING"},
                                "score": {"type": "INTEGER"}
                            },
                            "required": ["name", "handle", "niche", "bio", "followers", "score"]
                        }
                    }
                },
                "required": ["leads"]
            }
        }]

        prompt = (
            f"Generate {count} realistic, high-ticket B2B creator/founder leads on {platform} "
            f"matching tags: {', '.join(tags_list)} with follower range up to {follower_limit:,} in region {region}."
        )

        fn_call = call_gemini_with_tools(
            system_instruction="You are FunnelX Data Extraction Agent. Return structured leads using return_leads.",
            prompt=prompt,
            tool_declarations=tool_decl,
            forced_function_name="return_leads"
        )

        if fn_call and "args" in fn_call:
            raw_leads = fn_call["args"].get("leads", [])
            for item in raw_leads[:count]:
                lead_id = f"lead_{''.join(random.choices(string.ascii_lowercase + string.digits, k=6))}"
                handle = item.get("handle", "").lstrip("@")
                leads.append({
                    "id": lead_id,
                    "name": item.get("name", "B2B Founder"),
                    "handle": handle,
                    "platform": platform,
                    "niche": item.get("niche", tags_list[0].capitalize()),
                    "engagement_rate": str(item.get("engagement_rate", f"{random.uniform(3.0, 7.5):.1f}%")),
                    "bio": item.get("bio", "Scaling high-performance B2B operations."),
                    "email": item.get("email") or f"{handle}@leadflow.io",
                    "location": item.get("location", random.choice(LOCATIONS)),
                    "followers": int(item.get("followers", random.randint(5000, follower_limit))),
                    "score": int(item.get("score", random.randint(72, 98))),
                    "status": "Discovered",
                    "tags": tags_list[:2],
                    "lastActive": datetime.now().isoformat()
                })

    # Heuristic synthesis if Gemini was skipped or returned empty
    if not leads:
        for i in range(count):
            lead_id = f"lead_{''.join(random.choices(string.ascii_lowercase + string.digits, k=6))}"
            name = random.choice(NAMES)
            handle = random.choice(HANDLES) + str(random.randint(10, 99))
            niche = random.choice(NICHES)
            followers = random.randint(3500, max(follower_limit, 10000))
            eng_float = round(random.uniform(0.025, 0.082), 3)

            score_data = compute_lead_score(
                follower_count=followers,
                engagement_rate=eng_float,
                mentions_business=1,
                has_website=1
            )

            lead = {
                "id": lead_id,
                "name": name,
                "handle": handle,
                "platform": platform,
                "niche": niche,
                "engagement_rate": f"{eng_float * 100:.1f}%",
                "bio": random.choice(BIOS),
                "email": f"{handle.replace('@', '')}@outbound.co",
                "location": random.choice(LOCATIONS),
                "followers": followers,
                "score": int(score_data["conversion_score"]),
                "status": "Discovered",
                "tags": tags_list[:2],
                "lastActive": datetime.now().isoformat()
            }
            _leads_store[lead_id] = lead
            leads.append(lead)

    return jsonify(leads)


# ───────────────────────────────────────────────────────────────
# Multi-Agent Orchestration Endpoint (/api/agent/orchestrate)
# ───────────────────────────────────────────────────────────────

@app.route("/api/agent/orchestrate", methods=["POST"])
@app.route("/api/orchestrate-outreach", methods=["POST"])
def orchestrate_agent():
    """
    Executes the 3-agent pipeline:
    1. Research Agent -> Analyzes profile & drafts intel brief
    2. Writer Agent -> Crafts 3 distinct outreach variants
    3. Critic Agent -> Evaluates, scores, and filters variants
    Returns full trace log and outputs.
    """
    data = request.get_json(force=True, silent=True) or {}
    lead = data.get("lead")

    if not lead:
        return jsonify({"error": "Missing lead payload"}), 400

    try:
        result = orchestrator.orchestrate(lead)
        # Cache lead with variants
        if lead.get("id"):
            _leads_store[lead["id"]] = {
                **lead,
                "outreach_variants": result.get("variants", []),
                "critic": result.get("critic"),
                "research_brief": result.get("research_brief")
            }
        return jsonify(result)
    except Exception as err:
        return jsonify({"error": f"Agent orchestration failed: {str(err)}"}), 500


# ───────────────────────────────────────────────────────────────
# Human-in-the-Loop Approval Gate (/api/agent/approve)
# ───────────────────────────────────────────────────────────────

@app.route("/api/agent/approve", methods=["POST"])
@app.route("/api/approve-outreach", methods=["POST"])
def approve_outreach():
    """
    Human-in-the-loop safety gate.
    No message is ever dispatched without an explicit human approval action.
    """
    data = request.get_json(force=True, silent=True) or {}
    lead_id = data.get("lead_id")
    variant_id = data.get("variant_id", 0)
    approved = bool(data.get("approved", True))

    log_entry = {
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "lead_id": lead_id,
        "variant_id": variant_id,
        "action": "HUMAN_APPROVED" if approved else "HUMAN_REJECTED",
        "detail": f"Human operator {'approved Variant ' + str(variant_id + 1) if approved else 'rejected outreach dispatch'}"
    }
    _approvals_log.append(log_entry)

    return jsonify({
        "status": "success",
        "approved": approved,
        "lead_id": lead_id,
        "variant_id": variant_id,
        "log": log_entry
    })


# ───────────────────────────────────────────────────────────────
# Heuristic Scoring Endpoint (/score)
# ───────────────────────────────────────────────────────────────

@app.route("/score", methods=["POST"])
def score():
    data = request.get_json(force=True, silent=True) or {}
    result = compute_lead_score(
        follower_count=int(data.get("follower_count", 10000)),
        engagement_rate=float(data.get("engagement_rate", 0.04)),
        post_frequency=float(data.get("post_frequency", 3.0)),
        has_website=int(data.get("has_website", 1)),
        bio_word_count=int(data.get("bio_word_count", 10)),
        mentions_business=int(data.get("mentions_business", 1)),
        profile_completeness=float(data.get("profile_completeness", 0.8))
    )
    return jsonify(result)


# ───────────────────────────────────────────────────────────────
# Ishu B2B Advisor Chat Endpoint (/api/chat)
# ───────────────────────────────────────────────────────────────

@app.route("/api/chat", methods=["POST"])
@app.route("/api/ishu/chat", methods=["POST"])
def ishu_chat():
    """
    Conversational B2B advisory endpoint powered by Ishu (Gemini LLM).
    Automatically detects document/PDF generation requests and compiles custom PDFs.
    Accepts { message: str, history: List[dict] } and returns { reply: str, status: 'success' | 'fallback' }.
    """
    data = request.get_json(force=True, silent=True) or {}
    message = data.get("message", "").strip()
    history = data.get("history", [])

    if not message:
        return jsonify({"error": "Message is required"}), 400

    # Broad intent detection: If user asks for a document or PDF, compile it directly
    if is_document_or_pdf_request(message):
        print(f"[Ishu Chat] Detected document/PDF generation intent: '{message[:60]}'", flush=True)
        try:
            doc_data = generate_document_pdf_data(message, history)
            
            import uuid
            clean_name = "".join(c for c in (doc_data.get("title", "Document")) if c.isalnum() or c in (" ", "_", "-")).strip()
            clean_name = clean_name.replace(" ", "_")[:28]
            uid = uuid.uuid4().hex[:6]
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{clean_name}_{uid}_{timestamp}.pdf"

            static_plans_dir = os.path.join(os.path.dirname(__file__), "static", "plans")
            output_filepath = os.path.join(static_plans_dir, filename)

            create_document_pdf(doc_data, output_filepath)
            pdf_url = f"http://localhost:8001/static/plans/{filename}"

            reply_msg = f"I've compiled your custom downloadable PDF document: \"{doc_data.get('title')}\". You can download the complete report below."
            return jsonify({
                "status": "success",
                "reply": reply_msg,
                "is_pdf": True,
                "pdf_url": pdf_url,
                "filename": filename,
                "title": doc_data.get("title"),
                "subtitle": doc_data.get("subtitle"),
                "doc_type": doc_data.get("doc_type", "Document"),
                "sections_count": len(doc_data.get("sections", [])),
                "timestamp": datetime.now().isoformat()
            })
        except Exception as err:
            print(f"[Ishu PDF Chat Error] {err}", flush=True)

    try:
        reply = generate_ishu_chat_reply(message, history)
        if reply:
            return jsonify({
                "status": "success",
                "reply": reply,
                "provider": "gemini",
                "timestamp": datetime.now().isoformat()
            })
        else:
            return jsonify({
                "status": "fallback",
                "reply": None,
                "provider": "heuristic_fallback",
                "message": "AI generation unavailable, fallback to local knowledgebase."
            }), 200
    except Exception as err:
        print(f"[Ishu Chat Error] Exception in /api/chat: {err}", flush=True)
        return jsonify({
            "status": "error",
            "reply": None,
            "error": str(err)
        }), 500


# ───────────────────────────────────────────────────────────────
# Ishu Document & PDF Generator Endpoint (/api/generate-pdf)
# ───────────────────────────────────────────────────────────────

@app.route("/api/generate-pdf", methods=["POST"])
@app.route("/api/generate-document-pdf", methods=["POST"])
@app.route("/api/generate-business-plan-pdf", methods=["POST"])
@app.route("/api/ishu/generate-business-plan-pdf", methods=["POST"])
def generate_document_pdf_endpoint():
    """
    Generates a structured, publication-grade document PDF (Budget, Roadmap, Sprint Plan, Strategy, or Business Plan)
    via Gemini + ReportLab. Returns download URL, filename, and document summary.
    """
    data = request.get_json(force=True, silent=True) or {}
    topic = data.get("topic", "").strip() or data.get("business_idea", "").strip() or data.get("idea", "").strip() or data.get("message", "").strip()
    history = data.get("history", [])

    print(f"[Document PDF] Request received for topic: '{topic[:60]}...'", flush=True)

    try:
        doc_data = generate_document_pdf_data(topic, history)
        
        # Unique timestamped + UUID filename (guarantees no overwriting)
        import uuid
        clean_name = "".join(c for c in (doc_data.get("title", "Document")) if c.isalnum() or c in (" ", "_", "-")).strip()
        clean_name = clean_name.replace(" ", "_")[:28]
        uid = uuid.uuid4().hex[:6]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{clean_name}_{uid}_{timestamp}.pdf"

        # Output path
        static_plans_dir = os.path.join(os.path.dirname(__file__), "static", "plans")
        output_filepath = os.path.join(static_plans_dir, filename)

        # Build PDF with ReportLab
        create_document_pdf(doc_data, output_filepath)

        pdf_url = f"http://localhost:8001/static/plans/{filename}"
        print(f"[Document PDF] [SUCCESS] Rendered to {output_filepath}", flush=True)

        return jsonify({
            "status": "success",
            "is_pdf": True,
            "pdf_url": pdf_url,
            "filename": filename,
            "title": doc_data.get("title"),
            "subtitle": doc_data.get("subtitle"),
            "doc_type": doc_data.get("doc_type", "Document"),
            "sections_count": len(doc_data.get("sections", [])),
            "timestamp": datetime.now().isoformat()
        })
    except Exception as err:
        print(f"[Document PDF Error] {err}", flush=True)
        return jsonify({
            "status": "error",
            "error": str(err)
        }), 500


@app.route("/static/<path:filename>")
def serve_static(filename):
    """
    Serves static files generated by the backend (e.g. business plan PDFs).
    """
    static_dir = os.path.join(os.path.dirname(__file__), "static")
    return send_from_directory(static_dir, filename)


# ───────────────────────────────────────────────────────────────
# Entrypoint
# ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("[FunnelX Backend] Starting Agentic Engine on http://0.0.0.0:8001")
    app.run(host="0.0.0.0", port=8001, debug=False)