/** @template T*/
export class TreeNode {
	/** @param {string} name */
	constructor(name) {
		/** @type {string} */
		this.name = name
		/** @type {boolean} */
		this.is_anonymous = false
		/** @type {Map<string, TreeNode<T>>} */
		this.children = new Map()
		/** @type {T[]} */
		this.locations = []
	}

	/**
	 * @param {string[]} path
	 * @param {string} name
	 * @param {T} location
	 */
	add_child(path, name, location) {
		let current = this

		// Traverse path to find the correct location
		path.forEach((segment) => {
			// @ts-expect-error Apparently, TypeScript doesn't know that current is a TreeNode
			current = current.children.get(segment)
		})

		// If the item already exists, add the location to its metadata
		if (current.children.has(name)) {
			if (location !== undefined) {
				// @ts-expect-error Apparently, TypeScript doesn't know that current is a TreeNode
				current.children.get(name).locations.push(location)
			}
		} else {
			// Otherwise, create the item and add the location
			const new_node = new TreeNode(name)
			if (location !== undefined) {
				new_node.locations.push(location)
			}
			new_node.is_anonymous = name.startsWith('__anonymous')
			current.children.set(name, new_node)
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
			children: Array.from(this.children.values(), (child) => child.to_plain_object()),
		}
	}
}
