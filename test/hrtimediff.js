/*
 * hrtimediff.js: test hrtimediff() function
 */

var mod_assert = require('assert');
var mod_util = require('util');
var hrtimediff = require('../lib/jsprim').hrtimediff;

var test_cases = [
    /*       A         -        B    must equal     C    */
    /* simple cases: straight component-wise subtraction */
    [ [  0,       900 ], [  0,       800 ], [  0,       100 ] ],
    [ [ 52,         0 ], [ 48,         0 ], [  4,         0 ] ],
    [ [  1, 900456789 ], [  0, 800123456 ], [  1, 100333333 ] ],
    [ [ 57, 123456789 ], [ 57, 123456789 ], [  0,         0 ] ],
    [ [ 57, 123456789 ], [  0,         0 ], [ 57, 123456789 ] ],

    /* wrap case */
    [ [  1,       200 ], [  0,       400 ], [ 0, 999999800 ] ],

    /* illegal cases */
    [ [  0,       900 ], [  0,       -100 ], null ], /* negative ns */
    [ [  1,       100 ], [ -1,          0 ], null ], /* negative s */
    [ [  0,         0 ], [  0, 1000000000 ], null ], /* ns too big */
    [ [  0,       300 ], [  1,        100 ], null ], /* negative result */
    [ [  5,       300 ], [  5,        400 ], null ]  /* negative result */
];

test_cases.forEach(function (testcase) {
	var result;
	if (testcase[2] !== null) {
		process.stdout.write(mod_util.format(
		    '%j - %j = ', testcase[0], testcase[1]));
		result = hrtimediff(testcase[0], testcase[1]);
		process.stdout.write(mod_util.format('%j\n', result));
		mod_assert.deepEqual(testcase[2], result);
	} else {
		process.stdout.write(mod_util.format('%j - %j (expect fail): ',
		    testcase[0], testcase[1]));
		mod_assert.throws(
		    function () { hrtimediff(testcase[0], testcase[1]); },
		    function (err) {
			console.log(err.message);
			return (true);
		    });
	}
});
