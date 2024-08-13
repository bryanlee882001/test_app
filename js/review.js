var ReviewModule = (function () {
	var reviewOptions = null;
	
	var setDefaultOptions = function () {
		KfxWebSDK.ReviewControl.getDefaultOptions( 
		  function (options){
			  reviewOptions = options;
			  //Modify review buttons text using below settings.
			  reviewOptions.acceptButton.text = "Accept";
			  reviewOptions.retakeButton.text = "Retake";
			  reviewOptions.nextButton.text = "Next";
		  },
		  function (error) {
				console.log("Error while getting review options are " + error);
			}
		);
	};
	setDefaultOptions();
	var showReviewControl = function (containerId, imageData, reviewOptions, acceptCallBack, retakeCallBack) {
		var reviewControl = new KfxWebSDK.ReviewControl(containerId, reviewOptions);
		reviewControl.review(
			imageData,
			function () {
				if (typeof acceptCallBack === "function") {
					acceptCallBack();
				}
			},
			function () {
				if (typeof retakeCallBack === "function") {
					retakeCallBack();
				}
			}
		);
	};

	return {
		reviewOptions:reviewOptions,
		showReviewControl: showReviewControl,
	};
})();
