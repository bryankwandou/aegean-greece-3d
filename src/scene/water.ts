import * as THREE from "three";

export interface WaterHandles {
  mesh: THREE.Mesh;
  seabedMesh: THREE.Mesh;
  update: (elapsed: number, breeze: number, clarity: number, sunDir: THREE.Vector3) => void;
}

export function createAegeanWater(): WaterHandles {
  // 1. Seabed Mesh: continuous natural coastal seabed sloping from shallow quays into the Aegean basin
  const seabedGeo = new THREE.PlaneGeometry(360, 360, 96, 96);
  seabedGeo.rotateX(-Math.PI / 2);

  const pos = seabedGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    // Cove shelf around z = -1 to -12, then gently slopes down
    const dist = Math.max(0, -z);
    const depth = -0.55 - Math.pow(dist * 0.08, 1.25) * 3.8;
    const ripple = Math.sin(x * 0.8 + z * 0.6) * 0.12 + Math.cos(x * 1.8 - z * 1.4) * 0.06;
    pos.setY(i, depth + ripple);
  }
  seabedGeo.computeVertexNormals();

  const seabedMat = new THREE.MeshStandardMaterial({
    color: 0xdfd7ba,
    roughness: 0.92,
    metalness: 0.02,
  });
  const seabedMesh = new THREE.Mesh(seabedGeo, seabedMat);
  seabedMesh.receiveShadow = true;

  // 2. High-Fidelity Photorealistic Water Surface Shader (matching DACI75PglF1j3tK9k.mp4)
  const waterGeo = new THREE.PlaneGeometry(360, 360, 240, 240);
  waterGeo.rotateX(-Math.PI / 2);

  const uniforms = {
    uTime: { value: 0 },
    uBreeze: { value: 0.48 },
    uClarity: { value: 0.94 },
    uSunDir: { value: new THREE.Vector3(0.42, 0.76, 0.48).normalize() },
    uShallowTurquoise: { value: new THREE.Color(0x38d9cb) },
    uMidTeal: { value: new THREE.Color(0x18929e) },
    uDeepSapphire: { value: new THREE.Color(0x0e5874) },
    uSkyReflect: { value: new THREE.Color(0x7fb8e2) },
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
      varying float vWaveDisp;

      vec3 gerstnerWave(vec2 xz, float steepness, float wavelength, vec2 dir, float time, inout vec3 tangent, inout vec3 binormal) {
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

        return vec3(d.x * (a * cos(f)), a * sin(f), d.y * (a * cos(f)));
      }

      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vec2 xz = worldPos.xz;

        float amp = 0.35 + uBreeze * 0.45;
        vec3 tangent = vec3(1.0, 0.0, 0.0);
        vec3 binormal = vec3(0.0, 0.0, 1.0);
        vec3 disp = vec3(0.0);

        disp += gerstnerWave(xz, 0.038 * amp, 6.2, vec2(0.24, 0.97), uTime * 0.88, tangent, binormal);
        disp += gerstnerWave(xz, 0.026 * amp, 3.4, vec2(-0.35, 0.94), uTime * 1.12, tangent, binormal);
        disp += gerstnerWave(xz, 0.016 * amp, 1.8, vec2(0.48, 0.88), uTime * 1.45, tangent, binormal);

        worldPos.xyz += disp;
        vWorldPos = worldPos.xyz;
        vWaveDisp = disp.y;
        vNormal = normalize(cross(binormal, tangent));

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uBreeze;
      uniform float uClarity;
      uniform vec3 uSunDir;
      uniform vec3 uShallowTurquoise;
      uniform vec3 uMidTeal;
      uniform vec3 uDeepSapphire;
      uniform vec3 uSkyReflect;

      varying vec3 vWorldPos;
      varying vec3 vNormal;
      varying float vWaveDisp;

      float hash21(vec2 p) {
        p = fract(p * vec2(234.34, 435.345));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }

      float smoothNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash21(i + vec2(0.0, 0.0)), hash21(i + vec2(1.0, 0.0)), u.x),
          mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      // Organic sunlight caustics network
      float causticsPatt(vec2 uv, float t) {
        vec2 p = uv;
        float c = 0.0;
        c += sin(p.x * 2.8 + t * 1.2 + sin(p.y * 3.2 - t * 0.9));
        c += sin(p.y * 3.1 - t * 1.1 + sin(p.x * 2.9 + t * 1.0));
        c += sin((p.x + p.y) * 2.4 + t * 1.4);
        c = c / 3.0;
        return pow(clamp(c * 0.5 + 0.5, 0.0, 1.0), 3.5);
      }

      void main() {
        vec3 V = normalize(cameraPosition - vWorldPos);

        // High frequency surface ripples
        vec2 rUV = vec2(vWorldPos.x * 3.2 + uTime * 0.35, vWorldPos.z * 6.5 - uTime * 0.95);
        float r1 = smoothNoise(rUV) - 0.5;
        float r2 = smoothNoise(rUV * 2.2 + 3.1) - 0.5;
        vec3 N = normalize(vNormal + vec3((r1 + r2 * 0.5) * 0.12, 0.0, (r1 * 1.2 - r2 * 0.6) * 0.18));

        // Depth/distance from the coastal edge (z around 0.0 to -1.0)
        float shoreFactor = clamp((-vWorldPos.z) / 18.0, 0.0, 1.0);
        float shallowGrad = 1.0 - smoothstep(0.0, 0.45, shoreFactor);

        // Dancing sunlight caustics on shallow seabed
        float c1 = causticsPatt(vWorldPos.xz * 1.6, uTime * 1.2);
        float c2 = causticsPatt(vWorldPos.xz * 2.8 + 2.4, uTime * 1.6);
        float caustics = (c1 * 0.6 + c2 * 0.4) * uClarity;

        // Submerged seabed pebble tone visible through clear shallows
        float pebble = smoothNoise(vWorldPos.xz * 6.0) * 0.5 + smoothNoise(vWorldPos.xz * 14.0) * 0.5;
        vec3 pebbleCol = mix(vec3(0.82, 0.78, 0.65), vec3(0.55, 0.68, 0.62), pebble);

        // Composite water depth color gradient
        vec3 col = mix(uDeepSapphire, uMidTeal, 1.0 - smoothstep(0.2, 0.95, shoreFactor));
        col = mix(col, uShallowTurquoise, shallowGrad);

        // Blend seabed pebbles & caustics into crystal shallows
        col = mix(col, pebbleCol, shallowGrad * 0.36 * uClarity);
        col += vec3(0.55, 0.92, 0.88) * caustics * (0.35 + 0.65 * shallowGrad);

        // Subtle wave crest highlight
        float crest = clamp(r1 * 0.8 + 0.3, 0.0, 1.0);
        col += vec3(0.08, 0.18, 0.22) * crest * (1.0 - shallowGrad * 0.5);

        // Fresnel sky reflection
        float fresnel = pow(1.0 - max(dot(V, N), 0.0), 3.8);
        col = mix(col, uSkyReflect, fresnel * 0.38);

        // Crisp sunlight specular glint
        vec3 H = normalize(uSunDir + V);
        float specBroad = pow(max(dot(N, H), 0.0), 48.0) * 0.28;
        float specSharp = pow(max(dot(N, H), 0.0), 380.0) * 1.65;
        col += vec3(1.0, 0.98, 0.90) * (specBroad + specSharp);

        // Soft white froth along the shore wall
        float froth = smoothstep(0.08, 0.0, abs(shoreFactor - 0.02 + sin(vWorldPos.x * 2.5 + uTime * 1.8) * 0.012));
        col = mix(col, vec3(0.94, 0.98, 0.99), froth * 0.45);

        float alpha = mix(0.88, 0.98, smoothstep(0.0, 0.3, shoreFactor));
        gl_FragColor = vec4(col, alpha);
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
