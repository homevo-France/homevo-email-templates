# Pièces jointes Homevo

Les fichiers PDF placés ici sont automatiquement servis par l'app à l'URL `/attachments/<nom>.pdf`.

## Fichiers attendus pour la v1

| Nom de fichier | Document |
|----------------|----------|
| `mandat-mpr.pdf` | Mandat MaPrimeRénov' (vierge) |
| `mandat-cee.pdf` | Mandat Prime CEE (vierge) |
| `rge-qualipac.pdf` | Certificat RGE Qualipac |
| `assurance-decennale.pdf` | Attestation d'assurance décennale |
| `kbis.pdf` | Extrait Kbis |
| `contrat-edf.pdf` | Contrat partenaire EDF |

## Comment ça marche

1. Quand un utilisateur coche une PJ dans la zone 3 de l'app, l'URL du fichier est ajoutée au prompt MCP envoyé à Claude Code.
2. Le MCP `send_email` (étendu) accepte un paramètre `attachments` avec des URLs.
3. Nodemailer télécharge automatiquement les fichiers depuis l'URL et les attache au mail.

## Mise à jour des PDF

Pour remplacer un document : déposer le nouveau PDF avec le même nom, `git push`, GitHub Pages redéploie. Tous les mails suivants utilisent la nouvelle version.
