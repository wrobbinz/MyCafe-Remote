$(document).ready(function() {
	var deviceID    = "device ID";
    var accessToken = "Access Token";
    var power = 0; // 0 = off, 1 = on
	var brew = 0; // 1 = brewing, 0 = idle
	var command = ""; // sendData type
	var grindTime = 0; // how long to grind
	var grindSent = 0; // check if grind ended (event listener check)
	var brewSent = 0;
	// initialize by checking if MyCafe is ON or actively brewing
	var requestURL = "https://api.spark.io/v1/devices/" +deviceID + "/" + power + "/";
	power = $.get( requestURL, { access_token: accessToken });
	requestURL = "https://api.spark.io/v1/devices/" +deviceID + "/" + brew + "/";
	brew = $.get( requestURL, { access_token: accessToken });
	// if so, adjust interface accordingly
	if (power == 1){
		$('.power').empty().html('TURN OFF');
	}
	if (brew == 1){
		$('.brew').empty().html('STOP BREWING');
	}

    // power button logic
    $('.power').on('click', function(){
    	command = "power";
    	if (power === 1){
    		power = 0;
    		$('.power').empty().html('TURN ON');
    		$('.grind, .brew').addClass('disabled');
    	}
    	if (power === 0){
    		power = 1;
    		$('.power').empty().html('TURN OFF');
    		$('.grind, .brew').removeClass('disabled');
    	}
    	sendData(command, power);
    });
    // grind button logic
	$('.grind').on('click', function(){
		$(this).fadeOut(250, function(){
			$('.grind-options').fadeIn(250);
		});
	});
	// on click: sendData. If successful, listen for publish(end)
	$('.fine-grind').on('click', function(){
		grindTime = 1;
		command = "grind";
		grindSent = sendData(command, grindTime);
		grindListen(grindSent); // set up event listener, if grindSent = 1, post was successfull
	});
	$('.medium-grind').on('click', function(){
		grindTime = 2;
		command = "grind";
		grindSent = sendData(command, grindTime);
		grindListen(grindSent); // set up event listener, if grindSent = 1, post was successfull

	});
	$('.coarse-grind').on('click', function(){
		grindTime = 3;
		command = "grind";
		grindSent = sendData(command, grindTime);
		grindListen(grindSent); // set up event listener, if grindSent = 1, post was successfull

	});
	// brew button logic
	$('.brew').on('click', function(){
		command = "brew";
    	if (brew === 1){
    		brew = 0;
    		$('.grind').empty().html('BREW');
    	}
    	if (brew === 0){
    		brew = 1;
    		$('.brew').empty().html('STOP BREWING');
    	}
		brewSent = sendData(command, brew);

	});


	var sendData = function(command, data){
		requestURL = "https://api.spark.io/v1/devices/" +deviceID + "/" + command + "/";
		if (command == "power"){
			$.post( requestURL, { params: data, access_token: accessToken });
			//turn on/off
		}
		if (command == "grind"){
			$.post( requestURL, { params: data, access_token: accessToken }, function(){return 1;});
		}
		else if (command == "brew"){
			$.post( requestURL, { params: data, access_token: accessToken }, function(){return 1;});
		}
	};
	var grindListen = function(grindSent){
		grindSent = 1;
		if (grindSent == 1){
			alert('yolo');
			var evtSource = new EventSource(requestURL);
			evtSource.addEventListener("ping", function(e){
				var obj = JSON.parse(e.data);

				$('.grind-options').fadeOut(250, function(){
					$('.grind').empty().html('GRINDING');
					$('.grind').fadeIn(250);
					loading();
				});
				if (obj === "done"){
					clearTimeout(noResponse);
					evtSouce.close();
					$('.grind').empty().html('GRIND COMPLETE').delay(3000).empty().html('GRIND');
				}
			}, false);
		}
		else{
			alert('Post failed');
			return 0;
		}	

	};
	var loading = function(){
		$('.grind').animate({opacity:'1'}, 1000);
    	$('.grind').animate({opacity:'0.5'}, 1000, loading);
	};
});