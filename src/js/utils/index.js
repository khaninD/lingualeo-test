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
  buildElem,
  correctTime
};