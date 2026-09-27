import React, { useEffect, useRef } from 'react';
import { ArrowRight, Flame, Zap, Radio, ChevronDown } from 'lucide-react';

/* ============================================================
   FUNNELX LANDING — WebGL Shader Background + Flashy Heading
   ============================================================ */

const vertexShaderSource = '#version 300 es\n' +
  'in vec2 position;\n' +
  'void main() {\n' +
  '  gl_Position = vec4(position, 0.0, 1.0);\n' +
  '}\n';

const fragmentShaderSource = '#version 300 es\n' +
  'precision highp float;\n' +
  'out vec4 O;\n' +
  'uniform float time;\n' +
  'uniform vec2 resolution;\n' +
  'uniform vec2 move;\n' +
  'uniform vec2 wheel;\n' +
  '#define FC gl_FragCoord.xy\n' +
  '#define R resolution\n' +
  '#define T (time+113.+.2*wheel.y/MN)\n' +
  '#define S smoothstep\n' +
  '#define N normalize\n' +
  '#define MN min(R.x,R.y)\n' +
  '#define hue(a) (.5+.5*sin(3.14*(a)+vec3(1,2,3)))\n' +
  '#define LP vec3(1.+1.*sin(-T),2.-2.*cos(T),-3.-4.*sin(sin(T)))\n' +
  'vec3 render(vec2 uv);\n' +
  'void main() { O=vec4(render((FC-.5*R)/MN),1); }\n' +
  'float smin(float a, float b, float k) {\n' +
  '	k*=log(2.);\n' +
  '	float x=b-a;\n' +
  '	return a+x/(1.-exp2(x/k));\n' +
  '}\n' +
  'float box(vec3 p, vec3 s, float r) {\n' +
  '	p=abs(p)-s+r;\n' +
  '	return length(max(p,.0))+min(.0,max(max(p.x,p.y),p.z))-r;\n' +
  '}\n' +
  'float glow;\n' +
  'float map(vec3 p, bool g) {\n' +
  '	float d=5e5;\n' +
  '	if (g) {\n' +
  '		d=length(p-LP+vec3(.2,.2,0))-.02;\n' +
  '		glow+=.05/(.05+d*d*80.);\n' +
  '	}\n' +
  '	p.z-=T*3.5;\n' +
  '	p=fract(p)-.5;\n' +
  '	vec4 k=vec4(1,.05,.03,.1);\n' +
  '	float r=1e-2;\n' +
  '	return min(d,smin(\n' +
  '		box(p,k.www,r),\n' +
  '		min(\n' +
  '			box(p,k.zxz,r),\n' +
  '			min(box(p,k.xyz,r),box(p,k.yzx,r))\n' +
  '		),.01\n' +
  '	));\n' +
  '}\n' +
  'vec3 norm(vec3 p) {\n' +
  '	float h=1e-3; vec2 k=vec2(-1,1);\n' +
  '	return N(\n' +
  '		k.xyy*map(p+k.xyy*h,false)+\n' +
  '		k.yxy*map(p+k.yxy*h,false)+\n' +
  '		k.yyx*map(p+k.yyx*h,false)+\n' +
  '		k.xxx*map(p+k.xxx*h,false)\n' +
  '	);\n' +
  '}\n' +
  'bool march(inout vec3 p, vec3 rd, inout float dd, inout float at) {\n' +
  '	for (float i = 0.0; i++ < 400.;) {\n' +
  '		float d=map(p,true);\n' +
  '		if (abs(d)<1e-3) return true;\n' +
  '		if (d>100.) return false;\n' +
  '		p+=rd*d;\n' +
  '		dd+=d;\n' +
  '		at+=.05*(.05/dd);\n' +
  '	}\n' +
  '  return false;\n' +
  '}\n' +
  'vec3 dir(vec2 uv, vec3 p, vec3 t, float z) {\n' +
  '	vec3 up=vec3(0,1,0),\n' +
  '	f=N(t-p),\n' +
  '	r=N(cross(up,f)),\n' +
  '	u=N(cross(f,r));\n' +
  '	return mat3(r,u,f)*N(vec3(uv,z));\n' +
  '}\n' +
  'mat3 rotX(float a) {\n' +
  '  float s=sin(a), c=cos(a);\n' +
  '  return mat3(vec3(1,0,0),vec3(0,c,-s),vec3(0,s,c));\n' +
  '}\n' +
  'mat3 rotY(float a) {\n' +
  '  float s=sin(a), c=cos(a);\n' +
  '  return mat3(vec3(c,0,s),vec3(0,1,0),vec3(-s,0,c));\n' +
  '}\n' +
  'float rnd(float a) {\n' +
  '	vec2 p=fract(a*vec2(12.9898,78.233));\n' +
  '	p+=dot(p,p+34.56);\n' +
  '	return fract(p.x*p.y);\n' +
  '}\n' +
  'float curve(float t, float e) {\n' +
  '	t/=e;\n' +
  '	return mix(\n' +
  '		rnd(floor(t)),\n' +
  '		rnd(floor(t)+1.),\n' +
  '		pow(S(.0,1.,fract(t)),10.)\n' +
  '	);\n' +
  '}\n' +
  'vec3 org() {\n' +
  '	float k=-.2*sin(sin(T)), drama=3.14*curve(T*.2,2.);\n' +
  '	vec2 m=move/R;\n' +
  '	vec3 ro=vec3(0,0,.1);\n' +
  '	ro*=rotX(m.y*6.3-k-.1+drama/12.)*rotY(m.x*6.3-.45-sin(cos(T*.2-k+drama)));\n' +
  '	return ro;\n' +
  '}\n' +
  'float shadow(vec3 p, vec3 lp) {\n' +
  '	float shd=1., maxd=length(lp-p);\n' +
  '	vec3 l=N(lp-p);\n' +
  '	for (float i=1e-3; i<maxd;) {\n' +
  '		float d=map(p+l*i,false);\n' +
  '		if (d<1e-3) {\n' +
  '			shd=.0;\n' +
  '			break;\n' +
  '		}\n' +
  '		shd=min(shd,64.*d/i);\n' +
  '		i+=d;\n' +
  '	}\n' +
  '	return shd;\n' +
  '}\n' +
  'float calcAO(vec3 p, vec3 n) {\n' +
  '	float occ=.0, sca=1.;\n' +
  '	for (float i=.0; i<5.; i++) {\n' +
  '		float\n' +
  '		h=.01+i*.09,\n' +
  '		d=map(p+h*n,false);\n' +
  '		occ+=(h-d)*sca;\n' +
  '		sca*=.55;\n' +
  '		if (occ>.35) break;\n' +
  '	}\n' +
  '	return clamp(1.-3.*occ,.0,1.)*(.5+.5*n.y);\n' +
  '}\n' +
  'vec3 render(vec2 uv) {\n' +
  '	vec3 col=vec3(0),\n' +
  '	p=org(), ro=p,\n' +
  '	rd=dir(uv,p,vec3(0),1.);\n' +
  '	float dd = 0.0, at = 0.0;\n' +
  '	if (march(p,rd,dd,at)) {\n' +
  '		vec3 n=norm(p), lp=LP, l=N(lp-p),\n' +
  '		e=N(ro-p), r=reflect(-l,n);\n' +
  '		float ld=distance(lp,p), atten=1./(1.+ld*.25+ld*ld*.125),\n' +
  '		ao=calcAO(p,n), shd=shadow(p+n*5e-2,lp);\n' +
  '		col+=shd*atten*vec3(.1,.095,.09)+clamp(dot(l,n),.0,1.)*atten*ao*shd;\n' +
  '		col+=pow(max(.0,dot(r,e)),8.)*atten*ao*shd;\n' +
  '		col+=clamp(dot(-rd,l),.0,1.)*ao*atten*1.2;\n' +
  '	}\n' +
  '	// shine\n' +
  '	float k=mix(max(.2,1.-distance(LP,ro)),.25,fract(sin(dot(ro,vec3(12.9898,78.233,156.345)))*345678.)),\n' +
  '	f=S(1.,.0,clamp(dd/200.,.0,1.));\n' +
  '	vec3 tint=vec3(1.2,.95,.9);\n' +
  '	col+=tint*at*k;\n' +
  '	col+=hue(3.14*k+f*f*f)*k*k;\n' +
  '	// color grading\n' +
  '	col=mix(col,vec3(1,.95,.9),S(.0,50.,distance(p,ro)));\n' +
  '	col=tanh(col*col);\n' +
  '	col=sqrt(col);\n' +
  '	col=mix(sqrt(col)*1.2,col,clamp(S(-.1,.2,dot(uv,uv)),.0,1.));\n' +
  '	// glow\n' +
  '	col+=tanh(tint*glow);\n' +
  '	// vignette\n' +
  '	vec2 c=FC/R;\n' +
  '	c*=1.-c.yx;\n' +
  '	float vig=c.x*c.y*25.;\n' +
  '	vig=pow(vig,.25);\n' +
  '	col*=vig;\n' +
  '	return col;\n' +
  '}\n';

const ShaderBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const wheelRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false });
    if (!gl) {
      console.error('WebGL2 not supported');
      return;
    }

    // Compile shaders
    const compileShader = (source, type) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source.trim());
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fs = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Full-screen quad
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const timeLoc = gl.getUniformLocation(program, 'time');
    const resolutionLoc = gl.getUniformLocation(program, 'resolution');
    const moveLoc = gl.getUniformLocation(program, 'move');
    const wheelLoc = gl.getUniformLocation(program, 'wheel');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: canvas.offsetHeight - e.clientY };
    };

    const handleWheel = (e) => {
      wheelRef.current.y += e.deltaY * 0.01;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('wheel', handleWheel);

    const startTime = performance.now();

    const render = () => {
      frameRef.current = requestAnimationFrame(render);
      const time = (performance.now() - startTime) / 1000;

      gl.uniform1f(timeLoc, time);
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.uniform2f(moveLoc, mouseRef.current.x, mouseRef.current.y);
      gl.uniform2f(wheelLoc, wheelRef.current.x, wheelRef.current.y);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    render();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('wheel', handleWheel);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
};

/* ─── Flashy Fire Heading ─── */
const FireHeading = ({ onIgnite }) => {
  return (
    <div className="relative z-10 text-center select-none">
      {/* Glowing orb behind */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#00ff66]/10 blur-[120px] animate-pulse pointer-events-none" />

      {/* Subtitle badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#00ff66]/30 bg-black/60 backdrop-blur-sm mb-6">
        <Radio className="w-3 h-3 text-[#00ff66] animate-pulse" />
        <span className="text-[10px] font-mono tracking-[0.25em] text-[#00ff66] uppercase">
          Automated Lead Generation Engine
        </span>
      </div>

      {/* Main Title — Fire/Neon Effect */}
      <h1 className="relative text-7xl md:text-9xl font-black tracking-tighter leading-none mb-2">
        <span 
          className="relative inline-block"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #e0e0e0 30%, #00ff66 60%, #00cc44 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(0,255,102,0.5), 0 0 80px rgba(0,255,102,0.3), 0 0 120px rgba(0,255,102,0.1)',
            filter: 'drop-shadow(0 0 20px rgba(0,255,102,0.4))',
          }}
        >
          FUNNEL
        </span>
        <span 
          className="relative inline-block"
          style={{
            background: 'linear-gradient(180deg, #ff6b35 0%, #f97316 40%, #ff4500 70%, #cc3300 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(249,115,22,0.6), 0 0 80px rgba(249,115,22,0.4), 0 0 120px rgba(255,69,0,0.2)',
            filter: 'drop-shadow(0 0 25px rgba(249,115,22,0.5))',
          }}
        >
          X
        </span>

        {/* Fire flicker overlay */}
        <span 
          className="absolute inset-0 pointer-events-none opacity-60 mix-blend-screen"
          style={{
            background: 'linear-gradient(180deg, transparent 40%, rgba(0,255,102,0.15) 50%, rgba(249,115,22,0.2) 60%, transparent 70%)',
            backgroundSize: '100% 200%',
            animation: 'fireFlicker 2s ease-in-out infinite',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          FUNNELX
        </span>
      </h1>

      {/* Glitch underline */}
      <div className="relative h-1 w-48 mx-auto mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ff66] to-transparent" />
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f97316] to-transparent"
          style={{ animation: 'glitchSlide 3s infinite' }}
        />
      </div>

      {/* Motivational Quote */}
      <div className="max-w-xl mx-auto mb-12">
        <p className="text-lg md:text-xl text-gray-300 font-light tracking-wide leading-relaxed">
          <span className="text-[#00ff66] font-mono text-sm">&gt; </span>
          "Command the void. We don't chase leads — 
          <span className="text-[#f97316] font-semibold"> we architect the gravity </span> 
          that pulls them into your orbit."
        </p>
        <p className="text-xs font-mono text-gray-600 mt-3 tracking-widest uppercase">
          // Precision Extraction. Zero Friction. Infinite Scale.
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button 
          onClick={onIgnite}
          className="group relative px-10 py-5 bg-[#00ff66] text-black font-black tracking-[0.2em] text-sm hover:scale-105 transition-all duration-300 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Flame className="w-4 h-4" />
            IGNITE PIPELINE
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#00ff66] via-[#f97316] to-[#00ff66] opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
        </button>

        <button 
          onClick={onIgnite}
          className="px-10 py-5 border border-white/20 text-white font-mono text-sm tracking-[0.15em] hover:border-[#00ff66] hover:text-[#00ff66] transition-all duration-300 backdrop-blur-sm bg-black/30"
        >
          <Zap className="w-4 h-4 inline mr-2" />
          VIEW TELEMETRY
        </button>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-[10px] font-mono text-gray-600 tracking-widest">SCROLL TO CONFIGURE</span>
        <ChevronDown className="w-5 h-5 text-[#00ff66]" />
      </div>
    </div>
  );
};

/* ─── Main Landing Page ─── */
const FunnelXLandingShader = ({ onPathSelect }) => {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-sans">
      {/* Inject keyframes */}
      <style>{`
        @keyframes fireFlicker {
          0%, 100% { background-position: 0% 0%; }
          25% { background-position: 0% 30%; }
          50% { background-position: 0% 70%; }
          75% { background-position: 0% 40%; }
        }
        @keyframes glitchSlide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>

      {/* WebGL Shader Background */}
      <ShaderBackground />

      {/* Dark overlay for text readability */}
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <FireHeading onIgnite={() => onPathSelect('digital-creator')} />
      </div>
    </div>
  );
};

export default FunnelXLandingShader;
