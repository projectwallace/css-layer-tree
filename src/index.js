import { TreeNode } from './TreeNode.js'
import { AT_RULE, LAYER_NAME, parse, traverse } from '@projectwallace/css-parser'

/** @param {string} name */
function get_layer_names(name) {
	return name.split('.').map((s) => s.trim())
}

/** @param {import('@projectwallace/css-parser').CSSNode} node */
function create_location(node) {
	return {
		line: node.line,
		column: node.column,
		start: node.start,
		end: node.end,
	}
}

/** @param {import('@projectwallace/css-parser').CSSNode} ast */
export function layer_tree_from_ast(ast) {
	/** @type {string[]} */
	let current_stack = []
	let root = new TreeNode('root')
	let anonymous_counter = 0

	/** @returns {string} */
	function get_anonymous_id() {
		anonymous_counter++
		return `__anonymous-${anonymous_counter}__`
	}

	traverse(ast, {
		enter(node) {
			if (node.type !== AT_RULE) return

			if (node.name === 'layer') {
				if (node.prelude) {
					let groups = node.prelude.text.split(',').map((s) => s.trim())
					if (!node.has_block) {
						for (let name of groups) {
							let parts = get_layer_names(name)
							// Ensure all parent layers exist and add them to the tree
							for (let i = 0; i < parts.length; i++) {
								let path = parts.slice(0, i)
								let layer_name = parts[i]
								if (layer_name) {
									// Only add location to the final layer in dotted notation
									// Create a new copy to avoid sharing references
									let loc = i === parts.length - 1 ? create_location(node) : undefined
									root.add_child(path, layer_name, loc)
								}
							}
						}
					} else {
						// prelude.children contains the individual segments for dotted notation
						// e.g., @layer base.props {} has children: ["base", "props"]
						let layer_names = []
						for (let child of node.prelude.children) {
							if (child.type === LAYER_NAME) {
								layer_names.push(child.text)
							}
						}
						// Add each layer in the hierarchy
						for (let i = 0; i < layer_names.length; i++) {
							let layer_name = layer_names[i]
							if (!layer_name) continue
							let path = layer_names.slice(0, i)
							let loc = i === layer_names.length - 1 ? create_location(node) : undefined
							root.add_child(current_stack.concat(path), layer_name, loc)
						}
						// Push all layers to the stack
						current_stack.push(...layer_names)
					}
				} else {
					let name = get_anonymous_id()
					root.add_child(current_stack, name, create_location(node))
					current_stack.push(name)
				}
			} else if (node.name === 'import' && node.prelude) {
				// @import url("foo.css") layer(test);
				// OR
				// @import url("foo.css") layer(test.nested);
				for (let child of node.prelude.children) {
					if (child.type === LAYER_NAME) {
						if (child.name.trim()) {
							for (let layer_name of get_layer_names(child.name)) {
								root.add_child(current_stack, layer_name, create_location(node))
								current_stack.push(layer_name)
							}
						} else {
							// @import url("foo.css") layer;
							let name = get_anonymous_id()
							root.add_child([], name, create_location(node))
						}
						break
					}
				}
			}
		},
		leave(node) {
			if (node.type !== AT_RULE) return

			if (node.name === 'layer') {
				if (node.prelude && node.has_block) {
					// Count how many layer segments we pushed
					let layer_count = 0
					for (let child of node.prelude.children) {
						if (child.type === LAYER_NAME) {
							layer_count++
						}
					}
					// Pop all of them
					for (let i = 0; i < layer_count; i++) {
						current_stack.pop()
					}
				} else {
					// pop the anonymous layer
					current_stack.pop()
				}
			} else if (node.name === 'import') {
				// clear the stack, imports can not be nested
				current_stack.length = 0
			}
		},
	})

	return root.to_plain_object().children
}

/**
 * @param {string} css
 */
export function layer_tree(css) {
	let ast = parse(css, {
		parse_selectors: false,
		parse_values: false,
	})

	return layer_tree_from_ast(ast)
}
