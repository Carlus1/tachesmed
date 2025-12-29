Charte visuelle — Clair & Professionnel

But
----
Documentation courte expliquant la nouvelle charte (tokens CSS), comment changer les couleurs, comment lancer les tests et comment activer le thème sombre.

Fichiers modifiés
-----------------
- `src/index.css`  : ajout des tokens CSS (`--color-...`) et des overrides `.dark`, helpers `.bg-surface`, `.bg-background`, etc.
- `tailwind.config.js`: configuration pour utiliser les variables CSS (alpha-friendly) via `rgb(var(--...)/<alpha>)` exposées en `theme.extend.colors` (primary, accent, background, surface, muted, border).
- `src/components/ModernHeader.tsx`: acceptation de `onSignOut`, utilisation `dark` prop (toggle du thème).
- `src/components/ModernSidebar.tsx`, `ModernLayout.tsx`, `DashboardGrid.tsx`, `TaskList.tsx`: migration des classes couleur (ex. `bg-blue-600` -> `bg-primary-600`) et utilisation des tokens.
- `package.json`: légère mise à jour de dépendances pour résoudre un conflit Vite / plugin-react.

Utilisation des tokens
---------------------
Les couleurs principales sont exposées via des variables RGB dans `:root` et `.dark`. Exemple :
- `--color-primary-500: 59 130 246;`  (valeur RGB)
- Tailwind a été configuré pour utiliser ces variables : vous pouvez écrire `bg-primary-500`, `text-primary-700`, `border-border`, `bg-background`, `bg-surface`, etc.

Modifier une couleur
--------------------
1. Ouvrez `src/index.css` et modifiez la valeur RGB du token souhaité (par ex. `--color-primary-500: 59 130 246;`).
2. Rebuild si nécessaire (`npm run dev` ou `vite`) — les changements de variables se voient sans recompile complet pour les valeurs CSS runtime.

Thème sombre
-----------
- L'état du thème est persisté dans `localStorage` sous la clé `theme` (valeurs `light` ou `dark`).
- Le layout applique/retire la classe `dark` sur `document.documentElement`. Les variables dans `.dark { ... }` sont utilisées pour override.
- Pour forcer d'envoyer le thème sombre depuis la console devtools :

  document.documentElement.classList.add('dark')

ou pour revenir au clair :

  document.documentElement.classList.remove('dark')

Exécuter les tests (si `npm` disponible)
----------------------------------------
PowerShell (si npm installé) :

```powershell
# Installer dépendances (recommandé supprimer node_modules + package-lock.json si conflit)
# cmd.exe equivalent: rmdir /s /q node_modules & del /f /q package-lock.json
Remove-Item -Recurse -Force .\node_modules
Remove-Item -Force .\package-lock.json
npm install --legacy-peer-deps
npm test
```

Si `npm` n'est pas disponible localement, utiliser Docker (pratique, isolé) :

```powershell
docker run --rm -v ${PWD}:/app -w /app node:lts pwsh -Command "npm ci --legacy-peer-deps; npm test"
```

CI (optionnel)
---------------
Je peux ajouter un workflow GitHub Actions qui exécutera automatiquement `npm ci --legacy-peer-deps` et `npm test` à chaque push/PR — dites-moi si vous voulez que je l'ajoute.

Prochaines étapes recommandées
------------------------------
- Relire visuellement l'app (charger en dev) et vérifier les composants restants non migrés.
- Mettre en place le workflow CI si vous ne pouvez pas exécuter `npm` localement.
- Si vous le souhaitez, j'ajoute une petite palette alternative (teal) et un switch pour choisir une palette personnalisée.

Contact
-------
Si vous voulez que je génère le fichier `README.md` à la racine (au lieu de `README-STYLE.md`), ou que j'ajoute le workflow GitHub Actions, dites simplement "Ajoute CI" ou "Créer README à la racine".
