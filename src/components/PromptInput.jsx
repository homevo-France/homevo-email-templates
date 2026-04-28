import { useMemo } from "react";
import { suggestBlocks } from "../lib/blockSuggester.js";

export default function PromptInput({
  prompt,
  onPromptChange,
  freeText,
  onFreeTextChange,
  blocks,
  applicableIds,
  selectedIds,
  onAddBlock,
}) {
  const suggestions = useMemo(
    () => suggestBlocks({ prompt, blocks, applicableIds }),
    [prompt, blocks, applicableIds]
  );
  const newSuggestions = suggestions.filter((s) => !selectedIds.includes(s.id));

  return (
    <div className="space-y-4">
      <div>
        <label className="label">
          Demande complémentaire (recherche de blocs)
          <span className="text-slate-400 font-normal ml-1">— optionnel</span>
        </label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder='Ex : "ajouter le parrainage", "parler du logement en location"…'
          className="input"
        />
        {newSuggestions.length > 0 && (
          <div className="mt-2 space-y-1.5">
            <div className="text-xs text-slate-500">Blocs suggérés :</div>
            {newSuggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => onAddBlock(s.id)}
                className="w-full text-left text-xs bg-amber-50 border border-amber-200 hover:border-amber-400 rounded-md px-3 py-2 flex items-center justify-between"
              >
                <span>
                  <span className="font-mono text-amber-700">{s.id}</span> · {s.label}
                  {s.summary && <span className="text-slate-500"> — {s.summary}</span>}
                </span>
                <span className="text-amber-600 font-medium">+ Ajouter</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="label">
          Texte libre à insérer dans le mail
          <span className="text-slate-400 font-normal ml-1">— optionnel</span>
        </label>
        <textarea
          value={freeText}
          onChange={(e) => onFreeTextChange(e.target.value)}
          rows={4}
          placeholder="Texte personnalisé inséré juste avant la signature."
          className="input resize-y"
        />
      </div>
    </div>
  );
}
