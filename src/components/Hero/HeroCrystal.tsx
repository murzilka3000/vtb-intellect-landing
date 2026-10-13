"use client";

import { useEffect, useRef } from "react";

type Vec = [number, number, number];
type Crop = [number, number, number, number];
type Face = { p: Vec[]; z: number; lower: boolean; i: number };

const TAU = Math.PI * 2;
const FACETS = 8;
const TILT_X = 0.11;
const SIZE_W = 5.6;
const SIZE_H = 5;

const rotY = (p: Vec, a: number): Vec => [
  p[0] * Math.cos(a) + p[2] * Math.sin(a),
  p[1],
  -p[0] * Math.sin(a) + p[2] * Math.cos(a),
];
const rotX = (p: Vec, a: number): Vec => [
  p[0],
  p[1] * Math.cos(a) - p[2] * Math.sin(a),
  p[1] * Math.sin(a) + p[2] * Math.cos(a),
];
const rotZ = (p: Vec, a: number): Vec => [
  p[0] * Math.cos(a) - p[1] * Math.sin(a),
  p[0] * Math.sin(a) + p[1] * Math.cos(a),
  p[2],
];

const DEPTH_VERTEX = `attribute vec3 aPosition;uniform vec4 uCrop;void main(){float w=7.0-aPosition.z;vec2 xy=vec2(2.0*(aPosition.x-uCrop.x)/uCrop.z-1.0,1.0-2.0*(aPosition.y-uCrop.y)/uCrop.w);gl_Position=vec4(xy*w,(16.0*w-30.0)/14.0,w);}`;

const DEPTH_FRAGMENT = `precision highp float;void main(){vec4 e=fract(gl_FragCoord.z*vec4(1.0,255.0,65025.0,16581375.0));e-=e.yzww*vec4(1.0/255.0,1.0/255.0,1.0/255.0,0.0);gl_FragColor=e;}`;

const RIBBON_VERTEX = `attribute vec3 aPosition;attribute float aSide;uniform mat3 uRotation;uniform vec4 uView;varying float vSide;varying vec3 vNormal;varying vec3 vPosition;varying float vHeight;void main(){vec3 normal=aSide<1.5?normalize(vec3(aPosition.x,0.,aPosition.z))*(aSide<.5?1.:-1.):vec3(0.,sign(aPosition.y),0.);vNormal=uRotation*normal;vHeight=aPosition.y/.1125;vec3 p=uRotation*aPosition;vPosition=p;float w=7.0-p.z;gl_Position=vec4(p.x*uView.x,p.y*uView.y+uView.z*w,(16.0*w-30.0)/14.0,w);vSide=aSide;}`;

const RIBBON_FRAGMENT = `precision highp float;varying float vSide;varying vec3 vNormal;varying vec3 vPosition;varying float vHeight;uniform sampler2D uDepth;uniform vec2 uResolution;uniform vec4 uCrop;uniform vec3 uScene;uniform float uFront;
vec4 outerGlass(float x){
 if(x<.10)return mix(vec4(75.,145.,215.,.58),vec4(153.,207.,239.,.72),clamp(x/.10,0.,1.));
 if(x<.26)return mix(vec4(153.,207.,239.,.72),vec4(181.,220.,243.,.66),(x-.10)/.16);
 if(x<.42)return mix(vec4(181.,220.,243.,.66),vec4(109.,174.,227.,.58),(x-.26)/.16);
 if(x<.55)return mix(vec4(109.,174.,227.,.58),vec4(25.,105.,222.,.72),(x-.42)/.13);
 if(x<.64)return mix(vec4(25.,105.,222.,.72),vec4(39.,137.,231.,.70),(x-.55)/.09);
 if(x<.76)return mix(vec4(39.,137.,231.,.70),vec4(150.,207.,240.,.68),(x-.64)/.12);
 if(x<.84)return mix(vec4(150.,207.,240.,.68),vec4(207.,234.,248.,.78),(x-.76)/.08);
 if(x<.90)return mix(vec4(207.,234.,248.,.78),vec4(96.,172.,229.,.62),(x-.84)/.06);
 return mix(vec4(96.,172.,229.,.62),vec4(163.,207.,237.,.68),clamp((x-.90)/.10,0.,1.));}
vec4 innerGlass(float x){
 if(x<.20)return mix(vec4(100.,166.,221.,.48),vec4(183.,218.,239.,.58),clamp(x/.20,0.,1.));
 if(x<.36)return mix(vec4(183.,218.,239.,.58),vec4(224.,241.,250.,.68),(x-.20)/.16);
 if(x<.50)return mix(vec4(224.,241.,250.,.68),vec4(164.,205.,232.,.52),(x-.36)/.14);
 if(x<.76)return mix(vec4(164.,205.,232.,.52),vec4(172.,211.,235.,.56),(x-.50)/.26);
 return mix(vec4(172.,211.,235.,.56),vec4(113.,174.,221.,.50),clamp((x-.76)/.24,0.,1.));}
vec4 edgeGlass(float x){
 if(x<.25)return mix(vec4(150.,204.,239.,.72),vec4(98.,161.,219.,.65),clamp(x/.25,0.,1.));
 if(x<.55)return mix(vec4(98.,161.,219.,.65),vec4(48.,120.,209.,.72),(x-.25)/.30);
 if(x<.82)return mix(vec4(48.,120.,209.,.72),vec4(121.,181.,228.,.68),(x-.55)/.27);
 return mix(vec4(121.,181.,228.,.68),vec4(181.,218.,242.,.75),clamp((x-.82)/.18,0.,1.));}
float linearAt(vec2 p,vec2 a,vec2 b){vec2 d=b-a;return clamp(dot(p-a,d)/dot(d,d),0.,1.);}
void main(){vec2 uv=gl_FragCoord.xy/uResolution;float cz=dot(texture2D(uDepth,uv),vec4(1.0,1.0/255.0,1.0/65025.0,1.0/16581375.0));bool front=gl_FragCoord.z<cz+.000003;if((uFront>.5)!=front)discard;
 vec3 n=normalize(vNormal),view=normalize(vec3(0.,0.,7.)-vPosition);if(dot(n,view)<0.)n=-n;
 float fresnel=pow(1.-max(dot(n,view),0.),3.);
 vec3 reflected=reflect(-view,n);
 float soft=pow(max(dot(reflected,normalize(vec3(-.5,.75,1.))),0.),10.);
 float strip=pow(max(dot(reflected,normalize(vec3(-.65,.5,1.))),0.),70.);
 float cool=pow(max(dot(reflected,normalize(vec3(.8,-.15,1.))),0.),22.);
 float rim=smoothstep(.82,.99,abs(vHeight));
 vec2 uvScreen=gl_FragCoord.xy/uResolution;float band=exp(-pow((uvScreen.x-.28)/.17,2.))*.75+exp(-pow((uvScreen.x-.79)/.065,2.))*.6;soft=max(soft,band);strip=pow(max(dot(n,normalize(view+normalize(vec3(-.8,.65,1.2)))),0.),85.)*(.72+.28*cos(vHeight*1.6));vec3 body=mix(vec3(.035,.31,.88),vec3(.48,.83,1.),.58+.18*n.y);
 body=mix(body,vec3(.82,.96,1.),soft*.85);
 body=mix(body,vec3(.04,.20,.81),fresnel*.55);
 body+=vec3(.15,.25,.32)*cool;
 float alpha=.61+.12*fresnel+.16*soft;
 if(vSide>1.5){body=mix(vec3(.015,.12,.70),vec3(.16,.65,1.),soft+.3);alpha=.78;}
 else{body=mix(body,vec3(.015,.18,.79),rim*.65);float fine=exp(-pow((abs(vHeight)-.89)/.025,2.));body+=vec3(.38,.73,.9)*fine*(.22+.7*soft);}
 body=mix(body,vec3(.96,1.,1.),strip*.88);alpha=min(.91,alpha+strip*.22);
 vec4 color=vec4(clamp(body,0.,1.)*255.,alpha);
 gl_FragColor=vec4(color.rgb/255.*color.a,color.a);}`;

const CODE_BLOCKS: string[][] = [
  [
    "function predict(data) {",
    "  const w = [0.24, 0.68];",
    "  return data.map(x =>",
    "    x.value * w[0]);",
    "}",
    "",
    "const risk = model(data);",
    "if (risk < 0.08) {",
    "  invest(strategy);",
    "  balance += yieldValue;",
    "}",
    "",
    "const alpha = 0.024;",
    "let n = assets.length;",
    "for (let i = 0; i < n; i++) {",
    "  value += assets[i].price;",
    "}",
    "",
    "return { value, alpha };",
    "portfolio.update(value);",
  ],
  [
    "const horizon = 365;",
    "function rebalance(p) {",
    "  const total = sum(p);",
    "  return p.map(asset =>",
    "    asset.value / total);",
    "}",
    "",
    "let growth = [2, 3, 5];",
    "const rate = mean(growth);",
    "await model.fit(history);",
    "const next = rate * 1.02;",
    "",
    "if (next > threshold) {",
    "  weights[0] += 0.01;",
    "  weights[1] -= 0.01;",
    "}",
    "",
    "const state = { ready };",
    "return optimize(state);",
    "strategy.commit();",
  ],
  [
    "function score(x, y) {",
    "  return Math.sqrt(x*x",
    "    + y*y);",
    "}",
    "",
    "const nodes = new Map();",
    "nodes.set(id, asset);",
    "for (const p of nodes) {",
    "  update(p, market);",
    "}",
    "",
    "const delta = now - prev;",
    "let sum = values.reduce(",
    "  (a, b) => a + b, 0);",
    "const avg = sum / count;",
    "",
    "if (avg > target) {",
    "  return nextStep(avg);",
    "}",
    "yield { risk, returnRate };",
  ],
];

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function createTexture() {
  const texture = createCanvas(768, 1024);
  const tc = texture.getContext("2d");
  if (!tc) return texture;

  let grad = tc.createLinearGradient(0, 0, 768, 1024);
  (
    [
      [0, "rgba(0,49,197,.86)"],
      [0.28, "rgba(0,123,226,.65)"],
      [0.52, "rgba(37,193,240,.42)"],
      [0.76, "rgba(0,117,224,.65)"],
      [1, "rgba(0,43,174,.84)"],
    ] as [number, string][]
  ).forEach(([x, c]) => grad.addColorStop(x, c));
  tc.fillStyle = grad;
  tc.fillRect(0, 0, 768, 1024);

  let seed = 71;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 24; i++) {
    const x = rnd() * 768;
    const y = rnd() * 1024;
    const r = 35 + rnd() * 110;
    const g = tc.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(132,242,255,.15)");
    g.addColorStop(0.35, "rgba(30,201,255,.08)");
    g.addColorStop(1, "rgba(0,180,255,0)");
    tc.fillStyle = g;
    tc.fillRect(x - r, y - r, r * 2, r * 2);
  }

  grad = tc.createLinearGradient(0, 0, 768, 0);
  (
    [
      [0, "rgba(0,32,173,.3)"],
      [0.13, "rgba(40,186,255,.1)"],
      [0.46, "rgba(194,253,255,.12)"],
      [0.7, "rgba(0,98,228,.02)"],
      [1, "rgba(0,31,165,.38)"],
    ] as [number, string][]
  ).forEach(([x, c]) => grad.addColorStop(x, c));
  tc.fillStyle = grad;
  tc.fillRect(0, 0, 768, 1024);

  return texture;
}

function createFaceCodes() {
  const atlas = createCanvas(3072, 2048);
  const cc = atlas.getContext("2d");
  if (!cc) return [];
  cc.font = "64px monospace";
  cc.textBaseline = "middle";

  for (let column = 0; column < 3; column++) {
    for (let row = 0; row < CODE_BLOCKS[column].length; row++) {
      const line = CODE_BLOCKS[column][row];
      if (!line) continue;
      const x = column * 1024 + 48;
      const y = 90 + row * 96 + (row >= 11 ? 60 : 0);
      cc.shadowColor = "#71eaff";
      cc.shadowBlur = 28;
      cc.fillStyle = `rgba(205,252,255,${0.7 + (row % 3) * 0.065})`;
      cc.fillText(line, x, y);
      cc.shadowBlur = 0;
      cc.globalAlpha = 0.22;
      cc.fillText(line, x, y);
      cc.globalAlpha = 1;
    }
  }

  const atlasPixels = cc.getImageData(0, 0, 3072, 2048).data;

  return Array.from({ length: 16 }, (_, index) => {
    const i = index % 8;
    const lower = index >= 8;
    const ub = (7 - i) * 384;
    const sheet = createCanvas(768, 1024);
    const target = sheet.getContext("2d");
    if (!target) return sheet;
    const image = target.createImageData(768, 1024);
    const pixels = image.data;

    for (let row = 0; row < 1024; row++) {
      const q = lower ? 1 - (row + 0.5) / 1024 : (row + 0.5) / 1024;
      const y = lower ? -0.12 - (1.5 * (row + 0.5)) / 1024 : 1.78 - (1.9 * (row + 0.5)) / 1024;
      const v = Math.min(2047, ((1.78 - y) / 3.4) * 2048);
      const vy = Math.floor(v);
      const fy = v - vy;
      const left = 384 * (1 - q);
      const width = 768 * q;

      for (let x = Math.ceil(left); x < 768 - left; x++) {
        const u = ub + ((x - left) / width) * 384;
        const ux = Math.min(3071, Math.floor(u));
        const fx = u - ux;
        const ux1 = Math.min(3071, ux + 1);
        const vy1 = Math.min(2047, vy + 1);
        const a = (vy * 3072 + ux) * 4;
        const b = (vy * 3072 + ux1) * 4;
        const c = (vy1 * 3072 + ux) * 4;
        const d = (vy1 * 3072 + ux1) * 4;
        const o = (row * 768 + x) * 4;
        for (let k = 0; k < 4; k++) {
          pixels[o + k] =
            (atlasPixels[a + k] * (1 - fx) + atlasPixels[b + k] * fx) * (1 - fy) +
            (atlasPixels[c + k] * (1 - fx) + atlasPixels[d + k] * fx) * fy;
        }
      }
    }

    target.putImageData(image, 0, 0);
    return sheet;
  });
}

class RibbonRenderer {
  canvas = createCanvas(1, 1);
  gl: WebGLRenderingContext;
  depthProgram: WebGLProgram;
  program: WebGLProgram;
  depthPosition: number;
  position: number;
  side: number;
  depthCrop: WebGLUniformLocation | null;
  uniforms: Record<string, WebGLUniformLocation | null> = {};
  depthBuffer: WebGLBuffer | null;
  meshes: { buffer: WebGLBuffer | null; count: number }[];
  depthTexture: WebGLTexture | null;
  framebuffer: WebGLFramebuffer | null;
  renderbuffer: WebGLRenderbuffer | null;
  width = 0;
  height = 0;
  crop: Crop = [0, 0, 1, 1];
  scene: Vec = [0, 0, 0];
  time = 0;
  lost = false;
  restart = false;

  constructor() {
    const gl = this.canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      depth: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
    });
    if (!gl) throw new Error("WebGL is not available");
    this.gl = gl;

    this.depthProgram = this.link(DEPTH_VERTEX, DEPTH_FRAGMENT);
    this.program = this.link(RIBBON_VERTEX, RIBBON_FRAGMENT);
    this.depthPosition = gl.getAttribLocation(this.depthProgram, "aPosition");
    this.position = gl.getAttribLocation(this.program, "aPosition");
    this.side = gl.getAttribLocation(this.program, "aSide");
    this.depthCrop = gl.getUniformLocation(this.depthProgram, "uCrop");
    for (const name of ["uCrop", "uView", "uRotation", "uDepth", "uResolution", "uScene", "uFront"]) {
      this.uniforms[name] = gl.getUniformLocation(this.program, name);
    }

    this.depthBuffer = gl.createBuffer();
    this.meshes = [this.mesh(2.22), this.mesh(1.92)];
    this.depthTexture = gl.createTexture();
    this.framebuffer = gl.createFramebuffer();
    this.renderbuffer = gl.createRenderbuffer();

    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.disable(gl.CULL_FACE);
    gl.depthFunc(gl.LEQUAL);

    this.canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      this.lost = true;
    });
    this.canvas.addEventListener("webglcontextrestored", () => {
      this.restart = true;
    });
  }

  compile(type: number, source: string) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Shader allocation failed");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) ?? "Shader compilation failed");
    }
    return shader;
  }

  link(vertex: string, fragment: string) {
    const gl = this.gl;
    const program = gl.createProgram();
    if (!program) throw new Error("Program allocation failed");
    const vs = this.compile(gl.VERTEX_SHADER, vertex);
    const fs = this.compile(gl.FRAGMENT_SHADER, fragment);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? "Program link failed");
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return program;
  }

  mesh(radius: number) {
    const gl = this.gl;
    const vertices: number[] = [];
    const n = 384;
    const h = 0.1125;
    const r = radius - 0.04;
    const faces: [number[], number[], number][] = [
      [[radius, -h], [radius, h], 0],
      [[r, h], [r, -h], 1],
      [[radius, h], [r, h], 2],
      [[r, -h], [radius, -h], 2],
    ];

    for (let j = 0; j < n; j++) {
      const a = (j * Math.PI * 2) / n;
      const b = ((j + 1) * Math.PI * 2) / n;
      for (const [lo, hi, side] of faces) {
        const v = [
          [lo[0] * Math.cos(a), lo[1], lo[0] * Math.sin(a), side],
          [lo[0] * Math.cos(b), lo[1], lo[0] * Math.sin(b), side],
          [hi[0] * Math.cos(b), hi[1], hi[0] * Math.sin(b), side],
          [hi[0] * Math.cos(a), hi[1], hi[0] * Math.sin(a), side],
        ];
        for (const k of [0, 1, 2, 0, 2, 3]) vertices.push(...v[k]);
      }
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    return { buffer, count: vertices.length / 4 };
  }

  size(w: number, h: number) {
    if (this.width === w && this.height === h) return;
    const g = this.gl;
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;

    g.bindTexture(g.TEXTURE_2D, this.depthTexture);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, w, h, 0, g.RGBA, g.UNSIGNED_BYTE, null);
    g.bindRenderbuffer(g.RENDERBUFFER, this.renderbuffer);
    g.renderbufferStorage(g.RENDERBUFFER, g.DEPTH_COMPONENT16, w, h);
    g.bindFramebuffer(g.FRAMEBUFFER, this.framebuffer);
    g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, this.depthTexture, 0);
    g.framebufferRenderbuffer(g.FRAMEBUFFER, g.DEPTH_ATTACHMENT, g.RENDERBUFFER, this.renderbuffer);
    if (g.checkFramebufferStatus(g.FRAMEBUFFER) !== g.FRAMEBUFFER_COMPLETE) {
      throw new Error("Depth framebuffer is incomplete");
    }
    g.bindFramebuffer(g.FRAMEBUFFER, null);
  }

  prepare(polys: Face[], crop: Crop, W: number, H: number, S: number, t: number) {
    const g = this.gl;
    this.crop = crop;
    this.scene = [W, H, S];
    this.time = t;

    g.viewport(0, 0, this.width, this.height);
    g.bindFramebuffer(g.FRAMEBUFFER, this.framebuffer);
    g.clearColor(1, 0, 0, 0);
    g.clearDepth(1);
    g.clear(g.COLOR_BUFFER_BIT | g.DEPTH_BUFFER_BIT);
    g.useProgram(this.depthProgram);
    g.disableVertexAttribArray(this.side);
    g.bindBuffer(g.ARRAY_BUFFER, this.depthBuffer);
    const data = new Float32Array(polys.flatMap((f) => f.p.flat()));
    g.bufferData(g.ARRAY_BUFFER, data, g.DYNAMIC_DRAW);
    g.enableVertexAttribArray(this.depthPosition);
    g.vertexAttribPointer(this.depthPosition, 3, g.FLOAT, false, 0, 0);
    g.uniform4fv(this.depthCrop, crop);
    g.drawArrays(g.TRIANGLES, 0, data.length / 3);
    g.disableVertexAttribArray(this.depthPosition);
    g.bindFramebuffer(g.FRAMEBUFFER, null);
  }

  draw(front: boolean, target: CanvasRenderingContext2D) {
    const g = this.gl;
    const [cx, cy, cw, ch] = this.crop;
    const [, H, S] = this.scene;
    const t = this.time;
    const u = this.uniforms;

    g.bindFramebuffer(g.FRAMEBUFFER, null);
    g.clearColor(0, 0, 0, 0);
    g.clear(g.COLOR_BUFFER_BIT | g.DEPTH_BUFFER_BIT);
    g.useProgram(this.program);
    g.activeTexture(g.TEXTURE0);
    g.bindTexture(g.TEXTURE_2D, this.depthTexture);
    g.uniform1i(u.uDepth, 0);
    g.uniform2f(u.uResolution, this.width, this.height);
    g.uniform4fv(u.uCrop, this.crop);
    g.uniform3fv(u.uScene, this.scene);
    g.uniform1f(u.uFront, front ? 1 : 0);

    const centerY = H / 2 + Math.sin(t * 0.55) * S * 0.028;
    g.uniform4f(u.uView, (14 * S) / cw, (14 * S) / ch, 1 - (2 * (centerY - cy)) / ch, 0);

    const rotation = (tilt: number, spin: number, roll: number) =>
      new Float32Array(
        (
          [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
          ] as Vec[]
        ).flatMap((p) => rotX(rotY(rotZ(rotX(p, tilt), roll), spin), TILT_X)),
      );

    const turns: [number, number, number][] = [
      [0.26, (t * TAU) / 32, 0.035],
      [0.64, (-t * TAU) / 65 + 0.3, 0.65],
    ];

    g.enableVertexAttribArray(this.position);
    g.enableVertexAttribArray(this.side);
    this.meshes.forEach((mesh, i) => {
      g.bindBuffer(g.ARRAY_BUFFER, mesh.buffer);
      g.vertexAttribPointer(this.position, 3, g.FLOAT, false, 16, 0);
      g.vertexAttribPointer(this.side, 1, g.FLOAT, false, 16, 12);
      g.uniformMatrix3fv(u.uRotation, false, rotation(...turns[i]));
      g.drawArrays(g.TRIANGLES, 0, mesh.count);
    });
    g.disableVertexAttribArray(this.position);
    g.disableVertexAttribArray(this.side);

    target.drawImage(this.canvas, cx, cy, cw, ch);
  }

  dispose() {
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

export default function HeroCrystal({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let S = 0;
    let t = 0;
    let last = 0;
    let raf = 0;
    let startTimer = 0;
    let visible = true;
    let dirty = true;
    let disposed = false;
    let ribbons: RibbonRenderer | null = null;
    let ribbonsFailed = false;
    let texture: HTMLCanvasElement;
    let faceCodes: HTMLCanvasElement[];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      S = Math.min(W / SIZE_W, H / SIZE_H);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dirty = true;
    };

    const project = (p: Vec): Vec => {
      const q = rotX(p, TILT_X);
      const k = 7 / (7 - q[2]);
      return [W / 2 + q[0] * S * k, H / 2 - q[1] * S * k + Math.sin(t * 0.55) * S * 0.028, q[2]];
    };

    const path = (p: Vec[]) => {
      ctx.beginPath();
      p.forEach((v, i) => (i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1])));
      ctx.closePath();
    };

    const textured = (p: Vec[], uv: number[][], source: CanvasImageSource) => {
      const [a, b, c] = p;
      const [u, v, w] = uv;
      const den = u[0] * (v[1] - w[1]) + v[0] * (w[1] - u[1]) + w[0] * (u[1] - v[1]);
      if (Math.abs(den) < 0.0001) return;
      const A = (a[0] * (v[1] - w[1]) + b[0] * (w[1] - u[1]) + c[0] * (u[1] - v[1])) / den;
      const B = (a[1] * (v[1] - w[1]) + b[1] * (w[1] - u[1]) + c[1] * (u[1] - v[1])) / den;
      const C = (a[0] * (w[0] - v[0]) + b[0] * (u[0] - w[0]) + c[0] * (v[0] - u[0])) / den;
      const D = (a[1] * (w[0] - v[0]) + b[1] * (u[0] - w[0]) + c[1] * (v[0] - u[0])) / den;
      const E = a[0] - A * u[0] - C * u[1];
      const F = a[1] - B * u[0] - D * u[1];
      ctx.save();
      path(p);
      ctx.clip();
      ctx.transform(A, B, C, D, E, F);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    };

    const getRibbons = () => {
      if (ribbonsFailed) return null;
      if (!ribbons || ribbons.restart) {
        try {
          ribbons?.dispose();
          ribbons = new RibbonRenderer();
        } catch {
          ribbonsFailed = true;
          ribbons = null;
        }
      }
      return ribbons;
    };

    const frame = () => {
      ctx.clearRect(0, 0, W, H);

      const halo = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, S * 1.5);
      halo.addColorStop(0, "rgba(104,224,255,.19)");
      halo.addColorStop(0.5, "rgba(71,181,254,.055)");
      halo.addColorStop(1, "rgba(70,166,255,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, W, H);

      const polys: Face[] = [];
      const angle = (t * TAU) / 48 + 0.34;
      const ring: Vec[] = [];
      for (let i = 0; i < FACETS; i++) {
        ring.push(rotY([1.04 * Math.cos((TAU * i) / FACETS), -0.12, 1.04 * Math.sin((TAU * i) / FACETS)], angle));
      }

      for (let i = 0; i < FACETS; i++) {
        for (const lower of [false, true]) {
          const a = project([0, lower ? -1.62 : 1.78, 0]);
          const b = project(ring[i]);
          const c = project(ring[(i + 1) % FACETS]);
          const p = lower ? [a, c, b] : [a, b, c];
          const area = (p[1][0] - p[0][0]) * (p[2][1] - p[0][1]) - (p[1][1] - p[0][1]) * (p[2][0] - p[0][0]);
          if (area < 0) continue;
          polys.push({ p, z: (a[2] + b[2] + c[2]) / 3, lower, i });
        }
      }

      const renderer = getRibbons();
      if (renderer?.lost) return;

      if (renderer) {
        const cropW = Math.min(W, Math.ceil(S * 5.15));
        const cropH = Math.min(H, Math.ceil(S * 5.15));
        const cropX = (W - cropW) / 2;
        const cropY = Math.max(0, Math.min(H - cropH, (H - cropH) / 2));
        renderer.size(Math.ceil(cropW * 2), Math.ceil(cropH * 2));
        renderer.prepare(polys, [cropX, cropY, cropW, cropH], W, H, S, t);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        renderer.draw(false, ctx);
      }

      polys.sort((a, b) => a.z - b.z);

      for (const f of polys) {
        const uv = f.lower
          ? [
              [384, 1024],
              [0, 0],
              [768, 0],
            ]
          : [
              [384, 0],
              [768, 1024],
              [0, 1024],
            ];
        textured(f.p, uv, texture);
        textured(f.p, uv, faceCodes[f.i + (f.lower ? 8 : 0)]);
        path(f.p);
        const light = 0.5 + 0.5 * Math.cos(angle + ((f.i + 0.5) * TAU) / FACETS - 0.8);
        ctx.fillStyle = `rgba(0,26,153,${0.025 + (1 - light) * 0.16})`;
        ctx.fill();
        ctx.save();
        ctx.clip();

        const shine = ctx.createLinearGradient(f.p[1][0], f.p[1][1], f.p[2][0], f.p[2][1]);
        shine.addColorStop(0, "rgba(52,167,255,.12)");
        shine.addColorStop(0.09, "rgba(99,222,253,.035)");
        shine.addColorStop(0.38, "rgba(163,246,255,.025)");
        shine.addColorStop(0.52, `rgba(185,250,255,${0.08 + light * 0.15})`);
        shine.addColorStop(0.62, "rgba(55,189,242,.025)");
        shine.addColorStop(1, "rgba(0,30,155,.32)");
        ctx.fillStyle = shine;
        ctx.fill();

        const inner = ctx.createRadialGradient(W / 2, H / 2 - S * 0.14, 0, W / 2, H / 2 - S * 0.14, S * 0.95);
        inner.addColorStop(0, "rgba(204,255,255,.53)");
        inner.addColorStop(0.25, "rgba(115,237,255,.30)");
        inner.addColorStop(0.6, "rgba(44,195,255,.10)");
        inner.addColorStop(1, "rgba(70,200,255,0)");
        ctx.fillStyle = inner;
        ctx.fill();
        ctx.restore();
      }

      renderer?.draw(true, ctx);
    };

    const tick = (ms: number) => {
      const dt = last ? Math.min((ms - last) / 1000, 0.25) : 0;
      last = ms;
      if (visible && !document.hidden && (!reduceMotion || dirty)) {
        if (!reduceMotion) t += dt;
        frame();
        dirty = false;
      }
      raf = requestAnimationFrame(tick);
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      last = 0;
    });
    const onVisibility = () => {
      last = 0;
      dirty = true;
    };

    startTimer = window.setTimeout(() => {
      if (disposed) return;
      texture = createTexture();
      faceCodes = createFaceCodes();
      resize();
      resizeObserver.observe(canvas);
      intersectionObserver.observe(canvas);
      document.addEventListener("visibilitychange", onVisibility);
      raf = requestAnimationFrame(tick);
    }, 60);

    return () => {
      disposed = true;
      window.clearTimeout(startTimer);
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      ribbons?.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
