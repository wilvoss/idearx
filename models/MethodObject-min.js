class MethodObject{constructor(e){this.name=void 0===e.name?"Binary":e.name,this.value=void 0===e.value?"binary":e.value,this.description=void 0===e.description?"Description":e.description,this.allowUndo=void 0!==e.allowUndo&&e.allowUndo}}let Methods=[new MethodObject({name:"Tree Drill",value:"full",description:"Drill down a tree till you reach the best leaf.",allowUndo:!0}),new MethodObject({name:"Binary Crawl",value:"binary",description:'Just like the eye doctor, "is this better, or this", and repeat until you land on the best focus.'}),new MethodObject({name:"Merge Drill",value:"merge",description:"Merge the best ideas within different categories, recursively.",allowUndo:!0})];