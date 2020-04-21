function requestlicences(email,numlicences){
	var regupv = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@.*upv.es$/
	
	if (regupv.test(email)){
		var settings = {
		  "url": "./licences/request",
		  "method": "POST",
		  "timeout": 0,
		  "headers": {
			"Content-Type": "application/x-www-form-urlencoded"
		  },
		  "data": {
			"email": email,
			"number": numlicences.toString()
		  }
		};

		$.ajax(settings).done(function (response) {	  
				window.alert(response);
			});
	}
	else{
	 window.alert("El dominio del correo no es válido");
	}
}