#!/usr/bin/env nodejs
'use strict'
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');// Use bluebird
const version = require('mongoose-version');


const VIDEO = 'jellyfish-3-mbps-hd-h264.mkv';
const DATA = 'cxnData.txt';
const FILESIZE = fs.statSync(VIDEO).size;
const HASH = 'hash.txt';

//SETUP CODE
app.use('/', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({
	 extended: true
}));
app.use(bodyParser.json());
let connections_map = new Map();
let nameSet = new Set();

//DB setup
const db = mongoose.connection;
const deviceSchema = mongoose.Schema({
	name: String,
	location: Array,
	cache:[{name:String, size:Number}],
	d2d:Number,
	time:Number
});
deviceSchema.plugin(version);
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
app.get('/', function (req, res) {
	const currentDB_promise = Device.find().exec();
	const historicalDB_promise =
		MongoClient
		.connect('mongodb://localhost:27017/virtualcache')
		.then(x=>x.collection('versions'))
		.then(collection=>collection.find())
		.then(cursor=>cursor.toArray())
		.then(data=>JSON.stringify(data,null,4));
	Promise.all([currentDB_promise,historicalDB_promise])
		.then(arr=>res.render('index',{dbCurrent:arr[0], dbHistory:arr[1]}));
});

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

//Json version of logs
app.post('/logs', (req, res) => {
	res.end();
	const query = {'name':req.body.name};
	Device.findOne(query,(err,result) => {
		if(result == null) {
			const device = new Device(req.body);
			device.save().catch(err=>console.error(err));
		} else {
			result.location = req.body.location;
			result.cache = req.body.cache;
			result.d2d = req.body.d2d;
			result.time = req.body.time;
			result.save().catch(err=>console.error(err));
		}
	});
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

app.get('/db', (req, res) => {
	Device.find().then( docs => {
		res.send(docs);
	});
});

//Server Startup
app.listen(process.env.PORT || 3000,'0.0.0.0',() => {
	console.log(`Example app listening on port ${process.env.PORT || 3000}!`);
});
