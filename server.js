/* eslint-env node */
'use strict';

const PORT = 7086;

const SHORTCUTS_WIN = 'assets/shortcuts-win.json';
const SHORTCUTS_MAC = 'assets/shortcuts-mac.json';
const DATA_GTD = 'data/gtd.json';
const DATA_JIRA = 'data/jira.json';
const DATA_GUERRILLA = 'data/guerrilla.json';

const path = require('path');
const fsp = require('fs').promises;
const morgan = require('morgan');
const express = require('express');

const server = express();

server.use('/public', express.static('public'));
server.use(express.json());
server.use(morgan('common'));

// const low = require('lowdb');
// const FileSync = require('lowdb/adapters/FileSync');

// region Routes

server.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'homepage.html')));

server.all('/gtd', async (req, res) => {
  const payload = req.body;
  const data = JSON.parse(await fsp.readFile(DATA_GTD, 'utf8'));
  switch (req.method) {
    case 'GET':
      res.send(data);
      break;
    case 'POST': // create
      data.unshift(payload);
      await fsp.writeFile(DATA_GTD, JSON.stringify(data, null, 2), 'utf8');
      res.status(201).send();
      break;
    case 'PUT': // update
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < payload.length; j++) {
          if (data[i].id === payload[j].id) {
            data[i] = payload[j];
          }
        }
      }
      res.send(data.filter(item => item.active));
      await fsp.writeFile(DATA_GTD, JSON.stringify(data, null, 2), 'utf8');
      break;
    default:
      res.status(405).send();
      break;
  }
});

// JIRA

server.put('/jira', async (req, res) => {
  const payload = req.body;
  console.log(`storing jira: ${payload.length} items`);
  await fsp.writeFile('data/jira.json', JSON.stringify(payload, null, 2), 'utf8');
  res.send('ok');
});

// dynamic links ('guerrilla')

server.put('/guerrilla', async (req, res) => {
  const payload = req.body;
  console.log(`storing guerrilla: ${payload.length} items`);
  await fsp.writeFile('data/guerrilla.json', JSON.stringify(payload, null, 2), 'utf8');
  res.send('ok');
});

// yibasuo

server.get('/all', async (req, res) => {
  const prev = req.query['prev'] || Math.floor(Math.random() * 304);
  const curr = req.query['curr'] || Math.floor(Math.random() * 304);

  res.set('Content-Type', 'application/json');

  const resolved = await Promise.all([
    fsp.readFile(SHORTCUTS_WIN, 'utf8'),
    fsp.readFile(SHORTCUTS_MAC, 'utf8'),
    fsp.readFile(DATA_GTD, 'utf8'),
    fsp.readFile(DATA_JIRA, 'utf8'),
    fsp.readFile(DATA_GUERRILLA, 'utf8')
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

// shortcuts page

server.get('/shortcuts/:platform', (req, res) => {
  res.set('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, 'assets', `shortcuts-${req.params.platform}.json`));
});

// endregion

server.listen(PORT);
console.log(`Homepage ready at http://localhost:${PORT}`);
