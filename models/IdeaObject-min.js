class IdeaObject{constructor(e){this.name=void 0===e.name?"Idea":e.name,this.searchName=void 0===e.searchName?"":e.searchName,this.order=void 0===e.order?-1:e.order,this.type=void 0===e.type?"binary":e.type,this.description=void 0===e.description?null:e.description,this.seen=void 0!==e.seen&&e.seen,this.showing=void 0!==e.showing&&e.showing,this.isSelected=void 0!==e.isSelected&&e.isSelected,this.children=void 0===e.children?[]:e.children,this.parent=void 0===e.parent?null:e.parent,this.lowestSelectedDescendent=void 0===e.lowestSelectedDescendent?"":e.lowestSelectedDescendent,this.hslUsePreset=void 0!==e.hslUsePreset&&e.hslUsePreset,this.hsl=void 0===e.hsl?"0, 100%, 100%":e.hsl}}function createNestedIdeaObject(e,s=null){const t=new IdeaObject({name:e.n,parent:s});return void 0!==e.hsl?(t.hsl=e.hsl,t.hslUsePreset=!0):void 0!==t.parent&&null!==t.parent&&void 0!==t.parent.hsl&&(t.parent.hslUsePreset?(t.hsl=t.parent.hsl,t.hslUsePreset=!0):t.hsl=getRandomInt(0,360)+",100%,50%"),void 0!==e.d&&(t.description=e.d),void 0!==e.s&&(t.searchName=e.s),void 0!==e.o&&(t.order=parseInt(e.o)),t.children=void 0===e.c?[]:e.c.map((e=>createNestedIdeaObject(e,t))),t}