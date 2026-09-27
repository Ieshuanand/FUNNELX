import React, { useEffect, useRef, useState } from 'react';
import './funnelx-opening.css';

export default function FunnelxOpening({ onSelectPath }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef([0.0, 0.0]);
  const wheelRef = useRef([0.0, 0.0]);
  const handlePathClick = (e, path) => {
    onSelectPath(path);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) {
      console.error("WebGL2 is not supported on this device/browser.");
      return;
    }

    // Vertex Shader Source
    const vsSource = '#version 300 es\n' +
      'in vec2 position;\n' +
      'void main() {\n' +
      '  gl_Position = vec4(position, 0.0, 1.0);\n' +
      '}\n';

    // WebGL2 Fragment Shader Source (Matthias Hurrle @atzedent GLSL)
    const fsSource = '#version 300 es\n' +
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
      '  k*=log(2.);\n' +
      '  float x=b-a;\n' +
      '  return a+x/(1.-exp2(x/k));\n' +
      '}\n' +
      'float box(vec3 p, vec3 s, float r) {\n' +
      '  p=abs(p)-s+r;\n' +
      '  return length(max(p,.0))+min(.0,max(max(p.x,p.y),p.z))-r;\n' +
      '}\n' +
      'float glow = 0.0;\n' +
      'float map(vec3 p, bool g) {\n' +
      '  float d=5e5;\n' +
      '  if (g) {\n' +
      '    d=length(p-LP+vec3(.2,.2,0))-.02;\n' +
      '    glow+=.05/(.05+d*d*80.);\n' +
      '  }\n' +
      '  p.z-=T*3.5;\n' +
      '  p=fract(p)-.5;\n' +
      '  vec4 k=vec4(1,.05,.03,.1);\n' +
      '  float r=1e-2;\n' +
      '  return min(d,smin(\n' +
      '    box(p,k.www,r),\n' +
      '    min(\n' +
      '      box(p,k.zxz,r),\n' +
      '      min(box(p,k.xyz,r),box(p,k.yzx,r))\n' +
      '    ),.01\n' +
      '  ));\n' +
      '}\n' +
      'vec3 norm(vec3 p) {\n' +
      '  float h=1e-3; vec2 k=vec2(-1,1);\n' +
      '  return N(\n' +
      '    k.xyy*map(p+k.xyy*h,false)+\n' +
      '    k.yxy*map(p+k.yxy*h,false)+\n' +
      '    k.yyx*map(p+k.yyx*h,false)+\n' +
      '    k.xxx*map(p+k.xxx*h,false)\n' +
      '  );\n' +
      '}\n' +
      'bool march(inout vec3 p, vec3 rd, inout float dd, inout float at) {\n' +
      '  for (float i = 0.0; i++ < 400.;) {\n' +
      '    float d=map(p,true);\n' +
      '    if (abs(d)<1e-3) return true;\n' +
      '    if (d>100.) return false;\n' +
      '    p+=rd*d;\n' +
      '    dd+=d;\n' +
      '    at+=.05*(.05/dd);\n' +
      '  }\n' +
      '  return false;\n' +
      '}\n' +
      'vec3 dir(vec2 uv, vec3 p, vec3 t, float z) {\n' +
      '  vec3 up=vec3(0,1,0),\n' +
      '  f=N(t-p),\n' +
      '  r=N(cross(up,f)),\n' +
      '  u=N(cross(f,r));\n' +
      '  return mat3(r,u,f)*N(vec3(uv,z));\n' +
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
      '  vec2 p=fract(a*vec2(12.9898,78.233));\n' +
      '  p+=dot(p,p+34.56);\n' +
      '  return fract(p.x*p.y);\n' +
      '}\n' +
      'float curve(float t, float e) {\n' +
      '  t/=e;\n' +
      '  return mix(\n' +
      '    rnd(floor(t)),\n' +
      '    rnd(floor(t)+1.),\n' +
      '    pow(S(.0,1.,fract(t)),10.)\n' +
      '  );\n' +
      '}\n' +
      'vec3 org() {\n' +
      '  float k=-.2*sin(sin(T)), drama=3.14*curve(T*.2,2.);\n' +
      '  vec2 m=move/R;\n' +
      '  vec3 ro=vec3(0,0,.1);\n' +
      '  ro*=rotX(m.y*6.3-k-.1+drama/12.)*rotY(m.x*6.3-.45-sin(cos(T*.2-k+drama)));\n' +
      '  return ro;\n' +
      '}\n' +
      'float shadow(vec3 p, vec3 lp) {\n' +
      '  float shd=1., maxd=length(lp-p);\n' +
      '  vec3 l=N(lp-p);\n' +
      '  for (float i=1e-3; i<maxd;) {\n' +
      '    float d=map(p+l*i,false);\n' +
      '    if (d<1e-3) {\n' +
      '      shd=.0;\n' +
      '      break;\n' +
      '    }\n' +
      '    shd=min(shd,64.*d/i);\n' +
      '    i+=d;\n' +
      '  }\n' +
      '  return shd;\n' +
      '}\n' +
      'float calcAO(vec3 p, vec3 n) {\n' +
      '  float occ=.0, sca=1.;\n' +
      '  for (float i=.0; i<5.; i++) {\n' +
      '    float\n' +
      '    h=.01+i*.09,\n' +
      '    d=map(p+h*n,false);\n' +
      '    occ+=(h-d)*sca;\n' +
      '    sca*=.55;\n' +
      '    if (occ>.35) break;\n' +
      '  }\n' +
      '  return clamp(1.-3.*occ,.0,1.)*(.5+.5*n.y);\n' +
      '}\n' +
      'vec3 render(vec2 uv) {\n' +
      '  vec3 col=vec3(0),\n' +
      '  p=org(), ro=p,\n' +
      '  rd=dir(uv,p,vec3(0),1.);\n' +
      '  float dd = 0.0, at = 0.0;\n' +
      '  if (march(p,rd,dd,at)) {\n' +
      '    vec3 n=norm(p), lp=LP, l=N(lp-p),\n' +
      '    e=N(ro-p), r=reflect(-l,n);\n' +
      '    float ld=distance(lp,p), atten=1./(1.+ld*.25+ld*ld*.125),\n' +
      '    ao=calcAO(p,n), shd=shadow(p+n*5e-2,lp);\n' +
      '    col+=shd*atten*vec3(.1,.095,.09)+clamp(dot(l,n),.0,1.)*atten*ao*shd;\n' +
      '    col+=pow(max(.0,dot(r,e)),8.)*atten*ao*shd;\n' +
      '    col+=clamp(dot(-rd,l),.0,1.)*ao*atten*1.2;\n' +
      '  }\n' +
      '  float k=mix(max(.2,1.-distance(LP,ro)),.25,fract(sin(dot(ro,vec3(12.9898,78.233,156.345)))*345678.)),\n' +
      '  f=S(1.,.0,clamp(dd/200.,.0,1.));\n' +
      '  vec3 tint=vec3(1.2,.95,.9);\n' +
      '  col+=tint*at*k;\n' +
      '  col+=hue(3.14*k+f*f*f)*k*k;\n' +
      '  col=mix(col,vec3(1,.95,.9),S(.0,50.,distance(p,ro)));\n' +
      '  col=tanh(col*col);\n' +
      '  col=sqrt(col);\n' +
      '  col=mix(sqrt(col)*1.2,col,clamp(S(-.1,.2,dot(uv,uv)),.0,1.));\n' +
      '  col+=tanh(tint*glow);\n' +
      '  vec2 c=FC/R;\n' +
      '  c*=1.-c.yx;\n' +
      '  float vig=c.x*c.y*25.;\n' +
      '  vig=pow(vig,.25);\n' +
      '  col*=vig;\n' +
      '  return col;\n' +
      '}\n';

    // Helper compiler function
    const compileShader = (source, type) => {
      const shader = gl.createShader(type);
      const trimmed = source.trim();
      console.log("Shader Type:", type === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT");
      console.log("Shader First Line:", trimmed.split('\n')[0]);
      gl.shaderSource(shader, trimmed);
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

    // Quad geometry (2 triangles)
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

    // Uniform handles
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

      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, timeVal);
      gl.uniform2f(moveLoc, mouseRef.current[0], mouseRef.current[1]);
      gl.uniform2f(wheelLoc, wheelRef.current[0], wheelRef.current[1]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Track mouse coordinate values
    const handleMouseMove = (e) => {
      // Smooth target interpolation
      mouseRef.current[0] += (e.clientX - mouseRef.current[0]) * 0.1;
      mouseRef.current[1] += (e.clientY - mouseRef.current[1]) * 0.1;
    };

    // Track scroll events
    const handleWheel = (e) => {
      wheelRef.current[0] += e.deltaX;
      wheelRef.current[1] += e.deltaY;
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
    <div className="intro-container">
      <canvas id="intro-canvas" ref={canvasRef} />

      <h1 className="fiery-title">FUNNELX</h1>

      <div className="intro-path-box">
        <h2>Choose Your Path</h2>
        <p>Select operational profile to deploy scanner</p>
        <div className="path-buttons">
          <button className="path-btn" onClick={(e) => handlePathClick(e, 'digital-creator')}>
            // DIGITAL CREATOR
          </button>
          <button className="path-btn" onClick={(e) => handlePathClick(e, 'freelancer')}>
            // FREELANCER
          </button>
          <button className="path-btn" onClick={(e) => handlePathClick(e, 'enterprise-business')}>
            // ENTERPRISE BUSINESS
          </button>
        </div>
      </div>
    </div>
  );
}