export interface Project {
  id: string
  slug: string
  title: string
  category: string
  year: string
  description: string
  /** Looping muted video used as the card's texture in the 3D slider. */
  video: string
  /** Real, already-live project page — clicking the card navigates here. */
  url: string
  /** Blurred full-bleed body background shown behind the slider while this
   *  project is active (cross-fades in, like the source theme). */
  bgImage: string
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

interface RawProject {
  id: number
  title: string
  category: string
  year: string
  video: string
  url: string
  bgImage: string
  description: string
}

const RAW_PROJECTS: RawProject[] = [
  {
    id: 13,
    title: 'France Repousse',
    category: '3D',
    year: '2026',
    video: 'https://webxpansion.com/wp-content/uploads/2026/08/france.mov',
    url: 'https://webxpansion.com/france-repousse/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/france-home.webp',
    description: 'France repousse',
  },
  {
    id: 0,
    title: 'Capture Engine',
    category: 'Vitrine',
    year: '2026',
    video: 'https://webxpansion.com/wp-content/uploads/2026/07/home-capture.mov',
    url: 'https://webxpansion.com/capture-engine/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/catpure.webp',
    description:
      "Une série éditoriale explorant la matière et la lumière, pensée pour le mouvement autant que pour l'image fixe.",
  },
  {
    id: 2,
    title: 'Gryphen',
    category: 'Vitrine',
    year: '2026',
    video: 'https://webxpansion.com/wp-content/uploads/2026/07/home-gryphen.mov',
    url: 'https://webxpansion.com/gryphen-3/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/grypen.webp',
    description: 'Court-métrage de marque tourné en 35mm, monté pour une diffusion silencieuse en boucle.',
  },
  {
    id: 4,
    title: 'Du coté de chez swan',
    category: 'Vitrine',
    year: '2026',
    video: 'https://webxpansion.com/wp-content/uploads/2026/08/ducote-home.mov',
    url: 'https://webxpansion.com/ducotedechezswann/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/frame_77.webp',
    description: 'Court-métrage de marque tourné en 35mm, monté pour une diffusion silencieuse en boucle.',
  },
  {
    id: 15,
    title: 'Logitech',
    category: '3D',
    year: '2026',
    video: 'https://webxpansion.com/wp-content/uploads/2026/08/LOGITECH-home.mov',
    url: 'https://webxpansion.com/logitech/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/logitech.webp',
    description: 'France repousse',
  },
  {
    id: 7,
    title: 'LDLC',
    category: 'Configurateur',
    year: '2026',
    video: 'https://webxpansion.com/wp-content/uploads/2025/07/video5.mov',
    url: 'https://webxpansion.com/ldlc/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/LDLC.webp',
    description:
      "Une série éditoriale explorant la matière et la lumière, pensée pour le mouvement autant que pour l'image fixe.",
  },
  {
    id: 12,
    title: 'Fig Battle',
    category: 'Jeu',
    year: '2026',
    video: 'https://webxpansion.com/wp-content/uploads/2026/08/fig-home.mov',
    url: 'https://webxpansion.com/fig-battle/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/Figbattle.webp',
    description:
      "Une série éditoriale explorant la matière et la lumière, pensée pour le mouvement autant que pour l'image fixe.",
  },
  {
    id: 8,
    title: 'Turismo',
    category: 'Vitrine',
    year: '2026',
    video: 'https://webxpansion.com/wp-content/uploads/2026/07/turismo-home.mov',
    url: 'https://webxpansion.com/turismo/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/turismo.webp',
    description:
      "Une série éditoriale explorant la matière et la lumière, pensée pour le mouvement autant que pour l'image fixe.",
  },
  {
    id: 9,
    title: 'MCM',
    category: '3D',
    year: '2026',
    video: 'https://webxpansion.com/wp-content/uploads/2026/07/MCM-home.mov',
    url: 'https://webxpansion.com/mcm-2',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/MCM.webp',
    description:
      "Une série éditoriale explorant la matière et la lumière, pensée pour le mouvement autant que pour l'image fixe.",
  },
  {
    id: 11,
    title: 'Franck Muller',
    category: '3D',
    year: '2026',
    video: 'https://webxpansion.com/wp-content/uploads/2026/07/home-FM.mov',
    url: 'https://webxpansion.com/franck-muller/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/fM.webp',
    description: 'Portraits en lumière naturelle, campagne capsule pour une marque de prêt-à-porter.',
  },
  {
    id: 10,
    title: 'Cartier',
    category: '3D',
    year: '2025',
    video: 'https://webxpansion.com/wp-content/uploads/2026/07/cartier-home.mov',
    url: 'https://webxpansion.com/cartier/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/Cartier.webp',
    description:
      "Une série éditoriale explorant la matière et la lumière, pensée pour le mouvement autant que pour l'image fixe.",
  },
  {
    id: 111,
    title: 'Obrigado',
    category: 'Vitrine',
    year: '2025',
    video: 'https://webxpansion.com/wp-content/uploads/2026/07/obrigado.mov',
    url: 'https://webxpansion.com/obrigado-rodizio/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/obrigado.webp',
    description:
      "Une série éditoriale explorant la matière et la lumière, pensée pour le mouvement autant que pour l'image fixe.",
  },
  {
    id: 1,
    title: 'Hangar 3D',
    category: '3D',
    year: '2026',
    video: 'https://webxpansion.com/wp-content/uploads/2026/07/home-hangar3D.mov',
    url: 'https://webxpansion.com/hangar-configurateur/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/hangar3D.webp',
    description: "Direction artistique complète pour un lancement de collection, du moodboard jusqu'au tournage final.",
  },
  {
    id: 41,
    title: 'Falco 3D',
    category: 'Configurateur',
    year: '2026',
    video: 'https://webxpansion.com/wp-content/uploads/2026/07/home-falco-3D.mov',
    url: 'https://webxpansion.com/falco-3d-2/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/falco3D.webp',
    description: 'Reportage editorial sur le temps long, entre calme et texture, pour un numéro spécial.',
  },
  {
    id: 5,
    title: 'Falco Racing',
    category: 'E-commerce',
    year: '2026',
    video: 'https://webxpansion.com/wp-content/uploads/2026/07/home-falco.mov',
    url: 'https://webxpansion.com/falco-racing/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/falco.webp',
    description: 'Univers visuel complet pensé pour une campagne digitale multi-format.',
  },
]

export const projects: Project[] = RAW_PROJECTS.map((p) => ({
  id: String(p.id),
  slug: slugify(p.title),
  title: p.title,
  category: p.category,
  year: p.year,
  description: p.description,
  video: p.video,
  url: p.url,
  bgImage: p.bgImage,
}))
