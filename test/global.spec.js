import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { layer_tree } from '../src/index.js'

test('handles empty input', () => {
	assert.equal(layer_tree(''), [])
})

test('handles CSS without layers', () => {
	assert.equal(layer_tree('@media all { body { color: red; } }'), [])
})

test('mixed imports and layers', () => {
	let actual = layer_tree(`
		@import url("test.css") layer;
		@import url("test.css") LAYER(test);
		@layer anotherTest {
			@layer moreTest {
				@layer deepTest {}
			}
		}
		/* anonymous @layer */
		@layer {}
	`)
	let expected = [
		{
			name: '__anonymous-1__',
			is_anonymous: true,
			locations: [{ line: 2, column: 3, start: 3 }],
			children: [],
		},
		{
			name: 'test',
			is_anonymous: false,
			locations: [{ line: 3, column: 3, start: 36 }],
			children: [],
		},
		{
			name: 'anotherTest',
			is_anonymous: false,
			locations: [{ line: 4, column: 3, start: 75 }],
			children: [
				{
					name: 'moreTest',
					is_anonymous: false,
					locations: [{ line: 5, column: 4, start: 99 }],
					children: [
						{
							name: 'deepTest',
							is_anonymous: false,
							locations: [{ line: 6, column: 5, start: 121 }],
							children: [],
						},
					],
				},
			],
		},
		{
			name: '__anonymous-2__',
			is_anonymous: true,
			locations: [{ line: 10, column: 3, start: 176 }],
			children: [],
		},
	]
	assert.equal(actual, expected)
})

test('the fokus.dev boilerplate', () => {
	let actual = layer_tree(`
		@layer core, third-party, components, utility;
		@layer core.reset, core.tokens, core.base;
		@layer third-party.imports, third-party.overrides;
		@layer components.base, components.variations;
	`)
	let expected = [
		{
			name: 'core',
			is_anonymous: false,
			locations: [{ line: 2, column: 3, start: 3 }],
			children: [
				{
					name: 'reset',
					is_anonymous: false,
					locations: [{ line: 3, column: 3, start: 52 }],
					children: [],
				},
				{
					name: 'tokens',
					is_anonymous: false,
					locations: [{ line: 3, column: 3, start: 52 }],
					children: [],
				},
				{
					name: 'base',
					is_anonymous: false,
					locations: [{ line: 3, column: 3, start: 52 }],
					children: [],
				},
			],
		},
		{
			name: 'third-party',
			is_anonymous: false,
			locations: [{ line: 2, column: 3, start: 3 }],
			children: [
				{
					name: 'imports',
					is_anonymous: false,
					locations: [{ line: 4, column: 3, start: 97 }],
					children: [],
				},
				{
					name: 'overrides',
					is_anonymous: false,
					locations: [{ line: 4, column: 3, start: 97 }],
					children: [],
				},
			],
		},
		{
			name: 'components',
			is_anonymous: false,
			locations: [{ line: 2, column: 3, start: 3 }],
			children: [
				{
					name: 'base',
					is_anonymous: false,
					locations: [{ line: 5, column: 3, start: 150 }],
					children: [],
				},
				{
					name: 'variations',
					is_anonymous: false,
					locations: [{ line: 5, column: 3, start: 150 }],
					children: [],
				},
			],
		},
		{
			name: 'utility',
			is_anonymous: false,
			locations: [{ line: 2, column: 3, start: 3 }],
			children: [],
		},
	]
	assert.equal(actual, expected)
})

test.run()
