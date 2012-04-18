# jsprim: utilities for primitive JavaScript types

This module provides miscellaneous facilities for working with strings,
numbers, dates, and objects and arrays of these basic types.


### deepCopy(obj)

Creates a deep copy of a primitive type, object, or array of primitive types.


### validateJsonObject(schema, object)

Uses JSON validation (via JSV) to validate the given object against the given
schema.  On success, returns null.  On failure, *returns* (does not throw) a
useful Error object.
