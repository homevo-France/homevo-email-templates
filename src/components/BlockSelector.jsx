import { isBlockVisible } from "../lib/conditions.js";

export default function BlockSelector({
  blocks,
  applicableIds,
  selectedIds,
  vars,
  onToggle,
}) {
  const items = applicableIds
    .map((id) => blocks[id])
    .filter(Boolean)
    .filter((b) => !b.alwaysFirst && !b.alwaysLast);

  const visible = items.filter((b) => isBlockVisible(b, vars));
  const hidden = items.filter((b) => !isBlockVisible(b, vars));

  const grouped = groupBy(visible, "category");
  const order = ["intro", "intro-devis", "devis", "aides", "argumentaire", "process", "specifique", "trust", "outro"];

  return (
    <div className="space-y-5">
      {order
        .filter((k) => grouped[k])
        .map((cat) => (
          <div key={cat}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {labelForCategory(cat)}
            </div>
            <div className="space-y-2">
              {grouped[cat].map((b) => (
                <BlockRow
                  key={b.id}
                  block={b}
                  selected={selectedIds.includes(b.id)}
                  onToggle={() => onToggle(b.id)}
                />
              ))}
            </div>
          </div>
        ))}
      {hidden.length > 0 && (
        <details className="border border-dashed border-slate-300 rounded-md p-3">
          <summary className="text-xs text-slate-500 cursor-pointer">
            {hidden.length} bloc(s) masqué(s) (conditions non remplies)
          </summary>
          <div className="text-xs text-slate-400 mt-2 space-y-1">
            {hidden.map((b) => (
              <div key={b.id}>
                <span className="font-mono">{b.id}</span> · {b.label}
                <span className="ml-2 text-slate-400">
                  → s'affiche si <code className="bg-slate-100 px-1 rounded">{b.showIf}</code>
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function BlockRow({ block, selected, onToggle }) {
  return (
    <label
      className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition ${
        selected
          ? "border-homevo-teal bg-homevo-teal/5"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-homevo-teal focus:ring-homevo-teal"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
            {block.id}
          </span>
          <span className="font-medium text-sm text-homevo-dark">{block.label}</span>
        </div>
        {block.summary && (
          <div className="text-xs text-slate-500 mt-0.5">{block.summary}</div>
        )}
      </div>
    </label>
  );
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || "autre";
    (acc[k] ||= []).push(item);
    return acc;
  }, {});
}

function labelForCategory(cat) {
  const map = {
    intro: "Introduction",
    "intro-devis": "Introduction (devis)",
    devis: "Contenu du devis",
    aides: "Aides financières",
    argumentaire: "Argumentaire commercial",
    process: "Process / engagement",
    specifique: "Cas spécifiques",
    trust: "Confiance / vérifications",
    outro: "Clôture",
  };
  return map[cat] || cat;
}
