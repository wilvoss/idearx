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
    appDataVersion: '0.0.018',
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
    ideasQueueForUndo: [], // array of all ideas that were "selected" by the user
    ideasQueueForRedo: [], // array of all ideas that were "deselected" by the user with the "Undo" feature

    visualStateShowNofication: false,
    visualStateShowModal: false,
    visualStateLastEvent: null,
  },

  methods: {
    // === DATA MANIPULATION ===

    /**
     * Reads the data source (usually .json, but can be .csv or .js in the future)
     * Generates the entire IdeaObject tree that is used for all data manipulation
     * "Restarts" the exercise by clearing out any stale data
     * @param {IdeaSetObject} _set
     */
    async SelectIdeaSet(_set) {
      note('SelectIdeaSet() called');
      this.currentIdeaSet = _set === undefined ? this.currentIdeaSet : _set;
      if (this.currentIdeaSet.data !== null) {
        let json = await this.GetCurrentIdeasJSON();
        this.currentIdeas = createNestedIdeaObject(json);
        this.currentMethod = this.currentIdeaSet.method;
        this.RestartExercise();
      }
    },

    /**
     * Updates the passed _idea object to be selected
     * Sets any visible sibling "seen" variable to true and
     *   "isSelected" to false, this is janky but it informs
     *   the computed property "getIdeasFromCurrentLevelBasedOnMethod"
     *   which updates the view with a viable set of Ideas
     * Updates the undo array with appropriately
     * Updates ("Cleans") the redo array when _clean === true
     * @param {IdeaObject} _idea
     * @param {Boolean} _clean "true" by default
     */
    SelectIdea(_idea, _clean = true) {
      note('SelectIdea(_idea) called');
      let count = 0; // used to determine if the _idea is the last unseen object amongst its siblings
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

      this.ideasQueueForUndo.push(_idea);

      if (_clean) {
        this.CleanDeselectedArrayBasedOnAncestry(_idea);
      }

      this.currentExerciseIsDirty = true;
      this.MoveFocus();
    },

    /**
     * Moves keyboard focus based on use interaction and DOM update
     * This helps keyboard navigation when a new set of ideas is displayed to the user.
     *    Without it, the focus would be "lost"
     *    With it the focus is placed on either the first idea element or the restart button based on context
     */
    MoveFocus() {
      note('MoveFocus() called');
      if (this.visualStateLastEvent === 'keydown') {
        this.$nextTick(() => {
          if (this.getLastSelectedIdea === undefined || this.getLastSelectedIdea.children.length > 0 || this.selectedIdeasPath.length === 0) {
            document.getElementsByTagName('idea')[0].focus();
          } else {
            document.getElementById('button-restart').focus();
          }
        });
      }
    },

    /**
     * Moves an IdeaObject from the ideasQueueForUndo array to the ideasQueueForRedo array
     * Adjusts all affected ancestors, siblings and descendents
     * This is horribly implemented, won't scale, and needs a better brain than mine
     */
    UndoLastIdea() {
      note('UndoLastIdea() called');
      if (this.ideasQueueForUndo.length > 0) {
        note('UndoLastIdea() called');
        let idea = this.ideasQueueForUndo.pop();
        this.ideasQueueForRedo.push(idea);
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
                  this.MoveFocus();
                });
              }
            } else {
              this.RestartExercise(idea);
            }
          } else {
            this.ResetIdea(idea, true);
            this.MoveFocus();
          }
        }
      }
    },

    /**
     * Removes the last IdeaObject from the ideasQueueForRedo and then selects it via the "SelectIdea" method
     * This is horribly implemented, doesn't scale, and needs a better brain than mine
     */
    RedoLastIdea() {
      note('RedoLastIdea() called');
      if (this.ideasQueueForRedo.length > 0) {
        note('RedoLastIdea() called');
        let idea = this.ideasQueueForRedo.pop();
        if (idea) {
          this.SelectIdea(idea, false);
        } else {
          this.MoveFocus();
        }
      }
    },

    /**
     * Fetches, then concatenates all .json data sources for the current IdeaSetObject into a single json object
     * @returns a single json object
     */
    async GetCurrentIdeasJSON() {
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

    // === STATE MANAGEMENT ===

    /**
     * Updates all current IdeaObject data as if the user had
     *    just selected a new IdeaSetObject ("Pick a focus" in UI)
     *    without changing any settings overrides like the current MethodObject
     *    and without clearing out the ideasQueueForRedo array
     */
    RestartExercise() {
      note('RestartExercise() called');
      this.selectedIdeasPath = [];
      this.ideasQueueForUndo = [];
      this.currentExerciseIsDirty = false;
      this.currentSelectedIdea = this.currentIdeas;
      this.currentMethodType = this.currentMethod.value;
      this.ResetIdea(this.currentIdeas);
      this.currentIdeas.isSelected = true;
      this.currentIdeas.seen = true;
      this.MoveFocus();
    },

    // === UTILITIES ===

    /**
     * Stubbed in (isn't actually used atm)
     * Finds all selected descendents of the current top level IdeaObject
     * This is voodoo magic and chatgpt wrote it for me
     * @param {IdeaObject} _ideaObject
     * @returns an array of IdeaObjects (i think)
     */
    GetSelectedIdeasGetSelectedIdeasRecursively(_ideaObject) {
      note('GetSelectedIdeas("' + _ideaObject.name + '") called');
      if (!_ideaObject.isSelected) {
        return null;
      }

      const filteredChildren = _ideaObject.children.map(this.GetSelectedIdeasRecursively).filter((child) => child !== null);

      return {
        ..._ideaObject,
        children: filteredChildren,
      };
    },

    /**
     * Updates the ideasQueueForRedo array by removing any IdeaObjects that aren't ancestors
     * This is voodoo magic and chatgpt wrote it for me
     * @param {IdeaObject} _idea
     */
    CleanDeselectedArrayBasedOnAncestry(_idea) {
      let ancestors = new Set();
      let current = _idea;
      while (current) {
        ancestors.add(current);
        current = current.parent;
      }

      this.ideasQueueForRedo = this.ideasQueueForRedo.filter((obj) => {
        ancestors.has(obj) && obj !== this.currentIdeas;
      });
    },

    /**
     * Sets the passed IdeaObject and all of its descendents to their original constructed state
     * @param {IdeaObject} _idea
     * @param {Boolean} _log "False" by default - used for debugging
     */
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

    // === EVENT HANDLERS ===

    /**
     * Used to manage keyboard input from the user
     * Used to establish current type of user input
     * @param {Object} event
     */
    HandleKeyDown(event) {
      note('HandleKeyDown() called');
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
      this.visualStateLastEvent = 'keydown';
    },

    /**
     * Used to establish current type of user input
     */
    HandleMouseUp() {
      note('HandleMouseUp() called');
      this.visualStateLastEvent = 'mouseup';
    },
  },

  mounted() {
    announce('App Initialized');
    window.addEventListener('keydown', this.HandleKeyDown);
    window.addEventListener('mouseup', this.HandleMouseUp);
  },

  computed: {
    /**
     * Finds the appropriate set of sibling IdeaObjects that can be presented to the user for their interaction
     * @returns an array of IdeaObjects
     */
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
    /**
     * Gets the final "selected" Idea of a set of IdeaObject siblings
     * Computed here because it's used in both this controller and in
     *    the front-end html
     * @returns a single IdeaObject
     */
    getLastSelectedIdea: function () {
      return this.selectedIdeasPath[this.selectedIdeasPath.length - 1];
    },
    /**
     * Stubbed in (isn't actually used atm)
     * Used to display the results of "GetSelectedIdeas" in the front-end html
     * @returns an array of IdeaObjects (i think)
     */
    getAllSelectedIdeasRecursively: function () {
      note('getAllSelectedIdeasRecursively() called');
      return this.GetSelectedIdeas(this.currentIdeas);
    },
  },
});
