# css-layer-tree

Lay out the composition of your CSS `@layer` architecture. See which layers are used, where they are defined and how they are nested.

## Installation

```
npm install @projectwallace/css-layer-tree
```

## Usage

```js
import { layer_tree } from '@projectwallace/css-layer-tree'

let css = `
@import url("test.css") layer;
@import url("test.css") LAYER(test);
@layer anotherTest {
	@layer moreTest {
		@layer deepTest {}
	}
}
/* anonymous @layer */
@layer {}
`

let tree = layer_tree(css)
```

This example would result in this `tree`:

```js
;[
	{
		name: '__anonymous-1__',
		is_anonymous: true,
		locations: [{ line: 2, column: 1, start: 1, end: 31 }],
		children: [],
	},
	{
		name: 'test',
		is_anonymous: false,
		locations: [{ line: 3, column: 1, start: 32, end: 68 }],
		children: [],
	},
	{
		name: 'anotherTest',
		is_anonymous: false,
		locations: [{ line: 4, column: 1, start: 69, end: 134 }],
		children: [
			{
				name: 'moreTest',
				is_anonymous: false,
				locations: [{ line: 5, column: 2, start: 91, end: 132 }],
				children: [
					{
						name: 'deepTest',
						is_anonymous: false,
						locations: [{ line: 6, column: 3, start: 111, end: 129 }],
						children: [],
					},
				],
			},
		],
	},
	{
		name: '__anonymous-2__',
		is_anonymous: true,
		locations: [{ line: 10, column: 1, start: 158, end: 167 }],
		children: [],
	},
]
```

## Related projects

- [Online CSS Layers visualizer](https://www.projectwallace.com/css-layers-visualizer) - See this library in action online!
- [CSS Analyzer](https://github.com/projectwallace/css-analyzer) - The best CSS analyzer that powers all analysis on [projectwallace.com](https://www.projectwallace.com)
