class IdeaSetObject{constructor(e){this.name=void 0===e.name?null:e.name,this.value=void 0===e.value?null:e.value,this.cta=void 0===e.cta?null:e.cta,this.description=void 0===e.description?"":e.description,this.data=void 0===e.data?null:e.data,this.method=void 0===e.method?Methods[0]:e.method,this.locked=void 0!==e.locked&&e.locked}}var IdeaSets=[new IdeaSetObject({name:"Feelings Wheel",value:"feelings",method:Methods[0],cta:"What are you feeling right now?",description:"This feelings wheel is based on the Junto Emotion Wheel.",data:["./data/feelings.json"],locked:!0}),new IdeaSetObject({name:"Lorum picker",value:"lorum",method:Methods[1],cta:"Which latin text is better?",description:"This is a test!",data:["./data/test.json"]}),new IdeaSetObject({name:"LETTERS!",value:"letter",method:Methods[0],cta:"Which letter is better?",description:"This is a test!",data:["./data/test2.json"]})];