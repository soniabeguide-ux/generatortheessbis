# The Essentials — Générateur d'articles

Application web pour générer les articles bilingues (FR/EN) de The Essentials.

## Structure

```
the-essentials-generator/
├── netlify/
│   └── functions/
│       └── claude.js        ← Proxy API (clé API sécurisée côté serveur)
├── src/
│   ├── components/
│   │   ├── StepNotes.jsx
│   │   ├── StepArticleFR.jsx
│   │   ├── StepBilingual.jsx
│   │   └── StepExport.jsx
│   ├── api.js
│   ├── export.js
│   ├── prompts.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   └── favicon.svg
├── index.html
├── netlify.toml
├── vite.config.js
└── package.json
```

## Déploiement sur Netlify

### 1. Installer les dépendances localement (optionnel, pour tester)
```bash
npm install
npm run dev
```

### 2. Pousser sur GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TON_USER/the-essentials-generator.git
git push -u origin main
```

### 3. Connecter à Netlify
1. Va sur https://app.netlify.com
2. "Add new site" → "Import an existing project"
3. Connecte ton repo GitHub
4. Paramètres de build (auto-détectés via netlify.toml) :
   - Build command : `npm run build`
   - Publish directory : `dist`

### 4. Ajouter la clé API
Dans Netlify → Site settings → Environment variables :
- **Key :** `ANTHROPIC_API_KEY`
- **Value :** `sk-ant-...` (ta clé Anthropic)

### 5. Redéployer
Netlify → Deploys → "Trigger deploy"

## Développement local avec la clé API

Crée un fichier `.env` à la racine (jamais commité) :
```
ANTHROPIC_API_KEY=sk-ant-...
```

Installe Netlify CLI pour tester les fonctions localement :
```bash
npm install -g netlify-cli
netlify dev
```
