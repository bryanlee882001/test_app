var region = "United States";
var selectedCountry = "";
var selelctedIdType = "";

var RegionModule = (function () {
	var showCountriesForRegion = function () {
		switch (region) {
			case "Asia":
				$("#alert_asia_2x_countries").css({ width: (parseInt($(window).width()) * 2.5) / 3 + "px" });
				$("#alert_asia_2x_countries").popup("open");
				break;
			case "Australia":
				$("#alert_australia_2x_countries").css({ width: (parseInt($(window).width()) * 2.5) / 3 + "px" });
				$("#alert_australia_2x_countries").popup("open");
				break;
			case "Canada":
				AppModule.doCapture();
				break;
			case "Europe":
				$("#alert_europe_2x_countries").css({ width: (parseInt($(window).width()) * 2.5) / 3 + "px" });
				$("#alert_europe_2x_countries").popup("open");
				break;
			case "Latin America":
				$("#alert_latin_america_2x_countries").css({ width: (parseInt($(window).width()) * 2.5) / 3 + "px" });
				$("#alert_latin_america_2x_countries").popup("open");
				break;
			case "United States":
				AppModule.doCapture();
				break;
		}
	};

	var initializeCountrySelectionEvents = function () {
		$(".dropdownlistview").on("click", "li", function (event) {
			event.preventDefault();
			selectedCountry = event.target.innerText;
			AppModule.doCapture();
		});
	};

	return {
		initializeCountrySelectionEvents: initializeCountrySelectionEvents,
		showCountriesForRegion: showCountriesForRegion,
	};
})();
