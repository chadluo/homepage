/* eslint-env node */
"use strict";

const PORT = 7086;

const SHORTCUTS_WIN = "assets/shortcuts-win.json";
const SHORTCUTS_MAC = "assets/shortcuts-mac.json";
const DATA_GTD = "data/gtd.json";
const DATA_JIRA = "data/jira.json";
const DATA_GUERRILLA = "data/guerrilla.json";

const path = require("path");
const fs = require("fs");
const fsp = fs.promises;
const morgan = require("morgan");
const express = require("express");
const axios = require("axios").default;
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("data/db.json");
const db = low(adapter);

db.defaults({
    hackerNews: []
}).write();

const HACKER_NEWS = "https://hacker-news.firebaseio.com/v0/";

async function refreshHackerNews(limit) {
    Promise.all(
        (await axios.get(`${HACKER_NEWS}/topstories.json`)).data
            .slice(0, limit || 10)
            .map(id => axios.get(`${HACKER_NEWS}/item/${id}.json`))
    ).then(promises => {
        db.update("hackerNews", () =>
            promises.map(i => ({
                title: i.data.title,
                url: i.data.url || `https://news.ycombinator.com/item?id=${i.data.id}`
            }))
        ).write();
        console.log("Updated HN cache");
    });
}

refreshHackerNews().then(); // init
setInterval(refreshHackerNews, 60_000);

const server = express();

server.use("/public", express.static("public"));
server.use(express.json());
server.use(morgan("common"));

// const low = require('lowdb');
// const FileSync = require('lowdb/adapters/FileSync');

// region Routes

server.get("/", (_req, res) => res.sendFile(path.join(__dirname, "homepage.html")));

server.all("/gtd", async (req, res) => {
    const payload = req.body;
    const data = JSON.parse(await safeRead(DATA_GTD));
    switch (req.method) {
        case "GET":
            res.send(data);
            break;
        case "POST": // create
            data.unshift(payload);
            await fsp.writeFile(DATA_GTD, JSON.stringify(data, null, 2), "utf8");
            res.status(201).send();
            break;
        case "PUT": // update
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < payload.length; j++) {
                    if (data[i].id === payload[j].id) {
                        data[i] = payload[j];
                    }
                }
            }
            res.send(data.filter(item => item.active));
            await fsp.writeFile(DATA_GTD, JSON.stringify(data, null, 2), "utf8");
            break;
        default:
            res.status(405).send();
            break;
    }
});

// JIRA

server.put("/jira", async (req, res) => {
    const payload = req.body;
    console.log(`storing jira: ${payload.length} items`);
    await fsp.writeFile("data/jira.json", JSON.stringify(payload, null, 2), "utf8");
    res.send("ok");
});

// dynamic links ('guerrilla')

server.put("/guerrilla", async (req, res) => {
    const payload = req.body;
    console.log(`storing guerrilla: ${payload.length} items`);
    await fsp.writeFile("data/guerrilla.json", JSON.stringify(payload, null, 2), "utf8");
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
        safeRead(DATA_GTD),
        safeRead(DATA_JIRA),
        safeRead(DATA_GUERRILLA)
    ]);
    const winTips = JSON.parse(resolved[0]);
    const macTips = JSON.parse(resolved[1]);
    const tips = winTips.concat(macTips);
    await res.json({
        prev: tips[prev],
        curr: tips[curr],
        gtd: JSON.parse(resolved[2]).filter(item => item.active),
        jira: JSON.parse(resolved[3]).slice(0, 4),
        guerrilla: JSON.parse(resolved[4]).filter(item => item.active)
    });
});

async function safeRead(filePath) {
    if (!fs.existsSync(filePath)) {
        await fsp.writeFile(filePath, "[]", "utf8");
    }
    return fsp.readFile(filePath, "utf8");
}

// shortcuts page

server.get("/shortcuts/:platform", (req, res) => {
    res.set("Content-Type", "application/json");
    res.sendFile(path.join(__dirname, "assets", `shortcuts-${req.params.platform}.json`));
});

// hacker news

server.get("/hn", (req, res) => {
    res.json(db.get("hackerNews").value() || []);
});

// endregion

server.listen(PORT);
console.log(`Homepage ready at http://localhost:${PORT}`);
