Vue.config.devtools=!1,Vue.config.debug=!1,Vue.config.silent=!0,Vue.config.ignoredElements=["app"];var app=new Vue({el:"#app",data:{appDataVersion:"0.0.002",newVersionAvailable:!1,currentIdeaSet:{name:"Feelings Wheel",cta:"Which of these best describes how are you are feeling?",description:"This exercise will help you gain clarity on how you are feeling right now!",data:["./data/feelings.json"]},currentIdeas:null,currentSelectedIdea:null,allMethods:Methods,currentMethod:Methods[0],currentMethodType:Methods[0].value,selectedIdeasPath:[],visualStateShowNofication:!1,visualStateShowModal:!1,documentCssRoot:document.querySelector(":root")},methods:{async IntializeApp(){note("InitializeApp() called");let e=await this.getCurrentIdeasJSON;this.currentIdeas=createNestedIdeaObject(e),this.currentIdeas.selectedCount=1,this.currentIdeas.isSelected=!0,this.currentSelectedIdea=this.currentIdeas},SelectIdea(e){note("SelectIdea(_idea) called");let t=0;e.parent.children&&e.parent.children.length>0&&(t=e.parent.children.length,Array.from(e.parent.children).forEach((e=>{e.isSelected=!1,(e.showing||"binary"!==this.currentMethod.value)&&(e.seen=!0),e.seen&&(t-=1)}))),e.isSelected=!0,0!==t&&"binary"===this.currentMethod.value||(this.currentSelectedIdea=e,this.selectedIdeasPath.push(e),log('"'+e.name+'" is now this.currentSelectedIdea'))},RestartExercise(){note("RestartExercise() called"),this.selectedIdeasPath=[],this.ResetNodeChildren(this.currentIdeas),this.currentSelectedIdea=this.currentIdeas},ResetNodeChildren(e){e.isSelected=!1,e.seen=!1,e.children&&e.children.length>0&&e.children.forEach((e=>{this.ResetNodeChildren(e)}))},HandleUpdateAppButtonClick(){note("HandleUpdateAppButtonClick() called"),this.newVersionAvailable=!1,""!==this.serviceWorker&&window.location.reload(!0)},HandleServiceWorkerRegistration(){note("HandleServiceWorkerRegistration() called"),"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js").then((e=>{log("Service worker registered with scope:",e.scope)})).catch((e=>{e("Service worker registration failed:",e)})),void 0!==navigator.serviceWorker&&navigator.serviceWorker.addEventListener("message",(e=>{"updateAvailable"===e.data&&""!==this.serviceWorker&&this.serviceWorker.postMessage({action:"skipWaiting"})})),navigator.serviceWorker.addEventListener("controllerchange",(()=>{this.newVersionAvailable=!0}))}},mounted(){announce("App Initialized"),this.IntializeApp()},computed:{getCurrentIdeasJSON:async function(){let e=[],t=this.currentIdeaSet.data.map((e=>fetch(e).then((e=>e.json()))));try{let r=await Promise.all(t);e=[].concat(...r)}catch(e){e(e)}return e[0]},getRandomIdeasFromCurrentIdeasLevel:function(){if(note("getRandomIdeasFromCurrentIdeasLevel() called"),null===this.currentIdeas)return[];let e=(null===this.currentSelectedIdea.parent?this.currentSelectedIdea:this.currentSelectedIdea.parent).children;0===e.filter((e=>!e.seen&&!e.isSelected)).length&&(e=this.currentSelectedIdea.children);const t=1===e.filter((e=>e.isSelected)).length?e.filter((e=>e.isSelected))[0]:null,r=e.filter((e=>!e.seen&&!e.isSelected));for(let e=r.length-1;e>0;e--){const t=Math.floor(Math.random()*(e+1));[r[e],r[t]]=[r[t],r[e]]}if("binary"!==this.currentMethod.value)return r;if(null===t){let e=r.slice(0,2);return e.forEach((e=>{e.showing=!0})),e}{const e=r.slice(0,1);return e[0].showing=!0,e.concat(t)}}}});