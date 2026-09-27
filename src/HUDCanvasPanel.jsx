import { useRef, useEffect } from 'react';

/**
 * HUDCanvasPanel — Real-Data-Driven Cybernetic Telemetry Grid
 * Visualizes active extracted and CRM leads across a Radar Sonar Sweep and Semantic Neural Network.
 */
export default function HUDCanvasPanel({ leads = [], nodesOnline }) {
  const ref = useRef(null);
  const leadsRef = useRef(leads);
  leadsRef.current = leads;

  const actualCount = typeof nodesOnline === 'number' ? nodesOnline : leads.length;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // ── RADAR SONAR STATE ─────────────────────────
    let sweepAngle = 0;

    // ── NEURAL NETWORK DYNAMIC NODES ──────────────
    // Map current leads to interactive drift nodes
    const nodeStateMap = new Map();

    const getNodeState = (lead, index, total) => {
      const id = lead.id || lead.handle || `node-${index}`;
      if (!nodeStateMap.has(id)) {
        const angle = (index / Math.max(total, 1)) * Math.PI * 2;
        const radius = 0.2 + ((index * 37) % 60) / 100;
        nodeStateMap.set(id, {
          id,
          lead,
          bx: 0.5 + Math.cos(angle) * (radius * 0.42),
          by: 0.5 + Math.sin(angle) * (radius * 0.42),
          vx: ((index % 2 === 0 ? 1 : -1) * (0.0003 + ((index * 13) % 20) * 0.00003)),
          vy: ((index % 3 === 0 ? 1 : -1) * (0.0003 + ((index * 17) % 20) * 0.00003)),
          pulse: (index * 0.7) % (Math.PI * 2),
          ps: 0.03 + (index % 5) * 0.008,
          sonarFade: 0,
        });
      }
      const existing = nodeStateMap.get(id);
      existing.lead = lead;
      return existing;
    };

    let packets = [];
    let pTick = 0;

    // ── OSCILLOSCOPE HISTORY ──────────────────────
    let wavePhase = 0;
    const MAX_WAVE = 1200;
    const waveY_arr = new Float32Array(MAX_WAVE);

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const currentLeads = leadsRef.current || [];
      const hasLeads = currentLeads.length > 0;

      // Zones layout
      const sonarR  = Math.min(W * 0.16, H * 0.40);
      const sonarCx = W * 0.165;
      const sonarCy = H * 0.50;
      const netLeft = W * 0.355;
      const netRight= W * 0.98;
      const netTop  = H * 0.04;
      const netBot  = H * 0.74;
      const netW    = netRight - netLeft;
      const netH    = netBot   - netTop;

      // ═══ BACKGROUND GRID ══════════════════════════
      ctx.strokeStyle = 'rgba(0,255,102,0.04)';
      ctx.lineWidth = 0.5;
      const gs = 40;
      for (let x = 0; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      // ═══ SONAR RADAR (LEFT PANEL) ═════════════════
      sweepAngle = (sweepAngle + 0.02) % (Math.PI * 2);

      // Radar Concentric Rings
      for (let i = 1; i <= 4; i++) {
        const r = (sonarR / 4) * i;
        ctx.beginPath();
        ctx.arc(sonarCx, sonarCy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,255,102,${i === 4 ? 0.22 : 0.08})`;
        ctx.lineWidth = i === 4 ? 1.4 : 0.7;
        ctx.stroke();
      }

      // Radar Crosshairs
      ctx.strokeStyle = 'rgba(0,255,102,0.12)';
      ctx.lineWidth = 0.6;
      ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(sonarCx - sonarR - 8, sonarCy); ctx.lineTo(sonarCx + sonarR + 8, sonarCy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sonarCx, sonarCy - sonarR - 8); ctx.lineTo(sonarCx, sonarCy + sonarR + 8); ctx.stroke();
      ctx.setLineDash([]);

      // Sweep Cone
      ctx.save();
      ctx.translate(sonarCx, sonarCy);
      ctx.rotate(sweepAngle);
      const sweepGrad = ctx.createLinearGradient(0, 0, sonarR, 0);
      sweepGrad.addColorStop(0, 'rgba(0,255,102,0)');
      sweepGrad.addColorStop(0.6, 'rgba(0,255,102,0.12)');
      sweepGrad.addColorStop(1, 'rgba(0,255,102,0.34)');
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, sonarR, -0.6, 0.02);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Sweep Beam Line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(sonarR, 0);
      ctx.strokeStyle = 'rgba(0,255,102,0.9)';
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 10; ctx.shadowColor = '#00ff66';
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Center pip
      const t = Date.now() * 0.003;
      const pip = 3 + Math.sin(t * 3) * 1;
      ctx.beginPath(); ctx.arc(sonarCx, sonarCy, pip, 0, Math.PI * 2);
      ctx.fillStyle = '#00ff66'; ctx.shadowBlur = 16; ctx.shadowColor = '#00ff66';
      ctx.fill(); ctx.shadowBlur = 0;

      // ═══ DIVIDER ═════════════════════════════════
      ctx.strokeStyle = 'rgba(0,255,102,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(netLeft - 10, H * 0.06);
      ctx.lineTo(netLeft - 10, H * 0.88);
      ctx.stroke();

      if (!hasLeads) {
        // ── ZERO STATE: NO ACTIVE NODES ──────────────
        ctx.save();
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = 'rgba(0, 255, 102, 0.45)';
        ctx.textAlign = 'center';
        ctx.fillText('NO ACTIVE NODES // RUN EXTRACTION', (netLeft + netRight) / 2, (netTop + netBot) / 2 - 10);
        ctx.font = '9px monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.fillText('RADAR STANDBY — LISTENING ON ALL CHANNELS', (netLeft + netRight) / 2, (netTop + netBot) / 2 + 12);

        // Radar idle scan line text
        ctx.font = '8px monospace';
        ctx.fillStyle = 'rgba(0, 255, 102, 0.35)';
        ctx.fillText('STANDBY', sonarCx, sonarCy + sonarR * 0.65);
        ctx.restore();
      } else {
        // ── REAL DATA NODES & SEMANTIC GRAPH ─────────
        const activeNodes = currentLeads.map((lead, idx) => getNodeState(lead, idx, currentLeads.length));

        // 1. Radar blips for real leads
        activeNodes.forEach((node, idx) => {
          const lead = node.lead;
          const leadAngle = ((idx * 1.618) % 1.0) * Math.PI * 2;
          const scoreFraction = Math.max(0.2, Math.min(1.0, (lead.score || 70) / 100));
          const leadDist = 0.28 + scoreFraction * 0.62;

          const delta = (sweepAngle - leadAngle + Math.PI * 2) % (Math.PI * 2);
          if (delta < 0.10) {
            node.sonarFade = 1.0;
          } else {
            node.sonarFade *= 0.991;
          }

          if (node.sonarFade > 0.02) {
            const bx = sonarCx + Math.cos(leadAngle) * leadDist * sonarR;
            const by = sonarCy + Math.sin(leadAngle) * leadDist * sonarR;
            const isHighScore = (lead.score || 0) >= 80;

            ctx.save();
            ctx.beginPath();
            ctx.arc(bx, by, (2.5 + (isHighScore ? 2 : 0)) * node.sonarFade, 0, Math.PI * 2);
            ctx.fillStyle = isHighScore ? `rgba(255,255,255,${node.sonarFade})` : `rgba(0,255,102,${node.sonarFade})`;
            ctx.shadowBlur = 12 * node.sonarFade;
            ctx.shadowColor = isHighScore ? '#ffffff' : '#00ff66';
            ctx.fill();

            // Real Lead Radar Tag (Real handle + Real Score)
            if (node.sonarFade > 0.35) {
              ctx.font = 'bold 8px monospace';
              ctx.fillStyle = `rgba(0, 255, 102, ${node.sonarFade * 0.95})`;
              ctx.fillText(`@${lead.handle}`, bx + 6, by - 4);
              ctx.fillStyle = `rgba(255, 255, 255, ${node.sonarFade * 0.8})`;
              ctx.font = '7px monospace';
              ctx.fillText(`SCORE: ${lead.score || '--'}`, bx + 6, by + 5);
            }
            ctx.restore();
          }
        });

        // 2. Update Neural Network Node positions
        activeNodes.forEach(n => {
          n.bx += n.vx;
          n.by += n.vy;
          if (n.bx < 0.04 || n.bx > 0.96) n.vx *= -1;
          if (n.by < 0.06 || n.by > 0.94) n.vy *= -1;
          n.pulse += n.ps;
        });

        // 3. Construct Semantic Edges: Connect nodes sharing same niche or same platform
        const semanticEdges = [];
        for (let i = 0; i < activeNodes.length; i++) {
          for (let j = i + 1; j < activeNodes.length; j++) {
            const leadA = activeNodes[i].lead;
            const leadB = activeNodes[j].lead;
            const sameNiche = leadA.niche && leadB.niche && leadA.niche.toLowerCase() === leadB.niche.toLowerCase();
            const samePlatform = leadA.platform && leadB.platform && leadA.platform.toLowerCase() === leadB.platform.toLowerCase();

            if (sameNiche || samePlatform) {
              semanticEdges.push({
                i, j,
                strong: sameNiche && samePlatform,
                sharedType: sameNiche && samePlatform ? 'NICHE+PLATFORM' : sameNiche ? 'NICHE' : 'PLATFORM'
              });
            }
          }
        }

        // 4. Draw Semantic Edges
        semanticEdges.forEach(edge => {
          const a = activeNodes[edge.i];
          const b2 = activeNodes[edge.j];
          const ax = netLeft + a.bx * netW;
          const ay = netTop  + a.by * netH;
          const bx2 = netLeft + b2.bx * netW;
          const by2 = netTop  + b2.by * netH;

          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx2, by2);
          ctx.strokeStyle = edge.strong ? 'rgba(0,255,102,0.32)' : 'rgba(0,255,102,0.14)';
          ctx.lineWidth = edge.strong ? 1.4 : 0.8;
          ctx.stroke();
        });

        // 5. Data Packets along Semantic Edges
        if (semanticEdges.length > 0) {
          if (pTick++ % 18 === 0) {
            const chosenEdge = semanticEdges[Math.floor(Math.random() * semanticEdges.length)];
            packets.push({
              edge: chosenEdge,
              t: 0,
              sp: 0.009 + Math.random() * 0.014
            });
          }
        }

        packets = packets.filter(p => p.t <= 1);
        packets.forEach(p => {
          p.t += p.sp;
          const a = activeNodes[p.edge.i];
          const b2 = activeNodes[p.edge.j];
          if (!a || !b2) return;
          const ax = netLeft + a.bx * netW;
          const ay = netTop  + a.by * netH;
          const bx2 = netLeft + b2.bx * netW;
          const by2 = netTop  + b2.by * netH;

          const px = ax + (bx2 - ax) * p.t;
          const py = ay + (by2 - ay) * p.t;

          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#00ff66';
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        // 6. Draw Real Lead Nodes
        activeNodes.forEach(n => {
          const nx = netLeft + n.bx * netW;
          const ny = netTop  + n.by * netH;
          const pulse = 0.5 + 0.5 * Math.sin(n.pulse);
          const lead = n.lead;
          const isHot = (lead.score || 0) >= 80;
          const nodeRadius = 3.5 + (lead.score ? (lead.score / 100) * 2.5 : 2);

          // Glow Ring
          ctx.beginPath();
          ctx.arc(nx, ny, nodeRadius + pulse * 4, 0, Math.PI * 2);
          ctx.fillStyle = isHot ? `rgba(255,255,255,${0.06 + pulse * 0.12})` : `rgba(0,255,102,${0.06 + pulse * 0.12})`;
          ctx.fill();

          // Node Core
          ctx.beginPath();
          ctx.arc(nx, ny, nodeRadius, 0, Math.PI * 2);
          ctx.fillStyle = isHot ? '#ffffff' : '#00ff66';
          ctx.shadowBlur = isHot ? 16 : 8;
          ctx.shadowColor = isHot ? '#ffffff' : '#00ff66';
          ctx.fill();
          ctx.shadowBlur = 0;

          // Real Node Label
          ctx.font = 'bold 8px monospace';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fillText(`@${lead.handle}`, nx + nodeRadius + 4, ny - 1);
          ctx.font = '7px monospace';
          ctx.fillStyle = 'rgba(0, 255, 102, 0.75)';
          ctx.fillText(`${lead.niche || lead.platform || 'B2B'} [${lead.score || '--'}]`, nx + nodeRadius + 4, ny + 8);
        });
      }

      // ═══ OSCILLOSCOPE (LOWER STRIP) ══════════════
      wavePhase += 0.055;
      const waveTopY = H * 0.78;
      const waveH    = H * 0.12;
      const wLen = Math.min(W, MAX_WAVE);
      const ampMod = hasLeads ? 1.0 : 0.25;

      for (let x = 0; x < wLen; x++) {
        waveY_arr[x] = (
          Math.sin(x * 0.022 + wavePhase) * 0.45 +
          Math.sin(x * 0.065 - wavePhase * 1.4) * 0.3 +
          Math.sin(x * 0.011 + wavePhase * 0.6) * 0.25
        ) * ampMod;
      }

      // Fill under wave
      ctx.beginPath();
      for (let x = 0; x < wLen; x++) {
        const y = waveTopY + waveH * 0.5 + waveY_arr[x] * waveH * 0.48;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineTo(wLen, waveTopY + waveH); ctx.lineTo(0, waveTopY + waveH);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0,255,102,0.05)';
      ctx.fill();

      // Wave line
      ctx.beginPath();
      for (let x = 0; x < wLen; x++) {
        const y = waveTopY + waveH * 0.5 + waveY_arr[x] * waveH * 0.48;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = hasLeads ? 'rgba(0,255,102,0.75)' : 'rgba(0,255,102,0.25)';
      ctx.lineWidth = 1.4;
      ctx.shadowBlur = hasLeads ? 6 : 0;
      ctx.shadowColor = '#00ff66';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ═══ SPECTRUM BARS (BOTTOM) ═══════════════════
      const bW = 3, bGap = 2;
      const bCount = Math.floor(W / (bW + bGap));
      for (let b = 0; b < bCount; b++) {
        const baseAmp = hasLeads ? 10 : 3;
        const amp = (
          baseAmp + Math.sin(b * 0.17 + t * 2.8) * 6 +
          Math.sin(b * 0.055 - t * 1.4) * 4 +
          (hasLeads ? Math.random() * 2.5 : 0.5)
        ) * (hasLeads ? 1.0 : 0.4);
        const bx = b * (bW + bGap);
        const by = H - Math.max(1, amp);
        const a2 = (0.35 + Math.sin(b * 0.2 + t) * 0.28) * (hasLeads ? 1.0 : 0.35);
        ctx.fillStyle = `rgba(0,255,102,${Math.max(0.08, a2)})`;
        ctx.fillRect(bx, by, bW, Math.max(1, amp));
      }

      // ═══ CORNER BRACKETS ══════════════════════════
      const cs = 12;
      ctx.strokeStyle = 'rgba(0,255,102,0.6)';
      ctx.lineWidth = 1.5;
      [[0,0,1,1],[W,0,-1,1],[0,H,1,-1],[W,H,-1,-1]].forEach(([ox,oy,dx,dy]) => {
        ctx.beginPath();
        ctx.moveTo(ox + dx*cs, oy); ctx.lineTo(ox, oy); ctx.lineTo(ox, oy + dy*cs);
        ctx.stroke();
      });

      // ═══ SCAN LINE ════════════════════════════════
      const sl = (Date.now() * 0.04) % H;
      ctx.fillStyle = 'rgba(0,255,102,0.03)';
      ctx.fillRect(0, sl, W, 2);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#000' }}>
      <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />

      {/* SONAR label */}
      <div style={{ position:'absolute', left:'1%', top:'6px', fontFamily:'monospace', fontSize:'8px', color:'rgba(0,255,102,0.5)', letterSpacing:'0.14em', pointerEvents:'none' }}>
        SONAR // REAL-TIME SCAN
      </div>

      {/* Sonar center readout */}
      <div style={{ position:'absolute', left:'16.5%', top:'50%', transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none' }}>
        <div style={{ fontFamily:'monospace', fontSize:'8px', color:'rgba(0,255,102,0.65)', letterSpacing:'0.2em', marginBottom:'2px' }}>NODES ONLINE</div>
        <div style={{ fontFamily:'monospace', fontSize:'24px', fontWeight:900, color:'#fff', textShadow:'0 0 18px #00ff66, 0 0 36px #00ff66', lineHeight:1.05 }}>
          {actualCount.toLocaleString()}
        </div>
        <div style={{ fontFamily:'monospace', fontSize:'7px', color:'#00ff66', letterSpacing:'0.18em', marginTop:'3px', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
          <span style={{ display:'inline-block', width:'5px', height:'5px', borderRadius:'50%', background: actualCount > 0 ? '#00ff66' : '#64748b', boxShadow: actualCount > 0 ? '0 0 8px #00ff66' : 'none', animation: actualCount > 0 ? 'pulse 1s infinite' : 'none' }} />
          {actualCount > 0 ? 'LIVE FEED' : 'STANDBY'}
        </div>
      </div>

      {/* Network label */}
      <div style={{ position:'absolute', right:'1%', top:'6px', fontFamily:'monospace', fontSize:'8px', color:'rgba(0,255,102,0.5)', letterSpacing:'0.14em', pointerEvents:'none' }}>
        SEMANTIC NET // {actualCount > 0 ? `${actualCount} NODES` : 'STANDBY'}
      </div>

      {/* OSC label */}
      <div style={{ position:'absolute', left:'35%', bottom:'20%', fontFamily:'monospace', fontSize:'7px', color:'rgba(0,255,102,0.35)', letterSpacing:'0.12em', pointerEvents:'none' }}>
        OSC // TELEMETRY
      </div>
    </div>
  );
}
