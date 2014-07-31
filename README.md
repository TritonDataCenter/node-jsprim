# jsprim: utilities for primitive JavaScript types

This module provides miscellaneous facilities for working with strings,
numbers, dates, and objects and arrays of these basic types.


### deepCopy(obj)

Creates a deep copy of a primitive type, object, or array of primitive types.


### deepEqual(obj1, obj2)

Returns whether two objects are equal.


### isEmpty(obj)

Returns true if the given object has no properties and false otherwise.  This
is O(1) (unlike `Object.keys(obj).length === 0`, which is O(N)).


### forEachKey(obj, callback)

Like Array.forEach, but iterates properties of an object rather than elements
of an array.  Equivalent to:

    for (var key in obj)
            callback(key, obj[key]);


### flattenObject(obj, depth)

Flattens an object up to a given level of nesting, returning an array of arrays
of length "depth + 1", where the first "depth" elements correspond to flattened
columns and the last element contains the remaining object .  For example:

    flattenObject({
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
                    'datum2': [ 3, 4 ],
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
    }, 3)

becomes:

    [
        [ 'I',  'A', 'i',   { 'datum1': [ 1, 2 ], 'datum2': [ 3, 4 ] } ],
        [ 'I',  'A', 'ii',  { 'datum1': [ 3, 4 ] } ],
        [ 'I',  'B', 'i',   { 'datum1': [ 5, 6 ] } ],
        [ 'I',  'B', 'ii',  { 'datum1': [ 7, 8 ], 'datum2': [ 3, 4 ] } ],
        [ 'I',  'B', 'iii', {} ],
        [ 'II', 'A', 'i',   { 'datum1': [ 1, 2 ], 'datum2': [ 3, 4 ] } ]
    ]

This function is strict: "depth" must be a non-negative integer and "obj" must
be a non-null object with at least "depth" levels of nesting under all keys.


### flattenIter(obj, depth, func)

This is similar to `flattenObject` except that instead of returning an array,
this function invokes `func(entry)` for each `entry` in the array that
`flattenObject` would return.  `flattenIter(obj, depth, func)` is logically
equivalent to `flattenObject(obj, depth).forEach(func)`.  Importantly, this
version never constructs the full array.  Its memory usage is O(depth) rather
than O(n) (where `n` is the number of flattened elements).

There's another difference between `flattenObject` and `flattenIter` that's
related to the special case where `depth === 0`.  In this case, `flattenObject`
omits the array wrapping `obj` (which is regrettable).


### pluck(obj, key)

Fetch nested property "key" from object "obj", traversing objects as needed.
For example, `pluck(obj, "foo.bar.baz")` is roughly equivalent to
`obj.foo.bar.baz`, except that:

1. If traversal fails, the resulting value is undefined, and no error is
   thrown.  For example, `pluck({}, "foo.bar")` is just undefined.
2. If "obj" has property "key" directly (without traversing), the
   corresponding property is returned.  For example,
   `pluck({ 'foo.bar': 1 }, 'foo.bar')` is 1, not undefined.  This is also
   true recursively, so `pluck({ 'a': { 'foo.bar': 1 } }, 'a.foo.bar')` is
   also 1, not undefined.


### randElt(array)

Returns an element from "array" selected uniformly at random.  If "array" is
empty, throws an Error.


### startsWith(str, prefix)

Returns true if the given string starts with the given prefix and false
otherwise.


### endsWith(str, suffix)

Returns true if the given string ends with the given suffix and false
otherwise.


### iso8601(date)

Converts a Date object to an ISO8601 date string of the form
"YYYY-MM-DDTHH:MM:SS.sssZ".  This format is not customizable.


### parseDateTime(str)

Parses a date expressed as a string, as either a number of milliseconds since
the epoch or any string format that Date accepts, giving preference to the
former where these two sets overlap (e.g., strings containing small numbers).


### validateJsonObject(schema, object)

Uses JSON validation (via JSV) to validate the given object against the given
schema.  On success, returns null.  On failure, *returns* (does not throw) a
useful Error object.


# Contributing

Code should be "make check" clean.  This target assumes that
[jsl](http://github.com/davepacheco/javascriptlint) and
[jsstyle](http://github.com/davepacheco/jsstyle) are on your path.

New tests should generally accompany new functions and bug fixes.  The tests
should pass cleanly (run tests/basic.js).
