import * as csstree from 'css-tree'

/**
 * Get the parent Atrule for `childNode`
 * @param {import('css-tree').CssNode} ast The AST to search in
 * @param {import('css-tree').Atrule} childNode The Atrule we want to get the potential parent Atrule for
 */
function get_parent_rule(ast, childNode) {
	let parent
	csstree.walk(ast, {
		visit: 'Atrule',
		enter: function (/** @type {import('css-tree').Atrule} */node) {
			if (node === childNode && this.atrule) {
				parent = this.atrule
				return this.break
			}
		},
	})
	return parent
}

/**
 * @param {import('css-tree').AtrulePrelude | import('css-tree').Raw | null} prelude
 * @returns string
 */
function get_layer_name(prelude) {
	return prelude === null ? '<anonymous>' : csstree.generate(prelude)
}

/**
 *
 * @param {import('css-tree').CssNode} ast
 * @param {import('css-tree').Atrule} atrule
 * @returns {string[]}
 */
function resolve_parent_tree(ast, atrule) {
	let stack = []

	// @ts-expect-error Let me just do a while loop plz
	while ((atrule = get_parent_rule(ast, atrule))) {
		if (atrule.name === 'layer') {
			stack.unshift(get_layer_name(atrule.prelude))
		}
	}

	return stack
}

/**
 * @param {import('css-tree').CssNode} ast
 * @returns {string[][]}
 */
export function get_ast_tree(ast) {
	/** @type {string[][]} */
	let list = []

	csstree.walk(ast, {
		visit: 'Atrule',
		enter: function (/** @type {import('css-tree').Atrule} */ node) {
			if (node.name === 'layer') {
				let layer_name = get_layer_name(node.prelude)

				// @layer first, second;
				if (node.block === null) {
					for (let name of layer_name.split(',')) {
						list.push([...resolve_parent_tree(ast, node), name.trim()])
					}

					return this.skip
				}

				// @layer first { /* content */ }
				list.push([...resolve_parent_tree(ast, node), layer_name])
				return this.skip
			} else if (node.name === 'import' && node.prelude !== null) {
				// @import url("foo.css") layer(test);
				// @ts-expect-error CSSTree types are not updated to v3 yet
				let layer = csstree.find(node.prelude, (pr_node) => pr_node.type === 'Layer')
				if (layer) {
					// @ts-expect-error CSSTree types are not updated to v3 yet
					list.push([layer.name])
					return this.skip
				}

				// @import url("foo.css") layer();
				let layer_fn = csstree.find(
					node.prelude,
					(pr_node) =>
						pr_node.type === 'Function' && pr_node.name.toLowerCase() === 'layer'
				)
				if (layer_fn) {
					list.push(['<anonymous>'])
					return this.skip
				}

				// @import url("foo.css") layer;
				let layer_keyword = csstree.find(
					node.prelude,
					(pre_node) =>
						pre_node.type === 'Identifier' && pre_node.name.toLowerCase() === 'layer'
				)
				if (layer_keyword) {
					list.push(['<anonymous>'])
					return this.skip
				}
			}
			return this.skip
		}
	})

	return list
}

/**
 * @param {string} css
 * @returns {string[][]}
 */
export function get_tree(css) {
	let ast = csstree.parse(css, {
		positions: true,
		parseAtrulePrelude: true,
		parseRulePrelude: false,
		parseValue: false,
		parseCustomProperty: false,
	})
	return get_ast_tree(ast)
}