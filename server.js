/* eslint-env node */
'use strict';

const PORT = 7086;

const path = require('path');
const fsp = require('fs').promises;
const logger = require('pino')({
  prettyPrint: {
    colorize: true,
    translateTime: true
  }
});
const express = require('express');

const server = express();

server.use('/public', express.static('public'));
server.use(express.json());

// region Routes

server.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'homepage.html')));

server.put('/gtd', async (req, res) => {
  logger.info('storing gtd');
  await fsp.writeFile('data/gtd.json', JSON.stringify(req.body, null, 2), 'utf8');
  res.send('ok');
});

// JIRA

server.put('/jira', async (req, res) => {
  logger.info('storing jira');
  await fsp.writeFile('data/jira.json', JSON.stringify(req.body, null, 2), 'utf8');
  res.send('ok');
});

// yibasuo

server.get('/all', async (req, res) => {
  function getTip(winTips, macTips, index) {
    return index < winTips.length ? `[Win] ${winTips[index]}` : `[Mac] ${macTips[index - winTips.length]}`;
  }

  const prev = req.query['prev'] || Math.floor(Math.random() * 304);
  const curr = req.query['curr'] || Math.floor(Math.random() * 304);

  res.set('Content-Type', 'application/json');

  Promise.all([
    fsp.readFile('data/gtd.json', 'utf8'),
    fsp.readFile('data/jira.json', 'utf8'),
    fsp.readFile('shortcuts-win.json', 'utf8'),
    fsp.readFile('shortcuts-mac.json', 'utf8')
  ]).then(resolved => {
        const winTips = JSON.parse(resolved[2]);
        const macTips = JSON.parse(resolved[3]);
        res.send(`{
          "gtd": ${resolved[0]},
          "jira": ${resolved[1]},
          "prev": "${getTip(winTips, macTips, prev)}",
          "curr": "${getTip(winTips, macTips, curr)}"
        }`);
      }
  );
});

// shortcuts page

server.get('/shortcuts/:platform', (req, res) => {
  res.set('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, `shortcuts-${req.params.platform}.json`));
});

// endregion

server.listen(PORT);
logger.info(`Homepage ready at http://localhost:${PORT}`);
