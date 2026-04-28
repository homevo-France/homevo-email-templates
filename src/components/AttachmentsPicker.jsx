import { useState, useRef } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function AttachmentsPicker({ presets, attachments, onChange }) {
  const [customLabel, setCustomLabel] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  const isSelected = (id) => attachments.some((a) => a.id === id);

  const togglePreset = (preset) => {
    if (isSelected(preset.id)) {
      onChange(attachments.filter((a) => a.id !== preset.id));
    } else {
      onChange([...attachments, { ...preset, source: "preset" }]);
    }
  };

  const addCustom = () => {
    const label = customLabel.trim();
    if (!label) return;
    onChange([
      ...attachments,
      { id: `custom-${Date.now()}`, label, source: "custom" },
    ]);
    setCustomLabel("");
  };

  const handleFileUpload = async (e) => {
    setUploadError("");
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const oversized = files.find((f) => f.size > MAX_FILE_SIZE);
    if (oversized) {
      setUploadError(`"${oversized.name}" dépasse 10 Mo. Réduisez la taille du PDF.`);
      e.target.value = "";
      return;
    }
    try {
      const newAttachments = await Promise.all(
        files.map(async (file) => {
          const content = await fileToBase64(file);
          return {
            id: `upload-${Date.now()}-${file.name}`,
            label: file.name,
            source: "upload",
            content,
            contentType: file.type || "application/octet-stream",
            size: file.size,
            encoding: "base64",
          };
        })
      );
      onChange([...attachments, ...newAttachments]);
      e.target.value = "";
    } catch (err) {
      setUploadError("Erreur lecture fichier : " + (err?.message || "inconnue"));
    }
  };

  const removeItem = (id) => onChange(attachments.filter((a) => a.id !== id));

  const groupedPresets = presets.reduce((acc, p) => {
    (acc[p.category] ||= []).push(p);
    return acc;
  }, {});
  const uploadedAttachments = attachments.filter((a) => a.source === "upload");
  const customAttachments = attachments.filter((a) => a.source === "custom");

  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Pièces jointes
      </div>
      {Object.entries(groupedPresets).map(([cat, items]) => (
        <div key={cat}>
          <div className="text-xs text-slate-500 mb-1.5 capitalize flex items-center gap-2">
            <span>{cat}</span>
            {items.some((i) => i.file) && (
              <span className="text-[10px] text-homevo-green font-medium uppercase">
                · Auto-attaché
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map((p) => (
              <button
                key={p.id}
                onClick={() => togglePreset(p)}
                title={p.note || (p.file ? "Fichier auto-attaché à l'envoi MCP" : "")}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  isSelected(p.id)
                    ? "bg-homevo-teal text-white border-homevo-teal"
                    : "bg-white text-slate-700 border-slate-300 hover:border-homevo-teal"
                }`}
              >
                {isSelected(p.id) ? "✓ " : "+ "}
                {p.label}
                {!p.file && <span className="ml-1 opacity-60">(manuel)</span>}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="border-t border-slate-200 pt-3">
        <label className="label">Ajouter des fichiers depuis votre ordinateur</label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.csv"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload-input"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary w-full"
        >
          📎 Sélectionner un ou plusieurs fichiers
        </button>
        <p className="text-xs text-slate-500 mt-1">
          Idéal pour les devis personnalisés, factures. Max 10 Mo par fichier.
        </p>
        {uploadError && (
          <p className="text-xs text-red-600 mt-1">{uploadError}</p>
        )}
        {uploadedAttachments.length > 0 && (
          <ul className="mt-2 space-y-1">
            {uploadedAttachments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between text-xs bg-homevo-teal/5 border border-homevo-teal/20 px-3 py-2 rounded"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span>📎</span>
                  <span className="truncate font-medium">{a.label}</span>
                  <span className="text-slate-400 shrink-0">{formatSize(a.size)}</span>
                </span>
                <button
                  onClick={() => removeItem(a.id)}
                  className="text-slate-400 hover:text-red-500 shrink-0"
                  aria-label="Retirer"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="label">Mention manuelle (PJ non chargée)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            placeholder="Ex : Devis personnalisé Mr Dupont"
            className="input flex-1"
          />
          <button onClick={addCustom} className="btn-secondary whitespace-nowrap">
            Ajouter
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Mention seulement (sans envoi du fichier). Vous l'attachez vous-même au mail.
        </p>
        {customAttachments.length > 0 && (
          <ul className="mt-2 space-y-1">
            {customAttachments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between text-xs bg-amber-50 border border-amber-200 px-3 py-1.5 rounded"
              >
                <span>📝 {a.label}</span>
                <button
                  onClick={() => removeItem(a.id)}
                  className="text-slate-400 hover:text-red-500"
                  aria-label="Retirer"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = String(result).split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}
