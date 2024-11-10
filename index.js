import * as csstree from 'css-tree'

export function resolve_ast(ast) {

}

/**
 *
 * @param {string} css
 * @returns
 */
export function resolve(css) {
	let ast = csstree.parse(css, {
		positions: true,
		parseAtrulePrelude: true,
		parseRulePrelude: false,
		parseValue: false,
		parseCustomProperty: false,
	});
	return resolve_ast(ast);
}