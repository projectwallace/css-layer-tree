import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { layer_tree } from '../src/index.js'

test('single anonymous layer without body', () => {
	let actual = layer_tree('@layer;')
	let expected = [
		{
			name: '__anonymous-1__',
			is_anonymous: true,
			children: [],
			locations: [{ line: 1, column: 1, start: 0, end: 7 }]
		},
	]
	assert.equal(actual, expected)
})

test('single anonymous layer with body', () => {
	let actual = layer_tree('@layer {}')
	let expected = [
		{
			name: '__anonymous-1__',
			is_anonymous: true,
			children: [],
			locations: [{ line: 1, column: 1, start: 0, end: 9 }]
		},
	]
	assert.equal(actual, expected)
})

test('nested anonymous layers', () => {
	let actual = layer_tree(`
		@layer {
			@layer {
				@layer {}
			}
		}
	`)
	let expected = [
		{
			name: '__anonymous-1__',
			is_anonymous: true,
			locations: [{ line: 2, column: 3, start: 3, end: 46 }],
			children: [
				{
					name: '__anonymous-2__',
					is_anonymous: true,
					locations: [{ line: 3, column: 4, start: 15, end: 42 }],
					children: [
						{
							name: '__anonymous-3__',
							is_anonymous: true,
							children: [],
							locations: [{ line: 4, column: 5, start: 28, end: 37 }],
						},
					],
				},
			],
		},
	]
	assert.equal(actual, expected)
})

test('consecutive anonymous layers', () => {
	let actual = layer_tree(`
		@layer {}
		@layer {}
	`)
	let expected = [
		{
			name: '__anonymous-1__',
			is_anonymous: true,
			locations: [{ line: 2, column: 3, start: 3, end: 12 }],
			children: [],
		},
		{
			name: '__anonymous-2__',
			is_anonymous: true,
			locations: [{ line: 3, column: 3, start: 15, end: 24 }],
			children: [],
		},
	]
	assert.equal(actual, expected)
})

test.run()
