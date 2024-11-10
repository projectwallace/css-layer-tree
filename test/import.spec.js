import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { resolve } from '../src/index.js'

test('@import url() layer', () => {
	let actual = resolve('@import url("foo.css") layer;')
	let expected = [['<anonymous>']]
	assert.equal(actual, expected)
})

test('@import url() LAYER', () => {
	let actual = resolve('@import url("foo.css") LAYER;')
	let expected = [['<anonymous>']]
	assert.equal(actual, expected)
})

test('@import url() layer()', () => {
	let actual = resolve('@import url("foo.css") layer();')
	let expected = [['<anonymous>']]
	assert.equal(actual, expected)
})

test('@import url() LAYER()', () => {
	let actual = resolve('@import url("foo.css") LAYER();')
	let expected = [['<anonymous>']]
	assert.equal(actual, expected)
})

test('@import url() layer(named)', () => {
	let actual = resolve('@import url("foo.css") layer(named);')
	let expected = [['named']]
	assert.equal(actual, expected)
})

test('@import url() LAYER(named)', () => {
	let actual = resolve('@import url("foo.css") LAYER(named);')
	let expected = [['named']]
	assert.equal(actual, expected)
})

test('@import url() layer(named.nested)', () => {
	let actual = resolve('@import url("foo.css") layer(named.nested);')
	let expected = [['named.nested']]
	assert.equal(actual, expected)
})

test('@import url() layer(named.nested     )', () => {
	let actual = resolve('@import url("foo.css") layer(named.nested     );')
	let expected = [['named.nested']]
	assert.equal(actual, expected)
})

test('@import url() layer(/* test */named.nested)', () => {
	let actual = resolve('@import url("foo.css") layer(/* test */named.nested     );')
	let expected = [['named.nested']]
	assert.equal(actual, expected)
})

test.run()
