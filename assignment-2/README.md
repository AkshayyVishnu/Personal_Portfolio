# Interactive Multi-Page Portfolio - React

Assignment 2, Full Stack Development (CS1303). Extends the static Assignment 1
portfolio (kept at the repository root) into a routed React single-page app.

## Setup

```bash
cd assignment-2
npm install
npm run dev      # development server
npm run build    # production build
npm run preview  # serve the production build
```

Requires Node 18+. Built with Vite, React and react-router-dom. No UI library,
no state-management library.

## Component tree

```
main.jsx  -> <BrowserRouter>
  App                       theme state + <Routes>
    Layout                  skip link, <main>, and the persistent chrome
      Navbar                NavLinks, theme toggle, responsive menu
      <Outlet/>             the routed page renders here
        Home                hero, loading state
        About               education / experience / achievements / extras
          Skills
        Projects            maps the projects array
          ProjectCard       one instance per project, own open/closed state
            TechStack       receives only the tech array
        ProjectDetail       reads :projectId, reuses TechStack
        Contact
          ContactForm       controlled inputs, derived errors
        NotFound
      Footer
```

The prop-drilling chain required by the brief is `Projects -> ProjectCard ->
TechStack`. The page holds the array, passes one project's fields to the card,
and the card passes just the `tech` array on to the grandchild.

## Routes

| Path | Component |
|---|---|
| `/` and `/home` | Home |
| `/about` | About |
| `/projects` | Projects |
| `/projects/:projectId` | ProjectDetail |
| `/contact` | Contact |
| `*` | NotFound |

The brief writes the home route as `/Home`. Route matching is not worth
gambling marks on, so both `/` and `/home` are registered and render the same
component.

## State-lifting decisions

**Theme lives in `App` and travels by Context.** It is the only state more than
one branch of the tree needs: `Navbar` owns the toggle, but the value is applied
to `<html>` and read by every component through CSS variables. `App` is the
lowest common ancestor. It reaches `Navbar` through `ThemeContext` rather than
props, because drilling it through `Layout` would make an intermediate component
accept and forward a value it never uses. Context is core React, so this stays
inside the no-third-party-state-library constraint.

**`open` lives inside `ProjectCard`, deliberately not lifted.** Each card's
expanded/collapsed state is nobody else's business. Declaring `useState` inside
the component gives every rendered instance its own copy, so expanding one card
leaves the other two alone. Lifting it to `Projects` would have made all three
move together - the opposite of what is wanted.

**Form state lives inside `ContactForm`.** No ancestor reads it. `errors` is
*derived* during render from the form values rather than stored in its own
`useState`, because two state slots holding the same truth drift apart; the
submit button reads `Object.keys(errors).length === 0` directly.

**`isMobile` lives inside `Navbar`.** Only the navigation changes shape at the
breakpoint, so the listener belongs where its result is consumed.

## useEffect hooks

| Where | Dependencies | Why it is necessary | Cleanup |
|---|---|---|---|
| `App` | `[theme]` | Writes `data-theme` onto `<html>` and persists the choice to `localStorage`. DOM attributes and browser storage are outside React's render output, so mutating them during render would put a side effect in the wrong place. Runs on `theme` changes only. | None needed - no subscription, timer or listener is created. |
| `Home` | `[]` | Simulates a load on mount with a 1000 ms `setTimeout` before revealing the hero. Empty deps means once per mount. | `clearTimeout`. Without it, navigating away inside that second would fire `setLoading` on an unmounted component. |
| `Navbar` | `[]` | Subscribes to `window.resize` so the nav collapses to a menu button at 768px, matching the CSS breakpoint. | `removeEventListener`. Without it, every remount would stack another live listener on `window`. |

The saved theme is read with a lazy initialiser,
`useState(() => localStorage.getItem('theme') || 'light')`, rather than a third
effect. That runs once before the first render, so the page never flashes the
wrong theme before correcting itself.

## Styling

One global `src/style.css`, carried over from Assignment 1. The palette is
unchanged - cobalt `#1d5fdb`, navy `#101d33`, white cards on a pale blue
gradient. Dark mode re-declares **only** the colour custom properties under
`[data-theme="dark"]`; every layout rule below that block is shared by both
themes, so no selector is written twice. CSS Modules were not used because the
card treatment is deliberately shared across projects, skills and list sections
by a single rule - splitting per component would have duplicated it.

Breakpoints are unchanged from Assignment 1: 768px collapses both grids to one
column and moves the nav to its own row, 480px stacks the buttons and shrinks
the hero.

All text meets WCAG AA (4.5:1) in both themes. In dark mode the accent is
lightened and button text darkened, because white on the lighter blue would
only reach 2.8:1.

## Folder structure

```
src/
  components/  Layout, Navbar, Footer, ProjectCard, TechStack, Skills, ContactForm
  pages/       Home, About, Projects, ProjectDetail, Contact, NotFound
  data/        projects.js - the single source of truth for project content
  assets/      project icons and the hero photograph
  context/     ThemeContext.js
```


Demo Link
https://drive.google.com/drive/folders/1BycbjsaHFIbHFUpMVhbs9Uic_sDTOupD
