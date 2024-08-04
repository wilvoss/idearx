// this class defines the types of picking methodology that can be applied to any given data set
// some IdeaSetObjects will define a default methodology
class MethodObject {
  constructor(spec) {
    this.name = spec.name === undefined ? 'Binary' : spec.name;
    // binding a select element with vue.js requires a "value" property
    this.value = spec.value === undefined ? 'binary' : spec.value;
    this.description = spec.description === undefined ? 'Description' : spec.description;
    // this.allowUndo is only here because undo/redo is complicated and I have to do it one method at a time o.O
    this.allowUndo = spec.allowUndo === undefined ? false : spec.allowUndo;
  }
}

let Methods = [
  new MethodObject({
    name: 'Tree Crawl',
    value: 'full',
    description: 'Drill down a tree till you reach the best leaf.',
    allowUndo: true,
  }),
  new MethodObject({
    name: 'Binary Crawl',
    value: 'binary',
    description: 'Just like the eye doctor, "is this better, or this", and repeat until you land on the best focus.',
  }),
  new MethodObject({
    name: 'Merge Crawl',
    value: 'merge',
    description: 'Merge the best ideas within different categories, recursively.',
  }),
];
