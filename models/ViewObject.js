class ViewObject {
  constructor(spec) {
    this.name = spec.name === undefined ? '' : spec.name;
    this.value = spec.value === undefined ? '' : spec.value;
    this.description = spec.description === undefined ? '' : spec.description;
  }
}

let Views = [new ViewObject({ name: 'Cards', value: 'cards', description: 'Use cards when nagivate idea selection.' }), new ViewObject({ name: 'Pie', value: 'pie', description: 'Use a pie chart to navigate idea selection.' })];
