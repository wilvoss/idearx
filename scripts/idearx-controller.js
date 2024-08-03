/// <reference path="../models/IdeaObject.js" />
/// <reference path="../models/IdeaSetObject.js" />
/// <reference path="../models/MethodObject.js" />

// if (!UseDebug) {
Vue.config.devtools = false;
Vue.config.debug = false;
Vue.config.silent = true;
// }

Vue.config.ignoredElements = ['app'];

var app = new Vue({
  el: '#app',
  data: {
    // app data
    appDataVersion: '0.0.015',
    newVersionAvailable: false,

    // idea data
    currentIdeaSet: new IdeaSetObject({}),
    currentIdeas: null,
    currentSelectedIdea: null,
    allMethods: Methods,
    allIdeaSets: IdeaSets,
    currentMethod: new MethodObject({}),
    currentMethodType: '',
    currentExerciseIsDirty: false,
    selectedIdeasPath: [],

    visualStateShowNofication: false,
    visualStateShowModal: false,

    // DOM reference
    documentCssRoot: document.querySelector(':root'),
  },

  methods: {
    async IntializeApp() {
      note('InitializeApp() called');
    },

    SelectIdea(_idea) {
      note('SelectIdea(_idea) called');
      let count = 0;
      if (_idea.parent.children && _idea.parent.children.length > 0) {
        count = _idea.parent.children.length;
        Array.from(_idea.parent.children).forEach((child) => {
          child.isSelected = false;
          if (child.showing || this.currentMethod.value !== 'binary') {
            child.seen = true;
          }
          if (child.seen) {
            count = count - 1;
          }
        });
      }
      _idea.isSelected = true;
      if (count === 0 || this.currentMethod.value !== 'binary') {
        this.currentSelectedIdea = _idea;
        this.selectedIdeasPath.push(_idea);
      }
      this.currentExerciseIsDirty = true;
    },

    async SelectIdeaSet(_set) {
      note('SelectIdeaSet() called');
      this.currentIdeaSet = _set === undefined ? this.currentIdeaSet : _set;
      if (this.currentIdeaSet.data !== null) {
        let json = await this.getCurrentIdeasJSON;
        this.currentIdeas = createNestedIdeaObject(json);
        this.currentMethod = this.currentIdeaSet.method;
        this.RestartExercise();
      }
    },

    RestartExercise() {
      note('RestartExercise() called');
      this.selectedIdeasPath = [];
      this.currentExerciseIsDirty = false;
      this.currentSelectedIdea = this.currentIdeas;
      this.currentMethodType = this.currentMethod.value;
      this.ResetNode(this.currentIdeas);
      this.currentIdeas.isSelected = true;
      this.currentIdeas.seen = true;

      highlight('selectedIdeasPath = ' + this.selectedIdeasPath);
      highlight('currentExerciseIsDirty = ' + this.currentExerciseIsDirty);
      highlight('currentSelectedIdea = ' + this.currentSelectedIdea.name);
      highlight('currentMethodType = ' + this.currentMethodType);
      highlight('currentIdeas.isSelected = ' + this.currentIdeas.isSelected);
    },

    ResetNode(_node) {
      _node.isSelected = false;
      _node.seen = false;
      _node.showing = false;

      if (_node.children && _node.children.length > 0) {
        _node.children.forEach((child) => {
          this.ResetNode(child);
        });
      }
    },

    GetSelectedIdeas(_ideaObject) {
      note('ResetNode("' + _ideaObject.name + '") called');
      if (!_ideaObject.isSelected) {
        return null;
      }

      const filteredChildren = _ideaObject.children.map(this.GetSelectedIdeas).filter((child) => child !== null);

      return {
        ..._ideaObject,
        children: filteredChildren,
      };
    },
  },

  mounted() {
    announce('App Initialized');
    this.IntializeApp();
  },

  computed: {
    getCurrentIdeasJSON: async function () {
      note('getCurrentIdeasJSON() called');
      let idea = [];
      let fetchPromises = this.currentIdeaSet.data.map((url) => fetch(url).then((response) => response.json()));

      try {
        let dataArrays = await Promise.all(fetchPromises);
        idea = [].concat(...dataArrays);
      } catch (error) {
        error(error);
      }
      return idea[0];
    },
    getIdeasFromCurrentLevelBasedOnMethod: function () {
      note('getRandomIdeasFromCurrentIdeasLevel() called');
      if (this.currentIdeas === null) return [];
      let parent = this.currentSelectedIdea.parent === null ? this.currentSelectedIdea : this.currentSelectedIdea.parent;
      let children = parent.children;

      if (children.filter((obj) => !obj.seen && !obj.isSelected).length === 0) {
        children = this.currentSelectedIdea.children;
      }
      const selectedChild = children.filter((obj) => obj.isSelected).length === 1 ? children.filter((obj) => obj.isSelected)[0] : null;
      let filteredObjects = [];

      switch (this.currentMethod.value) {
        case 'binary':
          filteredObjects = children.filter((obj) => !obj.seen && !obj.isSelected);
          for (let i = filteredObjects.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filteredObjects[i], filteredObjects[j]] = [filteredObjects[j], filteredObjects[i]];
          }
          if (selectedChild === null) {
            let ideas = filteredObjects.slice(0, 2);
            ideas.forEach((idea) => {
              idea.showing = true;
            });
            return ideas;
          } else {
            const randomObject = filteredObjects.slice(0, 1);
            randomObject[0].showing = true;
            const finalArray = [randomObject[0], selectedChild];
            finalArray.sort(() => Math.random() - 0.5);

            filteredObjects = finalArray;
          }
          break;

        case 'full':
          filteredObjects = children.filter((obj) => !obj.seen && !obj.isSelected);
          filteredObjects.sort((a, b) => {
            if (a.name < b.name) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            }
            return 0;
          });
          break;

        case 'merge':

        default:
          break;
      }

      return filteredObjects;
    },
    getAllSelectedIdeasRecursively: function () {
      note('getAllSelectedIdeasRecursively() called');
      return this.GetSelectedIdeas(this.currentIdeas);
    },
  },
});
