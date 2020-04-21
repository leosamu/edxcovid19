var express = require('express');
const db = require('../db');
var router = express.Router();
var fs = require('fs');
var csvParser = require('csv-parse');
const nodemailer = require("nodemailer");
const settings = require('../config/settings');

var log_file = fs.createWriteStream('logs/debug.log', {flags : 'a'});
let processing = false;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send(settings.mail_confs.filter.toString());
	log_file.write('raiz get' + '\n');
});

router.post('/request', async (req, res, next) => {	
	try{
		let pnum = await db.numlicenses(req.body.email);	
		if (pnum<db.maxlicenses){
			let userlimit = db.maxlicenses - pnum;
			let newlicences = 1;//Math.min(parseInt(req.body.number),userlimit);
			let todayDate = new Date().toISOString().slice(0,10);
			let regupv = settings.mail_confs.filter
			if (regupv.test(req.body.email)){					
					let preqlicence = await db.reqlicense(req.body.email,todayDate);						
					//actualmente estamos esperando a recibir nuevos codigos de edx, en cuanto estén disponibles
					res.status(201).send(settings.lang.processing);
				}else{
					res.status(201).send(settings.lang.invaliddomain);	
				}
		}else{
			res.status(201).send(settings.lang.limitreached);	
			}
		log_file.write(pnum.toString());
	}catch(e){
		log_file.write("Error creando peticion:" + e.message);
	}	
});

router.get('/load', async (req, res, next) => {
	//update and move the readdir stuff to another async method
	if (processing ==true)
	{
		res.send('processing previous tasks');
	}
	else{	
		processing = true;
		try{
			await fs.readdir("edxlicences/new/", (err,files) => {
				if (err) {
					log_file.write('Unable to scan directory: ' + err + '\n');
				} 
				files.forEach(function(file){	
					let filepath = "edxlicences/new/" + file
					fs.createReadStream(filepath)
						.on('error', () => {
						log_file.write('errorcreatingstream');
						// handle error
					})
						.pipe(csvParser())
						.on('data', async (row) => {
						// use row data
						try{

							if (row['0'] !='Code' && row[0] !='This row applies to all vouchers')
							{
								let results = await db.createlic('EDXORG',row[0],row[5]);		  

								let str = `added licence ${row[0]} with ${row[5]}\n`
								log_file.write(str);
							}

						}catch(e){
							log_file.write(e);
						}				
					})
						.on('end', () => {
						// handle end of CSV
						fs.rename( "edxlicences/new/" + file,  "edxlicences/processed/" + file, function (err) {
							if (err) {
								log_file.write('error moving licence file\n');	
							}					
						});
					})			
				});
			});				
		}catch(e){
			log_file.write('Error asignando licencias:' +e.message);	
		}
		processing = false;
		res.send('License files loaded into the database.');
	}	
});


function sendMail(receiver,licences){
	return new  Promise((resolve,reject) => {		
	try{
		if (receiver !='')
		{

			let codigoslicencia =''
			for (i=0;i<licences.length;i++)
			{
				codigoslicencia += '\n' + licences[i];
			}

			let transporter = nodemailer.createTransport({
				host: settings.mail_confs.smtphost,
				port: settings.mail_confs.smtpport,
				secure: settings.mail_confs.smtpsecure, // true for 465, false for other ports					
			});	
			
			var mailOptions = {
				from: settings.mail_confs.mailFrom, // sender address
				to: receiver, // list of receivers
				subject: settings.mail_confs.mailSubject, // Subject line				
				text: settings.mail_confs.mailTextMain + codigoslicencia + settings.mail_confs.mailTextFooter, // plain text body
			};
			
			transporter.sendMail(mailOptions, (error, response)=>{
				if(error){
					reject(error);
				}
				else{
					resolve(response.message);					
				}   
			});
			sleep(100);
			
		}
		else{
			resolve('empty');
			}
	}catch(e){
		reject(e);
	} 
});
}


router.get('/mailing',async function(req, res, next) {
	let results = await db.getmailing();	
	
	let emails = {}
	for (i=0;i<results.length;i++) {
		let user = results[i]['email'];
		if (!emails[user]) {
			emails[user] = {
				'id' : [],
				'licenses' : []
			};
		}
		emails[user]['id'].push(results[i]['id']);
		emails[user]['licenses'].push(results[i]['licencia']);
	}
	
	let result='ok';
	for (var email in emails)
	{
		try {
			let mailsent = await sendMail(email,emails[email]['licenses']);	
			let results = await db.updatemailing(emails[email]['id']);
		} catch(e) {
			try{
				let results = await db.updatecountmailing(emails[email]['id']);
			} catch(e){
				result = e;
			}
			result = e;
		}
	}
	try {
		let results = await db.freelicencesrequest();
	} catch(e){
		result = e;
	}
	res.send(result);
});



function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }



router.get('/assign', async (req, res, next) => {  	
	if (processing ==true)
	{
		res.send('processing previous assign');
	}
	else{	
	processing = true;
	try{
		let pendientes = await db.getpendientes();		
		for (i =0; i<pendientes.length;i++)
		{
			let licencialimpia = await db.getlicencialimpia();
			let assignada = await db.assignarlicencia(pendientes[i],licencialimpia[0]['idlicencias']);			
			sleep(10);
		}			
	}catch(e){
		res.send('Error asignando licencias:' +e.message);
		log_file.write('Error asignando licencias:' +e.message);	
	}		
	processing = false;
    res.send('licencias asignadas');		
	}	
});


module.exports = router;