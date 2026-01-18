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
			locations: [{ line: 2, column: 3, start: 3, end: 33 }],
			children: [],
		},
		{
			name: 'test',
			is_anonymous: false,
			locations: [{ line: 3, column: 3, start: 36, end: 72 }],
			children: [],
		},
		{
			name: 'anotherTest',
			is_anonymous: false,
			locations: [{ line: 4, column: 3, start: 75, end: 148 }],
			children: [
				{
					name: 'moreTest',
					is_anonymous: false,
					locations: [{ line: 5, column: 4, start: 99, end: 144 }],
					children: [
						{
							name: 'deepTest',
							is_anonymous: false,
							locations: [{ line: 6, column: 5, start: 121, end: 139 }],
							children: [],
						},
					],
				},
			],
		},
		{
			name: '__anonymous-2__',
			is_anonymous: true,
			locations: [{ line: 10, column: 3, start: 176, end: 185 }],
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
			locations: [{ line: 2, column: 3, start: 3, end: 49 }],
			children: [
				{
					name: 'reset',
					is_anonymous: false,
					locations: [{ line: 3, column: 3, start: 52, end: 94 }],
					children: [],
				},
				{
					name: 'tokens',
					is_anonymous: false,
					locations: [{ line: 3, column: 3, start: 52, end: 94 }],
					children: [],
				},
				{
					name: 'base',
					is_anonymous: false,
					locations: [{ line: 3, column: 3, start: 52, end: 94 }],
					children: [],
				},
			],
		},
		{
			name: 'third-party',
			is_anonymous: false,
			locations: [{ line: 2, column: 3, start: 3, end: 49 }],
			children: [
				{
					name: 'imports',
					is_anonymous: false,
					locations: [{ line: 4, column: 3, start: 97, end: 147 }],
					children: [],
				},
				{
					name: 'overrides',
					is_anonymous: false,
					locations: [{ line: 4, column: 3, start: 97, end: 147 }],
					children: [],
				},
			],
		},
		{
			name: 'components',
			is_anonymous: false,
			locations: [{ line: 2, column: 3, start: 3, end: 49 }],
			children: [
				{
					name: 'base',
					is_anonymous: false,
					locations: [{ line: 5, column: 3, start: 150, end: 196 }],
					children: [],
				},
				{
					name: 'variations',
					is_anonymous: false,
					locations: [{ line: 5, column: 3, start: 150, end: 196 }],
					children: [],
				},
			],
		},
		{
			name: 'utility',
			is_anonymous: false,
			locations: [{ line: 2, column: 3, start: 3, end: 49 }],
			children: [],
		},
	]
	assert.equal(actual, expected)
})

test('nerdy.dev', () => {
	let actual = layer_tree(`
		@layer base.props {}
		@layer base.normalize {}
		@layer base.normalize {}
		@layer base.theme {}
		@layer base.utilities {}
		@layer base.containers {}
		@layer base.nojs {}
		@layer base.normalize {}

		@layer components.links {}
		@layer components.toast {}
		@layer components.markdown {}
		@layer components.syntax {}
		@layer components.p3 {}
		@layer components.quote {}
		@layer components.fresh {}

		@layer overrides {}
	`)
	let expected = [
		{
			name: 'base',
			is_anonymous: false,
			locations: [],
			children: [
				{
					name: 'props',
					is_anonymous: false,
					locations: [
						{
							line: 2,
							column: 3,
							start: 3,
							end: 23,
						},
					],
					children: [],
				},
				{
					name: 'normalize',
					is_anonymous: false,
					locations: [
						{
							line: 3,
							column: 3,
							start: 26,
							end: 50,
						},
						{
							line: 4,
							column: 3,
							start: 53,
							end: 77,
						},
						{
							line: 9,
							column: 3,
							start: 180,
							end: 204,
						},
					],
					children: [],
				},
				{
					name: 'theme',
					is_anonymous: false,
					locations: [
						{
							line: 5,
							column: 3,
							start: 80,
							end: 100,
						},
					],
					children: [],
				},
				{
					name: 'utilities',
					is_anonymous: false,
					locations: [
						{
							line: 6,
							column: 3,
							start: 103,
							end: 127,
						},
					],
					children: [],
				},
				{
					name: 'containers',
					is_anonymous: false,
					locations: [
						{
							line: 7,
							column: 3,
							start: 130,
							end: 155,
						},
					],
					children: [],
				},
				{
					name: 'nojs',
					is_anonymous: false,
					locations: [
						{
							line: 8,
							column: 3,
							start: 158,
							end: 177,
						},
					],
					children: [],
				},
			],
		},
		{
			name: 'components',
			is_anonymous: false,
			locations: [],
			children: [
				{
					name: 'links',
					is_anonymous: false,
					locations: [
						{
							line: 11,
							column: 3,
							start: 208,
							end: 234,
						},
					],
					children: [],
				},
				{
					name: 'toast',
					is_anonymous: false,
					locations: [
						{
							line: 12,
							column: 3,
							start: 237,
							end: 263,
						},
					],
					children: [],
				},
				{
					name: 'markdown',
					is_anonymous: false,
					locations: [
						{
							line: 13,
							column: 3,
							start: 266,
							end: 295,
						},
					],
					children: [],
				},
				{
					name: 'syntax',
					is_anonymous: false,
					locations: [
						{
							line: 14,
							column: 3,
							start: 298,
							end: 325,
						},
					],
					children: [],
				},
				{
					name: 'p3',
					is_anonymous: false,
					locations: [
						{
							line: 15,
							column: 3,
							start: 328,
							end: 351,
						},
					],
					children: [],
				},
				{
					name: 'quote',
					is_anonymous: false,
					locations: [
						{
							line: 16,
							column: 3,
							start: 354,
							end: 380,
						},
					],
					children: [],
				},
				{
					name: 'fresh',
					is_anonymous: false,
					locations: [
						{
							line: 17,
							column: 3,
							start: 383,
							end: 409,
						},
					],
					children: [],
				},
			],
		},
		{
			name: 'overrides',
			is_anonymous: false,
			locations: [
				{
					line: 19,
					column: 3,
					start: 413,
					end: 432,
				},
			],
			children: [],
		},
	]
	assert.equal(actual, expected)
})

test.run()
