const $ = s => document.querySelector(s);
const KEY = 'kanban';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const DEFAULT = {
  lists: [
    { id: 'todo', title: 'To Do' },
    { id: 'doing', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ],
  cards: []
};

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || structuredClone(DEFAULT); } catch { return structuredClone(DEFAULT); }
}

let state = load();
let dragId = null;
let overList = null;

const save = () => localStorage.setItem(KEY, JSON.stringify(state));

function render() {
  $('#board').innerHTML = state.lists.map(l => `
    <section class="list" data-list="${l.id}">
      <div class="list-head">
        <input class="list-title" value="${esc(l.title)}" data-list="${l.id}" aria-label="List title">
        <button class="del-list" data-list="${l.id}" title="Delete list" aria-label="Delete list">×</button>
      </div>
      <div class="cards">
        ${state.cards.filter(c => c.listId === l.id).map(c => `
          <article class="card" draggable="true" data-id="${c.id}">
            ${esc(c.text)}
            <button class="del-card" data-id="${c.id}" title="Delete card" aria-label="Delete card">×</button>
          </article>`).join('')}
      </div>
      <input class="new-card" placeholder="+ Add card" data-list="${l.id}">
    </section>`).join('');
}

function clearOver() {
  overList?.classList.remove('over');
  overList = null;
}

$('#add-list').onclick = () => {
  const id = uid();
  state.lists.push({ id, title: 'New list' });
  save();
  render();
  document.querySelector(`.list-title[data-list="${id}"]`).select();
};

$('#board').addEventListener('input', e => {
  const input = e.target.closest('.list-title');
  if (!input) return;
  const list = state.lists.find(l => l.id === input.dataset.list);
  if (list) {
    list.title = input.value;
    save();
  }
});

$('#board').addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !e.target.matches('.new-card')) return;
  const text = e.target.value.trim();
  if (!text) return;
  const listId = e.target.dataset.list;
  state.cards.push({ id: uid(), listId, text });
  save();
  render();
  document.querySelector(`.new-card[data-list="${listId}"]`).focus();
});

$('#board').addEventListener('click', e => {
  const btn = e.target.closest('.del-card, .del-list');
  if (!btn) return;

  if (btn.classList.contains('del-card')) {
    if (!confirm('Delete this card?')) return;
    state.cards = state.cards.filter(c => c.id !== btn.dataset.id);
  } else {
    if (!confirm('Delete this list and all its cards?')) return;
    state.lists = state.lists.filter(l => l.id !== btn.dataset.list);
    state.cards = state.cards.filter(c => c.listId !== btn.dataset.list);
  }

  save();
  render();
});

$('#board').addEventListener('dragstart', e => {
  const card = e.target.closest('.card');
  if (!card) return;
  dragId = card.dataset.id;
  e.dataTransfer.setData('text/plain', dragId);
  e.dataTransfer.effectAllowed = 'move';
  card.classList.add('dragging');
});

$('#board').addEventListener('dragover', e => {
  const list = e.target.closest('.list');
  if (!list) return;
  e.preventDefault();
  if (overList !== list) {
    clearOver();
    list.classList.add('over');
    overList = list;
  }
});

$('#board').addEventListener('drop', e => {
  const list = e.target.closest('.list');
  if (!list || !dragId) return;
  e.preventDefault();

  const card = state.cards.find(c => c.id === dragId);
  const target = e.target.closest('.card');
  dragId = null;
  clearOver();
  if (!card || (target && target.dataset.id === card.id)) return;

  state.cards = state.cards.filter(c => c !== card);
  card.listId = list.dataset.list;

  if (target) {
    const index = state.cards.findIndex(c => c.id === target.dataset.id);
    state.cards.splice(index, 0, card);
  } else {
    state.cards.push(card);
  }

  save();
  render();
});

$('#board').addEventListener('dragend', e => {
  e.target.closest('.card')?.classList.remove('dragging');
  dragId = null;
  clearOver();
});

render();
