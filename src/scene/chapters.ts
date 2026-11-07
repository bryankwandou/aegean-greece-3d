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
    cameraPos: [0.1, 7.65, 5.4],
    lookAt: [0.25, 1.45, -7.8],
    fov: 38,
  },
  {
    id: "little-harbor",
    indexLabel: "02",
    dockLabel: "Little harbor",
    kicker: "02 / THE LITTLE HARBOR",
    titleLines: ["Nothing to do.", "Nowhere to hurry."],
    subtitle: "A blue table. A boat on a quiet tide.",
    cameraPos: [0.35, 1.96, 2.45],
    lookAt: [-0.15, 1.75, -8.5],
    fov: 40,
  },
  {
    id: "linen-terrace",
    indexLabel: "03",
    dockLabel: "Linen terrace",
    kicker: "03 / LINEN & SEA AIR",
    titleLines: ["Made of light.", "Moved by the breeze."],
    subtitle: "Cool linen, olive leaves, the softest afternoon.",
    cameraPos: [-11.65, 2.22, 2.65],
    lookAt: [-12.25, 1.98, -7.5],
    fov: 39,
  },
  {
    id: "pastel-shutters",
    indexLabel: "04",
    dockLabel: "Pastel shutters",
    kicker: "04 / THE PASTEL SHUTTERS",
    titleLines: ["The color of", "a slow afternoon."],
    subtitle: "Weathered paint. A lemon tree overhead.",
    cameraPos: [-0.55, 2.04, 2.15],
    lookAt: [-1.05, 1.95, -8.2],
    fov: 39,
  },
  {
    id: "bougainvillea-lane",
    indexLabel: "05",
    dockLabel: "Bougainvillea lane",
    kicker: "05 / THE BOUGAINVILLEA LANE",
    titleLines: ["Follow the shade.", "Find the sea."],
    subtitle: "Whitewashed steps, pink flowers, an open blue door.",
    cameraPos: [-5.6, 2.35, 8.2],
    lookAt: [-5.6, 2.15, -8.0],
    fov: 38,
  },
];

export const OVERVIEW_CAMERA = {
  cameraPos: [-6.5, 10.8, -21.5] as [number, number, number],
  lookAt: [-3.2, 2.4, 2.5] as [number, number, number],
  fov: 40,
};
