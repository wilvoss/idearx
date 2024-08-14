Vue.config.devtools=!1,Vue.config.debug=!1,Vue.config.silent=!0,Vue.config.ignoredElements=["app"];var app=new Vue({el:"#app",data:{appVersion:"0.0.032",allMethods:Methods,allIdeaSets:IdeaSets,allViews:Views,currentIdeaSet:new IdeaSetObject({}),currentIdeas:null,currentSelectedIdea:null,currentMethod:new MethodObject({}),currentView:Views[0],currentMethodType:"",currentExerciseIsDirty:!1,selectedIdeasPath:[],ideasLIFOForUndo:[],ideasLIFOForRedo:[],visualStateLastInputEvent:null},methods:{async SelectIdeaSet(e){if(note("async SelectIdeaSet() called"),this.currentIdeaSet=void 0===e?this.currentIdeaSet:e,null!==this.currentIdeaSet.data){let e=await this.GetCurrentIdeasJSON();this.currentIdeas=createNestedIdeaObject(e),this.currentMethod=this.currentIdeaSet.method,this.SoftRestartExercise()}},SelectIdea(e){if(note("SelectIdea() called"),"binary"===this.currentMethod.value){let t=0;e.parent.children&&e.parent.children.length>0&&(t=e.parent.children.length,Array.from(e.parent.children).forEach((e=>{e.isSelected=!1,e.seen=e.showing,e.seen&&(t-=1)}))),e.isSelected=!0,e.lowestSelectedDescendent="",0===t&&(this.currentSelectedIdea=e,this.selectedIdeasPath.push(e))}else e.isSelected=!0,this.currentSelectedIdea=e,this.selectedIdeasPath.push(e);this.ideasLIFOForUndo.push(e),this.currentExerciseIsDirty=!0,this.MoveFocus()},MoveFocus(){note("MoveFocus() called"),"keydown"===this.visualStateLastInputEvent&&this.$nextTick((()=>{void 0===this.getLastSelectedIdea||this.getLastSelectedIdea.children.length>0||0===this.selectedIdeasPath.length?document.getElementById("idpicker").firstChild.focus():this.showAIActions?document.getElementById("aiactions").firstChild.focus():document.getElementById("button-restart").focus()}))},UndoLastIdea(){if(this.ideasLIFOForUndo.length>0){note("UndoLastIdea() called");let e=this.ideasLIFOForUndo.pop();e.lowestSelectedDescendent="",this.ideasLIFOForRedo.push(e),"binary"!==this.currentMethod.value?(this.ResetIdea(e,!0),this.MoveFocus(),this.selectedIdeasPath.pop()):e&&(this.getLastSelectedIdea===e?(this.selectedIdeasPath.pop(),void 0!==e.parent?e.parent===this.currentIdeas?this.SoftRestartExercise():(this.currentSelectedIdea=e.parent,e.parent.children.forEach((e=>{this.ResetIdea(e,!0),this.MoveFocus()}))):this.SoftRestartExercise(e)):(this.ResetIdea(e,!0),this.MoveFocus()))}},RedoLastIdea(){if(this.ideasLIFOForRedo.length>0){note("RedoLastIdea() called");let e=this.ideasLIFOForRedo.pop();e?this.SelectIdea(e):this.MoveFocus()}},async GetCurrentIdeasJSON(){note("async GetCurrentIdeasJSON() called");let e=[],t=this.currentIdeaSet.data.map((e=>fetch(e).then((e=>e.json()))));try{let s=await Promise.all(t);e=[].concat(...s)}catch(e){e(e)}return e[0]},HardRestartExercise(){note("HardRestartExercise() called"),this.currentIdeas.children.forEach((e=>{e.lowestSelectedDescendent=""})),this.ideasLIFOForRedo=[],this.SoftRestartExercise()},SoftRestartExercise(){note("SoftRestartExercise() called"),this.selectedIdeasPath=[],this.ideasLIFOForUndo=[],this.currentExerciseIsDirty=!1,this.currentSelectedIdea=this.currentIdeas,this.currentMethodType=this.currentMethod.value,this.ResetIdea(this.currentIdeas),this.currentIdeas.isSelected=!0,this.currentIdeas.seen=!0,this.MoveFocus()},PrintTree(e,t=0){note("PrintTree() called");0===t||" ".repeat(4*t-1),e.isSelected;for(let s of e.children)this.PrintTree(s,t+1)},HasSelected:e=>e.some((e=>e.isSelected)),GetFirstUnfinishedGenerationOfExploredLineage(){function e(t){if(!t.children.length)return null;if(!app.HasSelected(t.children))return t.children;for(let s of t.children)if(s.isSelected){const t=e(s);if(t)return t}return null}note("GetFirstUnfinishedGenerationOfExploredLineage() called");const t=this.currentIdeas.children;for(let s of t)if(s.isSelected){const t=e(s);if(t)return t}return t},FindDeepestSelected(e){note("FindDeepestSelected() called");let t=null;return function e(s){if(s.isSelected&&(t=s),s.children&&s.children.length>0)for(let t of s.children)e(t)}(e),t},SortIdeasAlphabetically:e=>(note("SortIdeasAlphabetically() called"),e.sort(((e,t)=>e.name<t.name?-1:e.name>t.name?1:0))),ResetIdea(e,t=!1){t&&highlight('Undoing "'+e.name+'"'),e.isSelected=!1,e.seen=!1,e.showing=!1,e.children&&e.children.length>0&&e.children.forEach((e=>{this.ResetIdea(e)}))},PreFillForDevelopment(){note("PreFillForDevelopment() called"),this.SelectIdeaSet(this.allIdeaSets[0])},HandleActionAIClick(e,t){note("HandleActionAIClick() called"),e.preventDefault(),e.stopPropagation(),""!==t.url&&window.open(t.url,"_blank")},HandleKeyDown(e){switch(note("HandleKeyDown() called"),this.visualStateLastInputEvent="keydown",e.key){case"z":case"Z":this.currentMethod.allowUndo&&e.metaKey&&(e.shiftKey?this.RedoLastIdea():this.UndoLastIdea());break;case"Tab":this.currentIdeas&&0===this.selectedIdeasPath.length&&e.target.tagName.toLowerCase();default:break}},HandleMouseUp(){note("HandleMouseUp() called"),this.visualStateLastInputEvent="mouseup"}},mounted(){announce("App Initialized"),UseDebug&&this.PreFillForDevelopment(),window.addEventListener("keydown",this.HandleKeyDown),window.addEventListener("mouseup",this.HandleMouseUp)},computed:{getIdeasFromCurrentGenerationBasedOnMethod:function(){if(null===this.currentIdeas)return[];let e=(null===this.currentSelectedIdea.parent?this.currentSelectedIdea:this.currentSelectedIdea.parent).children;0===e.filter((e=>!e.seen&&!e.isSelected)).length&&(e=this.currentSelectedIdea.children);const t=1===e.filter((e=>e.isSelected)).length?e.filter((e=>e.isSelected))[0]:null;let s=[];switch(this.currentMethod.value){case"binary":s=e.filter((e=>!e.seen&&!e.isSelected));for(let e=s.length-1;e>0;e--){const t=Math.floor(Math.random()*(e+1));[s[e],s[t]]=[s[t],s[e]]}if(null===t){let e=s.slice(0,2);e.forEach((e=>{e.showing=!0})),s=e}else{const e=s.slice(0,1);e[0].showing=!0;const n=[e[0],t];n.sort((()=>Math.random()-.5)),s=n}break;case"full":case"merge":s=this.GetFirstUnfinishedGenerationOfExploredLineage(this.currentIdeas,!1),s.forEach((e=>{e.isSelected&&e.parent===this.currentIdeas&&(e.lowestSelectedDescendent=this.FindDeepestSelected(e).name)})),s=this.SortIdeasAlphabetically(s);default:break}return s},getLastSelectedIdea:function(){return this.selectedIdeasPath[this.selectedIdeasPath.length-1]},getLowestSelectedDescendantsComputed:function(){const e=[];if("binary"===this.currentMethod.value){const t=this.FindDeepestSelected(this.currentIdeas);t&&e.push(t)}else for(let t of this.currentIdeas.children){const s=this.FindDeepestSelected(t);s&&e.push(s)}return e},showAIActions:function(){let e=!1;if(this.currentIdeas)switch(this.currentMethod.value){case"binary":e=this.currentIdeas.children.every((e=>!0===e.seen));break;case"merge":e=this.currentIdeas.children.some((e=>""!==e.lowestSelectedDescendent));break;default:e=this.getIdeasFromCurrentGenerationBasedOnMethod.some((e=>Object.keys(e).every((t=>e[t]===this.currentIdeas.children[0][t]))&&Object.keys(this.currentIdeas.children[0]).every((t=>e[t]===this.currentIdeas.children[0][t])))),e&&(e=this.HasSelected(this.currentIdeas.children));break}return e},showExerciseResult:function(){if(this.currentIdeas&&"binary"===this.currentMethod.value)return this.currentIdeas.children.every((e=>!0===e.seen));if(!this.getIdeasFromCurrentGenerationBasedOnMethod.some((e=>Object.keys(e).every((t=>e[t]===this.currentIdeas.children[0][t]))&&Object.keys(this.currentIdeas.children[0]).every((t=>e[t]===this.currentIdeas.children[0][t])))))return!1;return!!this.HasSelected(this.currentIdeas.children)&&"full"===this.currentMethod.value},hydratedAIActions:function(){const e=[];return this.currentIdeaSet.AIActions.forEach((t=>{let s=new AIActionObject(t);s.request=s.request.replace("{{idea.name}}",'"'+this.getLastSelectedIdea.name+'"'),e.push(s)})),e}}});