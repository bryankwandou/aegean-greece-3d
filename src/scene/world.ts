import * as THREE from "three";
import {
  createCobbleTexture,
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
    bumpScale: 0.014,
    roughness: 0.84,
    metalness: 0.02,
  });

  const warmPlasterFloorMat = new THREE.MeshStandardMaterial({
    color: 0xeae5d7,
    map: stucco.map,
    bumpMap: stucco.bumpMap,
    bumpScale: 0.01,
    roughness: 0.88,
  });

  const shutterTex = createPastelShutterTexture();
  const turquoiseShutterMat = new THREE.MeshStandardMaterial({
    map: shutterTex,
    roughness: 0.68,
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
    roughness: 0.66,
    metalness: 0.04,
  });

  const mintChairMat = new THREE.MeshStandardMaterial({
    color: 0x76b89e,
    roughness: 0.64,
  });

  const teakWoodMat = new THREE.MeshStandardMaterial({
    color: 0x6e4f35,
    roughness: 0.76,
  });

  const warmPostWoodMat = new THREE.MeshStandardMaterial({
    color: 0xa88450,
    roughness: 0.72,
  });

  const terracottaMat = new THREE.MeshStandardMaterial({
    color: 0xb85b3a,
    roughness: 0.76,
    metalness: 0.03,
  });

  const darkIronMat = new THREE.MeshStandardMaterial({
    color: 0x1f2426,
    roughness: 0.45,
    metalness: 0.75,
  });

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x3b2c20,
    roughness: 0.9,
  });

  const lemonLeafMat = new THREE.MeshStandardMaterial({
    color: 0x2c5225,
    roughness: 0.4,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  const oliveLeafMat = new THREE.MeshStandardMaterial({
    color: 0x5e7554,
    roughness: 0.56,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });

  const bougainvilleaPetalMat = new THREE.MeshStandardMaterial({
    color: 0xc91c64,
    roughness: 0.46,
    side: THREE.DoubleSide,
  });

  const bougainvilleaAccentMat = new THREE.MeshStandardMaterial({
    color: 0xe3347b,
    roughness: 0.42,
    side: THREE.DoubleSide,
  });

  const yellowLemonMat = new THREE.MeshStandardMaterial({
    color: 0xebd038,
    roughness: 0.34,
    metalness: 0.04,
  });

  const orangeLemonMat = new THREE.MeshStandardMaterial({
    color: 0xde782c,
    roughness: 0.36,
    metalness: 0.04,
  });

  const swayBranches: THREE.Object3D[] = [];
  const clothSheets: ClothSheetData[] = [];

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

      const slatCount = Math.floor(height / 0.075);
      const slatGeo = new THREE.BoxGeometry(halfW - 0.08, 0.045, 0.035);
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

  function createLemonCluster(radius: number, leafCount: number, lemonCount: number): THREE.Group {
    const cluster = new THREE.Group();
    const leafGeo = new THREE.ShapeGeometry(
      (() => {
        const s = new THREE.Shape();
        s.moveTo(0, 0);
        s.quadraticCurveTo(0.075, 0.11, 0, 0.26);
        s.quadraticCurveTo(-0.075, 0.11, 0, 0);
        return s;
      })(),
    );

    const lemonGeo = new THREE.SphereGeometry(0.078, 14, 12);
    lemonGeo.scale(0.82, 1.26, 0.82);

    for (let i = 0; i < leafCount; i++) {
      const leaf = new THREE.Mesh(leafGeo, lemonLeafMat);
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
      const scale = 0.82 + Math.random() * 0.55;
      leaf.scale.setScalar(scale);
      leaf.castShadow = true;
      leaf.receiveShadow = true;
      cluster.add(leaf);
    }

    for (let i = 0; i < lemonCount; i++) {
      const isOrange = Math.random() < 0.22;
      const lemon = new THREE.Mesh(lemonGeo, isOrange ? orangeLemonMat : yellowLemonMat);
      const angle = (i / lemonCount) * Math.PI * 2 + Math.random() * 0.5;
      const dist = (0.28 + Math.random() * 0.62) * radius;
      lemon.position.set(
        Math.cos(angle) * dist,
        -0.06 - Math.random() * (radius * 0.42),
        Math.sin(angle) * dist,
      );
      lemon.rotation.set(
        (Math.random() - 0.5) * 0.4,
        Math.random() * Math.PI,
        (Math.random() - 0.5) * 0.4,
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
    const petalGeo = new THREE.CircleGeometry(0.072, 5);
    const leafGeo = new THREE.CircleGeometry(0.062, 6);

    for (let i = 0; i < density; i++) {
      const x = (Math.random() - 0.5) * width;
      const y = (Math.random() - 0.5) * height;
      const z = (Math.random() - 0.5) * depth;

      const isFlower = Math.random() < 0.68;
      const mat = isFlower
        ? Math.random() > 0.4
          ? bougainvilleaPetalMat
          : bougainvilleaAccentMat
        : lemonLeafMat;
      const mesh = new THREE.Mesh(isFlower ? petalGeo : leafGeo, mat);
      mesh.position.set(x, y, z);
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );
      mesh.scale.setScalar(0.8 + Math.random() * 0.8);
      mesh.castShadow = true;
      patch.add(mesh);
    }
    swayBranches.push(patch);
    return patch;
  }

  // ============================================================================
  // 1. TRADITIONAL GREEK WOODEN BOAT (#86) IN THE CRYSTAL COVE
  // ============================================================================
  const boatGroup = new THREE.Group();
  boatGroup.position.set(0.55, 0.14, -7.25);
  boatGroup.rotation.y = -0.34;
  worldGroup.add(boatGroup);

  const hullLength = 4.6;
  const hullWidth = 1.62;
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-hullLength * 0.5, 0);
  hullShape.quadraticCurveTo(-hullLength * 0.15, hullWidth * 0.56, hullLength * 0.35, hullWidth * 0.48);
  hullShape.lineTo(hullLength * 0.5, 0);
  hullShape.lineTo(hullLength * 0.35, -hullWidth * 0.48);
  hullShape.quadraticCurveTo(-hullLength * 0.15, -hullWidth * 0.56, -hullLength * 0.5, 0);

  const hullExtrude = new THREE.ExtrudeGeometry(hullShape, {
    depth: 0.62,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.08,
    bevelThickness: 0.08,
  });
  hullExtrude.rotateX(-Math.PI / 2);

  const boatHullMat = new THREE.MeshStandardMaterial({ color: 0xf7f6f1, roughness: 0.52 });
  const hullMesh = new THREE.Mesh(hullExtrude, boatHullMat);
  hullMesh.position.y = -0.08;
  hullMesh.castShadow = true;
  hullMesh.receiveShadow = true;
  boatGroup.add(hullMesh);

  const gunwaleMat = new THREE.MeshStandardMaterial({ color: 0x7e2d22, roughness: 0.5 });
  const deckMesh = new THREE.Mesh(
    new THREE.BoxGeometry(hullLength * 0.78, 0.06, hullWidth * 0.72),
    teakWoodMat,
  );
  deckMesh.position.set(-0.08, 0.38, 0);
  deckMesh.receiveShadow = true;
  boatGroup.add(deckMesh);

  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(hullLength * 0.86, 0.09, 0.09), gunwaleMat);
    rail.position.set(-0.05, 0.58, side * (hullWidth * 0.42));
    rail.castShadow = true;
    boatGroup.add(rail);
  }

  const boatTealMat = new THREE.MeshStandardMaterial({ color: 0x2c7873, roughness: 0.6 });
  for (const bx of [-1.05, -0.15, 0.75]) {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.06, hullWidth * 0.76), boatTealMat);
    bench.position.set(bx, 0.49, 0);
    bench.castShadow = true;
    boatGroup.add(bench);
  }

  const poleGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.32, 8);
  for (const px of [-0.88, 0.88]) {
    for (const pz of [-0.52, 0.52]) {
      const pole = new THREE.Mesh(poleGeo, darkIronMat);
      pole.position.set(px, 1.16, pz);
      pole.castShadow = true;
      boatGroup.add(pole);
    }
  }

  const canopyGeo = new THREE.PlaneGeometry(2.12, 1.32, 16, 12);
  canopyGeo.rotateX(-Math.PI / 2);
  const canopyPos = canopyGeo.attributes.position;
  for (let i = 0; i < canopyPos.count; i++) {
    const cx = canopyPos.getX(i);
    const cz = canopyPos.getZ(i);
    const arch = Math.cos(cz * 1.8) * 0.09 - Math.abs(cx) * 0.03;
    canopyPos.setY(i, arch);
  }
  canopyGeo.computeVertexNormals();
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0xf8f6f0,
    roughness: 0.72,
    side: THREE.DoubleSide,
  });
  const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
  canopyMesh.position.set(0, 1.82, 0);
  canopyMesh.castShadow = true;
  canopyMesh.receiveShadow = true;
  boatGroup.add(canopyMesh);

  // ============================================================================
  // 2. HARBOR COBBLESTONE PATIO & WATERFRONT QUAY (CHAPTERS 01, 02, 04)
  // ============================================================================
  const cobbleTex = createCobbleTexture();
  const patioMat = new THREE.MeshStandardMaterial({
    color: 0xc2ba9f,
    map: cobbleTex.map,
    bumpMap: cobbleTex.bumpMap,
    bumpScale: 0.04,
    roughness: 0.88,
  });

  // Harbor platform ends cleanly at z = -3.7 so crystal-clear turquoise water comes right up to the patio edge!
  const harborBase = new THREE.Mesh(new THREE.BoxGeometry(13.2, 1.2, 8.2), patioMat);
  harborBase.position.set(0.2, 0.15, 0.4);
  harborBase.receiveShadow = true;
  harborBase.castShadow = true;
  worldGroup.add(harborBase);

  // 3D Sculpted rounded Mediterranean cobblestones across the harbor terrace (z from -3.5 to +3.2)
  const cobbleStoneGeo = new THREE.SphereGeometry(0.28, 12, 10);
  cobbleStoneGeo.scale(1.18, 0.32, 1.05);
  const cobbleInstMat = new THREE.MeshStandardMaterial({
    color: 0xc8c0a8,
    map: cobbleTex.map,
    bumpMap: cobbleTex.bumpMap,
    bumpScale: 0.025,
    roughness: 0.86,
  });

  const cobbleCols = 20;
  const cobbleRows = 15;
  const cobbleInst = new THREE.InstancedMesh(cobbleStoneGeo, cobbleInstMat, cobbleCols * cobbleRows);
  cobbleInst.receiveShadow = true;
  cobbleInst.castShadow = true;

  const dummy = new THREE.Object3D();
  let cIdx = 0;
  for (let r = 0; r < cobbleRows; r++) {
    for (let c = 0; c < cobbleCols; c++) {
      const gx = -3.2 + c * 0.42 + (r % 2) * 0.18 + (Math.random() - 0.5) * 0.06;
      const gz = -3.45 + r * 0.42 + (Math.random() - 0.5) * 0.06;
      dummy.position.set(gx, 0.74 + (Math.random() - 0.5) * 0.02, gz);
      dummy.rotation.set(
        (Math.random() - 0.5) * 0.08,
        Math.random() * Math.PI,
        (Math.random() - 0.5) * 0.08,
      );
      const s = 0.82 + Math.random() * 0.35;
      dummy.scale.set(s, 0.85 + Math.random() * 0.25, s * (0.9 + Math.random() * 0.2));
      dummy.updateMatrix();
      cobbleInst.setMatrixAt(cIdx++, dummy.matrix);
    }
  }
  worldGroup.add(cobbleInst);

  // Left Cycladic House (House A: features Pergola Stripes on roof in Ch 01 & Pastel Shutters facing +Z patio in Ch 02/04!)
  const leftHouse = createCycladicHouse(4.5, 4.75, 4.8);
  leftHouse.position.set(-3.45, 0.75, -3.55);
  worldGroup.add(leftHouse);

  // Terracotta pergola slats on the inner roof edge of Left House (matching Chapter 01 frame_001-003)
  const slatGroup = new THREE.Group();
  slatGroup.position.set(-2.35, 5.56, -1.65);
  for (let i = 0; i < 14; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.035, 0.78), terracottaMat);
    slat.position.set(-1.35 + i * 0.21, 0, 0);
    slat.rotation.y = 0.18;
    slat.castShadow = true;
    slat.receiveShadow = true;
    slatGroup.add(slat);
  }
  worldGroup.add(slatGroup);

  // Iconic Pastel Turquoise Louvered Shutters on South/Patio-Facing Wall of Left House (facing +Z so camera at z=+1.5 looking towards -Z sees it straight-on just like frames 04 & 08!)
  const pastelShutterPatio = createShutteredWindow(1.18, 1.68, turquoiseShutterMat);
  pastelShutterPatio.position.set(-1.95, 2.55, -1.12);
  pastelShutterPatio.rotation.y = 0;
  worldGroup.add(pastelShutterPatio);

  // Sea-facing turquoise shutter on Left House (visible in Aerial Overview frame 15 & 16!)
  const seaShutterLeft = createShutteredWindow(1.15, 1.65, turquoiseShutterMat);
  seaShutterLeft.position.set(-3.45, 2.65, -5.97);
  seaShutterLeft.rotation.y = Math.PI;
  worldGroup.add(seaShutterLeft);

  // Side shutter on Left House facing courtyard
  const sideShutterLeft = createShutteredWindow(0.95, 1.45, turquoiseShutterMat);
  sideShutterLeft.position.set(-1.18, 2.65, -3.2);
  sideShutterLeft.rotation.y = Math.PI / 2;
  worldGroup.add(sideShutterLeft);

  // Right Cycladic House (House B: features Bougainvillea corner in Ch 01 & Weathered Teal Door + Ivy in Ch 02)
  const rightHouse = createCycladicHouse(4.8, 5.35, 5.4);
  rightHouse.position.set(4.35, 0.75, -2.85);
  worldGroup.add(rightHouse);

  const rightHouseBougainvillea = createBougainvilleaPatch(1.3, 3.6, 1.3, 380);
  rightHouseBougainvillea.position.set(1.88, 4.15, -1.2);
  worldGroup.add(rightHouseBougainvillea);

  // Weathered Teal Door with white jasmine flowers & ivy on Right House (visible on right side of Chapter 02 frame_004)
  const tealDoorGroup = new THREE.Group();
  tealDoorGroup.position.set(1.92, 2.05, -2.15);
  tealDoorGroup.rotation.y = -Math.PI / 2;
  const tealDoorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 2.25, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x0e879c, roughness: 0.62 }),
  );
  tealDoorMesh.castShadow = true;
  tealDoorGroup.add(tealDoorMesh);

  const ivyPatch = createBougainvilleaPatch(1.4, 2.2, 0.3, 140);
  ivyPatch.position.set(-0.35, 0.25, 0.12);
  tealDoorGroup.add(ivyPatch);
  worldGroup.add(tealDoorGroup);

  function createBistroTable(): THREE.Group {
    const table = new THREE.Group();

    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.045, 32), bistroTableMat);
    top.position.y = 0.76;
    top.castShadow = true;
    top.receiveShadow = true;
    table.add(top);

    const legGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.82, 8);
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const leg = new THREE.Mesh(legGeo, darkIronMat);
      leg.position.set(Math.cos(angle) * 0.28, 0.38, Math.sin(angle) * 0.28);
      leg.rotation.z = Math.cos(angle) * 0.22;
      leg.rotation.x = -Math.sin(angle) * 0.22;
      leg.castShadow = true;
      table.add(leg);
    }

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.014, 8, 24), darkIronMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.28;
    table.add(ring);

    const bowlMat = new THREE.MeshStandardMaterial({ color: 0x2b6e8c, roughness: 0.35 });
    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.12, 0.075, 20),
      bowlMat,
    );
    bowl.position.y = 0.815;
    bowl.castShadow = true;
    table.add(bowl);

    const lemonGeo = new THREE.SphereGeometry(0.062, 12, 10);
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

    const legGeo = new THREE.BoxGeometry(0.035, 0.56, 0.035);
    for (const side of [-0.19, 0.19]) {
      const legF = new THREE.Mesh(legGeo, mat);
      legF.position.set(side, 0.24, 0.02);
      legF.rotation.x = 0.34;
      legF.castShadow = true;

      const legB = new THREE.Mesh(legGeo, mat);
      legB.position.set(side, 0.24, -0.02);
      legB.rotation.x = -0.34;
      legB.castShadow = true;

      const postBack = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.52, 0.035), mat);
      postBack.position.set(side, 0.68, -0.18);
      postBack.rotation.x = -0.14;
      postBack.castShadow = true;

      chair.add(legF, legB, postBack);
    }

    for (let i = 0; i < 5; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.055), mat);
      slat.position.set(0, seatY, -0.14 + i * 0.07);
      slat.castShadow = true;
      slat.receiveShadow = true;
      chair.add(slat);
    }

    for (let i = 0; i < 4; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.045, 0.02), mat);
      slat.position.set(0, 0.62 + i * 0.075, -0.17 - i * 0.01);
      slat.rotation.x = -0.14;
      slat.castShadow = true;
      chair.add(slat);
    }

    return chair;
  }

  function createTerracottaPlanter(scale = 1.0): THREE.Group {
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

    const bush = createLemonCluster(0.44 * scale, 95, 0);
    bush.position.y = 0.62 * scale;
    planter.add(bush);

    return planter;
  }

  // Harbor Patio Furniture (exact composition for Chapters 02 & 04)
  const leftBistro = createBistroTable();
  leftBistro.position.set(-1.35, 0.75, -0.55);
  worldGroup.add(leftBistro);

  const mintChair1 = createCafeChair(mintChairMat);
  mintChair1.position.set(-2.1, 0.75, -0.45);
  mintChair1.rotation.y = 1.32;
  worldGroup.add(mintChair1);

  const mintChair2 = createCafeChair(mintChairMat);
  mintChair2.position.set(-0.62, 0.75, -0.62);
  mintChair2.rotation.y = -1.35;
  worldGroup.add(mintChair2);

  const rightBistro = createBistroTable();
  rightBistro.position.set(1.52, 0.75, -0.42);
  worldGroup.add(rightBistro);

  const teakChair = createCafeChair(teakWoodMat);
  teakChair.position.set(0.88, 0.75, -0.22);
  teakChair.rotation.y = 1.15;
  worldGroup.add(teakChair);

  const planterCenterLeft = createTerracottaPlanter(1.05);
  planterCenterLeft.position.set(-0.22, 0.75, -0.55);
  worldGroup.add(planterCenterLeft);

  const planterCenterRight = createTerracottaPlanter(0.95);
  planterCenterRight.position.set(0.28, 0.75, -0.15);
  worldGroup.add(planterCenterRight);

  // Overarching Harbor Lemon Tree (trunk positioned at right edge x=1.78, z=0.65 so it frames right edge of Ch 02 & 04 without blocking camera!)
  const harborTreeGroup = new THREE.Group();
  harborTreeGroup.position.set(1.78, 0.75, 0.65);
  worldGroup.add(harborTreeGroup);

  const mainTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 2.75, 12), trunkMat);
  mainTrunk.position.set(0.15, 1.3, 0);
  mainTrunk.rotation.z = 0.22;
  mainTrunk.castShadow = true;
  harborTreeGroup.add(mainTrunk);

  const branchL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.13, 2.8, 10), trunkMat);
  branchL.position.set(-0.85, 2.55, -0.35);
  branchL.rotation.z = 0.96;
  branchL.rotation.x = -0.18;
  branchL.castShadow = true;
  harborTreeGroup.add(branchL);

  const lowCanopy1 = createLemonCluster(1.18, 145, 14);
  lowCanopy1.position.set(-1.65, 2.85, -0.45);
  harborTreeGroup.add(lowCanopy1);

  const lowCanopy2 = createLemonCluster(1.12, 135, 12);
  lowCanopy2.position.set(-0.25, 2.95, -0.25);
  harborTreeGroup.add(lowCanopy2);

  // Courtyard Lemon Canopy for Chapter 01 (frames the lower half of Chapter 01 while leaving the boat in the cove 100% clear!)
  const courtyardCanopyPositions: [number, number, number, number][] = [
    [-1.65, 3.85, 1.85, 1.25],
    [-0.25, 3.65, 2.05, 1.35],
    [1.15, 3.85, 1.85, 1.25],
    [-0.95, 4.15, 1.15, 1.15],
    [0.65, 4.05, 1.15, 1.18],
  ];
  for (const [cx, cy, cz, cr] of courtyardCanopyPositions) {
    const cluster = createLemonCluster(cr, 165, 16);
    cluster.position.set(cx, cy, cz);
    worldGroup.add(cluster);
  }

  // ============================================================================
  // 3. LINEN TERRACE (CHAPTER 03: BILLOWING PASTEL LINENS, OLIVE TREE, WICKER BASKET)
  // ============================================================================
  const linenTerraceGroup = new THREE.Group();
  linenTerraceGroup.position.set(-12.2, 0.75, -1.2);
  worldGroup.add(linenTerraceGroup);

  const terraceSlab = new THREE.Mesh(new THREE.BoxGeometry(8.6, 1.2, 7.6), warmPlasterFloorMat);
  terraceSlab.position.set(0.3, -0.5, 0.6);
  terraceSlab.receiveShadow = true;
  terraceSlab.castShadow = true;
  linenTerraceGroup.add(terraceSlab);

  const parapetWall = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.82, 0.36), whiteWallMat);
  parapetWall.position.set(0.15, 0.41, -1.95);
  parapetWall.castShadow = true;
  parapetWall.receiveShadow = true;
  linenTerraceGroup.add(parapetWall);

  const parapetCap = new THREE.Mesh(new THREE.BoxGeometry(5.72, 0.08, 0.44), whiteWallMat);
  parapetCap.position.set(0.15, 0.84, -1.95);
  parapetCap.castShadow = true;
  parapetCap.receiveShadow = true;
  linenTerraceGroup.add(parapetCap);

  const linenHouse = createCycladicHouse(4.6, 5.2, 6.4);
  linenHouse.position.set(4.1, 0, -0.2);
  linenTerraceGroup.add(linenHouse);

  const linenHouseShutter = createShutteredWindow(0.95, 1.45, turquoiseShutterMat);
  linenHouseShutter.position.set(1.78, 3.15, -1.65);
  linenHouseShutter.rotation.y = -Math.PI / 2;
  linenTerraceGroup.add(linenHouseShutter);

  const oliveTree = new THREE.Group();
  oliveTree.position.set(-2.35, 0, -1.65);
  linenTerraceGroup.add(oliveTree);

  const oliveTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 2.35, 12), trunkMat);
  oliveTrunk.position.set(0, 1.1, 0);
  oliveTrunk.rotation.z = 0.16;
  oliveTrunk.castShadow = true;
  oliveTree.add(oliveTrunk);

  const oliveLeafGeo = new THREE.PlaneGeometry(0.055, 0.22);
  for (let b = 0; b < 4; b++) {
    const bGroup = new THREE.Group();
    const angle = -0.5 + b * 0.45;
    bGroup.position.set(Math.sin(angle) * 0.5, 2.15 + (b % 2) * 0.35, Math.cos(angle) * 0.3);

    const subBranch = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 1.4, 8), trunkMat);
    subBranch.rotation.z = (b - 1.5) * 0.45;
    subBranch.castShadow = true;
    bGroup.add(subBranch);

    for (let i = 0; i < 185; i++) {
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

  // Wooden Clothesline Posts, Rope, Clothespins, and 3 Sunlit Billowing Pastel Linen Sheets
  const postGeo = new THREE.BoxGeometry(0.085, 2.45, 0.085);
  const postLeft = new THREE.Mesh(postGeo, warmPostWoodMat);
  postLeft.position.set(-1.85, 1.22, -1.15);
  postLeft.castShadow = true;
  postLeft.receiveShadow = true;

  const postRight = new THREE.Mesh(postGeo, warmPostWoodMat);
  postRight.position.set(1.75, 1.36, -1.35);
  postRight.castShadow = true;
  postRight.receiveShadow = true;

  const ropeLen = Math.hypot(3.6, 0.14, -0.2);
  const rope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, ropeLen, 8),
    warmPostWoodMat,
  );
  rope.position.set(-0.05, 2.36, -1.25);
  rope.rotation.z = Math.PI / 2 - 0.042;
  rope.rotation.y = -0.052;
  rope.castShadow = true;
  linenTerraceGroup.add(postLeft, postRight, rope);

  const sheetSpecs = [
    { x: -1.18, y: 2.31, z: -1.19, w: 0.98, h: 1.68, color: "#549692", phase: 0.0 },
    { x: -0.02, y: 2.36, z: -1.25, w: 1.06, h: 1.82, color: "#D2E4E9", phase: 1.4 },
    { x: 1.12, y: 2.41, z: -1.31, w: 0.96, h: 1.62, color: "#C2D7CC", phase: 2.7 },
  ];

  const pinGeo = new THREE.BoxGeometry(0.032, 0.13, 0.038);
  for (const spec of sheetSpecs) {
    const sheetGeo = new THREE.PlaneGeometry(spec.w, spec.h, 24, 32);
    sheetGeo.translate(0, -spec.h / 2, 0);

    const sheetTex = createLinenWeaveTexture(spec.color);
    const sheetMat = new THREE.MeshStandardMaterial({
      map: sheetTex,
      roughness: 0.76,
      metalness: 0.02,
      emissive: new THREE.Color(spec.color),
      emissiveIntensity: 0.12,
      side: THREE.DoubleSide,
    });

    const sheetMesh = new THREE.Mesh(sheetGeo, sheetMat);
    sheetMesh.position.set(spec.x, spec.y, spec.z);
    sheetMesh.rotation.y = -0.052;
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
  benchPlinth.position.set(1.25, 0.21, 0.65);
  benchPlinth.castShadow = true;
  benchPlinth.receiveShadow = true;

  const benchSlab = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.07, 0.96), whiteWallMat);
  benchSlab.position.set(1.25, 0.45, 0.65);
  benchSlab.castShadow = true;
  benchSlab.receiveShadow = true;
  linenTerraceGroup.add(benchPlinth, benchSlab);

  const wickerTex = createWickerTexture();
  const wickerMat = new THREE.MeshStandardMaterial({ map: wickerTex, roughness: 0.85 });
  const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.38, 24), wickerMat);
  basket.position.set(1.38, 0.67, 0.62);
  basket.castShadow = true;
  basket.receiveShadow = true;
  linenTerraceGroup.add(basket);

  const foldedMat1 = new THREE.MeshStandardMaterial({ color: 0x7cb0b4, roughness: 0.82 });
  const foldedMat2 = new THREE.MeshStandardMaterial({ color: 0xc2d6da, roughness: 0.82 });
  const towel1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.32), foldedMat1);
  towel1.position.set(1.38, 0.89, 0.62);
  towel1.rotation.y = 0.18;
  towel1.castShadow = true;
  const towel2 = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.28), foldedMat2);
  towel2.position.set(1.4, 0.97, 0.61);
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
  const bottleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.38, 24), glassMat);
  bottleBody.position.set(0.95, 0.67, 0.72);
  bottleBody.castShadow = true;

  const bottleShoulder = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    glassMat,
  );
  bottleShoulder.position.set(0.95, 0.86, 0.72);

  const bottleNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.16, 16), glassMat);
  bottleNeck.position.set(0.95, 1.04, 0.72);

  const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.032, 0.06, 12), warmPostWoodMat);
  cork.position.set(0.95, 1.13, 0.72);
  linenTerraceGroup.add(bottleBody, bottleShoulder, bottleNeck, cork);

  // ============================================================================
  // 4. BOUGAINVILLEA LANE & ARCHWAY (CHAPTER 05: ARCH, STEPS, RAILING, VILLAGE)
  // ============================================================================
  const laneGroup = new THREE.Group();
  laneGroup.position.set(-5.6, 0.75, 4.2);
  worldGroup.add(laneGroup);

  const slateTex = createSlateLaneTexture();
  const slateMat = new THREE.MeshStandardMaterial({
    map: slateTex,
    roughness: 0.84,
  });
  const laneFloor = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.4, 13.5), slateMat);
  laneFloor.position.set(0, -0.1, 0.2);
  laneFloor.receiveShadow = true;
  laneGroup.add(laneFloor);

  const archWallShape = new THREE.Shape();
  archWallShape.moveTo(-2.2, 0);
  archWallShape.lineTo(2.2, 0);
  archWallShape.lineTo(2.2, 3.65);
  archWallShape.lineTo(-2.2, 3.65);
  archWallShape.lineTo(-2.2, 0);

  const archHole = new THREE.Path();
  archHole.moveTo(-1.05, 0);
  archHole.lineTo(-1.05, 1.85);
  archHole.absarc(0, 1.85, 1.05, Math.PI, 0, true);
  archHole.lineTo(1.05, 0);
  archWallShape.holes.push(archHole);

  const archGeo = new THREE.ExtrudeGeometry(archWallShape, {
    depth: 0.75,
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

  const archStemLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.07, 3.2, 8), trunkMat);
  archStemLeft.position.set(-1.38, 1.45, 0.65);
  archStemLeft.rotation.z = -0.18;
  archStemLeft.castShadow = true;
  laneGroup.add(archStemLeft);

  const archGarlandTop = createBougainvilleaPatch(2.6, 0.85, 0.95, 520);
  archGarlandTop.position.set(0.05, 3.18, 0.52);
  laneGroup.add(archGarlandTop);

  const archGarlandLeft = createBougainvilleaPatch(0.85, 2.2, 0.85, 340);
  archGarlandLeft.position.set(-1.42, 2.35, 0.58);
  laneGroup.add(archGarlandLeft);

  const archGarlandRight = createBougainvilleaPatch(0.85, 1.95, 0.85, 320);
  archGarlandRight.position.set(1.22, 2.15, 0.52);
  laneGroup.add(archGarlandRight);

  const leftLaneWall = createCycladicHouse(2.6, 4.2, 6.5);
  leftLaneWall.position.set(-2.65, 0, 2.8);
  laneGroup.add(leftLaneWall);

  const laneShutter = createShutteredWindow(0.88, 1.42, turquoiseShutterMat);
  laneShutter.position.set(-1.32, 1.75, 2.25);
  laneShutter.rotation.y = Math.PI / 2;
  laneGroup.add(laneShutter);

  for (const shelfY of [1.05, 2.28]) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.95), whiteWallMat);
    shelf.position.set(-1.18, shelfY, 1.75);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    laneGroup.add(shelf);
  }

  const stairParapetShape = new THREE.Shape();
  stairParapetShape.moveTo(0, 0);
  stairParapetShape.lineTo(3.8, 0);
  stairParapetShape.lineTo(3.8, 1.25);
  stairParapetShape.lineTo(0, 3.15);
  stairParapetShape.lineTo(0, 0);

  const stairParapetGeo = new THREE.ExtrudeGeometry(stairParapetShape, {
    depth: 0.34,
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

  const railingGroup = new THREE.Group();
  railingGroup.position.set(1.22, 2.55, 0.85);
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 2.4), darkIronMat);
  topBar.position.y = 0.85;
  railingGroup.add(topBar);
  for (let i = 0; i < 12; i++) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.85, 8), darkIronMat);
    bar.position.set(0, 0.42, -1.1 + i * 0.2);
    bar.castShadow = true;
    railingGroup.add(bar);
  }
  laneGroup.add(railingGroup);

  // ============================================================================
  // 5. UPPER CYCLADIC VILLAGE CLUSTER & REALISTIC GREEK ISLAND CLIFFS (FRAMES 11-16)
  // ============================================================================
  const villageSpecs: { x: number; y: number; z: number; w: number; h: number; d: number; hasDoor?: boolean }[] = [
    { x: -11.2, y: 0.75, z: 7.2, w: 5.2, h: 4.9, d: 5.4, hasDoor: true },
    { x: -5.4, y: 0.75, z: 13.8, w: 5.0, h: 5.3, d: 4.8, hasDoor: true },
    { x: 0.6, y: 0.75, z: 8.8, w: 5.4, h: 4.8, d: 5.2, hasDoor: true },
    { x: 6.2, y: 0.75, z: 7.5, w: 4.8, h: 4.6, d: 5.0 },
    { x: -15.8, y: 0.75, z: 12.4, w: 4.8, h: 4.5, d: 4.8 },
    { x: -10.5, y: 0.75, z: 15.2, w: 5.2, h: 5.4, d: 5.0 },
    { x: 1.2, y: 0.75, z: 15.6, w: 5.0, h: 5.2, d: 4.8 },
    { x: 7.2, y: 0.75, z: 14.5, w: 4.6, h: 4.9, d: 4.8 },
  ];

  for (const v of villageSpecs) {
    const house = createCycladicHouse(v.w, v.h, v.d);
    house.position.set(v.x, v.y, v.z);
    worldGroup.add(house);

    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.68, 12), whiteWallMat);
    chimney.position.set(v.x + v.w * 0.25, v.y + v.h + 0.34, v.z - v.d * 0.2);
    chimney.castShadow = true;
    worldGroup.add(chimney);

    const win = createShutteredWindow(0.88, 1.32, turquoiseShutterMat);
    win.position.set(v.x - v.w * 0.22, v.y + v.h * 0.56, v.z - v.d / 2 - 0.02);
    win.rotation.y = Math.PI;
    worldGroup.add(win);

    if (v.hasDoor) {
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
    }
  }

  // Sculpted Mediterranean Limestone Coastal Cliffs behind the village (z > 4)
  const cliffGeo = new THREE.PlaneGeometry(180, 95, 72, 48);
  cliffGeo.rotateX(-Math.PI / 2);
  const cPos = cliffGeo.attributes.position;
  for (let i = 0; i < cPos.count; i++) {
    const x = cPos.getX(i);
    const z = cPos.getZ(i);
    const hillSlope = Math.max(0, (z + 25) * 0.14);
    const ridge =
      Math.sin(x * 0.065) * 2.2 +
      Math.cos(z * 0.09 + x * 0.04) * 1.4 +
      Math.sin(x * 0.22 - z * 0.18) * 0.45;
    cPos.setY(i, hillSlope + ridge);
  }
  cliffGeo.computeVertexNormals();

  const cliffMat = new THREE.MeshStandardMaterial({
    color: 0xb6a489,
    map: cobbleTex.map,
    bumpMap: cobbleTex.bumpMap,
    bumpScale: 0.08,
    roughness: 0.94,
  });
  const cliffMesh = new THREE.Mesh(cliffGeo, cliffMat);
  cliffMesh.position.set(-2, -0.45, 52);
  cliffMesh.receiveShadow = true;
  worldGroup.add(cliffMesh);

  // Rocky limestone seawall foundation strictly behind z = -3.4 so the harbor cove water is 100% unobstructed!
  const seawallMat = new THREE.MeshStandardMaterial({
    color: 0x948b7a,
    map: cobbleTex.map,
    roughness: 0.92,
  });
  const seawall = new THREE.Mesh(new THREE.BoxGeometry(31, 2.0, 22), seawallMat);
  seawall.position.set(-4.2, -0.35, 7.8);
  seawall.receiveShadow = true;
  seawall.castShadow = true;
  worldGroup.add(seawall);

  // Distant Aegean Island Silhouette on the Northern Horizon
  const islandShape = new THREE.Shape();
  islandShape.moveTo(-42, 0);
  islandShape.quadraticCurveTo(-24, 1.8, -12, 5.2);
  islandShape.quadraticCurveTo(-4, 7.6, 4, 4.8);
  islandShape.quadraticCurveTo(18, 2.1, 38, 0);
  islandShape.lineTo(-42, 0);

  const islandGeo = new THREE.ExtrudeGeometry(islandShape, {
    depth: 12,
    bevelEnabled: true,
    bevelSize: 1.2,
    bevelThickness: 1.5,
  });
  const islandMat = new THREE.MeshStandardMaterial({
    color: 0x5c859c,
    roughness: 0.95,
  });
  const distantIsland = new THREE.Mesh(islandGeo, islandMat);
  distantIsland.position.set(-34, -0.5, -145);
  worldGroup.add(distantIsland);

  return {
    update: (elapsed: number, breeze: number) => {
      const waveAmp = 0.55 + breeze * 0.65;
      boatGroup.position.y = 0.14 + Math.sin(elapsed * 1.65) * 0.035 * waveAmp;
      boatGroup.rotation.z = Math.sin(elapsed * 1.35 + 0.5) * 0.028 * waveAmp;
      boatGroup.rotation.x = Math.cos(elapsed * 1.15) * 0.018 * waveAmp;

      const windStrength = 0.14 + breeze * 0.28;
      const windSpeed = 1.8 + breeze * 1.6;
      for (const sheet of clothSheets) {
        const pos = sheet.mesh.geometry.attributes.position as THREE.BufferAttribute;
        const base = sheet.basePositions;
        const count = pos.count;

        for (let i = 0; i < count; i++) {
          const bx = base[i * 3];
          const by = base[i * 3 + 1];
          const bz = base[i * 3 + 2];

          const vNorm = Math.min(1, Math.max(0, -by / sheet.height));
          const pinMask = Math.pow(vNorm, 1.35);

          const wave1 = Math.sin(bx * 3.4 - by * 2.6 - elapsed * windSpeed + sheet.phaseOffset);
          const wave2 = Math.cos(bx * 5.8 + by * 3.9 - elapsed * (windSpeed * 1.35) + sheet.phaseOffset) * 0.42;
          const billow = Math.sin(vNorm * Math.PI) * (0.12 + 0.08 * Math.sin(elapsed * 1.1 + sheet.phaseOffset));

          const dz = ((wave1 + wave2) * windStrength + billow) * pinMask;
          const dx = Math.sin(by * 2.5 - elapsed * 1.4 + sheet.phaseOffset) * 0.045 * pinMask * breeze;

          pos.setXYZ(i, bx + dx, by, bz + dz);
        }
        pos.needsUpdate = true;
        sheet.mesh.geometry.computeVertexNormals();
      }

      for (let i = 0; i < swayBranches.length; i++) {
        const b = swayBranches[i];
        const phase = i * 0.73;
        b.rotation.z = Math.sin(elapsed * 1.4 + phase) * 0.025 * (0.5 + breeze);
        b.rotation.x = Math.cos(elapsed * 1.1 + phase) * 0.018 * (0.5 + breeze);
      }
    },
  };
}
