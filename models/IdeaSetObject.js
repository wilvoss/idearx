/// <reference path="../models/MethodObject.js" />

class IdeaSetObject {
  constructor(spec) {
    this.name = spec.name === undefined ? null : spec.name;
    // binding a select element with vue.js requires a "value" property
    this.value = spec.value === undefined ? null : spec.value;
    this.cta = spec.cta === undefined ? null : spec.cta;
    this.description = spec.description === undefined ? '' : spec.description;
    this.data = spec.data === undefined ? null : spec.data;
    this.method = spec.method === undefined ? Methods[0] : spec.method;
    // this.locked is used to disabled the Method picker in the UI
    this.locked = spec.locked === undefined ? false : spec.locked;
  }
}

var IdeaSets = [
  new IdeaSetObject({
    name: 'Feelings Wheel',
    value: 'feelings',
    method: Methods[0],
    cta: 'What are you feeling right now?',
    description: 'This feelings wheel is based on the Junto Emotion Wheel.',
    data: ['./data/feelings.json'],
    locked: true,
  }),
  new IdeaSetObject({
    name: 'Lorum picker',
    value: 'lorum',
    method: Methods[1],
    cta: 'Which latin text is better?',
    description: 'This is a test!',
    data: ['./data/test.json'],
  }),
  new IdeaSetObject({
    name: 'LETTERS!',
    value: 'letter',
    method: Methods[0],
    cta: 'Which letter is better?',
    description: 'This is a test!',
    data: ['./data/test2.json'],
  }),
];
