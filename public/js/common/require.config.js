/*!
 * base require config. Sets base url to the js directory so all JS requires can be relative paths
 *  Require config to set base path for lazy loaded JS files
 *
 *  upping the wait seconds before timeout to 30. Mobile devices on 3G can take this long in edge cases
 *   
 *  Adding a global cachebusting attribute into config. 
 */
var pdCachebuster = '1';
require.config({
	urlArgs: "_=" + (pd.config.postFix || ''),
	waitSeconds: 30,
  baseUrl: (pd.config.baseUrl || '') + 'js/amd_modules/'
});