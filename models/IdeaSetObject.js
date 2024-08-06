/// <reference path="../models/MethodObject.js" />
/// <reference path="../models/AIActionObject.js" />

class IdeaSetObject {
  constructor(spec) {
    this.name = spec.name === undefined ? null : spec.name;
    // binding a select element with vue.js requires a "value" property
    this.value = spec.value === undefined ? null : spec.value;
    this.cta = spec.cta === undefined ? null : spec.cta;
    this.description = spec.description === undefined ? '' : spec.description;
    this.data = spec.data === undefined ? null : spec.data;
    this.method = spec.method === undefined ? Methods[0] : spec.method;
    this.AIActions = spec.AIActions === undefined ? [] : spec.AIActions;
    // this.locked is used to disabled the Method picker in the UI
    this.locked = spec.locked === undefined ? false : spec.locked;
    this.hidden = spec.hidden === undefined ? false : spec.hidden;
  }
}

var IdeaSets = [
  new IdeaSetObject({
    name: 'Feelings Wheel',
    value: 'feelings',
    method: Methods[0],
    cta: 'Focus on what you are feeling!',
    description: 'This feelings wheel is based on the Junto Emotion Wheel.',
    data: ['./data/feelings.json'],
    AIActions: [new AIActionObject({ request: 'Learn about this feeling' })],
    locked: true,
  }),
  new IdeaSetObject({
    name: 'What to eat?',
    value: 'mealtime',
    method: Methods[2],
    cta: 'Focus on exactly what you want to eat!',
    description: 'This exercise will help you figure out all of the parameters you want to consider when selecting a restaurant.',
    data: ['./data/food.json'],
    AIActions: [new AIActionObject({ request: 'Find recipes' }), new AIActionObject({ request: 'Find venues nearby', inputs: ['Zip code'] }), new AIActionObject({ request: 'Find grocery stores nearby', inputs: ['Zip code'] })],
    getAIFeedback: true,
    locked: true,
  }),
  new IdeaSetObject({
    name: 'Lorum picker',
    value: 'lorum',
    method: Methods[1],
    cta: 'Focus on the best random latin text!',
    description: 'This is a test!',
    data: ['./data/test.json'],
  }),
  new IdeaSetObject({
    name: 'LETTERS!',
    value: 'letter',
    method: Methods[0],
    cta: 'Focus on letters!',
    description: 'This is a test!',
    data: ['./data/test2.json'],
  }),
];
