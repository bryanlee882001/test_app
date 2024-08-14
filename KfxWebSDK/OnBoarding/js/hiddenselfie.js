var HiddenSelfieModule = (function () {
	var videoPlayer;
	var streamCopy;

	var startCamera = function () {
		videoPlayer = document.createElement("video");
		videoPlayer.setAttribute("playsinline", true);
		videoPlayer.setAttribute("autoplay", true);
		var iOSVersion = Utils.iOSVersion();
		if (window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia) {
			if(Utils.isIOSDevice() && iOSVersion[0]<=16){
             window.navigator.mediaDevices
             .getUserMedia({
					video: { facingMode: "environment", width: 640, height: 480},
					audio: false,
				}) 
			
				.then(function (stream) {
			         // Create an object URL for the video stream and
					// set it as src of our HTLM video element.
					try {
						videoPlayer.srcObject = stream;
					} catch (error) {
						videoPlayer.src = compatibility.URL.createObjectURL(stream);
					}
					streamCopy = stream;
				})
				.catch(function (err) {
					console.log("There was an error with accessing the camera stream: " + err.name, err);
				});

			}else{
					window.navigator.mediaDevices
				        .getUserMedia({
					video: { facingMode: { exact: "user" }, width: 640, height: 480 },
					audio: false,
				 })
				.then(function (stream) {
					// Create an object URL for the video stream and
					// set it as src of our HTLM video element.
					try {
						videoPlayer.srcObject = stream;
					} catch (error) {
						videoPlayer.src = compatibility.URL.createObjectURL(stream);
					}
					streamCopy = stream;
				})
				.catch(function (err) {
					console.log("There was an error with accessing the camera stream: " + err.name, err);
				});
			}
		
		} else {
			var getUserMedia =
				window.navigator.getUserMedia ||
				window.navigator.webkitGetUserMedia ||
				window.navigator.mozGetUserMedia ||
				window.navigator.msGetUserMedia;
			getUserMedia(
				{
					video: { facingMode: { exact: "user" }, width: 640, height: 480 },
					audio: false,
				},
				function (stream) {
					// Create an object URL for the video stream and
					// set it as src of our HTLM video element.
					try {
						videoPlayer.srcObject = stream;
					} catch (error) {
						videoPlayer.src = compatibility.URL.createObjectURL(stream);
					}
					streamCopy = stream;
				},
				function (err) {
					console.log("There was an error with accessing the camera stream: " + err.name, err);
				}
			);
		}
	};

	var stopCamera = function () {
		if (streamCopy) {
			var tracks = streamCopy.getVideoTracks();
			for (var i = 0; i < tracks.length; i++) {
				tracks[i].stop();
			}
		}
		streamCopy = null;
		if (videoPlayer != null) {
			videoPlayer.src = "";
		}
		videoPlayer = null;
	};

	var takeSelfie = function () {
		// Here we're using a trick that involves a hidden canvas element.
		var hidden_canvas = document.createElement("canvas");
		hidden_canvas.setAttribute("width", 480);
		hidden_canvas.setAttribute("height", 640);
		//var hidden_canvas = document.querySelector('canvas'),
		var hiddenContext = hidden_canvas.getContext("2d");

		var width = videoPlayer.videoWidth,
			height = videoPlayer.videoHeight;

		if (width && height) {
			// Make a copy of the current frame in the video on the canvas.
			hiddenContext.drawImage(videoPlayer, 0, 0);
			var imageData = hiddenContext.getImageData(0, 0, width, height);
			// Turn the canvas image into a dataURL that can be used as a src for our photo.
			var dataUrl = Utils.convertImageDataToDataURL(imageData);
			var base64 = dataUrl.replace(/^data:image\/(jpeg|png|jpg);base64,/, "");
			return base64;
		}
	};

	return {
		startCamera: startCamera,
		stopCamera: stopCamera,
		takeSelfie: takeSelfie,
	};
})();
