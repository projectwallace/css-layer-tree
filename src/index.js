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
				if (node.prelude !== null) {
					let groups = node.prelude.split(',').map((s) => s.trim())
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
						for (let child of node.children) {
							if (child.type === LAYER_NAME) {
								root.add_child(current_stack, child.text, create_location(node))
								current_stack.push(child.text)
							}
						}
					}
				} else {
					let name = get_anonymous_id()
					root.add_child(current_stack, name, create_location(node))
					current_stack.push(name)
				}
			} else if (node.name === 'import') {
				// @import url("foo.css") layer(test);
				// OR
				// @import url("foo.css") layer(test.nested);
				let layerNode = node.children.find((child) => child.type === LAYER_NAME)
				if (layerNode) {
					if (layerNode.name.trim()) {
						for (let layer_name of get_layer_names(layerNode.name)) {
							root.add_child(current_stack, layer_name, create_location(node))
							current_stack.push(layer_name)
						}
					} else {
						// @import url("foo.css") layer;
						let name = get_anonymous_id()
						root.add_child([], name, create_location(node))
					}
				}
			}
		},
		leave(node) {
			if (node.type !== AT_RULE) return

			if (node.name === 'layer') {
				if (node.has_prelude) {
					let has_block = node.has_children && node.children.some((c) => c.type !== LAYER_NAME)
					if (has_block) {
						let name = node.children.find((child) => child.type === LAYER_NAME)
						if (name) {
							let layer_names = get_layer_names(name.text)
							for (let i = 0; i < layer_names.length; i++) {
								current_stack.pop()
							}
						}
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
		skip_comments: true,
	})

	return layer_tree_from_ast(ast)
}
