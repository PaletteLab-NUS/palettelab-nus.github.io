import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./TrajectoryMap.css";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// CRA production minification breaks Mapbox's inline Web Worker (ReferenceError
// in loadVectorData, then cascading tile parse errors). Load the worker as a
// separate file from /public instead.
mapboxgl.workerUrl = `${process.env.PUBLIC_URL}/mapbox-gl-csp-worker.js`;

/** Dark purple oceans + black land */
const PURPLE_THEME = {
  background: "#24183faa",
  land: "#000000",
  landcover: "#050505",
  park: "#0a0a0a",
  water: "#051C2D",
  waterway: "#4a3a7a",
  building: "#111111",
  road: "#5a4a88",
  roadCase: "#1a1228",
  roadMajor: "#7a6aa8",
  admin: "#8b7fd0",
  text: "#d4d0ff",
  textHalo: "#000000",
  icon: "#b8b0f5",
};

export const STAGES = [
  { id: "growingUp", label: "Growing up", color: "#fcdc3f" },
  { id: "bachelor", label: "Bachelor", color: "#8FCB6D" },
  { id: "master", label: "Master / Work", color: "#5BC0EB" },
  { id: "phd", label: "Ph.D.+", color: "#a199f1" },
  { id: "intern", label: "Visiting", color: "#F06292" },
];

const STAGE_IDS = STAGES.map((s) => s.id);
const STAGE_COLOR = Object.fromEntries(STAGES.map((s) => [s.id, s.color]));

const GROWING_UP_RE =
  /\b(?:hometown|grew\s*up|growing\s*up|childhood|born(?:\s+in)?|formative\s+years?|high\s*school)\b/i;
const PHD_RE =
  /\b(?:ph\.?\s*d\.?|dphil|doctorate|post[\s-]?docs?(?:toral)?|professor|faculty)\b/i;
const MASTER_RE =
  /\b(?:m\.?\s*s\.?\s*e\.?|m\.?\s*sc\.?|m\.?\s*s\.?|m\.?\s*a\.?|m\.?\s*eng\.?|master'?s?|mba)\b/i;
/** Full-time jobs (research, industry, etc.) share the master pie slice. */
const WORK_RE =
  /\b(?:researchers?|research\s+(?:assistant|associate|scientist|engineer|fellow)|scientists?|engineers?|software\s+engineer|full[\s-]?time|industry|employee|works?|worked\s+(?:at|as)|job)\b/i;
const BACHELOR_RE =
  /\b(?:b\.?\s*s\.?\s*e\.?|b\.?\s*sc\.?|b\.?\s*s\.?|b\.?\s*e\.?|b\.?\s*a\.?|b\.?\s*eng\.?|bachelor'?s?|undergrad(?:uate)?)\b/i;
const INTERN_RE = /\b(?:intern(?:ship)?s?)\b/i;

function setPaintIfExists(map, layerId, property, value) {
  if (!map.getLayer(layerId)) return;
  try {
    map.setPaintProperty(layerId, property, value);
  } catch (_) {
    // Layer may not support this paint property.
  }
}

function applyPurpleDarkTheme(map) {
  const layers = map.getStyle()?.layers || [];

  // dark-v11: `land` is the background layer (landmasses).
  setPaintIfExists(map, "land", "background-color", PURPLE_THEME.land);
  setPaintIfExists(map, "background", "background-color", PURPLE_THEME.background);
  setPaintIfExists(map, "water", "fill-color", PURPLE_THEME.water);
  setPaintIfExists(map, "waterway", "line-color", PURPLE_THEME.waterway);
  setPaintIfExists(map, "landuse", "fill-color", PURPLE_THEME.landcover);
  setPaintIfExists(map, "national-park", "fill-color", PURPLE_THEME.park);
  setPaintIfExists(map, "building", "fill-color", PURPLE_THEME.building);
  setPaintIfExists(map, "land-structure-polygon", "fill-color", PURPLE_THEME.building);
  setPaintIfExists(map, "land-structure-line", "line-color", PURPLE_THEME.roadCase);

  layers.forEach((layer) => {
    const { id, type } = layer;
    const lower = id.toLowerCase();

    if (type === "background") {
      setPaintIfExists(map, id, "background-color", PURPLE_THEME.land);
      return;
    }

    if (type === "fill") {
      if (lower.includes("water") && !lower.includes("label")) {
        setPaintIfExists(map, id, "fill-color", PURPLE_THEME.water);
      } else if (
        lower.includes("park") ||
        lower.includes("pitch") ||
        lower.includes("grass") ||
        lower.includes("national-park")
      ) {
        setPaintIfExists(map, id, "fill-color", PURPLE_THEME.park);
      } else if (lower.includes("building") || lower.includes("structure")) {
        setPaintIfExists(map, id, "fill-color", PURPLE_THEME.building);
      } else if (
        lower.includes("landcover") ||
        lower.includes("landuse") ||
        lower.includes("aeroway")
      ) {
        setPaintIfExists(map, id, "fill-color", PURPLE_THEME.landcover);
      }
      return;
    }

    if (type === "line") {
      if (lower.includes("waterway") || (lower.includes("water") && !lower.includes("label"))) {
        setPaintIfExists(map, id, "line-color", PURPLE_THEME.waterway);
      } else if (lower.includes("admin") || lower.includes("boundary")) {
        setPaintIfExists(map, id, "line-color", PURPLE_THEME.admin);
      } else if (
        lower.includes("road") ||
        lower.includes("bridge") ||
        lower.includes("tunnel") ||
        lower.includes("motorway") ||
        lower.includes("street") ||
        lower.includes("path") ||
        lower.includes("ferry") ||
        lower.includes("rail") ||
        lower.includes("aeroway") ||
        lower.includes("structure")
      ) {
        const isCase = lower.includes("case") || lower.includes("bg");
        const isMajor =
          lower.includes("motorway") ||
          lower.includes("trunk") ||
          lower.includes("primary") ||
          lower.includes("simple");
        setPaintIfExists(
          map,
          id,
          "line-color",
          isCase
            ? PURPLE_THEME.roadCase
            : isMajor
              ? PURPLE_THEME.roadMajor
              : PURPLE_THEME.road
        );
      }
      return;
    }

    if (type === "symbol") {
      setPaintIfExists(map, id, "text-color", PURPLE_THEME.text);
      setPaintIfExists(map, id, "text-halo-color", PURPLE_THEME.textHalo);
      setPaintIfExists(map, id, "icon-color", PURPLE_THEME.icon);
      setPaintIfExists(map, id, "icon-halo-color", PURPLE_THEME.textHalo);
    }
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Parse DMS strings like 1°17'41.0"N 103°46'31.4"E → [lng, lat] */
export function parseDmsLocation(loc) {
  if (!loc || typeof loc !== "string") return null;

  const pattern =
    /(\d+)[°]\s*(\d+)['′]\s*([\d.]+)["″]?\s*([NS])\s+(\d+)[°]\s*(\d+)['′]\s*([\d.]+)["″]?\s*([EW])/i;
  const match = loc.trim().match(pattern);
  if (!match) return null;

  const toDecimal = (deg, min, sec, hemi) => {
    let value = Number(deg) + Number(min) / 60 + Number(sec) / 3600;
    if (hemi === "S" || hemi === "W") value *= -1;
    return value;
  };

  const lat = toDecimal(match[1], match[2], match[3], match[4].toUpperCase());
  const lng = toDecimal(match[5], match[6], match[7], match[8].toUpperCase());
  return [lng, lat];
}

/**
 * Shift W-hemisphere longitudes east of the antimeridian so the map is
 * Pacific-centered (Asia/China on the left, Americas/USA on the right).
 * Mapbox accepts lng outside [-180, 180] when world copies are enabled.
 */
function toPacificLng(lng) {
  return lng < 0 ? lng + 360 : lng;
}

function toPacificCoords([lng, lat]) {
  return [toPacificLng(lng), lat];
}

function cityKey(label, coords) {
  if (label) return label.trim().toLowerCase();
  return coords.map((c) => c.toFixed(4)).join(",");
}

/** Infer life stage(s) from a person's role when the note has no degree tags. */
function stagesFromMemberRole(member = {}) {
  const role = `${member.role || ""} ${member.description || ""}`.toLowerCase();

  // Internships first — roles often look like "intern • UCSC PhD".
  if (/\bintern(?:ship)?s?\b/.test(role)) {
    return ["intern"];
  }
  if (/\bph\.?\s*d\.?\b|\bpost[\s-]?doc|\bprofessor|\bfaculty|\blab director\b/.test(role)) {
    return ["phd"];
  }
  if (/\bmaster'?s?\b|\bm\.?\s*s\.?\b|\bm\.sc\b/.test(role)) {
    return ["master"];
  }
  if (/\bundergrad|\bbachelor|\bb\.?\s*(?:s\.?e\.?|sc\.?|s\.?|e\.?|a\.?)\b/.test(role)) {
    return ["bachelor"];
  }
  // Current lab stops without tags default to PhD (most members).
  return ["phd"];
}

/**
 * Classify a trajectory note into one or more stages.
 * Multi-label on purpose: "Hometown, B.S.E." → growingUp + bachelor;
 * "B.S. & M.S." → bachelor + master.
 * Full-time work (e.g. "Researcher @CMU") merges into master.
 */
export function classifyStages(note, member = {}) {
  const text = String(note || "");
  const stages = [];

  if (GROWING_UP_RE.test(text)) stages.push("growingUp");
  if (BACHELOR_RE.test(text)) stages.push("bachelor");
  // Full-time work shares the master slice; internships stay intern-only.
  if (MASTER_RE.test(text) || (WORK_RE.test(text) && !INTERN_RE.test(text))) {
    stages.push("master");
  }
  if (PHD_RE.test(text)) stages.push("phd");
  if (INTERN_RE.test(text)) stages.push("intern");

  if (stages.length > 0) return stages;

  // "Palette Lab" / unlabeled stops: fall back to member role.
  return stagesFromMemberRole(member);
}

function emptyStageCounts() {
  return { growingUp: 0, bachelor: 0, master: 0, phd: 0, intern: 0 };
}

/** Pick the longitude copy of `lng` closest to `prevLng` (short-path unwrap). */
function unwrapLngNear(lng, prevLng, preferredLng = lng) {
  const candidates = [lng, lng + 360, lng - 360, lng + 720, lng - 720];
  candidates.sort((a, b) => {
    const da = Math.abs(a - prevLng);
    const db = Math.abs(b - prevLng);
    // Near-ties: keep the canonical Pacific-centered copy (avoids USA→Asia
    // going the long way east after an Atlantic unwrap).
    if (Math.abs(da - db) > 12) return da - db;
    return Math.abs(a - preferredLng) - Math.abs(b - preferredLng);
  });
  return candidates[0];
}

/**
 * Keep consecutive stops on the short longitudinal path.
 * Without this, Pacific-shifted Americas (~240–300) connect to Europe (~0–10)
 * the long way across Asia, and Bezier control points spike toward the pole.
 */
function unwrapTrajectoryCoords(coordsList) {
  if (!coordsList.length) return [];
  const out = [coordsList[0]];
  for (let i = 1; i < coordsList.length; i += 1) {
    const [lng, lat] = coordsList[i];
    out.push([unwrapLngNear(lng, out[i - 1][0], lng), lat]);
  }
  return out;
}

/**
 * Quadratic Bezier arc between two lon/lat points.
 * Mapbox only draws straight segments, so we densify into a curve.
 * `lane` fans out multiple people on the same source→destination hop.
 */
function curvedSegment(a, b, { curvature = 0.18, sign = 1, lane = 0 } = {}) {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dx = lng2 - lng1;
  const dy = lat2 - lat1;
  const dist = Math.hypot(dx, dy) || 1;

  // Longer hops need more samples so the arc stays smooth.
  const steps = Math.max(24, Math.min(72, Math.round(12 + dist * 1.35)));

  // Cap bend so E–W Atlantic hops don't balloon toward the pole.
  const bendAmt = Math.min(0.26, curvature * (0.55 + Math.min(dist, 35) / 70));
  const mx = (lng1 + lng2) / 2;
  const my = (lat1 + lat2) / 2;
  const perpX = -dy / dist;
  const perpY = dx / dist;

  // Prefer the perpendicular side whose control point stays nearer the chord.
  const avgLat = (lat1 + lat2) / 2;
  let side = sign;
  if (
    Math.abs(my + perpY * bendAmt * dist * side - avgLat) >
    Math.abs(my - perpY * bendAmt * dist * side - avgLat)
  ) {
    side *= -1;
  }

  // Lane spread in degrees so identical hops don't stack on one curve.
  const laneSpread = Math.min(5.5, Math.max(1.1, dist * 0.048));
  const offset = bendAmt * dist * side + lane * laneSpread;

  const cx = mx + perpX * offset;
  const cy = Math.max(-55, Math.min(72, my + perpY * offset));

  const coords = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const u = 1 - t;
    coords.push([
      u * u * lng1 + 2 * u * t * cx + t * t * lng2,
      u * u * lat1 + 2 * u * t * cy + t * t * lat2,
    ]);
  }
  return coords;
}

/** Undirected city pair key so A→B and B→A share the same lane group. */
function edgeKey(fromLabel, toLabel) {
  const a = String(fromLabel || "").trim().toLowerCase();
  const b = String(toLabel || "").trim().toLowerCase();
  return a <= b ? `${a}↔${b}` : `${b}↔${a}`;
}

/**
 * Centered lane index: 1 person → 0; 2 → -0.5, +0.5; 3 → -1, 0, +1; …
 * Reverse hops flip the lane so the perpendicular still fans geographic sides
 * (perp reverses with travel direction).
 */
function laneForEdge(edgeLanes, personId, fromLabel, toLabel) {
  const peers = edgeLanes.get(edgeKey(fromLabel, toLabel));
  if (!peers || peers.length <= 1) return 0;
  const idx = peers.indexOf(personId);
  if (idx < 0) return 0;
  let lane = idx - (peers.length - 1) / 2;
  const from = String(fromLabel || "").trim().toLowerCase();
  const to = String(toLabel || "").trim().toLowerCase();
  if (from > to) lane = -lane;
  return lane;
}

/** Densify a stop sequence into one curved LineString with per-edge lane offsets. */
function buildCurvedLine(stops, { curveSign = 1, personId, edgeLanes } = {}) {
  if (stops.length < 2) return [];
  const coordsList = stops.map((s) => toPacificCoords(s.coords));
  const unwrapped = unwrapTrajectoryCoords(coordsList);
  const curved = [unwrapped[0]];
  for (let i = 0; i < unwrapped.length - 1; i += 1) {
    const sign = curveSign * (i % 2 === 0 ? 1 : -1);
    const lane = laneForEdge(
      edgeLanes,
      personId,
      stops[i].label,
      stops[i + 1].label
    );
    const segment = curvedSegment(unwrapped[i], unwrapped[i + 1], {
      sign,
      lane,
    });
    curved.push(...segment.slice(1));
  }
  return curved;
}

function curveSignForPerson(member) {
  const key = String(member.id ?? member.name ?? "");
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash + key.charCodeAt(i) * (i + 1)) % 7;
  }
  return hash % 2 === 0 ? 1 : -1;
}

function trajectoryLineColor(member) {
  const color = String(member.color || "#7978D6").trim();
  // Near-black card colors disappear on the dark basemap.
  if (/^#(?:0{3}|0{6})$/i.test(color) || /^black$/i.test(color)) {
    const fallback = String(member.textColor || "").trim();
    if (fallback && !fallback.includes("gradient") && fallback !== "white") {
      return fallback;
    }
    return "#537eb5";
  }
  return color || "#7978D6";
}

/**
 * Cropped circle for local-only members.
 * Same radius for everyone; the circumference still passes through the
 * city node. Variation is heading (ocean sector west/SW of the hub) and
 * crop-sweep direction, so two rings at Singapore don't stack.
 */
function buildRingLine(center, { personId, peerIndex = 0, peerCount = 1 } = {}) {
  const [lng, lat] = toPacificCoords(center);
  const key = String(personId || "");
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash + key.charCodeAt(i) * (i + 1)) % 11;
  }

  // |center→hub| = radius, so the outer ring passes through the city.
  const radius = 8.8;
  // WSW into the Indian Ocean; ~66° fan keeps rings apart without
  // swinging north into Malaysia.
  const baseHeading = Math.PI + Math.PI / 6;
  const headingSpan = 1.15;
  let heading;
  if (peerCount > 1) {
    const t = peerIndex / (peerCount - 1);
    heading = baseHeading - headingSpan / 2 + t * headingSpan;
  } else {
    heading = baseHeading + ((hash - 5) / 11) * headingSpan;
  }

  const cx = lng + Math.cos(heading) * radius;
  const cy = lat + Math.sin(heading) * radius;
  const cityAngle = Math.atan2(lat - cy, lng - cx);

  // ~7/8 turn along the rim; flip direction so stacked hub rings
  // crop on opposite sides.
  const sweepDir = (peerCount > 1 ? peerIndex : hash) % 2 === 0 ? 1 : -1;
  const sweep = Math.PI * 2 * (7 / 8) * sweepDir;
  const steps = 96;
  const coords = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = cityAngle + (i / steps) * sweep;
    coords.push([cx + Math.cos(t) * radius, cy + Math.sin(t) * radius]);
  }
  // Close the crop back to the hub center.
  coords.push([lng, lat]);
  return coords;
}

/** Stable order of local-only people per city, so hub rings can fan out. */
function buildLocalRingLanes(membersWithStops) {
  const ringLanes = new Map();
  membersWithStops.forEach(({ member, stops }) => {
    if (stops.length !== 1) return;
    const personId = String(member.id);
    const key = cityKey(stops[0].label, stops[0].coords);
    if (!ringLanes.has(key)) ringLanes.set(key, []);
    const peers = ringLanes.get(key);
    if (!peers.includes(personId)) peers.push(personId);
  });
  ringLanes.forEach((peers) => peers.sort());
  return ringLanes;
}

/**
 * For each undirected city↔city hop, list personIds sharing that corridor
 * (stable order) so overlapping / reverse routes take different lanes.
 */
function buildEdgeLanes(membersWithStops) {
  const edgeLanes = new Map();
  membersWithStops.forEach(({ member, stops }) => {
    if (stops.length < 2) return;
    const personId = String(member.id);
    for (let i = 0; i < stops.length - 1; i += 1) {
      const key = edgeKey(stops[i].label, stops[i + 1].label);
      if (!edgeLanes.has(key)) edgeLanes.set(key, []);
      const peers = edgeLanes.get(key);
      if (!peers.includes(personId)) peers.push(personId);
    }
  });
  edgeLanes.forEach((peers) => peers.sort());
  return edgeLanes;
}

/**
 * Build city nodes (aggregated) + person trajectory lines.
 * Stop schema: { loc, label (city), note (personal detail) }
 */
export function buildTrajectoryFeatures(members) {
  const cities = new Map();
  const lines = [];

  const membersWithStops = members.map((member) => {
    const stops = (member.trajectory || [])
      .map((stop, index) => {
        const coords = parseDmsLocation(stop.loc);
        if (!coords) return null;
        return {
          label: stop.label || "Unknown",
          note: stop.note || "",
          loc: stop.loc,
          coords,
          index,
        };
      })
      .filter(Boolean);
    return { member, stops };
  });

  const edgeLanes = buildEdgeLanes(membersWithStops);
  const ringLanes = buildLocalRingLanes(membersWithStops);

  membersWithStops.forEach(({ member, stops }) => {
    stops.forEach((stop) => {
      const key = cityKey(stop.label, stop.coords);
      const stages = classifyStages(stop.note, member);
      if (!cities.has(key)) {
        cities.set(key, {
          label: stop.label,
          coords: toPacificCoords(stop.coords),
          affiliations: [],
          stageCounts: emptyStageCounts(),
        });
      }
      const city = cities.get(key);
      city.affiliations.push({
        name: member.name,
        note: stop.note,
        color: member.color || "#7978D6",
        personId: String(member.id),
        stages,
        role: member.role || "",
        description: member.description || "",
        category: member.category || "",
      });
      stages.forEach((stage) => {
        city.stageCounts[stage] += 1;
      });
    });

    if (stops.length >= 2) {
      const personId = String(member.id);
      lines.push({
        type: "Feature",
        properties: {
          name: member.name,
          color: trajectoryLineColor(member),
          personId,
        },
        geometry: {
          type: "LineString",
          coordinates: buildCurvedLine(stops, {
            curveSign: curveSignForPerson(member),
            personId,
            edgeLanes,
          }),
        },
      });
    } else if (stops.length === 1) {
      // Local-only members still get a visible orbit around their city.
      const personId = String(member.id);
      const city = cityKey(stops[0].label, stops[0].coords);
      const peers = ringLanes.get(city) || [personId];
      const peerIndex = Math.max(0, peers.indexOf(personId));
      lines.push({
        type: "Feature",
        properties: {
          name: member.name,
          color: trajectoryLineColor(member),
          personId,
        },
        geometry: {
          type: "LineString",
          coordinates: buildRingLine(stops[0].coords, {
            personId,
            peerIndex,
            peerCount: peers.length,
          }),
        },
      });
    }
  });

  const points = Array.from(cities.values()).map((city) => ({
    type: "Feature",
    properties: {
      label: city.label,
      count: city.affiliations.length,
      stageCounts: city.stageCounts,
      affiliations: city.affiliations,
    },
    geometry: {
      type: "Point",
      coordinates: city.coords,
    },
  }));

  return {
    points: { type: "FeatureCollection", features: points },
    lines: { type: "FeatureCollection", features: lines },
  };
}

/** Decorative privacy node — not a real city, excluded from legend / fit bounds. */
const PRIVACY_NODE = {
  id: "privacy-retained",
  label: "Location Privacy Retained",
  // South Pacific (Pacific-centered lng) — clear of trajectory nodes.
  coords: [198, -14],
  tooltip:
    "All trajectories shown are shared with the consent of each lab member. Locations may be omitted upon request.",
};

function createPrivacyIconImage() {
  const r = 8;
  const size = Math.ceil(r * 2 + 4);
  const cx = size / 2;
  const cy = size / 2;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#8a8a8a";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 1.25;
  ctx.stroke();

  return {
    id: "privacy-node",
    image: ctx.getImageData(0, 0, size, size),
    size,
  };
}

function privacyPopupHtml() {
  return `<p class="trajectory-popup-privacy">${escapeHtml(
    PRIVACY_NODE.tooltip
  )}</p>`;
}

/** Pixel radius for pie icons (map symbol layer, not HTML markers). */
function pieRadius(peopleCount) {
  const n = Math.max(1, peopleCount);
  return Math.min(14, Math.round(5 + Math.sqrt(n) * 2.6));
}

/** Hit target is larger than the visible pie so dense nodes are easier to hover. */
const PIE_HIT_RADIUS_PX = 18;

function pieIconId(stageCounts, peopleCount) {
  const parts = STAGE_IDS.map((id) => stageCounts[id] || 0).join("-");
  return `pie-${peopleCount}-${parts}`;
}

/** Draw a pie to canvas for use as a Mapbox symbol image (stays in GeoJSON lng space). */
function createPieIconImage(stageCounts, peopleCount) {
  const counts = STAGE_IDS.map((id) => stageCounts[id] || 0);
  const total = counts.reduce((sum, n) => sum + n, 0) || 1;
  const r = pieRadius(peopleCount);
  const size = Math.ceil(r * 2 + 4);
  const cx = size / 2;
  const cy = size / 2;
  const radius = r;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  let angle = -Math.PI / 2;
  counts.forEach((count, i) => {
    if (count <= 0) return;
    const slice = (count / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = STAGE_COLOR[STAGE_IDS[i]];
    ctx.fill();
    angle += slice;
  });

  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(radius - 0.5, 0), 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 1.25;
  ctx.stroke();

  return {
    id: pieIconId(stageCounts, peopleCount),
    image: ctx.getImageData(0, 0, size, size),
    size,
  };
}

function primaryStageRank(stages) {
  if (!stages || !stages.length) return STAGE_IDS.length;
  let best = STAGE_IDS.length;
  stages.forEach((stage) => {
    const idx = STAGE_IDS.indexOf(stage);
    if (idx !== -1 && idx < best) best = idx;
  });
  return best;
}

/** Lab-role order for Singapore (and similar hub) tooltips. */
const LAB_ROLE_ORDER = ["pi", "postdoc", "phd", "master", "visiting", "alumni"];

/**
 * Infer lab role for popup ordering from the stop note, then member fields.
 * Interns are grouped with visiting.
 */
function classifyLabRole(note, member = {}) {
  const noteText = String(note || "");
  const roleText = `${member.role || ""} ${member.description || ""}`;
  const combined = `${noteText} ${roleText}`;

  // Prefer the stop note — e.g. "Intern @Palette Lab" over "UCSC PhD" in role.
  if (/\bpi\b/i.test(noteText)) return "pi";
  if (/\bpost[\s-]?docs?(?:toral)?\b/i.test(noteText)) return "postdoc";
  if (/\bvisit(?:ing|or)?\b/i.test(noteText) || /\bintern(?:ship)?s?\b/i.test(noteText)) {
    return "visiting";
  }
  if (/\bph\.?\s*d\.?\b/i.test(noteText)) return "phd";
  if (
    /\b(?:m\.?\s*s\.?\s*e\.?|m\.?\s*sc\.?|m\.?\s*s\.?|m\.?\s*a\.?|master'?s?)\b/i.test(
      noteText
    )
  ) {
    return "master";
  }
  if (/\balumn(?:i|us|a|ae)?\b/i.test(noteText)) return "alumni";

  // Fall back to member role / category.
  if (member.category === "professor" || /\blab director\b/i.test(combined)) {
    return "pi";
  }
  if (/\bpost[\s-]?docs?(?:toral)?\b/i.test(roleText)) return "postdoc";
  if (/\bvisit(?:ing|or)?\b/i.test(roleText) || /\bintern(?:ship)?s?\b/i.test(roleText)) {
    return "visiting";
  }
  if (/\bph\.?\s*d\.?\b/i.test(roleText)) return "phd";
  if (/\bmaster'?s?\b/i.test(roleText)) return "master";
  if (
    member.category === "friends" ||
    /\balumn(?:i|us|a|ae)?\b/i.test(combined) ||
    /\b(?:past|former)\b/i.test(roleText)
  ) {
    return "alumni";
  }

  return "phd";
}

function labRoleRank(note, member = {}) {
  const role = classifyLabRole(note, member);
  const idx = LAB_ROLE_ORDER.indexOf(role);
  return idx === -1 ? LAB_ROLE_ORDER.length : idx;
}

function cityPopupHtml(label, affiliations) {
  const isSingapore = /^singapore$/i.test(String(label || "").trim());
  const sorted = [...(affiliations || [])].sort((a, b) => {
    if (isSingapore) {
      const roleDiff =
        labRoleRank(a.note, a) - labRoleRank(b.note, b);
      if (roleDiff !== 0) return roleDiff;
    } else {
      const stageDiff = primaryStageRank(a.stages) - primaryStageRank(b.stages);
      if (stageDiff !== 0) return stageDiff;
    }
    return String(a.name).localeCompare(String(b.name));
  });

  const items = sorted
    .map((person) => {
      const note = person.note
        ? `<span class="trajectory-popup-note">${escapeHtml(person.note)}</span>`
        : "";
      return `<li><span class="trajectory-popup-person">${escapeHtml(
        person.name
      )}</span>${note}</li>`;
    })
    .join("");

  return `<strong class="trajectory-popup-city">${escapeHtml(
    label
  )}</strong><ul class="trajectory-popup-list">${items}</ul>`;
}

function TrajectoryMap({
  members,
  embedded = false,
  pinnedPersonId = null,
  onPersonHover,
  onPersonPin,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const membersRef = useRef(members);
  const onPersonHoverRef = useRef(onPersonHover);
  const onPersonPinRef = useRef(onPersonPin);
  const pinnedPersonIdRef = useRef(pinnedPersonId);
  const setHoverPersonRef = useRef(null);
  const applyHighlightRef = useRef(null);
  const setFlowFilterRef = useRef(null);
  const ignoreNextDocClickRef = useRef(false);
  const clearStickyCityRef = useRef(null);
  const glowFrameRef = useRef(null);
  membersRef.current = members;
  onPersonHoverRef.current = onPersonHover;
  onPersonPinRef.current = onPersonPin;
  pinnedPersonIdRef.current = pinnedPersonId;

  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const { points, lines } = buildTrajectoryFeatures(membersRef.current);
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      projection: "mercator",
      // Pacific-centered: Asia left, Americas right
      center: [180, 20],
      zoom: 1.6,
      minZoom: 1,
      maxZoom: 6,
      pitch: 0,
      maxPitch: 0,
      bearing: 0,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      renderWorldCopies: true,
      attributionControl: false,
      logoPosition: "bottom-right",
    });

    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-right"
    );
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false, visualizePitch: false }),
      "top-right"
    );
    mapRef.current = map;

    map.on("load", () => {
      applyPurpleDarkTheme(map);

      map.addSource("trajectories", {
        type: "geojson",
        data: lines,
        promoteId: "personId",
      });

      // Serialize city payloads for the invisible hit layer + pie symbols.
      // Keep Pacific-shifted longitudes here so pies stay aligned with lines
      // (HTML Marker.setLngLat wraps to ±180 and drifts onto the wrong world copy).
      const pointHitCollection = {
        type: "FeatureCollection",
        features: [
          ...points.features.map((feature, index) => {
            const { label, count, stageCounts, affiliations } = feature.properties;
            const icon = createPieIconImage(stageCounts, count);
            if (!map.hasImage(icon.id)) {
              map.addImage(icon.id, icon.image, { pixelRatio: 1 });
            }
            return {
              type: "Feature",
              properties: {
                id: index,
                label,
                count,
                icon: icon.id,
                iconSize: icon.size,
                isHub: String(label || "").trim().toLowerCase() === "singapore",
                kind: "city",
                affiliations: JSON.stringify(affiliations || []),
              },
              geometry: feature.geometry,
            };
          }),
          (() => {
            const icon = createPrivacyIconImage();
            if (!map.hasImage(icon.id)) {
              map.addImage(icon.id, icon.image, { pixelRatio: 1 });
            }
            return {
              type: "Feature",
              properties: {
                id: points.features.length,
                label: PRIVACY_NODE.label,
                count: 0,
                icon: icon.id,
                iconSize: icon.size,
                isHub: false,
                kind: "privacy",
                affiliations: "[]",
              },
              geometry: {
                type: "Point",
                coordinates: PRIVACY_NODE.coords,
              },
            };
          })(),
        ],
      };
      map.addSource("trajectory-points", {
        type: "geojson",
        data: pointHitCollection,
      });

      // Wide invisible hit area for easier line hover.
      map.addLayer({
        id: "trajectory-lines-hit",
        type: "line",
        source: "trajectories",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#ffffff",
          "line-width": 14,
          "line-opacity": 0,
        },
      });

      map.addLayer({
        id: "trajectory-lines",
        type: "line",
        source: "trajectories",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": ["get", "color"],
          "line-width": [
            "case",
            ["boolean", ["feature-state", "flow"], false],
            0,
            ["boolean", ["feature-state", "hover"], false],
            3.4,
            1.15,
          ],
          "line-opacity": [
            "case",
            ["boolean", ["feature-state", "flow"], false],
            0,
            ["boolean", ["feature-state", "hover"], false],
            1,
            0.7,
          ],
        },
      });

      // Flowing dashes only for the clicked/pinned trajectory.
      map.addLayer({
        id: "trajectory-lines-flow",
        type: "line",
        source: "trajectories",
        filter: ["==", ["get", "personId"], ""],
        layout: {
          "line-join": "round",
          "line-cap": "butt",
        },
        paint: {
          "line-color": ["get", "color"],
          "line-dasharray": [2, 2.5],
          "line-width": 3.6,
          "line-opacity": 1,
        },
      });

      // Singapore hub glow (animated below pies).
      map.addLayer({
        id: "trajectory-hub-glow",
        type: "circle",
        source: "trajectory-points",
        filter: ["==", ["get", "isHub"], true],
        paint: {
          "circle-radius": 36,
          "circle-color": "#7978D6",
          "circle-opacity": 0.4,
          "circle-blur": 1.1,
        },
      });

      map.addLayer({
        id: "trajectory-hub-glow-outer",
        type: "circle",
        source: "trajectory-points",
        filter: ["==", ["get", "isHub"], true],
        paint: {
          "circle-radius": 52,
          "circle-color": "#c0bdf1",
          "circle-opacity": 0.2,
          "circle-blur": 1.4,
        },
      });

      map.addLayer({
        id: "trajectory-points-symbol",
        type: "symbol",
        source: "trajectory-points",
        layout: {
          "icon-image": ["get", "icon"],
          "icon-size": 1,
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
          "symbol-sort-key": ["get", "count"],
        },
      });

      map.addLayer({
        id: "trajectory-privacy-label",
        type: "symbol",
        source: "trajectory-points",
        filter: ["==", ["get", "kind"], "privacy"],
        layout: {
          "text-field": ["get", "label"],
          "text-size": 11,
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
          "text-offset": [0, 1.35],
          "text-anchor": "top",
          "text-max-width": 10,
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#b4b4b4",
          "text-halo-color": "rgba(0,0,0,0.75)",
          "text-halo-width": 1.2,
        },
      });

      // Invisible oversized circles — reliable hover even when pies overlap.
      map.addLayer({
        id: "trajectory-points-hit",
        type: "circle",
        source: "trajectory-points",
        paint: {
          "circle-radius": PIE_HIT_RADIUS_PX,
          "circle-opacity": 0,
          "circle-stroke-width": 0,
        },
      });

      // Animate dashes so they “flow” along the pinned path only.
      const dashArraySequence = [
        [0, 4, 3],
        [0.5, 4, 2.5],
        [1, 4, 2],
        [1.5, 4, 1.5],
        [2, 4, 1],
        [2.5, 4, 0.5],
        [3, 4, 0],
        [0, 0.5, 3, 3.5],
        [0, 1, 3, 3],
        [0, 1.5, 3, 2.5],
        [0, 2, 3, 2],
        [0, 2.5, 3, 1.5],
        [0, 3, 3, 1],
        [0, 3.5, 3, 0.5],
      ];
      let dashStep = 0;
      let lastDashTs = 0;

      const pulseHubGlow = () => {
        if (!map.getLayer("trajectory-hub-glow")) return;
        const now = performance.now();
        const t = (now % 2400) / 2400;
        const wave = 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
        map.setPaintProperty(
          "trajectory-hub-glow",
          "circle-radius",
          28 + wave * 26
        );
        map.setPaintProperty(
          "trajectory-hub-glow",
          "circle-opacity",
          0.22 + wave * 0.38
        );
        if (map.getLayer("trajectory-hub-glow-outer")) {
          map.setPaintProperty(
            "trajectory-hub-glow-outer",
            "circle-radius",
            42 + wave * 36
          );
          map.setPaintProperty(
            "trajectory-hub-glow-outer",
            "circle-opacity",
            0.1 + wave * 0.22
          );
        }

        if (
          pinnedPersonIdRef.current &&
          map.getLayer("trajectory-lines-flow") &&
          now - lastDashTs > 48
        ) {
          lastDashTs = now;
          dashStep = (dashStep + 1) % dashArraySequence.length;
          map.setPaintProperty(
            "trajectory-lines-flow",
            "line-dasharray",
            dashArraySequence[dashStep]
          );
        }

        glowFrameRef.current = requestAnimationFrame(pulseHubGlow);
      };
      glowFrameRef.current = requestAnimationFrame(pulseHubGlow);

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 16,
        className: "trajectory-popup",
        maxWidth: "280px",
        anchor: "bottom",
      });

      let activeCityId = null;
      let stickyCityId = null;
      let hoveredPersonId = null;
      let highlightedPersonId = null;

      const resolvePersonId = (feature) => {
        if (!feature) return null;
        const raw = feature.id ?? feature.properties?.personId;
        if (raw == null || raw === "") return null;
        return String(raw);
      };

      const applyHighlight = (personId) => {
        const nextId = personId == null || personId === "" ? null : String(personId);
        if (highlightedPersonId === nextId) return;

        if (highlightedPersonId != null) {
          try {
            map.setFeatureState(
              { source: "trajectories", id: highlightedPersonId },
              { hover: false }
            );
          } catch (_) {
            // Source may already be gone during teardown.
          }
        }

        highlightedPersonId = nextId;
        if (highlightedPersonId != null) {
          try {
            map.setFeatureState(
              { source: "trajectories", id: highlightedPersonId },
              { hover: true }
            );
          } catch (_) {
            // Feature may not be in the source yet.
          }
        }
      };

      const refreshFocus = () => {
        const activeId = hoveredPersonId || pinnedPersonIdRef.current || null;
        applyHighlight(activeId);
        onPersonHoverRef.current?.(hoveredPersonId);
      };

      const setHoverPerson = (personId) => {
        hoveredPersonId =
          personId == null || personId === "" ? null : String(personId);
        refreshFocus();
      };
      setHoverPersonRef.current = setHoverPerson;
      applyHighlightRef.current = () => {
        applyHighlight(hoveredPersonId || pinnedPersonIdRef.current || null);
      };

      let flowFeatureId = null;
      const setFlowFilter = (personId) => {
        if (!map.getLayer("trajectory-lines-flow")) return;
        const nextId = personId ? String(personId) : null;
        map.setFilter(
          "trajectory-lines-flow",
          nextId
            ? ["==", ["get", "personId"], nextId]
            : ["==", ["get", "personId"], ""]
        );

        if (flowFeatureId && flowFeatureId !== nextId) {
          try {
            map.setFeatureState(
              { source: "trajectories", id: flowFeatureId },
              { flow: false }
            );
          } catch (_) {
            // ignore
          }
        }
        flowFeatureId = nextId;
        if (flowFeatureId) {
          try {
            map.setFeatureState(
              { source: "trajectories", id: flowFeatureId },
              { flow: true }
            );
          } catch (_) {
            // ignore
          }
        }
      };
      setFlowFilterRef.current = setFlowFilter;

      const clearPersonPin = () => {
        pinnedPersonIdRef.current = null;
        onPersonPinRef.current?.(null);
        setFlowFilter(null);
        applyHighlight(hoveredPersonId);
      };

      const setPopupSticky = (sticky) => {
        const el = popup.getElement();
        if (!el) return;
        el.classList.toggle("trajectory-popup--sticky", sticky);
      };

      /** Keep popup on the Pacific-shifted copy (Popup also wraps ±180 otherwise). */
      const setPopupLngLat = (coords) => {
        popup.setLngLat(coords);
        if (popup._lngLat) {
          popup._lngLat.lng = coords[0];
          popup._lngLat.lat = coords[1];
        }
      };

      const clearStickyCity = () => {
        if (stickyCityId == null) return;
        stickyCityId = null;
        activeCityId = null;
        setPopupSticky(false);
        popup.remove();
      };
      clearStickyCityRef.current = clearStickyCity;

      const hideHoverUi = () => {
        if (stickyCityId != null) {
          setHoverPerson(null);
          map.getCanvas().style.cursor = "";
          return;
        }
        activeCityId = null;
        setHoverPerson(null);
        map.getCanvas().style.cursor = "";
        popup.remove();
      };

      const pickLineFeature = (point) => {
        const hits = map.queryRenderedFeatures(point, {
          layers: ["trajectory-lines-hit"],
        });
        return hits[0] || null;
      };

      const showCityPopup = (feature, { sticky = false } = {}) => {
        const id = Number(feature.properties.id);
        activeCityId = id;
        if (sticky) stickyCityId = id;

        const isPrivacy = feature.properties.kind === "privacy";

        map.getCanvas().style.cursor = "pointer";
        setPopupLngLat(feature.geometry.coordinates);

        if (isPrivacy) {
          popup.setHTML(privacyPopupHtml()).addTo(map);
        } else {
          let affiliations = [];
          try {
            affiliations = JSON.parse(feature.properties.affiliations || "[]");
          } catch (_) {
            affiliations = [];
          }
          popup
            .setHTML(cityPopupHtml(feature.properties.label, affiliations))
            .addTo(map);
        }
        setPopupSticky(sticky);

        if (sticky) {
          const el = popup.getElement();
          if (el) {
            el.onclick = (ev) => ev.stopPropagation();
            el.onmousedown = (ev) => ev.stopPropagation();
            el.ontouchstart = (ev) => ev.stopPropagation();
          }
        }
      };

      const cityPointsForBounds = points.features;
      if (cityPointsForBounds.length > 0) {
        // Don't use LngLatBounds/fitBounds — they wrap lng into ±180 and break
        // the Pacific-centered camera relative to unwrapped GeoJSON features.
        const pacificBounds = cityPointsForBounds.reduce((b, f) => {
          const c = f.geometry.coordinates;
          if (!b) return { minLng: c[0], maxLng: c[0], minLat: c[1], maxLat: c[1] };
          return {
            minLng: Math.min(b.minLng, c[0]),
            maxLng: Math.max(b.maxLng, c[0]),
            minLat: Math.min(b.minLat, c[1]),
            maxLat: Math.max(b.maxLat, c[1]),
          };
        }, null);
        if (pacificBounds) {
          const lngSpan = Math.max(pacificBounds.maxLng - pacificBounds.minLng, 20);
          const latSpan = Math.max(pacificBounds.maxLat - pacificBounds.minLat, 10);
          const zoom = Math.min(
            5,
            Math.max(1.35, Math.log2(360 / Math.max(lngSpan, latSpan * 1.6)) + 0.85)
          );
          map.easeTo({
            center: [166, (pacificBounds.minLat + pacificBounds.maxLat) / 2],
            zoom,
            duration: 800,
          });
        }
      }

      // Embedded layouts may mount before final size is known.
      requestAnimationFrame(() => map.resize());

      const pickCityFeature = (point, lngLat) => {
        const hits = map.queryRenderedFeatures(point, {
          layers: ["trajectory-points-hit"],
        });
        if (!hits.length) return null;
        if (hits.length === 1) return hits[0];

        const unwrapNear = (lng, target) => {
          let x = lng;
          while (x - target > 180) x -= 360;
          while (target - x > 180) x += 360;
          return x;
        };

        let best = hits[0];
        let bestDist = Infinity;
        hits.forEach((hit) => {
          const [lng, lat] = hit.geometry.coordinates;
          const cursorLng = unwrapNear(lngLat.lng, lng);
          const dx = cursorLng - lng;
          const dy = lngLat.lat - lat;
          const dist = dx * dx + dy * dy;
          if (dist < bestDist) {
            bestDist = dist;
            best = hit;
          }
        });
        return best;
      };

      map.on("mousemove", (e) => {
        // Sticky city tooltip stays until click-away; still allow line hover.
        if (stickyCityId != null) {
          const lineFeature = pickLineFeature(e.point);
          if (lineFeature) {
            setHoverPerson(resolvePersonId(lineFeature));
            map.getCanvas().style.cursor = "pointer";
          } else {
            setHoverPerson(null);
            map.getCanvas().style.cursor = "";
          }
          return;
        }

        const cityFeature = pickCityFeature(e.point, e.lngLat);
        if (cityFeature) {
          setHoverPerson(null);
          showCityPopup(cityFeature, { sticky: false });
          return;
        }

        if (activeCityId != null) {
          activeCityId = null;
          popup.remove();
        }

        const lineFeature = pickLineFeature(e.point);
        if (lineFeature) {
          const personId = resolvePersonId(lineFeature);
          const personName = lineFeature.properties?.name || "";
          setHoverPerson(personId);
          map.getCanvas().style.cursor = "pointer";
          setPopupLngLat([e.lngLat.lng, e.lngLat.lat]);
          popup
            .setHTML(
              `<strong class="trajectory-popup-person-only">${escapeHtml(
                personName
              )}</strong>`
            )
            .addTo(map);
          setPopupSticky(false);
          return;
        }

        setHoverPerson(null);
        if (popup.isOpen()) popup.remove();
        map.getCanvas().style.cursor = "";
      });

      map.on("click", (e) => {
        const cityFeature = pickCityFeature(e.point, e.lngLat);
        if (cityFeature) {
          // Click node → sticky scrollable tooltip; clears trajectory pin.
          ignoreNextDocClickRef.current = true;
          clearPersonPin();
          showCityPopup(cityFeature, { sticky: true });
          return;
        }

        const lineFeature = pickLineFeature(e.point);
        if (lineFeature) {
          const personId = resolvePersonId(lineFeature);
          if (!personId) return;
          ignoreNextDocClickRef.current = true;
          clearStickyCity();
          pinnedPersonIdRef.current = personId;
          onPersonPinRef.current?.(personId);
          setFlowFilter(personId);
          applyHighlight(personId);
          return;
        }

        // Empty map click → clear pin + sticky city.
        clearStickyCity();
        clearPersonPin();
      });

      map.on("mouseout", hideHoverUi);

      if (pinnedPersonIdRef.current) {
        setFlowFilter(pinnedPersonIdRef.current);
        applyHighlight(pinnedPersonIdRef.current);
      }
    });

    return () => {
      if (glowFrameRef.current) cancelAnimationFrame(glowFrameRef.current);
      glowFrameRef.current = null;
      setHoverPersonRef.current = null;
      applyHighlightRef.current = null;
      setFlowFilterRef.current = null;
      clearStickyCityRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Keep line highlight in sync when React pin state changes.
  useEffect(() => {
    pinnedPersonIdRef.current = pinnedPersonId;
    setFlowFilterRef.current?.(pinnedPersonId);
    applyHighlightRef.current?.();
  }, [pinnedPersonId]);

  // Click anywhere outside a fresh pin/node action to clear pin + sticky tooltip.
  useEffect(() => {
    const onDocClick = () => {
      if (ignoreNextDocClickRef.current) {
        ignoreNextDocClickRef.current = false;
        return;
      }
      clearStickyCityRef.current?.();
      pinnedPersonIdRef.current = null;
      onPersonPinRef.current?.(null);
      setFlowFilterRef.current?.(null);
      applyHighlightRef.current?.();
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={
          embedded
            ? "trajectory-map-embedded"
            : "team-section trajectory-map-section"
        }
      >
        {!embedded && <h2 className="section-title">Where We&apos;re From</h2>}
        <div className="trajectory-map-missing-token">
          Add <code>REACT_APP_MAPBOX_TOKEN</code> to a local <code>.env</code> file
          to enable the trajectory map.
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        embedded
          ? "trajectory-map-embedded"
          : "team-section trajectory-map-section"
      }
    >
      {!embedded && <h2 className="section-title">Where We&apos;re From</h2>}
      <div className="trajectory-map-shell">
        <div ref={mapContainerRef} className="trajectory-map-canvas" />
        <div className="trajectory-map-title-box">
          Cities we stayed in for 1+ years
        </div>
        <div className="trajectory-map-legend-box">
          <ul className="trajectory-map-legend" aria-label="Life stage legend">
            {[...STAGES].reverse().map((stage) => (
              <li key={stage.id}>
                <span
                  className="trajectory-map-legend-swatch"
                  style={{ background: stage.color }}
                />
                {stage.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TrajectoryMap;
