# The Build Journey: From "What is React?" to a Deployed Game

This is the story of how this project came together — not just what it does, but how
it got built, what broke along the way, and what I learned fixing it. I'm keeping it
here as a record for myself and as something to point to as a portfolio piece.

**Live app:** https://tic-tac-toe-react-sand-ten.vercel.app/

## 1. Where it started

I'd already built a Tic-Tac-Toe game in plain HTML/CSS/JavaScript (2-player mode plus
an unbeatable AI using the minimax algorithm). After asking "what is React?", the plan
became: rebuild the same game in React, as a hands-on way to actually learn the
framework instead of just reading about it.

## 2. Getting the environment ready

Node.js wasn't installed on my Mac yet, so step one was grabbing the LTS installer
from [nodejs.org](https://nodejs.org). Once that was in place, the project was
scaffolded with Vite:

```
npm create vite@latest . -- --template react
```

Vite gives you a working React app with hot-reload in seconds — a big contrast to
setting up a vanilla project by hand.

## 3. Learning the component model

The biggest mental shift from vanilla JS was breaking the UI into small, reusable
pieces instead of one big script. The game ended up split into:

- `Square` — a single cell on the board
- `Board` — the 3x3 grid of squares
- `ModeSelect` / `SymbolSelect` — the setup screens
- `MoveHistory` — the list of past moves
- `Game` — the component that owns all the state and ties everything together

Each piece only knows about its own job, and `Game` passes data down as props and
receives events back up through callback functions — the core React data-flow pattern.

## 4. Porting the game logic

Rather than mixing game rules into the components, the win-checking and AI logic
moved into a plain, framework-agnostic file: `src/utils/gameLogic.js`. It exports
`calculateWinner`, `isDraw`, and the same minimax-based `getBestMove` from the
original vanilla version — proof that the *logic* of a program doesn't have to change
just because the *UI layer* does.

## 5. Wiring up state with useState and useEffect

`Game.jsx` holds the state that matters: whose turn it is, the board history, and the
score. Rather than storing just "the current board," it stores an array of every past
board state (`history`) plus which one is currently being viewed (`currentMove`) — the
classic React tutorial pattern that gets time-travel (jumping back to any earlier
move) essentially for free.

`useEffect` handles the AI's turn: when it becomes the computer's move, an effect
waits briefly, then calls the minimax logic and plays.

## 6. Adding dark mode as a custom hook

Instead of duplicating theme logic, it lives in one reusable custom hook,
`useTheme.js`, that reads/writes `localStorage` and applies a `data-theme` attribute
to the page. This was the first real "aha" moment with hooks — pulling repeated
stateful logic out of a component into something any component can call.

## 7. Hitting (and fixing) real ESLint errors

The project uses `eslint-plugin-react-hooks` v7, which includes newer, stricter rules
that caught real mistakes, not just style nitpicks:

- **Unused `catch` bindings** — switched to bare `catch { ... }` where the error
  itself wasn't needed.
- **"Accessed before it is declared"** — a function was being referenced above where
  it was defined; reordering fixed it.
- **`react-hooks/set-state-in-effect`** — the biggest one. Score updates were
  originally happening inside a `useEffect` that watched the board history, which the
  linter correctly flagged as fragile. The fix was a `recordMove()` function that
  updates history *and* the score together, called directly from the click handler and
  the AI's move callback — never from inside an effect body. This is a good example of
  linting catching a design problem before it caused a real bug.

## 8. A scary moment: losing the whole project

After closing and reopening the terminal, I accidentally re-ran
`npm create vite@latest . -- --template react` again, thinking it was needed to
"reconnect." It isn't — that command scaffolds a brand-new project and it silently
overwrote every custom file back to the default boilerplate.

Because the working version was already committed to git, recovery was one command:

```
git restore .
git clean -fd
```

This restored every tracked file to the last commit and removed the newly-created
boilerplate files. Lesson: commit early and often — it turns "I lost everything" into
"undo."

## 9. Git and GitHub

Standard flow: `git init`, a `.gitignore` for `node_modules` and `dist`, an initial
commit, then pushing to a new GitHub repo. Push failures along the way (an empty
`git remote -v` after a supposedly successful push) were fixed by clearing and
re-adding the remote:

```
git remote remove origin
git remote add origin https://github.com/8fn4wf8phr-ops/tic-tac-toe-react.git
git push -u origin main
```

## 10. Deploying to Vercel

Vercel's GitHub integration auto-detected the Vite build settings, so deployment was
mostly a matter of connecting the repo through the dashboard on the free Hobby plan.
One hiccup: `npm run build` appeared to "do nothing" — it turned out `npm run dev` was
still running in the same terminal window, blocking the prompt (dev servers don't
exit on their own). Stopping it with `Ctrl+C` and re-running the build fixed it.

## 11. Growing the game after launch

Once the game was live, it got a second pass of features, all shipped and verified in
both the local dev server and the production build before pushing:

- Pop-in and winning-line pulse animations
- Sound effects via the Web Audio API (no audio files to load) with a mute toggle
- A confetti burst on a win
- Keyboard controls — arrow keys + Enter/Space, or number keys 1-9
- Selectable AI difficulty (easy/medium/hard)
- A Rematch button that alternates who goes first, and an Undo button
- Open Graph/Twitter meta tags with a generated preview image, so shared links show a
  proper card
- Vercel Analytics
## 12. Adding Infinite Mode

After the game was live and playable, the next feature was a genuinely different game
variant: **Infinite Mode**. Each player is capped at 3 pieces on the board; placing a
4th removes their own oldest piece first, so the board can never fill up and the game
can never end in a draw.

**The logic.** Rather than tracking just the board, each player now gets a queue of
their placed square indices. Placing a piece pushes onto the queue; once it's at 3, the
next placement shifts the oldest index off the queue first and clears that square. This
lives in a single `applyMove()` function that both the click handler and the AI call,
so the rule is enforced in exactly one place.

**The AI trade-off.** The existing "hard" AI is unbeatable minimax — but minimax
assumes the game tree only ever grows, never cycles back on itself. With pieces
vanishing, the same board position can recur, which breaks that assumption. Rather than
force a much heavier algorithm, infinite mode gets its own heuristic AI: take a winning
move if one exists, block the opponent's winning move if one exists, otherwise prefer
center/corners while checking one move ahead that it isn't handing over a free win. It's
strong, not unbeatable — an explicit, documented trade-off rather than a silent one.

**A UI touch:** the piece that's about to vanish (a player's oldest, once they're at 3)
pulses on the board before their next move, so the vanish never feels like a surprise.

## 13. The invisible-space bug: a debugging saga

Shipping Infinite Mode surfaced the most frustrating bug of the project so far, and it
had nothing to do with the game logic itself.

After copying updated files into the project by dragging them from Finder, one
component started throwing `Failed to resolve import "./ModeSelect"` — even though the
file was clearly sitting right there in the folder, and `ls` showed a completely normal
`ModeSelect.jsx`.

The clue was `git status` reporting "nothing to commit, working tree clean" right after
editing a file that plainly had changed on screen. That meant git wasn't seeing the file
I was editing as the same file it was tracking — which pointed at two *different* files
with what looked like an identical name.

The real proof came from Python, not the Terminal's own tools (`ls`, `cat -A`, even
`ls -b` all rendered the name as a normal `ModeSelect.jsx`, spaces and all, invisible):

```python
import os
for f in os.listdir('src/components'):
    if 'odeSelect' in f:
        print(repr(f))
```

That printed `'ModeSelect.jsx  '` — two trailing spaces baked right into the filename.
Finder's drag-and-drop had appended them, and later, recreating the file by hand inside
VS Code's own "New File" reproduced the exact same problem. The fix was a plain `mv` to
rename the file to the literal, trimmed name Vite expected.

**Lesson:** when a tool insists a file doesn't exist, or git refuses to see an obvious
edit, don't trust what `ls` or a file explorer *displays* — ask something that prints
the raw bytes of the name instead. Filenames can lie to the eye far more easily than
file contents can.
## 13. What's next

Ideas that didn't make the cut yet, because they're a different scale of project:

- **Online multiplayer** — needs a real backend (WebSockets), not just static hosting
- **Variable board sizes** (4x4, 5x5) — minimax as written brute-forces every
  possibility, which stops being fast past a 3x3 board; a bigger board needs a
  smarter search (alpha-beta pruning, or a depth-limited heuristic)

Both are good "next project" material once I've spent more time with React.
