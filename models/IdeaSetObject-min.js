class IdeaSetObject{constructor(e){this.name=void 0===e.name?null:e.name,this.value=void 0===e.value?null:e.value,this.cta=void 0===e.cta?null:e.cta,this.description=void 0===e.description?"":e.description,this.data=void 0===e.data?null:e.data,this.method=void 0===e.method?Methods[0]:e.method,this.AIActions=void 0===e.AIActions?[]:e.AIActions,this.locked=void 0!==e.locked&&e.locked,this.hidden=void 0!==e.hidden&&e.hidden}}var IdeaSets=[new IdeaSetObject({name:"Feelings",value:"feelings",method:Methods[0],cta:"What are you feeling?",description:"Focus on what you are feeling: Based on the Junto Emotion Wheel.",data:["./data/feelings.json"],AIActions:[new AIActionObject({request:"About the feeling {{idea.name}}"}),new AIActionObject({request:"Junto Emotion Wheel",url:"https://www.thejuntoinstitute.com/emotion-wheels/"})],locked:!0}),new IdeaSetObject({name:"Food",value:"food",method:Methods[2],cta:"Define your options!",description:"Focus on your next meal: This exercise will help you figure out all of the parameters you want to consider when thinking about a meal.",data:["./data/food.json"],AIActions:[new AIActionObject({request:"Find Recipes"}),new AIActionObject({request:"Find Venues",inputs:["Zip code"]}),new AIActionObject({request:"Find Grocers",inputs:["Zip code"]})],locked:!0}),new IdeaSetObject({name:"Lorum picker",value:"lorum",method:Methods[1],cta:"Which is better?",description:"Focus on the best random latin text!",data:["./data/test.json"]}),new IdeaSetObject({name:"LETTERS!",value:"letter",method:Methods[0],cta:"Which is best?",description:"Focus on letters!",data:["./data/test2.json"]})];