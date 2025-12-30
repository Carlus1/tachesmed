![CI](https://github.com/Carlus1/tachesmed/actions/workflows/ci.yml/badge.svg)

# 🏥 TachesMed - Application de Gestion des Tâches Médicales

Une application moderne de gestion des tâches construite avec React, TypeScript, et Supabase, spécialement conçue pour les environnements médicaux.

## 🚀 Fonctionnalités

- **Authentification sécurisée** avec Supabase Auth
- **Gestion des utilisateurs** avec rôles (Owner, Admin, User)
- **Gestion des groupes** et des membres
- **Création et assignation de tâches**
- **Calendrier interactif** avec FullCalendar
- **Gestion des disponibilités** des utilisateurs
- **Rapports et statistiques** détaillés
- **Interface responsive** avec Tailwind CSS

## 🛠️ Technologies utilisées

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
  
## 🎨 Design tokens et couleurs

Le projet utilise un système de design tokens centralisé pour les couleurs (définies en variables CSS) afin de permettre un theming runtime et des classes Tailwind cohérentes.

- Fichier principal des tokens : `src/index.css` — contient les variables CSS suivantes (exemples) :
	- `--color-primary-50` … `--color-primary-900` (nuances de la couleur primaire)
	- `--color-accent-*`, `--color-success-*`, `--color-warning-*`, `--color-error-*`
	- `--color-background`, `--color-surface`, `--color-border`, `--color-muted`

- Mapping Tailwind : `tailwind.config.js` utilise la fonction `withAlpha` pour exposer ces variables comme couleurs utilisables par Tailwind :

	- Exemple d'usage dans `tailwind.config.js` :

		```js
		const withAlpha = (variable) => ({
			DEFAULT: `rgb(var(${variable}) / <alpha-value>)`,
			50: `rgb(var(${variable}-50) / <alpha-value>)`,
			100: `rgb(var(${variable}-100) / <alpha-value>)`,
			// ...
		});

		// puis
		colors: {
			primary: withAlpha('--color-primary'),
			error: withAlpha('--color-error'),
			warning: withAlpha('--color-warning'),
			success: withAlpha('--color-success'),
			surface: { DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)' },
			background: { DEFAULT: 'rgb(var(--color-background) / <alpha-value>)' },
		}
		```

- Exemples d'utilisation dans le code :
	- `className="bg-primary-100 text-primary-900"` — surface légère
	- `className="hover:bg-surface"` — utiliser `bg-surface` pour les survols de surface
	- `className="border-error-500"` — bordure d'erreur
	- `style={{ backgroundColor: `rgb(var(--color-primary-500) / 0.08)` }}` — utilisation direct des variables RGB quand un alpha précis est nécessaire

- Bonnes pratiques :
	- Préférez les tokens (`bg-primary-100`, `bg-surface`, `text-primary-900`) plutôt que des couleurs hex directement dans les composants.
	- Pour des variantes fines (opacité personnalisée), utilisez `rgb(var(--color-...)/<alpha>)`.
	- Mettez à jour `src/index.css` si vous ajoutez de nouvelles teintes et adaptez `tailwind.config.js` si vous souhaitez exposer d'autres maps.

Si vous voulez une page de style plus complète (ex : un sprite de couleurs ou Storybook), je peux en ajouter une sous `docs/colors.md` ou configurer Storybook pour visualiser les tokens.

- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Calendrier**: FullCalendar
- **Routing**: React Router DOM
- **Date handling**: date-fns

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase

## 🔧 Installation

1. **Cloner le repository**
```bash
git clone https://github.com/Carlus1/tachesmed.git
cd tachesmed
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
Créer un fichier `.env` à la racine du projet :
```env
VITE_SUPABASE_URL=votre_supabase_url
VITE_SUPABASE_ANON_KEY=votre_supabase_anon_key
```

4. **Lancer l'application**
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 🗄️ Base de données

Le projet utilise Supabase avec les tables suivantes :
- `users` - Gestion des utilisateurs
- `groups` - Groupes de travail
- `group_members` - Relations utilisateurs-groupes
- `tasks` - Tâches
- `task_assignments` - Assignations de tâches
- `availabilities` - Disponibilités des utilisateurs
- `notification_settings` - Paramètres de notifications

## 🔐 Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Politiques de sécurité basées sur les rôles
- Authentification sécurisée avec Supabase Auth

## 📱 Fonctionnalités par rôle

### Owner (Propriétaire)
- Accès complet à toutes les fonctionnalités
- Gestion des utilisateurs
- Rapports globaux

### Admin (Administrateur)
- Gestion des groupes
- Création et assignation de tâches
- Gestion des membres de groupe

### User (Utilisateur)
- Gestion de ses disponibilités
- Consultation des tâches assignées
- Gestion de son profil

## 🚀 Déploiement

### Netlify
```bash
npm run build
# Déployer le dossier dist/ sur Netlify
```

### Vercel
```bash
npm run build
# Connecter le repository GitHub à Vercel
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème, ouvrir une issue sur GitHub.

## 🔄 Changelog

### v1.0.0
- Version initiale
- Authentification et gestion des utilisateurs
- Gestion des groupes et tâches
- Calendrier interactif
- Rapports et statistiques

## 🏗️ Architecture

```
src/
├── components/          # Composants React
├── services/           # Services et logique métier
├── supabase.ts        # Configuration Supabase
├── index.css          # Styles globaux
└── main.tsx           # Point d'entrée

supabase/
└── migrations/        # Migrations de base de données
```

## 🌟 Démo

L'application est déployée et accessible à l'adresse : [À définir après déploiement]

## 📊 Captures d'écran

[À ajouter après déploiement]