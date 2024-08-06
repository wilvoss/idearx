class AIActionObject {
  constructor(spec) {
    this.request = spec.request === undefined ? '' : spec.request;
    this.inputs = spec.inputs === undefined ? [] : spec.inputs;
  }
}
