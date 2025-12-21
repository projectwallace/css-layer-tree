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
			locations: [{ line: 1, column: 1, start: 0, end: 7 }],
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
			locations: [{ line: 1, column: 1, start: 0, end: 9 }],
		},
	]
	assert.equal(actual, expected)
})

test('single named layer without body', () => {
	let actual = layer_tree('@layer first;')
	let expected = [
		{
			name: 'first',
			is_anonymous: false,
			children: [],
			locations: [{ line: 1, column: 1, start: 0, end: 13 }],
		},
	]
	assert.equal(actual, expected)
})

test('single named layer with body', () => {
	let actual = layer_tree('@layer first {}')
	let expected = [
		{
			name: 'first',
			is_anonymous: false,
			children: [],
			locations: [{ line: 1, column: 1, start: 0, end: 15 }],
		},
	]
	assert.equal(actual, expected)
})

test('multiple named layers in one line', () => {
	let actual = layer_tree(`@layer first, second;`)
	let expected = [
		{
			name: 'first',
			is_anonymous: false,
			children: [],
			locations: [{ line: 1, column: 1, start: 0, end: 21 }],
		},
		{
			name: 'second',
			is_anonymous: false,
			children: [],
			locations: [{ line: 1, column: 1, start: 0, end: 21 }],
		},
	]
	assert.equal(actual, expected)
})

test('repeated use of the same layer name', () => {
	let actual = layer_tree(`
		@layer first {}
		@layer first {}
	`)
	let expected = [
		{
			name: 'first',
			is_anonymous: false,
			children: [],
			locations: [
				{ line: 2, column: 3, start: 3, end: 18 },
				{ line: 3, column: 3, start: 21, end: 36 },
			],
		},
	]
	assert.equal(actual, expected)
})

test('nested layers', () => {
	let actual = layer_tree(`
		@layer first {
			@layer second {
				@layer third {}
				@media all {}
				@layer fourth {}
			}
		}
	`)
	let expected = [
		{
			name: 'first',
			is_anonymous: false,
			locations: [{ line: 2, column: 3, start: 3, end: 104 }],
			children: [
				{
					name: 'second',
					is_anonymous: false,
					locations: [{ line: 3, column: 4, start: 21, end: 100 }],
					children: [
						{
							name: 'third',
							is_anonymous: false,
							locations: [{ line: 4, column: 5, start: 41, end: 56 }],
							children: [],
						},
						{
							name: 'fourth',
							is_anonymous: false,
							locations: [{ line: 6, column: 5, start: 79, end: 95 }],
							children: [],
						},
					],
				},
			],
		},
	]
	assert.equal(actual, expected)
})

test('nested layers with anonymous layers', () => {
	let actual = layer_tree(`
		@layer {
			@layer {}
		}
	`)
	let expected = [
		{
			name: '__anonymous-1__',
			is_anonymous: true,
			locations: [{ line: 2, column: 3, start: 3, end: 28 }],
			children: [
				{
					name: '__anonymous-2__',
					is_anonymous: true,
					children: [],
					locations: [{ line: 3, column: 4, start: 15, end: 24 }],
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

test('nested layers with anonymous layers and duplicate names', () => {
	let actual = layer_tree(`
		@layer {
			@layer first {}
		}

		@layer first {}
	`)
	let expected = [
		{
			name: '__anonymous-1__',
			is_anonymous: true,
			locations: [{ line: 2, column: 3, start: 3, end: 34 }],
			children: [
				{
					name: 'first',
					is_anonymous: false,
					children: [],
					locations: [{ line: 3, column: 4, start: 15, end: 30 }],
				},
			],
		},
		{
			name: 'first',
			is_anonymous: false,
			locations: [{ line: 6, column: 3, start: 38, end: 53 }],
			children: [],
		},
	]
	assert.equal(actual, expected)
})

test.run()
