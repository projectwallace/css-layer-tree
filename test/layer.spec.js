import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { get_tree } from '../src/index.js'

test('single anonymous layer without body', () => {
	let actual = get_tree('@layer;')
	let expected = [
		{
			name: '<anonymous>',
			children: [],
		},
	]
	assert.equal(actual, expected)
})

test('single anonymous layer with body', () => {
	let actual = get_tree('@layer {}')
	let expected = [
		{
			name: '<anonymous>',
			children: [],
		},
	]
	assert.equal(actual, expected)
})

test('single named layer without body', () => {
	let actual = get_tree('@layer first;')
	let expected = [
		{
			name: 'first',
			children: [],
		},
	]
	assert.equal(actual, expected)
})

test('single named layer with body', () => {
	let actual = get_tree('@layer first {}')
	let expected = [
		{
			name: 'first',
			children: [],
		},
	]
	assert.equal(actual, expected)
})

test('multiple named layers in one line', () => {
	let actual = get_tree('@layer first, second;')
	let expected = [
		{
			name: 'first',
			children: [],
		},
		{
			name: 'second',
			children: [],
		},
	]
	assert.equal(actual, expected)
})

test('nested layers', () => {
	let actual = get_tree(`
		@layer first {
			@layer second {}
		}
	`)
	let expected = [
		{
			name: 'first',
			children: [
				{
					name: 'second',
					children: [],
				},
			],
		},
	]
	assert.equal(actual, expected)
})

test.skip('nested layers with anonymous layers', () => {
	let actual = get_tree(`
		@layer {
			@layer {}
		}
	`)
	let expected = [
		{
			name: '<anonymous>',
			children: [
				{
					name: '<anonymous>',
					children: [],
				},
			],
		},
	]
	assert.equal(actual, expected)
})

test.skip('nested layers with anonymous layers and duplicate names', () => {
	let actual = get_tree(`
		@layer {
			@layer first {}
		}

		@layer first {}
	`)
	let expected = [
		{
			name: '<anonymous>',
			children: [
				{
					name: 'first',
					children: [],
				}
			],
		},
		{
			name: 'first',
			children: [],
		},
	]
	assert.equal(actual, expected)
})

test.run()
