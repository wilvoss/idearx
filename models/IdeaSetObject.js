/// <reference path="../models/MethodObject.js" />

class IdeaSetObject {
  constructor(spec) {
    this.name = spec.name === undefined ? null : spec.name;
    this.value = spec.value === undefined ? null : spec.value;
    this.cta = spec.cta === undefined ? null : spec.cta;
    this.description = spec.description === undefined ? '' : spec.description;
    this.data = spec.data === undefined ? null : spec.data;
    this.method = spec.method === undefined ? Methods[0] : spec.method;
  }
}

var IdeaSets = [
  new IdeaSetObject({
    name: 'Feelings Wheel Exercise',
    value: 'feelings',
    method: Methods[0],
    cta: 'What are you feeling right now?',
    description: 'This exercise will help you clarify feelings!',
    data: ['./data/feelings.json'],
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
