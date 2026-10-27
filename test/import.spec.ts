import { test, expect } from 'vitest'
import { layer_tree } from '../src/index.ts'

test('@import url() layer', () => {
	let actual = layer_tree('@import url("foo.css") layer;')
	let expected = [
		{
			name: '__anonymous-1__',
			is_anonymous: true,
			locations: [{ line: 1, column: 1, start: 0, end: 29 }],
			children: [],
		},
	]
	expect(actual).toEqual(expected)
})

test('@IMPORT url() layer', () => {
	let actual = layer_tree('@IMPORT url("foo.css") layer;')
	let expected = [
		{
			name: '__anonymous-1__',
			is_anonymous: true,
			locations: [{ line: 1, column: 1, start: 0, end: 29 }],
			children: [],
		},
	]
	expect(actual).toEqual(expected)
})

test('@import url() LAYER', () => {
	let actual = layer_tree('@import url("foo.css") LAYER;')
	let expected = [
		{
			name: '__anonymous-1__',
			is_anonymous: true,
			locations: [{ line: 1, column: 1, start: 0, end: 29 }],
			children: [],
		},
	]
	expect(actual).toEqual(expected)
})

test('@import url() layer(named)', () => {
	let actual = layer_tree('@import url("foo.css") layer(named);')
	let expected = [
		{
			name: 'named',
			is_anonymous: false,
			locations: [{ line: 1, column: 1, start: 0, end: 36 }],
			children: [],
		},
	]
	expect(actual).toEqual(expected)
})

test('@import url() LAYER(named)', () => {
	let actual = layer_tree('@import url("foo.css") LAYER(named);')
	let expected = [
		{
			name: 'named',
			is_anonymous: false,
			locations: [{ line: 1, column: 1, start: 0, end: 36 }],
			children: [],
		},
	]
	expect(actual).toEqual(expected)
})

test('@import url() layer(named.nested)', () => {
	let actual = layer_tree('@import url("foo.css") layer(named.nested);')
	let expected = [
		{
			name: 'named',
			is_anonymous: false,
			locations: [{ line: 1, column: 1, start: 0, end: 43 }],
			children: [
				{
					name: 'nested',
					is_anonymous: false,
					locations: [{ line: 1, column: 1, start: 0, end: 43 }],
					children: [],
				},
			],
		},
	]
	expect(actual).toEqual(expected)
})

test('@import url() layer(named.nested     )', () => {
	let actual = layer_tree('@import url("foo.css") layer(named.nested     );')
	let expected = [
		{
			name: 'named',
			is_anonymous: false,
			locations: [{ line: 1, column: 1, start: 0, end: 48 }],
			children: [
				{
					name: 'nested',
					is_anonymous: false,
					locations: [{ line: 1, column: 1, start: 0, end: 48 }],
					children: [],
				},
			],
		},
	]
	expect(actual).toEqual(expected)
})

test('@import url() layer(/* test */named.nested     )', () => {
	let actual = layer_tree('@import url("foo.css") layer(/* test */named.nested     );')
	let expected = [
		{
			name: 'named',
			is_anonymous: false,
			locations: [{ line: 1, column: 1, start: 0, end: 58 }],
			children: [
				{
					name: 'nested',
					is_anonymous: false,
					locations: [{ line: 1, column: 1, start: 0, end: 58 }],
					children: [],
				},
			],
		},
	]
	expect(actual).toEqual(expected)
})

// Invalid CSS: the parser reads these as two names (`a` and `b`), only the first is used
test('@import url() layer(a . b) uses only the first layer name', () => {
	let actual = layer_tree('@import url(x) layer(a . b);')
	let expected = [
		{
			name: 'a',
			is_anonymous: false,
			locations: [{ line: 1, column: 1, start: 0, end: 28 }],
			children: [],
		},
	]
	expect(actual).toEqual(expected)
})

test('@import url() layer(a..b) uses only the first layer name', () => {
	let actual = layer_tree('@import url(x) layer(a..b);')
	let expected = [
		{
			name: 'a',
			is_anonymous: false,
			locations: [{ line: 1, column: 1, start: 0, end: 27 }],
			children: [],
		},
	]
	expect(actual).toEqual(expected)
})

test('@import url() layer(a.) skips trailing empty segment', () => {
	let actual = layer_tree('@import url(x) layer(a.);')
	let expected = [
		{
			name: 'a',
			is_anonymous: false,
			locations: [{ line: 1, column: 1, start: 0, end: 25 }],
			children: [],
		},
	]
	expect(actual).toEqual(expected)
})

test('@import url() layer(a\\.b) escaped dot is part of the layer name', () => {
	let actual = layer_tree('@import url(x) layer(a\\.b);')
	let expected = [
		{
			name: 'a\\.b',
			is_anonymous: false,
			locations: [{ line: 1, column: 1, start: 0, end: 27 }],
			children: [],
		},
	]
	expect(actual).toEqual(expected)
})
