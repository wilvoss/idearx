class AIActionObject {
  constructor(spec) {
    this.request = spec.request === undefined ? '' : spec.request;
    this.url = spec.url === undefined ? '' : spec.url;
    this.inputs = spec.inputs === undefined ? [] : spec.inputs;
  }
}
