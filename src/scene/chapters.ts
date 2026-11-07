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
    cameraPos: [0.05, 6.75, 4.45],
    lookAt: [0.15, 1.85, -6.5],
    fov: 42,
  },
  {
    id: "little-harbor",
    indexLabel: "02",
    dockLabel: "Little harbor",
    kicker: "02 / THE LITTLE HARBOR",
    titleLines: ["Nothing to do.", "Nowhere to hurry."],
    subtitle: "A blue table. A boat on a quiet tide.",
    cameraPos: [0.18, 1.86, 3.78],
    lookAt: [0.05, 1.68, -7.5],
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
    cameraPos: [-0.92, 1.88, 3.42],
    lookAt: [-1.22, 1.78, -6.8],
    fov: 42,
  },
  {
    id: "bougainvillea-lane",
    indexLabel: "05",
    dockLabel: "Bougainvillea lane",
    kicker: "05 / THE BOUGAINVILLEA LANE",
    titleLines: ["Follow the shade.", "Find the sea."],
    subtitle: "Whitewashed steps, pink flowers, an open blue door.",
    cameraPos: [-5.6, 2.28, 7.95],
    lookAt: [-5.6, 2.08, -8.0],
    fov: 38,
  },
];

export const OVERVIEW_CAMERA = {
  cameraPos: [-6.2, 9.8, -21.0] as [number, number, number],
  lookAt: [-3.4, 2.2, 2.5] as [number, number, number],
  fov: 40,
};
