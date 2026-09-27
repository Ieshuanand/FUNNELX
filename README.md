# FunnelX — Multi-Agent B2B Lead-Gen & Outreach System

FunnelX is an agentic B2B lead qualification and personalized cold outreach system. It implements a multi-agent pipeline coordinated by an orchestrator with structured LLM tool-calling and a strict human-in-the-loop approval gate.
"© 2026 ieshu. This project is shared for portfolio purposes — please don't copy or redistribute."
---

## 🏗️ System Architecture

```
                                  ┌──────────────────────────┐
                                  │   Frontend UI (React)    │
                                  │      Port: 5173/5175     │
                                  └─────────────┬────────────┘
                                                │ REST API (localhost only)
                                                ▼
                                  ┌──────────────────────────┐
                                  │  Backend Server (Flask)  │
                                  │        Port: 8001        │
                                  └─────────────┬────────────┘
                                                │
                                 ┌──────────────┴──────────────┐
                                 ▼                             ▼
                      ┌─────────────────────┐       ┌─────────────────────┐
                      │  Lead Extractor &   │       │     Multi-Agent     │
                      │  Scoring Subsystem  │       │     Orchestrator    │
                      └─────────────────────┘       └──────────┬──────────┘
                                                               │
                                          ┌────────────────────┼────────────────────┐
                                          ▼                    ▼                    ▼
                                ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
                                │  Research Agent  │ │   Writer Agent   │ │   Critic Agent   │
                                │ (Profile Intel & │ │(3 Message Tones: │ │(Independent Per- │
                                │  Angle Discovery)│ │ Direct, Curious, │ │ Variant Scoring) │
                                │                  │ │  Social Proof)   │ │                  │
                                └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
                                         │                    │                    │
                                         └────────────────────┼────────────────────┘
                                                              │ Structured Tool Calling
                                                              ▼
                                                 ┌─────────────────────────┐
                                                 │      Tool Registry      │
                                                 │ (submit_research_brief, │
                                                 │ submit_outreach_drafts, │
                                                 │    submit_critique)     │
                                                 └────────────┬────────────┘
                                                              │
                                                              ▼
                                                 ┌─────────────────────────┐
                                                 │  Gemini Function Engine │
                                                 │ (Structured LLM API /   │
                                                 │   Dynamic Synthesizer)  │
                                                 └────────────┬────────────┘
                                                              │
                                                              ▼
                                                 ┌─────────────────────────┐
                                                 │   Human-in-the-Loop     │
                                                 │      Safety Gate        │
                                                 │ (Per-Variant Approval)  │
                                                 └────────────┬────────────┘
```

---

## 🤖 Multi-Agent Pipeline

### 1. Research Agent
* **Role**: Analyzes profile metadata (bio, industry niche, follower metrics, engagement rate, business intent signals).
* **Function Call**: Invokes the `submit_research_brief` tool with a structured schema returning:
  - `brief`: An actionable markdown intelligence summary detailing commercial focus and potential pain points.
  - `key_topics`: Core thematic vectors extracted from profile context.
  - `recommended_angle`: Tailored outreach hooks suitable for the prospect.

### 2. Writer Agent
* **Role**: Ingests the lead profile and the Research Agent's intelligence brief to compose 3 distinct, short (<75 words) cold outreach messages.
* **Function Call**: Invokes the `submit_outreach_drafts` tool with 3 stylistic variants:
  1. *Direct & Value-First* — Punchy value proposition with low friction.
  2. *Curiosity-Driven* — Thoughtful inquiry addressing workflow bottlenecks.
  3. *Social Proof / Case Study* — Metric-driven peer success story.

### 3. Critic Agent (Independent Per-Variant Evaluation)
* **Role**: Audits **each of the 3 generated variants independently** via dedicated tool calls (`submit_critique`).
* **Evaluation Criteria**: Conciseness (<75 words), personalization accuracy (referencing bio and niche hooks), spam-trigger avoidance, and low-friction Call-to-Action (CTA).
* **Output**: Assigns a distinct score (0.0 to 10.0), specific qualitative feedback, and a pass/fail boolean (`passed: score >= 7.0`).

### 4. Multi-Agent Orchestrator
* **Role**: State machine that coordinates sequential execution: `Research Agent → Writer Agent → Critic Agent (Per-Variant Review Loop)`.
* **Execution & Telemetry**: Manages inter-call pacing to respect API rate limits and streams real-time execution trace events to the frontend console.

---

## 🛡️ Human-in-the-Loop Safety Gate

* **No Autonomous Sending**: The system does NOT automatically send emails, DMs, or outbound messages to any external platform.
* **Per-Variant Approval**: The UI presents all 3 message variants alongside their individual Critic scores, feedback notes, and pass/fail badges.
* **Gated Operator Action**: Variants that fail the automated Critic audit (`passed === false`) are strictly disabled from operator approval. Only verified passing variants can be approved and staged by the human operator.

---

## 📊 Lead Data & Extensibility

* **Current Implementation**: Lead data is currently simulated and qualified via structured schema compilation and Gemini tool-calling for testing and local demonstration.
* **Production Pluggability**: The architecture is designed with clean separation of concerns. The backend data interface (`/api/extract-leads` in `backend/main.py`) is decoupled from the agent swarm, allowing live data sources (e.g. CRM webhooks, directory APIs, or data providers) to be plugged in without modifying the agent swarm or frontend components.
* **No Real-Time Scraping**: The project does not perform unauthenticated live web scraping or autonomous web scraping.

---

## 🔒 Security & Privacy

* **Server-Side Credentials**: All API keys (`GEMINI_API_KEY`) reside exclusively on the backend server in `backend/.env`.
* **No Client Exposure**: The React frontend communicates strictly with `http://localhost:8001` via local REST endpoints. No API keys or direct third-party LLM endpoints are ever queried from or exposed to the browser.
* **Version Control Protection**: All `.env` and credential files are explicitly excluded in `.gitignore`.

---

## 🚀 Getting Started

### 1. Configure Environment
Create `backend/.env`:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8001
```

### 2. Start the Backend Server (Port 8001)
```bash
cd backend
python main.py
```

### 3. Start the Frontend UI (Port 5173 / 5175)
```bash
npm install
npm run dev
```

### 4. Usage Workflow
1. Open the **Discovery Drawer** in the sidebar.
2. Select your target niche hashtags, platform, and follower limits.
3. Click **SYNTHESIZE LEADS** to query the backend extraction engine.
4. On any lead card, click **AGENTIC OUTREACH** to trigger the `Research → Writer → Critic` swarm.
5. Review the live agent trace, independent Critic scores, and approve your preferred variant at the human gate!

