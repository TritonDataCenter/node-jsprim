/*
 * lib/jsprim-jsv.js: extras for testing performance vs JSV
 */

var mod_assert = require('assert');
var mod_jsv;		/* lazy-loaded because it may not be here */

module.exports = {
	validateJsonObjectJSV: validateJsonObjectJSV
};

function validateJsonObjectJSV(schema, input)
{
	if (!mod_jsv)
		mod_jsv = require('JSV');

	var env = mod_jsv.JSV.createEnvironment();
	var report = env.validate(input, schema);

	if (report.errors.length === 0)
		return (null);

	/* Currently, we only do anything useful with the first error. */
	mod_assert.ok(report.errors.length > 0);
	var error = report.errors[0];

	/* The failed property is given by a URI with an irrelevant prefix. */
	var propname = error['uri'].substr(error['uri'].indexOf('#') + 2);
	var reason;

	/*
	 * Some of the default error messages are pretty arcane, so we define
	 * new ones here.
	 */
	switch (error['attribute']) {
	case 'type':
		reason = 'expected ' + error['details'];
		break;
	default:
		reason = error['message'].toLowerCase();
		break;
	}

	var message = reason + ': "' + propname + '"';
	var rv = new Error(message);
	rv.jsv_details = error;
	return (rv);
}
