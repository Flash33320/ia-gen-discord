# IA Gen Discord

Panel React pour générer un modèle de serveur Discord avec une IA:

- L'utilisateur décrit son besoin.
- Un backend Node appelle l'API Gemini pour générer une vraie structure JSON.
- Le front affiche le résultat (catégories, salons, rôles, permissions).
- L'utilisateur invite le bot.
- L'utilisateur applique le modèle sur son serveur.

## Variables d'environnement

1) Copie le modèle:

```bash
cp .env.example .env
```

2) Ouvre `.env` et colle ta clé:

```dotenv
GEMINI_API_KEY=AIza...
```

3) (Optionnel) ajuste le modèle et le port.

Le serveur charge automatiquement le fichier `.env` au démarrage.

```bash
GEMINI_API_KEY="AIza..."
GEMINI_MODEL="gemini-1.5-flash"
PORT=8787
```

## Lancer en local

Terminal 1 (API):

```bash
npm run dev:api
```

Terminal 2 (front):

```bash
npm run dev
```
