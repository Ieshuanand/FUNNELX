"""
FunnelX Verification Script
Tests Part A, Part B, Part C backend endpoints and features.
"""

import os
import json
import requests
import main

client = main.app.test_client()

print("=" * 60)
print("RUNNING FUNNELX VERIFICATION SUITE")
print("=" * 60)

# 1. Health Check
res = client.get("/api/health")
print(f"[1] Health Check: Status {res.status_code} -> {res.get_json()['status']}")
assert res.status_code == 200

# 2. Extract Leads
res = client.post("/api/extract-leads", json={
    "hashtag": "#ai, #saas",
    "platform": "Instagram",
    "follower_limit": 30000,
    "count": 4
})
data = res.get_json()
print(f"[2] Extract Leads: Status {res.status_code} -> Received {len(data)} leads")
assert res.status_code == 200
assert len(data) > 0
sample_lead = data[0]
print(f"    Sample lead: {sample_lead['name']} (@{sample_lead['handle']}) Score: {sample_lead['score']}")

# 3. Chat Endpoint
res = client.post("/api/chat", json={
    "message": "How do I optimize GTM conversion for B2B SaaS?",
    "history": []
})
chat_data = res.get_json()
print(f"[3] Ishu Chat Endpoint: Status {res.status_code} -> Provider: {chat_data.get('provider')}")
assert res.status_code == 200

# 4. Generate Business Plan PDF
res = client.post("/api/generate-business-plan-pdf", json={
    "business_idea": "Autonomous Outbound Pipeline Automation for SaaS Founders",
    "history": [
        {"sender": "user", "text": "We target early-stage SaaS teams with $10k-$50k MRR."},
        {"sender": "ishu", "text": "Solid ICP. Focus on CAC payback and automated touches."}
    ]
})
pdf_data = res.get_json()
print(f"[4] PDF Business Plan Endpoint: Status {res.status_code} -> {pdf_data.get('status')}")
assert res.status_code == 200
assert "pdf_url" in pdf_data
assert "filename" in pdf_data
filename = pdf_data["filename"]
print(f"    Generated PDF: {filename}")
print(f"    Title: {pdf_data.get('title')}")
print(f"    Sections: {pdf_data.get('sections_count')}")

# 5. Verify static download of the generated PDF
res = client.get(f"/static/plans/{filename}")
print(f"[5] PDF Static Route Download: Status {res.status_code} -> Size: {len(res.data)} bytes")
assert res.status_code == 200
assert len(res.data) > 1000

print("\n" + "=" * 60)
print("ALL VERIFICATIONS PASSED SUCCESSFULLY! [OK]")
print("=" * 60)
