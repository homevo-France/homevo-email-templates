export function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "number" ? value : Number(String(value).replace(/[^\d.,-]/g, "").replace(",", "."));
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [y, m, d] = value.split("T")[0].split("-");
    return `${d}/${m}/${y}`;
  }
  return String(value);
}

export function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat("fr-FR").format(num);
}

export function formatValue(value, type) {
  switch (type) {
    case "money":
      return formatMoney(value);
    case "date":
      return formatDate(value);
    case "number":
      return formatNumber(value);
    case "boolean":
      return value ? "Oui" : "Non";
    default:
      return value === null || value === undefined ? "" : String(value);
  }
}
