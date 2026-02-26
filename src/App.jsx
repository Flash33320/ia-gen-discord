import { useMemo, useState } from "react";

const BASE_PERMISSIONS = {
  Admin: ["Gérer le serveur", "Gérer les rôles", "Voir les logs"],
  Modérateur: ["Gérer les messages", "Kick/Ban", "Slowmode"],
  Membre: ["Lire", "Écrire", "Rejoindre vocal"],
  Invité: ["Lire uniquement #accueil"]
};

function buildTemplate(description) {
  const text = description.toLowerCase();

  const hasGaming = /jeu|gaming|esport/.test(text);
  const hasCrypto = /crypto|web3|nft/.test(text);
  const hasBusiness = /business|startup|pro|saas/.test(text);

  const categories = [
    {
      name: "🛬 Onboarding",
      channels: ["#accueil", "#règlement", "#présentations"]
    },
    {
      name: "💬 Communauté",
      channels: ["#général", "#entraide", "#suggestions"]
    }
  ];

  if (hasGaming) {
    categories.push({
      name: "🎮 Gaming",
      channels: ["#recherche-team", "#clips", "🔊 Vocal Squad"]
    });
  }

  if (hasCrypto) {
    categories.push({
      name: "🪙 Crypto",
      channels: ["#actu-marché", "#alpha", "#wallet-help"]
    });
  }

  if (hasBusiness) {
    categories.push({
      name: "📈 Business",
      channels: ["#networking", "#ressources", "🔊 Coworking"]
    });
  }

  categories.push({
    name: "🛠️ Staff",
    channels: ["#mod-log", "#tickets", "🔊 Réunion staff"]
  });

  const roles = Object.entries(BASE_PERMISSIONS).map(([name, permissions]) => ({
    name,
    permissions
  }));

  if (hasGaming) {
    roles.push({
      name: "Coach",
      permissions: ["Accès salon coaching", "Ping événements"]
    });
  }

  if (hasCrypto) {
    roles.push({
      name: "Analyste",
      permissions: ["Publier analyses", "Tag alertes marché"]
    });
  }

  return {
    serverName: `Template IA · ${description.slice(0, 28) || "Mon serveur"}`,
    categories,
    roles,
    deploySummary:
      "Ce modèle remplacera les catégories, salons, rôles et permissions existants sur ton serveur."
  };
}

export default function App() {
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState(null);
  const [botInvited, setBotInvited] = useState(false);
  const [deploymentState, setDeploymentState] = useState("idle");

  const canGenerate = description.trim().length > 15;
  const deployDisabled = !template || !botInvited || deploymentState === "sending";

  const progressText = useMemo(() => {
    if (!template) return "Étape 1/3: décris ton serveur idéal";
    if (!botInvited) return "Étape 2/3: invite le bot Discord";
    if (deploymentState === "done") return "Étape 3/3: modèle envoyé avec succès";
    return "Étape 3/3: envoi du modèle sur ton serveur";
  }, [template, botInvited, deploymentState]);

  const generate = () => {
    setTemplate(buildTemplate(description.trim()));
    setBotInvited(false);
    setDeploymentState("idle");
  };

  const inviteBot = () => {
    setBotInvited(true);
  };

  const deployTemplate = () => {
    setDeploymentState("sending");
    window.setTimeout(() => {
      setDeploymentState("done");
    }, 1200);
  };

  return (
    <main className="container">
      <header>
        <h1>Panel IA · Générateur de serveur Discord</h1>
        <p>
          Explique ton concept, laisse l&apos;IA générer un modèle complet, puis envoie-le en 1 clic sur
          ton serveur Discord.
        </p>
      </header>

      <section className="card">
        <h2>1) Décris ton serveur</h2>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Ex: Je veux un serveur gaming FR avec matchmaking, coaching et espace staff privé..."
          rows={5}
        />
        <div className="row">
          <button type="button" onClick={generate} disabled={!canGenerate}>
            Générer le modèle IA
          </button>
          <span className="hint">{progressText}</span>
        </div>
      </section>

      {template && (
        <section className="card">
          <h2>2) Aperçu du modèle généré</h2>
          <p className="server-name">{template.serverName}</p>

          <div className="grid">
            <div>
              <h3>Catégories & salons</h3>
              {template.categories.map((category) => (
                <article key={category.name} className="block">
                  <strong>{category.name}</strong>
                  <ul>
                    {category.channels.map((channel) => (
                      <li key={channel}>{channel}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div>
              <h3>Rôles & permissions</h3>
              {template.roles.map((role) => (
                <article key={role.name} className="block">
                  <strong>@{role.name}</strong>
                  <ul>
                    {role.permissions.map((permission) => (
                      <li key={permission}>{permission}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>

          <p className="warning">⚠️ {template.deploySummary}</p>

          <div className="row">
            <button type="button" className="secondary" onClick={inviteBot} disabled={botInvited}>
              {botInvited ? "Bot invité ✅" : "Inviter le bot Discord"}
            </button>
            <button type="button" onClick={deployTemplate} disabled={deployDisabled}>
              {deploymentState === "sending"
                ? "Envoi en cours..."
                : deploymentState === "done"
                  ? "Modèle appliqué ✅"
                  : "Envoyer le modèle sur mon serveur"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
