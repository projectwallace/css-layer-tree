import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { layer_tree } from '../src/index.js'

test('@import url() layer', () => {
	let actual = layer_tree('@import url("foo.css") layer;')
	let expected = [{
		name: '__anonymous-1__',
		is_anonymous: true,
		locations: [{ line: 1, column: 1, start: 0, end: 29 }],
		children: []
	}]
	assert.equal(actual, expected)
})

test('@import url() LAYER', () => {
	let actual = layer_tree('@import url("foo.css") LAYER;')
	let expected = [{
		"name": "__anonymous-1__",
		is_anonymous: true,
		locations: [{ line: 1, column: 1, start: 0, end: 29 }],
		"children": []
	}]
	assert.equal(actual, expected)
})

test('@import url() layer(named)', () => {
	let actual = layer_tree('@import url("foo.css") layer(named);')
	let expected = [{
		name: 'named',
		is_anonymous: false,
		locations: [{ line: 1, column: 1, start: 0, end: 36 }],
		children: []
	}]
	assert.equal(actual, expected)
})

test('@import url() LAYER(named)', () => {
	let actual = layer_tree('@import url("foo.css") LAYER(named);')
	let expected = [{
		name: 'named',
		is_anonymous: false,
		locations: [{ line: 1, column: 1, start: 0, end: 36 }],
		children: []
	}]
	assert.equal(actual, expected)
})

test('@import url() layer(named.nested)', () => {
	let actual = layer_tree('@import url("foo.css") layer(named.nested);')
	let expected = [{
		name: 'named',
		is_anonymous: false,
		locations: [{ line: 1, column: 1, start: 0, end: 43 }],
		children: [{
			name: 'nested',
			is_anonymous: false,
			locations: [{ line: 1, column: 1, start: 0, end: 43 }],
			children: []
		}]
	}]
	assert.equal(actual, expected)
})

test('@import url() layer(named.nested     )', () => {
	let actual = layer_tree('@import url("foo.css") layer(named.nested     );')
	let expected = [{
		name: 'named',
		is_anonymous: false,
		locations: [{ line: 1, column: 1, start: 0, end: 48 }],
		children: [{
			name: 'nested',
			is_anonymous: false,
			locations: [{ line: 1, column: 1, start: 0, end: 48 }],
			children: []
		}]
	}]
	assert.equal(actual, expected)
})

test('@import url() layer(/* test */named.nested     )', () => {
	let actual = layer_tree('@import url("foo.css") layer(/* test */named.nested     );')
	let expected = [{
		name: 'named',
		is_anonymous: false,
		locations: [{ line: 1, column: 1, start: 0, end: 58 }],
		children: [{
			name: 'nested',
			is_anonymous: false,
			locations: [{ line: 1, column: 1, start: 0, end: 58 }],
			children: []
		}]
	}]
	assert.equal(actual, expected)
})

test.run()
