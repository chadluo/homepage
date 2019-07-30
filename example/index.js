"use strict";

(function () {
  /* recent jiras */
  let recentUrls = JSON.parse(localStorage.getItem("recentUrls"));
  if (recentUrls) {
    console.log("recentUrls: " + recentUrls);
    document.getElementById("recentSearches").innerHTML = recentUrls
      .map(item => "<a href='" + item.url + "' title='" + (item.access || "") + "'>" + item.jiraId + "</a>")
      .join(", ");
  }
})();

document.getElementById("sampleJira").onsubmit = () => {
  let jiraId = document.getElementById("jiraId").value.trim();
  let groups = /(\w+-)?(\d+)/.exec(jiraId);
  if (!groups[2]) {
    alert("bad jira id: '" + jiraId + "'");
  } else {
    let url = "https://issues.apache.org/jira/browse/" + (groups[1] || "MNG-") + groups[2];
    addItemToRecent("recentUrls", {
      jiraId: jiraId,
      url: url,
      access: new Date().toLocaleString("en-AU")
    });
    window.open(url).focus();
  }
};

document.getElementById("sampleWiki").onsubmit = () => {
  alert('nope')
};
document.getElementById("gTranslate").onsubmit = () => {
  window.open("https://www.google.com/search?pws=0&gl=us&gws_rd=cr&q=define%20" + document.getElementById("word").value.trim()).focus();
};
document.getElementById("lxiy").onsubmit = () => {
  window.open("https://learnxinyminutes.com/docs/" + document.getElementById("lxiydoc").value.trim()).focus();
};

function addItemToRecent(itemId, item) {
  let items = load(itemId);
  if (!Array.isArray(items)) {
    items = [item];
  } else {
    items.unshift(item);
    items.splice(5);
  }
  store(itemId, items);
}

function load(id) {
  return JSON.parse(localStorage.getItem(id));
}

function store(id, obj) {
  localStorage.setItem(id, JSON.stringify(obj));
}
