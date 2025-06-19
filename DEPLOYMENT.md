# 🚀 Guide de Déploiement - TachesMed

## 📋 Prérequis

1. **Node.js 18+** installé sur votre machine
2. **Compte Supabase** (gratuit sur supabase.com)
3. **Compte GitHub** (pour le code source)
4. **Compte Netlify/Vercel** (pour l'hébergement)

## 🔧 Installation Locale

```bash
# 1. Cloner le repository
git clone https://github.com/Carlus1/tachesmed.git
cd tachesmed

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# 4. Lancer en développement
npm run dev
```

## 🗄️ Configuration Supabase

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre `URL` et `anon key`

### 2. Configurer les variables d'environnement

Créez un fichier `.env` :

```env
VITE_SUPABASE_URL=votre_supabase_url
VITE_SUPABASE_ANON_KEY=votre_supabase_anon_key
```

### 3. Exécuter les migrations

1. Dans votre dashboard Supabase, allez dans "SQL Editor"
2. Exécutez les fichiers de migration dans l'ordre :
   - `supabase/migrations/20250116003746_foggy_breeze.sql`
   - Puis tous les autres fichiers dans l'ordre chronologique

## 🌐 Déploiement en Production

### Option 1 : Netlify (Recommandé)

1. **Connecter GitHub** :
   - Allez sur [netlify.com](https://netlify.com)
   - "New site from Git" → GitHub → Sélectionnez `tachesmed`

2. **Configuration build** :
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Variables d'environnement** :
   - Site settings → Environment variables
   - Ajoutez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

4. **Déployer** : Le site se déploie automatiquement !

### Option 2 : Vercel

1. **Connecter GitHub** :
   - Allez sur [vercel.com](https://vercel.com)
   - "New Project" → Import depuis GitHub

2. **Configuration automatique** : Vercel détecte Vite automatiquement

3. **Variables d'environnement** :
   - Settings → Environment Variables
   - Ajoutez vos clés Supabase

### Option 3 : GitHub Pages

```bash
# 1. Installer gh-pages
npm install --save-dev gh-pages

# 2. Ajouter dans package.json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# 3. Déployer
npm run deploy
```

## 🔐 Sécurité

### Row Level Security (RLS)

Toutes les tables utilisent RLS. Vérifiez que :

1. **Politiques activées** pour chaque table
2. **Rôles utilisateur** correctement configurés
3. **Authentification** fonctionne

### Variables d'environnement

⚠️ **JAMAIS** commiter les fichiers `.env` !

## 🧪 Tests

```bash
# Tests unitaires (à implémenter)
npm run test

# Build de production
npm run build

# Prévisualisation locale
npm run preview
```

## 📊 Monitoring

### Supabase Dashboard

- **Authentification** : Vérifiez les connexions
- **Base de données** : Surveillez les performances
- **API** : Contrôlez l'usage

### Netlify/Vercel Analytics

- **Performance** : Temps de chargement
- **Erreurs** : Logs d'erreurs
- **Usage** : Statistiques de visite

## 🆘 Dépannage

### Erreurs communes

1. **"Invalid API key"** → Vérifiez vos variables d'environnement
2. **"RLS policy violation"** → Vérifiez les politiques Supabase
3. **"Build failed"** → Vérifiez les dépendances et TypeScript

### Support

- **Issues GitHub** : https://github.com/Carlus1/tachesmed/issues
- **Documentation Supabase** : https://supabase.com/docs
- **Documentation Vite** : https://vitejs.dev

## 🔄 Mises à jour

```bash
# Mettre à jour les dépendances
npm update

# Vérifier les vulnérabilités
npm audit

# Corriger automatiquement
npm audit fix
```

---

**🎉 Votre application TachesMed est maintenant prête pour la production !**