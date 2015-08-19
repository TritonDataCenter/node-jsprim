/*
 * extraprops.js: test extraProperties() function
 */

var mod_assert = require('assert');
var mod_util = require('util');
var mod_jsprim = require('../lib/jsprim');

var extraProperties = mod_jsprim.extraProperties;

var test_cases = [
	{
		obj: null,
		allowed: [
			'one',
			'two'
		],
		expectedThrow: 'obj argument must be a non-null object'
	},
	{
		obj: {
			charlie: 'horse'
		},
		allowed: [
			'charlie',
			5
		],
		expectedThrow: 'allowed argument must be an array of strings'
	},
	{
		obj: {
			charlie: 'horse'
		},
		allowed: {
			charlie: true
		},
		expectedThrow: 'allowed argument must be an array of strings'
	},
	{
		obj: {
			strict: true,
			hapless: true,
			quality: -3
		},
		allowed: [
			'strict',
			'advisable',
			'decent',
			'quality'
		],
		expected: [
			'hapless'
		]
	},
	{
		obj: {},
		allowed: [],
		expected: null
	},
	{
		obj: {
			strict: true,
			quality: 100
		},
		allowed: [
			'strict',
			'advisable',
			'decent',
			'quality'
		],
		expected: []
	},
	{
		obj: {
			'false': null
		},
		allowed: [],
		expected: [
			'false'
		]
	}
];

function printf()
{
	process.stdout.write(mod_util.format.apply(null, arguments));
}

test_cases.forEach(function (testcase, idx) {
	printf('test_cases[%d]:\n', idx);
	printf('\tobj: %j\n', testcase.obj);
	printf('\tallowed: %j\n', testcase.allowed);

	var actual;
	try {
		actual = extraProperties(testcase.obj, testcase.allowed);
	} catch (ex) {
		if (!testcase.expectedThrow) {
			throw (ex);
		}

		mod_assert.equal(ex.message, testcase.expectedThrow);
		return;
	}

	if (testcase.expectedThrow) {
		throw (new Error('expected an assertion failure'));
	}

	if (testcase.expected) {
		mod_assert.deepEqual(actual, testcase.expected);
	}
});
