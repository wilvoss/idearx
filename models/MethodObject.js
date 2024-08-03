class MethodObject {
  constructor(spec) {
    this.name = spec.name === undefined ? 'Binary' : spec.name;
    this.value = spec.value === undefined ? 'binary' : spec.value;
    this.description = spec.description === undefined ? 'Description' : spec.description;
  }
}

let Methods = [
  new MethodObject({
    name: 'Tree Crawl',
    value: 'full',
    description: 'Drill down a tree till you reach the best leaf.',
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
