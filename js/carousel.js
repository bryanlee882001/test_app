var carousel = (function () {
	var repeat = false;

	var onSwipeScreen = function () {
		document.getElementById("one").src = "../images/instructions/flat_surface.GIF";
		$("#replay").hide();
		$("#right-arrow").on("click", function () {
			rightarrow();
		});
		$("#left-arrow").on("click", function () {
			leftarrow();
		});
		$("#left-arrow").hide();
		setTimeout(function () {
			if (!CaptureModule.isAutoCaptureSupported || !cameraOptions.isUseAdvcanceCapture) {
				//standard capture
				document.getElementById("two").src = "../images/instructions/hold_parallel_unsupported.GIF";
				document.getElementById("three").src = "../images/instructions/fit_document_unsupported.GIF";
			} else {
				//advanced capture
				document.getElementById("two").src = "../images/instructions/hold_parallel_supported.GIF";
				document.getElementById("three").src = "../images/instructions/fit_document_supported.GIF";
			}
		}, 300);

		$("#myCarousel").swiperight(function () {
			$("#myCarousel").carousel("prev");
			leftarrow();
		});

		$("#myCarousel").swipeleft(function () {
			$("#myCarousel").carousel("next");
			rightarrow();
		});

		$("#swipe_next").on("click", function () {
			if ($("#swipe_next").text() == "Next") {
				$("#myCarousel").carousel("next");
				rightarrow();
			} else {
				window.history.back();
				//Added below delay to launch the advanced capture while removing the swipe screen from history.
				setTimeout(function () {
					if (CaptureModule.isAutoCaptureSupported && cameraOptions.isUseAdvcanceCapture) {
						$.mobile.navigate("./Capture.html", { transition: "none" });
					} else {
						AppModule.doStandardCapture("frontscreen_front_show");
					}
				}, 300);
			}
		});

		$("#repeat").on("click", function () {
			window.history.go(-1);
			carousel.repeat = true;
			$("capture_1_div1").hide();
		});

		$("#carousel-indicators-id li").on("click", function () {
			if ($(this).attr("id") == "page1") {
				$("#swipe_next").text("Next");
				$("#right-arrow").show();
				$("#left-arrow").hide();
			} else if ($(this).attr("id") == "page2") {
				$("#swipe_next").text("Next");
				$("#right-arrow").show();
				$("#left-arrow").show();
			} else if ($(this).attr("id") == "page3") {
				$("#swipe_next").text("Done");
				$("#right-arrow").hide();
				$("#left-arrow").show();
			}
		});
	};

	//Leftarrow click method
	var leftarrow = function () {
		if ($(".carousel-inner :nth-child(1)").hasClass("active")) {
			onLeftChildOne();
		} else {
			$("#swipe_next").text("Next");
			if ($(".carousel-inner :nth-child(3)").hasClass("active")) {
				onLeftChildThree();
			} else if ($(".carousel-inner :nth-child(2)").hasClass("active")) {
				onLeftChildTwo();
			}
		}
	};

	// Rightarrow click method
	var rightarrow = function () {
		if ($(".carousel-inner :nth-child(2)").hasClass("active")) {
			onRightChildTwo();
		} else {
			$("#swipe_next").text("Next");
			if ($(".carousel-inner :nth-child(1)").hasClass("active")) {
				onRightChildOne();
			} else if ($(".carousel-inner :nth-child(3)").hasClass("active")) {
				onRightChildThree();
			}
		}
	};

	var onRightChildTwo = function () {
		$("#swipe_next").text("Done");
		$("#right-arrow").hide();
		$("#left-arrow").show();
		setTimeout(function () {
			if (!CaptureModule.isAutoCaptureSupported || !cameraOptions.isUseAdvcanceCapture) {
				//standard capture
				document.getElementById("three").src = "../images/instructions/fit_document_unsupported.GIF";
			} else {
				//advanced capture
				document.getElementById("three").src = "../images/instructions/fit_document_supported.GIF";
			}
		}, 300);
	};

	var onRightChildOne = function () {
		$("#right-arrow").show();
		$("#left-arrow").show();
		setTimeout(function () {
			if (!CaptureModule.isAutoCaptureSupported || !cameraOptions.isUseAdvcanceCapture) {
				//standard capture
				document.getElementById("two").src = "../images/instructions/hold_parallel_unsupported.GIF";
			} else {
				//advanced capture
				document.getElementById("two").src = "../images/instructions/hold_parallel_supported.GIF";
			}
		}, 300);
	};

	var onRightChildThree = function () {
		$("#right-arrow").show();
		$("#left-arrow").hide();
		setTimeout(function () {
			document.getElementById("one").src = "../images/instructions/flat_surface.GIF";
		}, 300);
	};

	var onLeftChildOne = function () {
		$("#swipe_next").text("Done");
		$("#right-arrow").hide();
		$("#left-arrow").show();
		setTimeout(function () {
			if (!CaptureModule.isAutoCaptureSupported || !cameraOptions.isUseAdvcanceCapture) {
				//standard capture
				document.getElementById("three").src = "../images/instructions/fit_document_unsupported.GIF";
			} else {
				//advanced capture
				document.getElementById("three").src = "../images/instructions/fit_document_supported.GIF";
			}
		}, 300);
	};

	var onLeftChildThree = function () {
		$("#right-arrow").show();
		$("#left-arrow").show();
		setTimeout(function () {
			if (!CaptureModule.isAutoCaptureSupported || !cameraOptions.isUseAdvcanceCapture) {
				//standard capture
				document.getElementById("two").src = "../images/instructions/hold_parallel_unsupported.GIF";
			} else {
				//advanced capture
				document.getElementById("two").src = "../images/instructions/hold_parallel_supported.GIF";
			}
		}, 300);
	};

	var onLeftChildTwo = function () {
		$("#left-arrow").hide();
		setTimeout(function () {
			document.getElementById("one").src = "../images/instructions/flat_surface.GIF";
		}, 300);
	};

	return {
		repeat: repeat,
		onSwipeScreen: onSwipeScreen,
	};
})();
