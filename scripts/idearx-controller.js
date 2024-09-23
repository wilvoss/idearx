/// <reference path="../models/AIActionObject.js" />
/// <reference path="../models/IdeaObject.js" />
/// <reference path="../models/IdeaSetObject.js" />
/// <reference path="../models/MethodObject.js" />
/// <reference path="../models/ViewObject.js" />

Vue.config.devtools = false;
Vue.config.debug = false;
Vue.config.silent = true;

Vue.config.ignoredElements = ['app'];

var app = new Vue({
  el: '#app',
  data: {
    appVersion: '0.0.045',

    //#region —————— APP DATA ——————
    allMethods: Methods,
    allIdeaSets: IdeaSets,
    allViews: Views,
    //#endregion

    //#region —————— IDEA DATA ——————
    currentIdeaSet: new IdeaSetObject({}),
    currentIdeas: null,
    currentSelectedIdea: null,
    currentSelectedAIAction: new AIActionObject({}),
    currentIdeaQueryString: '',
    currentAIQueryString: '',
    currentMethod: new MethodObject({}),
    currentView: Views[0],
    currentMethodType: '',
    currentExerciseIsDirty: false,
    selectedIdeasPath: [],
    ideasLIFOForUndo: [], // array of all ideas that were "selected" by the user
    ideasLIFOForRedo: [], // array of all ideas that were "deselected" by the user with the "Undo" feature
    //#endregion

    //#region —————— VISUAL STATE MANAGEMENT ——————
    visualStateLastInputEvent: null,
    visualStateShowModal: false,
    //#endregion
  },

  methods: {
    //#region —————— DATA MANIPULATION ——————
    /**
     * Selects the current idea set and updates the relevant properties.
     * @param {IdeaSetObject} _set - The idea set to be selected. If undefined, the current idea set remains unchanged.
     */
    async SelectIdeaSet(event, _set) {
      note('async SelectIdeaSet() called');

      // Update the current idea set if a new set is provided
      this.currentIdeaSet = _set === undefined ? this.currentIdeaSet : _set;

      // Check if the current idea set has data
      if (this.currentIdeaSet.data !== null) {
        // Fetch the current ideas in JSON format
        let json = Array.isArray(this.currentIdeaSet.data) ? await this.GetCurrentIdeasJSON() : this.currentIdeaSet.data;

        // Convert the JSON data into a nested idea object
        this.currentIdeas = createNestedIdeaObject(json);

        // Update the current method based on the selected idea set
        this.currentMethod = this.currentIdeaSet.method;

        // Soft restart the exercise to apply the new idea set
        this.SoftRestartExercise();
      }
    },

    /**
     * Selects an idea and updates the selection state based on the current method.
     * @param {IdeaObject} _idea - The idea object to be selected.
     */
    SelectIdea(_idea) {
      note('SelectIdea() called');

      // Check if the current method is 'binary'
      if (this.currentMethod.value === 'binary') {
        let count = 0;
        // If the idea has children, count them and update their selection state
        if (_idea.parent.children && _idea.parent.children.length > 0) {
          count = _idea.parent.children.length;
          Array.from(_idea.parent.children).forEach((child) => {
            child.isSelected = false;
            child.seen = child.showing;
            // Decrease count if the child is seen
            if (child.seen) {
              count = count - 1;
            }
          });
        }
        // Select the idea and reset its lowest selected descendant
        _idea.isSelected = true;
        _idea.lowestSelectedDescendent = '';

        // If no children are seen, update the current selected idea and path
        if (count === 0) {
          this.currentSelectedIdea = _idea;
          this.selectedIdeasPath.push(_idea);
        }
      } else {
        // For non-binary methods, simply select the idea and update the current selected idea and path
        _idea.isSelected = true;
        this.currentSelectedIdea = _idea;
        this.selectedIdeasPath.push(_idea);
      }

      // Add the idea to the undo queue and mark the exercise as dirty
      this.ideasLIFOForUndo.push(_idea);
      this.currentExerciseIsDirty = true;
      // Move focus to the appropriate element
      this.MoveFocus();
    },

    /**
     * Moves focus to the appropriate element based on the last input event and the state of selected ideas.
     */
    MoveFocus() {
      note('MoveFocus() called');

      // Check if the last input event was a keydown event
      if (this.visualStateLastInputEvent === 'keydown') {
        // Use Vue's nextTick to ensure DOM updates are complete before proceeding
        this.$nextTick(() => {
          // If there is no last selected idea, or it has children, or no ideas are selected
          if (this.getLastSelectedIdea === undefined || this.getLastSelectedIdea.children.length > 0 || this.selectedIdeasPath.length === 0) {
            // Focus on the first 'idea' element in the document
            document.getElementById('idpicker').firstChild.focus();
          } else if (this.showAIActions) {
            document.getElementById('aiactions').firstChild.focus();
          } else {
            // Otherwise, focus on the 'button-restart' element
            document.getElementById('button-restart').focus();
          }
        });
      }
    },

    /**
     * Undoes the last idea from the undo queue.
     */
    UndoLastIdea() {
      // Check if there are any ideas in the undo queue
      if (this.ideasLIFOForUndo.length > 0) {
        note('UndoLastIdea() called');

        // Pop the last idea from the undo queue
        let idea = this.ideasLIFOForUndo.pop();

        // Reset the lowest selected descendant
        idea.lowestSelectedDescendent = '';

        // Push the idea to the redo queue
        this.ideasLIFOForRedo.push(idea);

        if (this.currentMethod.value !== 'binary') {
          // For non-binary methods, reset the idea and move focus
          this.ResetIdea(idea, true);
          this.MoveFocus();
          this.selectedIdeasPath.pop();
        } else if (idea) {
          // For binary methods, reset all appropriate ancestors, siblings and descendents
          if (this.getLastSelectedIdea === idea) {
            this.selectedIdeasPath.pop();
            if (idea.parent !== undefined) {
              if (idea.parent === this.currentIdeas) {
                this.SoftRestartExercise();
              } else {
                this.currentSelectedIdea = idea.parent;
                idea.parent.children.forEach((child) => {
                  this.ResetIdea(child, true);
                  this.MoveFocus();
                });
              }
            } else {
              this.SoftRestartExercise(idea);
            }
          } else {
            this.ResetIdea(idea, true);
            this.MoveFocus();
          }
        }
      }
    },

    /**
     * Reselects the last idea from the redo queue.
     */
    RedoLastIdea() {
      // Check if there are any ideas in the redo queue
      if (this.ideasLIFOForRedo.length > 0) {
        note('RedoLastIdea() called');

        // Pop the last idea from the redo queue
        let idea = this.ideasLIFOForRedo.pop();

        if (idea) {
          // If an idea is found, select it
          this.SelectIdea(idea);
        } else {
          // If no idea is found, move the focus
          this.MoveFocus();
        }
      }
    },

    /**
     * Fetches and returns the current ideas in JSON format.
     * @returns {Promise<Object>} A promise that resolves to the first idea object.
     */
    async GetCurrentIdeasJSON() {
      note('async GetCurrentIdeasJSON() called');
      let idea = [];

      // Create an array of fetch promises for each URL in the current idea set
      let fetchPromises = this.currentIdeaSet.data.map((url) => fetch(url).then((response) => response.json()));

      try {
        // Wait for all fetch promises to resolve and concatenate the results
        let dataArrays = await Promise.all(fetchPromises);
        idea = [].concat(...dataArrays);
      } catch (error) {
        // Log any errors that occur during the fetch process
        error(error);
      }

      // Return the first idea object
      return idea[0];
    },
    //#endregion

    //#region —————— STATE MANAGEMENT ——————
    /**
     * Resets exercise including any settings overrides and the redo queue.
     */
    HardRestartExercise() {
      note('HardRestartExercise() called');
      this.currentIdeas.children.forEach((idea) => {
        idea.lowestSelectedDescendent = '';
      });
      this.ideasLIFOForRedo = [];
      this.SoftRestartExercise();
    },

    /**
     * Resets exercise without changing any settings overrides or clearing the redo queue.
     */
    SoftRestartExercise() {
      note('SoftRestartExercise() called');
      this.selectedIdeasPath = [];
      this.ideasLIFOForUndo = [];
      this.currentExerciseIsDirty = false;
      this.currentSelectedIdea = this.currentIdeas;
      this.currentMethodType = this.currentMethod.value;
      this.ResetIdea(this.currentIdeas);
      this.currentIdeas.isSelected = true;
      this.currentIdeas.seen = true;
      this.MoveFocus();
    },
    //#endregion

    //#region —————— UTILITIES ——————
    /**
     * Recursively prints the tree structure of ideas, indicating the generation level and selection status.
     * @param {IdeaObject} node - The current node to print.
     * @param {number} [generation=0] - The current generation level (used for indentation).
     */
    PrintTree(node, generation = 0) {
      note('PrintTree() called');
      // Create the prefix with spaces and the arrow based on the generation level
      const prefix = generation === 0 ? '' : ' '.repeat(generation * 4 - 1) + '—';
      // Append "SELECTED" if the node is selected
      const selectedText = node.isSelected ? ' SELECTED' : '';
      // Print the current node's name and isSelected status
      console.log(`${prefix}"${node.name}"${selectedText}`);

      // Recursively print each child node
      for (let child of node.children) {
        this.PrintTree(child, generation + 1);
      }
    },

    /**
     * Checks if any idea in the provided list is selected.
     * @param {Array<IdeaObject>} _ideas - The list of ideas to check.
     * @returns {boolean} - Returns true if at least one idea is selected, otherwise false.
     */
    HasSelected(_ideas) {
      // Use the some() method to determine if any idea in the list is selected
      return _ideas.some((idea) => idea.isSelected);
    },

    /**
     * Finds the first unfinished generation of explored lineage.
     * @returns {IdeaObject[]|null} The lowest possible descendant without selected children ideas, or the first generation children if no suitable generation is found.
     */
    GetFirstUnfinishedGenerationOfExploredLineage() {
      note('GetFirstUnfinishedGenerationOfExploredLineage() called');
      // Recursive function to traverse the tree
      function traverse(idea) {
        if (!idea.children.length) {
          return null; // No children, no generation to check
        }

        if (!app.HasSelected(idea.children)) {
          return idea.children; // Found a generation without any selected ideas
        }

        for (let child of idea.children) {
          if (child.isSelected) {
            const result = traverse(child);
            if (result) {
              return result; // Found a deeper generation without any selected ideas
            }
          }
        }

        return null; // No generation found - should never hit this
      }

      const siblings = this.currentIdeas.children;

      for (let sibling of siblings) {
        if (sibling.isSelected) {
          const result = traverse(sibling);
          if (result) {
            return result; // Return the lowest possible descendant without selected children ideas
          }
        }
      }

      // If no suitable generation is found, return the first generation children
      return siblings;
    },

    /**
     * Finds the deepest selected node in the tree starting from the given node.
     * @param {Object} node - The root node to start the search from.
     * @returns {Object|null} The deepest selected node, or null if no selected node is found.
     */
    FindDeepestSelected(node) {
      note('FindDeepestSelected() called');
      let lowestSelected = null;

      /**
       * Recursive helper function to traverse the tree and find the deepest selected node.
       * @param {Object} currentNode - The current node being traversed.
       */
      function traverse(currentNode) {
        // Update lowestSelected if the current node is selected
        if (currentNode.isSelected) {
          lowestSelected = currentNode;
        }

        // Recursively traverse the children of the current node
        if (currentNode.children && currentNode.children.length > 0) {
          for (let child of currentNode.children) {
            traverse(child);
          }
        }
      }

      // Start the traversal from the given node
      traverse(node);
      return lowestSelected;
    },
    /**
     * Sorts an array of IdeaObject instances alphabetically by their name property.
     * @param {IdeaObject[]} _ideas - The array of IdeaObject instances to be sorted.
     * @returns {IdeaObject[]} - The sorted array of IdeaObject instances.
     */
    SortIdeasByOrderThenAlphabetically(_ideas) {
      note('SortIdeasByOrderThenAlphabetically() called');
      return _ideas.sort((a, b) => {
        // Compare the order properties of two ideas
        if (a.order < b.order) {
          return -1; // a comes before b
        }
        if (a.order > b.order) {
          return 1; // a comes after b
        }
        // If order properties are equal, compare the name properties
        if (a.name < b.name) {
          return -1; // a comes before b
        }
        if (a.name > b.name) {
          return 1; // a comes after b
        }
        return 0; // a and b are equal
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
    /**
     * Validates the input against a given regex pattern and removes invalid characters.
     *
     * @param {Event} event - The input event triggered by the user.
     * @param {Object} _action - The action object containing the pattern and value.
     * @param {string} _action.pattern - The regex pattern to validate the input against.
     * @param {string} _action.value - The current value of the input field.
     */
    ValidateInput(event, _action) {
      event.preventDefault();
      event.stopPropagation();
      // Check if the pattern is not empty
      if (_action.pattern && _action.pattern !== '') {
        // Create a new RegExp object from the pattern
        const regex = new RegExp(_action.pattern, 'u');
        // Test the input against the pattern
        _action.value = _action.value
          .split('')
          .filter((char) => regex.test(char))
          .join('');
      }
    },
    OpenNewWindowWithURL(_url) {
      window.open(_url.trim(), '_blank');
    },

    async GetAIResponse(_data) {
      const response = await fetch('https://winter-king-9e9f.bigtentgames.workers.dev/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Host: window.location.hostname,
          Origin: window.location.origin,
        },
        body: JSON.stringify(_data),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Server error: ' + response.status);
          }
          return response.text();
        })
        .then((payload) => {
          return JSON.parse(payload);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      return response;
    },

    //#endregion

    //#region —————— DEBUG SETUP ——————
    /** Set conditions to skip interactions while developing */
    PreFillForDevelopment(event) {
      note('PreFillForDevelopment() called');
      this.SelectIdeaSet(event, this.allIdeaSets[1]);
    },
    //#endregion

    //#region —————— EVENT HANDLERS ——————
    /**
     * Handles the click event for an AI action, preventing default behavior and opening a URL if provided.
     * @param {Event} event - The click event object.
     * @param {Object} _action - The action object containing the URL to be opened.
     */
    async HandleActionAIClick(event, _action) {
      note('HandleActionAIClick() called');

      event.preventDefault();
      event.stopPropagation();
      this.currentSelectedAIAction = _action;
      // Check if the action has a URL
      if (_action.url !== '') {
        // Open the URL in a new tab
        window.open(_action.url, '_blank');
      } else {
        // Insert AI logic here
        let ideaStringArray = [];
        this.getLowestSelectedDescendantsComputed.forEach((idea) => {
          if (idea.searchName !== '') {
            ideaStringArray.push('"' + idea.searchName + '"');
          } else {
            ideaStringArray.push('"' + idea.name + '"');
          }
        });
        const aiPrefix = _action.request.toLowerCase().trim() + ' ';
        this.currentAIQueryString = aiPrefix + ideaStringArray.join(' ');
        // insert cloudflare worker call to get openai payload here
        // the rest of this is mostly filler until that ^ is done.
        let aiResponse = this.HandleCallToWorkerForAIPaylout(this.currentAIQueryString)
          .then((response) => console.log(response))
          .catch((error) => console.error('Error:', error));

        const suffix = ' ' + _action.request.toLowerCase().trim();
        this.currentIdeaQueryString = this.currentAIQueryString.toLowerCase().replace('find', '');

        if (_action.type === 'map') {
          {
            this.currentIdeaQueryString = this.currentIdeaQueryString.replace('local', '').replace('nearby', '');
            this.currentIdeaQueryString = this.currentIdeaQueryString.replace('  ', '');
            this.currentIdeaQueryString = this.currentIdeaQueryString.trim() + suffix;
            this.currentIdeaQueryString = this.currentIdeaQueryString.replace('  ', '');
            if (_action.inputs.length > 0) {
              this.visualStateShowModal = true;
              this.$nextTick(() => {
                document.getElementsByTagName('input')[0].select();
              });
            } else {
              this.OpenNewWindowWithURL('https://google.com/maps/?q=' + this.currentIdeaQueryString);
            }
          }
        } else {
          this.OpenNewWindowWithURL('https://duckduckgo.com/?q=' + this.currentIdeaQueryString + suffix);
        }

        //insert logic to call AI API through Cloudflare, passing the ideastring in some form
      }
    },

    async HandleCallToWorkerForAIPaylout(_requests) {
      const response = await fetch('https://winter-king-9e9f.bigtentgames.workers.dev/', {
        method: 'POST',
        headers: {
          Host: window.location.hostname,
          Origin: window.location.origin,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(_requests),
      });

      const data = await response.json();
      return data;
    },

    HandleInputFormSubmitClicked() {
      for (let index = 0; index < this.currentSelectedAIAction.inputs.length; index++) {
        const input = this.currentSelectedAIAction.inputs[index];
        this.currentIdeaQueryString = this.currentIdeaQueryString + ' ' + input.value;
        this.currentAIQueryString = this.currentAIQueryString + ' ' + input.value;
      }

      let aiResponse = this.HandleCallToWorkerForAIPaylout(this.currentAIQueryString)
        .then((response) => console.log(response))
        .catch((error) => console.error('Error:', error));

      this.OpenNewWindowWithURL('https://google.com/maps/?q=' + this.currentIdeaQueryString);
      this.visualStateShowModal = false;
    },

    /**
     * Used to manage keyboard input from the user
     * Used to establish current type of user input
     * @param {Object} event
     */
    HandleKeyDown(event) {
      note('HandleKeyDown() called');
      this.visualStateLastInputEvent = 'keydown';
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
        case 'Tab':
          console.log(event.target);
          if (this.currentIdeas && this.selectedIdeasPath.length === 0 && event.target.tagName.toLowerCase() !== 'idea') {
            // this.MoveFocus();
          }
          break;
        case 'Escape':
          this.visualStateShowModal = false;
          break;
        case 'Enter':
          if (this.visualStateShowModal) {
            this.HandleInputFormSubmitClicked();
          }
          break;
        default:
          break;
      }
    },

    /**
     * Used to establish current type of user input
     */
    HandleMouseUp() {
      note('HandleMouseUp() called');
      this.visualStateLastInputEvent = 'mouseup';
    },
    /**
     * There are test files in "resources"
     */
    TriggerFileUpload() {
      note('TriggerFileUpload() called');
      this.$refs.fileInput.click();
    },
    /**
     * Handles the file upload event and processes the uploaded file.
     * @param {Event} event - The file upload event.
     */
    HandleUploadLinkClick(event) {
      note('HandleUploadLinkClick() called');
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          let jsonObject;

          // Check the file type and parse the content accordingly.
          if (file.type === 'application/json') {
            jsonObject = JSON.parse(content);
          } else if (file.type === 'text/csv' || file.type === 'text/plain') {
            jsonObject = this.ConvertToJSON(content, file.name.split('.')[0]);
          }

          if (jsonObject) {
            // Transform the JSON object to the desired structure.
            const transformedJson = this.TransformJson(jsonObject);

            // Create a new IdeaSetObject and add it to the list.
            let set = new IdeaSetObject({
              name: '🖹 ' + transformedJson.name,
              value: transformedJson.name,
              cta: '',
              description: '',
              method: file.type === 'application/json' ? this.allMethods[0] : this.allMethods[1],
              data: transformedJson,
            });

            // Add logic to replace a set that already has the same "name", can test against "value".
            this.allIdeaSets = this.allIdeaSets.filter((obj) => obj.value !== set.value);
            this.allIdeaSets.push(set);
            this.SelectIdeaSet(event, set);
          }
        };
        reader.readAsText(file);
      }
    },
    /**
     * Transforms a JSON object to a specific structure.
     * @param {Object} obj - The JSON object to transform.
     * @returns {Object} The transformed JSON object.
     */
    TransformJson(obj) {
      note('TransformJson() called');

      /**
       * Recursively transforms the input object.
       * @param {Object|Array} input - The input object or array to transform.
       * @param {string|null} parentKey - The key of the parent object.
       * @returns {Object|Array} The transformed object or array.
       */
      const transform = (input, parentKey = null) => {
        if (Array.isArray(input)) {
          // If the input is an array, recursively transform each item.
          return input.map((item) => transform(item));
        } else if (typeof input === 'object' && input !== null) {
          const newObj = {};
          if (obj.hsl) {
            if (obj.hsl !== 'random') {
              newObj.hsl = obj.hsl;
              newObj.hslUsePreset = true;
            }
          } else {
            newObj.hsl = '0, 0%, 90%';
          }
          const keys = Object.keys(input);
          const nameKey = keys.find((key) => key === 'name' || key === 'value');

          if (nameKey) {
            // If a 'name' or 'value' key exists, use its value for the 'name' property.
            newObj.name = input[nameKey];
          } else {
            // Otherwise, use the key of the first array as the 'name' property.
            const firstArrayKey = keys.find((key) => Array.isArray(input[key]));
            newObj.name = firstArrayKey || parentKey;
          }

          // Find the key that contains an array of children objects.
          const childrenKey = keys.find((key) => Array.isArray(input[key]));
          if (childrenKey) {
            // Recursively transform each child object.
            newObj.c = input[childrenKey].map((item) => {
              if (typeof item === 'string') {
                // If the item is a string, convert it to an object with a 'name' property.
                return { name: item };
              }
              return transform(item, childrenKey);
            });
          }

          return newObj;
        }
        return input;
      };

      // Start the transformation with the root object and its first key.
      return transform(obj, Object.keys(obj)[0]);
    },

    /**
     * Converts a string content to a JSON object.
     * @param {string} content - The string content to convert.
     * @returns {Object[]} The converted JSON object.
     */
    ConvertToJSON(content, fileName) {
      // Split the content by new lines.
      const lines = content.split('\n');

      // Map each line to an object with a 'name' property.
      const objectsArray = lines.map((line) => ({
        name: line.trim(),
      }));

      // Extract the file name without the extension.
      const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');

      // Create the final JSON object.
      const jsonObject = {
        name: nameWithoutExtension,
        c: objectsArray,
      };

      return jsonObject;
    },

    //#endregion
  },

  mounted() {
    //#region —————— vue mounted() ——————
    announce('App Initialized');
    if (UseDebug) {
      this.PreFillForDevelopment();
    }
    window.addEventListener('keydown', this.HandleKeyDown);
    window.addEventListener('mouseup', this.HandleMouseUp);
    //#endregion
  },

  computed: {
    //#region —————— vue computed() ——————
    getAllIdeaSetsSortedAlphabetically: function () {
      return this.allIdeaSets.sort((a, b) => {
        const nameA = a.name.slice(3).trim().toLowerCase();
        const nameB = b.name.slice(3).trim().toLowerCase();

        if (nameA < nameB) {
          return -1; // a comes before b
        }
        if (nameA > nameB) {
          return 1; // a comes after b
        }
        return 0; // a and b are equal
      });
    },

    /**
     * COMPUTED: Finds the appropriate set of sibling IdeaObjects that can be presented to the user for their interaction
     * @returns {IdeaObject[]} an array of IdeaObjects
     */
    getIdeasFromCurrentGenerationBasedOnMethod: function () {
      if (this.currentIdeas === null) return [];

      // determine the current generation of ideas that have been interacted with by the user
      let parent = this.currentSelectedIdea.parent === null ? this.currentSelectedIdea : this.currentSelectedIdea.parent;
      let children = parent.children;

      // if all ideas in the determined generation have been seen and/or selected, set the current generation to the next generation of descendants
      if (children.filter((obj) => !obj.seen && !obj.isSelected).length === 0) {
        children = this.currentSelectedIdea.children;
      }

      // find the single selected idea in the current generation
      const selectedChild = children.filter((obj) => obj.isSelected).length === 1 ? children.filter((obj) => obj.isSelected)[0] : null;
      let filteredObjects = []; // defines the final object array that gets returned

      // based on the current selected MethodObject, determine the appropriate ideas to display to the end user for consideration
      switch (this.currentMethod.value) {
        case 'binary': // gets 2 ideas from the current generation where the current generation still has some "unseen" ideas
          filteredObjects = children.filter((obj) => !obj.seen && !obj.isSelected);
          for (let i = filteredObjects.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filteredObjects[i], filteredObjects[j]] = [filteredObjects[j], filteredObjects[i]];
          }
          if (selectedChild === null) {
            // updates the final return object with 2 random ones because no ideas for the current generation have been selected
            let ideas = filteredObjects.slice(0, 2);
            ideas.forEach((idea) => {
              idea.showing = true;
            });
            filteredObjects = ideas;
          } else {
            // if 1 idea in the current generation has been selected, get a second random idea from the same generation and then update the final return object
            const randomObject = filteredObjects.slice(0, 1);
            randomObject[0].showing = true;
            const finalArray = [randomObject[0], selectedChild];
            finalArray.sort(() => Math.random() - 0.5);

            filteredObjects = finalArray;
          }
          break;

        case 'full': // gets the current generation of ideas that are part of a partially explored lineage
        case 'merge':
          filteredObjects = this.GetFirstUnfinishedGenerationOfExploredLineage(this.currentIdeas, false);

          filteredObjects.forEach((idea) => {
            if (idea.isSelected && idea.parent === this.currentIdeas) {
              idea.lowestSelectedDescendent = this.FindDeepestSelected(idea).name;
            }
          });
          filteredObjects = this.SortIdeasByOrderThenAlphabetically(filteredObjects);

        default:
          break;
      }

      return filteredObjects;
    },

    /**
     * COMPUTED: Gets the final "selected" Idea of a set of IdeaObject siblings
     * @returns {IdeaObject}
     */
    getLastSelectedIdea: function () {
      return this.selectedIdeasPath[this.selectedIdeasPath.length - 1];
    },

    /**
     * COMPUTED: Gets the lowest selected descendants based on the current method.
     * @returns {IdeaObject[]} An array of the lowest selected descendants.
     */
    getLowestSelectedDescendantsComputed: function () {
      const result = [];

      // Check if the current method is 'binary'
      if (this.currentMethod.value === 'binary') {
        // Find the deepest selected idea in the entire tree
        const deepestSelected = this.FindDeepestSelected(this.currentIdeas);
        if (deepestSelected) {
          result.push(deepestSelected);
        }
      } else {
        // For other methods, find the deepest selected idea for each child
        for (let child of this.currentIdeas.children) {
          const deepestSelected = this.FindDeepestSelected(child);
          if (deepestSelected) {
            result.push(deepestSelected);
          }
        }
      }

      return result;
    },

    /**
     * COMPUTED: Determines whether AI actions should be shown based on the current method and ideas.
     * @returns {boolean} True if AI actions should be shown, false otherwise.
     */
    showAIActions: function () {
      let result = false;

      // Check if currentIdeas is defined
      if (this.currentIdeas) {
        switch (this.currentMethod.value) {
          case 'binary':
            // For 'binary' method, check if all children have been seen
            result = this.currentIdeas.children.every((idea) => idea.seen === true);
            break;
          case 'merge':
            // For 'merge' method, check if any child has a non-empty lowestSelectedDescendent
            result = this.currentIdeas.children.some((idea) => idea.lowestSelectedDescendent !== '');
            break;
          default:
            // For other methods, check if any object in the current generation matches the first child
            result = this.getIdeasFromCurrentGenerationBasedOnMethod.some((obj) => Object.keys(obj).every((key) => obj[key] === this.currentIdeas.children[0][key]) && Object.keys(this.currentIdeas.children[0]).every((key) => obj[key] === this.currentIdeas.children[0][key]));
            // If a match is found, check if any child is selected
            if (result) {
              result = this.HasSelected(this.currentIdeas.children);
            }
            break;
        }
      }

      return result;
    },

    /**
     * COMPUTED: Determines whether the exercise result should be shown based on the current method and ideas.
     * @returns {boolean} True if the exercise result should be shown, false otherwise.
     */
    showExerciseResult: function () {
      // Check if currentIdeas is defined and the current method is 'binary'
      if (this.currentIdeas && this.currentMethod.value === 'binary') {
        // For 'binary' method, check if all children have been seen
        return this.currentIdeas.children.every((idea) => idea.seen === true);
      }

      // Check if any object in the current generation matches the first child
      const result = this.getIdeasFromCurrentGenerationBasedOnMethod.some((obj) => Object.keys(obj).every((key) => obj[key] === this.currentIdeas.children[0][key]) && Object.keys(this.currentIdeas.children[0]).every((key) => obj[key] === this.currentIdeas.children[0][key]));

      // If no match is found, return false
      if (!result) {
        return false;
      }

      // Check if any child is selected
      let somethingIsSelected = this.HasSelected(this.currentIdeas.children);
      if (!somethingIsSelected) {
        return false;
      } else {
        // Return true if the current method is 'full'
        return this.currentMethod.value === 'full';
      }
    },

    /**
     * COMPUTED: Hydrates AI actions by replacing placeholders with actual data and returns the updated actions.
     * @returns {AIActionObject[]} - The array of hydrated AIActionObject instances.
     */
    hydratedAIActions: function () {
      // Initialize an array to hold the new actions
      const newActions = [];

      // Iterate over each action in the current idea set's AI actions
      this.currentIdeaSet.AIActions.forEach((action) => {
        // Create a new AIActionObject from the current action
        let newAction = new AIActionObject(action);

        // Replace the placeholder in the request with the name of the last selected idea
        newAction.request = newAction.request.replace('{{idea.name}}', '"' + this.getLastSelectedIdea.name + '"');

        // Add the new action to the array of new actions
        newActions.push(newAction);
      });

      // Return the array of hydrated AI actions
      return newActions;
    },
    //#endregion
  },
});
