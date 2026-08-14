# Portfolio 3D — clone inspiré de jesperlandberg.com

## Stack
- Vite + React + TypeScript
- react-three-fiber (Three.js) + drei
- Zustand (état du carrousel / drag)
- framer-motion (overlay projet)
- react-router-dom (routing)

## Démarrer
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Structure clé
- `src/components/Scene/` — la scène 3D : anneau de cartes courbées (CardRing/Card),
  sol quadrillé (GridFloor), gestion du drag horizontal + scroll infini (DragController),
  shader de distorsion "drapeau" au drag (CardMaterial.ts).
- `src/store/useCarousel.ts` — état global de rotation/vélocité/inertie.
- `src/components/Overlay/ProjectOverlay.tsx` — la card blanche animée qui s'ouvre au clic.
- `src/pages/Full.tsx` — vue grille classique (route `/full`).
- `src/data/projects.ts` — **remplace ce fichier par tes vrais projets** (titres, descriptions,
  tags, couleurs). Les textures sont générées par canvas en placeholder — remplace
  `getPlaceholderTexture` par de vraies images/textures quand tu as le contenu final.

## Interaction
- Glisser horizontalement (souris ou tactile) pour faire tourner le carrousel — boucle infinie.
- La molette/trackpad fonctionne aussi (deltaX ou deltaY).
- Cliquer une carte ouvre le détail du projet en overlay.
- Lien "FULL" en bas à gauche pour la vue grille.
