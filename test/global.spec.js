import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { resolve } from '../src/index.js'

test('handles empty input', () => {
	assert.equal(resolve(''), [])
})

test('handles CSS without layers', () => {
	assert.equal(resolve('@media all { body { color: red; } }'), [])
})

test.run()
