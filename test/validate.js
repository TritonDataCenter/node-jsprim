/*
 * test/validate.js: microbenchmark JSON object validation
 *
 * Using "JSV" implementation:
 *
 *       1000 iterations
 *       2516 milliseconds
 *      2.516 ms per iteration on average
 */

var sprintf = require('extsprintf').sprintf;
var jsprim = require('../lib/jsprim');

var schema = {
    'id':      { 'type': 'string', 'required': true, 'minLength': 1 },
    'name':    { 'type': 'string', 'required': true },
    'created': { 'type': 'string', 'format': 'date-time' },
    'owner':   { 'type': 'string' },
    'state': {
        'type': 'string',
	'enum': [ 'queued', 'running', 'done' ]
    },
    'pieces': {
        'type': 'array',
	'required': true,
	'minItems': 1,
	'items': {
	    'type': 'object',
	    'additionalProperties': false,
	    'properties': {
	    	'id':   { 'type': 'string', 'required': true },
	    	'name': { 'type': 'string', 'required': true }
	    }
	}
    }
};

var template = {
    'id': 'object-12345',
    'name': 'my object',
    'created': '2012-09-06T12:34:56.789Z',
    'owner': 'dap',
    'state': 'done',
    'pieces': [ {
        'id': 'piece-1',
	'name': 'my first piece'
    }, {
        'id': 'piece-2',
	'name': 'my second piece'
    }, {
        'id': 'piece-3',
	'name': 'my third piece'
    } ]
};

var start = Date.now();
var count = 1000;
var i;

for (i = 0; i < count; i++)
	jsprim.validateJsonObject(schema, template);

var done = Date.now();

console.log(sprintf('%6d iterations', count));
console.log(sprintf('%6d milliseconds', done - start));
console.log(sprintf('%6s ms per iteration on average',
    ((done - start) / count).toFixed(3)));
