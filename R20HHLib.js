/**
 * HTML helper functions library
 */
const hhlib = {
  /**
   * Return a string of style definitions
   * @param {object} list key-value pairs
   * @returns {string} style property
   */
  getStyle: function (list) {
    let style = "";
    for (const prop in list) {
      style +=
        prop.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() +
        ":" +
        list[prop] +
        ";";
    }
    return style;
  },

  /**
   * Return an HTML element string
   * @param {string} tag HTML element tag
   * @param {string} content HTML element content
   * @param {object} attributes key-value pairs of attributes
   * @returns {string} HTML element
   */
  getElement: function (tag, content, attributes = {}) {
    let html = `<${tag}`;
    for (const [prop, value] of Object.entries(attributes)) {
      html += ` ${prop
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .toLowerCase()}="${value}"`;
    }
    if (content === null) html += " />";
    else html += `>${content}</${tag}>`;
    return html;
  },

  /**
   * Return a string with HTML elements siblings
   * @param {array} elements list of HTML elements to create
   * @returns {string} HTML elements
   */
  getElements: function (elements) {
    let html = "";
    if (Array.isArray(elements)) {
      elements.forEach((element) => {
        html += htmlElement(
          element.tag,
          element.content || null,
          element.attributes || {}
        );
      });
    }
    return html;
  },
};