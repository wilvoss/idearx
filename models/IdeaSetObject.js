class IdeaSetObject {
  constructor(spec) {
    this.name = spec.name === undefined ? 'Name' : spec.name;
    this.description = spec.description === undefined ? '' : spec.description;
    this.data = spec.data === undefined ? './data/feelings.json' : spec.data;
  }
}
