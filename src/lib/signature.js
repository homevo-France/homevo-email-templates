export function buildSignatureHtml(company) {
  const c = company;
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1E2D3D;border-top:1px solid #E2E8F0;margin-top:24px;padding-top:14px;">
  <tr>
    <td style="vertical-align:top;padding-right:14px;border-right:3px solid #22808D;">
      <div style="font-size:16px;font-weight:bold;color:#1E2D3D;">Homevo</div>
      <div style="font-size:11px;color:#22808D;letter-spacing:0.4px;text-transform:uppercase;margin-top:2px;">${escapeAttr(c.tagline)}</div>
    </td>
    <td style="vertical-align:top;padding-left:14px;font-size:12px;line-height:1.55;color:#475569;">
      <div><strong style="color:#1E2D3D;">Téléphone :</strong> <a href="tel:+33${c.phone.replace(/[^\d]/g, "").slice(1)}" style="color:#22808D;text-decoration:none;">${escapeAttr(c.phone)}</a></div>
      <div><strong style="color:#1E2D3D;">Mobile :</strong> <a href="tel:+33${c.mobile.replace(/[^\d]/g, "").slice(1)}" style="color:#22808D;text-decoration:none;">${escapeAttr(c.mobile)}</a> (appel ou SMS)</div>
      <div><strong style="color:#1E2D3D;">E-mail :</strong> <a href="mailto:${escapeAttr(c.email)}" style="color:#22808D;text-decoration:none;">${escapeAttr(c.email)}</a></div>
      <div><strong style="color:#1E2D3D;">Site :</strong> <a href="${escapeAttr(c.website)}" style="color:#22808D;text-decoration:none;">${escapeAttr(c.website.replace(/^https?:\/\//, ""))}</a></div>
    </td>
  </tr>
  <tr>
    <td colspan="2" style="padding-top:12px;font-size:11px;color:#94A3B8;line-height:1.5;">
      Certifié <strong style="color:#84C118;">${escapeAttr(c.rge.label)}</strong> · N° ${escapeAttr(c.rge.number)}<br/>
      SIRET ${escapeAttr(c.siret)} · <a href="${escapeAttr(c.links.synerciel)}" style="color:#94A3B8;">Profil Synerciel</a>
    </td>
  </tr>
</table>
`.trim();
}

export function buildSignatureText(company) {
  const c = company;
  return [
    "—",
    "Homevo | " + c.tagline,
    `Tél : ${c.phone}  ·  Mobile : ${c.mobile}  ·  ${c.email}`,
    `${c.rge.label} · N° ${c.rge.number}`,
    `SIRET ${c.siret}  ·  ${c.website}`,
  ].join("\n");
}

function escapeAttr(s) {
  return String(s ?? "").replace(/"/g, "&quot;");
}
