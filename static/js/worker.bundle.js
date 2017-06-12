!function(t){function r(e){if(n[e])return n[e].exports;var o=n[e]={exports:{},id:e,loaded:!1};return t[e].call(o.exports,o,o.exports,r),o.loaded=!0,o.exports}var n={};return r.m=t,r.c=n,r.p="/webpack-worker/",r(0)}({0:function(t,r,n){"use strict";function e(t){return t&&t.__esModule?t:{default:t}}var o=n(209),u=e(o),i=n(38),a=e(i),c=n(39),s=e(c);n(34),(0,u.default)(function(t){return fetch(t).then(function(t){return t.text()}).then(function(t){var r=(0,a.default)(t);return{topTenMovers:function(t){return(0,s.default)(r,t)}}})})},32:function(t,r){Array.prototype.sum=function(t){return this.reduce(function(r,n){return r+(t?t(n):n)},0)}},33:function(t,r){Array.prototype.groupBy=function(t,r,n){var e=this.reduce(function(n,e){var o=t(e),u=n[o]=n[o]||{key:o,value:[]};return u.value.push(r?r(e):e),n},{});return Object.keys(e).map(function(t){return{key:e[t].key,value:n?n(e[t].value):e[t].value}})},Array.prototype.groupIntoObject=function(t,r,n){var e=this.reduce(function(n,e){var o=t(e),u=n[o]=n[o]||[];return u.push(r?r(e):e),n},{});return n&&Object.keys(e).forEach(function(t){return e[t]=n(e[t])}),e}},34:function(t,r,n){n(33),n(36),n(32),n(35)},35:function(t,r){Array.prototype.mapIntoObject=function(t,r){return this.reduce(function(n,e){return n[t(e)]=r?r(e):e,n},{})}},36:function(t,r){function n(t,r,n,e){function o(r){return e?e(t[r]):t[r]}var u,i,a=0,c=t.length-1;if(0===t.length)return-1;if(void 0===r||null===r)return n?t.length-1:0;if(n&&r<o(0)||!n&&r>o(t.length-1))return-1;for(;a<=c;)if(u=(a+c)/2|0,i=o(u),i<r)a=u+1;else{if(!(i>r))return u;c=u-1}return n?Math.min(u,c):Math.max(u,a)}Array.prototype.nearestUpperBound=function(t,r){return n(this,t,!0,r)},Array.prototype.nearestLowerBound=function(t,r){return n(this,t,!1,r)},Array.prototype.findRange=function(t,r,n){var e=this.nearestLowerBound(t,n);if(e===-1)return[];var o=this.nearestUpperBound(r,n);return o===-1?[]:this.slice(e,o+1)}},38:function(t,r){"use strict";function n(t,r){return t.trim().split("\n").groupBy(function(t){return e(t,r)},function(t){var r=t.split(",");return{stock:r[1],start:+r[2],low:+r[3],high:+r[4],end:+r[5]}},function(t){return t.mapIntoObject(function(t){return t.stock})}).sort(o)}Object.defineProperty(r,"__esModule",{value:!0}),r.default=function(t){return n(t,0).concat(n(t,1)).concat(n(t,2)).concat(n(t,3)).concat(n(t,4))};var e=function(t,r){return new Date(+t.substr(0,4)+r,+t.substr(4,2),+t.substr(6,2))},o=function(t,r){return t.key-r.key}},39:function(t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.default=function(t,r){var n=t.findRange(r.min,r.max,function(t){return t.key}),e=n.reduce(function(t,r){return Object.keys(r.value).forEach(function(n){var e=t[n]||{},o=r.value[n];t[n]={stock:n,start:e.start||o.start,end:o.end,high:e.high>o.high?e.high:o.high,low:e.low<o.low?e.low:o.low}}),t},{}),o=Object.keys(e).map(function(t){var r=e[t];return{stock:t,gain:(r.end-r.start)/r.start*100,relativeHigh:(r.high-r.start)/r.start*100,relativeLow:(r.low-r.start)/r.start*100}}).sort(function(t,r){return r.gain-t.gain}).slice(0,10);return[{x:o.map(function(t){return t.stock}),y:o.map(function(t){return t.relativeLow}),name:"Low",type:"bar"},{x:o.map(function(t){return t.stock}),y:o.map(function(t){return t.gain}),name:"Gain",type:"bar"},{x:o.map(function(t){return t.stock}),y:o.map(function(t){return t.relativeHigh}),name:"High",type:"bar"}]}},209:function(t,r,n){var e=n(212);t.exports=function(t){var r;onmessage=function(n){var o=e.emit(n.data.id),u=e.emitError(o),i=e.userEmit(o);try{switch(n.data.type){case"init":Promise.resolve(t(n.data.param,i)).then(function(t){r=t,o({result:{type:"api",operations:Object.keys(t)}})}).catch(function(t){u(t),close()});break;case"invoke":r[n.data.operation]||u(new Error("Unknown operation: "+n.data.operation)),Promise.resolve(r[n.data.operation](n.data.param,i)).then(function(t){o({result:t})}).catch(u);break;default:u(new Error("Unknown internal operation: "+n.data.type))}}catch(t){u(t),close()}}}},212:function(t,r){function n(t){return!(!t||t.constructor!==Error&&!["error","exception"].some(function(r){return t.constructor.prototype.constructor.name.toLowerCase().includes(r)}))}var e=t.exports={emit:function(t){return function(r){self.postMessage(Object.assign({id:t},r))}},wrapError:function(t){return n(t)?{message:t.message,stack:t.stack}:t},emitError:function(t){return function(r){t({error:e.wrapError(r)})}},userEmit:function(t){return userEmit=function(r){t({user:r})},userEmit.delayed=function(r){return function(n){return t({user:r}),n}},userEmit}}}});
//# sourceMappingURL=worker.bundle.js.map