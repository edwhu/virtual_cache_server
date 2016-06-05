'use strict'
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const md5File = require('md5-file');
const app = express();
const fs = require('fs');

const VIDEO = "jellyfish-3-mbps-hd-h264.mkv";
const DATA = "cxnData.txt";
const FILESIZE = fs.statSync(VIDEO).size;
const HASH = 'hash.txt';

md5File(`./${VIDEO}`, (err,hash) => {
  console.log(hash);
  fs.writeFile(HASH, hash, err => {
    if(err) return console.log(err);
  });
});
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
fs.writeFileSync(DATA,'');
//let connections_set = new Set();
let connections_map = new Map();
app.get('/download', (req, res) => {
  // //if(! (connections_set.has(req.headers)) ) {
  // //  connections_set.add(req.headers);
  //   const headerData = `Connnection:\n ${JSON.stringify(req.headers,null,4)}\n`;
  //   fs.appendFile(DATA, headerData, err => {
  //   if(err) return console.log(err);
  //   });
  // //}
  // let time = Date.now();
  // res.download(`./${VIDEO}`,VIDEO, err => {
  //   time = Date.now() - time;
  //   time/=1000; //convert to seconds.
  //   console.log(`time elapsed: ${time} seconds`);
  //   let ratio = (FILESIZE/1000000)/time;
  //   fs.appendFile(DATA, `ratio:\n${ratio} mb/s\n`, err => {
  //     if(err) return console.log(err);
  //   });
  // });
  let currentDevice = req.headers['user-agent'];
  //calculate the ratio
  let time = Date.now();
  res.download(`./${VIDEO}`, VIDEO, err => {
    time = Date.now() - time;
    time/=1000; //convert to seconds.
    console.log(`time elapsed: ${time} seconds`);
    let ratio = (FILESIZE/1000000)/time;
    connections_map.set(currentDevice, { filesize:FILESIZE,time:time,ratio:ratio});
    //populate file with map async
    connections_map.forEach( (v,k) => {
      const cxnData = `\nConnection:\n ${JSON.stringify(k,null,4)}\nData:${JSON.stringify(v,null,4)}\n`;
      fs.writeFileSync(DATA, cxnData);
    });
  });
});

let nameSet = new Set();
app.post('/names', (req, res) => {
  nameSet.add(req.body.name);
  console.log(`there are ${nameSet.size} unique names`);
});

app.get('/logs', (req, res) => {
  res.download(`./${DATA}`, `${Date.now()}_log.txt`);
});

app.listen(process.env.PORT || 3000,'0.0.0.0',() => {
  console.log(`Example app listening on port ${process.env.PORT || 3000}!`);
});
