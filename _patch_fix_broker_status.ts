import fs from "fs";

const path = "app/api/broker/connect/route.ts";
let s = fs.readFileSync(path, "utf8");

if (!s.includes("const provisionActivated")) {
  // Inserisce logica: consideriamo riuscito SOLO se activated>0 oppure metaapi_account_id valorizzato.
  s = s.replace(
`        if (!pr.ok || !pj?.ok) {
          provisionOk = false;
          provisionError =
            (pj && (pj.detail?.code || pj.detail?.msg || pj.detail || pj.error)) ||
            \`HTTP_\${pr.status}\`;
        } else {
          provisionOk = true;
        }`,
`        const provisionActivated =
          !!(pj && (pj.activated > 0 || (pj.results && pj.results[0] && pj.results[0].ok)));

        if (!pr.ok || !pj?.ok || !provisionActivated) {
          provisionOk = false;
          provisionError =
            (pj && (pj.detail?.code || pj.detail?.msg || pj.detail?.error || pj.error)) ||
            (pj && pj.results && pj.results[0] && (pj.results[0].code || pj.results[0].message)) ||
            \`HTTP_\${pr.status}\`;
        } else {
          provisionOk = true;
        }`
  );

  // Cambia la regola status: active SOLO se metaapi_account_id presente
  s = s.replace(
`    const nextStatus = provisionOk ? "active" : "error";
    const nextErr = provisionOk ? null : provisionError || "PROVISION_FAILED";`,
`    const hasAccountId = !!normStr((up.rows?.[0]?.metaapi_account_id ?? null) as unknown);
    // Stato "active" SOLO se provisionOk e abbiamo metaapi_account_id valorizzato
    const nextStatus = (provisionOk && hasAccountId) ? "active" : "pending";
    const nextErr = (provisionOk && hasAccountId) ? null : (provisionError || null);`
  );
}

fs.writeFileSync(path, s);
console.log("OK patched:", path);
