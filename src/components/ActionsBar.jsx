import { useState } from "react";

export default function ActionsBar({ subject, html, text, recipient, claudePrompt, attachmentsForMcp }) {
  const [feedback, setFeedback] = useState("");

  const flash = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 2200);
  };

  const copyHtml = async () => {
    try {
      if (window.ClipboardItem && navigator.clipboard?.write) {
        const item = new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([text], { type: "text/plain" }),
        });
        await navigator.clipboard.write([item]);
        flash("Mail copié (collage rich-text dans Gmail/Outlook)");
        return;
      }
    } catch {}
    if (await fallbackCopyRichHtml(html)) {
      flash("Mail copié (rich-text)");
      return;
    }
    if (await safeCopyText(html)) {
      flash("Source HTML copié — collez tel quel dans Gmail (mode HTML)");
      return;
    }
    flash("Erreur : copie clipboard refusée par le navigateur");
  };

  const copyText = async () => {
    const ok = await safeCopyText(text);
    flash(ok ? "Version texte copiée" : "Erreur clipboard");
  };

  const copyMcpPrompt = async () => {
    const prompt = buildMcpPrompt({ recipient, subject, html, attachments: attachmentsForMcp });
    const ok = await safeCopyText(prompt);
    flash(ok ? "Prompt MCP copié — collez-le dans Claude Code" : "Erreur clipboard");
  };

  const copyClaudeBriefing = async () => {
    const ok = await safeCopyText(claudePrompt);
    flash(ok ? "Briefing Claude copié — collez-le dans claude.ai" : "Erreur clipboard");
  };

  const downloadEml = () => {
    const eml = buildEml({ recipient, subject, html, text });
    const blob = new Blob([eml], { type: "message/rfc822" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `homevo-mail-${Date.now()}.eml`;
    a.click();
    URL.revokeObjectURL(url);
    flash("Brouillon .eml téléchargé");
  };

  return (
    <div className="card p-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button onClick={copyHtml} className="btn-primary">
          Copier HTML
        </button>
        <button onClick={copyText} className="btn-secondary">
          Copier texte
        </button>
        <button onClick={copyMcpPrompt} className="btn-accent col-span-2" disabled={!recipient}>
          Envoyer via Claude (MCP)
        </button>
        <button onClick={copyClaudeBriefing} className="btn-secondary">
          Briefing Claude.ai
        </button>
        <button onClick={downloadEml} className="btn-secondary" disabled={!recipient}>
          Télécharger .eml
        </button>
      </div>
      {feedback && (
        <div className="text-xs text-homevo-teal bg-homevo-teal/10 px-3 py-2 rounded-md">
          ✓ {feedback}
        </div>
      )}
      {!recipient && (
        <div className="text-xs text-slate-400">
          Renseignez un destinataire pour activer l'envoi MCP et l'export .eml.
        </div>
      )}
    </div>
  );
}

function buildMcpPrompt({ recipient, subject, html, attachments }) {
  const lines = [
    "Envoie ce mail via le MCP mcp-email-ovh (outil send_email) :",
    "",
    `to: ${recipient}`,
    `subject: ${subject}`,
    "isHtml: true",
  ];
  const ready = (attachments || []).filter((a) => a.url || a.path || a.content);
  const manual = (attachments || []).filter((a) => !a.url && !a.path && !a.content);
  if (ready.length > 0) {
    lines.push("attachments:");
    for (const a of ready) {
      if (a.content) {
        const ct = a.contentType ? `, contentType: "${a.contentType}"` : "";
        lines.push(`  - { filename: "${a.filename}", encoding: "base64"${ct}, content: "${a.content}" }`);
      } else if (a.url) {
        lines.push(`  - { filename: "${a.filename}", url: "${a.url}" }`);
      } else if (a.path) {
        lines.push(`  - { filename: "${a.filename}", path: "${a.path}" }`);
      }
    }
  }
  lines.push("body:");
  lines.push(html);
  if (manual.length > 0) {
    lines.push("");
    lines.push("# ⚠ PJ mentionnées sans fichier — à attacher manuellement avant envoi :");
    for (const a of manual) lines.push(`# - ${a.label}`);
  }
  return lines.join("\n");
}

function buildEml({ recipient, subject, html, text }) {
  const boundary = `==homevo-${Date.now()}`;
  const lines = [
    `To: ${recipient}`,
    `From: contact@homevo.fr`,
    `Subject: ${encodeMimeHeader(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    "",
    `--${boundary}--`,
  ];
  return lines.join("\r\n");
}

function encodeMimeHeader(s) {
  if (/^[\x00-\x7F]*$/.test(s)) return s;
  return `=?UTF-8?B?${btoa(unescape(encodeURIComponent(s)))}?=`;
}

async function safeCopyText(value) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {}
  return legacyCopy(value);
}

async function fallbackCopyRichHtml(html) {
  try {
    const div = document.createElement("div");
    div.contentEditable = "true";
    div.style.position = "fixed";
    div.style.opacity = "0";
    div.style.pointerEvents = "none";
    div.innerHTML = html;
    document.body.appendChild(div);
    const range = document.createRange();
    range.selectNodeContents(div);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    const ok = document.execCommand("copy");
    sel.removeAllRanges();
    document.body.removeChild(div);
    return ok;
  } catch {
    return false;
  }
}

function legacyCopy(text) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
