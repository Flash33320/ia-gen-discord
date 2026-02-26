import { useMemo, useState } from "react";

export default function App() {
  const [description, setDescription] = useState("");
  const [stylePrompt, setStylePrompt] = useState("");
  const [template, setTemplate] = useState(null);
  const [botInvited, setBotInvited] = useState(false);
  const [deploymentState, setDeploymentState] = useState("idle");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const canGenerate = description.trim().length > 15 && !isGenerating;
  const deployDisabled = !template || !botInvited || deploymentState === "sending";

  const progressText = useMemo(() => {
    if (isGenerating) return "Génération IA en cours...";
    if (!template) return "Étape 1/3 · Décris ton serveur dans la zone ci-dessous";
    if (!botInvited) return "Étape 2/3 · Invite le bot Discord";
    if (deploymentState === "done") return "Étape 3/3 · Modèle envoyé avec succès";
    return "Étape 3/3 · Envoi du modèle sur ton serveur";
  }, [template, botInvited, deploymentState, isGenerating]);

  const generate = async () => {
    setIsGenerating(true);
    setError("");
    setDeploymentState("idle");
    setBotInvited(false);

    try {
      const response = await fetch("http://localhost:8787/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          stylePrompt: stylePrompt.trim()
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        const message = payload.details ? `${payload.error}: ${payload.details}` : payload.error;
        throw new Error(message || "Erreur inconnue");
      }

      setTemplate(payload.template);
    } catch (apiError) {
      setTemplate(null);
      setError(apiError.message || "La génération a échoué.");
    } finally {
      setIsGenerating(false);
    }
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
        <p>La structure est générée par une IA côté backend via API, puis affichée ici.</p>
      </header>

      <section className="card prompt-card">
        <h2>Décris ton serveur (zone d&apos;explication)</h2>
        <p className="hint">C&apos;est ici que tu décris le rendu souhaité: catégories, salons, style, tickets, etc.</p>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Ex: serveur gaming premium avec onboarding, tickets support, salon annonces, rôles staff/VIP..."
          rows={4}
        />

        <h3>Consignes de style</h3>
        <label htmlFor="stylePrompt" className="hint">
          Optionnel: style visuel, ambiance, nomenclature des salons, etc.
        </label>
        <textarea
          id="stylePrompt"
          rows={3}
          value={stylePrompt}
          onChange={(event) => setStylePrompt(event.target.value)}
          placeholder="Ex: style moderne, noms courts, plus de salons communautaires..."
        />

        <div className="row">
          <button type="button" onClick={generate} disabled={!canGenerate}>
            {isGenerating ? "Génération..." : "Générer la structure"}
          </button>
          <span className="hint">{progressText}</span>
        </div>
        {error && <p className="warning">⚠️ {error}</p>}
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
