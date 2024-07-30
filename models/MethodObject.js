class MethodObject {
  constructor(spec) {
    this.name = spec.name === undefined ? 'Binary' : spec.name;
    this.value = spec.value === undefined ? 'binary' : spec.value;
    this.description = spec.description === undefined ? 'Description' : spec.description;
  }
}

let Methods = [new MethodObject({ name: 'Full', value: 'full' }), new MethodObject({ name: 'Binary', value: 'binary' })];
