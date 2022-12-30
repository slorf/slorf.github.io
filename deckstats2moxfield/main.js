import { convertDeckstatsToMoxfield } from './modules/deckstats2moxfield.mjs';

const $ = document.getElementById.bind(document);
const $$ = document.querySelectorAll.bind(document);

const $form = $('deckstats');
const $includeCommander = $('includeCommander');
const $textareas = {
  source: $('deckstats-decklist'),
  main: $('moxfield-main'),
  side: $('moxfield-side'),
  maybe: $('moxfield-maybe'),
};
const $copyButtons = $$('.copyToClipboard');

$form.addEventListener('submit', convertDecklist);
$copyButtons.forEach($button => $button.addEventListener('click', copyToClipboard));

function convertDecklist(e) {
  e.preventDefault();

  const decklist = $textareas.source.value;
  const options = {
    addCommander: $includeCommander.checked,
  };

  const moxfield = convertDeckstatsToMoxfield(decklist, options);

  const mainboard = [];
  const sideboard = [];
  const maybeboard = [];

  let board = mainboard;
  moxfield.forEach((entry) => {
    if (entry === 'SIDEBOARD') {
      board = sideboard;
      return;
    }
    if (entry === 'MAYBEBOARD') {
      board = maybeboard;
      return;
    }

    board.push(entry);
  });

  addToBoard('main', mainboard);
  addToBoard('side', sideboard);
  addToBoard('maybe', maybeboard);

  function addToBoard(boardName, cards) {
    $textareas[boardName].value = cards.join('\n');
  }
}

function copyToClipboard(e) {
  e.preventDefault();

  const $board = $textareas[this.dataset.board];
  navigator.clipboard.writeText($board.value);
}
