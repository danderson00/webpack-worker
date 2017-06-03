/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(5)(baseValue => ({
  multiply: value => baseValue * value,
  power: value => sleep(10, Math.pow(baseValue, value)),
  error: () => { throw new Error('test') },
  reject: () => Promise.reject({ code: 'test' })
}))

function sleep(time, result) {
  return new Promise((resolve) => setTimeout(() => resolve(result), time));
}

/***/ }),
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */
/***/ (function(module, exports) {

/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
module.exports = worker => {
  let operations

  onmessage = e => {
    const emit = data => self.postMessage(Object.assign({ id: e.data.id }, data))
    const wrapError = error => (error && error.constructor === Error) ? { message: error.message, stack: error.stack } : error
    const emitError = error => emit({ error: wrapError(error) })

    try {
      switch(e.data.type) {
        case 'init':
          Promise.resolve(worker(e.data.param, emit))
            .then(result => {
              operations = result
              emit({ result: { type: 'api' } })
            })
            .catch(emitError)
          break;

        case 'invoke':
          if(!operations[e.data.operation])
            emitError(new Error(`Unknown operation: ${e.data.operation}`))
          
            Promise.resolve(operations[e.data.operation](e.data.param))
              .then(result => emit({ result }))
              .catch(emitError)
          break;

        default:
          emitError(new Error(`Unknown internal operation: ${e.data.type}`))
      }
    } catch(error) {
      emitError(error)
    }
  }
}


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ })
/******/ ]);