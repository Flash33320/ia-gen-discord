import { useMemo, useState } from "react";

const BASE_PERMISSIONS = {
  Fondateur: ["Tous les accès", "Gestion des intégrations", "Logs complets"],
  Administrateur: ["Gestion du serveur", "Gestion des rôles", "Gestion des salons"],
  Modérateur: ["Gestion des messages", "Kick/Ban", "Gestion des tickets"],
  "VIP Client": ["Accès salons premium", "Priorité tickets"],
  "Client Vérifié": ["Accès achat", "Accès support"],
  Membre: ["Lire", "Écrire", "Rejoindre vocal"]
};

function buildTemplate(description) {
  const text = description.toLowerCase();

  const hasGaming = /jeu|gaming|esport/.test(text);
  const hasCrypto = /crypto|web3|nft/.test(text);
  const hasBusiness = /business|startup|pro|saas/.test(text);

  const categories = [
    {
      name: "📢 Informations",
      channels: ["#règlement", "#annonces", "#événements", "#changelog"]
    },
    {
      name: "🛍 Boutique",
      channels: ["#prix", "#commandes", "#avis-clients", "#témoignages"]
    },
    {
      name: "💬 Communauté",
      channels: ["#général", "#discussion", "🔊 vocal-public"]
    }
  ];

  if (hasGaming) {
    categories.push({
      name: "🎮 Gaming",
      channels: ["#recherche-team", "#clips", "🔊 vocal-squad"]
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
      channels: ["#networking", "#ressources", "🔊 coworking"]
    });
  }

  categories.push({
    name: "🛠 Staff",
    channels: ["#logs", "#tickets", "🔊 réunion-staff"]
  });

  const roles = Object.entries(BASE_PERMISSIONS).map(([name, permissions], index) => ({
    name,
    permissions,
    level: index + 1
  }));

  if (hasGaming) {
    roles.push({
      name: "Coach",
      permissions: ["Accès salon coaching", "Ping événements"],
      level: roles.length + 1
    });
  }

  if (hasCrypto) {
    roles.push({
      name: "Analyste",
      permissions: ["Publier analyses", "Tag alertes marché"],
      level: roles.length + 1
    });
  }

  return {
    serverName: `Template IA · ${description.slice(0, 32) || "Mon serveur"}`,
    categories,
    roles,
    deploySummary:
      "Ce modèle remplacera les catégories, salons, rôles et permissions existants sur ton serveur."
  };
}

export default function App() {
  const [description, setDescription] = useState("");
  const [stylePrompt, setStylePrompt] = useState("");
  const [template, setTemplate] = useState(null);
  const [botInvited, setBotInvited] = useState(false);
  const [deploymentState, setDeploymentState] = useState("idle");

  const canGenerate = description.trim().length > 15;
  const deployDisabled = !template || !botInvited || deploymentState === "sending";

  const progressText = useMemo(() => {
    if (!template) return "Étape 1/3 · Décris ton serveur dans la zone ci-dessous";
    if (!botInvited) return "Étape 2/3 · Invite le bot Discord";
    if (deploymentState === "done") return "Étape 3/3 · Modèle envoyé avec succès";
    return "Étape 3/3 · Envoi du modèle sur ton serveur";
  }, [template, botInvited, deploymentState]);

  const generate = () => {
    setTemplate(buildTemplate(description.trim()));
    setBotInvited(false);
    setDeploymentState("idle");
  };

  const deployTemplate = () => {
    setDeploymentState("sending");
    window.setTimeout(() => {
      setDeploymentState("done");
    }, 1200);
  };

  return (
    <main className="container">
      <header className="topbar">
        <h1>Générateur de serveur Discord IA</h1>
        <p>Interface structurée: structure à gauche, rôles à droite, et zone dédiée pour ton explication.</p>
      </header>

      <section className="card prompt-card">
        <h2>Décris ton serveur (zone d&apos;explication)</h2>
        <p className="hint">C&apos;est ici que tu décris le rendu souhaité: catégories, salons, style, tickets, etc.</p>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Ex: serveur cheat de jeux avec annonces/prix, salon vocal, tickets, logs, rôles staff et VIP..."
          rows={4}
        />
        <div className="row">
          <button type="button" onClick={generate} disabled={!canGenerate}>
            Générer la structure
          </button>
          <span className="hint">{progressText}</span>
        </div>
      </section>

      {template && (
        <section className="workspace">
          <article className="card">
            <h2>Structure du serveur</h2>
            <p className="server-name">{template.serverName}</p>
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
          </article>

          <article className="card right-panel">
            <h2>Rôles ({template.roles.length})</h2>
            <div className="roles-list">
              {template.roles.map((role) => (
                <article key={role.name} className="role-row">
                  <div>
                    <strong>{role.name}</strong>
                    <p>{role.permissions.join(" · ")}</p>
                  </div>
                  <span className="badge">{role.level}</span>
                </article>
              ))}
            </div>

            <h3>Options de style</h3>
            <label htmlFor="stylePrompt" className="hint">
              Zone de modifications (où ajouter tes consignes de rendu)
            </label>
            <textarea
              id="stylePrompt"
              rows={4}
              value={stylePrompt}
              onChange={(event) => setStylePrompt(event.target.value)}
              placeholder="Décris ici les ajustements visuels ou organisationnels à appliquer..."
            />

            <p className="warning">⚠️ {template.deploySummary}</p>

            <div className="row">
              <button
                type="button"
                className="secondary"
                onClick={() => setBotInvited(true)}
                disabled={botInvited}
              >
                {botInvited ? "Bot invité ✅" : "Inviter le bot Discord"}
              </button>
              <button type="button" onClick={deployTemplate} disabled={deployDisabled}>
                {deploymentState === "sending"
                  ? "Envoi en cours..."
                  : deploymentState === "done"
                    ? "Modèle appliqué ✅"
                    : "Envoyer le modèle"}
              </button>
            </div>
          </article>
        </section>
      )}
    </main>
  );
}
