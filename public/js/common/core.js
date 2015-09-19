/*! 
 * Create the the punditly object 
 */
var pd = window.pd || {};
pd.config = (function(){
	var cfg = {
		baseUrl:location.protocol + "//punditly.com/",
		postFix:1
	};
	
	return cfg;
}());

/** 
 * Override underscore's default ERB-style "<% %>" delimeters.
 * Use "{{}}" instead to prevent EJS from blowing up. Also cleaner.
 */
(function() {
	_.templateSettings = {
	    evaluate:    /\{\{(.+?)\}\}/g,
	    interpolate: /\{\{=(.+?)\}\}/g,
	    escape:      /\{\{-(.+?)\}\}/g
	};
}());
