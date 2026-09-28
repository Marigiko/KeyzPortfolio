# W1 — KeyzPortfolio: GitHub Pages + contenido actualizado

Frente: W1 · Plan fuente: /mnt/e/Projects/PLAN-EVENTOS-OCT-2026.md (sección W1)
Repo: /mnt/e/Projects/KeyzPortfolio · Marigiko/KeyzPortfolio (público)

## Decisiones del usuario (2026-09-27)

- D3/keyz.dev: confirmado — dejar `CNAME` con `keyz.dev`; el usuario hace DNS + custom domain en GitHub.
- PawnBid: enlazar el repo de GitHub (sin demo aún); actualizar a la demo cuando W3 la publique.
- Push: push a `main` por cada work-unit commit.

## Tareas

- [ ] 1. Commit del `.gitignore` pendiente (`.atl/`) — `chore: ignore local Pi runtime state (.atl/)`
- [ ] 2. Workflow `.github/workflows/pages.yml` (deploy en push a `main`) + `.nojekyll` + `CNAME`
- [ ] 3. LICENSE (MIT para código, contenido reservado) + README con captura y link
- [ ] 4. `content.json` + render de proyectos: PawnBid, GeoPlanning, Hornero Tech (links reales)
- [ ] 5. Sección "Open source" con links a GitHub
- [ ] 6. Auditoría de remanentes en español (HTML/JS/JSON) — el sitio ya está `lang="en"`
- [ ] 7. Lighthouse mobile ≥ 90 (performance, SEO, best practices, a11y)
- [ ] 8. Push + Pages activo + URL pública verificada

## Evidencia

(tarea 1) commit: 5174e15 — pendiente push (SSH con passphrase, sin agente)
(tarea 2) commit: 9136992 — pages.yml + .nojekyll + CNAME + sitio 100% estático (smoke local 200 OK en /, js, styles, CNAME, content.json). Run de Actions pendiente del primer push.
(tarea 3) commit: 822248a — LICENSE MIT + notice de contenido reservado; README con docs/screenshot.png y link a Pages; captura 1440x900 (verificar visualmente).
(tarea 4) commit: 18364ca — 3 cards reales con links (PawnBid → github.com/Marigiko/PawnBid; GeoPlanning → modal local; Hornero Tech → hornerotech.com); content.json + modal JS actualizados; JSON válido y smoke 200.
(tarea 5) commit: 6c85b82 — sección #open-source con KeyzPortfolio, KeyzBoard y repos (link “Browse all”); nav actualizado. Verificar que KeyzBoard esté público (owner).
(tarea 6) commit: (solo evidencia) — auditoría regex de texto visible en index.html/content.json/js: 0 remanentes de español; sitio ya era 100% en inglés (lang="en", title, meta OG en inglés).
(tarea 7) commit: 647ab1b — Lighthouse mobile (Chromium headless, emulación móvil): Performance 90 · Accessibility 96 · Best Practices 100 · SEO 100. Reporte completo en docs/lighthouse-mobile.json. Prueba en celular real: pendiente (humano).
(tarea 8) BLOQUEADA para el agente: 13 commits locales en main; push requiere passphrase de ~/.ssh/id_ed25519 con ssh-agent (solo humano). URL pública y run de Actions: verificar después del push.
   Comando para el usuario: eval $(ssh-agent) && ssh-add ~/.ssh/id_ed25519 && git -C /mnt/e/Projects/KeyzPortfolio push origin main
(tarea 9) Review nativo RDD: linaje review-ac5b289b874bda61, riesgo high, 4 lentes. Primer intento detenido (lens_context_budget_exceeded por el JSON de Lighthouse); historial reescrito con docs/lighthouse-mobile.md como resumen y reintento OK. Hallazgo CRÍTICO R4-contact-form-mailto-silent-drop corregido en commit 1812d64 (30 líneas, dentro del plan declarado); validador dirigido lo confirmó; review APPROVED y acknowledge quemado con recepción gentle-ai.review-acknowledged/v1. Hallazgos informativos (no bloqueantes) para después: actions no pinneadas por SHA, artifact de Pages sube el repo entero, triplicación de copy de proyectos, remanentes de comentarios HTMX.
