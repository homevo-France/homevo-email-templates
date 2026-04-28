function toNumber(v) {
  if (v === null || v === undefined || v === "") return NaN;
  if (typeof v === "number") return v;
  return Number(String(v).replace(",", "."));
}

export function evaluateCondition(expr, vars) {
  if (!expr) return true;
  const match = expr.match(/^\s*(\w+)\s*(==|!=|>=|<=|>|<)\s*(.+?)\s*$/);
  if (!match) return true;
  const [, key, op, rawValue] = match;
  const left = vars[key];
  let right = rawValue.trim();
  if (right === "true") right = true;
  else if (right === "false") right = false;
  else if (right.startsWith("\"") && right.endsWith("\"")) right = right.slice(1, -1);
  else if (right.startsWith("'") && right.endsWith("'")) right = right.slice(1, -1);
  else if (!Number.isNaN(Number(right))) right = Number(right);

  if (typeof right === "number") {
    const l = toNumber(left);
    if (Number.isNaN(l)) return false;
    switch (op) {
      case "==": return l === right;
      case "!=": return l !== right;
      case ">":  return l > right;
      case "<":  return l < right;
      case ">=": return l >= right;
      case "<=": return l <= right;
    }
  }
  if (typeof right === "boolean") {
    const l = left === true || left === "true" || left === 1 || left === "1";
    return op === "==" ? l === right : l !== right;
  }
  if (op === "==") return String(left ?? "") === right;
  if (op === "!=") return String(left ?? "") !== right;
  return false;
}

export function isBlockVisible(block, vars) {
  return evaluateCondition(block.showIf, vars);
}
