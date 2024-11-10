import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { get_tree } from '../src/index.js'

test('handles empty input', () => {
	assert.equal(get_tree(''), [])
})

test('handles CSS without layers', () => {
	assert.equal(get_tree('@media all { body { color: red; } }'), [])
})

test('mixed imports and layers', () => {
	let actual = get_tree(`
		@import url("test.css") layer;
		@import url("test.css") LAYER(test);
		@layer anotherTest {
			@layer moreTest {
				@layer deepTest {}
			}
		};
		/* anonymous @layer */
		@layer {}
	`)
	let expected = [
		{
			name: '__anonymous-1__',
			locations: [{ line: 2, column: 3, start: 3, end: 33 }],
			children: []
		},
		{
			name: 'test',
			locations: [{ line: 3, column: 3, start: 36, end: 72 }],
			children: []
		},
		{
			name: 'anotherTest',
			locations: [{ line: 4, column: 3, start: 75, end: 148 }],
			children: [
				{
					name: 'moreTest',
					locations: [{ line: 5, column: 4, start: 99, end: 144 }],
					children: [
						{
							name: 'deepTest',
							locations: [{ line: 6, column: 5, start: 121, end: 139 }],
							children: []
						}
					]
				}
			]
		}
	]
	assert.equal(actual, expected)
})

test.run()
