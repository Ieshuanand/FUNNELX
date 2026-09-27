import CleanRocketTransition from './CleanRocketTransition';
import React, {
  useState, useEffect, useCallback, useMemo, useRef
} from 'react';
import {
  Users, Trash2, ArrowLeft, ArrowRight,
  Mail, MapPin, Check, Database, Settings,
  ChevronRight, ChevronLeft, BarChart3, Target,
  Activity, Zap, TrendingUp, Menu, X, RefreshCw,
  FileText, Download, Sparkles
} from 'lucide-react';
import Lenis from 'lenis';
import './brutal-scroll.css';
import HUDCanvasPanel from './HUDCanvasPanel';
import OutreachAgentPanel from './OutreachAgentPanel';

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   AVATAR STYLE SEEDER
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const avatarGradients = [
  ['#00ff66', '#10b981'], // Neon green to Emerald
  ['#a855f7', '#6366f1'], // Purple to Indigo
  ['#10b981', '#3b82f6'], // Emerald to Blue
  ['#00ff66', '#a855f7'], // Neon green to Purple
  ['#f97316', '#ef4444']  // Orange to Red
];
const getAvatarColors = (name) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarGradients[hash % avatarGradients.length];
};

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return String(num);
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   MOCK DATA ENGINE
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const generateMockLeads = (hashtagInput, selectedPlatform, profile, followerLimit) => {
  const tags = hashtagInput.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
  const defaultTags = tags.length > 0 ? tags : ['marketing', 'saas', 'startup'];

  let niches = ['SaaS Growth', 'AI Engineering', 'Digital Marketing', 'Product Design'];
  let bios = [
    'Scaling pipelines and optimizing B2B systems. Let\'s connect.',
    'Building the future of automation. Passionate about AI.',
    'Helping creators monetize their audience data. DM for partnerships.'
  ];

  if (profile === 'Enterprise Business') {
    niches = ['SaaS Founder', 'Tech Co-founder', 'E-commerce Owner', 'Web3 Builder', 'B2B Marketer', 'SaaS Growth'];
    bios = [
      'Founder & builder. Building in public and scaling operations. ðŸš€',
      'Co-founder. Obsessed with high-performance infrastructure and automated pipelines.',
      'E-comm founder. Helping brands scale through aggressive precision data.'
    ];
  } else if (profile === 'Freelancer') {
    niches = ['SEO Agency', 'Creative Director', 'Sales Consultant', 'Dev Agency Owner', 'Growth Specialist', 'UI/UX Consultant'];
    bios = [
      'Helping B2B startups scale their outbound marketing engines. Let\'s talk!',
      'Full-service agency director. High-fidelity creative campaigns.',
      'Deploying custom software and API integrations for enterprise clients.'
    ];
  } else if (profile === 'Digital Creator') {
    niches = ['Tech Reviewer', 'Lifestyle Vlogger', 'Crypto Specialist', 'Fitness Influencer', 'Travel Photographer', 'Gaming Streamer'];
    bios = [
      'Sharing daily workflows, creative systems, and hardware setups. âœ¨',
      'Crypto & Web3 analyst. Decrypting data trends for a 100K+ community.',
      'Lifestyle & wellness creator. Partnered with top health tech brands.'
    ];
  }

  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Sam', 'Jamie', 'Skyler', 'Drew', 'Avery', 'Robin'];
  const lastNames = ['Chen', 'Miller', 'Smith', 'Garcia', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
  const locations = ['New York, USA', 'London, UK', 'Berlin, Germany', 'Sydney, Australia', 'San Francisco, USA', 'Toronto, Canada', 'Paris, France', 'Tokyo, Japan'];

  return Array.from({ length: 6 }, (_, i) => {
    const firstName = firstNames[(i * 3) % firstNames.length];
    const lastName = lastNames[(i * 7) % lastNames.length];
    const name = `${firstName} ${lastName}`;
    const rawTag = defaultTags[i % defaultTags.length];
    const handle = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${30 + i * 11}`;
    const maxF = followerLimit ? Number(followerLimit) : 25000;
    const followers = Math.round(maxF * (0.3 + (i * 0.15) % 0.7));
    const score = 35 + (i * 12) % 65;
    return {
      id: `lead-${i}-${Date.now()}`,
      name,
      handle,
      platform: selectedPlatform,
      followers,
      engagement_rate: (2.5 + (i * 1.3) % 5.5).toFixed(1) + '%',
      niche: niches[i % niches.length],
      email: `collabs@${handle.replace(/_/g, '')}.com`,
      location: locations[i % locations.length],
      score,
      status: 'Discovered',
      tags: [rawTag, selectedPlatform.toLowerCase(), i % 2 === 0 ? 'sponsored' : 'creator'],
      lastActive: new Date(Date.now() - i * 1.5 * 86400000).toISOString(),
      bio: bios[i % bios.length],
    };
  });
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   ISHU B2B CONSULTING BRAIN
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const generateIshuB2BReply = (query, hashtags, platform, totalCards) => {
  const m = query.toLowerCase();

  if (m.includes('mvp') || m.includes('minimum viable')) {
    return "An MVP (Minimum Viable Product) is designed to test your core business hypotheses with the least amount of effort and code. Focus strictly on solving one high-value problem for your Ideal Customer Profile (ICP). Build it, launch it to a small test group, gather qualitative feedback, and iterate rapidly. Do not over-engineer.";
  }
  if (m.includes('fund') || m.includes('raise') || m.includes('vc') || m.includes('investor')) {
    return "Early-stage fundraising is about momentum and validation. For pre-seed, emphasize founder story, market opportunity, and early prototypes. For seed-stage institutional funding, aim for $10k-$50k Monthly Recurring Revenue (MRR) to prove PMF. Draft a solid deck detailing TAM, GTM channels, and CAC payback metrics.";
  }
  if (m.includes('churn') || m.includes('retention') || m.includes('renew')) {
    return "Churn is a primary friction point for B2B growth. For B2B SaaS, target a Net Revenue Retention (NRR) of 115%+. Mitigate customer churn by mapping out customer success stages, automating alerts for account inactivity, and introducing product integrations that create high data-switching costs.";
  }
  if (m.includes('gtm') || m.includes('go to market') || m.includes('sales')) {
    return "Align your GTM playbook to your ACV (Average Contract Value). For ACV <$5k, use Product-Led Growth (PLG) self-serve. For ACV $10k-$50k, run an inside sales model (SDRs + AEs). For ACV >$100k, deploy enterprise account-based marketing (ABM) with multi-stakeholder contract sign-offs.";
  }
  if (m.includes('hiring') || m.includes('team') || m.includes('co-founder')) {
    return "In early startups, hire execution-oriented builders, not administrators. Look for full-stack versatility. Implement a standard vesting schedule (4-year vesting with a 1-year cliff) to safeguard equity from co-founder departures or mismatched hires.";
  }
  if (m.includes('scale') || m.includes('growth')) {
    return "Premature scaling is the leading cause of startup failure. Ensure you have achieved Product-Market Fit, a repeatable sales motion, and unit economics where LTV:CAC is >3x and the CAC payback period is under 12 months, before scaling marketing spends.";
  }
  if (m.includes('legal') || m.includes('incorporate') || m.includes('delaware')) {
    return "For venture-backed startups, incorporating as a Delaware C-Corporation is standard practice. VCs prefer it due to predictable corporate laws and standard stock arrangements. Ensure all IP assignment agreements are signed by founders on day one.";
  }
  if (m.includes('pricing') || m.includes('monetize')) {
    return "B2B pricing should be value-based rather than cost-plus. Test pricing tiers early. Start high and offer discounts rather than starting too low. Consider usage-based pricing models if customer costs align directly with data volume or API throughput.";
  }
  if (m.includes('competit') || m.includes('matrix') || m.includes('moat')) {
    return "Differentiators must be defensible. Competitors can copy features, but it's much harder to replicate strong distribution partnerships, high user switching costs, unique data loops, or platform integrations. Chart your USP clearly.";
  }
  if (m.includes('extract') || m.includes('scan') || m.includes('lead')) {
    return `Right now, extraction parameters are targeting #${hashtags} on ${platform}. I recommend targeting accounts with 5k-50k followers; their engagement rates are 3x higher than macro accounts, optimizing your marketing conversion funnel.`;
  }
  if (m.includes('pipeline') || m.includes('crm')) {
    return `Your CRM pipeline currently contains ${totalCards} active deal nodes. Focus on moving leads from 'Discovered' to 'Outreach Sent' by building multi-channel templates (e.g. email follow-ups paired with social touches).`;
  }

  return "Hello! I am Ishu, your B2B Consulting Advisor. Ask me anything about MVPs, Go-To-Market (GTM) strategies, early-stage fundraising, churn mitigation, hiring structures, or pricing models to clear up any doubts about starting your business!";
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   MONOCHROMATIC BG CANVAS
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const crosshairs = Array.from({ length: 8 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: 15 + Math.random() * 20
    }));

    const streams = Array.from({ length: 12 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vy: 0.8 + Math.random() * 1.5,
      length: 80 + Math.random() * 150
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.5;

      const step = 80;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      crosshairs.forEach(c => {
        c.x = (c.x + c.vx + width) % width;
        c.y = (c.y + c.vy + height) % height;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.moveTo(c.x - c.size, c.y);
        ctx.lineTo(c.x + c.size, c.y);
        ctx.moveTo(c.x, c.y - c.size);
        ctx.lineTo(c.x, c.y + c.size);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size * 0.4, 0, Math.PI * 2);
        ctx.stroke();
      });

      streams.forEach(s => {
        s.y = (s.y - s.vy + height) % height;
        const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.length);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y + s.length);
        ctx.stroke();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas id="bg-canvas" ref={canvasRef} />;
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   ISHU SHARK SVG COMPONENT
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function IshuSharkSVG({ size = 70 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 80" fill="none" className="select-none">
      <ellipse cx="50" cy="42" rx="44" ry="24" stroke="rgba(0, 255, 102, 0.25)" strokeWidth="3" fill="none" />
      <path
        d="M10 40 C20 16, 74 18, 90 36 C84 44, 72 52, 58 56 C38 62, 16 60, 10 40 Z"
        fill="#1e293b"
        stroke="#000000"
        strokeWidth="2"
      />
      <path
        d="M10 40 C24 54, 52 58, 58 56 C38 62, 16 60, 10 40 Z"
        fill="#cbd5e1"
      />
      <path
        className="ishu-fin-wave"
        d="M44 22 C48 4, 62 8, 59 24 Z"
        fill="#1e293b"
        stroke="#000000"
        strokeWidth="1.5"
      />
      <path d="M54 48 C64 58, 68 60, 66 52 Z" fill="#1e293b" stroke="#000000" strokeWidth="1" />
      <path
        className="ishu-tail-wag"
        d="M10 40 L-2 28 L2 40 L-2 52 Z"
        fill="#1e293b"
        stroke="#000000"
        strokeWidth="2"
      />
      <path
        d="M56 36 Q54 41 56 46 M60 35 Q58 40 60 45 M64 35.5 Q62 39.5 64 44"
        stroke="#000000"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="74" cy="32" r="3.5" fill="#ffffff" />
      <circle cx="74" cy="32" r="1.8" fill="#000000" className="ishu-blink" />
      <path d="M78 44 Q74 40 70 44" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M73 42 L72 44 M75 42 L74 44" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   EXPORTS & SUB-COMPONENTS
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export function NavbarBlueShark() {
  return (
    <div className="animate-navbar-shark w-12 h-12 flex items-center justify-center relative group cursor-pointer">
      <div className="absolute inset-0 bg-[#00f0ff]/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <svg 
        viewBox="0 0 100 60" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full drop-shadow-[0_0_8px_#00f0ff]"
      >
        <path d="M 32 12 Q 40 -2 46 6 Q 43 14 38 15 Z" fill="#000000" stroke="#00f0ff" strokeWidth="1.5" />
        <path 
          d="M 12 25 C 20 12, 45 12, 60 22 C 55 28, 45 32, 35 30 C 25 29, 16 28, 12 25 Z" 
          fill="#000000" 
          stroke="#00f0ff" 
          strokeWidth="2" 
        />
        <g className="navbar-shark-tail">
          <path d="M 58 21 C 68 22, 75 20, 80 18 L 80 26 Z" fill="#000000" />
          <path d="M 80 18 Q 88 3 86 0 Q 81 10 77 20 Q 84 32 88 38 Q 85 34 80 24" fill="#000000" stroke="#00f0ff" strokeWidth="1.5" />
        </g>
        <circle cx="22" cy="20" r="1.5" fill="#ffffff" className="animate-pulse" />
        <path d="M 25 21 Q 23 24 24 26 M 28 22 Q 26 24 27 25" stroke="#00f0ff" strokeWidth="1" />
      </svg>
    </div>
  );
}



export function BrutalScrollCover({ onSelectPath, isPathSelected, scrollY }) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const worldRef = useRef(null);

  const cards = [
    { id: 'SYS_001', title: "FUNNEL\nX", desc: 'Lead Synthesis', z: -200, x: -400, y: -60, rotY: 15 },
    { id: 'SYS_002', title: "DATA\nMINING", desc: 'Multi-Channel Harvest', z: -600, x: 300, y: 80, rotY: -20 },
    { id: 'SYS_003', title: "PIPE\nLINE", desc: 'Outbound CRM Engine', z: -1000, x: -200, y: -120, rotY: 8 },
    { id: 'SYS_004', title: "SCALE\nOPS", desc: 'Automation Framework', z: -1400, x: 350, y: 30, rotY: -12 },
  ];

  const stars = useMemo(() =>
    Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 3000,
      y: (Math.random() - 0.5) * 2000,
      z: -Math.random() * 2500,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
    })),
    []
  );

  useEffect(() => {
    // Parallax mouse tracking
    const onMouse = (e) => {
      setMouseX((e.clientX / window.innerWidth - 0.5) * 2);
      setMouseY((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  const worldTx = mouseX * -15;
  const worldTy = mouseY * -10;
  const worldRotX = mouseY * 3;
  const worldRotY = mouseX * -5;
  
  // Z-axis movement tied directly to the passed scrollY prop
  const worldTz = scrollY * 0.8;

  const progressPercent = (scrollY / 3500) * 100;

  return (
    <>
      <div className="scroll-progress-bar" style={{ width: `${progressPercent}%` }} />
      <div className="scanlines"></div>
      <div className="vignette"></div>
      <div className="noise"></div>

      <div className="hud">
        <div className="hud-top">
          <span>SYS.INITIALIZED</span>
          <div className="hud-line"></div>
          <span>FPS: <strong>60</strong></span>
        </div>
        <div className="hud-bottom">
          <span>TRACKING // EXTRACTOR</span>
          <div className="hud-line"></div>
          <span>VER 2.0.4 [PRODUCTION]</span>
        </div>
      </div>

      <div className="viewport" id="viewport">
        <div 
          className="world" 
          id="world" 
          ref={worldRef}
          style={{
            transform: `translate(-50%, -50%) translate3d(${worldTx}px, ${worldTy}px, ${worldTz}px) rotateX(${worldRotX}deg) rotateY(${worldRotY}deg)`,
          }}
        >
          {stars.map(s => (
            <div 
              key={s.id} 
              className="star"
              style={{
                transform: `translate3d(${s.x}px, ${s.y}px, ${s.z}px)`,
                width: s.size, height: s.size, opacity: s.opacity,
              }}
            />
          ))}

          <div className="item big-text" style={{ transform: 'translate3d(0px, 0px, -300px)' }}>FUNNELX</div>
          <div className="item big-text" style={{ transform: 'translate3d(-200px, 80px, -900px)' }}>LEAD EXTRACTOR</div>
          <div className="item big-text" style={{ transform: 'translate3d(150px, -60px, -1500px)' }}>DATA PIPELINES</div>
          <div className="item big-text" style={{ transform: 'translate3d(-80px, 40px, -2100px)' }}>AUTOMATION TRACK</div>

          {cards.map(c => (
            <div 
              key={c.id} 
              className="item"
              style={{ transform: `translate3d(${c.x}px, ${c.y}px, ${c.z}px) rotateY(${c.rotY}deg)` }}
            >
              <div className="card">
                <div className="card-header">
                  <span className="card-id">{c.id}</span>
                  <strong style={{ color: '#00f3ff', fontSize: '8px' }}>â—† ONLINE</strong>
                </div>
                <h2>{c.title}</h2>
                <p>{c.desc}</p>
                <div className="card-footer">
                  <span>MODULE</span>
                  <span>v5.0</span>
                </div>
              </div>
            </div>
          ))}

          <div className={`item ${isPathSelected ? 'blur-out-exit' : ''}`} style={{ transform: 'translate3d(0, 0, -2600px)' }}>
            <div className="card">
              <div className="card-header">
                <span className="card-id">SYS_AUTH_v2.0</span>
                <strong style={{ color: '#00f3ff' }}>ACTIVE</strong>
              </div>
              <div>
                <h2>CHOOSE YOUR PATH</h2>
                <p>Select your workspace profile initialization route to access the extraction infrastructure dashboards.</p>
              </div>

              <div className="path-options">
                <button className="path-btn" onClick={() => onSelectPath('digital-creator')}>// DIGITAL CREATOR</button>
                <button className="path-btn" onClick={() => onSelectPath('freelancer')}>// FREELANCER</button>
                <button className="path-btn" onClick={() => onSelectPath('enterprise-business')}>// ENTERPRISE BUSINESS</button>
              </div>

              <div className="card-footer">
                <span>SECURE LAYER</span>
                <span>[GATED ACCESS]</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="scroll-prompt">
        <div className="scroll-prompt-arrow" />
        <span>SCROLL TO PATH SELECTION</span>
      </div>
      {rocketTransition && (
        <CleanRocketTransition
          key={rocketTransition.id || 'crm-rocket'}
          direction={rocketTransition.direction}
          duration={700}
          onComplete={() => setRocketTransition(null)}
        />
      )}
    </>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   MAIN CRM WORKSPACE MODULE
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const PIPELINE_COLUMNS = ['Discovered', 'Outreach Sent', 'In Discussion', 'Partnered'];

export default function CRMSuite({ userPath = null }) {
  // If userPath is passed from App.jsx router, skip internal cover and go straight to dashboard
  const [introPhase, setIntroPhase] = useState(userPath ? 'done' : 'cover');
  const [isPathSelected, setIsPathSelected] = useState(!!userPath);

  const [activeTab, setActiveTab] = useState('extract');
  const [isTabFading, setIsTabFading] = useState(false);
  const [isCoverFading, setIsCoverFading] = useState(false);
  const [rocketTransition, setRocketTransition] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hudActiveTab, setHudActiveTab] = useState('visual');
  const [toast, setToast] = useState(null);

  const [extractedLeads, setExtractedLeads] = useState([]);
  const [pipeline, setPipeline] = useState({
    'Discovered': [], 'Outreach Sent': [], 'In Discussion': [], 'Partnered': []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hashtags, setHashtags] = useState('#fitness, #yoga, #wellness');
  const [platform, setPlatform] = useState('Instagram');
  const [followerLimit, setFollowerLimit] = useState(25000);
  const [targetRegion, setTargetRegion] = useState('GLOBAL_REDUNDANT');
  const [workspaceProfile, setWorkspaceProfile] = useState(userPath || null);

  const [nodesOnline, setNodesOnline] = useState(0);
  const [throughput, setThroughput] = useState('0.0');
  const [animateCharts, setAnimateCharts] = useState(false);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [logs, setLogs] = useState([
    { time: '12:44:10', type: 'system', text: 'VOID SCAN SYNTHESIS PROTOCOL ACTIVE...' },
    { time: '12:44:12', type: 'system', text: 'CONNECTING HYPER-SCALE OUTBOUND NODES' },
    { time: '12:44:14', type: 'app', text: 'ORCHESTRATING INTERACTIVE 3D ENVIRONMENT' }
  ]);

  const vantaRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  const appendLog = useCallback((text, type = 'app') => {
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLogs(prev => {
      const updated = [...prev, { time, type, text }];
      if (updated.length > 25) updated.shift();
      return updated;
    });
  }, []);

  const triggerToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSelectIntroPath = (path) => {
    setWorkspaceProfile(path);
    localStorage.setItem('crm_profile_v5', path);
    appendLog(`AUTHORIZED OPERATIONS PROFILE // ${path.toUpperCase()}`, 'system');

    setRocketTransition({ active: true, direction: 'right', id: Date.now() });
    setIsCoverFading(true);
    setTimeout(() => { 
      setIntroPhase('done');
      setTimeout(() => {
        setIsCoverFading(false);
      }, 50);
    }, 330);
  };

  const handlePathSelection = (path) => {
    setIsPathSelected(true);
    const formatted = path.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    handleSelectIntroPath(formatted);
  };

  // Lenis smooth scroll engine initialized on window while cover is active
  useEffect(() => {
    if (introPhase !== 'cover') {
      // Ensure body scroll is never locked when in dashboard mode
      // Lenis v2 adds 'lenis' and 'lenis-smooth' classes to <html> and locks overflow
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped');
      document.body.classList.remove('lenis', 'lenis-smooth');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      infinite: false,
    });

    const onScroll = () => {
      setScrollY(lenis.scroll);
    };

    lenis.on('scroll', onScroll);

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
      // Always release body scroll and remove Lenis classes on cleanup
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped');
      document.body.classList.remove('lenis', 'lenis-smooth');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [introPhase]);

  /* â”€â”€ Vanta Globe 3D Background Integration â”€â”€ */
  useEffect(() => {
    if (introPhase !== 'done') return;

    if (!vantaRef.current && window.VANTA && window.VANTA.GLOBE) {
      vantaRef.current = window.VANTA.GLOBE({
        el: "#vanta-background-container",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x00ff66,       // High-voltage Neon Candy Green nodes
        backgroundColor: 0x000000 // Absolute deep black
      });
    }
    return () => {
      if (vantaRef.current) {
        vantaRef.current.destroy();
        vantaRef.current = null;
      }
    };
  }, [introPhase]);

  useEffect(() => {
    const savedPipeline = localStorage.getItem('crm_pipeline_v5');
    if (savedPipeline) {
      try { setPipeline(JSON.parse(savedPipeline)); } catch (err) { console.error(err); }
    }
    const savedProfile = localStorage.getItem('crm_profile_v5');
    if (savedProfile) setWorkspaceProfile(savedProfile);

    // Always reset body scroll — Lenis may have locked it in a previous session
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appendLog]);

  useEffect(() => {
    localStorage.setItem('crm_pipeline_v5', JSON.stringify(pipeline));
  }, [pipeline]);

  const handleTabChange = (tab) => {
    if (tab === activeTab || isTabFading) return;
    appendLog(`SWITCHING TAB // ${tab.toUpperCase()}`, 'system');

    const tabOrder = { 'extract': 0, 'pipeline': 1, 'insights': 2, 'analytics': 3 };
    const dir = (tabOrder[tab] ?? 0) >= (tabOrder[activeTab] ?? 0) ? 'right' : 'left';
    setRocketTransition({ active: true, direction: dir, id: Date.now() });

    setIsTabFading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTimeout(() => {
        setIsTabFading(false);
        if (tab === 'insights' || tab === 'analytics') {
          setAnimateCharts(false);
          setTimeout(() => setAnimateCharts(true), 60);
        }
      }, 50);
    }, 330);
  };

  const handleExtractLeads = async () => {
    setIsLoading(true);
    const cleanedTags = hashtags.split(',').map(t => t.trim()).filter(Boolean).join(', ');
    appendLog(`INITIATING B2B LEAD EXTRACTION: [${cleanedTags}] ON [${platform}]`, 'app');

    try {
      appendLog(`CALLING BACKEND AGENTIC ENGINE (http://localhost:8001/api/extract-leads)...`, 'system');
      const response = await fetch('http://localhost:8001/api/extract-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hashtag: hashtags,
          platform: platform,
          follower_limit: followerLimit,
          region: targetRegion,
          count: 6
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setExtractedLeads(data);
        triggerToast(`Synthesized ${data.length} Leads via Backend Swarm! 🚀`);
        appendLog(`EXTRACTION SUCCESS: ${data.length} B2B LEADS SYNTHESIZED & QUALIFIED`, 'app');
      } else {
        throw new Error('Malformed lead response format');
      }
    } catch (err) {
      console.warn('Backend extract notice, activating client fallback:', err);
      appendLog(`BACKEND CALL NOTICE: ${err.message} — RUNNING LOCAL COMPILER`, 'system');
      const fallback = generateMockLeads(hashtags, platform, workspaceProfile, followerLimit);
      setExtractedLeads(fallback);
      triggerToast('Extracted leads (local fallback)');
    } finally {
      setIsLoading(false);
    }
  };

  const isLeadInCRM = useCallback((handle) => {
    return Object.values(pipeline).some(leads =>
      leads.some(l => l.handle.toLowerCase() === handle.toLowerCase())
    );
  }, [pipeline]);

  const handleAddLeadToCRM = useCallback((lead) => {
    if (isLeadInCRM(lead.handle)) {
      triggerToast(`Duplicate: @${lead.handle} in CRM!`);
      return;
    }
    setPipeline(prev => ({
      ...prev,
      'Discovered': [...prev['Discovered'], { ...lead, status: 'Discovered' }]
    }));
    appendLog(`IMPORTED NODE @${lead.handle} TO DISCOVERED`, 'app');
  }, [isLeadInCRM, appendLog, triggerToast]);

  const handleAddAllToCRM = useCallback(() => {
    let addedCount = 0;
    setPipeline(prev => {
      const discovered = [...prev['Discovered']];
      extractedLeads.forEach(lead => {
        const inCRM = Object.values(prev).some(col => col.some(l => l.handle.toLowerCase() === lead.handle.toLowerCase()));
        const inNew = discovered.some(l => l.handle.toLowerCase() === lead.handle.toLowerCase());
        if (!inCRM && !inNew) {
          discovered.push({ ...lead, status: 'Discovered' });
          addedCount++;
        }
      });
      if (addedCount > 0) {
        triggerToast(`Imported ${addedCount} leads!`);
        appendLog(`BATCH IMPORTED: ${addedCount} NODES ROUTED`, 'app');
        return { ...prev, Discovered: discovered };
      } else {
        triggerToast("All items are duplicates.");
        return prev;
      }
    });
  }, [extractedLeads, appendLog, triggerToast]);

  const handleMoveCard = useCallback((cardId, currentCol, direction) => {
    const currentIndex = PIPELINE_COLUMNS.indexOf(currentCol);
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= PIPELINE_COLUMNS.length) return;
    const targetCol = PIPELINE_COLUMNS[targetIndex];
    
    setPipeline(prev => {
      const sourceList = [...prev[currentCol]];
      const targetList = [...prev[targetCol]];
      const index = sourceList.findIndex(c => c.id === cardId);
      if (index === -1) return prev;
      const [movedCard] = sourceList.splice(index, 1);
      targetList.push({ ...movedCard, status: targetCol });
      appendLog(`MOVED @${movedCard.handle} // ${currentCol.toUpperCase()} â†’ ${targetCol.toUpperCase()}`, 'app');
      return { ...prev, [currentCol]: sourceList, [targetCol]: targetList };
    });
  }, [appendLog]);

  const handleDeleteCard = useCallback((cardId, currentCol) => {
    setPipeline(prev => {
      const targetCard = prev[currentCol].find(c => c.id === cardId);
      if (targetCard) appendLog(`DELETED NODE: @${targetCard.handle} FROM ${currentCol.toUpperCase()}`, 'system');
      return { ...prev, [currentCol]: prev[currentCol].filter(c => c.id !== cardId) };
    });
  }, [appendLog]);

  const handleDrop = (e, targetCol) => {
    e.preventDefault();
    setDragOverCol(null);
    const cardId = e.dataTransfer.getData('text/plain');
    const sourceCol = e.dataTransfer.getData('sourceCol');
    if (!cardId || !sourceCol || sourceCol === targetCol) return;
    
    setPipeline(prev => {
      const sourceList = [...prev[sourceCol]];
      const targetList = [...prev[targetCol]];
      const index = sourceList.findIndex(c => c.id === cardId);
      if (index === -1) return prev;
      const [movedCard] = sourceList.splice(index, 1);
      targetList.push({ ...movedCard, status: targetCol });
      appendLog(`DRAG @${movedCard.handle} // ${sourceCol.toUpperCase()} â†’ ${targetCol.toUpperCase()}`, 'app');
      return { ...prev, [sourceCol]: sourceList, [targetCol]: targetList };
    });
  };

  const getColumnAvgScore = (columnCards) => {
    if (!columnCards || columnCards.length === 0) return 0;
    return Math.round(columnCards.reduce((acc, card) => acc + card.score, 0) / columnCards.length);
  };

  const combinedLeads = useMemo(() => {
    const all = [...extractedLeads];
    Object.values(pipeline).forEach(col => { if (Array.isArray(col)) all.push(...col); });
    const seen = new Set();
    return all.filter(l => {
      if (!l || !l.handle) return false;
      const key = l.handle.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [extractedLeads, pipeline]);

  const totalPipelineCards = useMemo(() => {
    return Object.values(pipeline).reduce((acc, col) => acc + col.length, 0);
  }, [pipeline]);

  const analyticsStats = useMemo(() => {
    const total = combinedLeads.length;
    if (total === 0) return { totalLeads: 0, avgEngagement: '0.0%', conversionRate: '0.0%', topNiche: 'None' };
    const erTotal = combinedLeads.reduce((acc, l) => acc + (parseFloat(l.engagement_rate) || 0), 0);
    const conversionRate = (((pipeline['Partnered']?.length || 0) / total) * 100).toFixed(1) + '%';
    const nichesMap = {};
    combinedLeads.forEach(l => { if (l.niche) nichesMap[l.niche] = (nichesMap[l.niche] || 0) + 1; });
    let topNiche = 'None', max = 0;
    Object.entries(nichesMap).forEach(([n, count]) => { if (count > max) { max = count; topNiche = n; } });
    return { totalLeads: total, avgEngagement: (erTotal / total).toFixed(1) + '%', conversionRate, topNiche };
  }, [combinedLeads, pipeline]);

  const platformCounts = useMemo(() => {
    const counts = { Instagram: 0, TikTok: 0, LinkedIn: 0, Twitter: 0 };
    combinedLeads.forEach(l => { if (counts[l.platform] !== undefined) counts[l.platform]++; });
    return counts;
  }, [combinedLeads]);

  const maxPlatformCount = Math.max(...Object.values(platformCounts), 1);

  const pipelineCounts = useMemo(() => ({
    Discovered: pipeline['Discovered']?.length || 0,
    'Outreach Sent': pipeline['Outreach Sent']?.length || 0,
    'In Discussion': pipeline['In Discussion']?.length || 0,
    Partnered: pipeline['Partnered']?.length || 0
  }), [pipeline]);

  const donutSegments = useMemo(() => {
    const radius = 55;
    const circumference = 2 * Math.PI * radius;
    let accumulatedPercent = 0;
    const stageColors = { Discovered: '#00ff66', 'Outreach Sent': '#ffffff', 'In Discussion': '#10b981', Partnered: '#047857' };
    
    return Object.entries(pipelineCounts).map(([stage, count]) => {
      const percentage = totalPipelineCards > 0 ? (count / totalPipelineCards) : 0;
      const strokeDashArray = `${percentage * circumference} ${circumference}`;
      const strokeDashOffset = -accumulatedPercent * circumference;
      accumulatedPercent += percentage;
      return { stage, count, percentage: (percentage * 100).toFixed(1) + '%', color: stageColors[stage], strokeDashArray, strokeDashOffset };
    });
  }, [pipelineCounts, totalPipelineCards]);

  const scoreBuckets = useMemo(() => {
    const buckets = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    combinedLeads.forEach(l => {
      const s = l.score;
      if (s <= 20) buckets['0-20']++;
      else if (s <= 40) buckets['21-40']++;
      else if (s <= 60) buckets['41-60']++;
      else if (s <= 80) buckets['61-80']++;
      else buckets['81-100']++;
    });
    return buckets;
  }, [combinedLeads]);

  const maxBucketCount = Math.max(...Object.values(scoreBuckets), 1);
  const topLeads = useMemo(() => [...combinedLeads].sort((a, b) => b.score - a.score).slice(0, 5), [combinedLeads]);

  return (
    <>
      <div className="relative min-h-screen text-slate-200" style={{ isolation: 'isolate' }}>
      <div id="vanta-background-container" />
      <BackgroundCanvas />

      {introPhase === 'cover' && (
        <>
          <div
            className="cover-root"
            style={{
              opacity: isCoverFading ? 0 : 1,
              transform: isCoverFading ? 'translateY(10px)' : 'translateY(0)',
              transition: 'opacity 300ms ease-out, transform 300ms ease-out'
            }}
          >
            <BrutalScrollCover 
              onSelectPath={handlePathSelection} 
              isPathSelected={isPathSelected} 
              scrollY={scrollY}
            />
          </div>
          <div className="scroll-proxy" style={{ height: '4200px', width: '1px', pointerEvents: 'none' }}></div>
        </>
      )}

      {introPhase === 'done' && (
        <>
          <header className="fixed top-0 left-0 w-full bg-black/95 border-b border-[#00ff66]/10 h-16" style={{ zIndex: 45 }}>
            <div className="nav-swimmer-track">
              <div className="nav-swimmer">
                <NavbarBlueShark />
              </div>
            </div>
            <div className="relative z-10 flex items-center justify-between px-6 h-full">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(o => !o)}
                  className="p-1.5 border border-black bg-[#00ff66] text-black hover:bg-[#10b981] transition"
                >
                  {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-[#00ff66]">terminal</span>
                  <span className="font-black text-2xl tracking-tighter uppercase text-white font-display">FUNNELX</span>
                </div>
              </div>

              <nav className="hidden md:flex items-center gap-2">
                {[
                  { id: 'extract', label: 'AI EXTRACTION', icon: <Target className="w-3.5 h-3.5" /> },
                  { id: 'pipeline', label: 'CRM PIPELINE', icon: <Database className="w-3.5 h-3.5" /> },
                  { id: 'insights', label: 'INSIGHTS', icon: <BarChart3 className="w-3.5 h-3.5" /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative px-4 py-2 font-mono text-xs font-bold tracking-widest flex items-center gap-2 transition ${
                      activeTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {activeTab === tab.id && <span className="tab-bar-green" />}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                {workspaceProfile && (
                  <span className="hidden sm:inline-block bg-black border border-[#00ff66] text-[#00ff66] font-mono text-[9px] px-2.5 py-1.5 font-bold uppercase">
                    TRACK: {workspaceProfile}
                  </span>
                )}
                <button
                  onClick={() => { 
                    setIsPathSelected(false); 
                    setIntroPhase('cover'); 
                    window.scrollTo(0, 0); 
                  }}
                  className="bg-[#00ff66] border border-black text-black hover:bg-[#10b981] font-mono text-[9px] px-2.5 py-1.5 font-bold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> INTRO
                </button>
              </div>
            </div>
          </header>

          <aside className={`sidebar-drawer ${sidebarOpen ? 'open' : 'closed'} fixed top-16 left-0 bottom-0 z-40 w-80 bg-black/95 border-r border-[#00ff66]/20 overflow-y-auto`}>
            <div className="flex items-center justify-between p-5 border-b border-[#00ff66]/10">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#00ff66]" />
                <span className="font-mono text-xs font-bold text-white tracking-widest">EXTRACTION CORE</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-6 text-left">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-mono text-[10px] text-slate-400 font-bold">MAX FOLLOWER LIMIT</label>
                  <span className="font-mono text-[10px] text-[#00ff66] font-bold">{followerLimit.toLocaleString()}</span>
                </div>
                <input type="range" min="1000" max="100000" step="1000" value={followerLimit} onChange={(e) => setFollowerLimit(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-slate-400 font-bold block mb-2">NICHE HASHTAGS</label>
                <input type="text" value={hashtags} onChange={(e) => setHashtags(e.target.value)} className="input-dark w-full px-3 py-2 text-xs rounded-none" placeholder="e.g. #fitness, #saas" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-slate-400 font-bold block mb-2">TARGET PLATFORM</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Instagram', 'TikTok', 'LinkedIn', 'Twitter'].map(p => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`py-1.5 border font-mono text-[10px] font-bold transition ${
                        platform === p ? 'border-[#00ff66] text-[#00ff66] bg-[#00ff66]/10' : 'border-white/10 text-slate-400 hover:border-[#00ff66]/50 hover:text-white'
                      }`}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] text-slate-400 font-bold block mb-2">TARGET REGION</label>
                <select value={targetRegion} onChange={(e) => setTargetRegion(e.target.value)} className="input-dark w-full px-3 py-2 text-xs rounded-none">
                  <option value="GLOBAL_REDUNDANT">GLOBAL_REDUNDANT</option>
                  <option value="NORTH_AMERICA_WEST">NORTH_AMERICA_WEST</option>
                  <option value="EUROPE_CENTRAL">EUROPE_CENTRAL</option>
                  <option value="ASIA_PACIFIC_NORTH">ASIA_PACIFIC_NORTH</option>
                </select>
              </div>
              <button onClick={handleExtractLeads} disabled={isLoading} className="btn-candy-green w-full py-3 text-xs font-bold tracking-widest flex items-center justify-center gap-2">
                {isLoading ? <><div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />SYNTHESIZING...</> : <><Zap className="w-3.5 h-3.5" />SYNTHESIZE LEADS</>}
              </button>
            </div>
          </aside>

          <main
            style={{
              position: 'fixed',
              top: '64px',           /* height of fixed header */
              left: sidebarOpen ? '320px' : '0',
              right: '0',
              bottom: '0',
              overflowY: 'auto',
              overflowX: 'hidden',
              zIndex: 20,
              transition: 'left 0.3s ease',
              padding: '24px 24px 80px 24px',
            }}
          >
            <div
              className="tab-content-container max-w-7xl mx-auto"
              style={{
                opacity: isTabFading ? 0 : 1,
                transform: isTabFading ? 'translateY(12px)' : 'translateY(0)',
                transition: 'opacity 300ms ease-out, transform 300ms ease-out',
                willChange: 'opacity, transform'
              }}
            >
              {activeTab === 'extract' && (
                <div className="space-y-12">
                  <div className="flex flex-col items-start text-left space-y-6 py-8">
                    <div className="inline-flex items-center gap-2 border border-[#00ff66]/30 bg-black/40 px-4 py-2 rounded-none">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00ff66] animate-pulse" />
                      <span className="font-mono text-[10px] text-slate-400 tracking-widest font-bold">ARCADE TELEMETRY ONLINE</span>
                    </div>
                    <div className="dashboard-quote-box font-mono uppercase tracking-[0.4em] text-white/95 border-y-4 border-double border-white/25 py-4 px-6 text-left max-w-xl select-none">
                      <span className="uiverse-animated-fill-title block font-black select-none uppercase my-2 text-2xl tracking-normal">NEXT-GEN DATA</span>
                      <span className="uiverse-animated-fill-title block font-black select-none uppercase my-2 text-4xl md:text-6xl tracking-normal">SYNTHESIS ENGINE.</span>
                    </div>
                    <p className="text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed">
                      Command the void. FUNNELX orchestrates multi-dimensional B2B data extractions with aggressive precision and sub-millisecond latency.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <button onClick={() => setSidebarOpen(true)} className="btn-candy-green px-8 py-4 text-sm font-bold flex items-center gap-3 shadow-[4px_4px_0px_#000000]">
                        OPEN EXTRACTION DRAWER <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-6">
                      {[
                        { label: 'NODES ONLINE', val: combinedLeads.length.toLocaleString(), color: '#00ff66' },
                        { label: 'THROUGHPUT RATE', val: `${combinedLeads.length > 0 ? (combinedLeads.length * 1.4).toFixed(1) : '0.0'} GB/s`, color: '#10b981' },
                        { label: 'DISCOVERED MODULES', val: String(extractedLeads.length), color: '#ffffff' }
                      ].map((hud, idx) => (
                        <div key={idx} className="bg-[#09090b] border border-[#00ff66]/20 px-5 py-3 text-left">
                          <p className="font-mono text-[9px] text-slate-500 tracking-wider">{hud.label}</p>
                          <p className="font-mono text-sm font-black mt-0.5" style={{ color: hud.color }}>{hud.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="panel-obsidian rounded-none overflow-hidden">
                    <div className="flex border-b border-[#00ff66]/20 bg-black/60">
                      {[
                        { id: 'visual', label: 'VISUAL DATA GRID', icon: <Activity className="w-3.5 h-3.5" /> },
                        { id: 'logs', label: 'SYSTEM OUTBOUND LOGS', icon: <Database className="w-3.5 h-3.5" /> }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setHudActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-6 py-3 font-mono text-[10px] font-bold tracking-widest transition border-r border-[#00ff66]/20 ${
                            hudActiveTab === tab.id ? 'text-[#00ff66] bg-[#00ff66]/5 border-b-2 border-b-[#00ff66]' : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          {tab.icon} {tab.label}
                        </button>
                      ))}
                    </div>
                    {hudActiveTab === 'visual' ? (
                      <div style={{ height: 350 }}>
                        <HUDCanvasPanel leads={combinedLeads} nodesOnline={combinedLeads.length} />
                      </div>
                    ) : (
                      <div className="p-6 h-[350px] overflow-y-auto font-mono text-[10px] space-y-2 bg-black/45 text-slate-300 text-left">
                        {logs.map((log, idx) => (
                          <div key={idx} className="flex gap-4">
                            <span className="text-slate-600">[{log.time}]</span>
                            <span className={log.type === 'app' ? 'text-[#00ff66]' : 'text-slate-400'}>{log.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {extractedLeads.length > 0 ? (
                    <div className="space-y-6 pt-6 border-t border-[#00ff66]/20">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="text-left">
                          <h3 className="text-xl font-bold uppercase tracking-tight text-white font-display">Discovery Matrix Output</h3>
                          <p className="font-mono text-[10px] text-slate-500">Synthesized B2B profiles ready for CRM pipeline</p>
                        </div>
                        <button onClick={handleAddAllToCRM} className="btn-candy-green text-xs px-5 py-2.5 shadow-[2px_2px_0px_#000000]">IMPORT ALL TO CRM</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {extractedLeads.map(lead => {
                          if (!lead || !lead.name || !lead.handle) return null;
                          const alreadyInCRM = isLeadInCRM(lead.handle);
                          const [c1, c2] = getAvatarColors(lead.name);
                          const initials = lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

                          return (
                            <div key={lead.id} className="panel-white p-6 rounded-none flex flex-col justify-between text-left">
                              <div>
                                <div className="flex justify-between items-start gap-2 mb-4 border-b border-black/20 pb-2">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-none flex items-center justify-center text-white font-bold text-sm" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>{initials}</div>
                                    <div className="text-left">
                                      <h4 className="text-sm font-black text-black leading-snug line-clamp-1">{lead.name}</h4>
                                      <p className="font-mono text-[10px] text-black/70">@{lead.handle}</p>
                                    </div>
                                  </div>
                                  <span className="badge-dark font-mono text-[9px] px-2 py-0.5 rounded-none font-bold">SCORE: {lead.score}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                  <span className="font-mono text-[9px] bg-black/10 border border-black/25 px-2 py-0.5 text-black font-bold uppercase">{lead.platform}</span>
                                  <span className="font-mono text-[9px] bg-black/10 border border-black/25 px-2 py-0.5 text-black font-bold uppercase">{lead.niche}</span>
                                  <span className="font-mono text-[9px] bg-black border border-black px-2 py-0.5 text-[#00ff66] font-black">ER: {lead.engagement_rate}</span>
                                </div>
                                <p className="text-xs text-black/80 mb-6 italic leading-relaxed border-l-2 border-black/30 pl-3">"{lead.bio}"</p>
                                <div className="space-y-1.5 border-t border-black/10 pt-4 font-mono text-[10px] text-black/75 mb-6">
                                  <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-black/70" /><span className="truncate">{lead.email}</span></div>
                                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-black/70" /><span>{lead.location}</span></div>
                                  <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-black/70" /><span>{formatNumber(lead.followers)} followers</span></div>
                                </div>
                              </div>
                              <div>
                                {alreadyInCRM ? (
                                  <div className="w-full py-2 bg-black/5 border border-black/20 text-black/60 text-xs font-mono font-bold tracking-wider flex items-center justify-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-emerald-700" /> ADDED_TO_CRM
                                  </div>
                                ) : (
                                  <button onClick={() => handleAddLeadToCRM(lead)} className="w-full py-2 bg-black hover:bg-neutral-950 text-[#00ff66] text-xs font-mono font-black tracking-wider border-2 border-black transition">IMPORT_TO_CRM</button>
                                )}
                              </div>

                              {/* Multi-Agent Outreach Panel */}
                              <OutreachAgentPanel
                                lead={lead}
                                onLogEvent={appendLog}
                                onApproved={(variantId) => {
                                  handleAddLeadToCRM(lead);
                                  appendLog(`AGENT WORKFLOW // @${lead.handle} OUTREACH STAGED & IMPORTED TO CRM`, 'app');
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="panel-obsidian border border-dashed border-[#00ff66]/30 p-16 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-none bg-emerald-500/10 border border-[#00ff66]/30 flex items-center justify-center mb-4 text-[#00ff66]"><Database className="w-6 h-6" /></div>
                      <h3 className="text-base font-bold text-white mb-2 uppercase tracking-wide">No Discovery Nodes Loaded</h3>
                      <p className="text-xs text-slate-400 max-w-sm mb-6">Open the left settings sidebar, input hashtags criteria, and click Synthesis Leads.</p>
                      <button onClick={() => setSidebarOpen(true)} className="btn-candy-green text-xs px-6 py-2.5 shadow-[2px_2px_0px_#000000]">OPEN DRAWER</button>
                    </div>
                  )}
                </div>
              )}

              {(activeTab === 'crm' || activeTab === 'pipeline') && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="text-left">
                      <h2 className="text-3xl font-black uppercase tracking-tight text-white font-display neon-white-glow">CRM Pipeline</h2>
                      <p className="font-mono text-[10px] text-slate-500 mt-1">Drag-and-drop nodes to cycle outbound partnership stages</p>
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 font-bold">TOTAL CRM CARDS: <span className="text-[#00ff66] font-black">{totalPipelineCards}</span></div>
                  </div>

                  {totalPipelineCards === 0 ? (
                    <div className="panel-obsidian border border-dashed border-[#00ff66]/30 p-16 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-none bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center mb-4 text-[#00ff66]"><TrendingUp className="w-6 h-6" /></div>
                      <h3 className="text-base font-bold text-white mb-2 uppercase">CRM Pipeline Board Empty</h3>
                      <p className="text-xs text-slate-400 max-w-sm mb-6">Load discovery profiles first and import them to begin tracking outbound leads.</p>
                      <button onClick={() => handleTabChange('extract')} className="btn-candy-green text-xs px-6 py-2.5 shadow-[2px_2px_0px_#000000]">EXTRACT CORE LEADS</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {PIPELINE_COLUMNS.map((colId, colIndex) => {
                        const cards = pipeline[colId] || [];
                        const avgScore = getColumnAvgScore(cards);

                        return (
                          <div
                            key={colId}
                            onDragOver={(e) => { e.preventDefault(); setDragOverCol(colId); }}
                            onDragLeave={() => setDragOverCol(null)}
                            onDrop={(e) => handleDrop(e, colId)}
                            className={`flex flex-col panel-obsidian p-4 min-h-[550px] transition-all duration-300 ${
                              dragOverCol === colId ? 'kanban-over shadow-[6px_6px_0px_rgba(0,255,102,0.25)] border-[#00ff66]' : ''
                            }`}
                          >
                            <div className="flex justify-between items-center border-b border-[#00ff66]/20 pb-2 mb-2">
                              <h3 className="font-mono text-xs font-black tracking-tight flex items-center gap-2 text-white">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#00ff66]" />{colId.toUpperCase()}
                              </h3>
                              <span className="font-mono text-[9px] font-black px-2 py-0.5 border border-[#00ff66] bg-black text-[#00ff66]">{cards.length}</span>
                            </div>
                            <div className="font-mono text-[9px] text-slate-400 mb-4 flex justify-between items-center font-bold">
                              <span>AVG SCORE:</span><span className="text-[#00ff66] font-black">{avgScore > 0 ? `${avgScore}%` : 'N/A'}</span>
                            </div>
                            <div className="flex-grow space-y-4 overflow-y-auto max-h-[500px] pr-1">
                              {cards.length > 0 ? (
                                cards.map(card => {
                                  if (!card || !card.name || !card.handle) return null;
                                  const [c1, c2] = getAvatarColors(card.name);
                                  const initials = card.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

                                  return (
                                    <div
                                      key={card.id}
                                      draggable
                                      onDragStart={(e) => { e.dataTransfer.setData('text/plain', card.id); e.dataTransfer.setData('sourceCol', colId); }}
                                      className="bg-black text-white border border-[#00ff66]/20 p-4 cursor-grab active:cursor-grabbing transition-all hover:shadow-[3px_3px_0px_#000000] hover:border-[#00ff66] relative group text-left"
                                    >
                                      <div className="scanline opacity-0 group-hover:opacity-100" />
                                      <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-none flex items-center justify-center text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>{initials}</div>
                                          <div className="text-left">
                                            <h4 className="text-xs font-black text-slate-200 line-clamp-1 leading-snug">{card.name}</h4>
                                            <p className="font-mono text-[9px] text-slate-400">@{card.handle}</p>
                                          </div>
                                        </div>
                                        <button onClick={() => handleDeleteCard(card.id, colId)} className="text-slate-500 hover:text-red-400 p-0.5 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                                      </div>
                                      <div className="flex flex-wrap gap-1 mb-3">
                                        <span className="font-mono text-[8px] bg-white/5 border border-white/10 px-1.5 py-0.5 text-slate-300 uppercase">{card.platform}</span>
                                        <span className="font-mono text-[8px] bg-white/5 border border-white/10 px-1.5 py-0.5 text-slate-300 uppercase max-w-[80px] truncate">{card.niche}</span>
                                      </div>
                                      <div className="space-y-1 mb-3">
                                        <div className="flex justify-between text-[8px] font-mono text-slate-400"><span>SCORE:</span><span className="text-[#00ff66] font-bold">{card.score}/100</span></div>
                                        <div className="w-full bg-white/5 h-1 overflow-hidden"><div className="h-full bg-[#00ff66]" style={{ width: `${card.score}%` }} /></div>
                                      </div>
                                      <div className="flex justify-between items-center border-t border-white/5 pt-3">
                                        <span className="font-mono text-[8px] text-slate-400">{formatNumber(card.followers)} followers</span>
                                        <div className="flex gap-1.5">
                                          <button onClick={() => handleMoveCard(card.id, colId, -1)} disabled={colIndex === 0} className="p-1 border border-white/10 hover:border-[#00ff66] disabled:opacity-20 text-slate-400 hover:text-white"><ArrowLeft className="w-2.5 h-2.5" /></button>
                                          <button onClick={() => handleMoveCard(card.id, colId, 1)} disabled={colIndex === 3} className="p-1 border border-white/10 hover:border-[#00ff66] disabled:opacity-20 text-slate-400 hover:text-white"><ArrowRight className="w-2.5 h-2.5" /></button>
                                        </div>
                                      </div>
                                      <OutreachAgentPanel
                                        lead={card}
                                        onLogEvent={appendLog}
                                        onApproved={(variantId) => {
                                          if (colIndex < 3) {
                                            handleMoveCard(card.id, colId, 1);
                                            appendLog(`HUMAN GATE APPROVED // @${card.handle} ADVANCED IN PIPELINE`, 'app');
                                          }
                                        }}
                                      />
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="h-full border border-dashed border-white/10 flex flex-col items-center justify-center py-16 px-4 text-center">
                                  <p className="font-mono text-[9px] text-slate-500 font-bold">DRAG NODES</p>
                                  <p className="font-mono text-[8px] text-slate-600 mt-0.5">OR USE ARROWS</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {(activeTab === 'insights' || activeTab === 'analytics') && (
                <div className="space-y-8 text-left">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-white font-display neon-white-glow">Telemetry Suite</h2>
                    <p className="font-mono text-[10px] text-slate-500 mt-1">Real-time analytical graphs compiled from active B2B nodes</p>
                  </div>

                  {combinedLeads.length === 0 ? (
                    <div className="panel-obsidian border border-dashed border-[#00ff66]/30 p-16 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-none bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center mb-4 text-[#00ff66]"><BarChart3 className="w-6 h-6" /></div>
                      <h3 className="text-base font-bold text-white mb-2 uppercase">No Metrics Generated</h3>
                      <p className="text-xs text-slate-400 max-w-sm mb-6">Load discovery nodes or import deal cards to populate insights charts.</p>
                      <button onClick={() => handleTabChange('extract')} className="btn-candy-green text-xs px-6 py-2.5 shadow-[2px_2px_0px_#000000]">RUN SCANNER</button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                          { label: 'TOTAL DATA POOL', val: analyticsStats.totalLeads, icon: 'groups', color: '#00ff66' },
                          { label: 'AVG ENGAGEMENT', val: analyticsStats.avgEngagement, icon: 'trending_up', color: '#10b981' },
                          { label: 'CONVERSION RATE', val: analyticsStats.conversionRate, icon: 'track_changes', color: '#ffffff' },
                          { label: 'TOP ACTIVE NICHE', val: analyticsStats.topNiche.toUpperCase(), icon: 'workspace_premium', color: '#00ff66' }
                        ].map((kpi, idx) => (
                          <div key={idx} className="panel-obsidian p-6 flex justify-between items-start rounded-none">
                            <div>
                              <p className="font-mono text-[9px] text-slate-400 tracking-wider font-bold">{kpi.label}</p>
                              <h3 className="text-2xl font-black tracking-tight text-white mt-1">{kpi.val}</h3>
                            </div>
                            <div className="p-2 border border-[#00ff66]/20 bg-black text-[#00ff66]"><span className="material-symbols-outlined text-lg leading-none">{kpi.icon}</span></div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="panel-white p-6 rounded-none">
                          <h3 className="font-mono text-xs font-black uppercase tracking-wider mb-6 text-black">Leads Platform Breakdown</h3>
                          <div className="space-y-5">
                            {Object.entries(platformCounts).map(([plat, count]) => {
                              const pct = (count / maxPlatformCount) * 100;
                              const share = combinedLeads.length > 0 ? Math.round((count / combinedLeads.length) * 100) : 0;
                              return (
                                <div key={plat} className="space-y-1.5 text-left">
                                  <div className="flex justify-between font-mono text-[10px] text-black font-bold">
                                    <span>{plat.toUpperCase()}</span><span>{count} leads ({share}%)</span>
                                  </div>
                                  <div className="w-full bg-black border border-black h-3 overflow-hidden rounded-none">
                                    <div className="h-full bg-[#00ff66] transition-all duration-1000 ease-out" style={{ width: animateCharts ? `${pct}%` : '0%' }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="panel-obsidian p-6 rounded-none">
                          <h3 className="font-mono text-xs font-black uppercase tracking-wider mb-4 text-white">CRM Pipeline Distribution</h3>
                          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                            <div className="relative w-36 h-36 flex-shrink-0">
                              <svg className="w-full h-full" viewBox="0 0 200 200">
                                {totalPipelineCards === 0 ? <circle cx="100" cy="100" r="55" fill="none" stroke="#000000" strokeWidth="16" /> : (
                                  donutSegments.map((seg, idx) => (
                                    <circle key={idx} cx="100" cy="100" r="55" fill="none" stroke={seg.color} strokeWidth="16" strokeDasharray={seg.strokeDashArray} strokeDashoffset={animateCharts ? seg.strokeDashOffset : 0} transform="rotate(-90, 100, 100)" className="transition-all duration-1000 origin-center" />
                                  ))
                                )}
                                <text x="100" y="96" textAnchor="middle" className="fill-slate-400 font-mono text-[9px] tracking-wider font-bold">CRM_NODES</text>
                                <text x="100" y="124" textAnchor="middle" className="fill-white text-2xl font-black">{totalPipelineCards}</text>
                              </svg>
                            </div>
                            <div className="space-y-2 flex-1 w-full text-left">
                              {donutSegments.map((seg, idx) => (
                                <div key={idx} className="flex justify-between items-center font-mono text-[9px] text-slate-300 font-bold">
                                  <span className="flex items-center gap-2 text-slate-300"><span className="w-2.5 h-2.5 border border-black" style={{ backgroundColor: seg.color }} />{seg.stage.toUpperCase()}</span>
                                  <span>{seg.count} ({seg.percentage})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="panel-obsidian p-6 rounded-none">
                          <h3 className="font-mono text-xs font-black uppercase tracking-wider mb-6 text-white">Lead Score Histogram</h3>
                          <div className="h-[200px] w-full flex items-end justify-between border-b border-l border-[#00ff66]/20 pb-2 pl-4">
                            {Object.entries(scoreBuckets).map(([bucket, count]) => {
                              const pct = (count / maxBucketCount) * 130;
                              return (
                                <div key={bucket} className="flex flex-col items-center flex-1">
                                  <div className="w-[30px] bg-black/10 border border-[#00ff66]/20 rounded-none relative flex items-end h-[140px]">
                                    <div className="w-full bg-[#00ff66] transition-all duration-1000 ease-out" style={{ height: animateCharts ? `${pct}px` : '0px' }} />
                                  </div>
                                  <span className="font-mono text-[9px] text-slate-400 font-bold mt-2">{bucket}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="panel-white p-6 rounded-none">
                          <h3 className="font-mono text-xs font-black uppercase tracking-wider mb-4 text-black">Top 5 Lead Performers</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                              <thead>
                                <tr className="border-b border-black/20 font-mono text-[9px] text-black/60 font-bold">
                                  <th className="py-2.5">RANK</th>
                                  <th className="py-2.5 px-2">LEAD PROFILE</th>
                                  <th className="py-2.5 px-2">NICHE</th>
                                  <th className="py-2.5 px-2">STATUS</th>
                                  <th className="py-2.5 px-2 text-right">SCORE</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-black/10 font-mono text-[10px] text-black font-bold">
                                {topLeads.map((lead, idx) => {
                                  if (!lead || !lead.name || !lead.handle) return null;
                                  const [c1, c2] = getAvatarColors(lead.name);
                                  const initials = lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

                                  return (
                                    <tr key={lead.id} className="hover:bg-black/5 transition-colors">
                                      <td className="py-3"><span className="inline-flex items-center justify-center w-5 h-5 font-black text-[9px] border border-black bg-black text-[#00ff66]">{idx + 1}</span></td>
                                      <td className="py-3 px-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-none flex items-center justify-center text-white text-[9px] font-bold" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>{initials}</div>
                                          <div className="text-left"><p className="font-black text-black leading-snug line-clamp-1">{lead.name}</p><p className="text-[8px] text-black/60">@{lead.handle}</p></div>
                                        </div>
                                      </td>
                                      <td className="py-3 px-2 text-black font-black uppercase">{lead.niche}</td>
                                      <td className="py-3 px-2"><span className="inline-block text-[8px] font-black px-1.5 py-0.5 border border-black bg-black text-[#00ff66]">{lead.status.toUpperCase()}</span></td>
                                      <td className="py-3 px-2 text-right">
                                        <div className="flex items-center justify-end gap-1.5"><span className="font-black text-black">{lead.score}</span><div className="w-10 bg-black border border-black rounded-none h-1 overflow-hidden hidden sm:block"><div className="h-full bg-[#00ff66]" style={{ width: `${lead.score}%` }} /></div></div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>

          <nav className="md:hidden fixed bottom-0 left-0 w-full z-45 bg-black border-t border-[#00ff66]/10 flex justify-around items-center h-16">
            {[
              { id: 'extract', icon: 'target', label: 'EXTRACT' },
              { id: 'pipeline', icon: 'analytics', label: 'PIPELINE' },
              { id: 'insights', icon: 'monitoring', label: 'INSIGHTS' }
            ].map(t => (
              <button key={t.id} onClick={() => handleTabChange(t.id)} className={`flex flex-col items-center justify-center py-2 px-4 transition ${activeTab === t.id ? 'text-[#00ff66]' : 'text-slate-500'}`}>
                <span className="material-symbols-outlined text-lg leading-none">{t.icon}</span>
                <span className="font-mono text-[8px] mt-0.5 font-bold tracking-wider">{t.label}</span>
              </button>
            ))}
          </nav>

          <IshuWidget hashtags={hashtags} platform={platform} totalCards={totalPipelineCards} workspaceProfile={workspaceProfile} />
          {toast && (
            <div className="fixed bottom-6 left-6 z-[997] flex items-center gap-2.5 bg-black border border-[#00ff66] px-4 py-3 shadow-[4px_4px_0px_#000000] text-[#00ff66]">
              <span className="material-symbols-outlined text-[#00ff66] text-sm animate-bounce">check_circle</span>
              <span className="font-mono text-[10px] tracking-wider font-bold">{toast.toUpperCase()}</span>
            </div>
          )}
        </>
      )}
    </div>
      {rocketTransition && (
        <CleanRocketTransition
          key={rocketTransition.id || 'crm-rocket'}
          direction={rocketTransition.direction}
          duration={700}
          onComplete={() => setRocketTransition(null)}
        />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   ISHU AI ADVISOR COMPONENT WIDGET
   ───────────────────────────────────────────── */
function IshuWidget({ hashtags, platform, totalCards, workspaceProfile }) {
  const [open, setOpen] = useState(false);
  const [typedWelcome, setTypedWelcome] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [typing, setTyping] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [welcomed, setWelcomed] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => { setOpen(true); }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open || welcomed) return;
    setWelcomed(true);

    const message = "Greetings, entrepreneur! I am Ishu, your B2B Consulting Advisor. Ask me anything about MVPs, pre-seed fundraising, customer churn, inside sales, scaling playbooks, or startup team hiring — or ask me to create a customized PDF Business Plan for your venture! 🦈";
    let index = 0;
    const interval = setInterval(() => {
      if (index < message.length) {
        setTypedWelcome(prev => prev + message.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [open, welcomed]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, typing, isGeneratingPlan, typedWelcome]);

  const handleGeneratePlan = async (customIdea = '') => {
    if (typing || isGeneratingPlan) return;
    const topic = customIdea.trim() || `Autonomous B2B Lead Extraction & Scaling Engine for ${workspaceProfile || 'Enterprise B2B'}`;
    
    setChatHistory(prev => [
      ...prev,
      { sender: 'user', text: `📄 Request: Generate downloadable PDF for "${topic}"` }
    ]);
    setIsGeneratingPlan(true);

    try {
      const formattedHistory = chatHistory.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch('http://localhost:8001/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic,
          history: formattedHistory
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data && data.status === 'success') {
        setChatHistory(prev => [
          ...prev,
          {
            sender: 'ishu',
            text: `Document compiled successfully! I've structured tailored sections plus an operational milestone matrix for "${topic}".`,
            isPdf: true,
            pdfUrl: data.pdf_url,
            filename: data.filename,
            title: data.title,
            subtitle: data.subtitle,
            docType: data.doc_type || 'Document'
          }
        ]);
      } else {
        throw new Error(data.error || 'Failed to synthesize document');
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ishu',
          text: `⚠️ Unable to complete PDF synthesis: ${err.message}. Please verify the backend is running on http://localhost:8001 and try again.`
        }
      ]);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputVal.trim() || typing || isGeneratingPlan) return;

    const userText = inputVal.trim();
    const pdfIntentRegex = /\b(pdf|downloadable|download|export|document|doc|sheet|budget\s*plan|roadmap|action\s*plan|cheat\s*sheet|checklist|sprint\s*plan|business\s*plan|pitch\s*deck)\b/i;
    const isDirectDocAction = /(make|can you|give me|create|generate|save|turn|export|download).*(pdf|downloadable|document|doc|sheet)/i.test(userText);
    const isPdfRequest = pdfIntentRegex.test(userText) || isDirectDocAction;

    // Check for conversational document / PDF generation intent
    if (isPdfRequest) {
      setInputVal('');
      handleGeneratePlan(userText);
      return;
    }

    const newHistory = [...chatHistory, { sender: 'user', text: userText }];
    setChatHistory(newHistory);
    setInputVal('');
    setTyping(true);

    try {
      const formattedHistory = newHistory.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch('http://localhost:8001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: formattedHistory
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data && (data.is_pdf || data.pdf_url)) {
        setChatHistory(prev => [
          ...prev,
          {
            sender: 'ishu',
            text: data.reply || `I've compiled your downloadable PDF: "${data.title}".`,
            isPdf: true,
            pdfUrl: data.pdf_url,
            filename: data.filename,
            title: data.title,
            subtitle: data.subtitle,
            docType: data.doc_type || 'Document'
          }
        ]);
      } else if (data && data.reply) {
        setChatHistory(prev => [...prev, { sender: 'ishu', text: data.reply, provider: 'gemini' }]);
      } else {
        const fallback = generateIshuB2BReply(userText, hashtags, platform, totalCards);
        setChatHistory(prev => [...prev, { sender: 'ishu', text: fallback, provider: 'fallback' }]);
      }
    } catch (err) {
      console.warn('Ishu backend call notice, using local knowledgebase fallback:', err);
      const fallback = generateIshuB2BReply(userText, hashtags, platform, totalCards);
      setChatHistory(prev => [...prev, { sender: 'ishu', text: fallback, provider: 'fallback' }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[998] flex flex-col items-end gap-3 pointer-events-none">
      {open && (
        <div className="bg-black/95 border border-[#00ff66]/30 p-4 w-96 max-w-[calc(100vw-32px)] text-left pointer-events-auto shadow-[0_0_25px_rgba(0,255,102,0.25)] relative">
          <div className="scanline" />
          <div className="flex justify-between items-center border-b border-[#00ff66]/20 pb-2 mb-2.5">
            <span className="font-mono text-[9px] font-black text-slate-300 tracking-wider flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff66]"></span>
              </span>
              ISHU_B2B_ADVISOR // AI ADVISORY CORE
            </span>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white transition" title="Close"><X className="w-3.5 h-3.5" /></button>
          </div>

          {/* Static Hint Line */}
          <div className="mb-2 flex items-center justify-between gap-2 bg-[#00ff66]/5 border border-[#00ff66]/20 p-1.5 select-none">
            <span className="font-mono text-[8.5px] text-[#00ff66] flex items-center gap-1 font-bold">
              <Sparkles className="w-3 h-3 text-[#00ff66]" /> ISHU ADVISORY
            </span>
            <span className="font-mono text-[8px] text-slate-400">
              Ishu is ready to plan, strategize and generate PDFs
            </span>
          </div>

          <div ref={scrollRef} className="font-mono text-[10px] leading-relaxed h-64 overflow-y-auto space-y-3 pr-1.5 p-2.5 bg-black/60 border border-[#00ff66]/15 text-slate-200">
            <div className="whitespace-pre-line">
              <span className="text-[#00ff66] font-bold">ISHU: </span>
              {typedWelcome}{!welcomed && <span className="blink-cursor" />}
            </div>
            {chatHistory.map((chat, idx) => (
              <div key={idx} className="border-t border-white/5 pt-2">
                <div className="whitespace-pre-line">
                  <span className={chat.sender === 'user' ? 'text-white font-black' : 'text-[#00ff66] font-bold'}>
                    {chat.sender === 'user' ? 'YOU: ' : 'ISHU: '}
                  </span>
                  {chat.text}
                </div>

                {/* PDF Plan Download Card */}
                {chat.isPdf && (
                  <div className="my-2.5 p-3 bg-[#0a0a0f] border border-[#00ff66] shadow-[0_0_12px_rgba(0,255,102,0.15)] text-left">
                    <div className="flex items-start gap-2.5 mb-2">
                      <div className="p-1.5 bg-[#00ff66] text-black">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-[11px] leading-tight truncate">{chat.title || 'B2B Strategic Document'}</p>
                        <p className="font-mono text-[8px] text-[#00ff66] truncate">{chat.subtitle || 'Autonomous Strategy & Execution Playbook'}</p>
                      </div>
                    </div>
                    <div className="font-mono text-[8px] text-slate-400 mb-2.5 space-y-0.5 border-t border-white/10 pt-1.5">
                      <div>&bull; Tailored Strategic Sections & Tactical Takeaways</div>
                      <div>&bull; Milestone & Operational Breakdown Matrix</div>
                    </div>
                    <a
                      href={chat.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 bg-[#00ff66] hover:bg-[#10b981] text-black font-mono font-black text-[9px] tracking-wider flex items-center justify-center gap-1.5 transition border border-black shadow-[2px_2px_0px_#000000]"
                    >
                      <Download className="w-3 h-3" /> DOWNLOAD PDF DOCUMENT
                    </a>
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex gap-1.5 items-center py-1 text-slate-400 font-mono text-[9px]">
                <span className="text-[#00ff66] font-bold">ISHU: </span>
                <span>Synthesizing startup advice</span>
                <div className="dot-pulse" />
                <div className="dot-pulse" />
                <div className="dot-pulse" />
              </div>
            )}
            {isGeneratingPlan && (
              <div className="flex gap-1.5 items-center py-1 text-[#00ff66] font-mono text-[9px] bg-[#00ff66]/10 p-2 border border-[#00ff66]/30">
                <FileText className="w-3.5 h-3.5 animate-pulse" />
                <span>Compiling custom PDF document via ReportLab...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-3 flex gap-1.5 border-t border-[#00ff66]/20 pt-3">
            <input
              type="text"
              placeholder="Ask advice or type 'make this a pdf'..."
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              className="input-dark flex-1 text-[10px] px-2.5 py-1.5 rounded-none"
            />
            <button
              type="submit"
              disabled={typing || isGeneratingPlan || !inputVal.trim()}
              className="bg-[#00ff66] disabled:opacity-50 text-black font-mono text-[9px] px-3 font-bold border border-black hover:bg-[#10b981] transition shadow-[2px_2px_0px_#000000]"
            >
              SEND
            </button>
          </form>
        </div>
      )}
      <button onClick={() => setOpen(prev => !prev)} className="pointer-events-auto ishu-float bg-[#00ff66] hover:bg-[#10b981] border border-black p-2 rounded-none shadow-[0_0_15px_rgba(0,255,102,0.4)] transition flex items-center justify-center relative overflow-hidden">
        <div className="scanline" />
        <IshuSharkSVG size={60} />
      </button>
    </div>
  );
}


