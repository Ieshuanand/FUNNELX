import React, { useEffect, useRef } from 'react';
import { Flame } from 'lucide-react';

export default function FunnelXLanding({ onIgnite, onViewTelemetry }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef([0.0, 0.0]);
  const wheelRef = useRef(0.0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) {
      console.error("WebGL2 is not supported on this device/browser.");
      return;
    }

    // Vertex Shader Source
    const vsSource = `#version 300 es
      in vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // WebGL2 Fragment Shader with Raymarched 3D boxes, glow, AO, shadows, and color grading
    const fsSource = `#version 300 es
      precision highp float;
      out vec4 fragColor;

      uniform vec2 resolution;
      uniform float time;
      uniform vec2 move;
      uniform float wheel;

      mat2 rot(float a) {
        float c = cos(a), s = sin(a);
        return mat2(c, -s, s, c);
      }

      float sdBox(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
      }

      float map(vec3 p, out float matId, out float glow) {
        // Repeated Grid spacing for infinite look
        vec2 spacing = vec2(6.0, 6.0);
        vec2 cellId = floor((p.xz + spacing * 0.5) / spacing);
        
        vec3 pGrid = p;
        pGrid.xz = mod(p.xz + spacing * 0.5, spacing) - spacing * 0.5;
        
        // Dynamically elevate box height over time and cell coords
        float wave = sin(cellId.x * 0.7 + cellId.y * 1.1 + time * 0.8) * 1.5;
        // Mouse coordinate move.y raises height globally
        float h = 2.0 + wave + move.y * 1.2;
        
        // Apply scroll wheel offset to the vertical translation
        vec3 boxPos = pGrid;
        boxPos.y += wheel * 0.008;
        
        // Rotate box slightly
        boxPos.xz *= rot(time * 0.15 + (cellId.x + cellId.y) * 0.2);
        
        float boxD = sdBox(boxPos - vec3(0.0, -1.0, 0.0), vec3(1.0, h, 1.0));
        
        // Small floating particles that glow
        vec3 pFloat = p;
        pFloat.xz = mod(p.xz + 3.0, 6.0) - 3.0;
        pFloat.y -= time * 1.2 - wheel * 0.03;
        pFloat.y = mod(pFloat.y + 5.0, 10.0) - 5.0;
        pFloat.xy *= rot(time * 0.45);
        pFloat.yz *= rot(time * 0.3);
        
        float floatD = sdBox(pFloat, vec3(0.18));
        
        // Glow accumulation inside map function
        glow += 0.015 / (0.02 + floatD * floatD);
        glow += 0.007 / (0.015 + boxD * boxD);
        
        if (boxD < floatD) {
          matId = 1.0;
          return boxD;
        } else {
          matId = 2.0;
          return floatD;
        }
      }

      vec3 calcNormal(vec3 p) {
        float m, g;
        vec2 e = vec2(0.002, 0.0);
        return normalize(vec3(
          map(p + e.xyy, m, g) - map(p - e.xyy, m, g),
          map(p + e.yxy, m, g) - map(p - e.yxy, m, g),
          map(p + e.yyx, m, g) - map(p - e.yyx, m, g)
        ));
      }

      float calcAO(vec3 p, vec3 n) {
        float occ = 0.0;
        float sca = 1.0;
        for(int i = 0; i < 5; i++) {
          float hr = 0.01 + 0.12 * float(i) / 4.0;
          vec3 aopos = n * hr + p;
          float m, g;
          float dd = map(aopos, m, g);
          occ += -(dd - hr) * sca;
          sca *= 0.95;
        }
        return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
      }

      float calcShadow(vec3 ro, vec3 rd, float mint, float tmax) {
        float res = 1.0;
        float t = mint;
        for(int i = 0; i < 16; i++) {
          float m, g;
          float h = map(ro + rd * t, m, g);
          res = min(res, 8.0 * h / t);
          t += clamp(h, 0.02, 0.12);
          if(h < 0.001 || t > tmax) break;
        }
        return clamp(res, 0.0, 1.0);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
        
        // Dynamic camera coordinate calculations
        float angle = time * 0.045 + move.x * 0.35;
        float radius = 11.0;
        vec3 ro = vec3(radius * sin(angle), 4.0 + sin(time * 0.1) * 1.5, radius * cos(angle));
        vec3 ta = vec3(0.0, 0.0, 0.0);
        
        vec3 cw = normalize(ta - ro);
        vec3 cp = vec3(0.0, 1.0, 0.0);
        vec3 cu = normalize(cross(cw, cp));
        vec3 cv = cross(cu, cw);
        vec3 rd = normalize(uv.x * cu + uv.y * cv + 1.35 * cw);
        
        float t = 0.0;
        float maxT = 38.0;
        float matId = 0.0;
        float glow = 0.0;
        bool hit = false;
        
        for(int i = 0; i < 80; i++) {
          float m;
          float g = 0.0;
          float d = map(ro + rd * t, m, g);
          glow += g;
          if(d < 0.001) {
            hit = true;
            matId = m;
            break;
          }
          t += d * 0.85;
          if(t > maxT) break;
        }
        
        // Deep cyber backdrop
        vec3 bgCol = vec3(0.008, 0.012, 0.025) * (1.0 - 0.45 * length(uv));
        vec3 col = vec3(0.0);
        
        if (hit) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          vec3 r = reflect(rd, n);
          
          vec3 lightPos = vec3(4.0, 12.0, 4.0);
          vec3 lightDir = normalize(lightPos - p);
          
          float dif = clamp(dot(n, lightDir), 0.0, 1.0);
          float spe = pow(clamp(dot(r, lightDir), 0.0, 1.0), 16.0);
          float sha = calcShadow(p, lightDir, 0.02, 10.0);
          float ao = calcAO(p, n);
          
          vec3 matCol = vec3(0.0);
          if(matId == 1.0) {
            // Cyber block metallic finish
            matCol = vec3(0.03, 0.04, 0.05);
            // Glowing neon borders
            float edge = 1.0 - max(max(abs(n.x), abs(n.y)), abs(n.z));
            if (edge > 0.0) {
              matCol += vec3(0.0, 0.95, 0.35) * pow(edge, 5.5);
            }
          } else if(matId == 2.0) {
            // Dynamic floating dust
            matCol = vec3(0.0, 1.0, 0.45);
          }
          
          vec3 amb = vec3(0.008, 0.012, 0.018) * ao;
          col = matCol * (dif * sha + 0.15) + spe * sha * 0.45 + amb;
          
          // Distance fog
          float fog = 1.0 - exp(-0.022 * t);
          col = mix(col, bgCol, fog);
        } else {
          col = bgCol;
        }
        
        // Add particle glows
        col += vec3(0.0, 1.0, 0.35) * glow * 0.015;
        
        // Color correction and Reinhardt tone-mapping
        col = col / (col + vec3(1.0));
        col = pow(col, vec3(0.4545));
        
        // Edge vignette
        vec2 sUv = gl_FragCoord.xy / resolution.xy;
        col *= 0.5 + 0.5 * pow(16.0 * sUv.x * sUv.y * (1.0 - sUv.x) * (1.0 - sUv.y), 0.25);
        
        fragColor = vec4(col, 1.0);
      }
    `;

    // Helper compiler function
    const compileShader = (source, type) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader Compile Error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Shader Program Link Failure:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Geometry buffer for a full screen quad
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform mapping handles
    const resolutionLoc = gl.getUniformLocation(program, "resolution");
    const timeLoc = gl.getUniformLocation(program, "time");
    const moveLoc = gl.getUniformLocation(program, "move");
    const wheelLoc = gl.getUniformLocation(program, "wheel");

    let animId;
    const startTime = performance.now();

    const resizeCanvas = () => {
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const render = () => {
      const timeVal = (performance.now() - startTime) * 0.001;

      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Bind dynamic uniform state values
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, timeVal);
      gl.uniform2f(moveLoc, mouseRef.current[0], mouseRef.current[1]);
      gl.uniform1f(wheelLoc, wheelRef.current);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Handle mouse movement coordinates (normalized between -1.0 and 1.0)
    const handleMouseMove = (e) => {
      const targetX = (e.clientX / window.innerWidth) * 2 - 1;
      const targetY = -(e.clientY / window.innerHeight) * 2 + 1;
      // Smooth interpolation drag
      mouseRef.current[0] += (targetX - mouseRef.current[0]) * 0.08;
      mouseRef.current[1] += (targetY - mouseRef.current[1]) * 0.08;
    };

    // Handle scroll offsets
    const handleWheel = (e) => {
      wheelRef.current += e.deltaY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(animId);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-black text-white flex flex-col justify-center items-center select-none">
      {/* Raw CSS animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fireSweep {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
        
        .fire-flicker-mask {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom, 
            transparent 0%, 
            rgba(255, 115, 0, 0.4) 30%, 
            rgba(255, 40, 0, 0.8) 50%, 
            rgba(255, 115, 0, 0.4) 70%, 
            transparent 100%
          );
          background-size: 100% 200%;
          mix-blend-mode: screen;
          pointer-events: none;
          animation: fireSweep 6s linear infinite;
        }

        @keyframes glitchSlide {
          0% { left: 0%; width: 15%; }
          45% { left: 80%; width: 10%; }
          50% { left: 75%; width: 25%; }
          85% { left: 5%; width: 12%; }
          100% { left: 0%; width: 15%; }
        }

        .glitch-bar {
          position: absolute;
          bottom: -6px;
          height: 3px;
          background: #00ff66;
          box-shadow: 0 0 10px #00ff66, 0 0 25px rgba(0, 255, 102, 0.7);
          animation: glitchSlide 4s cubic-bezier(0.85, 0, 0.15, 1) infinite;
        }
        
        /* Font styles fallback */
        .sync-font {
          font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif;
        }
      `}} />

      {/* Full-screen WebGL2 canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* Dark gradient overlay for typography readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75 pointer-events-none z-10" />

      {/* Center Hero Overlay */}
      <div className="relative z-20 flex flex-col justify-center items-center text-center px-6 max-w-4xl">
        
        {/* Top Status Badge */}
        <div className="mb-8 inline-flex items-center gap-2.5 px-4 py-2 bg-black/70 border border-white/10 rounded-none text-[10px] font-mono tracking-widest text-zinc-300 uppercase shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          AUTOMATED LEAD GENERATION ENGINE
        </div>

        {/* Heading Container */}
        <div className="relative mb-6">
          <h1 className="sync-font text-5xl md:text-8xl font-black tracking-tighter flex items-center justify-center">
            {/* FUNNEL */}
            <span className="relative inline-block bg-gradient-to-r from-white via-zinc-100 to-emerald-400 bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(16,185,129,0.55)] pr-1 select-none">
              FUNNEL
            </span>
            {/* X */}
            <span className="relative inline-block bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(249,115,22,0.7)] select-none">
              X
            </span>
            {/* Fire flicker sweep overlay */}
            <div className="fire-flicker-mask" />
          </h1>
          {/* Glitch underline bar */}
          <div className="relative w-full h-[3px] bg-white/10 mt-1.5">
            <div className="glitch-bar" />
          </div>
        </div>

        {/* Tagline */}
        <p className="font-mono text-xs tracking-wider text-emerald-400/90 mb-6 uppercase">
          // Precision Extraction. Zero Friction. Infinite Scale.
        </p>

        {/* Quote */}
        <p className="text-zinc-400 text-lg md:text-xl font-normal max-w-2xl leading-relaxed mt-2">
          Command the void. We don't chase leads — we{' '}
          <span className="text-orange-500 font-bold drop-shadow-[0_0_8px_rgba(249,115,22,0.45)]">
            architect the gravity
          </span>{' '}
          that pulls them into your orbit.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center items-center w-full max-w-md">
          <button 
            onClick={onIgnite}
            className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-10 py-4 bg-[#00ff66] text-black font-bold tracking-widest text-xs uppercase transition-all duration-300 border border-[#00ff66] hover:bg-black hover:text-[#00ff66] hover:shadow-[0_0_30px_rgba(0,255,102,0.6)] group rounded-none"
          >
            <Flame className="w-4 h-4 fill-current group-hover:animate-bounce" />
            IGNITE PIPELINE
          </button>
          <button 
            onClick={onViewTelemetry}
            className="w-full sm:w-auto px-10 py-4 bg-transparent text-white font-bold tracking-widest text-xs uppercase border border-white/20 transition-all duration-300 hover:border-white hover:bg-white/5 rounded-none"
          >
            VIEW TELEMETRY
          </button>
        </div>

      </div>
    </div>
  );
}
