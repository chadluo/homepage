"use strict";

(function() {
  refreshGtd();
})();

function refreshGtd() {
  let recentGtd = load("recentGtd");
  if (Array.isArray(recentGtd)) {
    console.log("recentGtd: " + recentGtd);
    document.getElementById("gtdItems-active").innerHTML = recentGtd
      .filter(task => task.active)
      .map(item => renderGtdItem(item))
      .join("");
    document.getElementById("gtdItems-inactive").innerHTML = recentGtd
      .filter(task => !task.active)
      .map(item => renderGtdItem(item))
      .join("");
  }
  addGtdItemEventListener();
  function renderGtdItem(item) {
    return (
      "<li class='gtdItem " +
      (item.active ? "" : "inactive") +
      "' id='" +
      item.id +
      "'>" +
      item.task +
      " - <span class='gtdTimestamp'>" +
      new Date(Number(item.id)).toLocaleString() +
      "</span></li>"
    );
  }
}

function addGtdItemEventListener() {
  let recentGtds = load("recentGtd");
  document.querySelectorAll(".gtdItem").forEach(elem => {
    elem.onclick = ev => {
      let element = ev.srcElement;
      if (!element) return;
      let itemId = element.id;
      if (!/\d+/.exec(itemId)) return;
      let classes = element.classList;
      if (classes.contains("inactive")) {
        // activate
        classes.remove("inactive");
        let i = recentGtds.findIndex(element => element.id === itemId);
        if (i >= 0) recentGtds[i].active = true;
      } else {
        // deactivate
        classes.add("inactive");
        let i = recentGtds.findIndex(element => element.id === itemId);
        if (i >= 0) recentGtds[i].active = false;
      }
      store("recentGtd", recentGtds);
    };
  });
}

document.getElementById("gtd").onsubmit = () => {
  let taskText = document.getElementById("gtdInbox").value.trim();
  let task = {
    id: new Date().getTime().toString(),
    task: taskText,
    active: true
  };
  let tasks = load("recentGtd");
  if (!Array.isArray(tasks)) {
    tasks = [task];
  } else {
    tasks.unshift(task);
  }
  store("recentGtd", tasks);
};

document.getElementById("cleaner").onclick = () => {
  let recentGtd = load("recentGtd");
  store("recentGtd", recentGtd.filter(e => e.active));
  refreshGtd();
};
