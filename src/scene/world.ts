import * as THREE from "three";
import {
  createBoatBowNumberTexture,
  createCobbleTexture,
  createLimestoneTileTexture,
  createLinenWeaveTexture,
  createPastelShutterTexture,
  createSlateLaneTexture,
  createStuccoTexture,
  createWeatheredTurquoiseWood,
  createWickerTexture,
} from "./textures";

export interface AnimatedSceneHandles {
  update: (elapsed: number, breeze: number) => void;
}

interface ClothSheetData {
  mesh: THREE.Mesh;
  basePositions: Float32Array;
  width: number;
  height: number;
  phaseOffset: number;
}

export function buildAegeanWorld(scene: THREE.Scene): AnimatedSceneHandles {
  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  const stucco = createStuccoTexture();
  const whiteWallMat = new THREE.MeshStandardMaterial({
    color: 0xf8f6f0,
    map: stucco.map,
    bumpMap: stucco.bumpMap,
    bumpScale: 0.015,
    roughness: 0.84,
    metalness: 0.02,
  });

  const warmPlasterFloorMat = new THREE.MeshStandardMaterial({
    color: 0xebe5d6,
    map: stucco.map,
    bumpMap: stucco.bumpMap,
    bumpScale: 0.01,
    roughness: 0.86,
  });

  const shutterTex = createPastelShutterTexture();
  const turquoiseShutterMat = new THREE.MeshStandardMaterial({
    map: shutterTex,
    roughness: 0.66,
    metalness: 0.04,
  });

  const blueDoorMat = new THREE.MeshStandardMaterial({
    color: 0x165e85,
    roughness: 0.62,
    metalness: 0.08,
  });

  const weatheredTableTex = createWeatheredTurquoiseWood();
  const bistroTableMat = new THREE.MeshStandardMaterial({
    map: weatheredTableTex,
    roughness: 0.64,
    metalness: 0.04,
  });

  const mintChairMat = new THREE.MeshStandardMaterial({
    color: 0x76b89e,
    roughness: 0.64,
  });

  const teakWoodMat = new THREE.MeshStandardMaterial({
    color: 0x694a30,
    roughness: 0.76,
  });

  const warmPostWoodMat = new THREE.MeshStandardMaterial({
    color: 0xa88450,
    roughness: 0.72,
  });

  const terracottaMat = new THREE.MeshStandardMaterial({
    color: 0xba5d3c,
    roughness: 0.74,
    metalness: 0.03,
  });

  const darkIronMat = new THREE.MeshStandardMaterial({
    color: 0x1e2326,
    roughness: 0.44,
    metalness: 0.76,
  });

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x38281c,
    roughness: 0.9,
  });

  const lemonLeafMat = new THREE.MeshStandardMaterial({
    color: 0x294e22,
    roughness: 0.38,
    metalness: 0.06,
    side: THREE.DoubleSide,
  });

  const ivyLeafMat = new THREE.MeshStandardMaterial({
    color: 0x264820,
    roughness: 0.42,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });

  const jasmineWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xfaf8f2,
    roughness: 0.35,
    side: THREE.DoubleSide,
  });

  const oliveLeafMat = new THREE.MeshStandardMaterial({
    color: 0x5c7352,
    roughness: 0.54,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });

  const bougainvilleaPetalMat = new THREE.MeshStandardMaterial({
    color: 0xc81962,
    roughness: 0.44,
    side: THREE.DoubleSide,
  });

  const bougainvilleaAccentMat = new THREE.MeshStandardMaterial({
    color: 0xe23279,
    roughness: 0.42,
    side: THREE.DoubleSide,
  });

  const yellowLemonMat = new THREE.MeshStandardMaterial({
    color: 0xecd238,
    roughness: 0.32,
    metalness: 0.04,
  });

  const orangeLemonMat = new THREE.MeshStandardMaterial({
    color: 0xdc762a,
    roughness: 0.35,
    metalness: 0.04,
  });

  const swayBranches: THREE.Object3D[] = [];
  const clothSheets: ClothSheetData[] = [];

  // Shared pointed citrus/ficus leaf geometry with 3D midrib curvature
  const pointedLeafGeo = (() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(0.068, 0.09, 0, 0.23);
    s.quadraticCurveTo(-0.068, 0.09, 0, 0);
    const geo = new THREE.ShapeGeometry(s, 5);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const lx = pos.getX(i);
      const ly = pos.getY(i);
      const arch = Math.sin((ly / 0.23) * Math.PI) * 0.022 - Math.abs(lx) * 0.18;
      pos.setZ(i, arch);
    }
    geo.computeVertexNormals();
    return geo;
  })();

  // Pointed ovate bougainvillea bract geometry (delicate 3-bract paper-flower cluster, NOT flat pentagons)
  const bractGeo = (() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(0.026, 0.024, 0, 0.058);
    s.quadraticCurveTo(-0.026, 0.024, 0, 0);
    const geo = new THREE.ShapeGeometry(s, 4);
    geo.computeVertexNormals();
    return geo;
  })();

  function createShutteredWindow(
    width: number,
    height: number,
    shutterMaterial: THREE.Material = turquoiseShutterMat,
  ): THREE.Group {
    const group = new THREE.Group();

    const sill = new THREE.Mesh(new THREE.BoxGeometry(width + 0.24, 0.1, 0.22), whiteWallMat);
    sill.position.set(0, -height / 2 - 0.05, 0.06);
    sill.castShadow = true;
    sill.receiveShadow = true;
    group.add(sill);

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(width + 0.2, 0.09, 0.18), whiteWallMat);
    lintel.position.set(0, height / 2 + 0.045, 0.05);
    lintel.castShadow = true;
    group.add(lintel);

    const halfW = width * 0.48;
    for (const side of [-1, 1]) {
      const panel = new THREE.Group();
      panel.position.set(side * (halfW * 0.5 + 0.01), 0, 0.04);

      const stileL = new THREE.Mesh(new THREE.BoxGeometry(0.06, height, 0.05), shutterMaterial);
      stileL.position.x = -halfW * 0.5 + 0.03;
      const stileR = new THREE.Mesh(new THREE.BoxGeometry(0.06, height, 0.05), shutterMaterial);
      stileR.position.x = halfW * 0.5 - 0.03;
      const railTop = new THREE.Mesh(new THREE.BoxGeometry(halfW, 0.07, 0.05), shutterMaterial);
      railTop.position.y = height * 0.5 - 0.035;
      const railMid = new THREE.Mesh(new THREE.BoxGeometry(halfW, 0.06, 0.05), shutterMaterial);
      const railBot = new THREE.Mesh(new THREE.BoxGeometry(halfW, 0.08, 0.05), shutterMaterial);
      railBot.position.y = -height * 0.5 + 0.04;

      panel.add(stileL, stileR, railTop, railMid, railBot);

      const slatCount = Math.floor(height / 0.072);
      const slatGeo = new THREE.BoxGeometry(halfW - 0.08, 0.044, 0.035);
      for (let i = 0; i < slatCount; i++) {
        const y = -height * 0.44 + (i / (slatCount - 1)) * (height * 0.88);
        const slat = new THREE.Mesh(slatGeo, shutterMaterial);
        slat.position.set(0, y, 0.01);
        slat.rotation.x = 0.38;
        slat.castShadow = true;
        slat.receiveShadow = true;
        panel.add(slat);
      }

      group.add(panel);
    }

    const latch = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.04), darkIronMat);
    latch.position.set(0, 0.05, 0.07);
    group.add(latch);

    return group;
  }

  function createCycladicHouse(w: number, h: number, d: number): THREE.Group {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), whiteWallMat);
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Subtle horizontal reveal grooves on the stucco facade (authentic Cycladic detail in frames 05, 11, 13)
    const grooveMat = new THREE.MeshStandardMaterial({ color: 0xd8d4ca, roughness: 0.9 });
    for (const gy of [h * 0.35, h * 0.68]) {
      const grooveF = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.025, 0.015), grooveMat);
      grooveF.position.set(0, gy, -d / 2 - 0.005);
      const grooveB = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.025, 0.015), grooveMat);
      grooveB.position.set(0, gy, d / 2 + 0.005);
      const grooveL = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.025, d + 0.02), grooveMat);
      grooveL.position.set(-w / 2 - 0.005, gy, 0);
      const grooveR = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.025, d + 0.02), grooveMat);
      grooveR.position.set(w / 2 + 0.005, gy, 0);
      group.add(grooveF, grooveB, grooveL, grooveR);
    }

    const rimThickness = 0.22;
    const rimHeight = 0.24;
    const frontRim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, rimHeight, rimThickness), whiteWallMat);
    frontRim.position.set(0, h + rimHeight / 2, -d / 2 + rimThickness / 2);
    frontRim.castShadow = true;
    frontRim.receiveShadow = true;

    const backRim = frontRim.clone();
    backRim.position.z = d / 2 - rimThickness / 2;

    const leftRim = new THREE.Mesh(new THREE.BoxGeometry(rimThickness, rimHeight, d), whiteWallMat);
    leftRim.position.set(-w / 2 + rimThickness / 2, h + rimHeight / 2, 0);
    leftRim.castShadow = true;
    leftRim.receiveShadow = true;

    const rightRim = leftRim.clone();
    rightRim.position.x = w / 2 - rimThickness / 2;

    group.add(frontRim, backRim, leftRim, rightRim);
    return group;
  }

  function createWallLantern(): THREE.Group {
    const lantern = new THREE.Group();
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.16), darkIronMat);
    bracket.position.set(0, 0, 0.08);
    const cage = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.12), darkIronMat);
    cage.position.set(0, -0.06, 0.16);
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.14, 0.09),
      new THREE.MeshStandardMaterial({ color: 0xfffae0, emissive: 0xffe890, emissiveIntensity: 0.35 }),
    );
    glass.position.set(0, -0.06, 0.16);
    lantern.add(bracket, cage, glass);
    return lantern;
  }

  function createLemonCluster(radius: number, leafCount: number, lemonCount: number): THREE.Group {
    const cluster = new THREE.Group();
    const lemonGeo = new THREE.SphereGeometry(0.076, 14, 12);
    lemonGeo.scale(0.82, 1.28, 0.82);

    for (let i = 0; i < leafCount; i++) {
      const leaf = new THREE.Mesh(pointedLeafGeo, lemonLeafMat);
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * radius;
      leaf.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) * 0.62,
        r * Math.sin(phi) * Math.sin(theta),
      );
      leaf.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );
      const scale = 0.82 + Math.random() * 0.52;
      leaf.scale.setScalar(scale);
      leaf.castShadow = true;
      leaf.receiveShadow = true;
      cluster.add(leaf);
    }

    for (let i = 0; i < lemonCount; i++) {
      const isOrange = Math.random() < 0.22;
      const lemon = new THREE.Mesh(lemonGeo, isOrange ? orangeLemonMat : yellowLemonMat);
      const angle = (i / lemonCount) * Math.PI * 2 + Math.random() * 0.5;
      const dist = (0.25 + Math.random() * 0.65) * radius;
      lemon.position.set(
        Math.cos(angle) * dist,
        -0.06 - Math.random() * (radius * 0.42),
        Math.sin(angle) * dist,
      );
      lemon.rotation.set(
        (Math.random() - 0.5) * 0.35,
        Math.random() * Math.PI,
        (Math.random() - 0.5) * 0.35,
      );
      lemon.castShadow = true;
      lemon.receiveShadow = true;
      cluster.add(lemon);
    }

    swayBranches.push(cluster);
    return cluster;
  }

  function createBougainvilleaPatch(
    width: number,
    height: number,
    depth: number,
    density: number,
  ): THREE.Group {
    const patch = new THREE.Group();

    for (let i = 0; i < density; i++) {
      const x = (Math.random() - 0.5) * width;
      const y = (Math.random() - 0.5) * height;
      const z = (Math.random() - 0.5) * depth;

      const isFlower = Math.random() < 0.66;
      if (isFlower) {
        const mat = Math.random() > 0.42 ? bougainvilleaPetalMat : bougainvilleaAccentMat;
        // 3-bract pointed magenta paper-flower cluster
        for (let b = 0; b < 3; b++) {
          const bract = new THREE.Mesh(bractGeo, mat);
          bract.position.set(x + (b - 1) * 0.018, y + (b % 2) * 0.012, z);
          bract.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI,
          );
          bract.scale.setScalar(1.22 + Math.random() * 0.68);
          bract.castShadow = true;
          patch.add(bract);
        }
      } else {
        const leaf = new THREE.Mesh(pointedLeafGeo, lemonLeafMat);
        leaf.position.set(x, y, z);
        leaf.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        );
        leaf.scale.setScalar(0.45 + Math.random() * 0.35);
        leaf.castShadow = true;
        patch.add(leaf);
      }
    }
    swayBranches.push(patch);
    return patch;
  }

  // Green climbing ivy + white star-jasmine flowers for the Right Harbor House & Teal Door (matching frame_004!)
  function createJasmineIvyPatch(
    width: number,
    height: number,
    depth: number,
    leafCount: number,
    blossomCount: number,
  ): THREE.Group {
    const patch = new THREE.Group();
    const starPetalGeo = new THREE.CircleGeometry(0.022, 5);

    for (let i = 0; i < leafCount; i++) {
      const leaf = new THREE.Mesh(pointedLeafGeo, ivyLeafMat);
      leaf.position.set(
        (Math.random() - 0.5) * width,
        (Math.random() - 0.5) * height,
        (Math.random() - 0.5) * depth,
      );
      leaf.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );
      leaf.scale.setScalar(0.42 + Math.random() * 0.32);
      leaf.castShadow = true;
      patch.add(leaf);
    }

    for (let i = 0; i < blossomCount; i++) {
      const star = new THREE.Mesh(starPetalGeo, jasmineWhiteMat);
      star.position.set(
        (Math.random() - 0.5) * width,
        (Math.random() - 0.5) * height,
        (Math.random() - 0.5) * depth + 0.02,
      );
      star.rotation.y = Math.PI / 2 + (Math.random() - 0.5) * 0.4;
      star.rotation.z = Math.random() * Math.PI;
      patch.add(star);
    }

    swayBranches.push(patch);
    return patch;
  }

  // ============================================================================
  // 1. TRADITIONAL GREEK WOODEN BOAT (#86) IN THE CRYSTAL COVE
  // ============================================================================
  const boatGroup = new THREE.Group();
  boatGroup.position.set(0.38, 0.1, -8.15);
  boatGroup.rotation.y = -0.36;
  worldGroup.add(boatGroup);

  const hullLength = 3.35;
  const hullWidth = 1.16;
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-hullLength * 0.5, 0);
  hullShape.quadraticCurveTo(-hullLength * 0.15, hullWidth * 0.56, hullLength * 0.35, hullWidth * 0.48);
  hullShape.lineTo(hullLength * 0.5, 0);
  hullShape.lineTo(hullLength * 0.35, -hullWidth * 0.48);
  hullShape.quadraticCurveTo(-hullLength * 0.15, -hullWidth * 0.56, -hullLength * 0.5, 0);

  const hullExtrude = new THREE.ExtrudeGeometry(hullShape, {
    depth: 0.46,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.055,
    bevelThickness: 0.055,
  });
  hullExtrude.rotateX(-Math.PI / 2);

  const boatHullMat = new THREE.MeshStandardMaterial({ color: 0xf7f6f1, roughness: 0.48 });
  const hullMesh = new THREE.Mesh(hullExtrude, boatHullMat);
  hullMesh.position.y = -0.06;
  hullMesh.castShadow = true;
  hullMesh.receiveShadow = true;
  boatGroup.add(hullMesh);

  // Registration badge "86" on starboard/port bow (visible in frame_001 & frame_008)
  const bowBadgeTex = createBoatBowNumberTexture();
  const bowBadgeMat = new THREE.MeshStandardMaterial({ map: bowBadgeTex, roughness: 0.5 });
  for (const side of [-1, 1]) {
    const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.14), bowBadgeMat);
    badge.position.set(-0.88, 0.25, side * (hullWidth * 0.46));
    badge.rotation.y = side > 0 ? 0.18 : Math.PI - 0.18;
    boatGroup.add(badge);
  }

  const gunwaleMat = new THREE.MeshStandardMaterial({ color: 0x6e281e, roughness: 0.48 });
  const boatTealMat = new THREE.MeshStandardMaterial({ color: 0x267470, roughness: 0.56 });

  const deckMesh = new THREE.Mesh(
    new THREE.BoxGeometry(hullLength * 0.78, 0.04, hullWidth * 0.74),
    new THREE.MeshStandardMaterial({ color: 0x4a3828, roughness: 0.82 }),
  );
  deckMesh.position.set(-0.04, 0.24, 0);
  deckMesh.receiveShadow = true;
  boatGroup.add(deckMesh);

  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(hullLength * 0.86, 0.065, 0.065), gunwaleMat);
    rail.position.set(-0.04, 0.43, side * (hullWidth * 0.43));
    rail.castShadow = true;
    boatGroup.add(rail);

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(hullLength * 0.82, 0.024, 0.02), boatTealMat);
    stripe.position.set(-0.04, 0.16, side * (hullWidth * 0.48));
    boatGroup.add(stripe);
  }

  // Interior wooden ribs & teal thwarts (benches) visible from Chapter 01
  for (const rx of [-0.95, -0.45, 0.05, 0.55, 0.95]) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.16, hullWidth * 0.78), teakWoodMat);
    rib.position.set(rx, 0.34, 0);
    boatGroup.add(rib);
  }

  for (const bx of [-0.68, 0.05, 0.68]) {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.045, hullWidth * 0.78), boatTealMat);
    bench.position.set(bx, 0.37, 0);
    bench.castShadow = true;
    boatGroup.add(bench);
  }

  // Coiled bow rope
  const ropeCoil = new THREE.Mesh(
    new THREE.TorusGeometry(0.11, 0.028, 8, 18),
    warmPostWoodMat,
  );
  ropeCoil.rotation.x = Math.PI / 2;
  ropeCoil.position.set(-1.18, 0.38, 0);
  boatGroup.add(ropeCoil);

  // Slender 4-pole frame + off-white bimini sun canopy (proportional height matching frames 01, 04, 08)
  const poleGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.88, 8);
  for (const px of [-0.66, 0.66]) {
    for (const pz of [-0.38, 0.38]) {
      const pole = new THREE.Mesh(poleGeo, darkIronMat);
      pole.position.set(px, 0.82, pz);
      pole.castShadow = true;
      boatGroup.add(pole);
    }
  }

  const canopyGeo = new THREE.PlaneGeometry(1.56, 0.96, 14, 10);
  canopyGeo.rotateX(-Math.PI / 2);
  const canopyPos = canopyGeo.attributes.position;
  for (let i = 0; i < canopyPos.count; i++) {
    const cx = canopyPos.getX(i);
    const cz = canopyPos.getZ(i);
    const arch = Math.cos(cz * 2.2) * 0.065 - Math.abs(cx) * 0.02;
    canopyPos.setY(i, arch);
  }
  canopyGeo.computeVertexNormals();
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0xf6f4ec,
    roughness: 0.72,
    side: THREE.DoubleSide,
  });
  const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
  canopyMesh.position.set(0, 1.25, 0);
  canopyMesh.castShadow = true;
  canopyMesh.receiveShadow = true;
  boatGroup.add(canopyMesh);

  // ============================================================================
  // 2. HARBOR COBBLESTONE PATIO & WATERFRONT QUAY (CHAPTERS 01, 02, 04)
  // ============================================================================
  const cobbleTex = createCobbleTexture();
  const patioMat = new THREE.MeshStandardMaterial({
    color: 0xb8af96,
    map: cobbleTex.map,
    bumpMap: cobbleTex.bumpMap,
    bumpScale: 0.035,
    roughness: 0.9,
  });

  // Harbor platform ends at z = -2.85 so shallow coastal pebbles & clear turquoise water meet the patio edge
  const harborBase = new THREE.Mesh(new THREE.BoxGeometry(10.8, 1.15, 7.6), patioMat);
  harborBase.position.set(1.15, 0.12, 0.95);
  harborBase.receiveShadow = true;
  harborBase.castShadow = true;
  worldGroup.add(harborBase);

  // 3D Sculpted rounded Mediterranean limestone cobblestones across the harbor terrace (z from -2.7 to +3.6)
  const cobbleStoneGeo = new THREE.SphereGeometry(0.24, 14, 10);
  cobbleStoneGeo.scale(1.16, 0.34, 1.04);
  const cobbleInstMat = new THREE.MeshStandardMaterial({
    color: 0xd2cab2,
    map: cobbleTex.map,
    bumpMap: cobbleTex.bumpMap,
    bumpScale: 0.028,
    roughness: 0.85,
  });

  const cobbleCols = 22;
  const cobbleRows = 18;
  const cobbleInst = new THREE.InstancedMesh(cobbleStoneGeo, cobbleInstMat, cobbleCols * cobbleRows);
  cobbleInst.receiveShadow = true;
  cobbleInst.castShadow = true;

  const dummy = new THREE.Object3D();
  let cIdx = 0;
  for (let r = 0; r < cobbleRows; r++) {
    for (let c = 0; c < cobbleCols; c++) {
      const gx = -3.8 + c * 0.36 + (r % 2) * 0.16 + (Math.random() - 0.5) * 0.05;
      const gz = -2.65 + r * 0.35 + (Math.random() - 0.5) * 0.05;
      dummy.position.set(gx, 0.72 + (Math.random() - 0.5) * 0.02, gz);
      dummy.rotation.set(
        (Math.random() - 0.5) * 0.08,
        Math.random() * Math.PI,
        (Math.random() - 0.5) * 0.08,
      );
      const s = 0.78 + Math.random() * 0.34;
      dummy.scale.set(s, 0.85 + Math.random() * 0.25, s * (0.9 + Math.random() * 0.2));
      dummy.updateMatrix();
      cobbleInst.setMatrixAt(cIdx++, dummy.matrix);
    }
  }
  worldGroup.add(cobbleInst);

  // Submerged & shoreline natural pebbles along the water's edge (z = -2.8 to -5.5, visible in frames 01, 04, 08, 16)
  const shorePebbleInst = new THREE.InstancedMesh(cobbleStoneGeo, patioMat, 140);
  for (let i = 0; i < 140; i++) {
    const px = -14.5 + Math.random() * 21.0;
    const pz = -2.75 - Math.random() * 2.8;
    const py = -0.05 - Math.max(0, (-2.8 - pz) * 0.14);
    dummy.position.set(px, py, pz);
    dummy.rotation.set(Math.random() * 0.2, Math.random() * Math.PI, Math.random() * 0.2);
    const s = 0.65 + Math.random() * 0.85;
    dummy.scale.set(s, 0.7 + Math.random() * 0.5, s);
    dummy.updateMatrix();
    shorePebbleInst.setMatrixAt(i, dummy.matrix);
  }
  worldGroup.add(shorePebbleInst);

  // Left Cycladic House (House A: features Pergola Stripes on roof in Ch 01 & Pastel Shutters facing +Z patio in Ch 02/04!)
  const leftHouse = createCycladicHouse(3.5, 4.75, 4.1);
  leftHouse.position.set(-2.35, 0.72, -3.8);
  worldGroup.add(leftHouse);

  // 15 Terracotta pergola slats across the inner roof edge of Left House (matching Chapter 01 frame_001!)
  const slatGroup = new THREE.Group();
  slatGroup.position.set(-2.25, 5.73, -2.22);
  for (let i = 0; i < 15; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.038, 0.78), terracottaMat);
    slat.position.set(-1.35 + i * 0.195, 0, 0);
    slat.rotation.y = 0.22;
    slat.castShadow = true;
    slat.receiveShadow = true;
    slatGroup.add(slat);
  }
  worldGroup.add(slatGroup);

  // Bougainvillea vine climbing the front-right corner of Left House (visible in Chapter 01 frame_001 & Chapter 04 frame_008!)
  const leftHouseCornerVine = createBougainvilleaPatch(0.55, 2.65, 0.65, 210);
  leftHouseCornerVine.position.set(-0.56, 3.85, -3.45);
  worldGroup.add(leftHouseCornerVine);

  // Iconic Pastel Turquoise Louvered Shutters on South/Patio-Facing Wall of Left House
  const pastelShutterPatio = createShutteredWindow(1.22, 1.74, turquoiseShutterMat);
  pastelShutterPatio.position.set(-1.92, 2.62, -1.72);
  pastelShutterPatio.rotation.y = 0;
  worldGroup.add(pastelShutterPatio);

  // Sea-facing turquoise shutter on Left House (visible in Aerial Overview frame 15 & 16!)
  const seaShutterLeft = createShutteredWindow(1.15, 1.65, turquoiseShutterMat);
  seaShutterLeft.position.set(-2.35, 2.65, -5.88);
  seaShutterLeft.rotation.y = Math.PI;
  worldGroup.add(seaShutterLeft);

  // Side shutter on Left House facing courtyard
  const sideShutterLeft = createShutteredWindow(0.92, 1.42, turquoiseShutterMat);
  sideShutterLeft.position.set(-0.57, 2.65, -3.85);
  sideShutterLeft.rotation.y = Math.PI / 2;
  worldGroup.add(sideShutterLeft);

  // Right Cycladic House (House B: features Bougainvillea corner in Ch 01 & Weathered Teal Door + Green Jasmine Ivy in Ch 02)
  const rightHouse = createCycladicHouse(4.8, 5.35, 5.4);
  rightHouse.position.set(4.35, 0.72, -2.65);
  worldGroup.add(rightHouse);

  const rightHouseBougainvilleaTop = createBougainvilleaPatch(1.25, 2.4, 1.25, 320);
  rightHouseBougainvilleaTop.position.set(1.88, 4.55, -1.55);
  worldGroup.add(rightHouseBougainvilleaTop);

  const rightHouseBougainvilleaLow = createBougainvilleaPatch(1.35, 1.95, 1.25, 280);
  rightHouseBougainvilleaLow.position.set(2.15, 2.85, 0.35);
  worldGroup.add(rightHouseBougainvilleaLow);

  // Weathered Teal Door with Green Climbing Ivy & White Star-Jasmine Flowers on Right House (matching frame_004!)
  const tealDoorGroup = new THREE.Group();
  tealDoorGroup.position.set(1.92, 2.02, -1.55);
  tealDoorGroup.rotation.y = -Math.PI / 2;
  const tealDoorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.12, 2.25, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x0e879c, roughness: 0.62 }),
  );
  tealDoorMesh.castShadow = true;
  tealDoorGroup.add(tealDoorMesh);

  const jasmineWallIvy = createJasmineIvyPatch(1.25, 2.35, 0.22, 185, 42);
  jasmineWallIvy.position.set(-0.92, 0.22, 0.08);
  tealDoorGroup.add(jasmineWallIvy);

  const jasmineDoorBlossoms = createJasmineIvyPatch(0.85, 1.65, 0.15, 45, 34);
  jasmineDoorBlossoms.position.set(-0.08, -0.05, 0.08);
  tealDoorGroup.add(jasmineDoorBlossoms);
  worldGroup.add(tealDoorGroup);

  function createBistroTable(): THREE.Group {
    const table = new THREE.Group();

    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.042, 32), bistroTableMat);
    top.position.y = 0.76;
    top.castShadow = true;
    top.receiveShadow = true;
    table.add(top);

    const legGeo = new THREE.CylinderGeometry(0.017, 0.017, 0.82, 8);
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const leg = new THREE.Mesh(legGeo, darkIronMat);
      leg.position.set(Math.cos(angle) * 0.26, 0.38, Math.sin(angle) * 0.26);
      leg.rotation.z = Math.cos(angle) * 0.22;
      leg.rotation.x = -Math.sin(angle) * 0.22;
      leg.castShadow = true;
      table.add(leg);
    }

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.014, 8, 24), darkIronMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.28;
    table.add(ring);

    const bowlMat = new THREE.MeshStandardMaterial({ color: 0x2b6e8c, roughness: 0.35 });
    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.11, 0.072, 20),
      bowlMat,
    );
    bowl.position.y = 0.812;
    bowl.castShadow = true;
    table.add(bowl);

    const lemonGeo = new THREE.SphereGeometry(0.06, 12, 10);
    lemonGeo.scale(0.85, 1.22, 0.85);
    const lemonOffsets: [number, number, number][] = [
      [-0.07, 0.87, -0.04],
      [0.07, 0.87, -0.03],
      [0.0, 0.87, 0.07],
      [-0.04, 0.86, 0.05],
      [0.05, 0.86, 0.05],
      [0.0, 0.93, 0.0],
      [-0.04, 0.92, -0.02],
    ];
    for (const [lx, ly, lz] of lemonOffsets) {
      const lm = new THREE.Mesh(lemonGeo, yellowLemonMat);
      lm.position.set(lx, ly, lz);
      lm.rotation.set(Math.random(), Math.random(), Math.random());
      lm.castShadow = true;
      table.add(lm);
    }

    return table;
  }

  function createCafeChair(mat: THREE.Material): THREE.Group {
    const chair = new THREE.Group();
    const seatY = 0.45;

    const legGeo = new THREE.BoxGeometry(0.034, 0.56, 0.034);
    for (const side of [-0.19, 0.19]) {
      const legF = new THREE.Mesh(legGeo, mat);
      legF.position.set(side, 0.24, 0.02);
      legF.rotation.x = 0.34;
      legF.castShadow = true;

      const legB = new THREE.Mesh(legGeo, mat);
      legB.position.set(side, 0.24, -0.02);
      legB.rotation.x = -0.34;
      legB.castShadow = true;

      const postBack = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.52, 0.034), mat);
      postBack.position.set(side, 0.68, -0.18);
      postBack.rotation.x = -0.14;
      postBack.castShadow = true;

      chair.add(legF, legB, postBack);
    }

    for (let i = 0; i < 5; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.052), mat);
      slat.position.set(0, seatY, -0.14 + i * 0.07);
      slat.castShadow = true;
      slat.receiveShadow = true;
      chair.add(slat);
    }

    for (let i = 0; i < 4; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.044, 0.02), mat);
      slat.position.set(0, 0.62 + i * 0.075, -0.17 - i * 0.01);
      slat.rotation.x = -0.14;
      slat.castShadow = true;
      chair.add(slat);
    }

    return chair;
  }

  function createTerracottaPlanter(scale = 1.0, withJasmine = false): THREE.Group {
    const planter = new THREE.Group();
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32 * scale, 0.21 * scale, 0.48 * scale, 24),
      terracottaMat,
    );
    pot.position.y = 0.24 * scale;
    pot.castShadow = true;
    pot.receiveShadow = true;
    planter.add(pot);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.32 * scale, 0.032 * scale, 10, 24),
      terracottaMat,
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.47 * scale;
    rim.castShadow = true;
    planter.add(rim);

    const bush = withJasmine
      ? createJasmineIvyPatch(0.65 * scale, 0.55 * scale, 0.65 * scale, 95, 22)
      : createLemonCluster(0.42 * scale, 105, 0);
    bush.position.y = 0.62 * scale;
    planter.add(bush);

    return planter;
  }

  // Harbor Patio Furniture (exact full-view composition for Chapters 02 & 04 matching frame_004 & frame_008!)
  const leftBistro = createBistroTable();
  leftBistro.position.set(-1.42, 0.74, 0.25);
  worldGroup.add(leftBistro);

  const mintChair1 = createCafeChair(mintChairMat);
  mintChair1.position.set(-2.18, 0.74, 0.35);
  mintChair1.rotation.y = 1.25;
  worldGroup.add(mintChair1);

  const mintChair2 = createCafeChair(mintChairMat);
  mintChair2.position.set(-0.75, 0.74, 0.18);
  mintChair2.rotation.y = -1.25;
  worldGroup.add(mintChair2);

  const rightBistro = createBistroTable();
  rightBistro.position.set(1.52, 0.74, 1.05);
  worldGroup.add(rightBistro);

  const teakChair = createCafeChair(teakWoodMat);
  teakChair.position.set(0.88, 0.74, 1.12);
  teakChair.rotation.y = 1.08;
  worldGroup.add(teakChair);

  const planterCenterLeft = createTerracottaPlanter(1.02);
  planterCenterLeft.position.set(-0.32, 0.74, 0.35);
  worldGroup.add(planterCenterLeft);

  const planterCenterRight = createTerracottaPlanter(0.92);
  planterCenterRight.position.set(0.22, 0.74, 1.12);
  worldGroup.add(planterCenterRight);

  const planterRightDoor = createTerracottaPlanter(0.88, true);
  planterRightDoor.position.set(1.52, 0.74, -0.85);
  worldGroup.add(planterRightDoor);

  // Overarching Harbor Lemon Tree (trunk positioned at right foreground so it frames the right edge & top border of Chapters 02 & 04 just like frames 04 & 08!)
  const harborTreeGroup = new THREE.Group();
  harborTreeGroup.position.set(1.58, 0.74, 2.08);
  worldGroup.add(harborTreeGroup);

  const mainTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 2.55, 14), trunkMat);
  mainTrunk.position.set(0.12, 1.15, 0);
  mainTrunk.rotation.z = 0.28;
  mainTrunk.castShadow = true;
  harborTreeGroup.add(mainTrunk);

  const branchL = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.13, 3.1, 10), trunkMat);
  branchL.position.set(-0.95, 2.22, -0.25);
  branchL.rotation.z = 1.12;
  branchL.rotation.x = -0.12;
  branchL.castShadow = true;
  harborTreeGroup.add(branchL);

  const lowCanopy1 = createLemonCluster(0.98, 125, 14);
  lowCanopy1.position.set(-2.45, 2.48, -0.55);
  harborTreeGroup.add(lowCanopy1);

  const lowCanopy2 = createLemonCluster(0.92, 115, 12);
  lowCanopy2.position.set(-1.15, 2.55, -0.35);
  harborTreeGroup.add(lowCanopy2);

  const lowCanopy3 = createLemonCluster(0.88, 105, 10);
  lowCanopy3.position.set(-0.15, 2.42, -0.15);
  harborTreeGroup.add(lowCanopy3);

  // Courtyard Lemon Canopy for Chapter 01 (frames the foreground matching DACI75PglF1j3tK9k.mp4 frame_001!)
  const courtyardCanopyPositions: [number, number, number, number][] = [
    [-0.78, 5.25, 4.42, 1.05],
    [0.88, 5.15, 4.42, 1.12],
    [0.05, 4.82, 4.15, 1.25],
    [-1.45, 4.95, 3.85, 1.12],
    [1.35, 4.95, 3.85, 1.15],
    [-0.45, 4.35, 2.85, 1.18],
    [0.55, 4.35, 2.85, 1.22],
    [-1.75, 3.85, 1.65, 1.15],
    [1.15, 3.82, 1.75, 1.15],
  ];
  for (const [cx, cy, cz, cr] of courtyardCanopyPositions) {
    const cluster = createLemonCluster(cr, 155, 16);
    cluster.position.set(cx, cy, cz);
    worldGroup.add(cluster);
  }

  // ============================================================================
  // 3. LINEN TERRACE (CHAPTER 03: BILLOWING PASTEL LINENS, OLIVE TREE, WICKER BASKET)
  // ============================================================================
  const linenTerraceGroup = new THREE.Group();
  linenTerraceGroup.position.set(-12.2, 0.72, -1.2);
  worldGroup.add(linenTerraceGroup);

  const terraceSlab = new THREE.Mesh(new THREE.BoxGeometry(8.6, 1.2, 7.6), warmPlasterFloorMat);
  terraceSlab.position.set(0.3, -0.5, 0.6);
  terraceSlab.receiveShadow = true;
  terraceSlab.castShadow = true;
  linenTerraceGroup.add(terraceSlab);

  // Parapet wall sits at z = -1.78 so the clothesline at z = -0.55 casts crisp diagonal sheet shadows across the floor AND up onto the sunlit front face of the parapet wall (matching frame_005!)
  const parapetWall = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.76, 0.34), whiteWallMat);
  parapetWall.position.set(0.15, 0.38, -1.78);
  parapetWall.castShadow = true;
  parapetWall.receiveShadow = true;
  linenTerraceGroup.add(parapetWall);

  const parapetCap = new THREE.Mesh(new THREE.BoxGeometry(5.72, 0.075, 0.42), whiteWallMat);
  parapetCap.position.set(0.15, 0.78, -1.78);
  parapetCap.castShadow = true;
  parapetCap.receiveShadow = true;
  linenTerraceGroup.add(parapetCap);

  const linenHouse = createCycladicHouse(3.6, 5.2, 5.6);
  linenHouse.position.set(3.65, 0, -1.15);
  linenTerraceGroup.add(linenHouse);

  const linenHouseShutter = createShutteredWindow(0.95, 1.45, turquoiseShutterMat);
  linenHouseShutter.position.set(1.83, 3.15, -1.85);
  linenHouseShutter.rotation.y = -Math.PI / 2;
  linenTerraceGroup.add(linenHouseShutter);

  const oliveTree = new THREE.Group();
  oliveTree.position.set(-2.25, 0, -1.45);
  linenTerraceGroup.add(oliveTree);

  const oliveTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 2.35, 12), trunkMat);
  oliveTrunk.position.set(0, 1.1, 0);
  oliveTrunk.rotation.z = 0.16;
  oliveTrunk.castShadow = true;
  oliveTree.add(oliveTrunk);

  const oliveLeafGeo = new THREE.PlaneGeometry(0.048, 0.2);
  for (let b = 0; b < 4; b++) {
    const bGroup = new THREE.Group();
    const angle = -0.5 + b * 0.45;
    bGroup.position.set(Math.sin(angle) * 0.5, 2.15 + (b % 2) * 0.35, Math.cos(angle) * 0.3);

    const subBranch = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.075, 1.45, 8), trunkMat);
    subBranch.rotation.z = (b - 1.5) * 0.45;
    subBranch.castShadow = true;
    bGroup.add(subBranch);

    for (let i = 0; i < 195; i++) {
      const leaf = new THREE.Mesh(oliveLeafGeo, oliveLeafMat);
      leaf.position.set(
        (Math.random() - 0.5) * 2.1,
        (Math.random() - 0.2) * 1.4,
        (Math.random() - 0.5) * 1.6,
      );
      leaf.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );
      leaf.castShadow = true;
      bGroup.add(leaf);
    }

    swayBranches.push(bGroup);
    oliveTree.add(bGroup);
  }

  // Wooden Clothesline Posts, Rope, Clothespins, and 3 Sunlit Billowing Pastel Linen Sheets at z = -0.55
  const postGeo = new THREE.BoxGeometry(0.082, 2.38, 0.082);
  const postLeft = new THREE.Mesh(postGeo, warmPostWoodMat);
  postLeft.position.set(-1.85, 1.19, -0.45);
  postLeft.castShadow = true;
  postLeft.receiveShadow = true;

  const postRight = new THREE.Mesh(postGeo, warmPostWoodMat);
  postRight.position.set(1.72, 1.32, -0.65);
  postRight.castShadow = true;
  postRight.receiveShadow = true;

  const ropeLen = Math.hypot(3.57, 0.14, -0.2);
  const rope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.011, 0.011, ropeLen, 8),
    warmPostWoodMat,
  );
  rope.position.set(-0.06, 2.28, -0.55);
  rope.rotation.z = Math.PI / 2 - 0.042;
  rope.rotation.y = -0.056;
  rope.castShadow = true;
  linenTerraceGroup.add(postLeft, postRight, rope);

  const sheetSpecs = [
    { x: -1.18, y: 2.23, z: -0.49, w: 0.96, h: 1.64, color: "#4D8E8A", phase: 0.0 },
    { x: -0.02, y: 2.28, z: -0.55, w: 1.06, h: 1.82, color: "#CFE0E5", phase: 1.4 },
    { x: 1.12, y: 2.33, z: -0.61, w: 0.94, h: 1.62, color: "#B8CEC3", phase: 2.7 },
  ];

  const pinGeo = new THREE.BoxGeometry(0.032, 0.13, 0.038);
  for (const spec of sheetSpecs) {
    const sheetGeo = new THREE.PlaneGeometry(spec.w, spec.h, 36, 40);
    sheetGeo.translate(0, -spec.h / 2, 0);

    const sheetTex = createLinenWeaveTexture(spec.color);
    const sheetMat = new THREE.MeshStandardMaterial({
      map: sheetTex,
      roughness: 0.74,
      metalness: 0.02,
      emissive: new THREE.Color(spec.color),
      emissiveIntensity: 0.08,
      side: THREE.DoubleSide,
    });

    const sheetMesh = new THREE.Mesh(sheetGeo, sheetMat);
    sheetMesh.position.set(spec.x, spec.y, spec.z);
    sheetMesh.rotation.y = -0.056;
    sheetMesh.castShadow = true;
    sheetMesh.receiveShadow = true;
    linenTerraceGroup.add(sheetMesh);

    const posAttr = sheetGeo.attributes.position;
    const baseCopy = new Float32Array(posAttr.array.length);
    baseCopy.set(posAttr.array);

    clothSheets.push({
      mesh: sheetMesh,
      basePositions: baseCopy,
      width: spec.w,
      height: spec.h,
      phaseOffset: spec.phase,
    });

    for (const px of [-spec.w * 0.36, spec.w * 0.36]) {
      const pin = new THREE.Mesh(pinGeo, warmPostWoodMat);
      pin.position.set(spec.x + px, spec.y + 0.03, spec.z);
      pin.castShadow = true;
      linenTerraceGroup.add(pin);
    }
  }

  // Right Foreground Stone Bench + Wicker Laundry Basket + Folded Linens + Glass Demijohn (visible in frame 05 bottom-right)
  const benchPlinth = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.42, 0.88), whiteWallMat);
  benchPlinth.position.set(1.25, 0.21, 0.72);
  benchPlinth.castShadow = true;
  benchPlinth.receiveShadow = true;

  const benchSlab = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.07, 0.96), whiteWallMat);
  benchSlab.position.set(1.25, 0.45, 0.72);
  benchSlab.castShadow = true;
  benchSlab.receiveShadow = true;
  linenTerraceGroup.add(benchPlinth, benchSlab);

  const wickerTex = createWickerTexture();
  const wickerMat = new THREE.MeshStandardMaterial({ map: wickerTex, roughness: 0.85 });
  const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.38, 24), wickerMat);
  basket.position.set(1.38, 0.67, 0.68);
  basket.castShadow = true;
  basket.receiveShadow = true;
  linenTerraceGroup.add(basket);

  const foldedMat1 = new THREE.MeshStandardMaterial({ color: 0x7cb0b4, roughness: 0.82 });
  const foldedMat2 = new THREE.MeshStandardMaterial({ color: 0xc2d6da, roughness: 0.82 });
  const towel1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.32), foldedMat1);
  towel1.position.set(1.38, 0.89, 0.68);
  towel1.rotation.y = 0.18;
  towel1.castShadow = true;
  const towel2 = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.28), foldedMat2);
  towel2.position.set(1.4, 0.97, 0.67);
  towel2.rotation.y = -0.12;
  towel2.castShadow = true;
  linenTerraceGroup.add(towel1, towel2);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xa8d5cf,
    transparent: true,
    opacity: 0.78,
    roughness: 0.12,
    transmission: 0.65,
    thickness: 0.3,
  });
  const bottleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.36, 24), glassMat);
  bottleBody.position.set(0.95, 0.66, 0.78);
  bottleBody.castShadow = true;

  const bottleShoulder = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    glassMat,
  );
  bottleShoulder.position.set(0.95, 0.84, 0.78);

  const bottleNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.052, 0.15, 16), glassMat);
  bottleNeck.position.set(0.95, 1.01, 0.78);

  const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.03, 0.055, 12), warmPostWoodMat);
  cork.position.set(0.95, 1.1, 0.78);
  linenTerraceGroup.add(bottleBody, bottleShoulder, bottleNeck, cork);

  // ============================================================================
  // 4. BOUGAINVILLEA LANE & ARCHWAY (CHAPTER 05: ARCH, STEPS, RAILING, SEA VISTA)
  // ============================================================================
  const laneGroup = new THREE.Group();
  laneGroup.position.set(-5.6, 0.72, 4.2);
  worldGroup.add(laneGroup);

  const slateTex = createSlateLaneTexture();
  const slateMat = new THREE.MeshStandardMaterial({
    map: slateTex,
    roughness: 0.82,
  });

  const limestoneTileTex = createLimestoneTileTexture();
  const limestoneTileMat = new THREE.MeshStandardMaterial({
    map: limestoneTileTex,
    roughness: 0.84,
  });

  // Shaded slate floor under and in front of the archway (z from -0.2 to +5.2)
  const shadedLaneFloor = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 5.4), slateMat);
  shadedLaneFloor.position.set(0, -0.1, 2.5);
  shadedLaneFloor.receiveShadow = true;
  laneGroup.add(shadedLaneFloor);

  // Sunlit cream limestone tile floor beyond the archway leading to the sea (z from -3.8 to -0.2, matching frame_009!)
  const sunlitLaneFloor = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.38, 3.6), limestoneTileMat);
  sunlitLaneFloor.position.set(0, -0.11, -2.0);
  sunlitLaneFloor.receiveShadow = true;
  laneGroup.add(sunlitLaneFloor);

  // Dark stone seawall step at the end of the lane (z = -4.15, matching frame_009!)
  const seawallStep = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.36, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x2c3c44, roughness: 0.88 }),
  );
  seawallStep.position.set(0, -0.14, -4.25);
  seawallStep.receiveShadow = true;
  laneGroup.add(seawallStep);

  // Left inner house wall beyond the archway with recessed turquoise shutter in perspective (matching frame_009!)
  const innerArchHouse = createCycladicHouse(1.8, 3.85, 3.4);
  innerArchHouse.position.set(-1.75, 0, -2.1);
  laneGroup.add(innerArchHouse);

  const innerArchShutter = createShutteredWindow(0.85, 1.38, turquoiseShutterMat);
  innerArchShutter.position.set(-0.82, 1.85, -2.15);
  innerArchShutter.rotation.y = Math.PI / 2;
  laneGroup.add(innerArchShutter);

  // Delicate olive branch peeking into the upper-right of the archway sea vista (matching frame_009!)
  const archOliveBranch = new THREE.Group();
  archOliveBranch.position.set(1.05, 2.28, -3.1);
  const archTwig = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.032, 0.85, 6), trunkMat);
  archTwig.position.set(-0.22, 0.05, 0);
  archTwig.rotation.z = 1.18;
  archOliveBranch.add(archTwig);
  for (let i = 0; i < 65; i++) {
    const leaf = new THREE.Mesh(pointedLeafGeo, oliveLeafMat);
    leaf.position.set(
      -Math.random() * 0.65,
      (Math.random() - 0.5) * 0.42,
      (Math.random() - 0.5) * 0.35,
    );
    leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    leaf.scale.setScalar(0.38 + Math.random() * 0.25);
    archOliveBranch.add(leaf);
  }
  swayBranches.push(archOliveBranch);
  laneGroup.add(archOliveBranch);

  const archWallShape = new THREE.Shape();
  archWallShape.moveTo(-2.2, 0);
  archWallShape.lineTo(2.2, 0);
  archWallShape.lineTo(2.2, 3.55);
  archWallShape.lineTo(-2.2, 3.55);
  archWallShape.lineTo(-2.2, 0);

  const archHole = new THREE.Path();
  archHole.moveTo(-1.05, 0);
  archHole.lineTo(-1.05, 1.82);
  archHole.absarc(0, 1.82, 1.05, Math.PI, 0, true);
  archHole.lineTo(1.05, 0);
  archWallShape.holes.push(archHole);

  const archGeo = new THREE.ExtrudeGeometry(archWallShape, {
    depth: 0.78,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.03,
    bevelThickness: 0.03,
  });
  const archMesh = new THREE.Mesh(archGeo, whiteWallMat);
  archMesh.position.set(0, 0, -0.35);
  archMesh.castShadow = true;
  archMesh.receiveShadow = true;
  laneGroup.add(archMesh);

  // Curving woody bougainvillea stem climbing the left wall through the stone shelves
  const archStemLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.068, 3.3, 8), trunkMat);
  archStemLeft.position.set(-1.35, 1.48, 1.15);
  archStemLeft.rotation.z = -0.16;
  archStemLeft.rotation.x = -0.18;
  archStemLeft.castShadow = true;
  laneGroup.add(archStemLeft);

  const archGarlandTop = createBougainvilleaPatch(2.55, 0.82, 0.9, 440);
  archGarlandTop.position.set(0.05, 3.12, 0.52);
  laneGroup.add(archGarlandTop);

  const archGarlandLeft = createBougainvilleaPatch(0.82, 2.25, 0.85, 310);
  archGarlandLeft.position.set(-1.38, 2.35, 0.72);
  laneGroup.add(archGarlandLeft);

  const archGarlandRight = createBougainvilleaPatch(0.82, 1.95, 0.85, 290);
  archGarlandRight.position.set(1.22, 2.15, 0.52);
  laneGroup.add(archGarlandRight);

  const leftLaneWall = createCycladicHouse(2.6, 4.2, 6.5);
  leftLaneWall.position.set(-2.65, 0, 2.8);
  laneGroup.add(leftLaneWall);

  const laneShutter = createShutteredWindow(0.88, 1.42, turquoiseShutterMat);
  laneShutter.position.set(-1.32, 1.65, 2.35);
  laneShutter.rotation.y = Math.PI / 2;
  laneGroup.add(laneShutter);

  for (const shelfY of [0.95, 2.15]) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.08, 0.95), whiteWallMat);
    shelf.position.set(-1.18, shelfY, 1.85);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    laneGroup.add(shelf);
  }

  const stairParapetShape = new THREE.Shape();
  stairParapetShape.moveTo(0, 0);
  stairParapetShape.lineTo(3.8, 0);
  stairParapetShape.lineTo(3.8, 1.15);
  stairParapetShape.lineTo(0, 3.05);
  stairParapetShape.lineTo(0, 0);

  const stairParapetGeo = new THREE.ExtrudeGeometry(stairParapetShape, {
    depth: 0.36,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.025,
    bevelThickness: 0.025,
  });
  stairParapetGeo.rotateY(-Math.PI / 2);
  const stairParapet = new THREE.Mesh(stairParapetGeo, whiteWallMat);
  stairParapet.position.set(1.38, 0, 0.55);
  stairParapet.castShadow = true;
  stairParapet.receiveShadow = true;
  laneGroup.add(stairParapet);

  // Projected whitewashed upper landing slab on right (matching frame_009!)
  const upperLandingSlab = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 2.45), whiteWallMat);
  upperLandingSlab.position.set(1.32, 2.48, 1.45);
  upperLandingSlab.castShadow = true;
  upperLandingSlab.receiveShadow = true;
  laneGroup.add(upperLandingSlab);

  const railingGroup = new THREE.Group();
  railingGroup.position.set(1.18, 2.55, 1.45);
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.038, 2.4), darkIronMat);
  topBar.position.y = 0.85;
  railingGroup.add(topBar);
  for (let i = 0; i < 12; i++) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.85, 8), darkIronMat);
    bar.position.set(0, 0.42, -1.1 + i * 0.2);
    bar.castShadow = true;
    railingGroup.add(bar);
  }
  laneGroup.add(railingGroup);

  // ============================================================================
  // 5. UPPER CYCLADIC VILLAGE CLUSTER & REALISTIC GREEK ISLAND CLIFFS (FRAMES 11-16)
  // ============================================================================
  const villageSpecs: { x: number; y: number; z: number; w: number; h: number; d: number; hasDoor?: boolean }[] = [
    { x: -11.2, y: 0.72, z: 7.2, w: 5.2, h: 4.9, d: 5.4, hasDoor: true },
    { x: -5.4, y: 0.72, z: 13.8, w: 5.0, h: 5.3, d: 4.8, hasDoor: true },
    { x: 0.6, y: 0.72, z: 8.8, w: 5.4, h: 4.8, d: 5.2, hasDoor: true },
    { x: 6.2, y: 0.72, z: 7.5, w: 4.8, h: 4.6, d: 5.0 },
    { x: -15.8, y: 0.72, z: 12.4, w: 4.8, h: 4.5, d: 4.8 },
    { x: -10.5, y: 0.72, z: 15.2, w: 5.2, h: 5.4, d: 5.0 },
    { x: 1.2, y: 0.72, z: 15.6, w: 5.0, h: 5.2, d: 4.8 },
    { x: 7.2, y: 0.72, z: 14.5, w: 4.6, h: 4.9, d: 4.8 },
  ];

  for (const v of villageSpecs) {
    const house = createCycladicHouse(v.w, v.h, v.d);
    house.position.set(v.x, v.y, v.z);
    worldGroup.add(house);

    // Chimneys & vents on rooftops
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.68, 12), whiteWallMat);
    chimney.position.set(v.x + v.w * 0.25, v.y + v.h + 0.34, v.z - v.d * 0.2);
    chimney.castShadow = true;
    const chimneyCap = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.52), terracottaMat);
    chimneyCap.position.set(v.x + v.w * 0.25, v.y + v.h + 0.71, v.z - v.d * 0.2);
    chimneyCap.castShadow = true;
    worldGroup.add(chimney, chimneyCap);

    // Secondary roof vent / plinth
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.42), whiteWallMat);
    vent.position.set(v.x - v.w * 0.28, v.y + v.h + 0.16, v.z + v.d * 0.22);
    vent.castShadow = true;
    worldGroup.add(vent);

    // Front-facing window (facing negative Z toward harbor)
    const winFront = createShutteredWindow(0.88, 1.32, turquoiseShutterMat);
    winFront.position.set(v.x - v.w * 0.22, v.y + v.h * 0.56, v.z - v.d / 2 - 0.02);
    winFront.rotation.y = Math.PI;
    worldGroup.add(winFront);

    // Back-facing window (facing positive Z toward inland hillside - removes bare cube look!)
    const winBack = createShutteredWindow(0.88, 1.32, turquoiseShutterMat);
    winBack.position.set(v.x - v.w * 0.2, v.y + v.h * 0.54, v.z + v.d / 2 + 0.02);
    winBack.rotation.y = 0;
    worldGroup.add(winBack);

    // Side-facing window (east or west)
    const winSide = createShutteredWindow(0.82, 1.25, turquoiseShutterMat);
    winSide.position.set(v.x + v.w / 2 + 0.02, v.y + v.h * 0.52, v.z);
    winSide.rotation.y = Math.PI / 2;
    worldGroup.add(winSide);

    if (v.hasDoor) {
      // Front blue arched door
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.92, 2.05, 0.08), blueDoorMat);
      door.position.set(v.x + v.w * 0.18, v.y + 1.05, v.z - v.d / 2 - 0.02);
      door.castShadow = true;
      worldGroup.add(door);

      const doorArch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.46, 0.46, 0.08, 16, 1, false, 0, Math.PI),
        blueDoorMat,
      );
      doorArch.rotation.x = Math.PI / 2;
      doorArch.rotation.y = Math.PI / 2;
      doorArch.position.set(v.x + v.w * 0.18, v.y + 2.05, v.z - v.d / 2 - 0.02);
      worldGroup.add(doorArch);

      // Sconce / Wall lantern beside front door (matching frame_013!)
      const frontLantern = createWallLantern();
      frontLantern.position.set(v.x + v.w * 0.18 + 0.68, v.y + 1.85, v.z - v.d / 2 - 0.02);
      frontLantern.rotation.y = Math.PI;
      worldGroup.add(frontLantern);

      // Rear doorway facing inland lane / hillside
      const rearDoor = new THREE.Mesh(new THREE.BoxGeometry(0.92, 2.05, 0.08), blueDoorMat);
      rearDoor.position.set(v.x + v.w * 0.15, v.y + 1.05, v.z + v.d / 2 + 0.02);
      rearDoor.castShadow = true;
      worldGroup.add(rearDoor);

      const rearLantern = createWallLantern();
      rearLantern.position.set(v.x + v.w * 0.15 + 0.65, v.y + 1.85, v.z + v.d / 2 + 0.02);
      worldGroup.add(rearLantern);

      // Terracotta flower pots at doorways
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.13, 0.28, 12), terracottaMat);
      pot.position.set(v.x + v.w * 0.18 - 0.62, v.y + 0.14, v.z - v.d / 2 - 0.22);
      pot.castShadow = true;
      worldGroup.add(pot);
    }
  }

  // Sculpted Mediterranean Limestone Coastal Cliffs behind the village (z > 4)
  const cliffGeo = new THREE.PlaneGeometry(240, 120, 80, 60);
  cliffGeo.rotateX(-Math.PI / 2);
  const cPos = cliffGeo.attributes.position;
  for (let i = 0; i < cPos.count; i++) {
    const x = cPos.getX(i);
    const z = cPos.getZ(i);
    const hillSlope = Math.max(0, (z + 40) * 0.16);
    const ridge =
      Math.sin(x * 0.055) * 2.2 +
      Math.cos(z * 0.08 + x * 0.035) * 1.5 +
      Math.sin(x * 0.18 - z * 0.14) * 0.45;

    // Smooth boundary falloff so hillside slopes naturally below sea level on the flanks
    const normX = Math.abs(x) / 120.0;
    const normZ = Math.abs(z) / 60.0;
    const borderFade = Math.cos(normX * Math.PI * 0.5) * Math.cos(normZ * Math.PI * 0.5);
    const finalY = (hillSlope + ridge) * Math.max(0, borderFade) - 1.2;
    cPos.setY(i, finalY);
  }
  cliffGeo.computeVertexNormals();

  const cliffMat = new THREE.MeshStandardMaterial({
    color: 0xb4a287,
    map: cobbleTex.map,
    bumpMap: cobbleTex.bumpMap,
    bumpScale: 0.06,
    roughness: 0.94,
  });
  const cliffMesh = new THREE.Mesh(cliffGeo, cliffMat);
  cliffMesh.position.set(-2, -0.5, 48);
  cliffMesh.receiveShadow = true;
  worldGroup.add(cliffMesh);

  // Natural Mediterranean curved rocky coastline foundation (tapered edges, no sharp box corners!)
  const seawallGeo = new THREE.CylinderGeometry(15.5, 18.2, 1.8, 36);
  seawallGeo.scale(1.15, 1.0, 0.78);
  const seawallMat = new THREE.MeshStandardMaterial({
    color: 0x9e927c,
    map: cobbleTex.map,
    bumpMap: cobbleTex.bumpMap,
    bumpScale: 0.05,
    roughness: 0.94,
  });
  const seawall = new THREE.Mesh(seawallGeo, seawallMat);
  seawall.position.set(-3.5, -0.65, 8.5);
  seawall.receiveShadow = true;
  seawall.castShadow = true;
  worldGroup.add(seawall);

  // Distant Aegean Island Silhouette on the Northern Horizon
  const islandShape = new THREE.Shape();
  islandShape.moveTo(-42, 0);
  islandShape.quadraticCurveTo(-24, 1.8, -12, 4.8);
  islandShape.quadraticCurveTo(-4, 6.8, 4, 4.2);
  islandShape.quadraticCurveTo(18, 1.9, 38, 0);
  islandShape.lineTo(-42, 0);

  const islandGeo = new THREE.ExtrudeGeometry(islandShape, {
    depth: 10,
    bevelEnabled: true,
    bevelSize: 1.0,
    bevelThickness: 1.2,
  });
  const islandMat = new THREE.MeshStandardMaterial({
    color: 0x5c859c,
    roughness: 0.95,
  });
  const distantIsland = new THREE.Mesh(islandGeo, islandMat);
  distantIsland.position.set(-14, -0.5, -145);
  worldGroup.add(distantIsland);

  return {
    update: (elapsed: number, breeze: number) => {
      const waveAmp = 0.55 + breeze * 0.65;
      boatGroup.position.y = 0.1 + Math.sin(elapsed * 1.65) * 0.03 * waveAmp;
      boatGroup.rotation.z = Math.sin(elapsed * 1.35 + 0.5) * 0.024 * waveAmp;
      boatGroup.rotation.x = Math.cos(elapsed * 1.15) * 0.016 * waveAmp;

      const windStrength = 0.11 + breeze * 0.22;
      const windSpeed = 1.7 + breeze * 1.5;
      for (const sheet of clothSheets) {
        const pos = sheet.mesh.geometry.attributes.position as THREE.BufferAttribute;
        const base = sheet.basePositions;
        const count = pos.count;

        for (let i = 0; i < count; i++) {
          const bx = base[i * 3];
          const by = base[i * 3 + 1];
          const bz = base[i * 3 + 2];

          const vNorm = Math.min(1, Math.max(0, -by / sheet.height));
          const pinMask = Math.pow(vNorm, 1.15);
          const pleatMask = Math.pow(vNorm, 0.55);

          // Deep vertical drapery pleats that catch grazing sunlight (matching frame_005!)
          const pleat =
            (Math.sin(bx * 15.5 + sheet.phaseOffset) * 0.068 +
              Math.cos(bx * 27.0 - sheet.phaseOffset * 0.7) * 0.032) *
            pleatMask;

          const wave1 = Math.sin(bx * 3.2 - by * 2.4 - elapsed * windSpeed + sheet.phaseOffset);
          const wave2 = Math.cos(bx * 5.4 + by * 3.6 - elapsed * (windSpeed * 1.3) + sheet.phaseOffset) * 0.38;
          const billow = Math.sin(vNorm * Math.PI) * (0.14 + 0.07 * Math.sin(elapsed * 1.1 + sheet.phaseOffset));

          const dz = pleat + ((wave1 + wave2) * windStrength + billow) * pinMask;
          const dx = Math.sin(by * 2.5 - elapsed * 1.4 + sheet.phaseOffset) * 0.04 * pinMask * breeze;

          pos.setXYZ(i, bx + dx, by, bz + dz);
        }
        pos.needsUpdate = true;
        sheet.mesh.geometry.computeVertexNormals();
      }

      for (let i = 0; i < swayBranches.length; i++) {
        const b = swayBranches[i];
        const phase = i * 0.73;
        b.rotation.z = Math.sin(elapsed * 1.4 + phase) * 0.022 * (0.5 + breeze);
        b.rotation.x = Math.cos(elapsed * 1.1 + phase) * 0.016 * (0.5 + breeze);
      }
    },
  };
}
