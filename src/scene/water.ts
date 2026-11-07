import * as THREE from "three";

export interface AegeanWaterSystem {
  mesh: THREE.Mesh;
  seabedMesh: THREE.Mesh;
  update: (elapsed: number, breeze: number, clarity: number, sunDir: THREE.Vector3) => void;
}

export function createAegeanWater(): AegeanWaterSystem {
  // 1. Richly textured shallow stony seabed underneath the crystal cove
  const seabedGeo = new THREE.PlaneGeometry(260, 260, 96, 96);
  seabedGeo.rotateX(-Math.PI / 2);

  const posAttr = seabedGeo.attributes.position;
  const colors: number[] = [];
  const colorTmp = new THREE.Color();

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);

    // Shallow cove near the village (z in [-22, 16], x in [-26, 22])
    const distFromHarbor = Math.hypot(x - 0.5, z + 6.0);
    const coveMask = Math.max(0, 1 - distFromHarbor / 28);
    const noise =
      Math.sin(x * 0.85) * Math.cos(z * 0.85) * 0.22 +
      Math.sin(x * 2.3 + z * 1.9) * 0.12 +
      Math.cos(x * 4.7 - z * 3.8) * 0.06;

    const depth = -1.15 - (1 - coveMask) * 4.8 + noise;
    posAttr.setY(i, depth);

    // Sunlit limestone & turquoise reef tones in shallow cove, deeper blue-teal offshore
    if (coveMask > 0.35) {
      const pebbleVariation = 0.5 + 0.5 * Math.sin(x * 5.1 + z * 6.3);
      colorTmp.setRGB(
        0.52 + pebbleVariation * 0.24,
        0.66 + pebbleVariation * 0.18,
        0.58 + pebbleVariation * 0.15,
      );
    } else {
      colorTmp.setRGB(0.08, 0.28, 0.36);
    }
    colors.push(colorTmp.r, colorTmp.g, colorTmp.b);
  }

  seabedGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  seabedGeo.computeVertexNormals();

  const seabedMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.88,
    metalness: 0.05,
  });
  const seabedMesh = new THREE.Mesh(seabedGeo, seabedMat);
  seabedMesh.position.y = 0;
  seabedMesh.receiveShadow = true;

  // 2. Custom GLSL Shader for the Aegean Sea surface (shallow turquoise caustics + deep azure waves)
  const waterGeo = new THREE.PlaneGeometry(320, 320, 180, 180);
  waterGeo.rotateX(-Math.PI / 2);

  const uniforms = {
    uTime: { value: 0 },
    uBreeze: { value: 0.48 },
    uClarity: { value: 0.92 },
    uSunDir: { value: new THREE.Vector3(0.55, 0.78, -0.32).normalize() },
    uShallowColor: { value: new THREE.Color("#38B5A6") },
    uMidColor: { value: new THREE.Color("#126E82") },
    uDeepColor: { value: new THREE.Color("#0A485E") },
    uSkyColor: { value: new THREE.Color("#6AA2CC") },
  };

  const vertexShader = /* glsl */ `
    uniform float uTime;
    uniform float uBreeze;
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying float vWaveHeight;

    void main() {
      vec3 pos = position;
      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      vec2 p = worldPosition.xz;

      float amp = 0.035 + uBreeze * 0.065;
      float w1 = sin(p.x * 0.62 + uTime * 1.45) * cos(p.y * 0.48 + uTime * 1.15);
      float w2 = sin((p.x * 1.35 - p.y * 1.12) + uTime * 2.15) * 0.55;
      float w3 = cos((p.x * 2.8 + p.y * 2.4) - uTime * 2.9) * 0.25;

      float h = (w1 + w2 + w3) * amp;
      pos.y += h;
      vWaveHeight = h;

      // Analytical normal approximation for crisp sun glitter and Fresnel reflection
      float dx = (
        0.62 * cos(p.x * 0.62 + uTime * 1.45) * cos(p.y * 0.48 + uTime * 1.15) +
        1.35 * cos((p.x * 1.35 - p.y * 1.12) + uTime * 2.15) * 0.55 -
        2.80 * sin((p.x * 2.8 + p.y * 2.4) - uTime * 2.9) * 0.25
      ) * amp;

      float dz = (
        -0.48 * sin(p.x * 0.62 + uTime * 1.45) * sin(p.y * 0.48 + uTime * 1.15) -
        1.12 * cos((p.x * 1.35 - p.y * 1.12) + uTime * 2.15) * 0.55 -
        2.40 * sin((p.x * 2.8 + p.y * 2.4) - uTime * 2.9) * 0.25
      ) * amp;

      vNormal = normalize(vec3(-dx * 2.4, 1.0, -dz * 2.4));
      vec4 finalWorld = modelMatrix * vec4(pos, 1.0);
      vWorldPos = finalWorld.xyz;
      gl_Position = projectionMatrix * viewMatrix * finalWorld;
    }
  `;

  const fragmentShader = /* glsl */ `
    uniform float uTime;
    uniform float uBreeze;
    uniform float uClarity;
    uniform vec3 uSunDir;
    uniform vec3 uShallowColor;
    uniform vec3 uMidColor;
    uniform vec3 uDeepColor;
    uniform vec3 uSkyColor;

    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying float vWaveHeight;

    // Procedural Voronoi-like caustic network for crystal Greek shallows
    float causticPattern(vec2 uv, float t) {
      vec2 p = uv * 1.65;
      float c1 = sin(p.x * 3.1 + t * 1.4 + cos(p.y * 2.7 - t * 1.1));
      float c2 = cos(p.y * 3.5 - t * 1.3 + sin(p.x * 2.9 + t * 1.6));
      float c3 = sin((p.x + p.y) * 2.6 - t * 1.8);
      float v = abs(c1 + c2 + c3 * 0.5);
      return pow(clamp(1.0 - v * 0.42, 0.0, 1.0), 3.2);
    }

    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPos);

      // High-frequency micro-ripples on water surface
      vec2 uv = vWorldPos.xz;
      float micro1 = sin(uv.x * 6.5 + uv.y * 4.2 + uTime * 2.6) * 0.035;
      float micro2 = cos(uv.x * 9.2 - uv.y * 7.8 - uTime * 3.1) * 0.025;
      vec3 N = normalize(vNormal + vec3(micro1, 0.0, micro2));

      // Distance from the shallow Cycladic cove (centered near x=0, z=-7)
      float coveDist = length((vWorldPos.xz - vec2(-1.0, -5.5)) * vec2(0.72, 0.95));
      float shallowFactor = smoothstep(22.0, 4.5, coveDist);
      float midFactor = smoothstep(52.0, 14.0, coveDist);

      // Rocky seabed pebble & caustic pattern visible through clear shallow water
      float caustics = causticPattern(uv + N.xz * 0.45, uTime) + causticPattern(uv * 1.4 - N.xz * 0.3, uTime * 0.8) * 0.6;
      float pebbleTex = 0.5 + 0.5 * sin(uv.x * 4.2 + cos(uv.y * 3.9)) * cos(uv.y * 4.8 - sin(uv.x * 3.5));

      vec3 reefFloor = mix(vec3(0.58, 0.66, 0.52), vec3(0.32, 0.78, 0.70), 0.55) + pebbleTex * 0.14;
      reefFloor += vec3(0.95, 0.98, 0.82) * caustics * 0.42 * uClarity;

      vec3 baseSea = mix(uDeepColor, uMidColor, midFactor);
      baseSea = mix(baseSea, uShallowColor, shallowFactor * 0.85);
      baseSea = mix(baseSea, reefFloor, shallowFactor * 0.58 * uClarity);

      // Subtle wave crest brightening
      float crest = smoothstep(0.01, 0.09, vWaveHeight);
      baseSea += vec3(0.08, 0.18, 0.19) * crest;

      // Fresnel sky reflection & solar specular sparkle
      float fresnel = pow(1.0 - max(dot(viewDir, N), 0.0), 3.6);
      vec3 reflColor = mix(baseSea, uSkyColor, fresnel * 0.52);

      vec3 halfVec = normalize(uSunDir + viewDir);
      float spec = pow(max(dot(N, halfVec), 0.0), 180.0) * 1.35;
      float broadSpec = pow(max(dot(N, halfVec), 0.0), 28.0) * 0.18;

      vec3 finalColor = reflColor + vec3(1.0, 0.97, 0.88) * (spec + broadSpec);

      // Subtle shoreline foam near rocks/quays
      float shoreBand = smoothstep(4.2, 1.5, abs(coveDist - 5.2)) * shallowFactor;
      float foamWave = smoothstep(0.68, 0.92, sin(coveDist * 3.5 - uTime * 2.2) * 0.5 + 0.5);
      finalColor = mix(finalColor, vec3(0.94, 0.98, 0.97), shoreBand * foamWave * 0.22);

      float alpha = mix(0.96, 0.78, shallowFactor * uClarity);
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  const waterMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
  });

  const mesh = new THREE.Mesh(waterGeo, waterMat);
  mesh.position.y = 0.05;

  return {
    mesh,
    seabedMesh,
    update: (elapsed: number, breeze: number, clarity: number, sunDir: THREE.Vector3) => {
      uniforms.uTime.value = elapsed;
      uniforms.uBreeze.value = breeze;
      uniforms.uClarity.value = clarity;
      uniforms.uSunDir.value.copy(sunDir);
    },
  };
}

