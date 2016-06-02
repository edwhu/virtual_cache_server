const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const VIDEO = "jellyfish-3-mbps-hd-h264.mkv";
const DATA = "cxnData.txt";
const FILESIZE = 11202628;

fs.writeFileSync(DATA,'');
//let connections_set = new Set();
app.get('/download', (req, res) => {
  console.log('a connection!');
  //if(! (connections_set.has(req.headers)) ) {
  //  connections_set.add(req.headers);
    const headerData = `Connnection:\n ${JSON.stringify(req.headers,null,4)}\n`;
    fs.appendFile(DATA, headerData, err => {
    if(err) return console.log(err);
    });
  //}
  const options = {
    root: __dirname,
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };
  let time = Date.now();
  res.download(`./${VIDEO}`,VIDEO, err => {
    time = Date.now() - time;
    time/=1000; //convert to seconds.
    console.log(`time elapsed: ${time} seconds`);
    let ratio = (FILESIZE/1000000)/time;
    fs.appendFile(DATA, `ratio:\n${ratio} mb/s\n`, err => {
      if(err) return console.log(err);
    });
  });

});
app.use('/', express.static(path.join(__dirname, 'public')));
app.listen(8080, () => {
  console.log('Example app listening on port 8080!');
});

//promise version of fs.stat
// const fileSize = file => {
//   return new Promise (( resolve, reject ) => {
//     fs.stat(file, (err, stat) => {
//       if(err) return reject(err);
//       resolve(stat.size);
//     });
//   });
// }
