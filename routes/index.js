var express = require('express');
var router = express.Router();
const settings = require('../config/settings');

/* GET home page. */


router.get('/', function(req, res, next) {  
  //normal|maintenance|nolic  
  //TODO- Switch render page depending on the mode
  res.render('index', { title: 'edXcovid 2019' });  
});

module.exports = router;
