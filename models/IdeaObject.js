class IdeaObject {
  constructor(spec) {
    this.name = spec.name === undefined ? 'Idea' : spec.name;
    this.type = spec.type === undefined ? 'binary' : spec.type;
    this.description = spec.description === undefined ? null : spec.description;
    this.seen = spec.seen === undefined ? false : spec.seen;
    this.showing = spec.showing === undefined ? false : spec.showing;
    this.isSelected = spec.isSelected === undefined ? false : spec.isSelected;
    this.children = spec.children === undefined ? [] : spec.children;
    this.parent = spec.parent === undefined ? null : spec.parent;
    this.lowestSelectedDescendent = spec.lowestSelectedDescendent === undefined ? '' : spec.lowestSelectedDescendent;
    this.hslUsePreset = spec.hslUsePreset === undefined ? false : spec.hslUsePreset;
    this.hsl = spec.hsl === undefined ? '0, 100%, 100%' : spec.hsl;
  }
}

// used to take a basic .JSON object and generate a fully nested IdeaObject where all descendants are IdeaObjects as well
// FUTURE: examine the incoming data and determine if it's a straight array of strings or a an object that meets the appropriate criteria
function createNestedIdeaObject(_json, _parent = null) {
  const ideaObject = new IdeaObject({
    name: _json.n,
    parent: _parent,
  });

  // set the hsl value for the new IdeaObject (hue, saturation, luminosity) have been defined
  if (_json.hsl !== undefined) {
    ideaObject.hsl = _json.hsl;
    ideaObject.hslUsePreset = true;
  } else if (ideaObject.parent !== undefined && ideaObject.parent !== null && ideaObject.parent.hsl !== undefined) {
    if (ideaObject.parent.hslUsePreset) {
      ideaObject.hsl = ideaObject.parent.hsl;
      ideaObject.hslUsePreset = true;
    } else {
      ideaObject.hsl = getRandomInt(0, 360) + ',100%,50%'; // future: grab hsl from chatgpt call based on idea name
    }
  }

  // set the description value for the new IdeaObject
  if (_json.d !== undefined) {
    ideaObject.description = _json.d;
  }

  // repeat the above code for all descendents recursively
  ideaObject.children = _json.c === undefined ? [] : _json.c.map((child) => createNestedIdeaObject(child, ideaObject));
  return ideaObject;
}
