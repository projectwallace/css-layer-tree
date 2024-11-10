import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { get_tree } from '../src/index.js'

test('handles empty input', () => {
	assert.equal(get_tree(''), [])
})

test('handles CSS without layers', () => {
	assert.equal(get_tree('@media all { body { color: red; } }'), [])
})

test.run()
