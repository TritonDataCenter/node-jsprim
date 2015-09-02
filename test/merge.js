/*
 * merge.js: test mergeObjects() function
 */

var mod_assert = require('assert');
var mod_jsprim = require('../lib/jsprim');

var mergeObjects = mod_jsprim.mergeObjects;

var test_cases = [ {
    'name': 'null user, basic overrides and defaults',
    'user': null,
    'overrides': { 'a': 3 },
    'defaults': { 'b': 7 },
    'expected': { 'a': 3, 'b': 7 }
}, {
    'name': 'undefined user, basic overrides and defaults',
    'user': undefined,
    'overrides': { 'a': 3 },
    'defaults': { 'b': 7 },
    'expected': { 'a': 3, 'b': 7 }
}, {
    'name': 'empty user, basic overrides and defaults',
    'user': {},
    'overrides': { 'a': 3 },
    'defaults': { 'b': 7 },
    'expected': { 'a': 3, 'b': 7 }
}, {
    'name': 'combination of user, overrides, defaults',
    'user': { 'a': 3, 'b': 4, 'c': 5 },
    'overrides': { 'a': 9 },
    'defaults': { 'b': 7, 'd': 15 },
    'expected': { 'a': 9, 'b': 4, 'c': 5, 'd': 15 }
} ];

test_cases.forEach(function runTestCase(tc) {
	var options;

	console.log('test case: %s', tc.name);

	options = mergeObjects(tc.user, tc.overrides, tc.defaults);
	console.log(options);
	mod_assert.deepEqual(options, tc.expected);
});

console.log('TEST PASSED');
