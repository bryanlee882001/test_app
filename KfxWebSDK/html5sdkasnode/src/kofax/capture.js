const defaultMobileIdAspectRatio = 0.629;
const defaultPaddingPercent = 14;

const Capture = (KfxWebSDK) => {
	let mobileIdCameraOptions = null, mobileIdCaptureOptions = null;

	const setDefaultOptions = function(){
		KfxWebSDK.Capture.getDefaultOptions(function(defaultOptions){

			mobileIdCaptureOptions = Object.assign({}, {}, defaultOptions);

			mobileIdCaptureOptions.framePadding =  defaultPaddingPercent;
			mobileIdCaptureOptions.frameAspectRatio =  defaultMobileIdAspectRatio;
      mobileIdCaptureOptions.criteria.turnSkewAngleTolerance = 90;
      
		},function(error){
			console.log("Error while getting options are "+ error);
		});
	};
	
	setDefaultOptions();
	
	const performStandardCapture = function(cameraOptions,successCallback,errorCallback){
		KfxWebSDK.Capture.create(cameraOptions,function(createSuccess){
			KfxWebSDK.Capture.takePicture(function(imageData){
        console.log('success')
				sendCallback(successCallback,imageData);
			},function(takePictureError){
				console.log("Error while take picture is "+takePictureError.message);
				sendCallback(errorCallback,takePictureError.message);
			});
		},function(createError){
			alert("Camera is unavailable");
			console.log("Error while creating capture is "+createError.message);
			sendCallback(errorCallback,createError.message);
		});
  };
  
  const performAdvancedCapture = function(cameraOptions,captureOptions,successCallback,errorCallback){

    console.log(cameraOptions)
    console.log(captureOptions)
		//Set the boolean value to false when the camera is launched successfully 
		window.cameraDisabled=false;
		KfxWebSDK.Capture.destroy(function(){
			KfxWebSDK.Capture.create(cameraOptions,function(createSuccess){
				KfxWebSDK.Capture.setOptions(captureOptions,function(setOptionsSuccess){
					KfxWebSDK.Capture.takePicture(function(imageData){
						sendCallback(successCallback,imageData);
					},function(takePictureError){
						console.log("Error while take picture is "+takePictureError.message);
						sendCallback(errorCallback,takePictureError.message);
					});
				},function(setOptionsError){
					console.log("Error while setting options is "+setOptionsError.message);
					sendCallback(errorCallback,setOptionsError.message);
				});
			},function(createError){
				//When camera is not created due to secuity reasons this error code is returned
				if(createError.code === KfxWebSDK.ERROR_CODE_MEDIA){
				  //Set the boolean value to true as camera is disabled
	              window.cameraDisabled=true;
				}
				console.log("Error while creating capture is "+createError.message);
				sendCallback(errorCallback,createError.message);
			});
		},function(forceDestroyError){
			console.log("Error while force destroying resources is "+forceDestroyError.message);
			sendCallback(errorCallback,forceDestroyError.message);
		});
	};
	
	const stopCapture = function(successCallback,errorCallback){
		KfxWebSDK.Capture.stopCapture(function(stopCaptureSuccess){
			sendCallback(successCallback,stopCaptureSuccess);
		},function(stopCaptureError){
			console.log("Error while stop capture is "+stopCaptureError.message);
			sendCallback(errorCallback,stopCaptureError);
		});
	};

	const destroy = function(){
		KfxWebSDK.Capture.destroy(function() {}, function(destroyError) {
			console.log("Error while destroy capture is "+destroyError.message);
		});
	};
	
	const sendCallback = function(callback,data){
		if (typeof callback === 'function') {
			callback(data);
		}
  };
	
	return {
		mobileIdCameraOptions:mobileIdCameraOptions,
		mobileIdCaptureOptions:mobileIdCaptureOptions,
    	performStandardCapture:performStandardCapture,
    	performAdvancedCapture:performAdvancedCapture,
		stopCapture:stopCapture,
		destroy:destroy
	};
};

export default Capture