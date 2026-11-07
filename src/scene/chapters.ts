export interface ChapterSpec {
  id: string;
  indexLabel: string;
  dockLabel: string;
  kicker: string;
  titleLines: [string, string];
  subtitle: string;
  cameraPos: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
}

export const CHAPTERS: ChapterSpec[] = [
  {
    id: "lemon-courtyard",
    indexLabel: "01",
    dockLabel: "Lemon courtyard",
    kicker: "01 / UNDER THE LEMON TREE",
    titleLines: ["A little closer", "to the sea."],
    subtitle: "Salt in the air. Sun on the stone.",
    cameraPos: [0.0, 6.2, 5.0],
    lookAt: [0.0, 1.1, -7.0],
    fov: 42,
  },
  {
    id: "little-harbor",
    indexLabel: "02",
    dockLabel: "Little harbor",
    kicker: "02 / THE LITTLE HARBOR",
    titleLines: ["Nothing to do.", "Nowhere to hurry."],
    subtitle: "A blue table. A boat on a quiet tide.",
    cameraPos: [0.22, 1.88, 3.85],
    lookAt: [-0.05, 1.72, -6.8],
    fov: 43,
  },
  {
    id: "linen-terrace",
    indexLabel: "03",
    dockLabel: "Linen terrace",
    kicker: "03 / LINEN & SEA AIR",
    titleLines: ["Made of light.", "Moved by the breeze."],
    subtitle: "Cool linen, olive leaves, the softest afternoon.",
    cameraPos: [-11.65, 2.15, 2.85],
    lookAt: [-12.25, 1.72, -7.5],
    fov: 41,
  },
  {
    id: "pastel-shutters",
    indexLabel: "04",
    dockLabel: "Pastel shutters",
    kicker: "04 / THE PASTEL SHUTTERS",
    titleLines: ["The color of", "a slow afternoon."],
    subtitle: "Weathered paint. A lemon tree overhead.",
    cameraPos: [-0.92, 1.92, 3.35],
    lookAt: [-1.22, 1.82, -6.8],
    fov: 42,
  },
  {
    id: "bougainvillea-lane",
    indexLabel: "05",
    dockLabel: "Bougainvillea lane",
    kicker: "05 / THE BOUGAINVILLEA LANE",
    titleLines: ["Follow the shade.", "Find the sea."],
    subtitle: "Whitewashed steps, pink flowers, an open blue door.",
    cameraPos: [-5.6, 2.25, 6.2],
    lookAt: [-5.6, 2.05, -8.0],
    fov: 39,
  },
];

export const OVERVIEW_CAMERA = {
  cameraPos: [-2.8, 8.8, -19.5] as [number, number, number],
  lookAt: [-1.8, 2.2, 2.5] as [number, number, number],
  fov: 42,
};
