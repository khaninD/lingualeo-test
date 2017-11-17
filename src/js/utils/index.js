const loadImageAsync = (url) => {
  if (Array.isArray(url)) {
    return url.map((src, index) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onerror = function(err) {
          reject(new Error("Network Error"));
        };
        img.onload = function(...arg) {
          resolve(arg)
        }
      });
    })
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onerror = function(err) {
      reject(new Error("Network Error"));
    };
    img.onload = function(...arg) {
      resolve(arg)
    }
  });
};

const setScript = (url) => {
  const script = document.createElement('script');
  script.src = url;
  script.async = false;
  document.body.appendChild(script);
};

const correctTime  = number => number < 10 ? `0${number}` : number;

/**
 * Short-hand для создвния элементов с атрибутами
 * @param {string} element - элемент который требуется создать
 * @param {object} props - свойства (class, type и т.п)
 * @param {string} textNode - текстовая нода
 * @returns {DOMElement}
 */
const buildElem = (element, props, textNode) => {
  const elem = document.createElement(element);
  for (let prop in props) {
    if (props.hasOwnProperty(prop)) {
      elem[prop] = props[prop];
    }
  }
  if (textNode) {
    elem.appendChild(document.createTextNode(textNode))
  }
  return elem;
};

module.exports = {
  loadImageAsync,
  setScript,
  buildElem,
  correctTime
};