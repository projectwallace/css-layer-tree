import { type CssNode } from "css-tree";

export type Location = {
	line: number;
	column: number;
	start: number;
	end: number;
}

export type TreeNode = {
	name: string;
	children: TreeNode[];
	locations: Location[];
}

export function get_tree_from_ast(ast: CssNode): TreeNode['children'];
export function get_tree(css: string): TreeNode['children'];
