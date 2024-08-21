/// <reference path="../models/MethodObject.js" />
/// <reference path="../models/InputObject.js" />
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
    name: '🎭 Feelings',
    value: 'feelings',
    method: Methods[0],
    cta: 'What are you feeling?',
    description: 'Focus on what you are feeling: Based on the Junto Emotion Wheel.',
    data: ['./data/feelings.json'],
    AIActions: [new AIActionObject({ request: 'Learn About this Feeling' }), new AIActionObject({ request: 'Junto Emotion Wheel', url: 'https://www.thejuntoinstitute.com/emotion-wheels/' })],
    locked: true,
  }),
  new IdeaSetObject({
    name: '🥣 Eating',
    value: 'food',
    method: Methods[2],
    cta: 'Define your options!',
    description: 'Focus on your next meal: This exercise will help you figure out all of the parameters you want to consider when thinking about a meal.',
    data: ['./data/food.json'],
    AIActions: [
      new AIActionObject({ request: 'Find Recipes' }),
      new AIActionObject({
        request: 'Find Places to Eat',
        type: 'map',
        inputs: [new InputObject({ label: 'City', pattern: "^[\\p{L}\\p{N}\\s'-]+$", placeholder: 'City' }), new InputObject({ label: 'Zip code', pattern: "^[\\p{N}\\s'-]+$", placeholder: 'Zip code', max: 10 })],
      }),
      new AIActionObject({
        request: 'Find Grocers',
        type: 'map',
        inputs: [new InputObject({ label: 'City', pattern: "^[\\p{L}\\p{N}\\s'-]+$", placeholder: 'City' }), new InputObject({ label: 'Zip code', pattern: "^[\\p{N}\\s'-]+$", placeholder: 'Zip code', max: 10 })],
      }),
    ],
    // locked: true,
  }),
  new IdeaSetObject({
    name: '🔠 LETTERS!',
    value: 'letter',
    method: Methods[1],
    cta: 'Which is best?',
    description: 'Focus on letters!',
    data: ['./data/test2.json'],
  }),
];
