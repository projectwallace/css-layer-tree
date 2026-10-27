import {
	type CSSNode,
	parse,
	traverse,
	is_atrule,
	is_layer_name,
	is_atrule_prelude,
	is_function,
	str_equals,
} from '@projectwallace/css-parser'

export type Location = {
	line: number
	column: number
	start: number
	end: number
}

export type TreeNode = {
	name: string
	is_anonymous: boolean
	locations: Location[]
	children: TreeNode[]
}

// Walk `path` from `root`, creating missing nodes along the way,
// and add `location` to the final node only
function add_layer(root: TreeNode, path: string[], location?: Location): void {
	let current = root

	for (let name of path) {
		let child = current.children.find((c) => c.name === name)
		if (!child) {
			child = { name, is_anonymous: name.startsWith('__anonymous'), locations: [], children: [] }
			current.children.push(child)
		}
		current = child
	}

	if (location) {
		current.locations.push(location)
	}
}

// Split on dots, except escaped ones: `a\.b` is a single layer name
const UNESCAPED_DOT = /(?<!\\)\./

function get_layer_names(name: string): string[] {
	return name.split(UNESCAPED_DOT)
}

// One entry per comma-separated group, e.g. `@layer a, b.c` -> [['a'], ['b', 'c']]
function get_prelude_groups(node: CSSNode): string[][] {
	let groups: string[][] = []
	if (is_atrule_prelude(node)) {
		for (let child of node.children) {
			if (is_layer_name(child)) {
				groups.push(get_layer_names(child.name))
			}
		}
	}
	return groups
}

function create_location(node: CSSNode): Location {
	return {
		line: node.line,
		column: node.column,
		start: node.start,
		end: node.end,
	}
}

export function layer_tree_from_ast(ast: CSSNode): TreeNode[] {
	let current_stack: string[] = []
	// Stack length at each at-rule's enter, restored on leave
	let saved_lengths: number[] = []
	let root: TreeNode = { name: 'root', is_anonymous: false, locations: [], children: [] }
	let anonymous_counter = 0

	function get_anonymous_id(): string {
		anonymous_counter++
		return `__anonymous-${anonymous_counter}__`
	}

	traverse(ast, {
		enter(node) {
			if (!is_atrule(node)) {
				return
			}

			saved_lengths.push(current_stack.length)

			if (str_equals('layer', node.name)) {
				if (!node.has_prelude) {
					let name = get_anonymous_id()
					current_stack.push(name)
					add_layer(root, current_stack, create_location(node))
				} else if (node.has_block) {
					// @layer base.props {} has a single group: ['base', 'props']
					current_stack.push(...get_prelude_groups(node.prelude).flat())
					add_layer(root, current_stack, create_location(node))
				} else {
					for (let names of get_prelude_groups(node.prelude)) {
						add_layer(root, current_stack.concat(names), create_location(node))
					}
				}
			} else if (
				str_equals('import', node.name) &&
				node.has_prelude &&
				is_atrule_prelude(node.prelude)
			) {
				// @import url("foo.css") layer(test);
				// OR
				// @import url("foo.css") layer(test.nested);
				for (let child of node.prelude.children) {
					if (is_function(child) && str_equals('layer', child.name)) {
						// layer(name) is a Function with a LayerName child, layer() has no children
						let layer = child.first_child
						let names = layer && is_layer_name(layer) ? get_layer_names(layer.name) : []
						let loc = create_location(node)
						if (names.length > 0) {
							// Every segment gets the location
							for (let name of names) {
								current_stack.push(name)
								add_layer(root, current_stack, loc)
							}
						} else {
							// @import url("foo.css") layer();
							add_layer(root, [get_anonymous_id()], loc)
						}
						break
					}
					if (is_layer_name(child)) {
						// @import url("foo.css") layer;
						add_layer(root, [get_anonymous_id()], create_location(node))
						break
					}
				}
			}
		},
		leave(node) {
			if (is_atrule(node)) {
				current_stack.length = saved_lengths.pop()!
			}
		},
	})

	return root.children
}

export function layer_tree(css: string): TreeNode[] {
	let ast = parse(css, {
		parse_selectors: false,
		parse_values: false,
	})

	return layer_tree_from_ast(ast)
}
