var R20LibUtils =
R20LibUtils ||
  (function () {

    const MOD_VERSION = "1.0.0";

    /**
     * Parse and return an integer value from string
     * @param {string} value    - String representation of integer
     * @param {number} onError  - Default value
     * @returns {number}
     */
    const int = function (value, onError = 0) {
      return parseInt(value) || onError;
    };

    /**
     * Parse and return a float value from string
     * @param {string}  value   - String representation of float
     * @param {float}   onError - Default value
     * @returns {float}
     */
    const float = function (value, onError = 0) {
      return parseFloat(value) || onError;
    };

    /**
     * Return a string value or default if falsey
     * @param {string} value    - String value to parse
     * @param {string} onError  - Default return value
     * @returns {string}
     */
    const stringOrDefault = function (value, onError = "") {
      return value || onError;
    };

    /**
     * Send a message to API sandbox log
     * @param {any}     logMessage  - Message to log
     * @param {boolean} force       - Flag to force logging
     */
    const writeLog = function (logMessage, force = true) {
      if (getParam("logging") || force) {
        if (typeof(logMessage) !== 'object') {
          log(`${MOD_NAME} | ${logMessage}`);
        } else {
          for (const [prop, value] of Object.entries(logMessage)) {
            log(`${MOD_NAME} | ${prop} = ${value}`);
          }
        }
      }
    };

    /**
     * Send a message to chat
     * @param {string}  message   - Message to output in chat
     * @param {boolean} noArchive - Flag to set the noarchive option
     */
    const writeChat = function (message, noArchive = true) {
      sendChat(
        MOD_NAME,
        message,
        null,
        { noarchive: noArchive }
      );
    };

    /**
     * Get the current players page id
     * @returns {string}
     */
    const currentPage = function () {
      return Campaign().get("playerpageid");
    };

    /**
     * Get a persisted parameter value
     * @param {string}  stateKey      - Key into the Roll20 state object
     * @param {string}  name          - Parameter name
     * @param {any}     defaultValue  - Parameter default value
     * @returns {any}
     */
    const getParam = function (stateKey, name, defaultValue = null) {
      if (!state[stateKey])
        return defaultValue;
      return state[stateKey][name] || defaultValue;
    };

    /**
     * Persist a parameter name/value pair into Roll20 state object
     * @param {string}  stateKey  - Key into the Roll20 state object
     * @param {string}  name      - Parameter name
     * @param {any}     value     - Parameter value
     */
    const setParam = function (stateKey, name, value) {
      if (!state[stateKey])
        state[stateKey] = {};
      state[stateKey][name] = value;
    };

    /**
     * Split message into array of parts
     * @param {object} chatMsg - Roll20 chat message object
     * @returns {string[]} array of API chat message parts (split on single space)
     */
    const splitMessage = function (chatMsg) {
      return chatMsg.content.replace(/<br\/>/g, '').split(/\s+/);
    };

    /**
     * @typedef ParsedMessage
     * @property {string}   command   - command macro
     * @property {string}   option    - command option
     * @property {string[]} arguments - command arguments
     */

    /**
     * Parse API chat message
     * @param {object} chatMsg - Roll20 chat message object
     * @returns {ParsedMessage}
     */
    const parseMesssage = function (chatMsg) {
      const [ command, option, ...arguments ] = splitMessage(chatMsg);
      return { command, option, arguments };
    };

    /**
     * HTML helper functions library
     */
    const HTML = {
      /**
       * Return a string of style definitions
       * @param {object} list - Key-value pairs
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
       * @param {string} tag        - HTML element tag
       * @param {string} content    - HTML element content
       * @param {object} attributes - Key-value pairs of attributes
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
       * @param {array} elements - List of HTML elements to create
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

    return {
      version: MOD_VERSION,
      int,
      float,
      stringOrDefault,
      writeChat,
      writeLog,
      currentPage,
      getParam,
      setParam,
      splitMessage,
      parseMesssage,
      HTML,
    };

  })();