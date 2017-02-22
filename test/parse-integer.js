/*
 * test/parse-integer.js: tests parseInteger()
 */

var mod_assert = require('assert');
var mod_util = require('util');
var jsprim = require('../lib/jsprim');

// --- Globals

var parseInteger = jsprim.parseInteger;

/* parseIntJS is used in these tests to avoid confusion */
var parseIntJS = parseInt;

/* Options for parseIntJS() compatible behaviour */
var COMPAT_OPTS = {
	allowSign: true,
	allowPrefix: true,
	allowTrailing: true,
	allowImprecise: true,
	trimWhitespace: true
};

/* Characters trimmed by parseIntJS() */
var VALID_SPACE_CHARS = [
	' ',
	'\f',
	'\n',
	'\r',
	'\t',
	'\v',
	'\u00a0',
	'\u1680',
	'\u180e',
	'\u2000',
	'\u2001',
	'\u2002',
	'\u2003',
	'\u2004',
	'\u2005',
	'\u2006',
	'\u2007',
	'\u2008',
	'\u2009',
	'\u200a',
	'\u2028',
	'\u2029',
	'\u202f',
	'\u205f',
	'\u3000',
	'\ufeff'
];


/* Characters not trimmed by parseIntJS() */
var INVALID_SPACE_CHARS = [
	/* Some non-printable characters */
	'\u0000', /* null (NUL) */
	'\u0001', /* start of heading (SOH) */
	'\u0002', /* start of text (STX) */
	'\u0003', /* end of text (ETX) */
	'\u0004', /* end of transmission (EOT) */
	'\u0005', /* enquiry (ENQ) */
	'\u0006', /* acknowledgement (ACK) */
	'\u0007', /* bell (BEL) */
	'\u0008', /* backspace (BS) */
	'\u000E', /* shift out (SO) */
	'\u000F', /* shift in (SI) */

	/* Character before a whitespace range */
	'\u1999', /* new tai lue letter low ma */

	/* Some other white space characters */
	'\u0085', /* next line (NEL) */
	'\u200b', /* zero width space */
	'\u200c', /* zero width non-joiner */
	'\u200d', /* zero width joiner */
	'\u2060'  /* word joiner */
];


/* Strings not valid before, after or inside the digit in any base. */
var INVALID_BASE_CHARS = [
	'!', '=', '++', '--', '_', '\\', '}', ';', ':', '.', '.'
];

/* These are valid characters that are only okay before the number. */
var INVALID_TRAILING_CHARS = [ '+', '-' ];


/* Series of strings to try parsing in each base. */
var PI_BASES = [
	/* Binary-only values */
	'0', '1', '10', '100', '101', '1010',

	/* Ternary-only values */
	'2', '12', '20', '21', '102', '1020', '2010',

	/* Octal-only values */
	'4', '5', '6', '7', '225', '701', '605', '504', '65536', '7654321',

	/* Decimal-only values */
	'8', '9', '812', '9001', '9437', '955512', '987654321',

	/* Hexadecimal-only values */
	'a', 'b', 'c', 'd', 'e', 'f', 'fd00', 'abcd', '1f2', '1f00', 'b00',

	/* Base 36-only values */
	'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
	'u', 'v', 'w', 'x', 'y', 'z', '1gkz', 'mno0', 'rq025', '6klmns5'
];


/* Generate a series of example input numbers */
var EXAMPLE_NUMS = PI_BASES.map(function (str) {
	return (parseIntJS(str, 36));
});


// --- Helpers

function assertInvalidError(err) {
	mod_assert.ok(err instanceof Error);
	mod_assert.ok(jsprim.startsWith(err.message, 'invalid number'));
}

function assertTrailingError(err) {
	mod_assert.ok(err instanceof Error);
	mod_assert.ok(jsprim.startsWith(err.message, 'trailing characters'));
}

function assertPrecisionError(err) {
	mod_assert.ok(err instanceof Error);
	mod_assert.ok(jsprim.startsWith(err.message,
	    'number is outside of the supported range'));
}

function assertParseHelper(simpopts, num, str) {
	var whspopts = jsprim.mergeObjects(simpopts, { trimWhitespace: true });
	var trailopts = jsprim.mergeObjects(simpopts, { allowTrailing: true });

	/* Test normal parsing. */
	mod_assert.equal(num, parseInteger(str, simpopts));

	/* Test that whitespace trimmed by parseIntJS() is valid. */
	VALID_SPACE_CHARS.forEach(function (sp) {
		var spBefore = sp + str;
		var spAfter = str + sp;
		var spBoth = sp + str + sp;

		/* Whitespace invalid by default */
		assertInvalidError(parseInteger(spBefore, simpopts));
		assertTrailingError(parseInteger(spAfter, simpopts));
		assertInvalidError(parseInteger(spBoth, simpopts));

		/* Adding in "trimWhitespace" makes it valid. */
		mod_assert.equal(num, parseInteger(spBefore, whspopts));
		mod_assert.equal(num, parseInteger(spAfter, whspopts));
		mod_assert.equal(num, parseInteger(spBoth, whspopts));

		/* Multiple whitespace chars is fine. */
		mod_assert.equal(num, parseInteger(sp + spBefore, whspopts));
		mod_assert.equal(num, parseInteger(spAfter + sp, whspopts));
		mod_assert.equal(num, parseInteger(sp + spBoth + sp, whspopts));
	});

	/* Test that whitespace not trimmed by parseIntJS() is invalid. */
	INVALID_SPACE_CHARS.forEach(function (sp) {
		assertInvalidError(parseInteger(sp + str, whspopts));
		assertTrailingError(parseInteger(str + sp, whspopts));
		assertInvalidError(parseInteger(sp + str + sp, whspopts));
		mod_assert.equal(num, parseInteger(str + sp, trailopts));
	});

	/* Test trailing characters. */
	INVALID_BASE_CHARS.forEach(function (c) {
		/* Trailing character is invalid without "allowTrailing". */
		assertTrailingError(parseInteger(str + c, simpopts));
		mod_assert.equal(num, parseInteger(str + c, trailopts));

		/* Digits after an invalid character are still invalid. */
		assertTrailingError(parseInteger(str + c + '0', simpopts));
		assertTrailingError(parseInteger(str + c + '1', simpopts));
		mod_assert.equal(num, parseInteger(str + c + '0', trailopts));
		mod_assert.equal(num, parseInteger(str + c + '1', trailopts));

		/* Leading character is invalid regardless of options. */
		assertInvalidError(parseInteger(c + str, simpopts));
		assertInvalidError(parseInteger(c + str, trailopts));
	});

	/* Some characters are only valid at the start of the number. */
	INVALID_TRAILING_CHARS.forEach(function (c) {
		assertTrailingError(parseInteger(str + c, simpopts));
		assertTrailingError(parseInteger(str + c + '0', simpopts));
		mod_assert.equal(num, parseInteger(str + c, trailopts));
	});
}


function assertPosiNeg(opts, num, str) {
	/* Basic number parsing with the given options. */
	assertParseHelper(opts, num, str);

	/* Leading '+' makes the number positive (a no-op). */
	assertParseHelper(opts, num, '+' + str);

	/* Leading '-' makes the number negative. */
	assertParseHelper(opts, -num, '-' + str);
}


// --- Tests

/* parseInteger() compatibility with parseIntJS() */

var PI_COMPAT_VALUES = [
	'123',
	'123x4',
	'-123',
	'0x123',
	'0x123x4',
	'-0x123x4',
	'+0x123x4',
	'-',
	'0x',
	'-0x'
];

PI_COMPAT_VALUES.forEach(function (str) {
	[ undefined, 10, 16 ].forEach(function (base) {
		var bopts = { base: base };
		var copts = COMPAT_OPTS;

		if (base) {
			copts = jsprim.mergeObjects(COMPAT_OPTS, bopts);
		}

		var num = parseIntJS(str, base);
		if (isNaN(num)) {
			mod_assert.ok(isNaN(parseInteger(str, copts)));
		} else {
			mod_assert.equal(num, parseInteger(str, copts));
		}
	});
});


/* parseInteger() with different combinations of bases and options */

[ 2, 3, 8, 10, 16, 36 ].forEach(function (base) {
	console.log('testing parsing in base %d', base);

	var sopts = { base: base };
	var wopts = jsprim.mergeObjects(sopts, { trimWhitespace: true });
	var topts = jsprim.mergeObjects(sopts, { allowTrailing: true });
	var copts = jsprim.mergeObjects(sopts, COMPAT_OPTS);

	PI_BASES.forEach(function (str) {
		var num = parseIntJS(str, base);
		if (isNaN(num)) {
			/* Number cannot be parsed in our base. */
			assertInvalidError(parseInteger(str, topts));
			assertInvalidError(parseInteger('-' + str, topts));
			return;
		}

		if (str === num.toString(base)) {
			/* Parse the number as-is. */
			assertPosiNeg(sopts, num, str);

			/* Changing case shouldn't afect digits in base. */
			assertPosiNeg(sopts, num, str.toUpperCase());

			/* A leading zero doesn't change the value */
			assertPosiNeg(sopts, num, '0' + str);
		} else {
			/* The input string had trailing characters. */
			mod_assert.equal(num, parseInteger(str, copts));
			mod_assert.equal(-num, parseInteger('-' + str, copts));
		}
	});

	INVALID_BASE_CHARS.forEach(function (str) {
		assertInvalidError(parseInteger(str, sopts));
		assertInvalidError(parseInteger(str, topts));
		assertInvalidError(parseInteger(str, wopts));
	});
});


/* parseInteger() base prefixes */

var popts = { allowPrefix: true };

var PI_PREFIX_CHARS = [
	{ base: 2, chars: [ 'b', 'B' ], b17: 203, b36: 412 },
	{ base: 8, chars: [ 'o', 'O' ], b17: 0, b36: 880 },
	{ base: 10, chars: [ 't', 'T' ], b17: 0, b36: 1060 },
	{ base: 16, chars: [ 'x', 'X' ], b17: 0, b36: 1204 }
];

PI_PREFIX_CHARS.forEach(function (prefix) {
	console.log('test base %d prefixes: %j', prefix.base, prefix.chars);

	prefix.chars.forEach(function (pc) {
		var base = prefix.base;
		var ps = '0' + pc;

		function test(opts, num, str) {
			assertPosiNeg(opts, num, ps + str);
			assertPosiNeg(opts, num, ps + '0' + str);
		}

		/*
		 * When the base and prefix match, the prefix is skipped.
		 */
		var bpopts = {
			base: base,
			allowPrefix: true
		};

		[ popts, bpopts ].forEach(function (opts) {
			/* The prefix is invalid on its own. */
			assertInvalidError(parseInteger(ps, opts));

			/* Some basic numbers. */
			test(opts, 0, '0');
			test(opts, 1, '1');
			test(opts, base, '10');
			test(opts, base + 1, '11');
			test(opts, base * base, '100');
			test(opts, base * base + 1, '101');

			/* Try a bunch of different values in this base. */
			EXAMPLE_NUMS.forEach(function (num) {
				test(opts, num, num.toString(base));
			});
		});

		/* It's okay to drop the prefix if the base is given. */
		EXAMPLE_NUMS.forEach(function (num) {
			mod_assert.equal(num,
			    parseInteger(num.toString(base), bpopts));
		});

		/*
		 * When the base and prefix differ, the specified base takes
		 * precedence.
		 */
		var b17opts = {
			base: 17,
			allowPrefix: true,
			allowTrailing: true
		};

		var b36opts = {
			base: 36,
			allowPrefix: true,
			allowTrailing: true
		};

		mod_assert.equal(prefix.b17, parseInteger(ps + 'g', b17opts));
		mod_assert.equal(prefix.b36, parseInteger(ps + 'g', b36opts));
	});
});

/* Try several invalid prefixes. */
[ 'i', 'q', 'v', 'z' ].forEach(function (pc) {
	var ps = '0' + pc + '0';
	assertTrailingError(parseInteger(ps, { allowPrefix: true }));
	assertTrailingError(parseInteger(ps, { allowPrefix: false }));
});


console.log('testing edge cases');

assertInvalidError(parseInteger(''));
assertInvalidError(parseInteger('+'));
assertInvalidError(parseInteger('-'));

mod_assert.equal(0, parseInteger('0'));

/* parseInteger() doesn't return negative zero */
mod_assert.equal('0', mod_util.inspect(parseInteger('-0')));


/* parseInteger() imprecise result tests */

var PI_BOUNDARIES = [
	/* Positive imprecise numbers */
	'9007199254740992',
	'9007199254740993',
	'9007199254740995',
	'9007199254740999',
	'9007199254741000',
	'27021597764223000',
	'27021597764223001',
	'27021597764223002',
	'27021597764223003',
	'27021597764223004',
	'27021597764223005',
	'27021597764223006',

	/* Negative imprecise numbers */
	'-9007199254740992',
	'-9007199254740993',
	'-9007199254740995',
	'-9007199254740997',
	'-9007199254740999',
	'-27021597764223000',
	'-27021597764223001',
	'-27021597764223002',
	'-27021597764223003',
	'-27021597764223004',
	'-27021597764223005',
	'-27021597764223006'
];

console.log('testing imprecise parsing');


mod_assert.equal(9007199254740991, parseInteger('9007199254740991'));
mod_assert.equal(-9007199254740991, parseInteger('-9007199254740991'));

PI_BOUNDARIES.forEach(function (str) {
	var iopts = { allowImprecise: true };
	var inum = parseIntJS(str, 10);
	assertPrecisionError(parseInteger(str));
	assertParseHelper(iopts, inum, str);
});

/* parseInteger() octal notation tests */

var oopts = {
	leadingZeroIsOctal: true
};

var opopts = {
	leadingZeroIsOctal: true,
	allowPrefix: true
};

console.log('testing octal notation');

[ oopts, opopts ].forEach(function (opts) {
	/* Leading zero parses in octal */
	assertPosiNeg(opts, 0, '0');
	assertPosiNeg(opts, 0, '00');
	assertPosiNeg(opts, 1, '01');
	assertPosiNeg(opts, 8, '010');
	assertPosiNeg(opts, 9, '011');
	assertPosiNeg(opts, 511, '0777');

	/* No leading zero when option is enabled remains decimal */
	assertPosiNeg(opts, 1, '1');
	assertPosiNeg(opts, 10, '10');
	assertPosiNeg(opts, 11, '11');
	assertPosiNeg(opts, 777, '777');
});


/* parseInteger() invalid input tests */

console.log('testing invalid values');

mod_assert.throws(function () {
	parseInteger({});
});

mod_assert.throws(function () {
	parseInteger(true);
});

var INVALID_OPTS = [
	false,
	16,
	'16',
	{ base: 1 },
	{ base: 37 },
	{ allowSign: 0 },
	{ allowImprecise: {} },
	{ allowPrefix: 'please' },
	{ allowTrailing: 5 },
	{ trimWhitespace: [ true ] },
	{ leadingZeroIsOctal: 'yes' }
];

INVALID_OPTS.forEach(function (opts) {
	mod_assert.throws(function () {
		parseInteger('123', opts);
	});
});


/* parseInteger() with allowSign=false */

var sfopts = {
	allowSign: false
};

mod_assert.equal(5, parseInteger('5', sfopts));
assertInvalidError(parseInteger('+5', sfopts));
assertInvalidError(parseInteger('-5', sfopts));
