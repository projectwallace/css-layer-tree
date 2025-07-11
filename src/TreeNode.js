/** @template T*/
export class TreeNode {
	/** @param {string} name */
	constructor(name, is_anonymous = false) {
		/** @type {string} */
		this.name = name
		/** @type {boolean} */
		this.is_anonymous = is_anonymous
		/** @type {Map<string, TreeNode<T>>} */
		this.children = new Map()
		/** @type {T[]} */
		this.locations = []
	}

	/**
	 * @param {string} name The name of the node
	 * @param {T} location The location of the node
	 * @param {boolean} is_anonymous Whether the node is anonymous
	 * @returns {TreeNode<T>} The node that was added or the existing node if it already existed
	 */
	add_child(name, location, is_anonymous = false) {
		// If the item already exists, add the location to its metadata
		if (this.children.has(name)) {
			let child = this.children.get(name)
			// @ts-expect-error Apparently, TypeScript doesn't know that this is a TreeNode
			child.locations.push(location)
			// @ts-expect-error Apparently, TypeScript doesn't know that this is a TreeNode
			return child
		} else {
			// Otherwise, create the item and add the location
			const new_node = new TreeNode(name, is_anonymous)
			new_node.locations.push(location)
			this.children.set(name, new_node)
			return new_node
		}
	}

	/**
	 * @typedef PlainObject
	 * @property {string} name
	 * @property {boolean} is_anonymous
	 * @property {T[]} locations
	 * @property {PlainObject[]} children
	 */

	/**
	 * Convert the tree to a plain object for easy testing
	 * @returns {PlainObject}
	 */
	to_plain_object() {
		return {
			name: this.name,
			is_anonymous: this.is_anonymous,
			locations: this.locations,
			children: Array
				.from(this.children.values(), (child) => child.to_plain_object())
		}
	}
}