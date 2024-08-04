/// <reference path="../models/IdeaObject.js" />
/// <reference path="../models/IdeaSetObject.js" />
/// <reference path="../models/MethodObject.js" />

Vue.config.devtools = false;
Vue.config.debug = false;
Vue.config.silent = true;

Vue.config.ignoredElements = ['app'];

var app = new Vue({
  el: '#app',
  data: {
    // app data
    appDataVersion: '0.0.016',
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
    allSelectedIdeas: [],
    allDeSelectedIdeas: [],

    visualStateShowNofication: false,
    visualStateShowModal: false,
  },

  methods: {
    async IntializeApp() {
      note('InitializeApp() called');
    },

    // data manipulation
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

    SelectIdea(_idea, _clean = true) {
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
      this.allSelectedIdeas.push(_idea);

      if (_clean) {
        this.CleanDeselectedArrayBasedOnAncestry(_idea);
      }

      this.currentExerciseIsDirty = true;
      this.MoveFocus();
    },

    MoveFocus() {
      note('MoveFocus() called');
      this.$nextTick(() => {
        if (this.getLastSelectedIdea === undefined || this.getLastSelectedIdea.children.length > 0 || this.selectedIdeasPath.length === 0) {
          document.getElementsByTagName('idea')[0].focus();
        } else {
          document.getElementById('button-restart').focus();
        }
      });
    },

    UndoLastIdea() {
      note('UndoLastIdea() called');
      // these is totally unscalable - i have no idea how to do this kind of thing well
      if (this.allSelectedIdeas.length > 0) {
        note('UndoLastIdea() called');
        let idea = this.allSelectedIdeas.pop();
        this.allDeSelectedIdeas.push(idea);
        if (idea) {
          if (this.getLastSelectedIdea === idea) {
            this.selectedIdeasPath.pop();
            if (idea.parent !== undefined) {
              if (idea.parent === this.currentIdeas) {
                this.RestartExercise();
              } else {
                this.currentSelectedIdea = idea.parent;
                idea.parent.children.forEach((child) => {
                  this.ResetIdea(child, true);
                });
              }
            } else {
              this.RestartExercise(idea);
            }
          } else {
            this.ResetIdea(idea, true);
          }
        }
      }
    },

    RedoLastIdea() {
      note('RedoLastIdea() called');
      // these is totally unscalable - i have no idea how to do this kind of thing well
      if (this.allDeSelectedIdeas.length > 0) {
        note('RedoLastIdea() called');
        let idea = this.allDeSelectedIdeas.pop();
        if (idea) {
          this.SelectIdea(idea, false);
          this.MoveFocus();
        }
      }
    },

    // state management
    RestartExercise() {
      note('RestartExercise() called');
      this.selectedIdeasPath = [];
      this.allSelectedIdeas = [];
      this.currentExerciseIsDirty = false;
      this.currentSelectedIdea = this.currentIdeas;
      this.currentMethodType = this.currentMethod.value;
      this.ResetIdea(this.currentIdeas);
      this.currentIdeas.isSelected = true;
      this.currentIdeas.seen = true;
      this.MoveFocus();
    },

    // utilities
    GetSelectedIdeas(_ideaObject) {
      note('GetSelectedIdeas("' + _ideaObject.name + '") called');
      if (!_ideaObject.isSelected) {
        return null;
      }

      const filteredChildren = _ideaObject.children.map(this.GetSelectedIdeas).filter((child) => child !== null);

      return {
        ..._ideaObject,
        children: filteredChildren,
      };
    },

    CleanDeselectedArrayBasedOnAncestry(_idea) {
      let ancestors = new Set();
      let current = _idea;
      while (current) {
        ancestors.add(current);
        current = current.parent;
      }

      this.allDeSelectedIdeas = this.allDeSelectedIdeas.filter((obj) => {
        ancestors.has(obj) && obj !== this.currentIdeas;
      });
    },

    ResetIdea(_idea, _log = false) {
      if (_log) {
        highlight('Undoing "' + _idea.name + '"');
      }
      _idea.isSelected = false;
      _idea.seen = false;
      _idea.showing = false;

      if (_idea.children && _idea.children.length > 0) {
        _idea.children.forEach((child) => {
          this.ResetIdea(child);
        });
      }
    },

    // event handlers
    HandleKeyDown(event) {
      note('HandleKeyDown() called');
      console.log(event);
      switch (event.key) {
        case 'z':
        case 'Z':
          if (this.currentMethod.allowUndo && event.metaKey) {
            if (!event.shiftKey) {
              this.UndoLastIdea();
            } else {
              this.RedoLastIdea();
            }
          }
          break;
        default:
          break;
      }
    },
  },

  mounted() {
    announce('App Initialized');
    this.IntializeApp();
    window.addEventListener('keydown', this.HandleKeyDown);
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
    getLastSelectedIdea: function () {
      return this.selectedIdeasPath[this.selectedIdeasPath.length - 1];
    },
    getAllSelectedIdeasRecursively: function () {
      note('getAllSelectedIdeasRecursively() called');
      return this.GetSelectedIdeas(this.currentIdeas);
    },
  },
});
