/*
 * hrtimediff.js: test hrtimediff() function
 */

var mod_assert = require('assert');
var mod_util = require('util');
var hrtimeNanosec = require('../lib/jsprim').hrtimeNanosec;
var hrtimeMillisec = require('../lib/jsprim').hrtimeMillisec;
var hrtimeMicrosec = require('../lib/jsprim').hrtimeMicrosec;

var test_cases = [
	/*
	 * Passing test cases:
	 */
	{
		in: [ 0, 0 ],
		nano: 0,
		micro: 0,
		milli: 0
	},
	{
		in: [ 0, 1000 ],
		nano: 1000,
		micro: 1,
		milli: 0
	},
	{
		in: [ 0, 1999 ],
		nano: 1999,
		micro: 1,
		milli: 0
	},
	{
		in: [ 1000000000, 0 ],
		nano: 1000000000000000000,
		micro: 1000000000000000,
		milli: 1000000000000
	},
	{
		in: [ 5, 123456789 ],
		nano: 5123456789,
		micro: 5123456,
		milli: 5123
	},
	/*
	 * Failing test cases:
	 */
	{
		in: null,
		out: false
	},
	{
		in: [ -1, 0 ],
		out: false
	},
	{
		in: [ 0, -1 ],
		out: false
	},
	{
		in: [ 0, 1000000000 ],
		out: false
	}
];

test_cases.forEach(function (tc) {
	console.log('%s test case:', tc.out === false ? 'failing' :
	    'passing');

	console.log('\tin = %j', tc.in);

	var nano, micro, milli;
	var failures = 0;

	try {
		nano = hrtimeNanosec(tc.in);
		console.log('\tnano = %j', nano);
	} catch (ex) {
		console.log('\tnano error = %s', ex.toString());
		failures++;
	}

	try {
		micro = hrtimeMicrosec(tc.in);
		console.log('\tmicro = %j', micro);
	} catch (ex) {
		console.log('\tmicro error = %s', ex.toString());
		failures++;
	}

	try {
		milli = hrtimeMillisec(tc.in);
		console.log('\tmilli = %j', milli);
	} catch (ex) {
		console.log('\tmilli error = %s', ex.toString());
		failures++;
	}

	if (tc.out === false) {
		/*
		 * We expected to fail; ensure we did so.
		 */
		mod_assert.strictEqual(failures, 3, 'wanted throw');
	} else {
		/*
		 * Ensure that we returned the expected value:
		 */
		mod_assert.strictEqual(nano, tc.nano);
		mod_assert.strictEqual(micro, tc.micro);
		mod_assert.strictEqual(milli, tc.milli);
	}
});
