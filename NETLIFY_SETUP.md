# 🚀 Configuration des Variables d'Environnement Netlify

## ⚠️ PROBLÈME IDENTIFIÉ
Votre déploiement Netlify affiche "Invalid API key", ce qui indique que les variables d'environnement ne sont pas correctement configurées.

## 🔧 SOLUTION : Configurer les Variables d'Environnement

### 1. **Accédez à votre Dashboard Netlify**
- Allez sur [netlify.com](https://netlify.com)
- Connectez-vous à votre compte
- Cliquez sur votre site TachesMed

### 2. **Configurez les Variables d'Environnement**
- Cliquez sur **"Site settings"**
- Dans le menu de gauche, cliquez sur **"Environment variables"**
- Cliquez sur **"Add variable"**

### 3. **Ajoutez ces 2 variables OBLIGATOIRES :**

#### Variable 1 : VITE_SUPABASE_URL
```
Key: VITE_SUPABASE_URL
Value: https://votre-projet.supabase.co
```

#### Variable 2 : VITE_SUPABASE_ANON_KEY
```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### 4. **Où trouver ces valeurs ?**

#### Dans votre Dashboard Supabase :
1. Allez sur [supabase.com](https://supabase.com)
2. Sélectionnez votre projet
3. Cliquez sur **"Settings"** (icône engrenage)
4. Cliquez sur **"API"**
5. Copiez :
   - **URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

### 5. **Redéployez votre site**
Après avoir ajouté les variables :
- Retournez à l'onglet **"Deploys"**
- Cliquez sur **"Trigger deploy"**
- Sélectionnez **"Deploy site"**

## ✅ Vérification

Une fois redéployé, votre site devrait :
1. Afficher la page de connexion
2. Permettre la création de compte
3. Fonctionner normalement

## 🔍 Debug

Si le problème persiste :
1. Ouvrez la console du navigateur (F12)
2. Vérifiez les messages de debug que j'ai ajoutés
3. Regardez s'il y a des erreurs réseau

## 📞 Support

Si vous avez des difficultés :
1. Vérifiez que les variables sont bien sauvegardées
2. Assurez-vous qu'il n'y a pas d'espaces avant/après les valeurs
3. Redéployez après chaque modification