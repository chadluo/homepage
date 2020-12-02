/* eslint-env node */
"use strict";

const PORT = 7086;

const SHORTCUTS_WIN = "assets/shortcuts-win.json";
const SHORTCUTS_MAC = "assets/shortcuts-mac.json";

const express = require("express");

const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("data/db.json");
const low = require("lowdb");
const db = low(adapter);

const axios = require("axios").default;

const winston = require("winston");
const expressWinston = require("express-winston");

const fs = require("fs");
const fsp = fs.promises;
const WINSTON_CONFIG = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((i) => `${i.timestamp} ${i.level} | ${i.message}`)
  ),
  meta: false,
  expressFormat: true,
};
const logger = winston.createLogger(WINSTON_CONFIG);
const path = require("path");

db.defaults({
  gtd: [],
  jira: [],
  guerrilla: [],
  hackerNews: [],
}).write();

const HACKER_NEWS_API = "https://hacker-news.firebaseio.com/v0/";
const HACKER_NEWS_ITEM = `https://news.ycombinator.com/item?id=`;

async function refreshHackerNews(limit) {
  const topStoryIds = await axios.get(
    `${HACKER_NEWS_API}/topstories.json?limitToFirst=${limit || 10}&orderBy="$priority"`
  );
  const topStories = await Promise.all(topStoryIds.data.map((id) => axios.get(`${HACKER_NEWS_API}/item/${id}.json`)));
  db.update("hackerNews", () =>
    topStories.map((item) => ({
      id: item.data.id,
      title: item.data.title,
      url: item.data.url || `${HACKER_NEWS_ITEM}${item.data.id}`,
    }))
  ).write();
  logger.info("Updated HN cache");
}

refreshHackerNews().then(); // init
setInterval(refreshHackerNews, 3e5);

const server = express();

server.use(expressWinston.logger(WINSTON_CONFIG));
server.use("/public", express.static("public"));
server.use(express.json());

// region Routes

server.get("/", (_req, res) => res.sendFile(path.join(__dirname, "homepage.html")));

server.all("/gtd", async (req, res) => {
  const payload = req.body;
  switch (req.method) {
    case "GET":
      res.send(db.get("gtd").value());
      break;
    case "POST": // create
      db.get("gtd").push(payload).write();
      res.status(201).send();
      break;
    case "PUT": // update
      payload.forEach((p) => {
        db.get("gtd").find({ id: p.id }).assign({ todo: p.todo, active: p.active }).write();
      });
      res.send(db.get("gtd").filter({ active: true }));
      break;
    default:
      res.status(405).send();
      break;
  }
});

// JIRA

server.put("/jira", async (req, res) => {
  const payload = req.body;
  logger.info(`storing jira: ${payload.length} items`);
  db.update("jira", () => payload).write();
  res.send("ok");
});

// dynamic links ('guerrilla')

server.put("/guerrilla", async (req, res) => {
  const payload = req.body;
  logger.info(`storing guerrilla: ${payload.length} items`);
  db.update("guerrilla", () => payload).write();
  res.send("ok");
});

// yibasuo

server.get("/all", async (req, res) => {
  const prev = req.query["prev"] || Math.floor(Math.random() * 304);
  const curr = req.query["curr"] || Math.floor(Math.random() * 304);

  res.set("Content-Type", "application/json");

  const resolved = await Promise.all([
    safeRead(SHORTCUTS_WIN),
    safeRead(SHORTCUTS_MAC),
    db.get("gtd").filter({ active: true }).value(),
    db.get("jira").take(5).value(),
    db.get("guerrilla").value(),
  ]);
  const winTips = JSON.parse(resolved[0]);
  const macTips = JSON.parse(resolved[1]);
  const tips = winTips.concat(macTips);
  await res.json({
    prev: tips[prev],
    curr: tips[curr],
    gtd: resolved[2],
    jira: resolved[3],
    guerrilla: resolved[4],
  });
});

async function safeRead(filePath) {
  return fsp.readFile(filePath, "utf8");
}

// shortcuts page

server.get("/shortcuts/:platform", (req, res) => {
  res.set("Content-Type", "application/json");
  res.sendFile(path.join(__dirname, "assets", `shortcuts-${req.params.platform}.json`));
});

// hacker news

server.get("/hn", (req, res) => {
  res.json(db.get("hackerNews").value());
});

// endregion

server.listen(PORT);
logger.info(`Homepage ready at http://localhost:${PORT}`);
