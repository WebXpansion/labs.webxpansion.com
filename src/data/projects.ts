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
  /** First frame extracted from `video`, used as the mobile feed's <video
   *  poster> so the still shown before playback starts is pixel-identical
   *  to the video's own opening frame (no visible jump on autoplay). */
  poster?: string
}

/** Every video under public/videos/ has a matching first-frame still under
 *  public/images/posters/ (same basename, .webp) — generated once via
 *  ffmpeg. Used as a <video poster> for every clip (not just the card's
 *  main `video`) so nothing ever shows a black frame before it starts
 *  decoding, on mobile or desktop. */
export function posterFor(video: string): string {
  const name = video.split('/').pop()?.replace(/\.mp4$/i, '')
  return `/images/posters/${name}.webp`
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
  poster?: string
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
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/essencial-airsoft.webp',
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
    id: 111,
    title: 'Obrigado',
    category: 'Vitrine',
    year: '2025',
    tags: ['GSAP', 'HTML/CSS/JS'],
    // Réencodées en fast-start (voir public/videos/) — bitrate d'origine déjà bon.
    video: '/videos/obrigado.mp4',
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/obrigado.webp',
    url: 'https://obrigadorodizio.com/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/obrigado.webp',
    description:
      'Un site vitrine chaleureux et coloré qui retranscrit l’ambiance brésilienne d’Obrigado Rodizio tout en simplifiant la découverte du concept et la réservation en ligne.',
    videos: [
      '/videos/obrigado-projet-1.mp4',
      '/videos/obrigado-projet-2.mp4',
      '/videos/obrigado-projet-3.mp4',
    ],
  },
  {
    id: 9,
    title: 'MCM',
    category: 'E-commerce',
    year: '2026',
    tags: ['Expérience immersive 3D', 'Unreal Engine 5'],
    // Réencodées en CRF 26 (bitrate d'origine trop élevé) + fast-start (voir public/videos/).
    video: '/videos/mcm.mp4',
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/mcm.webp',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/MCM.webp',
    description:
      'Une expérience e-commerce en 3D permettant d’explorer librement un univers modélisé, d’interagir avec les produits et d’accéder rapidement aux informations essentielles ainsi qu’au parcours d’achat.',
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
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/franck-muller.webp',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/fM.webp',
    description:
      'Une mise en scène digitale en 3D qui révèle, au fil du scroll, le design, les finitions et l’identité singulière d’une montre Franck Muller.',
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
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/cartier.webp',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/Cartier.webp',
    description:
      'Un univers digital en 3D inspiré de la jungle, imaginé pour sublimer un parfum Cartier en révélant progressivement son flacon, ses inspirations et les ingrédients de sa fragrance.',
    videos: ['/videos/cartier-projet.mp4'],
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
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/acwin.webp',
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
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/trackmotard.webp',
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
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/call-of-duty-mw2.webp',
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
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/flo-business.webp',
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
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/crazymon.webp',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    // Fond flouté fourni par Julien pour ce projet.
    bgImage: '/images/crazymon-bg.webp',
    description:
      'Un site 3D gamifié qui recrée le frisson du pack opening grâce à des animations uniques selon la rareté des cartes et un système de quiz permettant de gagner des crédits et prolonger l’expérience.',
    // Vidéos supplémentaires affichées dans l'overlay du projet.
    videos: ['/videos/crazymon-projet-1.mp4', '/videos/crazymon-projet-2.mp4'],
    // Captures d'écran complémentaires (page Défis, collection de cartes,
    // détail d'une carte) affichées après les vidéos dans l'overlay.
    images: ['/images/crazymon-defis.webp', '/images/crazymon-collection.webp', '/images/crazymon-carte-detail.webp'],
  },

  {
    id: 0,
    title: 'Capture Engine',
    category: 'Vitrine',
    year: '2026',
    tags: ['GSAP', 'HTML/CSS'],
    // Réencodées en 720p/H.264/MP4 avec fast-start (voir public/videos/).
    video: '/videos/capture-engine.mp4',
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/capture-engine.webp',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/catpure.webp',
    description:
      'Une expérience web immersive et scénarisée qui dévoile, étape par étape, la transformation d’une série de photographies en un modèle 3D réaliste et interactif grâce au Gaussian Splatting.',
    videos: ['/videos/capture-engine-projet.mp4'],
  },

 
  {
    id: 15,
    title: 'Logitech',
    category: 'Configurateur 3D',
    year: '2026',
    tags: ['Expérience immersive', 'Unreal Engine 5'],
    // Réencodées en fast-start (voir public/videos/) — projet recompressé en CRF 26 (bitrate trop élevé).
    video: '/videos/logitech.mp4',
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/logitech.webp',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/logitech.webp',
    description:
      'Un configurateur 3D en temps réel, conçu avec TheNewFace sous Unreal Engine 5, permettant de découvrir et personnaliser un setup Sim Racing Logitech dans un environnement visuel haut de gamme.',
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
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/ldlc.webp',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/LDLC.webp',
    description:
      'Un configurateur 3D interactif permettant de composer son PC en temps réel, avec visualisation instantanée du rendu, du prix, des performances et de la compatibilité des composants.',
    videos: ['/videos/ldlc-projet-1.mp4', '/videos/ldlc-projet-2.mp4'],
  },
  {
    id: 12,
    title: 'Fig Battle',
    category: 'Plateforme de jeu',
    year: '2026',
    // Réencodées en fast-start (voir public/videos/) — bitrate d'origine déjà bon.
    video: '/videos/fig-battle.mp4',
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/fig-battle.webp',
    url: 'https://fig-battle.vercel.app/fr',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/Figbattle.webp',
    description:
      'Une plateforme de battle créative dédiée aux UI/UX designers, où chacun relève un thème aléatoire, conçoit une maquette, vote pour les meilleures créations et tente de remporter des récompenses.',
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
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/turismo.webp',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/turismo.webp',
    description:
      'Un showroom 3D interactif permettant d’explorer chaque véhicule à 360°, d’en découvrir les caractéristiques en temps réel et de faciliter la réservation.',
    videos: ['/videos/turismo-projet.mp4'],
  },
  
  {
    id: 2,
    title: 'Gryphen',
    category: 'Vitrine',
    year: '2026',
    tags: ['GSAP', 'HTML/CSS/JS'],
    // Réencodées en fast-start (voir public/videos/) — home en remux, projets en CRF 26.
    video: '/videos/gryphen.mp4',
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/gryphen.webp',
    // Pas de lien externe pour ce projet — pas de flèche affichée dans l'overlay.
    url: '',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/grypen.webp',
    description:
      'Une expérience web immersive pensée pour valoriser la nouvelle génération d’aéronefs légers de Gryphen, en dévoilant progressivement ses modèles, ses technologies et son savoir-faire au fil du scroll.',
    videos: ['/videos/gryphen-projet-1.mp4', '/videos/gryphen-projet-2.mp4'],
  },
  {
    id: 4,
    title: 'Du coté de chez swan',
    category: 'Vitrine',
    year: '2026',
    // Réencodées en CRF 26 (bitrate d'origine trop élevé) + fast-start (voir public/videos/).
    video: '/videos/du-cote-de-chez-swan.mp4',
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/du-cote-de-chez-swan.webp',
    url: 'https://xn--ducotdechezswann-fqb.fr/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/frame_77.webp',
    description:
      'Un site vitrine élégant et immersif conçu pour valoriser le domaine, mettre en scène ses espaces de réception et simplifier la réservation pour tous types d’événements.',
    videos: [
      '/videos/du-cote-de-chez-swan-projet-1.mp4',
      '/videos/du-cote-de-chez-swan-projet-2.mp4',
      '/videos/du-cote-de-chez-swan-projet-3.mp4',
    ],
  },
  {
    id: 13,
    title: 'France Repousse',
    category: '3D',
    year: '2026',
    tags: ['Expérience immersive'],
    // Réencodée en 720p/H.264/MP4 avec fast-start (voir public/videos/).
    video: '/videos/france-repousse.mp4',
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/france-repousse.webp',
    url: 'https://france-repousse.vercel.app/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/france-home.webp',
    description:
      'Une forêt 3D évolutive où chaque contribution permet de planter un arbre, soutenir les pompiers et faire progressivement renaître tout un écosystème.',
    // Vidéos supplémentaires affichées dans l'overlay du projet.
    videos: [
      '/videos/france-repousse-projet-1.mp4',
      '/videos/france-repousse-projet-2.mp4',
      '/videos/france-repousse-projet-3.mp4',
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
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/hangar-3d.webp',
    url: 'https://hangar-3d.vercel.app/fr',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/hangar3D.webp',
    description:
      'Un configurateur 3D de hangar métallique permettant de personnaliser la structure, les dimensions et les équipements tout en visualisant instantanément le rendu, la compatibilité et le prix estimatif.',
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
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/hangar-metallique.webp',
    url: 'https://hangarmetal.fr/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/hangar3D.webp',
    description:
      'Un site vitrine dynamique qui présente le savoir-faire de l’entreprise à travers des animations au scroll révélant progressivement les détails et la conception de ses hangars métalliques.',
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
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/falco-racing-3d.webp',
    url: 'https://falco-racing.com/product/3d-jantes-supermotard-falco-100-personnalisables-2',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/falco3D.webp',
    description:
      'Un configurateur 3D interactif permettant de personnaliser des jantes en temps réel, d’en explorer les finitions et caractéristiques, et de visualiser instantanément le rendu final avant commande.',
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
    // Première frame de la vidéo, extraite via ffmpeg — évite tout saut visuel au démarrage de la lecture sur mobile.
    poster: '/images/posters/falco-racing.webp',
    url: 'https://falco-racing.com/',
    bgImage: 'https://webxpansion.com/wp-content/uploads/2026/08/falco.webp',
    description:
      'Une boutique e-commerce pensée pour valoriser plus de 1 500 références de jantes et accessoires, avec un parcours de personnalisation clair, rapide et centré sur la compatibilité produit.',
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
  poster: p.poster,
}))
