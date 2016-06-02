const express = require('express');
const app = express();
const fs = require('fs');
const VIDEO = "jellyfish-3-mbps-hd-h264.mkv";
const DATA = "cxnData.txt"

let connections_set = new Set();
app.get('/', (req, res) => {
  console.log('a connection!');
  if(! (connections_set.has(req.headers)) ) {
    connections_set.add(req.headers);
    const headerData = `Connnection:\n ${JSON.stringify(req.headers,null,4)}\n`;
    fs.appendFile(DATA, headerData, err => {
    if(err) return console.log(err);
  });
  }
  const options = {
    root: __dirname,
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };
  res.download(`./${VIDEO}`,VIDEO);
});

app.listen(8080, () => {
  console.log('Example app listening on port 8080!');
});
