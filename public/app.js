/* eslint-disable no-unused-vars, spaced-comment */
/* eslint-env browser */
'use strict';

const JIRA_BASE_URL = 'https://issues.apache.org/jira';
const MY_DEFAULT_PROJECT = 'MNG';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
const DAY_MILLIS = 86400 * 1000;

const KEY_DARK_MODE = 'darkMode';
const KEY_DEFAULT_PROJECT = 'defaultProject';
const KEY_GTD = 'recentGtd';
const KEY_JIRA_SEARCH = 'recentUrls';
const RECENT_JIRA_LIMIT = 4;

const KEY_PREVIOUS_TIP = 'previousTip';
const KEY_CURRENT_TIP = 'currentTip';

const DEFAULT_PAGE = 'main';

let hasRenderedWinPage = false;
let hasRenderedMacPage = false;

//#region init

window.history.replaceState(null, null, `${window.location.pathname}#${DEFAULT_PAGE}`);
if (localStorage.getItem('darkMode')) document.body.classList.add('dark');

document.addEventListener('DOMContentLoaded', () => {
  refreshGtd(); // load local
  renderJira(); // load local
  document.getElementById('defaultProject').value = localStorage.getItem(KEY_DEFAULT_PROJECT) || MY_DEFAULT_PROJECT;
  const tipIndex = Math.floor(Math.random() * 304);
  localStorage.setItem(KEY_PREVIOUS_TIP, localStorage.getItem(KEY_CURRENT_TIP) || '0');
  localStorage.setItem(KEY_CURRENT_TIP, tipIndex.toString());
  fetch(`/all?prev=${localStorage.getItem(KEY_PREVIOUS_TIP)}&curr=${localStorage.getItem(KEY_CURRENT_TIP)}`)
    .then(resolveFetch)
    .then(json => {
      store(KEY_GTD, json['gtd']);
      refreshGtd(); // async load remote
      store(KEY_JIRA_SEARCH, json['jira']);
      renderJira(); // async load remote
      showCurrShortcutTip(json['prev'], json['curr']);
    })
    .catch(console.error);
});

//#endregion

//#region common & misc

function load(lsk) {
  return JSON.parse(localStorage.getItem(lsk)) || [];
}

function store(lsk, obj) {
  localStorage.setItem(lsk, JSON.stringify(obj));
}

function storeRemote(lsk, endpoint) {
  const data = localStorage.getItem(lsk);
  fetch(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    body: data
  })
    .then(console.log)
    .catch(console.log);
}

function resolveFetch(res) {
  return res.ok ? res.json() : Promise.reject(res);
}

document.getElementById('toggleLightDark').addEventListener('click', () => {
  document.body.classList.add('animated');
  if (document.body.classList.toggle('dark')) {
    localStorage.setItem(KEY_DARK_MODE, 't');
  } else {
    localStorage.removeItem(KEY_DARK_MODE);
  }
});

document.getElementById('toCopy').addEventListener('click', event => {
  const a = event.target;
  const path = a.getAttribute('data');
  navigator.clipboard.writeText(path).then(
    () => {
      a.innerHTML += ' copied!';
      console.log('copied path: ' + path);
    },
    () => {
      alert("can't copy");
    }
  );
});

document.getElementById('searchesMinor').addEventListener('submit', event => {
  const form = event.target;
  const baseUrl = form.getAttribute('baseurl');
  window.open(baseUrl + new FormData(form).get('q').trim()).focus();
});

//#endregion

//#region date formatter

function formatTimestamp(timestamp, todayBegin) {
  return formatDate(new Date(Number(timestamp)), todayBegin);
}

function formatDate(date, todayBegin) {
  const timeString = date.toLocaleTimeString();

  if (date > todayBegin) return timeString;

  const yesterdayBegin = todayBegin - DAY_MILLIS;
  if (date > yesterdayBegin) return '昨 ' + timeString;

  const lastSunday = new Date(todayBegin - DAY_MILLIS * todayBegin.getDay());
  const weekday = WEEKDAYS[date.getDay()];
  if (date > lastSunday) {
    return weekday + ' ' + timeString;
  } else if (date > lastSunday - 7 * DAY_MILLIS) {
    return '先' + weekday + ' ' + timeString;
  } else {
    return date.toLocaleString();
  }
}

//#endregion

//#region jira

function renderJira() {
  function renderItem(item) {
    return `<li><a href="${item.url}" title="last search: ${item.access || ''}">${item.fullJiraId}</a> ${item.notes || ''}</li>`;
  }

  document.getElementById('recentSearches').innerHTML = load(KEY_JIRA_SEARCH)
    .map(renderItem)
    .join('');
}

document.getElementById('mainJira').addEventListener('submit', () => {
  localStorage.setItem(KEY_DEFAULT_PROJECT, document.getElementById('defaultProject').value.trim() || MY_DEFAULT_PROJECT);
  const jiraId = document.getElementById('jiraId').value.trim();
  const groups = /(\w+-)?(\d+)/.exec(jiraId);
  if (!groups || !groups[2]) {
    window.open(`${JIRA_BASE_URL}/issues/?jql=text ~ "${jiraId}" ORDER BY updated DESC`).focus();
    return;
  }
  const fullJiraId = `${groups[1] || localStorage.getItem(KEY_DEFAULT_PROJECT) + '-'}${groups[2]}`;
  const url = `${JIRA_BASE_URL}/browse/${fullJiraId}`;
  window.open(url).focus();
  const newItem = {
    fullJiraId: fullJiraId,
    url: url,
    access: new Date().toLocaleString(),
    notes: ''
  };
  const items = load(KEY_JIRA_SEARCH);
  const existingItem = items.findIndex(item => item.fullJiraId === fullJiraId);
  if (existingItem >= 0) {
    newItem.notes = items[existingItem].notes;
    items.splice(existingItem, 1);
  }
  items.unshift(newItem);
  items.splice(RECENT_JIRA_LIMIT);
  store(KEY_JIRA_SEARCH, items);
  storeRemote(KEY_JIRA_SEARCH, '/jira');
});

//#endregion

//#region GTD

function refreshGtd() {
  const tasks = load(KEY_GTD);
  if (tasks.length === 0) {
    document.getElementById('gtdItems-active').innerHTML = '';
    document.getElementById('gtdItems-inactive').innerHTML = '';
    document.getElementById('emptyTodo').classList.remove('hidden');
    return;
  }
  const today = new Date();
  const todayBegin = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const render = todayBegin => item =>
    `<li id="${item.id}" class="gtdItem${item.active ? '' : ' inactive'}">
                  <span onclick="toggleGtdItem(this)">${item.task} | ${formatTimestamp(item.id, todayBegin)}</span></li>`;
  const renderGtdItem = render(todayBegin);
  document.getElementById('gtdItems-active').innerHTML = tasks
    .filter(task => task.active)
    .map(renderGtdItem)
    .join('');
  document.getElementById('gtdItems-inactive').innerHTML = tasks
    .filter(task => !task.active)
    .map(renderGtdItem)
    .join('');
}

// todo bubble
function toggleGtdItem(span) {
  const gtdItem = span.parentElement;
  gtdItem.classList.toggle('inactive');
  const tasks = load(KEY_GTD);
  const itemId = gtdItem.id;
  const i = tasks.findIndex(task => task.id === itemId);
  tasks[i].active = !tasks[i].active;
  store(KEY_GTD, tasks);
  storeRemote(KEY_GTD, '/gtd');
  navigator.clipboard.writeText(tasks[i].task).then(
    () => { },
    () => {
      alert("can't copy");
    }
  );
}

document.getElementById('gtdRow').addEventListener('submit', () => {
  const tasks = load(KEY_GTD);
  const taskText = document.getElementById('gtdInbox').value.trim();
  const groups = /^(\d+) ([\w\d\s:]+)/.exec(taskText);
  if (groups && groups[1] && groups[2]) {
    const items = load(KEY_JIRA_SEARCH);
    const existingItem = items.findIndex(item => item.fullJiraId.includes(groups[1]));
    /* attach to jira notes instead of GTD inbox */
    if (existingItem >= 0) {
      items[existingItem].notes = groups[2];
      store(KEY_JIRA_SEARCH, items);
      storeRemote(KEY_JIRA_SEARCH, '/jira');
      return;
    }
  }
  tasks.unshift({
    id: new Date().getTime().toString(),
    task: taskText,
    active: true
  });
  store(KEY_GTD, tasks);
  storeRemote(KEY_GTD, '/gtd');
});

document.getElementById('cleanInactiveGtdItems').addEventListener('click', () => {
  store(KEY_GTD, load(KEY_GTD).filter(e => e.active));
  refreshGtd(); // clean
  storeRemote(KEY_GTD, '/gtd');
});

//#endregion

//#region shortcuts

document.getElementById('showShortcutsWin').addEventListener('click', () => {
  if (hasRenderedWinPage) return;
  fetch('/shortcuts/win')
    .then(resolveFetch)
    .then(shortcuts => renderShortcutsPage(shortcuts, 'shortcutsWin'));
  hasRenderedWinPage = true;
});

document.getElementById('showShortcutsMac').addEventListener('click', () => {
  if (hasRenderedMacPage) return;
  fetch('/shortcuts/mac')
    .then(resolveFetch)
    .then(shortcuts => renderShortcutsPage(shortcuts, 'shortcutsMac'));
  hasRenderedMacPage = true;
});

function renderShortcutsPage(shortcuts, elementId) {
  console.log(shortcuts);
  document.getElementById(elementId).innerHTML = `<ul>${shortcuts.map(text => `<li>${text}</li>`).join('')}</ul>`;
}

function showPrevShortcutTip(prev, curr) {
  document.getElementById('shortcutTip').innerHTML = `${prev} <a onclick='showCurrShortcutTip("${prev}", "${curr}")'>&#x21b3;</a>`;
}

function showCurrShortcutTip(prev, curr) {
  document.getElementById('shortcutTip').innerHTML = `${curr} <a onclick='showPrevShortcutTip("${prev}", "${curr}")'>&#x21b0;</a>`;
}

//#endregion
