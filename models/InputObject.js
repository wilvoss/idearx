class InputObject {
  constructor(spec) {
    this.label = spec.label === undefined ? '' : spec.label;
    this.placeholder = spec.placeholder === undefined ? '' : spec.placeholder;
    this.type = spec.type === undefined ? 'text' : spec.type;
    this.value = spec.value === undefined ? '' : spec.value;
    this.min = spec.min === undefined ? 0 : spec.min;
    this.max = spec.max === undefined ? 524288 : spec.max;
    this.pattern = spec.pattern === undefined ? '' : spec.pattern;
    this.isRequired = spec.isRequired === undefined ? false : spec.isRequired;
  }
}
