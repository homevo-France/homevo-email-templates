import { formatValue } from "./formatters.js";

const MUSTACHE = /\{\{\s*([\w.]+)\s*\}\}/g;

export function substitute(template, vars, types = {}) {
  if (!template) return "";
  return template.replace(MUSTACHE, (_, key) => {
    const raw = vars[key];
    if (types[key] === "raw") return raw == null ? "" : String(raw);
    if (raw === undefined || raw === null || raw === "") return `[${key}]`;
    return formatValue(raw, types[key]);
  });
}

export function renderBlocks({ blocks, selectedIds, vars, blockVariables, freeText, attachments }) {
  const types = Object.fromEntries(
    Object.entries(blockVariables || {}).map(([k, def]) => [k, def.type])
  );
  types.civilite = "text";
  types.nom = "text";
  types.prenom = "text";

  const attHtml = buildAttachmentsListHtml(attachments);
  const attText = buildAttachmentsListText(attachments);
  const enrichedVars = { ...vars, attachments_list_html: attHtml, attachments_list_text: attText };
  types.attachments_list_html = "raw";
  types.attachments_list_text = "raw";

  const ordered = orderBlocks(blocks, selectedIds);
  const html = [];
  const text = [];
  for (const id of ordered) {
    const block = blocks[id];
    if (!block) continue;
    const renderedHtml = substitute(block.html, enrichedVars, types);
    html.push(`<div class="block-section">${renderedHtml}</div>`);
    text.push(humanizeText(substitute(block.text, enrichedVars, types)));
  }
  if (freeText && freeText.trim()) {
    const lines = freeText.trim().split(/\n+/).map((l) => `<p>${escapeHtml(l)}</p>`).join("");
    const inserted = `<div class="block-section">${lines}</div>`;
    const insertAt = findFreeTextAnchor(ordered, blocks);
    if (insertAt === -1) {
      html.push(inserted);
      text.push(freeText.trim());
    } else {
      html.splice(insertAt, 0, inserted);
      text.splice(insertAt, 0, freeText.trim());
    }
  }
  return { html: html.join("\n"), text: text.join("\n\n") };
}

function findFreeTextAnchor(orderedIds, blocks) {
  const lastBlock = orderedIds[orderedIds.length - 1];
  if (lastBlock && blocks[lastBlock]?.alwaysLast) return orderedIds.length - 1;
  return -1;
}

export function orderBlocks(blocks, selectedIds) {
  const set = new Set(selectedIds);
  const first = [];
  const last = [];
  const middle = [];
  const fixedOrder = ["greeting", "A", "B", "C", "D", "V", "E", "F", "Fc", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "U", "S", "Sp", "T", "R", "PJ", "W"];
  for (const id of fixedOrder) {
    if (!set.has(id)) continue;
    const b = blocks[id];
    if (!b) continue;
    if (b.alwaysFirst) first.push(id);
    else if (b.alwaysLast) last.push(id);
    else middle.push(id);
  }
  for (const id of selectedIds) {
    if (!fixedOrder.includes(id) && blocks[id]) middle.push(id);
  }
  return [...first, ...middle, ...last];
}

export function buildSubject({ type, vars }) {
  const subject = `{{civilite}} {{nom}}, ${type.shortSubject}`;
  return substitute(subject, vars, { civilite: "text", nom: "text" });
}

export function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildAttachmentsListHtml(attachments) {
  const items = (attachments || []).filter((a) => a && a.label);
  if (items.length === 0) return "";
  const li = items.map((a) => `<li>${escapeHtml(a.label)}</li>`).join("");
  return `<ul>${li}</ul>`;
}

export function buildAttachmentsListText(attachments) {
  const items = (attachments || []).filter((a) => a && a.label);
  if (items.length === 0) return "";
  return items.map((a) => `• ${a.label}`).join("\n");
}

function humanizeText(input) {
  if (!input) return "";
  return input
    .split("\n")
    .map((line) => line.replace(/^(\s*)-\s+/, "$1• "))
    .join("\n");
}
