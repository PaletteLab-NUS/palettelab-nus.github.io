import React from "react";

/** Flat Peranakan-style tile patterns. Each person gets one preset. */

function hashId(id) {
  let h = 2166136261;
  const s = String(id);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex) {
  const h = String(hex).replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex({ r, g, b }) {
  const c = (v) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex({
    r: A.r + (B.r - A.r) * t,
    g: A.g + (B.g - A.g) * t,
    b: A.b + (B.b - A.b) * t,
  });
}

function lum(hex) {
  const { r, g, b } = hexToRgb(hex);
  const f = (v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a, b) {
  const L1 = lum(a);
  const L2 = lum(b);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

function ensureContrast(color, ground, min = 1.85) {
  let c = color;
  const target = lum(ground) > 0.5 ? "#1a120c" : "#fbf6ee";
  for (let i = 0; i < 8 && contrast(c, ground) < min; i++) {
    c = mix(c, target, 0.42);
  }
  return c;
}

function inks(ground, theme) {
  return theme.map((color) => ensureContrast(color, ground));
}

function starPoints(cx, cy, outer, inner, n = 8) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / n - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`);
  }
  return pts.join(" ");
}

function Flower({ cx, cy, r, petals = 8, fill, heart, rot = 0 }) {
  const blobs = [];
  for (let i = 0; i < petals; i++) {
    const a = rot + (i / petals) * 360;
    blobs.push(
      <ellipse
        key={i}
        cx={cx}
        cy={cy - r * 0.42}
        rx={r * (petals > 12 ? 0.14 : 0.28)}
        ry={r * 0.48}
        fill={fill}
        transform={`rotate(${a} ${cx} ${cy})`}
      />
    );
  }
  return (
    <g>
      {blobs}
      <circle cx={cx} cy={cy} r={r * 0.22} fill={heart} />
    </g>
  );
}

function Leaf({ x, y, rot, fill, len = 9 }) {
  return (
    <ellipse
      cx={x}
      cy={y}
      rx={len}
      ry={len * 0.38}
      fill={fill}
      transform={`rotate(${rot} ${x} ${y})`}
    />
  );
}

function Grain({ seed, color }) {
  const rand = mulberry32(seed || 1);
  const dots = [];
  const count = 90 + (seed % 50);
  for (let i = 0; i < count; i++) {
    dots.push(
      <circle
        key={`d${i}`}
        cx={(rand() * 200).toFixed(1)}
        cy={(rand() * 200).toFixed(1)}
        r={(rand() * 1.05 + 0.25).toFixed(2)}
        fill={color}
        opacity={(rand() * 0.4 + 0.12).toFixed(2)}
      />
    );
  }
  return <g>{dots}</g>;
}

function micro(id, kind, color) {
  if (kind === "dots") {
    return (
      <pattern id={id} width="7" height="7" patternUnits="userSpaceOnUse">
        <circle cx="1.6" cy="1.6" r="1.15" fill={color} />
        <circle cx="5" cy="5" r="0.8" fill={color} />
      </pattern>
    );
  }
  if (kind === "diag") {
    return (
      <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
        <path d="M-1 6 L6 -1 M-1 2 L2 -1 M3 7 L7 3" stroke={color} strokeWidth="1.3" />
      </pattern>
    );
  }
  if (kind === "cross") {
    return (
      <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
        <path d="M4 1 V7 M1 4 H7" stroke={color} strokeWidth="1.2" />
      </pattern>
    );
  }
  if (kind === "dash") {
    return (
      <pattern id={id} width="9" height="6" patternUnits="userSpaceOnUse">
        <path d="M1 3 H6" stroke={color} strokeWidth="1.6" strokeLinecap="square" />
      </pattern>
    );
  }
  if (kind === "tri") {
    return (
      <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
        <path d="M1 7 L4 1.5 L7 7 Z" fill={color} />
      </pattern>
    );
  }
  if (kind === "checker") {
    return (
      <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="3" height="3" fill={color} />
        <rect x="3" y="3" width="3" height="3" fill={color} />
      </pattern>
    );
  }
  return (
    <pattern id={id} width="8" height="5" patternUnits="userSpaceOnUse">
      <path d="M0 4 Q2 0 4 4 T8 4" fill="none" stroke={color} strokeWidth="1.1" />
    </pattern>
  );
}

function TileShell({ uid, ground, ink, seed, microKind, field, corners }) {
  const mid = `${uid}-micro`;
  return (
    <g>
      <defs>
        {micro(mid, microKind, ink[3])}
        <mask id={`${uid}-rim`}>
          <rect width="200" height="200" fill="white" />
          <rect x="18" y="18" width="164" height="164" fill="black" />
        </mask>
      </defs>
      <rect width="200" height="200" fill={ground} />
      {field}
      <g mask={`url(#${uid}-rim)`}>
        <rect width="200" height="200" fill={ink[0]} />
        <rect width="200" height="200" fill={`url(#${mid})`} opacity="0.95" />
      </g>
      <rect x="1.6" y="1.6" width="196.8" height="196.8" fill="none" stroke={ink[1]} strokeWidth="3" />
      <rect x="6.4" y="6.4" width="187.2" height="187.2" fill="none" stroke={ink[2]} strokeWidth="1.15" />
      <rect x="16.6" y="16.6" width="166.8" height="166.8" fill="none" stroke={ink[3]} strokeWidth="1.15" />
      {corners}
      <Grain seed={seed} color={ink[3]} />
    </g>
  );
}

function flowerGrid(step, r, petals, fill, heart, leaf) {
  const nodes = [];
  for (let y = step / 2; y < 200; y += step) {
    for (let x = step / 2; x < 200; x += step) {
      nodes.push(
        <Flower key={`${x}-${y}`} cx={x} cy={y} r={r} petals={petals} fill={fill} heart={heart} />
      );
      if (leaf) {
        nodes.push(
          <Leaf key={`l${x}-${y}`} x={x + r * 0.9} y={y + r * 0.15} rot={35} fill={leaf} len={r * 0.55} />
        );
      }
    }
  }
  return nodes;
}

function Peony({ uid, ground, seed }) {
  const ink = inks(ground, ["#b42318", "#1f6b45", "#e2b340", "#f7f1e4"]);
  return (
    <TileShell
      uid={uid}
      ground={ground}
      ink={ink}
      seed={seed}
      microKind="dots"
      field={<g>{flowerGrid(34, 13, 8, ink[0], ink[2], ink[1])}</g>}
      corners={null}
    />
  );
}

function Meander({ uid, ground, seed }) {
  const ink = inks(ground, ["#0c3b66", "#d4a017", "#f4efe4", "#7a1f3d"]);
  const id = `${uid}-key`;
  return (
    <TileShell
      uid={uid}
      ground={ground}
      ink={ink}
      seed={seed}
      microKind="dash"
      field={
        <>
          <defs>
            <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse">
              <path
                d="M1 7 H15 V3 H7 V15 H19 V11 H11 V7"
                fill="none"
                stroke={ink[1]}
                strokeWidth="3"
                strokeLinejoin="miter"
              />
              <path d="M1 19 H9 V13 M15 19 H21 V15" fill="none" stroke={ink[0]} strokeWidth="3" />
              <rect x="17" y="1" width="4" height="4" fill={ink[3]} />
            </pattern>
          </defs>
          <rect width="200" height="200" fill={`url(#${id})`} />
        </>
      }
    />
  );
}

function Weave({ uid, ground, seed }) {
  const ink = inks(ground, ["#8c2f39", "#245c4a", "#e6d5a8", "#f7f3ea"]);
  const id = `${uid}-weave`;
  return (
    <TileShell
      uid={uid}
      ground={ground}
      ink={ink}
      seed={seed}
      microKind="checker"
      field={
        <>
          <defs>
            <pattern id={id} width="18" height="18" patternUnits="userSpaceOnUse">
              <rect width="18" height="8" fill={ink[0]} />
              <rect y="10" width="18" height="6" fill={ink[1]} />
              <rect width="8" height="18" fill={ink[2]} />
              <rect x="2" y="2" width="14" height="4" fill={ground} />
              <rect x="10" y="10" width="6" height="6" fill={ink[0]} />
              <rect x="11" y="11" width="4" height="4" fill={ground} />
              <rect x="1" y="12" width="6" height="4" fill={ink[3]} />
            </pattern>
          </defs>
          <rect width="200" height="200" fill={`url(#${id})`} />
        </>
      }
    />
  );
}

function Stars({ uid, ground, seed }) {
  const ink = inks(ground, ["#12315c", "#e85d04", "#f3e5c2", "#7f1d1d"]);
  const nodes = [];
  const step = 34;
  for (let y = 17; y < 200; y += step) {
    for (let x = 17; x < 200; x += step) {
      nodes.push(
        <polygon key={`${x}-${y}`} points={starPoints(x, y, 13, 5.5, 8)} fill={ink[0]} />
      );
      nodes.push(<circle key={`c${x}-${y}`} cx={x} cy={y} r="2.2" fill={ink[2]} />);
      nodes.push(
        <polygon
          key={`d${x}-${y}`}
          points={starPoints(x + step / 2, y + step / 2, 6, 2.6, 4)}
          fill={ink[1]}
        />
      );
    }
  }
  return (
    <TileShell
      uid={uid}
      ground={ground}
      ink={ink}
      seed={seed}
      microKind="cross"
      field={<g>{nodes}</g>}
    />
  );
}

function Seigaiha({ uid, ground, seed }) {
  const ink = inks(ground, ["#0e4d6c", "#c45c26", "#f2efe9", "#1d4e3a"]);
  const id = `${uid}-wave`;
  return (
    <TileShell
      uid={uid}
      ground={ground}
      ink={ink}
      seed={seed}
      microKind="wave"
      field={
        <>
          <defs>
            <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M0 10 A10 10 0 0 1 20 10 Z" fill={ink[0]} />
              <path d="M0 10 A6 6 0 0 1 20 10 Z" fill={ground} />
              <path d="M-10 20 A10 10 0 0 1 10 20 Z" fill={ink[1]} />
              <path d="M-10 20 A6 6 0 0 1 10 20 Z" fill={ground} />
              <path d="M10 20 A10 10 0 0 1 30 20 Z" fill={ink[1]} />
              <path d="M10 20 A6 6 0 0 1 30 20 Z" fill={ground} />
              <path d="M0 10 A10 10 0 0 1 20 10" fill="none" stroke={ink[2]} strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill={`url(#${id})`} />
        </>
      }
    />
  );
}

function Kawung({ uid, ground, seed }) {
  const ink = inks(ground, ["#1d4e3a", "#e7b423", "#7a1f3d", "#f6f1e7"]);
  const id = `${uid}-kaw`;
  return (
    <TileShell
      uid={uid}
      ground={ground}
      ink={ink}
      seed={seed}
      microKind="dots"
      field={
        <>
          <defs>
            <pattern id={id} width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="0" cy="0" r="12" fill="none" stroke={ink[0]} strokeWidth="2.4" />
              <circle cx="28" cy="0" r="12" fill="none" stroke={ink[0]} strokeWidth="2.4" />
              <circle cx="0" cy="28" r="12" fill="none" stroke={ink[0]} strokeWidth="2.4" />
              <circle cx="28" cy="28" r="12" fill="none" stroke={ink[0]} strokeWidth="2.4" />
              <circle cx="14" cy="14" r="6" fill={ink[2]} />
              <circle cx="14" cy="14" r="3" fill={ink[1]} />
              <circle cx="0" cy="0" r="2" fill={ink[1]} />
              <circle cx="28" cy="0" r="2" fill={ink[1]} />
              <circle cx="0" cy="28" r="2" fill={ink[1]} />
              <circle cx="28" cy="28" r="2" fill={ink[1]} />
            </pattern>
          </defs>
          <rect width="200" height="200" fill={`url(#${id})`} />
        </>
      }
    />
  );
}

function Clouds({ uid, ground, seed }) {
  const ink = inks(ground, ["#5c2a3a", "#e8c872", "#f7f4ee", "#1d4e89"]);
  const cloud =
    "M2 16 C2 9, 9 7, 12 12 C14 5, 26 5, 26 13 C32 9, 36 16, 30 19 C33 26, 20 26, 18 21 C13 26, 3 23, 2 16 Z";
  const nodes = [];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 6; col++) {
      const x = col * 36 - 8 + (row % 2) * 16;
      const y = row * 30 - 4;
      nodes.push(
        <path
          key={`${col}-${row}`}
          d={cloud}
          transform={`translate(${x} ${y}) scale(1.05)`}
          fill={row % 2 === 0 ? ink[0] : ink[3]}
          stroke={ink[1]}
          strokeWidth="0.8"
        />
      );
    }
  }
  return (
    <TileShell
      uid={uid}
      ground={ground}
      ink={ink}
      seed={seed}
      microKind="wave"
      field={<g>{nodes}</g>}
    />
  );
}

function Plum({ uid, ground, seed }) {
  const ink = inks(ground, ["#7a1e3a", "#2f5d50", "#f4f0e6", "#c45c26"]);
  const branches = [];
  for (let i = 0; i < 8; i++) {
    const y = 12 + i * 26;
    branches.push(`M-4 ${y} C40 ${y - 10}, 70 ${y + 12}, 110 ${y} S160 ${y - 14}, 206 ${y + 4}`);
  }
  return (
    <TileShell
      uid={uid}
      ground={ground}
      ink={ink}
      seed={seed}
      microKind="dots"
      field={
        <>
          <g fill="none" stroke={ink[3]} strokeWidth="1.8" strokeLinecap="round">
            {branches.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
          <g>{flowerGrid(28, 9, 5, ink[0], ink[1], ink[2])}</g>
        </>
      }
    />
  );
}

function Lotus({ uid, ground, seed }) {
  const ink = inks(ground, ["#9d174d", "#f0c95a", "#1e4d3a", "#f8f1e6"]);
  const spots = [];
  const step = 34;
  for (let y = 18; y < 200; y += step) {
    for (let x = 24; x < 200; x += step) {
      spots.push({ x, y, r: 16 });
      spots.push({ x: x + step / 2, y: y + step / 2, r: 9 });
    }
  }
  return (
    <TileShell
      uid={uid}
      ground={ground}
      ink={ink}
      seed={seed}
      microKind="tri"
      field={
        <g>
          {spots.map((s) => (
            <Flower
              key={`${s.x}-${s.y}`}
              cx={s.x}
              cy={s.y}
              r={s.r}
              petals={s.r > 12 ? 10 : 6}
              fill={s.r > 12 ? ink[0] : ink[2]}
              heart={ink[1]}
            />
          ))}
        </g>
      }
    />
  );
}

function Chrysanthemum({ uid, ground, seed }) {
  const ink = inks(ground, ["#9a3412", "#14532d", "#7f1d1d", "#fef3c7"]);
  return (
    <TileShell
      uid={uid}
      ground={ground}
      ink={ink}
      seed={seed}
      microKind="dots"
      field={<g>{flowerGrid(30, 12, 8, ink[0], ink[2], ink[1])}</g>}
    />
  );
}

function Arabesque({ uid, ground, seed }) {
  const ink = inks(ground, ["#312e81", "#f59e0b", "#9d174d", "#f8fafc"]);
  const id = `${uid}-scroll`;
  return (
    <TileShell
      uid={uid}
      ground={ground}
      ink={ink}
      seed={seed}
      microKind="diag"
      field={
        <>
          <defs>
            <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M4 22 C4 8, 16 8, 16 22 C16 34, 28 34, 28 20 C28 12, 34 8, 38 14"
                fill="none"
                stroke={ink[0]}
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <path
                d="M36 18 C36 32, 24 32, 24 18 C24 6, 12 6, 12 20 C12 28, 6 32, 2 26"
                fill="none"
                stroke={ink[2]}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <ellipse cx="16" cy="22" rx="3.2" ry="2" fill={ink[1]} transform="rotate(-30 16 22)" />
              <ellipse cx="26" cy="18" rx="3.2" ry="2" fill={ink[1]} transform="rotate(40 26 18)" />
              <circle cx="8" cy="10" r="1.5" fill={ink[3]} />
              <circle cx="32" cy="30" r="1.5" fill={ink[3]} />
            </pattern>
          </defs>
          <rect width="200" height="200" fill={`url(#${id})`} />
        </>
      }
    />
  );
}

function Coins({ uid, ground, seed }) {
  const ink = inks(ground, ["#7a4b12", "#1e3a5f", "#f3e6c4", "#9b2226"]);
  const nodes = [];
  const step = 22;
  for (let y = 11; y < 200; y += step) {
    for (let x = 11; x < 200; x += step) {
      nodes.push(
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="10" fill={ink[0]} />
          <circle cx={x} cy={y} r="7.2" fill={ground} />
          <rect x={x - 2.4} y={y - 2.4} width="4.8" height="4.8" fill={ink[1]} />
          <circle cx={x + step / 2} cy={y + step / 2} r="1.6" fill={ink[3]} />
        </g>
      );
    }
  }
  return (
    <TileShell
      uid={uid}
      ground={ground}
      ink={ink}
      seed={seed}
      microKind="cross"
      field={
        <g>
          <path
            d="M0 28 H200 M0 56 H200 M0 84 H200 M0 112 H200 M0 140 H200 M0 168 H200 M28 0 V200 M56 0 V200 M84 0 V200 M112 0 V200 M140 0 V200 M168 0 V200"
            stroke={ink[2]}
            strokeWidth="1.2"
          />
          {nodes}
        </g>
      }
    />
  );
}

function Fans({ uid, ground, seed }) {
  const ink = inks(ground, ["#6a040f", "#e9d8a6", "#1d3557", "#f6f1e7"]);
  const nodes = [];
  const step = 36;
  for (let y = 6; y < 200; y += step) {
    for (let x = 6; x < 200; x += step) {
      const rot = ((x + y) / step) % 2 === 0 ? 0 : 180;
      const ribs = [];
      for (let i = 0; i <= 6; i++) {
        const a = (Math.PI / 2) * (i / 6);
        ribs.push(
          <line
            key={i}
            x1="0"
            y1="0"
            x2={(Math.cos(a) * 16).toFixed(2)}
            y2={(Math.sin(a) * 16).toFixed(2)}
            stroke={ink[2]}
            strokeWidth="0.7"
          />
        );
      }
      nodes.push(
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${rot})`}>
          <path d="M0 0 L16 0 A16 16 0 0 1 0 16 Z" fill={ink[0]} />
          {ribs}
          <path d="M0 0 L16 0 A16 16 0 0 1 0 16" fill="none" stroke={ink[1]} strokeWidth="1.1" />
        </g>
      );
    }
  }
  return (
    <TileShell
      uid={uid}
      ground={ground}
      ink={ink}
      seed={seed}
      microKind="dash"
      field={<g>{nodes}</g>}
    />
  );
}

function Parang({ uid, ground, seed }) {
  const ink = inks(ground, ["#3d2b1f", "#e09f3e", "#7f1d1d", "#f6f1e8"]);
  const id = `${uid}-parang`;
  return (
    <TileShell
      uid={uid}
      ground={ground}
      ink={ink}
      seed={seed}
      microKind="diag"
      field={
        <>
          <defs>
            <pattern id={id} width="32" height="32" patternUnits="userSpaceOnUse">
              <path
                d="M-6 28 C8 24, 12 10, 34 -4"
                fill="none"
                stroke={ink[0]}
                strokeWidth="7"
                strokeLinecap="square"
              />
              <path
                d="M-6 28 C8 24, 12 10, 34 -4"
                fill="none"
                stroke={ink[1]}
                strokeWidth="2.2"
              />
              <path
                d="M-6 44 C8 40, 12 26, 34 12"
                fill="none"
                stroke={ink[2]}
                strokeWidth="3"
              />
              <circle cx="16" cy="16" r="1.5" fill={ink[3]} />
            </pattern>
          </defs>
          <rect width="200" height="200" fill={`url(#${id})`} />
        </>
      }
    />
  );
}

function HexFloret({ uid, ground, seed }) {
  const ink = inks(ground, ["#1b4332", "#9b2226", "#d8f3dc", "#7a4b12"]);
  function hex(cx, cy, r) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
    }
    return pts.join(" ");
  }
  const nodes = [];
  const r = 16;
  const dx = r * Math.sqrt(3);
  const dy = r * 1.5;
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const x = col * dx + (row % 2 ? dx / 2 : 0) - 4;
      const y = row * dy - 4;
      nodes.push(
        <g key={`${col}-${row}`}>
          <polygon points={hex(x, y, r - 1)} fill="none" stroke={ink[0]} strokeWidth="1.6" />
          <Flower cx={x} cy={y} r={6.5} petals={6} fill={ink[1]} heart={ink[3]} />
        </g>
      );
    }
  }
  return (
    <TileShell
      uid={uid}
      ground={ground}
      ink={ink}
      seed={seed}
      microKind="tri"
      field={<g>{nodes}</g>}
    />
  );
}

function Pineapple({ uid, ground, seed }) {
  const ink = inks(ground, ["#c45c26", "#1f6b45", "#f2d16b", "#f7f3ea"]);
  const nodes = [];
  const step = 28;
  for (let y = 14; y <= 190; y += step) {
    for (let x = 14; x <= 190; x += step) {
      nodes.push(
        <polygon
          key={`d${x}-${y}`}
          points={`${x},${y - 16} ${x + 16},${y} ${x},${y + 16} ${x - 16},${y}`}
          fill="none"
          stroke={ink[2]}
          strokeWidth="1.4"
        />
      );
      nodes.push(
        <g key={`p${x}-${y}`}>
          <path
            d={`M${x} ${y - 12} L${x - 5} ${y - 5} L${x - 2.5} ${y - 7} L${x} ${y - 14} L${x + 2.5} ${y - 7} L${x + 5} ${y - 5} Z`}
            fill={ink[1]}
          />
          <ellipse cx={x} cy={y + 1} rx="6" ry="8.5" fill={ink[0]} />
          <path
            d={`M${x - 4} ${y - 3} L${x + 4} ${y + 6} M${x + 4} ${y - 3} L${x - 4} ${y + 6} M${x - 5} ${y} H${x + 5} M${x - 4.5} ${y + 4} H${x + 4.5}`}
            stroke={ink[3]}
            strokeWidth="0.7"
          />
        </g>
      );
    }
  }
  return (
    <TileShell
      uid={uid}
      ground={ground}
      ink={ink}
      seed={seed}
      microKind="diag"
      field={<g>{nodes}</g>}
    />
  );
}

const PRESETS = {
  peony: Peony,
  meander: Meander,
  weave: Weave,
  star: Stars,
  seigaiha: Seigaiha,
  kawung: Kawung,
  cloud: Clouds,
  plum: Plum,
  lotus: Lotus,
  chrysanthemum: Chrysanthemum,
  arabesque: Arabesque,
  coin: Coins,
  fan: Fans,
  parang: Parang,
  hex: HexFloret,
  pineapple: Pineapple,
};

const PRESET_IDS = Object.keys(PRESETS);

export const TILE_ASSIGNMENT = {
  "Jane L. E": "peony",
  "Kevin Lam": "meander",
  "Romrawin Chumpu": "kawung",
  "Bekzat Tilekbay": "lotus",
  "Izabella Rodrigues": "seigaiha",
  "Zifei Han": "plum",
  "Xiyuan Wang": "chrysanthemum",
  "Nguyen-Truong Vinh-Thuyen": "cloud",
  "Minyoung Park": "weave",
  "Liwenhan Xie": "arabesque",
  "Colin Hia": "star",
  "Gabriella Ugwonali": "coin",
  "Fuling Sun": "fan",
  "Sixing Tao": "parang",
  "Jiayu Yin": "pineapple",
};

export function PersonTile({ memberId, color }) {
  const presetId =
    TILE_ASSIGNMENT[memberId] || PRESET_IDS[hashId(memberId) % PRESET_IDS.length];
  const uid = `t${hashId(memberId)}`;
  const Preset = PRESETS[presetId];
  return (
    <svg
      className="sg-tile"
      viewBox="0 0 200 200"
      data-preset={presetId}
      aria-hidden="true"
    >
      <Preset uid={uid} ground={color} seed={hashId(memberId)} />
    </svg>
  );
}
