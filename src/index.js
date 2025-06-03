import * as csstree from 'css-tree'
import { TreeNode } from './TreeNode.js'

/**
 * @typedef Location
 * @property {number} line
 * @property {number} column
 * @property {number} start
 * @property {number} end
 */

/**
 * @param {import('css-tree').CssNode} node
 * @returns {Location | undefined}
 */
function get_location(node) {
	let loc = node.loc
	if (!loc) return
	let { start, end } = loc
	return {
		line: start.line,
		column: start.column,
		start: start.offset,
		end: end.offset,
	}
}

/** @param {import('css-tree').Atrule} node */
function is_layer(node) {
	return node.name.toLowerCase() === 'layer'
}

/**
 * @param {import('css-tree').AtrulePrelude} prelude
 * @returns {string[]}
 */
function get_layer_names(prelude) {
	return csstree
		// @todo: fewer loops plz
		.generate(prelude)
		.split('.')
		.map((s) => s.trim())
}

/**
 * @param {import('css-tree').CssNode} ast
 */
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

	csstree.walk(ast, {
		visit: 'Atrule',
		enter(node) {
			if (is_layer(node)) {
				let location = get_location(node)

				if (node.prelude === null) {
					// @layer {}
					let layer_name = get_anonymous_id()
					root.add_child(current_stack, layer_name, location)
					current_stack.push(layer_name)
				} else if (node.prelude.type === 'AtrulePrelude') {
					if (node.block === null) {
						// @layer test;
						// @layer test.nested;
						// @layer first, second;
						// @layer core.reset, core.tokens;
						// @ts-expect-error CSSTree types are not updated yet in @types/css-tree
						let layers = csstree.findAll(node.prelude, n => n.type === 'Layer')
						for (let layer of layers) {
							// console.log('enter', layer.name)
							for (let layer_name of get_layer_names(layer)) {
								root.add_child(current_stack, layer_name, location)
								current_stack.push(layer_name)
							}
							current_stack = []
						}
					} else {
						// @layer test { ... }
						// @layer test.nested { ... }
						for (let layer_name of get_layer_names(node.prelude)) {
							root.add_child(current_stack, layer_name, location)
							current_stack.push(layer_name)
						}
					}
				}
			} else if (node.name.toLowerCase() === 'import' && node.prelude !== null && node.prelude.type === 'AtrulePrelude') {
				let location = get_location(node)
				let prelude = node.prelude

				// @import url("foo.css") layer(test);
				// OR
				// @import url("foo.css") layer(test.nested);
				// @ts-expect-error CSSTree types are not updated to v3 yet
				let layer = csstree.find(prelude, n => n.type === 'Layer')
				if (layer) {
					// @ts-expect-error CSSTree types are not updated to v3 yet
					for (let layer_name of get_layer_names(layer)) {
						root.add_child(current_stack, layer_name, location)
						current_stack.push(layer_name)
					}
					return this.skip
				}

				// @import url("foo.css") layer;
				let layer_keyword = csstree.find(prelude, n => n.type === 'Identifier' && n.name.toLowerCase() === 'layer')
				if (layer_keyword) {
					root.add_child([], get_anonymous_id(), location)
					return this.skip
				}
			}
		},
		leave(node) {
			if (is_layer(node)) {
				if (node.prelude !== null && node.prelude.type === 'AtrulePrelude') {
					let layers = csstree.findAll(node.prelude, n => n.type === 'Layer')
					for (let layer of layers) {
						// console.log('leave', layer.name)
						current_stack = []
					}
				} else {
					// pop the anonymous layer
					current_stack.pop()
				}
			} else if (node.name.toLowerCase() === 'import') {
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
	let ast = csstree.parse(css, {
		positions: true,
		parseAtrulePrelude: true,
		parseValue: false,
		parseRulePrelude: false,
		parseCustomProperty: false,
	})

	return layer_tree_from_ast(ast)
}