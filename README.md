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