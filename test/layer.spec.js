import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { resolve } from '../src/index.js'

test('single named layer without body', () => {
	let actual = resolve('@layer first;')
	let expected = [['first']]
	assert.equal(actual, expected)
})

test('single named layer with body', () => {
	let actual = resolve('@layer first {}')
	let expected = [['first']]
	assert.equal(actual, expected)
})

test('multiple named layers in one line', () => {
	let actual = resolve('@layer first, second;')
	let expected = [['first'], ['second']]
	assert.equal(actual, expected)
})

test('nested layers', () => {
	let actual = resolve(`
		@layer first {
			@layer second {}
		}
	`)
	let expected = [['first'], ['first', 'second']]
	assert.equal(actual, expected)
})

test('nested layers with anonymous layers', () => {
	let actual = resolve(`
		@layer {
			@layer {}
		}
	`)
	let expected = [['<anonymous>'], ['<anonymous>', '<anonymous>']]
	assert.equal(actual, expected)
})

test('nested layers with anonymous layers and duplicate names', () => {
	let actual = resolve(`
		@layer {
			@layer first {}
		}

		@layer first {}
	`)
	let expected = [['<anonymous>'], ['<anonymous>', 'first'], ['first']]
	assert.equal(actual, expected)
})

test.run()
