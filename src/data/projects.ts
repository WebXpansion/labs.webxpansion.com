export interface Project {
  id: string
  slug: string
  title: string
  category: string
  year: string
  /** Optional extra pills shown in the overlay alongside category/year
   *  (e.g. "Expérience immersive", or tech tags like "GSAP"). */
  tags?: string[]
  description: string
  /** Looping muted video used as the card's texture in the 3D slider. */
  video: string
  /** Real, already-live project page — clicking the card navigates here. */
  url: string
  /** Blurred full-bleed body background shown behind the slider while this
   *  project is active (cross-fades in, like the source theme). */
  bgImage: string
  /** Extra looping clips shown as a gallery underneath the main video when
   *  this project's overlay is open (beyond the single card `video`). */
  videos?: string[]
  /** Extra static screenshots shown in the same overlay gallery, after any
   *  `videos` — for projects better shown with a few key screens than clips. */
  images?: string[]
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
  tags?: string[]
  video: string
  url: string
  bgImage: string
  description: string
  videos?: string[]
  images?: string[]
}

const RAW_PROJECTS: RawProject[] = [
  {
    id: 18,
    title: 'Essencial Airsoft',
    // Catégorie non précisée par Julien — déduite du contenu (refonte
    // e-commerce de répliques airsoft) ; à corriger si besoin.
    category: 'E-commerce',
    year: '2024',
    tags: ['Maquette Figma'],
    // Vidéo courte (boucle) utilisée comme texture de la carte dans le slider.
    video: '/videos/essencial-airsoft.mp4',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    // Capture de la page produit en local, faute d'image hébergée sur
    // webxpansion.com pour ce projet.
    bgImage: '/images/essencial-airsoft-produit.webp',
    description:
      'Un site animé en semi-3D, pensé comme une refonte d’Essential Airsoft, pour mettre en valeur les caractéristiques des répliques et moderniser la découverte des produits.',
    // Vidéo supplémentaire affichée dans l'overlay du projet.
    videos: ['/videos/essencial-airsoft-projet.mp4'],
    // Captures d'écran complémentaires (page produit, upsell, description,
    // confirmation de commande, colis surprise).
    images: [
      '/images/essencial-airsoft-produit.webp',
      '/images/essencial-airsoft-upsell.webp',
      '/images/essencial-airsoft-description.webp',
      '/images/essencial-airsoft-confirmation.webp',
      '/images/essencial-airsoft-colis.webp',
    ],
  },
  {
    id: 17,
    title: 'AcWin',
    // Catégorie non précisée par Julien — déduite du contenu (stratégies
    // d'investissement, graphiques financiers) ; à corriger si besoin.
    category: 'Finance',
    year: '2024',
    tags: ['Conception', 'Développement', 'Animé'],
    // Vidéo courte (boucle) utilisée comme texture de la carte dans le slider.
    video: '/videos/acwin.mp4',
    // Pas de lien fourni par Julien pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    // Frame extraite de la vidéo d'accueil en local, faute d'image hébergée
    // sur webxpansion.com pour ce projet.
    bgImage: '/images/acwin-bg.webp',
    description:
      'Un site clair et dynamique qui présente les stratégies d’investissement d’AC WIN à travers des contenus accessibles et des graphiques interactifs pour faciliter la prise de décision.',
    // Vidéos supplémentaires affichées dans l'overlay du projet.
    // Note : un 4e fichier (ACWINproject3.mp4) figurait dans le message mais
    // ne s'est pas uploadé correctement — seuls les 2 reçus sont inclus ici.
    videos: ['/videos/acwin-projet-1.mp4', '/videos/acwin-projet-2.mp4'],
  },
  {
    id: 16,
    title: 'Trackmotard',
    // Catégorie non précisée par Julien — déduite du contenu (vente de
    // packs + concours pour gagner une moto) ; à corriger si besoin.
    category: 'E-commerce',
    year: '2024',
    tags: ['Conception', 'Développement', 'Animé'],
    // Vidéo courte (boucle) utilisée comme texture de la carte dans le slider.
    video: '/videos/trackmotard.mp4',
    // Pas de lien fourni par Julien pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    // Capture de la page moto en local, faute d'image hébergée sur
    // webxpansion.com pour ce projet.
    bgImage: '/images/trackmotard-moto.webp',
    description:
      'Un site interactif au design sombre et percutant, conçu pour valoriser deux packs et engager les utilisateurs autour d’un concours permettant de remporter une moto.',
    // Vidéo supplémentaire affichée dans l'overlay du projet.
    videos: ['/videos/trackmotard-projet.mp4'],
    // Captures d'écran complémentaires (page moto, page pack starter).
    images: ['/images/trackmotard-moto.webp', '/images/trackmotard-starter-pack.webp'],
  },
  {
    id: 3,
    title: 'Call of Duty MW2',
    category: 'UI/UX',
    // Année non précisée par Julien — alignée sur les ajouts les plus
    // récents (2026) ; à corriger si le projet date d'avant.
    year: '2026',
    tags: ['Concept', 'Maquette Figma', 'Jeux vidéo'],
    // Vidéo courte (boucle) utilisée comme texture de la carte dans le slider.
    video: '/videos/call-of-duty-mw2.mp4',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    // Capture du menu principal, en local faute d'image hébergée sur
    // webxpansion.com pour ce projet.
    bgImage: '/images/cod-mw2-hub.webp',
    description:
      'Une interface de jeu modernisée qui améliore la navigation, optimise les menus et renforce l’impact visuel pour offrir une prise en main plus fluide et intuitive.',
    // Vidéo supplémentaire affichée dans l'overlay du projet.
    videos: ['/videos/call-of-duty-mw2-projet.mp4'],
    // Captures d'écran complémentaires des différents menus retravaillés.
    images: [
      '/images/cod-mw2-hub.webp',
      '/images/cod-mw2-modes-de-jeu.webp',
      '/images/cod-mw2-entrainements.webp',
      '/images/cod-mw2-defis-du-jour.webp',
    ],
  },
  {
    id: 6,
    title: 'Flo Business',
    category: 'Vitrine',
    // Année non précisée par Julien — alignée sur les ajouts les plus
    // récents (2026) ; à corriger si le projet date d'avant.
    year: '2026',
    tags: ['GSAP', 'HTML/CSS/JS', 'Conception', 'Développement'],
    // Vidéo courte (boucle) utilisée comme texture de la carte dans le slider.
    video: '/videos/flo-business.mp4',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    // Frame extraite de la vidéo projet en local, faute d'image hébergée
    // sur webxpansion.com pour ce projet.
    bgImage: '/images/flo-business-bg.webp',
    description:
      'Une landing page animée à l’identité visuelle énergique, portée par un loader interactif et des effets au scroll pensés pour renforcer l’impact de la marque sans compromettre les performances.',
    // Vidéo supplémentaire affichée dans l'overlay du projet.
    videos: ['/videos/flo-business-projet.mp4'],
  },
  {
    id: 14,
    title: 'Crazymon',
    category: 'Plateforme de jeu',
    year: '2026',
    // Vidéo courte (boucle) utilisée comme texture de la carte dans le slider.
    video: '/videos/crazymon.mp4',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    // Capture de l'app elle-même (page Défis) en fond flouté, en local
    // faute d'une image hébergée sur webxpansion.com pour ce projet.
    bgImage: '/images/crazymon-defis.webp',
    description:
      'Un site 3D gamifié qui recrée le frisson du pack opening grâce à des animations uniques selon la rareté des cartes et un système de quiz permettant de gagner des crédits et prolonger l’expérience.',
    // Vidéos supplémentaires affichées dans l'overlay du projet.
    videos: ['/videos/crazymon-projet-1.mp4', '/videos/crazymon-projet-2.mp4'],
    // Captures d'écran complémentaires (page Défis, collection de cartes,
    // détail d'une carte) affichées après les vidéos dans l'overlay.
    images: ['/images/crazymon-defis.webp', '/images/crazymon-collection.webp', '/images/crazymon-carte-detail.webp'],
  },
  {
    id: 13,
    title: 'France Repousse',
    category: '3D',
    year: '2026',
    tags: ['Expérience immersive'],
    // Réencodée en 720p/H.264/MP4 avec fast-start (voir public/videos/).
    video: '/videos/france-repousse.mp4',
    url: 'https://france-repousse.vercel.app/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/france-home.webp',
    description: '',
    // Vidéos supplémentaires affichées dans l'overlay du projet.
    videos: [
      '/videos/france-repousse-projet-1.mp4',
      '/videos/france-repousse-projet-2.mp4',
      '/videos/france-repousse-projet-3.mp4',
    ],
  },
  {
    id: 0,
    title: 'Capture Engine',
    category: 'Vitrine',
    year: '2026',
    tags: ['GSAP', 'HTML/CSS'],
    // Réencodées en 720p/H.264/MP4 avec fast-start (voir public/videos/).
    video: '/videos/capture-engine.mp4',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/catpure.webp',
    description: '',
    videos: ['/videos/capture-engine-projet.mp4'],
  },
  {
    id: 2,
    title: 'Gryphen',
    category: 'Vitrine',
    year: '2026',
    tags: ['GSAP', 'HTML/CSS/JS'],
    // Réencodées en fast-start (voir public/videos/) — home en remux, projets en CRF 26.
    video: '/videos/gryphen.mp4',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/grypen.webp',
    description: '',
    videos: ['/videos/gryphen-projet-1.mp4', '/videos/gryphen-projet-2.mp4'],
  },
  {
    id: 4,
    title: 'Du coté de chez swan',
    category: 'Vitrine',
    year: '2026',
    // Réencodées en CRF 26 (bitrate d'origine trop élevé) + fast-start (voir public/videos/).
    video: '/videos/du-cote-de-chez-swan.mp4',
    url: 'https://xn--ducotdechezswann-fqb.fr/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/frame_77.webp',
    description: '',
    videos: [
      '/videos/du-cote-de-chez-swan-projet-1.mp4',
      '/videos/du-cote-de-chez-swan-projet-2.mp4',
      '/videos/du-cote-de-chez-swan-projet-3.mp4',
    ],
  },
  {
    id: 15,
    title: 'Logitech',
    category: 'Configurateur 3D',
    year: '2026',
    tags: ['Expérience immersive', 'Unreal Engine 5'],
    // Réencodées en fast-start (voir public/videos/) — projet recompressé en CRF 26 (bitrate trop élevé).
    video: '/videos/logitech.mp4',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/logitech.webp',
    description: '',
    videos: ['/videos/logitech-projet.mp4'],
  },
  {
    id: 7,
    title: 'LDLC',
    category: 'Configurateur 3D',
    year: '2026',
    tags: ['Three.js'],
    // Réencodées en fast-start (voir public/videos/) — projet 1 recompressé en CRF 26 (poids trop élevé).
    video: '/videos/ldlc.mp4',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/LDLC.webp',
    description: '',
    videos: ['/videos/ldlc-projet-1.mp4', '/videos/ldlc-projet-2.mp4'],
  },
  {
    id: 12,
    title: 'Fig Battle',
    category: 'Plateforme de jeu',
    year: '2026',
    // Réencodées en fast-start (voir public/videos/) — bitrate d'origine déjà bon.
    video: '/videos/fig-battle.mp4',
    url: 'https://fig-battle.vercel.app/fr',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/Figbattle.webp',
    description: '',
    videos: [
      '/videos/fig-battle-projet-1.mp4',
      '/videos/fig-battle-projet-2.mp4',
      '/videos/fig-battle-projet-3.mp4',
      '/videos/fig-battle-projet-4.mp4',
    ],
  },
  {
    id: 8,
    title: 'Turismo',
    category: 'Showroom 3D',
    year: '2026',
    tags: ['Three.js'],
    // Réencodées en fast-start (voir public/videos/) — bitrate d'origine déjà bon.
    video: '/videos/turismo.mp4',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/turismo.webp',
    description: '',
    videos: ['/videos/turismo-projet.mp4'],
  },
  {
    id: 9,
    title: 'MCM',
    category: 'E-commerce',
    year: '2026',
    tags: ['Expérience immersive 3D', 'Unreal Engine 5'],
    // Réencodées en CRF 26 (bitrate d'origine trop élevé) + fast-start (voir public/videos/).
    video: '/videos/mcm.mp4',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/MCM.webp',
    description: '',
    videos: ['/videos/mcm-projet-1.mp4', '/videos/mcm-projet-2.mp4'],
  },
  {
    id: 11,
    title: 'Franck Muller',
    category: '3D',
    year: '2026',
    tags: ['GSAP'],
    // Réencodées en fast-start (voir public/videos/) — bitrate d'origine déjà bon.
    video: '/videos/franck-muller.mp4',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/fM.webp',
    description: '',
    videos: ['/videos/franck-muller-projet.mp4'],
  },
  {
    id: 10,
    title: 'Cartier',
    category: '3D',
    year: '2025',
    tags: ['Expérience immersive', 'Unreal Engine 5'],
    // Réencodées en fast-start (voir public/videos/) — bitrate d'origine déjà bon.
    video: '/videos/cartier.mp4',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/Cartier.webp',
    description: '',
    videos: ['/videos/cartier-projet.mp4'],
  },
  {
    id: 111,
    title: 'Obrigado',
    category: 'Vitrine',
    year: '2025',
    tags: ['GSAP', 'HTML/CSS/JS'],
    // Réencodées en fast-start (voir public/videos/) — bitrate d'origine déjà bon.
    video: '/videos/obrigado.mp4',
    url: 'https://obrigadorodizio.com/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/obrigado.webp',
    description: '',
    videos: [
      '/videos/obrigado-projet-1.mp4',
      '/videos/obrigado-projet-2.mp4',
      '/videos/obrigado-projet-3.mp4',
    ],
  },
  {
    id: 1,
    title: 'Hangar 3D',
    category: 'Configurateur 3D',
    year: '2025',
    tags: ['Three.js'],
    // Réencodées en fast-start (voir public/videos/) — projet 1 recompressé en CRF 26 (bitrate trop élevé).
    video: '/videos/hangar-3d.mp4',
    url: 'https://hangar-3d.vercel.app/fr',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/hangar3D.webp',
    description: '',
    videos: ['/videos/hangar-3d-projet-1.mp4', '/videos/hangar-3d-projet-2.mp4'],
  },
  {
    id: 42,
    title: 'Hangar Métallique',
    category: '3D',
    year: '2025',
    tags: ['GSAP', 'HTML/CSS/JS'],
    // Réencodées en fast-start (voir public/videos/) — bitrate d'origine déjà bon.
    video: '/videos/hangar-metallique.mp4',
    url: 'https://hangarmetal.fr/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/hangar3D.webp',
    description: '',
    videos: ['/videos/hangar-metallique-projet.mp4'],
  },
  {
    id: 41,
    title: 'Falco Racing 3D',
    category: 'Configurateur 3D',
    year: '2026',
    tags: ['Three.js'],
    // Réencodées en fast-start (voir public/videos/) — bitrate d'origine déjà bon.
    video: '/videos/falco-racing-3d.mp4',
    url: 'https://falco-racing.com/product/3d-jantes-supermotard-falco-100-personnalisables-2',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/falco3D.webp',
    description: '',
    videos: ['/videos/falco-racing-3d-projet.mp4'],
  },
  {
    id: 5,
    title: 'Falco Racing',
    category: 'E-commerce',
    year: '2025',
    tags: ['HTML/CSS/JS'],
    // Réencodées en fast-start (voir public/videos/) — bitrate d'origine déjà bon.
    video: '/videos/falco-racing.mp4',
    url: 'https://falco-racing.com/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/falco.webp',
    description: '',
    videos: ['/videos/falco-racing-projet.mp4'],
  },
]

export const projects: Project[] = RAW_PROJECTS.map((p) => ({
  id: String(p.id),
  slug: slugify(p.title),
  title: p.title,
  category: p.category,
  year: p.year,
  tags: p.tags,
  description: p.description,
  video: p.video,
  url: p.url,
  bgImage: p.bgImage,
  videos: p.videos,
  images: p.images,
}))
