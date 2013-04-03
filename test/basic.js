/*
 * test/basic.js: tests jsprim functions
 */

var mod_assert = require('assert');
var jsprim = require('../lib/jsprim');

/* deepCopy */
var obj = {
    'family': 'simpson',
    'children': [ 'bart', 'lisa', 'maggie', 'hugo' ],
    'home': true,
    'income': undefined,
    'dignity': null,
    'nhomes': 1
};

var copy = jsprim.deepCopy(obj);

mod_assert.deepEqual(copy, obj);
copy['home'] = false;
mod_assert.ok(obj['home'] === true);

/* deepEqual */
var values = [
    true, false, null, undefined, 0, 1,
    new Date(),
    {
	'hello': 'world',
	'goodbye': 'sky'
    },
    {
	'hello': 'world'
    },
    {
	'hello': 'world',
	'goodbye': undefined
    },
    [],
    [ 1, 2, 3 ],
    [ 1, 2, 3, 4 ],
    [ 1, { 'hello': 'world' }, false ]
];
values.forEach(function (o1, j) {
	values.forEach(function (o2, k) {
		if (j == k) {
			mod_assert.ok(jsprim.deepEqual(o1, o2));
			mod_assert.ok(
			    jsprim.deepEqual(o1, jsprim.deepCopy(o2)));
		} else {
			mod_assert.ok(!jsprim.deepEqual(o1, o2));
			mod_assert.ok(
			    !jsprim.deepEqual(o1, jsprim.deepCopy(o2)));
		}
	});
});
mod_assert.ok(!jsprim.deepEqual(NaN, NaN));

/* isEmpty */
mod_assert.ok(jsprim.isEmpty({}));
mod_assert.ok(!jsprim.isEmpty({ 'foo': 'bar' }));

/* forEachKey */
var keys = [];
jsprim.forEachKey(obj, function (key, val) {
	mod_assert.deepEqual(obj[key], val);
	keys.push(key);
});
keys.sort();
mod_assert.deepEqual(keys,
    [ 'children', 'dignity', 'family', 'home', 'income', 'nhomes' ]);

/* startsWith */
mod_assert.ok(jsprim.startsWith('foobar', 'f'));
mod_assert.ok(jsprim.startsWith('foobar', 'foo'));
mod_assert.ok(jsprim.startsWith('foobar', 'foobar'));
mod_assert.ok(jsprim.startsWith('foobars', 'foobar'));
mod_assert.ok(!jsprim.startsWith('foobar', 'foobars'));
mod_assert.ok(!jsprim.startsWith('hofoobar', 'foo'));
mod_assert.ok(!jsprim.startsWith('hofoobar', 'bar'));

/* endsWith */
mod_assert.ok(!jsprim.endsWith('foobar', 'f'));
mod_assert.ok(jsprim.endsWith('foobar', 'r'));
mod_assert.ok(jsprim.endsWith('foobar', 'bar'));
mod_assert.ok(jsprim.endsWith('foobar', 'foobar'));
mod_assert.ok(jsprim.endsWith('sfoobar', 'foobar'));
mod_assert.ok(!jsprim.endsWith('foobar', 'foobars'));
mod_assert.ok(!jsprim.endsWith('foobar', 'sfoobar'));
mod_assert.ok(!jsprim.endsWith('hofoobar', 'foo'));

/* iso8601 */
var d = new Date(1339194063451);
mod_assert.equal(jsprim.iso8601(d), '2012-06-08T22:21:03.451Z');

/* randElt */
var a = [];
mod_assert.throws(function () {
	jsprim.randElt(a);
}, /must be a non-empty array/);

a = [ 10 ];
var r = jsprim.randElt(a);
mod_assert.equal(r, 10);
r = jsprim.randElt(a);
mod_assert.equal(r, 10);

var v = {};
a = [ 'alpha', 'bravo', 'charlie', 'oscar' ];
for (var i = 0; i < 10000; i++) {
	r = jsprim.randElt(a);
	if (!v.hasOwnProperty(r))
		v[r] = 0;
	v[r]++;
}

mod_assert.deepEqual(Object.keys(v).sort(),
    [ 'alpha', 'bravo', 'charlie', 'oscar' ]);
jsprim.forEachKey(v, function (_, value) { mod_assert.ok(value > 0); });

/* flatten */
v = jsprim.flattenObject({
    'I': {
	'A': {
	    'i': {
		'datum1': [ 1, 2 ],
		'datum2': [ 3, 4 ]
	    },
	    'ii': {
		'datum1': [ 3, 4 ]
	    }
	},
	'B': {
	    'i': {
		'datum1': [ 5, 6 ]
	    },
	    'ii': {
		'datum1': [ 7, 8 ],
		'datum2': [ 3, 4 ]
	    },
	    'iii': {
	    }
	}
    },
    'II': {
	'A': {
	    'i': {
		'datum1': [ 1, 2 ],
		'datum2': [ 3, 4 ]
	    }
	}
    }
}, 3);
mod_assert.deepEqual(v, [
    [ 'I',  'A', 'i',   { 'datum1': [ 1, 2 ], 'datum2': [ 3, 4 ] } ],
    [ 'I',  'A', 'ii',  { 'datum1': [ 3, 4 ] } ],
    [ 'I',  'B', 'i',   { 'datum1': [ 5, 6 ] } ],
    [ 'I',  'B', 'ii',  { 'datum1': [ 7, 8 ], 'datum2': [ 3, 4 ] } ],
    [ 'I',  'B', 'iii', {} ],
    [ 'II', 'A', 'i',   { 'datum1': [ 1, 2 ], 'datum2': [ 3, 4 ] } ]
]);
mod_assert.throws(function () { jsprim.flattenObject(null, 3); });
mod_assert.throws(function () { jsprim.flattenObject('hello', 3); });
mod_assert.throws(function () { jsprim.flattenObject(3, 3); });
mod_assert.throws(function () { jsprim.flattenObject({}, 'hello'); });
mod_assert.throws(function () { jsprim.flattenObject({}, -1); });


/* pluck */
mod_assert.equal('hello', jsprim.pluck({ 'world': 'hello' }, 'world'));
mod_assert.equal('hello', jsprim.pluck({ 'world.bar': 'hello' }, 'world.bar'));
mod_assert.equal('hello', jsprim.pluck({
    'world.bar': 'hello',
    'world': {
	'bar': 'junk'
    }
}, 'world.bar'));
mod_assert.equal('junk', jsprim.pluck({
    'world': {
	'bar': 'junk'
    }
}, 'world.bar'));
mod_assert.ok(undefined === jsprim.pluck({
    'world': {
	'bar': 'junk'
    }
}, 'world.baz'));
mod_assert.ok(undefined === jsprim.pluck(null, 'junk'));
mod_assert.ok(undefined === jsprim.pluck(undefined, 'junk'));
mod_assert.ok(undefined === jsprim.pluck(3, 'junk'));
mod_assert.ok(undefined === jsprim.pluck('hello', 'junk'));
mod_assert.ok(undefined === jsprim.pluck(true, 'junk'));
mod_assert.ok(undefined === jsprim.pluck({}, '3'));

mod_assert.throws(function () { jsprim.pluck({}, 3); });
mod_assert.throws(function () { jsprim.pluck({}, {}); });
mod_assert.throws(function () { jsprim.pluck({}, false); });


/* parseDateTime */
mod_assert.equal('2013-04-02T16:12:37.456Z', jsprim.iso8601(
    jsprim.parseDateTime('2013-04-02T16:12:37.456Z')));
mod_assert.equal('2013-04-02T16:12:37.000Z', jsprim.iso8601(
    jsprim.parseDateTime('2013-04-02T16:12:37Z')));
mod_assert.equal('2013-04-02T23:54:41.155Z', jsprim.iso8601(
    jsprim.parseDateTime('1364946881155')));
mod_assert.equal('2013-04-02T23:54:41.155Z', jsprim.iso8601(
    jsprim.parseDateTime(1364946881155)));
mod_assert.equal('2013-04-02T23:54:41.000Z', jsprim.iso8601(
    jsprim.parseDateTime(new Date(1364946881000).toString())));

console.log('tests okay');
