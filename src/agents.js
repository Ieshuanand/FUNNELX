/**
 * FunnelX Agentic Architecture
 *
 * Agent orchestration has been migrated to the backend server (backend/main.py & backend/agents.py)
 * to securely manage LLM credentials server-side and execute the Research -> Writer -> Critic
 * swarm with ToolRegistry and Gemini function calling.
 *
 * Frontend interaction is handled through OutreachAgentPanel.jsx querying:
 * - POST http://localhost:8001/api/agent/orchestrate
 * - POST http://localhost:8001/api/agent/approve
 * - POST http://localhost:8001/api/extract-leads
 */
export const AGENT_BACKEND_URL = "http://localhost:8001";