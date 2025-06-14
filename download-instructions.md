# 📥 Instructions de téléchargement - TachesMed

## 🎯 Fichiers à télécharger pour GitHub

Voici la liste complète des fichiers à récupérer pour votre repository GitHub :

### 📄 **Fichiers racine** (priorité haute)
```
✅ package.json          - Configuration npm
✅ README.md             - Documentation
✅ index.html            - Page principale
✅ vite.config.ts        - Configuration Vite
✅ tailwind.config.js    - Configuration Tailwind
✅ tsconfig.json         - Configuration TypeScript
✅ .gitignore            - Fichiers à ignorer
✅ .env.example          - Exemple de configuration
✅ DEPLOYMENT.md         - Guide de déploiement
```

### 📁 **Dossier src/** (priorité haute)
```
src/
├── App.tsx                    - Composant principal
├── main.tsx                   - Point d'entrée
├── index.css                  - Styles globaux
├── supabase.ts               - Configuration Supabase
├── components/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── UserManagement.tsx
│   ├── Reports.tsx
│   ├── GroupManagement.tsx
│   ├── TaskManagement.tsx
│   ├── Availabilities.tsx
│   ├── Profile.tsx
│   ├── Breadcrumb.tsx
│   ├── GroupDetail.tsx
│   ├── TaskForm.tsx
│   └── GlobalCalendar.tsx
└── services/
    └── taskScheduling.ts
```

### 📁 **Dossier supabase/** (priorité moyenne)
```
supabase/
└── migrations/
    ├── 20250116003746_foggy_breeze.sql
    ├── 20250119182807_humble_dew.sql
    ├── [... tous les autres fichiers .sql]
    └── 20250523161915_precious_pine.sql
```

## 🔄 **Méthodes de téléchargement**

### **Méthode 1 : Copier-coller manuel**

1. **Ouvrez chaque fichier** dans l'éditeur
2. **Sélectionnez tout** (Ctrl+A / Cmd+A)
3. **Copiez** (Ctrl+C / Cmd+C)
4. **Créez le fichier** sur votre ordinateur
5. **Collez le contenu**

### **Méthode 2 : Utiliser le menu contextuel**

Si vous voyez un menu avec clic droit :
1. **Clic droit** sur le nom du fichier
2. **"Download"** ou **"Télécharger"**

### **Méthode 3 : Raccourcis clavier**

- **Ctrl+S** (Windows) ou **Cmd+S** (Mac) pour sauvegarder
- Peut déclencher un téléchargement selon le navigateur

## 📋 **Ordre de priorité pour GitHub**

### **Phase 1 : Fichiers essentiels**
1. `package.json`
2. `README.md`
3. `index.html`
4. `.gitignore`

### **Phase 2 : Configuration**
1. `vite.config.ts`
2. `tailwind.config.js`
3. `tsconfig.json`
4. `.env.example`

### **Phase 3 : Code source**
1. Tout le dossier `src/`
2. `DEPLOYMENT.md`

### **Phase 4 : Base de données**
1. Dossier `supabase/migrations/`

## 🚀 **Upload sur GitHub**

1. **Allez sur** : https://github.com/Carlus1/tachesmed
2. **Cliquez** "Add file" → "Upload files"
3. **Glissez-déposez** ou sélectionnez les fichiers
4. **Structure recommandée** :
   ```
   📁 tachesmed/
   ├── 📄 package.json
   ├── 📄 README.md
   ├── 📄 index.html
   ├── 📄 .gitignore
   ├── 📄 vite.config.ts
   ├── 📄 tailwind.config.js
   ├── 📄 tsconfig.json
   ├── 📄 .env.example
   ├── 📄 DEPLOYMENT.md
   ├── 📁 src/
   │   ├── 📄 App.tsx
   │   ├── 📄 main.tsx
   │   ├── 📄 index.css
   │   ├── 📄 supabase.ts
   │   ├── 📁 components/
   │   └── 📁 services/
   └── 📁 supabase/
       └── 📁 migrations/
   ```

## ✅ **Vérification finale**

Après upload, votre repository devrait avoir :
- ✅ Tous les fichiers listés ci-dessus
- ✅ Structure de dossiers correcte
- ✅ README.md visible sur la page principale
- ✅ package.json pour npm install

---

**💡 Astuce** : Commencez par les fichiers de la Phase 1, puis ajoutez progressivement les autres !