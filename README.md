# Tic-Tac-Toe (React)

A Tic-Tac-Toe game built with React + Vite — a rebuild of an earlier vanilla
JavaScript version, made as a hands-on way to learn React.

**Play it live:** https://tic-tac-toe-react-sand-ten.vercel.app/

Curious how it was actually built, including the mistakes along the way? See
[JOURNEY.md](./JOURNEY.md).

## Features

- Two-player mode, or Vs. Computer with selectable AI difficulty (Easy / Medium /
  Hard — Hard is unbeatable, via minimax)
- Move history with time travel — jump back to any earlier move
- Rematch (alternates who goes first) and Undo
- Keyboard controls: arrow keys + Enter/Space, or number keys 1-9
- Sound effects with a mute toggle, and a confetti burst on a win
- Dark mode, persisted across visits
- Scoreboard, persisted across visits

## Tech stack

- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- Plain CSS (custom properties for theming), no UI framework
- [Vercel](https://vercel.com/) for hosting, with GitHub auto-deploy on push

## Getting started

```bash
git clone https://github.com/8fn4wf8phr-ops/tic-tac-toe-react.git
cd tic-tac-toe-react
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the local dev server
- `npm run build` — build for production (outputs to `dist/`)
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint
