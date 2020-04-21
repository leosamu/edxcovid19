let settings = {};

settings.dbconf = {
    connectionLimit: 10,
    password: 'yourpassword',
    user: 'youruser',
    database:'licences',
    host:'localhost',
    port:'3306'
};

settings.mail_confs = {
    filter: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@.*upv.*.es$/,
    mailFrom: '"MOOCS UPV" <examplemail@yourdomain.whatever>',
    mailSubject: " Aquí tienes tu código de certificado verificado gratuito",
    mailTextMain: "Recibes este correo porque te has registrado recientemente en el  programa de certificados verificados gratuitos para cursos MOOC, ofertado por la Universidad Politécnica de Valencia en colaboración  con edX y otras universidades.  A continuación encontrarás el código solicitado.\n",
    mailTextFooter: "\nTienes las intruciones para utilizarlo en\nhttps://edxcovid19.webs.upv.es/faq.html",
    smtphost:"your.smtp.server",
    smtpport:"your.smtp.port",
    smtpsecure:false //true for 465, false for other ports
};

//alert messages launched when a request is received
//processing: ok message
//invalid domain: incorrect domain 
//max licences surpassed

settings.lang = {
    processing: 'Su petición se esta procesando, en breve recibirá un email con la licencia y los pasos a seguir para utilizarla',
    invaliddomain: 'El dominio del correo no es válido, pero pongase en contacto con nosotros indicando que ha visto un grillo',
    limitreached: 'Número máximo de licencias solicitadas, si precisa de más licencias pongase en contacto con nosotros a través de algúno de los medios indicados más abajo.'
};


//url for your server licences api
settings.tasks_rest = {
    assign : 'https://yourserver/licences/assign',
    mailing : 'https://yourserver/licences/mailing'    
}

settings.mode='normal'; //normal|maintenance|nolic

settings.maxlicences=5; //number of licences per mail account

settings.periodic_tasks=false;//false disables periodic assing and mailing tasks, true activates them so it repeats each 15mins

module.exports = settings;