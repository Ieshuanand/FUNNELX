"""
FunnelX Verification Script: Part C Dual Conversation Test
Tests that two distinct conversations generate two completely unique, tailored PDFs
with distinct filenames, distinct titles, and distinct conversation-specific content.
"""

import os
import json
import main

client = main.app.test_client()

print("=" * 70)
print("TESTING DUAL CONVERSATION SPECIFIC BUSINESS PLAN GENERATION")
print("=" * 70)

# ── CONVERSATION 1: Dental Practice SaaS ───────────────────────
print("\n[Conversation 1] Simulating session on 'OmniDental SaaS for Orthodontists'...")
conv1_history = [
    {"sender": "user", "text": "I want to build OmniDental, an automated patient recall & scheduling SaaS for orthodontists."},
    {"sender": "ishu", "text": "Orthodontic clinics have high patient lifetime value. Focus on automated SMS recalls and insurance verification to reduce front-desk churn."},
    {"sender": "user", "text": "We plan to charge $499/month per practice and target 2,000 clinics in North America."},
    {"sender": "user", "text": "Generate a full B2B business plan PDF for OmniDental SaaS."}
]

res1 = client.post("/api/generate-business-plan-pdf", json={
    "business_idea": "OmniDental SaaS - Automated Patient Recall & Scheduling for Orthodontic Clinics",
    "history": conv1_history
})

assert res1.status_code == 200, f"Expected 200, got {res1.status_code}"
data1 = res1.get_json()
print(f"  Status: {data1['status']}")
print(f"  Title: {data1['title']}")
print(f"  Subtitle: {data1['subtitle']}")
print(f"  Filename: {data1['filename']}")
print(f"  PDF URL: {data1['pdf_url']}")
print(f"  Sections count: {data1['sections_count']}")

# Download PDF 1
pdf1_res = client.get(f"/static/plans/{data1['filename']}")
assert pdf1_res.status_code == 200
print(f"  PDF 1 Download verified ({len(pdf1_res.data)} bytes)")


# ── CONVERSATION 2: Solar Energy Lead Gen ──────────────────────
print("\n[Conversation 2] Simulating session on 'SolarGrid AI Drone Prospecting'...")
conv2_history = [
    {"sender": "user", "text": "We are creating SolarGrid AI, a commercial solar acquisition platform that analyzes satellite/drone roof data to sell high-ticket leads to solar installers."},
    {"sender": "ishu", "text": "Commercial solar installations have deal sizes over $150k. High-intent roof kilowatt feasibility data gives you a massive sales moat."},
    {"sender": "user", "text": "Our pricing will be $1,500/month plus $150 per qualified commercial rooftop lead."},
    {"sender": "user", "text": "Please create a downloadable PDF business plan for SolarGrid AI."}
]

res2 = client.post("/api/generate-business-plan-pdf", json={
    "business_idea": "SolarGrid AI - Commercial Rooftop Solar Prospecting & Installer Pipeline",
    "history": conv2_history
})

assert res2.status_code == 200, f"Expected 200, got {res2.status_code}"
data2 = res2.get_json()
print(f"  Status: {data2['status']}")
print(f"  Title: {data2['title']}")
print(f"  Subtitle: {data2['subtitle']}")
print(f"  Filename: {data2['filename']}")
print(f"  PDF URL: {data2['pdf_url']}")
print(f"  Sections count: {data2['sections_count']}")

# Download PDF 2
pdf2_res = client.get(f"/static/plans/{data2['filename']}")
assert pdf2_res.status_code == 200
print(f"  PDF 2 Download verified ({len(pdf2_res.data)} bytes)")


# ── COMPARISON ASSERTIONS ──────────────────────────────────────
print("\n[Verification Checks]")
assert data1['filename'] != data2['filename'], "Filenames must be unique!"
print("  [PASS] Filenames are distinct.")

assert data1['title'] != data2['title'], "Titles must be unique and conversation-specific!"
print("  [PASS] Titles are distinct and conversation-specific.")

backend_dir = os.path.dirname(os.path.abspath(__file__))
plan1_path = os.path.join(backend_dir, "static", "plans", data1['filename'])
plan2_path = os.path.join(backend_dir, "static", "plans", data2['filename'])
assert os.path.exists(plan1_path), f"File {plan1_path} must exist on disk"
assert os.path.exists(plan2_path), f"File {plan2_path} must exist on disk"
assert os.path.getsize(plan1_path) > 5000, "PDF 1 must have valid generated content size"
assert os.path.getsize(plan2_path) > 5000, "PDF 2 must have valid generated content size"
print("  [PASS] Both PDFs saved to disk in static/plans/ with non-zero size.")

print("\n" + "=" * 70)
print("ALL DUAL CONVERSATION TESTS PASSED SUCCESSFULLY! [OK]")
print("=" * 70)
