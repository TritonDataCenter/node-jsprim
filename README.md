# jsprim: utilities for primitive JavaScript types

This module provides miscellaneous facilities for working with strings,
numbers, dates, and objects and arrays of these basic types.


### deepCopy(obj)

Creates a deep copy of a primitive type, object, or array of primitive types.


### isEmpty(obj)

Returns true if the given object has no properties and false otherwise.  This
is O(1) (unlike `Object.keys(obj).length === 0`, which is O(N)).


### forEachKey(obj, callback)

Like Array.forEach, but iterates properties of an object rather than elements
of an array.  Equivalent to:

    for (var key in obj)
            callback(key, obj[key]);


### validateJsonObject(schema, object)

Uses JSON validation (via JSV) to validate the given object against the given
schema.  On success, returns null.  On failure, *returns* (does not throw) a
useful Error object.
