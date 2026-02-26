# IA Gen Discord

Panel React pour générer un modèle de serveur Discord avec une IA:

- L'utilisateur décrit son besoin.
- Un backend Node appelle l'API OpenAI pour générer une vraie structure JSON.
- Le front affiche le résultat (catégories, salons, rôles, permissions).
- L'utilisateur invite le bot.
- L'utilisateur applique le modèle sur son serveur.

## Variables d'environnement

```bash
export OPENAI_API_KEY="sk-..."
# optionnel
export OPENAI_MODEL="gpt-4o-mini"
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
