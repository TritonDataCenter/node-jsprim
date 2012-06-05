/*
 * lib/jsprim.js: utilities for primitive JavaScript types
 */

var mod_assert = require('assert');
var mod_util = require('util');

var mod_jsv = require('JSV');
var mod_verror = require('verror');

/*
 * Public interface
 */
exports.deepCopy = deepCopy;
exports.forEachKey = forEachKey;
exports.validateJsonObject = validateJsonObject;

/*
 * Deep copy an acyclic *basic* Javascript object.  This only handles basic
 * scalars (strings, numbers, booleans) and arbitrarily deep arrays and objects
 * containing these.  This does *not* handle instances of other classes.
 */
function deepCopy(obj)
{
	var ret, key;
	var marker = '__deepCopy';

	if (obj && obj[marker])
		throw (new Error('attempted deep copy of cyclic object'));

	if (obj && obj.constructor == Object) {
		ret = {};
		obj[marker] = true;

		for (key in obj) {
			if (key == marker)
				continue;

			ret[key] = deepCopy(obj[key]);
		}

		delete (obj[marker]);
		return (ret);
	}

	if (obj && obj.constructor == Array) {
		ret = [];
		obj[marker] = true;

		for (key = 0; key < obj.length; key++)
			ret.push(deepCopy(obj[key]));

		delete (obj[marker]);
		return (ret);
	}

	/*
	 * It must be a primitive type -- just return it.
	 */
	return (obj);
}

function forEachKey(obj, callback)
{
	for (var key in obj)
		callback(key, obj[key]);
}

function validateJsonObject(schema, input)
{
	var env = mod_jsv.JSV.createEnvironment();
	var report = env.validate(input, schema);

	if (report.errors.length === 0)
		return (null);

	return (new JsonValidationError(report));
}

function JsonValidationError(report)
{
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

	var message = reason + ': ' + propname;
	mod_verror.VError.call(this, null, message);
	this.jsv_details = error;
}

mod_util.inherits(JsonValidationError, mod_verror.VError);
