#!/usr/bin/env nodejs
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');// Use bluebird
const version = require('mongoose-version');
const MONGO_URL = 'mongodb://localhost:27017/virtualcache';
//SETUP CODE
app.use('/', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({
	 extended: true
}));
app.use(bodyParser.json());

//DB setup
const db = mongoose.connection;
const deviceSchema = mongoose.Schema({
	name: String,
	cache:[{name:String, size:Number}],
	d2d:0,
	time:Number,
	loc:Array
});
deviceSchema.plugin(version);
deviceSchema.set('collection', 'devices')
const Device = mongoose.model('Device', deviceSchema);
//DB start
mongoose.connect(MONGO_URL);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	// we're connected!
	console.log('MongoDB connected');
});

var virtual_cache;
MongoClient.connect(MONGO_URL, (err, database) => {
  if(err) throw err;
  virtual_cache = database;
	//Server Startup
	app.listen(process.env.PORT || 3000,'0.0.0.0',() => {
		console.log(`Example app listening on port ${process.env.PORT || 3000}!`);
	});
});
//ROUTES

app.get('/', function (req, res) {
	const currentDB = Device.find().exec();
	const history = virtual_cache
		.collection('versions')
		.find()
		.toArray()
		.then(data=>JSON.stringify(data,null,4));
	Promise.all([currentDB, history])
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
			Object.assign(result,req.body);
			result.save().catch(err=>console.error(err));
		}
	});
});

app.get('/erase', (req,res) => {
	db.collection('versions').drop();
	db.collection('devices').drop();
	res.end();
});
