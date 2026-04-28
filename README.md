# Mails Homevo · Générateur de templates

Application web pour générer rapidement des mails prospects/clients pour Homevo (rénovation énergétique, pompes à chaleur).

## Utilisation

1. Ouvrir l'app : https://homevo.github.io/homevo-email-templates/
2. Choisir un type de mail (10 disponibles : devis, relance, présentation, documents, etc.)
3. Remplir le destinataire et les variables (civilité, nom, montants, kW, etc.)
4. Cocher/décocher les blocs voulus (23 blocs composables avec conditions)
5. Ajouter des PJ (auto-attachées via URL ou upload depuis l'ordi en base64)
6. Voir l'aperçu, copier le HTML, ou envoyer via MCP

## Envoi via MCP (Emeric uniquement)

Le bouton "Envoyer via Claude (MCP)" copie un prompt formaté. Le coller dans Claude Code (avec le MCP `mcp-email-ovh` connecté) déclenche l'envoi automatique avec PJ attachées.

L'équipe sans Claude Code utilise "Copier HTML" et colle dans Gmail/Outlook.

## Édition du contenu

Tout le contenu (blocs, types, variables, PJ) est dans un seul fichier :
[`src/data/templates.json`](src/data/templates.json)

Pour modifier un texte ou ajouter un bloc :
1. Éditer `templates.json`
2. Tester en local : `npm run dev`
3. Commit + push sur `main` → GitHub Actions redéploie automatiquement (~2 min)

## Stack

- React 19 + Vite
- Tailwind CSS
- Aucune dépendance backend (statique)

## Dev local

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # build prod dans dist/
```

## Pièces jointes

Les PDFs fixes sont dans `public/attachments/`. Pour en ajouter ou en remplacer :
1. Déposer le PDF avec un nom standardisé
2. Référencer dans `templates.json` → `attachments.presets`
3. Push → déploiement auto
