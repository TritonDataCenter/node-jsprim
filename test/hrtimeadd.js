/*
 * hrtimediff.js: test hrtimediff() function
 */

var mod_assert = require('assert');
var mod_util = require('util');
var deepCopy = require('../lib/jsprim').deepCopy;
var deepEqual = require('../lib/jsprim').deepEqual;
var hrtimeAccum = require('../lib/jsprim').hrtimeAccum;
var hrtimeAdd = require('../lib/jsprim').hrtimeAdd;
var hrtimeNanosec = require('../lib/jsprim').hrtimeNanosec;

var test_cases = [
	/*
	 * Passing test cases:
	 */
	{
		ina: [ 0, 0 ],
		inb: [ 0, 0 ],
		out: [ 0, 0 ]
	},
	{
		ina: [ 1000000000, 0 ],
		inb: [ 50, 0 ],
		out: [ 1000000050, 0 ]
	},
	{
		ina: [ 0, 999999999 ],
		inb: [ 0, 1 ],
		out: [ 1, 0 ]
	},
	{
		ina: [ 0, 999999999 ],
		inb: [ 0, 0 ],
		out: [ 0, 999999999 ]
	},
	{
		ina: [ 0, 999999999 ],
		inb: [ 0, 999999999 ],
		out: [ 1, 999999998 ]
	},
	{
		ina: [ 0, 999999999 ],
		inb: [ 0, 999999999 ],
		out: [ 1, 999999998 ]
	},
	{
		ina: [ 50, 999999999 ],
		inb: [ 1000000000, 999999999 ],
		out: [ 1000000051, 999999998 ]
	},
	/*
	 * Failing test cases:
	 */
	{
		ina: null,
		inb: null,
		out: false
	},
	{
		ina: null,
		inb: [ 0, 0 ],
		out: false
	},
	{
		ina: [ 0, 0 ],
		inb: null,
		out: false
	},
	{
		ina: [ -1, 0 ],
		inb: [ 0, 0 ],
		out: false
	},
	{
		ina: [ 0, 0 ],
		inb: [ 0, -1 ],
		out: false
	},
	{
		ina: [ 0, 1000000000 ],
		inb: [ 0, 0 ],
		out: false
	},
	{
		ina: [ 0, 0 ],
		inb: [ 0, 1000000000 ],
		out: false
	}
];

/*
 * Test hrtimeAccum():
 */
test_cases.forEach(function (tc) {
	var n = 'hrtimeAccum';
	console.log('%s test case (%s):', tc.out === false ? 'failing' :
	    'passing', n);

	console.log('\ta = %j', tc.ina);
	console.log('\tb = %j', tc.inb);

	var accum = deepCopy(tc.ina);
	var interv = deepCopy(tc.inb);
	var rv;
	var failed = false;

	try {
		rv = hrtimeAccum(accum, interv);

		console.log('\taccum = %j', accum);
	} catch (ex) {
		console.log('\terror = %s', ex.toString());
		failed = true;
	}

	/*
	 * Ensure that we returned the accumulator array:
	 */
	if (!failed) {
		mod_assert.strictEqual(rv, accum);
		mod_assert.notStrictEqual(rv, interv);
		mod_assert.ok(deepEqual(rv, accum));
	}

	/*
	 * Cross-check result with regular addition:
	 */
	if (!failed) {
		var cross = hrtimeNanosec(tc.ina) + hrtimeNanosec(tc.inb);

		mod_assert.strictEqual(hrtimeNanosec(accum), cross);
	}

	/*
	 * Ensure that we did not modify the second argument:
	 */
	mod_assert.ok(deepEqual(interv, tc.inb));

	if (failed) {
		/*
		 * We expected to fail; ensure we did so.
		 */
		mod_assert.strictEqual(tc.out, false, 'wanted throw');
	} else {
		/*
		 * Ensure that we returned the expected value:
		 */
		mod_assert.ok(deepEqual(accum, tc.out));
	}
});

/*
 * Test hrtimeAdd():
 */
test_cases.forEach(function (tc) {
	var n = 'hrtimeAdd';
	console.log('%s test case (%s):', tc.out === false ? 'failing' :
	    'passing', n);

	console.log('\ta = %j', tc.ina);
	console.log('\tb = %j', tc.inb);

	var copya = deepCopy(tc.ina);
	var copyb = deepCopy(tc.inb);
	var rv;
	var failed = false;

	try {
		rv = hrtimeAdd(copya, copyb);

		console.log('\tresult = %j', rv);
	} catch (ex) {
		console.log('\terror = %s', ex.toString());
		failed = true;
	}

	/*
	 * Ensure that we returned a _new_ array:
	 */
	if (!failed) {
		mod_assert.notStrictEqual(rv, copya);
		mod_assert.notStrictEqual(rv, copyb);
	}

	/*
	 * Cross-check result with regular addition:
	 */
	if (!failed) {
		var cross = hrtimeNanosec(tc.ina) + hrtimeNanosec(tc.inb);

		mod_assert.strictEqual(hrtimeNanosec(rv), cross);
	}

	/*
	 * Ensure that we did not modify either argument:
	 */
	mod_assert.ok(deepEqual(copya, tc.ina));
	mod_assert.ok(deepEqual(copyb, tc.inb));

	if (failed) {
		/*
		 * We expected to fail; ensure we did so.
		 */
		mod_assert.strictEqual(tc.out, false, 'wanted throw');
	} else {
		/*
		 * Ensure that we returned the expected value:
		 */
		mod_assert.ok(deepEqual(rv, tc.out));
	}
});
