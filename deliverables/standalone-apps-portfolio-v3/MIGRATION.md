1. Copy portfolio.ts, work-section.tsx, portfolio-slug-page.tsx to website/src/
2. Import { AppsAndToolsSection } from "./work-section" in website/src/app/work/page.tsx
3. Add <AppsAndToolsSection /> to work page component, replacing existing apps section
4. Copy portfolio-slug-page.tsx to website/src/app/portfolio/[slug]/page.tsx
5. Update imports in copied files to match main website structure
6. Test navigation: /work should show apps, /portfolio/[slug] should show detail pages