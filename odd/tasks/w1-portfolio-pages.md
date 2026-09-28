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
