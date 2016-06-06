#!/usr/bin/env nodejs
'use strict'
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const md5File = require('md5-file');
const app = express();
const fs = require('fs');

const VIDEO = 'jellyfish-3-mbps-hd-h264.mkv';
const DATA = 'cxnData.txt';
const FILESIZE = fs.statSync(VIDEO).size;
const HASH = 'hash.txt';

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

md5File(`./${VIDEO}`, (err,hash) => {
  let hash_data = JSON.stringify({name:VIDEO, hash:hash});
  fs.writeFile(HASH, hash_data);
});

let connections_map = new Map();
app.get('/download', (req, res) => {
  let currentDevice = req.headers['user-agent'];
  //calculate the ratio
  let time = Date.now();
  res.download(`./${VIDEO}`, VIDEO, err => {
    time = Date.now() - time;
    time/=1000; //convert to seconds.
    console.log(`time elapsed: ${time} seconds`);
    let ratio = (FILESIZE/1000000)/time;
    let now = new Date();
    connections_map.set(currentDevice,
      {date:`${now.getMonth()}:${now.getDate()}:${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
      filesize:FILESIZE,time:time,ratio:ratio});
    res.end();
  });
});

let nameSet = new Set();
app.post('/names', (req, res) => {
  nameSet.add(req.body.name);
  res.end();
});

app.get('/logs', (req, res) => {
  //populate file with map async
  connections_map.forEach( (v,k) => {
    const cxnData = {Connection:k, Data:v};
    fs.appendFileSync(DATA, JSON.stringify(cxnData,null,4));
  });
  res.download(`./${DATA}`, `${Date.now()}_log.txt`, err => res.end());
});

app.get('/hash', (req, res) => res.download(`./${HASH}`, 'hash.txt', err => res.end()));

app.get('/erase', (req, res) => {
  connections_map.clear();
  fs.writeFile(DATA,'', err => res.end());
});

app.listen(process.env.PORT || 3000,'0.0.0.0',() => {
  console.log(`Example app listening on port ${process.env.PORT || 3000}!`);
});
