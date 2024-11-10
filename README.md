# css-layer-tree

Lay out the composition of your CSS `@layer` architecture. See which layers are used, where they are defined and how they are nested.

## Installation

```
npm install @projectwallace/css-layer-tree
```

## Usage

```js
import { get_tree } from '@projectwallace/css-layer-tree'

let css = `
@import url("test.css") layer;
@import url("test.css") LAYER(test);
@layer anotherTest {
	@layer moreTest {
		@layer deepTest {}
	}
};
/* anonymous @layer */
@layer {}
`

let tree = get_tree(css)
```

This example would result in this `tree`:

```js
;[
	{
		name: '__anonymous-1__',
		locations: [{ line: 2, column: 3, start: 3, end: 33 }],
		children: [],
	},
	{
		name: 'test',
		locations: [{ line: 3, column: 3, start: 36, end: 72 }],
		children: [],
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
						children: [],
					},
				],
			},
		],
	},
]
```

## Related projects

- [Online CSS Layers visualizer](https://www.projectwallace.com/css-layers-visualizer) - See this library in action online!
- [CSS Analyzer](https://github.com/projectwallace/css-analyzer) - The best CSS analyzer that powers all analysis on [projectwallace.com](https://www.projectwallace.com)
