function normalize(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function suggestBlocks({ prompt, blocks, applicableIds }) {
  if (!prompt || !prompt.trim()) return [];
  const tokens = normalize(prompt)
    .split(/[^a-z0-9€]+/i)
    .filter((t) => t.length >= 3);
  if (tokens.length === 0) return [];

  const scores = [];
  for (const id of applicableIds) {
    const block = blocks[id];
    if (!block) continue;
    const haystack = normalize([
      block.label,
      block.summary,
      ...(block.keywords || []),
    ].filter(Boolean).join(" "));
    let score = 0;
    const matched = [];
    for (const t of tokens) {
      if (haystack.includes(t)) {
        score += t.length >= 5 ? 2 : 1;
        matched.push(t);
      }
    }
    if (score > 0) scores.push({ id, score, matched, label: block.label, summary: block.summary });
  }
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, 5);
}

export function buildClaudePrompt({ type, blocks, selectedIds, vars, freeText, attachments }) {
  const lines = [];
  lines.push(`Type de mail : ${type.label}`);
  lines.push(`Sujet (auto) : ${vars.civilite || "[civ]"} ${vars.nom || "[nom]"}, ${type.shortSubject}`);
  lines.push("");
  lines.push("Variables :");
  for (const [k, v] of Object.entries(vars)) {
    if (v !== "" && v !== undefined && v !== null) lines.push(`  - ${k}: ${v}`);
  }
  lines.push("");
  lines.push("Blocs déjà sélectionnés :");
  for (const id of selectedIds) {
    const b = blocks[id];
    if (b) lines.push(`  - ${id} (${b.label})`);
  }
  if (attachments && attachments.length) {
    lines.push("");
    lines.push("Pièces jointes :");
    for (const a of attachments) lines.push(`  - ${a.label}`);
  }
  if (freeText && freeText.trim()) {
    lines.push("");
    lines.push("Demande complémentaire :");
    lines.push(freeText.trim());
  }
  lines.push("");
  lines.push("Génère le mail final HTML, en respectant les règles : pas de tableau dans le corps, pas de montants chiffrés (renvoi au devis en PJ), gras sur les chiffres clés, signature Homevo standard.");
  return lines.join("\n");
}
