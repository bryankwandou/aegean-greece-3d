import * as THREE from "three";

function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to initialize 2D canvas context for procedural texture.");
  }
  return [canvas, ctx];
}

export function createStuccoTexture(): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const [canvas, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = "#F5F2EA";
  ctx.fillRect(0, 0, 512, 512);

  // Subtle Mediterranean lime plaster variation
  for (let i = 0; i < 6500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 1 + Math.random() * 4;
    const shade = 236 + Math.floor(Math.random() * 18);
    ctx.fillStyle = `rgb(${shade}, ${shade - 2}, ${shade - 7})`;
    ctx.fillRect(x, y, r, r);
  }

  // Horizontal Cycladic plaster score lines (matching reference video walls)
  ctx.strokeStyle = "rgba(185, 180, 168, 0.38)";
  ctx.lineWidth = 2;
  for (const y of [128, 256, 384]) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
    ctx.beginPath();
    ctx.moveTo(0, y + 2);
    ctx.lineTo(512, y + 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(185, 180, 168, 0.38)";
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  map.colorSpace = THREE.SRGBColorSpace;

  const bumpMap = new THREE.CanvasTexture(canvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 2);

  return { map, bumpMap };
}

export function createWeatheredTurquoiseWood(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = "#7BC0B7";
  ctx.fillRect(0, 0, 512, 512);

  // Wood plank lines and weathered white/teal paint streaks
  for (let i = 0; i < 480; i++) {
    const y = Math.random() * 512;
    const h = 1 + Math.random() * 3;
    const isLight = Math.random() > 0.45;
    ctx.fillStyle = isLight ? "rgba(225, 240, 236, 0.24)" : "rgba(56, 118, 112, 0.22)";
    ctx.fillRect(0, y, 512, h);
  }

  // Plank seams
  ctx.strokeStyle = "rgba(38, 82, 78, 0.42)";
  ctx.lineWidth = 2;
  for (let y = 64; y < 512; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createPastelShutterTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = "#54B4A6";
  ctx.fillRect(0, 0, 512, 512);

  // Sun-weathered patina on turquoise shutters (matching Chapter 04)
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const w = 12 + Math.random() * 65;
    const h = 2 + Math.random() * 4;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(215, 238, 232, 0.18)" : "rgba(32, 96, 88, 0.18)";
    ctx.fillRect(x, y, w, h);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createCobbleTexture(): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const [canvas, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = "#B8B09C";
  ctx.fillRect(0, 0, 512, 512);

  // Mortar grit
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(95, 88, 76, 0.25)" : "rgba(225, 218, 202, 0.25)";
    ctx.fillRect(x, y, 2, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.colorSpace = THREE.SRGBColorSpace;

  const bump = new THREE.CanvasTexture(canvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(4, 4);

  return { map: tex, bumpMap: bump };
}

export function createSlateLaneTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = "#ACA592";
  ctx.fillRect(0, 0, 512, 512);

  const cols = 4;
  const rows = 6;
  const cellW = 512 / cols;
  const cellH = 512 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offsetX = (r % 2) * (cellW * 0.25);
      const x = ((c * cellW + offsetX) % 512);
      const y = r * cellH;
      const base = 188 + Math.floor(Math.random() * 26);
      ctx.fillStyle = `rgb(${base}, ${base - 4}, ${base - 16})`;
      ctx.fillRect(x + 3, y + 3, cellW - 6, cellH - 6);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 5);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createLinenWeaveTexture(hexColor: string): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = hexColor;
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  for (let y = 0; y < 256; y += 3) {
    ctx.fillRect(0, y, 256, 1);
  }
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  for (let x = 0; x < 256; x += 3) {
    ctx.fillRect(x, 0, 1, 256);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createWickerTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = "#9C7A4C";
  ctx.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y += 8) {
    ctx.fillStyle = y % 16 === 0 ? "#85653B" : "#B28E5E";
    ctx.fillRect(0, y, 256, 6);
    ctx.fillStyle = "#5E4424";
    ctx.fillRect(0, y + 6, 256, 2);
  }

  for (let x = 0; x < 256; x += 16) {
    ctx.fillStyle = "rgba(65, 45, 20, 0.35)";
    ctx.fillRect(x, 0, 3, 256);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

