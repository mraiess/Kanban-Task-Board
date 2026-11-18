# Kanban Task Board

Trello-style board with editable columns and drag-and-drop cards, persisted in `localStorage`.

## Run

Open `index.html` in any modern browser. No install, build step, or internet connection needed.

## Usage

- **+ Add list** appends a column; click a column title to rename it.
- Type in **+ Add card** and press Enter to add a card to that column.
- Drag cards between columns or within a column to reorder them.
- Delete a card with its `×` button.
- Delete a column with the `×` next to its title; its cards are deleted too. Both actions ask for confirmation.
- Everything is saved automatically (key: `kanban`). Default columns are To Do, In Progress, Done.

## Limits

- Drag-and-drop uses the HTML5 Drag and Drop API, so it requires a mouse/trackpad and does not work on touch screens.

## Files

- `index.html` — page structure
- `style.css` — board, list, and card styling
- `app.js` — state, drag-and-drop, event delegation, localStorage
