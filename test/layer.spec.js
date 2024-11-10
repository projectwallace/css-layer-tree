import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { get_tree } from '../src/index.js'

test('single named layer without body', () => {
	let actual = get_tree('@layer first;')
	let expected = [['first']]
	assert.equal(actual, expected)
})

test('single named layer with body', () => {
	let actual = get_tree('@layer first {}')
	let expected = [['first']]
	assert.equal(actual, expected)
})

test('multiple named layers in one line', () => {
	let actual = get_tree('@layer first, second;')
	let expected = [['first'], ['second']]
	assert.equal(actual, expected)
})

test('nested layers', () => {
	let actual = get_tree(`
		@layer first {
			@layer second {}
		}
	`)
	let expected = [['first'], ['first', 'second']]
	assert.equal(actual, expected)
})

test('nested layers with anonymous layers', () => {
	let actual = get_tree(`
		@layer {
			@layer {}
		}
	`)
	let expected = [['<anonymous>'], ['<anonymous>', '<anonymous>']]
	assert.equal(actual, expected)
})

test('nested layers with anonymous layers and duplicate names', () => {
	let actual = get_tree(`
		@layer {
			@layer first {}
		}

		@layer first {}
	`)
	let expected = [['<anonymous>'], ['<anonymous>', 'first'], ['first']]
	assert.equal(actual, expected)
})

test.run()
