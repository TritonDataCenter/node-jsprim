#
# Copyright (c) 2012, Joyent, Inc. All rights reserved.
#
# Makefile: top-level Makefile
#
# This Makefile contains only repo-specific logic and uses included makefiles
# to supply common targets (javascriptlint, jsstyle, restdown, etc.), which are
# used by other repos as well.
#

#
# Tools
#
NPM		?= npm

#
# Files
#
JS_FILES	:= $(shell find lib test -name '*.js')
JSL_FILES_NODE   = $(JS_FILES)
JSSTYLE_FILES	 = $(JS_FILES)
JSL_CONF_NODE	 = jsl.node.conf

.PHONY: all
all:
	$(NPM) install

.PHONY: test
test:
	node test/basic.js
	node test/validate.js
	node test/hrtimediff.js
	node test/hrtimesecs.js
	node test/hrtimeadd.js
	node test/extraprops.js
	node test/merge.js
	node test/parse-integer.js
	@echo tests okay

include ./Makefile.targ
