export default function TypePicker({ types, onSelect }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-homevo-dark">Générateur de mails Homevo</h1>
        <p className="text-slate-600 mt-2">
          Sélectionnez le type de mail à envoyer. Les blocs et variables s'adapteront automatiquement.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className="card p-5 text-left hover:border-homevo-teal hover:shadow-md transition group"
          >
            <div className="text-3xl mb-3">{t.icon}</div>
            <div className="font-semibold text-homevo-dark group-hover:text-homevo-teal">
              {t.label}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {t.defaultBlocks.length} blocs par défaut · {t.applicableBlocks.length} blocs disponibles
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
