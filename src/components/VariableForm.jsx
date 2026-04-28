export default function VariableForm({ globalVars, dynamicVars, vars, onChange }) {
  return (
    <div className="space-y-4">
      <Section title="Destinataire">
        <Grid>
          {globalVars.map((v) => (
            <Field key={v.key} def={v} value={vars[v.key]} onChange={onChange} />
          ))}
        </Grid>
      </Section>

      {dynamicVars.length > 0 && (
        <Section title="Variables des blocs sélectionnés">
          <Grid>
            {dynamicVars.map((v) => (
              <Field key={v.key} def={v} value={vars[v.key]} onChange={onChange} />
            ))}
          </Grid>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function Field({ def, value, onChange }) {
  const id = `field-${def.key}`;
  const handle = (val) => onChange(def.key, val);
  if (def.type === "select") {
    return (
      <div>
        <label htmlFor={id} className="label">
          {def.label} {def.required && <span className="text-red-500">*</span>}
        </label>
        <select
          id={id}
          value={value ?? ""}
          onChange={(e) => handle(e.target.value)}
          className="input"
        >
          <option value="">—</option>
          {def.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }
  if (def.type === "boolean") {
    return (
      <div className="flex items-center gap-2 pt-6">
        <input
          id={id}
          type="checkbox"
          checked={!!value}
          onChange={(e) => handle(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-homevo-teal"
        />
        <label htmlFor={id} className="text-sm text-slate-700 cursor-pointer">
          {def.label}
        </label>
      </div>
    );
  }
  return (
    <div>
      <label htmlFor={id} className="label">
        {def.label} {def.required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={def.type === "number" || def.type === "money" ? "number" : def.type === "date" ? "date" : "text"}
        inputMode={def.type === "money" || def.type === "number" ? "numeric" : undefined}
        placeholder={def.placeholder || ""}
        value={value ?? ""}
        onChange={(e) => handle(e.target.value)}
        className="input"
      />
      {def.help && <p className="text-xs text-slate-500 mt-1">{def.help}</p>}
    </div>
  );
}
