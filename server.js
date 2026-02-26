import http from "node:http";
import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filePath = ".env") {
  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) return;

  const lines = fs.readFileSync(resolved, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const port = Number(process.env.PORT || 8787);

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(payload));
}

function cleanJson(text) {
  return text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
}

function buildPrompt(description, stylePrompt) {
  return `Tu es un expert Discord. Génère UNIQUEMENT du JSON valide (sans markdown) selon ce schéma:\n\n{\n  "serverName": "string",\n  "categories": [{"name": "string", "channels": ["string"]}],\n  "roles": [{"name": "string", "permissions": ["string"], "level": number}],\n  "deploySummary": "string"\n}\n\nContraintes:\n- Les noms de salons texte doivent commencer par #.\n- Les salons vocaux ne doivent pas commencer par #.\n- Donne entre 4 et 8 catégories pertinentes.\n- Donne entre 6 et 12 rôles triés par niveau croissant (1 = plus haut privilège).\n- Permissions courtes et concrètes.\n- Réponds en français.\n\nDescription utilisateur:\n${description}\n\nConsignes de style supplémentaires:\n${stylePrompt || "Aucune"}`;
}

async function handleGenerate(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 1_000_000) {
      sendJson(res, 413, { error: "Payload trop volumineux." });
      req.destroy();
    }
  });

  req.on("end", async () => {
    let parsed;
    try {
      parsed = JSON.parse(body || "{}");
    } catch {
      return sendJson(res, 400, { error: "JSON invalide." });
    }

    const description = (parsed.description || "").trim();
    const stylePrompt = (parsed.stylePrompt || "").trim();

    if (description.length < 15) {
      return sendJson(res, 400, { error: "La description doit contenir au moins 15 caractères." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return sendJson(res, 500, { error: "OPENAI_API_KEY manquante côté serveur." });
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.5,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "Tu produis strictement du JSON valide conforme à la demande." },
            { role: "user", content: buildPrompt(description, stylePrompt) }
          ]
        })
      });

      if (!response.ok) {
        const details = await response.text();
        return sendJson(res, 502, { error: "Erreur API OpenAI", details });
      }

      const payload = await response.json();
      const rawContent = payload?.choices?.[0]?.message?.content;
      if (!rawContent) return sendJson(res, 502, { error: "Réponse IA vide." });

      const template = JSON.parse(cleanJson(rawContent));
      if (!template.serverName || !Array.isArray(template.categories) || !Array.isArray(template.roles)) {
        return sendJson(res, 502, { error: "Réponse IA invalide." });
      }

      return sendJson(res, 200, { template });
    } catch (error) {
      return sendJson(res, 500, { error: "Erreur serveur", details: error.message });
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") return sendJson(res, 204, {});

  if (req.method === "POST" && req.url === "/api/generate") {
    return handleGenerate(req, res);
  }

  return sendJson(res, 404, { error: "Not found" });
});

server.listen(port, () => {
  console.log(`API démarrée sur http://localhost:${port}`);
});
