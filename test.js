import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { resolve } from './index.js'

test('handles empty input', () => {
	assert.is(resolve(''), [])
})

test.run()