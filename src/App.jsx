import { useState, useMemo, useEffect } from "react";
import data from "./data/templates.json";
import TypePicker from "./components/TypePicker.jsx";
import BlockSelector from "./components/BlockSelector.jsx";
import VariableForm from "./components/VariableForm.jsx";
import AttachmentsPicker from "./components/AttachmentsPicker.jsx";
import PromptInput from "./components/PromptInput.jsx";
import EmailPreview from "./components/EmailPreview.jsx";
import ActionsBar from "./components/ActionsBar.jsx";
import { isBlockVisible } from "./lib/conditions.js";
import { renderBlocks, buildSubject } from "./lib/render.js";
import { buildSignatureHtml, buildSignatureText } from "./lib/signature.js";
import { buildClaudePrompt } from "./lib/blockSuggester.js";

export default function App() {
  const [selectedType, setSelectedType] = useState(null);
  const [vars, setVars] = useState(() => {
    const init = {};
    for (const v of data.globalVariables) {
      if (v.default !== undefined) init[v.key] = v.default;
    }
    for (const [k, def] of Object.entries(data.blockVariables || {})) {
      if (def.default !== undefined) init[k] = def.default;
    }
    return init;
  });
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [freeText, setFreeText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!selectedType) return;
    setSelectedBlocks(selectedType.defaultBlocks);
    setAttachments([]);
    setFreeText("");
    setPrompt("");
  }, [selectedType?.id]);

  const visibleSelectedBlocks = useMemo(() => {
    if (!selectedType) return [];
    return selectedBlocks.filter((id) => {
      const b = data.blocks[id];
      return b && isBlockVisible(b, vars);
    });
  }, [selectedBlocks, vars, selectedType]);

  const dynamicVars = useMemo(() => {
    if (!selectedType) return [];
    const keys = new Set();
    for (const id of selectedBlocks) {
      const b = data.blocks[id];
      if (!b) continue;
      for (const v of b.vars || []) keys.add(v);
    }
    for (const id of selectedType.applicableBlocks) {
      const b = data.blocks[id];
      if (!b?.showIf) continue;
      const m = b.showIf.match(/^\s*(\w+)/);
      if (m) keys.add(m[1]);
    }
    return [...keys]
      .map((k) => data.blockVariables[k])
      .filter(Boolean);
  }, [selectedBlocks, selectedType]);

  const subject = useMemo(() => {
    if (!selectedType) return "";
    return buildSubject({ type: selectedType, vars });
  }, [selectedType, vars]);

  const { html, text } = useMemo(() => {
    if (!selectedType) return { html: "", text: "" };
    const rendered = renderBlocks({
      blocks: data.blocks,
      selectedIds: visibleSelectedBlocks,
      vars,
      blockVariables: data.blockVariables,
      freeText,
      attachments,
    });
    const sigHtml = buildSignatureHtml(data.company);
    const sigText = buildSignatureText(data.company);

    const html = [rendered.html, sigHtml].filter(Boolean).join("\n");
    const text = [rendered.text, sigText].filter(Boolean).join("\n\n");
    return { html, text };
  }, [selectedType, visibleSelectedBlocks, vars, attachments, freeText]);

  const claudePrompt = useMemo(() => {
    if (!selectedType) return "";
    return buildClaudePrompt({
      type: selectedType,
      blocks: data.blocks,
      selectedIds: visibleSelectedBlocks,
      vars,
      freeText,
      attachments,
    });
  }, [selectedType, visibleSelectedBlocks, vars, freeText, attachments]);

  const attachmentsForMcp = useMemo(() => {
    return attachments.map((a) => {
      if (a.source === "upload" && a.content) {
        return {
          id: a.id,
          label: a.label,
          filename: a.label,
          content: a.content,
          contentType: a.contentType,
          encoding: a.encoding || "base64",
        };
      }
      const preset = data.attachments.presets.find((p) => p.id === a.id);
      const file = preset?.file ?? a.file ?? null;
      if (!file) return { id: a.id, label: a.label, filename: a.label };
      const isUrl = /^https?:\/\//i.test(file);
      const filename = file.split("/").pop();
      const url = isUrl
        ? file
        : `${typeof window !== "undefined" ? window.location.origin : ""}${import.meta.env.BASE_URL || "/"}${file.replace(/^\//, "")}`;
      return { id: a.id, label: a.label, filename, url };
    });
  }, [attachments]);

  const updateVar = (key, value) => setVars((p) => ({ ...p, [key]: value }));

  const toggleBlock = (id) => {
    setSelectedBlocks((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const addBlock = (id) => {
    setSelectedBlocks((p) => (p.includes(id) ? p : [...p, id]));
    setPrompt("");
  };

  if (!selectedType) {
    return <TypePicker types={data.types} onSelect={setSelectedType} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setSelectedType(null)}
            className="text-sm text-slate-500 hover:text-homevo-teal flex items-center gap-1"
          >
            ← Retour
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-500">Type de mail</div>
            <div className="font-semibold text-homevo-dark truncate">
              {selectedType.icon} {selectedType.label}
            </div>
          </div>
          <div className="text-xs text-slate-400 hidden md:block">
            {visibleSelectedBlocks.length} bloc(s) actif(s)
          </div>
          <button
            onClick={() => setPreviewOpen(true)}
            className="btn-primary"
          >
            👁 Voir l'aperçu
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 xl:grid-cols-[1fr_minmax(420px,520px)] gap-6">
        <div className="space-y-6">
          <Panel title="1. Variables">
            <VariableForm
              globalVars={data.globalVariables}
              dynamicVars={dynamicVars}
              vars={vars}
              onChange={updateVar}
            />
          </Panel>

          <Panel title="2. Blocs du mail">
            <BlockSelector
              blocks={data.blocks}
              applicableIds={selectedType.applicableBlocks}
              selectedIds={selectedBlocks}
              vars={vars}
              onToggle={toggleBlock}
            />
          </Panel>

          <Panel title="3. Pièces jointes">
            <AttachmentsPicker
              presets={data.attachments.presets}
              attachments={attachments}
              onChange={setAttachments}
            />
          </Panel>

          <Panel title="4. Personnalisation">
            <PromptInput
              prompt={prompt}
              onPromptChange={setPrompt}
              freeText={freeText}
              onFreeTextChange={setFreeText}
              blocks={data.blocks}
              applicableIds={selectedType.applicableBlocks}
              selectedIds={selectedBlocks}
              onAddBlock={addBlock}
            />
          </Panel>
        </div>

        <div id="preview" className="hidden xl:flex xl:flex-col gap-4 xl:sticky xl:top-20 xl:self-start xl:max-h-[calc(100vh-6rem)]">
          <EmailPreview
            subject={subject}
            html={html}
            text={text}
            recipient={recipient}
            onRecipientChange={setRecipient}
          />
          <ActionsBar
            subject={subject}
            html={html}
            text={text}
            recipient={recipient}
            claudePrompt={claudePrompt}
            attachmentsForMcp={attachmentsForMcp}
          />
        </div>
      </main>

      <button
        onClick={() => setPreviewOpen(true)}
        className="xl:hidden fixed bottom-5 right-5 z-30 bg-homevo-teal text-white rounded-full shadow-lg shadow-homevo-teal/30 px-5 py-3 flex items-center gap-2 font-medium hover:bg-homevo-teal/90 transition"
      >
        <span className="text-lg">👁</span>
        Aperçu du mail
      </button>

      {previewOpen && (
        <PreviewModal onClose={() => setPreviewOpen(false)}>
          <EmailPreview
            subject={subject}
            html={html}
            text={text}
            recipient={recipient}
            onRecipientChange={setRecipient}
          />
          <ActionsBar
            subject={subject}
            html={html}
            text={text}
            recipient={recipient}
            claudePrompt={claudePrompt}
            attachmentsForMcp={attachmentsForMcp}
          />
        </PreviewModal>
      )}
    </div>
  );
}

function PreviewModal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div
        className="bg-slate-50 rounded-lg w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-white">
          <h2 className="text-homevo-dark">Aperçu du mail</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-homevo-dark text-2xl leading-none px-2"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-auto p-3 space-y-3">{children}</div>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="card p-5">
      <h2 className="mb-4">{title}</h2>
      {children}
    </section>
  );
}
