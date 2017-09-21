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

var TO_0 = { 'prop1': { 'foo': 'bar' }, 'prop2': 7 };
var TO_1 = Object.create({ 'prop2': 7 });
TO_1.prop1 = { 'prop1': { 'foo': 'bar' } };

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
    [ 1, { 'hello': 'world' }, false ],
    {},
    TO_0,
    TO_1
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

/* hasKey */
mod_assert.ok(jsprim.hasKey(obj, 'family'));
mod_assert.ok(jsprim.hasKey(obj, 'children'));
mod_assert.ok(jsprim.hasKey(obj, 'home'));
mod_assert.ok(jsprim.hasKey(obj, 'income'));
mod_assert.ok(jsprim.hasKey(obj, 'dignity'));
mod_assert.ok(jsprim.hasKey(obj, 'nhomes'));
mod_assert.ok(obj.hasOwnProperty);
mod_assert.ok(!jsprim.hasKey(obj, 'hasOwnProperty'));
copy = Object.create(obj);
copy.aprop = 'avalue';
mod_assert.ok(jsprim.hasKey(copy, 'aprop'));
mod_assert.equal(copy.nhomes, 1);
mod_assert.ok(!jsprim.hasKey(copy, 'nhomes'));
copy.hasOwnProperty = null;
mod_assert.ok(jsprim.hasKey(copy, 'aprop'));
mod_assert.ok(!jsprim.hasKey(copy, 'nhomes'));

/* forEachKey */
var keys = [];
jsprim.forEachKey(obj, function (key, val) {
	mod_assert.deepEqual(obj[key], val);
	keys.push(key);
});
keys.sort();
mod_assert.deepEqual(keys,
    [ 'children', 'dignity', 'family', 'home', 'income', 'nhomes' ]);

/*
 * forEachKey skips non-own properties and works even on objects with a
 * hasOwnProperty key overridden.
 */
copy = jsprim.deepCopy(obj);
Object.prototype.aprop = 'avalue';
mod_assert.equal(copy.aprop, 'avalue');
copy.hasOwnProperty = null;
keys = [];
jsprim.forEachKey(copy, function (key, val) {
	mod_assert.deepEqual(copy[key], val);
	keys.push(key);
});
keys.sort();
mod_assert.deepEqual(keys, [ 'children', 'dignity', 'family',
    'hasOwnProperty', 'home', 'income', 'nhomes' ]);
delete (Object.prototype.aprop);


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
/* rfc1123 */
mod_assert.equal(jsprim.rfc1123(d), 'Fri, 08 Jun 2012 22:21:03 GMT');

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


/* flattenIter */
v = {
    'level1-A': {
	'level2-Aa': {
	    'level3-Aai': 4,
	    'level3-Aaii': 7,
	    'level3-Aaiii': 2
	},
	'level2-Ab': {
	    'level3-Abi': 51,
	    'level3-Abii': 31
	},
	'level2-Ac': {
	    'level3-Aci': 1351,
	    'level3-Acii': 121
	}
    },
    'level1-B': {
	'level2-Ba': {
	    'level3-Bai': 8,
	    'level3-Baii': 7,
	    'level3-Baiii': 6
	},
	'level2-Bb': {
	    'level3-Bbi': 5,
	    'level3-Bbii': 4
	},
	'level2-Bc': {
	    'level3-Bci': 3,
	    'level3-Bcii': 2
	}
    }
};

var accum, unflattened;
[
    [ v, 1 ],
    [ v, 2 ],
    [ v, 3 ]
].forEach(function (testcase, j) {
	var flattened;
	accum = [];
	flattened = jsprim.flattenObject(testcase[0], testcase[1]);
	jsprim.flattenIter(testcase[0], testcase[1],
	    function (entry) { accum.push(entry); });
	console.error('test case %d', j, accum);
	mod_assert.deepEqual(accum, flattened);
});
/*
 * It was arguably a mistake the way flatten with depth === 0 works.  That's the
 * only case where the return value is not an array of arrays.  flattenIter()
 * does the more sensible thing here.
 */
accum = [];
jsprim.flattenIter(3, 0, function (entry) { accum.push(entry); });
mod_assert.deepEqual(accum, [ [ 3 ] ]);

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

mod_assert.equal('1970-01-01T00:00:02.000Z',
    jsprim.iso8601(jsprim.parseDateTime('2000')));
mod_assert.equal('1970-01-01T00:00:00.001Z',
    jsprim.iso8601(jsprim.parseDateTime('1')));
mod_assert.equal('1970-01-01T00:00:00.000Z',
    jsprim.iso8601(jsprim.parseDateTime('0')));

console.log('basic tests okay');
