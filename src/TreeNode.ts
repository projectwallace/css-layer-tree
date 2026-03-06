export type Location = {
	line: number
	column: number
	start: number
	end: number
}

export type TreeNode = {
	name: string
	is_anonymous: boolean
	locations: Location[]
	children: TreeNode[]
}

export class LayerTreeNode {
	name: string
	is_anonymous: boolean
	children: Map<string, LayerTreeNode>
	locations: Location[]

	constructor(name: string) {
		this.name = name
		this.is_anonymous = false
		this.children = new Map()
		this.locations = []
	}

	add_child(path: string[], name: string, location: Location | undefined): void {
		let current: LayerTreeNode = this

		// Traverse path to find the correct location
		path.forEach((segment) => {
			current = current.children.get(segment)!
		})

		// If the item already exists, add the location to its metadata
		if (current.children.has(name)) {
			if (location !== undefined) {
				current.children.get(name)!.locations.push(location)
			}
		} else {
			// Otherwise, create the item and add the location
			const new_node = new LayerTreeNode(name)
			if (location !== undefined) {
				new_node.locations.push(location)
			}
			new_node.is_anonymous = name.startsWith('__anonymous')
			current.children.set(name, new_node)
		}
	}

	// Convert the tree to a plain object for easy testing
	to_plain_object(): TreeNode {
		return {
			name: this.name,
			is_anonymous: this.is_anonymous,
			locations: this.locations,
			children: Array.from(this.children.values(), (child) => child.to_plain_object()),
		}
	}
}
