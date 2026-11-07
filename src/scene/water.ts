import * as THREE from "three";

export interface WaterHandles {
  mesh: THREE.Mesh;
  seabedMesh: THREE.Mesh;
  update: (elapsed: number, breeze: number, clarity: number, sunDir: THREE.Vector3) => void;
}

export function createAegeanWater(): WaterHandles {
  // 1. Seabed Mesh (shallow coastal pebble & sand shelf transitioning into deep Aegean basin)
  const seabedGeo = new THREE.PlaneGeometry(320, 320, 128, 128);
  seabedGeo.rotateX(-Math.PI / 2);

  const pos = seabedGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    // Shallow near the village quays (z > -8.5), sloping down into the open sea (z < -8.5)
    const distFromQuay = Math.max(0, -1.8 - z);
    const depth = -0.42 - Math.pow(distFromQuay, 1.18) * 0.22;
    const microRelief =
      Math.sin(x * 1.9 + z * 1.5) * 0.06 +
      Math.cos(x * 4.2 - z * 3.6) * 0.035;
    pos.setY(i, depth + microRelief);
  }
  seabedGeo.computeVertexNormals();

  const seabedMat = new THREE.MeshStandardMaterial({
    color: 0xd9cfa8,
    roughness: 0.92,
    metalness: 0.02,
  });
  const seabedMesh = new THREE.Mesh(seabedGeo, seabedMat);
  seabedMesh.receiveShadow = true;

  // 2. Water Surface Mesh with Gerstner Waves, Fine Wind Ripples & Caustics
  const waterGeo = new THREE.PlaneGeometry(320, 320, 220, 220);
  waterGeo.rotateX(-Math.PI / 2);

  const uniforms = {
    uTime: { value: 0 },
    uBreeze: { value: 0.48 },
    uClarity: { value: 0.92 },
    uSunDir: { value: new THREE.Vector3(0.45, 0.72, 0.52).normalize() },
    uCameraPos: { value: new THREE.Vector3() },
    uCrystalMint: { value: new THREE.Color(0x55c4ba) },
    uShallowTurquoise: { value: new THREE.Color(0x1f8e96) },
    uMidAegean: { value: new THREE.Color(0x115f7a) },
    uDeepSapphire: { value: new THREE.Color(0x0a3d59) },
    uSkyReflect: { value: new THREE.Color(0x6da5d4) },
  };

  const waterMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: true,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uBreeze;
      varying vec3 vWorldPos;
      varying vec3 vNormal;
      varying float vWaveHeight;

      vec3 gerstner(vec2 xz, float steepness, float wavelength, vec2 dir, float time, inout vec3 tangent, inout vec3 binormal) {
        float k = 6.2831853 / wavelength;
        float c = sqrt(9.8 / k);
        vec2 d = normalize(dir);
        float f = k * (dot(d, xz) - c * time);
        float a = steepness / k;

        tangent += vec3(
          -d.x * d.x * (steepness * sin(f)),
          d.x * (steepness * cos(f)),
          -d.x * d.y * (steepness * sin(f))
        );
        binormal += vec3(
          -d.x * d.y * (steepness * sin(f)),
          d.y * (steepness * cos(f)),
          -d.y * d.y * (steepness * sin(f))
        );

        return vec3(
          d.x * (a * cos(f)),
          a * sin(f),
          d.y * (a * cos(f))
        );
      }

      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vec2 xz = worldPos.xz;

        float amp = 0.25 + uBreeze * 0.55;
        vec3 tangent = vec3(1.0, 0.0, 0.0);
        vec3 binormal = vec3(0.0, 0.0, 1.0);
        vec3 disp = vec3(0.0);

        disp += gerstner(xz, 0.045 * amp, 5.2, vec2(0.18, 0.98), uTime * 0.95, tangent, binormal);
        disp += gerstner(xz, 0.032 * amp, 2.7, vec2(-0.32, 0.94), uTime * 1.15, tangent, binormal);
        disp += gerstner(xz, 0.022 * amp, 1.45, vec2(0.42, 0.90), uTime * 1.4, tangent, binormal);

        worldPos.xyz += disp;
        vWorldPos = worldPos.xyz;
        vWaveHeight = disp.y;
        vNormal = normalize(cross(binormal, tangent));

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uBreeze;
      uniform float uClarity;
      uniform vec3 uSunDir;
      uniform vec3 uCrystalMint;
      uniform vec3 uShallowTurquoise;
      uniform vec3 uMidAegean;
      uniform vec3 uDeepSapphire;
      uniform vec3 uSkyReflect;

      varying vec3 vWorldPos;
      varying vec3 vNormal;
      varying float vWaveHeight;

      float hash21(vec2 p) {
        p = fract(p * vec2(234.34, 435.345));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }

      float noise2D(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash21(i + vec2(0.0, 0.0)), hash21(i + vec2(1.0, 0.0)), u.x),
          mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      // Fine Voronoi caustics for shallow water
      float voronoiCaustics(vec2 uv, float t) {
        vec2 n = floor(uv);
        vec2 f = fract(uv);
        float md1 = 8.0;
        float md2 = 8.0;
        for (int j = -1; j <= 1; j++) {
          for (int i = -1; i <= 1; i++) {
            vec2 g = vec2(float(i), float(j));
            vec2 o = vec2(
              hash21(n + g),
              hash21(n + g + vec2(17.3, 29.1))
            );
            o = 0.5 + 0.42 * sin(t + 6.2831 * o);
            vec2 r = g + o - f;
            float d = dot(r, r);
            if (d < md1) {
              md2 = md1;
              md1 = d;
            } else if (d < md2) {
              md2 = d;
            }
          }
        }
        float edge = clamp(1.0 - (sqrt(md2) - sqrt(md1)) * 3.6, 0.0, 1.0);
        return pow(edge, 3.2);
      }

      void main() {
        vec3 V = normalize(cameraPosition - vWorldPos);

        // High-frequency horizontal wind ripples matching Aegean sea photography
        vec2 rippleUV1 = vec2(vWorldPos.x * 2.4 + uTime * 0.4, vWorldPos.z * 7.8 - uTime * 1.2);
        vec2 rippleUV2 = vec2(vWorldPos.x * 4.8 - uTime * 0.5, vWorldPos.z * 14.5 + uTime * 1.5);
        float r1 = noise2D(rippleUV1) - 0.5;
        float r2 = noise2D(rippleUV2) - 0.5;

        vec3 N = normalize(vNormal + vec3((r1 + r2 * 0.5) * 0.14, 0.0, (r1 * 1.4 - r2 * 0.8) * 0.24));

        // Distance from coastal quay wall (z around -2.5 to -3.5)
        float shoreDist = clamp((-2.2 - vWorldPos.z) / 14.0, 0.0, 1.0);
        float shallowMask = 1.0 - smoothstep(0.0, 0.48, shoreDist);
        float midMask = 1.0 - smoothstep(0.22, 0.82, shoreDist);

        // Submerged pebble & sand texture in crystal-clear shallows
        float pebblePattern = noise2D(vWorldPos.xz * 5.5) * 0.55 + noise2D(vWorldPos.xz * 13.0) * 0.45;
        vec3 pebbleTint = mix(vec3(0.58, 0.66, 0.56), vec3(0.84, 0.82, 0.68), pebblePattern);

        // Caustic light network on shallow seabed
        float c1 = voronoiCaustics(vWorldPos.xz * 1.85 + N.xz * 0.35, uTime * 1.45);
        float c2 = voronoiCaustics(vWorldPos.xz * 3.1 - N.xz * 0.25 + 4.2, uTime * 1.15);
        float caustics = (c1 * 0.65 + c2 * 0.45) * uClarity;

        vec3 shallowCol = mix(uShallowTurquoise, uCrystalMint, shallowMask * 0.72);
        shallowCol = mix(shallowCol, pebbleTint, shallowMask * 0.42 * uClarity);
        shallowCol += vec3(0.42, 0.62, 0.58) * caustics * (0.28 + 0.72 * shallowMask);

        vec3 deepCol = mix(uDeepSapphire, uMidAegean, midMask);
        // Subtle wave crest illumination on open sea
        float waveCrest = clamp((r1 + r2 * 0.6) + 0.35, 0.0, 1.0);
        deepCol += vec3(0.05, 0.14, 0.20) * waveCrest * (1.0 - shallowMask * 0.5);

        vec3 waterColor = mix(deepCol, shallowCol, pow(1.0 - shoreDist, 1.35));

        // Fresnel sky reflection & crisp sun glints
        float fresnel = pow(1.0 - max(dot(V, N), 0.0), 3.6);
        waterColor = mix(waterColor, uSkyReflect, fresnel * 0.42);

        vec3 H = normalize(uSunDir + V);
        float specBroad = pow(max(dot(N, H), 0.0), 64.0) * 0.32;
        float specSparkle = pow(max(dot(N, H), 0.0), 420.0) * 1.45;
        waterColor += vec3(1.0, 0.98, 0.92) * (specBroad + specSparkle);

        // Subtle white waterlap along the stone quay edge
        float lapLine = smoothstep(0.12, 0.0, abs(shoreDist - 0.02 + sin(vWorldPos.x * 2.2 + uTime * 2.1) * 0.015));
        waterColor = mix(waterColor, vec3(0.92, 0.97, 0.98), lapLine * 0.38);

        float alpha = mix(0.84, 0.98, smoothstep(0.0, 0.35, shoreDist));
        gl_FragColor = vec4(waterColor, alpha);
      }
    `,
  });

  const mesh = new THREE.Mesh(waterGeo, waterMat);
  mesh.position.y = 0.0;

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
