var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const https = require('https');
const settings = require('./config/settings');
var cron = require("node-cron");
const axios = require("axios");

var indexRouter = require('./routes/index');
var licencesRouter = require('./routes/licences');

var app = express();
var fs = require('fs');
var log_file = fs.createWriteStream('logs/debug.log', {flags : 'a'});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/licences', licencesRouter);

const getData = async url => {
  try {
    const response = await axios.get(url);
    const data = response.data;
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

if (settings.periodic_tasks)
{
	cron.schedule("*/15 * * * *", function (){	
		try{			
			getData(settings.tasks_rest.assign);		
		}catch(e){
				console.log("Error: " + e.message);
		}
		try{
			getData(settings.tasks_rest.mailing);		
		}catch(e){
			console.log("Error: " + e.message);
		}
	});
}


module.exports = app;