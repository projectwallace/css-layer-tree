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

/** @param {import('css-tree').Atrule} node */
function is_named_layer_atrule(node) {
	return node.type === 'Atrule' && node.name.toLowerCase() === 'layer' && node.prelude !== null
}

/** @param {import('css-tree').Atrule} node */
function is_anonymous_layer_atrule(node) {
	return node.type === 'Atrule' && node.name.toLowerCase() === 'layer' && node.prelude === null
}

/** @param {import('css-tree').Atrule} node */
function is_import_atrule(node) {
	if (node.type !== 'Atrule') return false
	if (node.name.toLowerCase() !== 'import') return false
	if (node.prelude === null) return false
	if (node.prelude.type === 'Raw') return false
	if (node.prelude.children === undefined) return false
	return true
}

/**
 * @param {import('css-tree').CssNode} ast
 */
export function layer_tree_from_ast(ast) {
	/** @type {TreeNode<Location>} */
	let root = new TreeNode('root')
	let anonymous_layer_count = 0
	let current_root = root
	let start_node = root

	csstree.walk(ast, {
		enter: (/** @type {import('css-tree').CssNode} */ node) => {
			if (is_named_layer_atrule(node)) {
				start_node = current_root

				// @layer test;
				// @layer test.nested;
				// @layer first, second;
				// @layer core.reset, core.tokens;
				if (node.block === null) {
					let layer_names = csstree.findAll(node.prelude, n => n.type === 'Layer')
					for (let layer_name of layer_names) {
						current_root = start_node
						for (let name of layer_name.name.split('.').map(s => s.trim())) {
							current_root = current_root.add_child(name, get_location(node))
						}
					}
				}

				// @layer test { ... }
				// @layer test.nested { ... }
				else {
					let layer = csstree.find(node.prelude, n => n.type === 'Layer')
					if (layer?.name !== undefined) {
						current_root = start_node
						for (let name of layer.name.split('.').map(s => s.trim())) {
							console.log({ name, current_root: current_root.name })
							current_root = current_root.add_child(name, get_location(node))
						}
					}
				}

				return
			}

			else if (is_anonymous_layer_atrule(node)) {
				let location = get_location(node)
				start_node = current_root
				current_root = current_root.add_child(`__anonymous-${++anonymous_layer_count}__`, location, true)
				return
			}

			else if (is_import_atrule(node)) {
				let location = get_location(node)
				let prelude = node.prelude

				// @import url("foo.css") layer(test);
				// OR
				// @import url("foo.css") layer(test.nested);
				// @ts-expect-error CSSTree types are not updated to v3 yet
				let layer = csstree.find(prelude, n => n.type === 'Layer')
				let current_root = root
				if (layer) {
					// @ts-expect-error CSSTree types are not updated to v3 yet
					for (let layer_name of layer.name?.split('.').map((s) => s.trim())) {
						current_root = current_root.add_child(layer_name, location)
					}
					return
				}

				// @import url("foo.css") layer;
				let layer_keyword = csstree.find(prelude, n => n.type === 'Identifier' && n.name.toLowerCase() === 'layer')
				if (layer_keyword) {
					current_root = current_root.add_child(`__anonymous-${++anonymous_layer_count}__`, location, true)
					return
				}
			}
		},
		leave: (node) => {
			if (is_named_layer_atrule(node)) {
				current_root = start_node
			} else if (is_anonymous_layer_atrule(node)) {
				current_root = start_node
			}
		}
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