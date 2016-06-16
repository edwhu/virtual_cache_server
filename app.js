#!/usr/bin/env nodejs
'use strict'
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const md5File = require('md5-file');
const app = express();
const fs = require('fs');
const multer = require('multer');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');// Use bluebird

const VIDEO = 'jellyfish-3-mbps-hd-h264.mkv';
const DATA = 'cxnData.txt';
const FILESIZE = fs.statSync(VIDEO).size;
const HASH = 'hash.txt';

//SETUP CODE
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
	 extended: true
}));
app.use(bodyParser.json());
let connections_map = new Map();
let nameSet = new Set();
// const storage = multer.diskStorage({
// 		destination: function (req, file, cb) {
// 				cb(null, './logs');
// 		},
// 		filename: function (req, file, cb) {
// 				cb(null, `${Date.now()}_log.txt`);
// 	}
// });
// const upload = multer({storage:storage});
//DB setup
const db = mongoose.connection;
const deviceSchema = mongoose.Schema({
	name: String,
	location: Array,
	cache:[{name:String, size:Number}],
	d2d:Number
});
deviceSchema.set('collection', 'devices')
const Device = mongoose.model('Device', deviceSchema);
//DB start
mongoose.connect('mongodb://localhost:27017/virtualcache');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	// we're connected!
	console.log("MongoDB connected");
});

//ROUTES
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

app.post('/names', (req, res) => {
	nameSet.add(req.body.name);
	res.end();
});

// app.post('/logs', upload.single('log'),(req, res) => {
// 	// console.log(req.body); // form fields
// 	// console.log(req.file); // form files
// 	res.status(204).end();
// });
//Json version of logs
app.post('/logs', (req, res) => {
	res.end();
	const device = new Device({
		name: req.body.name,
		location: req.body.location,
		cache: req.body.cache,
		d2d: req.body.d2d
	});
	console.log(req.body);
	device.save().catch(err => console.error(err));
});

app.get('/logs', (req, res) => {
	//populate file with map async
	connections_map.forEach( (v,k) => {
		const cxnData = {Connection:k, Data:v};
		fs.appendFileSync(DATA, JSON.stringify(cxnData,null,4));
	});
	res.download(`./${DATA}`, `${Date.now()}_log.txt`, err => res.end());
});

app.get('/erase', (req, res) => {
	connections_map.clear();
	fs.writeFile(DATA,'', err => res.end());
});

//Server Startup
app.listen(process.env.PORT || 3000,'0.0.0.0',() => {
	console.log(`Example app listening on port ${process.env.PORT || 3000}!`);
});
