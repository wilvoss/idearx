class IdeaObject {
  constructor(spec) {
    this.name = spec.name === undefined ? 'Idea' : spec.name;
    this.type = spec.type === undefined ? 'binary' : spec.type;
    this.description = spec.description === undefined ? 'Description' : spec.description;
    this.seen = spec.seen === undefined ? false : spec.seen;
    this.showing = spec.showing === undefined ? false : spec.showing;
    this.isSelected = spec.isSelected === undefined ? false : spec.isSelected;
    this.children = spec.children === undefined ? [] : spec.children;
    this.parent = spec.parent === undefined ? null : spec.parent;
  }
}

function createNestedIdeaObject(_node, _parent = null) {
  const ideaObject = new IdeaObject({
    name: _node.n,
    parent: _parent,
  });
  ideaObject.children = _node.c === undefined ? [] : _node.c.map((child) => createNestedIdeaObject(child, ideaObject));
  return ideaObject;
}
