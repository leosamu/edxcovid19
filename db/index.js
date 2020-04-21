var fs = require('fs');
var log_file = fs.createWriteStream('logs/debug.log', {flags : 'a'});
var processing = false;
const settings = require('../config/settings');
const mysql = require('mysql');

const pool = mysql.createPool(settings.dbconf);

let licencesdb = {}

licencesdb.maxlicenses = settings.maxlicences;

licencesdb.numlicenses = (email) =>{
	 return new  Promise((resolve,reject) => {		
		 try{
		   pool.query('select count(*) as num from solicitudes WHERE email = ? and anulada=0',[email],(err,results)=>{
			  if (err){							
				  reject(err);
			  }
			  else{
				  resolve(results[0]['num']);		
			  }
          });
		 }catch(e){
		 	reject(e);
		 } 
    });
}

licencesdb.getmailing = (email) =>{
	 return new  Promise((resolve,reject) => {		
		 try{
		   pool.query('SELECT solicitudes.id,email,licencias.licencia,url,enviada,countenvios,solicitudes.anulada FROM `solicitudes`,licencias WHERE solicitudes.licencia=licencias.idlicencias and solicitudes.enviada is NULL and solicitudes.anulada <> 1 and solicitudes.countenvios < 3 ORDER BY email',(err,results)=>{
			  if (err){							
				  reject(err);
			  }
			  else{
				  resolve(results);		
			  }
          });
		 }catch(e){
		 	reject(e);
		 } 
    });
}

licencesdb.reqlicense = (email,todayDate) => {
	 return new  Promise((resolve,reject) => {
		 try{
			 pool.query("INSERT INTO solicitudes (email,fecha) VALUES (?,?)",[email,todayDate],(err,results)=>{
				 if (err){							
					 reject(err);
				 }
				 else{
					 resolve('ok');		
				 }
			 });
		 }catch(e){
		 	reject(e);
		 }
				
    });
}
 
licencesdb.freelicencesrequest = () => {
	 return new  Promise((resolve,reject) => {		 
		 try{
			 pool.query("UPDATE solicitudes SET licencia=null where solicitudes.countenvios>=3",[],(err,results)=>{
				 if (err){							
					 reject(err);
				 }
				 else{
					 resolve('ok');		
				 }
			 });
		 }catch(e){
		 	reject(e);
		 }
				
    });
}


licencesdb.updatecountmailing = (solicitudesId) => {
	 return new  Promise((resolve,reject) => {		 
		 try{
			 pool.query("UPDATE solicitudes SET countenvios=countenvios+1 where id in (?)",[solicitudesId],(err,results)=>{
				 if (err){							
					 reject(err);
				 }
				 else{
					 resolve('ok');		
				 }
			 });
		 }catch(e){
		 	reject(e);
		 }
				
    });
}

licencesdb.updatemailing = (solicitudesId) => {
	 return new  Promise((resolve,reject) => {
		 let todayDate = new Date().toISOString().slice(0,10);		 
		 try{
			 pool.query("UPDATE solicitudes SET enviada=? where id in (?)",[todayDate,solicitudesId],(err,results)=>{
				 if (err){							
					 reject(err);
				 }
				 else{
					 resolve('ok');		
				 }
			 });
		 }catch(e){
		 	reject(e);
		 }
				
    });
}


licencesdb.createlic = (platform,license,url) =>{	
		return new  Promise((resolve,reject) => {
			try{
				pool.query('INSERT INTO licencias (plataforma,licencia,url) VALUES (?,?,?)',[platform,license,url],(err,results)=>{
					if (err){
						log_file.write("error inserting the license " + license + "\n");
						reject(err);
					}
				});
				resolve("ok");
			}catch(e){
			reject(e);
			}
    	});
    
}

licencesdb.getpendientes = () => {
	return new Promise((resolve,reject) => {
		try{
				pool.query("SELECT id,email,licencia,fecha FROM solicitudes WHERE licencia is NULL and countenvios<3 and anulada=0 order by fecha LIMIT 150",[],(err,results)=>{
					if (err){						
						reject(err);
					}
					else{
						resolve(results);	
					}					
				});				
			}catch(e){
			reject(e);
			}
	});
}

licencesdb.getlicencialimpia = () => {
	return new Promise((resolve,reject) => {
		try{
				pool.query("select idlicencias from licencias where licencias.idlicencias not in (select licencia from solicitudes where licencia is not null) and anulada=0 ORDER by idlicencias LIMIT 1",[],(err,results)=>{
					if (err){						
						reject(err);
					}
					else{
						resolve(results);	
					}					
				});				
			}catch(e){
			reject(e);
			}
	});
}

licencesdb.assignarlicencia = (pendiente,idlicencia) => {
	return new Promise((resolve,reject) => {
		try{
				pool.query("UPDATE solicitudes SET licencia = ? WHERE id = ?",[idlicencia,pendiente['id']],(err,results)=>{
					if (err){						
						reject(err);
					}
					else{
						resolve('updated');	
					}					
				});				
			}catch(e){
			reject(e);
			}
	});
}

module.exports = licencesdb;