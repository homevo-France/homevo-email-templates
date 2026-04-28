import { useState, useMemo } from "react";

export default function EmailPreview({ subject, html, text, recipient, onRecipientChange }) {
  const [tab, setTab] = useState("html");

  const fullHtmlDoc = useMemo(
    () => `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8" />
<style>
  body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #1E2D3D; padding: 20px; background: #fff; margin: 0; }
  p { margin: 0 0 16px 0; }
  ul, ol { margin: 0 0 18px 0; padding-left: 22px; }
  li { margin-bottom: 6px; }
  strong { color: #1E2D3D; }
  a { color: #22808D; }
  .block-section { margin-bottom: 22px; }
  .block-section:last-child { margin-bottom: 0; }
  .block-section > *:last-child { margin-bottom: 0; }
</style></head><body>${html}</body></html>`,
    [html]
  );

  return (
    <div className="card flex flex-col h-full">
      <div className="border-b border-slate-200 p-4 space-y-2">
        <div>
          <label className="label">Destinataire (À)</label>
          <input
            type="email"
            value={recipient}
            onChange={(e) => onRecipientChange(e.target.value)}
            placeholder="prospect@exemple.fr"
            className="input"
          />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Objet
          </div>
          <div className="text-sm text-homevo-dark font-medium bg-slate-50 px-3 py-2 rounded border border-slate-200">
            {subject || "—"}
          </div>
        </div>
      </div>
      <div className="border-b border-slate-200 px-4 pt-2 flex gap-1">
        <TabButton active={tab === "html"} onClick={() => setTab("html")}>
          Aperçu HTML
        </TabButton>
        <TabButton active={tab === "source"} onClick={() => setTab("source")}>
          Source HTML
        </TabButton>
        <TabButton active={tab === "text"} onClick={() => setTab("text")}>
          Version texte
        </TabButton>
      </div>
      <div className="flex-1 overflow-auto">
        {tab === "html" && (
          <iframe
            title="Aperçu mail"
            srcDoc={fullHtmlDoc}
            sandbox=""
            className="w-full h-full min-h-[400px] border-0"
          />
        )}
        {tab === "source" && (
          <pre className="p-4 text-xs whitespace-pre-wrap break-all bg-slate-50 text-slate-700 m-0 h-full">
            {html}
          </pre>
        )}
        {tab === "text" && (
          <pre className="p-4 text-sm whitespace-pre-wrap font-sans text-slate-700 m-0 h-full">
            {text}
          </pre>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-t-md border-b-2 transition ${
        active
          ? "border-homevo-teal text-homevo-teal"
          : "border-transparent text-slate-500 hover:text-homevo-dark"
      }`}
    >
      {children}
    </button>
  );
}
