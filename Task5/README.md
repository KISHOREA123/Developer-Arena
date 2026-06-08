# Task5 — Advanced CSS & Modern Layouts

## Project overview

This project is an advanced portfolio demonstrating CSS Grid, Flexbox, CSS variables for theming, animations, and BEM-style CSS organization.

## Setup & preview

1. Open `Task5` in VS Code.
2. Preview by opening `Task5/index.html` or run a local server:

```bash
python -m http.server 8000
# open http://localhost:8000/Task5/
```

## Code structure

- `index.html` — main portfolio page using semantic markup and BEM classes.
- `css/main.css` — CSS variables, base styles, and theme overrides.
- `css/layout.css` — Grid-based layout, responsive rules, and card styles.
- `css/animations.css` — keyframes, transitions, and focus styles.
- `js/theme-switcher.js` — toggles `.dark-theme` on `body` and persists choice in `localStorage`.
- `images/` — place optimized images here (not included by default).

## How requirements are met

- Implement CSS Grid for main layout: `portfolio-grid` uses `grid-template-columns: repeat(auto-fit, minmax(...))` and responsive spans.
- Use CSS variables for color scheme: defined in `:root` and `.dark-theme` overrides.
- Add smooth animations and transitions: `animations.css` contains `fadeInUp` and hover transitions.
- Create responsive design with mobile-first approach: CSS is written mobile-first with breakpoints at 900px.
- Use advanced CSS selectors: focus, hover, and attribute selectors used for accessible interactions.
- Implement BEM methodology: classes like `project-card__media`, `project-card__title`, and modifiers like `project-card--large`.

## Notes & next steps

- Replace `images/placeholder-*.png` with optimized WebP/PNG images in `images/`.
- I can add screenshots into `Task5/screenshots/` and embed them in this README if you upload them.

## Advanced CSS techniques used

- CSS Grid: `portfolio-grid` uses `repeat(auto-fit, minmax(220px, 1fr))` to create fluid, masonry-like columns that collapse gracefully on smaller screens. The featured card uses `grid-column: span 2` at wider breakpoints to create emphasis without extra markup.
- CSS Variables (theming): All colors, spacing, and key tokens are stored as custom properties in `:root`. A `.dark-theme` modifier toggles alternate values for an accessible dark mode without duplicating rules.
- BEM methodology: Block/element/modifier naming keeps styles predictable and makes overrides safe (e.g., `project-card`, `project-card__body`, `project-card--large`). This aids maintainability for team projects.
- Flexbox for small components: Buttons and header internals use Flexbox for alignment and distribution, keeping Grid focused on overall layout.
- Performance-friendly animations: animations are limited to `transform` and `opacity` (GPU-accelerated) and use `will-change` sparingly via the hover/transition patterns to avoid layout thrashing.

## Layout decisions

- Mobile-first approach: base rules target mobile devices and progressively enhance at `min-width: 900px` to enable multi-column grids and larger typography.
- Grid sizing: `minmax(220px, 1fr)` ensures cards don't shrink below a usable width while allowing more columns on wide screens; gap size is defined via `--gap` for easy adjustments.
- Featured card: marking a card with `project-card--large` allows it to span multiple columns on wide viewports, creating a focal area for case studies without extra DOM wrappers.
- Image handling: media areas are constrained with fixed heights and `object-fit: cover` to maintain consistent card proportions across the grid.

## Performance optimizations

- SVG placeholders: project cover art uses lightweight SVGs which scale cleanly and add negligible network cost; replace with optimized WebP or compressed PNG for production.
- Image optimization guidance: export raster images as WebP (or compressed JPG/PNG) and keep visual images under ~200KB when possible. Use tools like `squoosh.app` or `cwebp`.
- Lazy loading: add `loading="lazy"` to project images when using raster assets to defer off-screen downloads.
- Critical CSS: keep the base (mobile) CSS small and defer large non-critical styles; all CSS here is intentionally modular (`main.css`, `layout.css`, `animations.css`) so critical CSS can be inlined if desired.
- Use transforms/transitions: animations use `transform`/`opacity` to avoid costly reflows and repaints.
- Caching and compression: enable gzip/Brotli on the hosting platform and set long-lived cache headers for static assets (images, CSS, JS) to improve repeat load times.

## Screenshots

Add screenshots to `Task5/screenshots/` with descriptive names (`grid.png`, `hero.png`, `dark-theme.png`). Embed them in this README using the syntax below (example):

```markdown
![Portfolio grid screenshot](screenshots/grid.png)
```

If you upload screenshots (or tell me the filenames), I will add them and commit the changes.
