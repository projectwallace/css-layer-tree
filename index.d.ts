import { type CssNode } from "css-tree";

export type Location = {
	line: number;
	column: number;
	start: number;
	end: number;
}

export type TreeNode = {
	name: string;
	is_anonymous: boolean;
	children: TreeNode[];
	locations: Location[];
}

export function layer_tree_from_ast(ast: CssNode): TreeNode[];
export function layer_tree(css: string): TreeNode[];
