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

//SETUP CODE
app.use('/', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({
	 extended: true
}));
app.use(bodyParser.json());
let connections_map = new Map();

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
		.then(db=>db.collection('versions'))
		.then(collection=>collection.find())
		.then(cursor=>cursor.toArray())
		.then(data=>JSON.stringify(data,null,4));
	Promise.all([currentDB_promise,historicalDB_promise])
		.then(arr=>res.render('index',{dbCurrent:arr[0], dbHistory:arr[1]}));
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

app.get('/db', (req, res) => {
	Device.find().then( docs => {
		res.send(docs);
	});
});

//Server Startup
app.listen(process.env.PORT || 3000,'0.0.0.0',() => {
	console.log(`Example app listening on port ${process.env.PORT || 3000}!`);
});
