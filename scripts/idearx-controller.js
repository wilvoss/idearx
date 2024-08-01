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
    appDataVersion: '0.0.013',
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
      this.SelectIdeaSet();
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
        log('"' + _idea.name + '"' + ' is now this.currentSelectedIdea');
      }
      this.currentExerciseIsDirty = true;
    },

    async SelectIdeaSet(_set) {
      this.currentIdeaSet = _set === undefined ? this.currentIdeaSet : _set;
      if (this.currentIdeaSet.data !== null) {
        let json = await this.getCurrentIdeasJSON;
        this.currentIdeas = createNestedIdeaObject(json);
        this.currentIdeas.selectedCount = 1;
        this.currentIdeas.isSelected = true;
        this.currentSelectedIdea = this.currentIdeas;
        this.currentMethod = this.currentIdeaSet.method;
        this.currentMethodType = this.currentIdeaSet.method.value;
      }
    },

    RestartExercise() {
      note('RestartExercise() called');
      this.selectedIdeasPath = [];
      this.currentExerciseIsDirty = false;

      this.ResetNodeChildren(this.currentIdeas);
      this.currentSelectedIdea = this.currentIdeas;
    },

    ResetNodeChildren(_node) {
      _node.isSelected = false;
      _node.seen = false;

      if (_node.children && _node.children.length > 0) {
        _node.children.forEach((child) => {
          this.ResetNodeChildren(child);
        });
      }
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
    getRandomIdeasFromCurrentIdeasLevel: function () {
      note('getRandomIdeasFromCurrentIdeasLevel() called');
      if (this.currentIdeas === null) return [];
      let parent = this.currentSelectedIdea.parent === null ? this.currentSelectedIdea : this.currentSelectedIdea.parent;
      let children = parent.children;

      if (children.filter((obj) => !obj.seen && !obj.isSelected).length === 0) {
        children = this.currentSelectedIdea.children;
      }
      const selectedChild = children.filter((obj) => obj.isSelected).length === 1 ? children.filter((obj) => obj.isSelected)[0] : null;

      const filteredObjects = children.filter((obj) => !obj.seen && !obj.isSelected);
      if (this.currentMethod.value === 'binary') {
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

          return finalArray;
        }
      } else if (this.currentMethod.value !== 'binary') {
        filteredObjects.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
        return filteredObjects;
      }
    },
  },
});
