/* eslint-disable no-unused-vars, spaced-comment */
/* eslint-env browser */
"use strict";

const JIRA_BASE_URL = "https://issues.apache.org/jira";
const MY_DEFAULT_PROJECT = "MNG";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
const DAY_MILLIS = 86400 * 1000;

const KEY_DARK_MODE = "darkMode";
const KEY_DEFAULT_PROJECT = "defaultProject";
const KEY_GTD = "recentGtd";
const KEY_JIRA_SEARCH = "recentUrls";
const RECENT_JIRA_LIMIT = 4;
const KEY_TEMP_LINKS = "guerrilla";

const KEY_PREVIOUS_TIP = "previousTip";
const KEY_CURRENT_TIP = "currentTip";

const ENDPOINT_GTD = "/gtd";
const ENDPOINT_JIRA_SEARCH = "/jira";

//#region init

document.addEventListener("DOMContentLoaded", async () => {
  refreshGtd(); // from localStorage
  renderJira(); // from localStorage
  renderGuerrilla(); // from localStorage
  document.getElementById("defaultProject").value = localStorage.getItem(KEY_DEFAULT_PROJECT) || MY_DEFAULT_PROJECT;

  const tipIndex = Math.floor(Math.random() * 304);
  localStorage.setItem(KEY_PREVIOUS_TIP, localStorage.getItem(KEY_CURRENT_TIP) || "0");
  localStorage.setItem(KEY_CURRENT_TIP, tipIndex.toString());

  const res = await fetch(
    `/all?prev=${localStorage.getItem(KEY_PREVIOUS_TIP)}&curr=${localStorage.getItem(KEY_CURRENT_TIP)}`
  );
  const json = await res.json();
  showCurrShortcutTip(json["prev"], json["curr"]);
  refreshGtd(json["gtd"]); // from backend
  renderJira(json["jira"]); // from backend
  renderGuerrilla(json["guerrilla"]); // from backend

  storeLocal(KEY_GTD, json["gtd"]);
  storeLocal(KEY_JIRA_SEARCH, json["jira"]);
  storeLocal(KEY_TEMP_LINKS, json["guerrilla"]);

  await refreshHackerNews();

  setTimeout(() => {
    const performanceEntry = window.performance.getEntriesByType("navigation")[0];
    document.getElementById("loadtime").innerText = performanceEntry.duration.toFixed(2) + "ms";
  });
});

//#endregion

//#region common

function loadLocal(lsk) {
  return JSON.parse(localStorage.getItem(lsk)) || [];
}

function storeLocal(lsk, obj) {
  localStorage.setItem(lsk, JSON.stringify(obj));
}

function storeRemote(lsk, endpoint) {
  const data = localStorage.getItem(lsk);
  fetch(endpoint, {
    method: "PUT",
    headers: { "Content-Type": "application/json;charset=UTF-8" },
    body: data,
  })
    .then(console.log)
    .catch(console.log);
}

function create(endpoint, datum) {
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json;charset=UTF-8" },
    body: JSON.stringify(datum),
  })
    .then(console.log)
    .catch(console.error);
}

async function update(endpoint, data) {
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: { "Content-Type": "application/json;charset=UTF-8" },
    body: JSON.stringify(data),
  });
  return await response.json();
}

document.getElementById("toggleLightDark").addEventListener("click", () => {
  document.body.classList.add("animated");
  if (document.body.classList.toggle("dark")) {
    localStorage.setItem(KEY_DARK_MODE, "t");
  } else {
    localStorage.removeItem(KEY_DARK_MODE);
  }
});

document.getElementById("toCopy").addEventListener("click", async (event) => {
  const a = event.target;
  if (a.tagName !== "A") return;
  await navigator.clipboard.writeText(a.getAttribute("data"));
  a.innerHTML += " copied!";
});

document.getElementById("guerrilla").addEventListener("submit", (event) => {
  const form = event.target;
  const formData = new FormData(form);
  const links = loadLocal(KEY_TEMP_LINKS);
  links.unshift({
    text: formData.get("g-text"),
    link: formData.get("g-link"),
  });
  storeLocal(KEY_TEMP_LINKS, links);
  storeRemote(KEY_TEMP_LINKS, "/guerrilla");
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
  if (date > yesterdayBegin) return "昨 " + timeString;

  const lastSunday = new Date(todayBegin - DAY_MILLIS * todayBegin.getDay());
  const weekday = WEEKDAYS[date.getDay()];
  if (date > lastSunday) {
    return weekday + " " + timeString;
  } else if (date > lastSunday - 7 * DAY_MILLIS) {
    return "先" + weekday + " " + timeString;
  } else {
    return date.toLocaleString();
  }
}

//#endregion

//#region jira

function renderJira(data) {
  function renderItem(item) {
    return `<li><a href="${item.url}" title="last search: ${item.access || ""}">${item.fullJiraId}</a> ${
      item.notes || ""
    }</li>`;
  }

  document.getElementById("recentSearches").innerHTML = (data || loadLocal(KEY_JIRA_SEARCH)).map(renderItem).join("");
}

document.getElementById("jiraSearch").addEventListener("submit", () => {
  localStorage.setItem(
    KEY_DEFAULT_PROJECT,
    document.getElementById("defaultProject").value.trim() || MY_DEFAULT_PROJECT
  );
  const jiraId = document.getElementById("jiraId").value.trim();
  const groups = /(\w+-)?(\d+)/.exec(jiraId);
  if (!groups || !groups[2]) {
    window.open(`${JIRA_BASE_URL}/issues/?jql=text ~ "${jiraId}" ORDER BY updated DESC`).focus();
    return;
  }
  const fullJiraId = `${groups[1] || localStorage.getItem(KEY_DEFAULT_PROJECT) + "-"}${groups[2]}`;
  const url = `${JIRA_BASE_URL}/browse/${fullJiraId}`;
  window.open(url).focus();
  const newItem = {
    fullJiraId: fullJiraId,
    url: url,
    access: new Date().toLocaleString(),
    notes: "",
  };
  const items = loadLocal(KEY_JIRA_SEARCH);
  const existingItem = items.findIndex((item) => item.fullJiraId === fullJiraId);
  if (existingItem >= 0) {
    newItem.notes = items.splice(existingItem, 1)[0].notes;
  }
  items.unshift(newItem);
  items.splice(RECENT_JIRA_LIMIT);
  storeLocal(KEY_JIRA_SEARCH, items);
  storeRemote(KEY_JIRA_SEARCH, ENDPOINT_JIRA_SEARCH);
});

//#endregion

//#region GTD

function refreshGtd(data) {
  const tasks = data || loadLocal(KEY_GTD);
  if (tasks.length === 0) {
    document.getElementById("gtdItems-todo").innerHTML = "";
    document.getElementById("gtdItems-done").innerHTML = "";
    document.getElementById("emptyTodo").classList.remove("hidden");
    return;
  }
  const today = new Date();
  const todayBegin = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const render = (todayBegin) => (item) =>
    `<li id="${item.id}" class="gtdItem${item.todo ? "" : " inactive"}">${
      item.task
    } <time class="secondary">${formatTimestamp(item.id, todayBegin)}</time></li>`;
  const renderGtdItem = render(todayBegin);
  document.getElementById("gtdItems-todo").innerHTML = tasks
    .filter((task) => task.todo)
    .map(renderGtdItem)
    .join("");
  document.getElementById("gtdItems-done").innerHTML = tasks
    .filter((task) => !task.todo)
    .map(renderGtdItem)
    .join("");
  document.getElementById("emptyTodo").classList.add("hidden");
}

document.getElementById("gtdItems").addEventListener("click", async (event) => {
  const target = event.target;
  const gtdItem = target.tagName === "LI" ? target : target.tagName === "TIME" ? target.parentNode : null;
  if (!gtdItem) return;
  gtdItem.classList.toggle("inactive");
  const tasks = loadLocal(KEY_GTD);
  const i = tasks.findIndex((task) => task.id === gtdItem.id);
  tasks[i].todo = !tasks[i].todo;
  const res = await update(ENDPOINT_GTD, [tasks[i]]);
  storeLocal(KEY_GTD, res);
  navigator.clipboard.writeText(tasks[i].task).catch(alert);
});

document.getElementById("gtdRow").addEventListener("submit", async () => {
  const taskText = document.getElementById("gtdInbox").value.trim();
  const groups = /^(\d+) (.+)/.exec(taskText);
  if (groups && groups[1] && groups[2]) {
    const items = loadLocal(KEY_JIRA_SEARCH);
    const existingItem = items.findIndex((item) => item.fullJiraId.includes(groups[1]));
    /* attach to jira notes instead of GTD inbox */
    if (existingItem >= 0) {
      const item = items.splice(existingItem, 1)[0];
      item.notes = groups[2];
      items.unshift(item);
      storeLocal(KEY_JIRA_SEARCH, items);
      storeRemote(KEY_JIRA_SEARCH, ENDPOINT_JIRA_SEARCH);
      return;
    }
  }
  create(ENDPOINT_GTD, {
    id: new Date().getTime().toString(),
    task: taskText,
    todo: true,
    active: true,
  });
});

document.getElementById("cleanInactiveGtdItems").addEventListener("click", async () => {
  const data = loadLocal(KEY_GTD)
    .filter((e) => !e.todo)
    .map((e) => {
      e.active = false;
      return e;
    });
  const gtd = await update(ENDPOINT_GTD, data);
  storeLocal(KEY_GTD, gtd);
  refreshGtd();
});

//#endregion

//#region links

function renderGuerrilla(data) {
  const links = data || loadLocal(KEY_TEMP_LINKS);
  document.getElementById("guerrillaGroup").innerHTML = links
    .map((link) => `<a href="${link.link}">${link.text}</a>`)
    .join(" | ");
}

//#endregion

//#region shortcuts

document.getElementById("showShortcutsWin").addEventListener("click", async () => {
  await renderPage("shortcutsWin", "/shortcuts/win");
});

document.getElementById("showShortcutsMac").addEventListener("click", async () => {
  await renderPage("shortcutsMac", "/shortcuts/mac");
});

async function renderPage(pageElementId, shortcutsEndpoint) {
  const shortcutsMacPage = document.getElementById(pageElementId);
  if (shortcutsMacPage.childNodes.length !== 0) return;
  const res = await fetch(shortcutsEndpoint);
  const shortcuts = await res.json();
  shortcutsMacPage.innerHTML = "<ul>" + shortcuts.map((text) => `<li>${text}</li>`).join("") + "</ul>";
}

function showPrevShortcutTip(prev, curr) {
  document.getElementById(
    "shortcutTip"
  ).innerHTML = `${prev} <a onclick='showCurrShortcutTip("${prev}", "${curr}")'>&#x21b3;</a>`;
}

function showCurrShortcutTip(prev, curr) {
  document.getElementById(
    "shortcutTip"
  ).innerHTML = `${curr} <a onclick='showPrevShortcutTip("${prev}", "${curr}")'>&#x21b0;</a>`;
}

//#endregion

async function refreshHackerNews() {
  const res = await fetch("/hn");
  const hn = await res.json();
  document.getElementById("hackerNews").innerHTML = hn
    .map(
      (i) =>
        `<li><a href="${i.url}">${i.title}</a>${
          i.descendants ? "&nbsp;·&nbsp;" : "&nbsp;"
        }<a href="https://news.ycombinator.com/item?id=${i.id}">${i.descendants || "…"}</a></li>`
    )
    .join("");
}

customElements.define(
  "simple-search",
  class extends HTMLElement {
    get label() {
      return this.getAttribute("data-label");
    }
    get url() {
      return this.getAttribute("data-url");
    }
    constructor() {
      super();
      const template = document.getElementById("search-form");
      this.append(template.content.cloneNode(true));
      this.querySelector("label").innerText = this.label;
      this.addEventListener("submit", () => {
        const formData = new FormData(this.querySelector("form"));
        window.open(this.url + formData.get("q").trim()).focus();
      });
    }
  }
);
