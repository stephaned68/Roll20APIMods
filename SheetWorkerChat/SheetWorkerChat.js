/**
 * @name SheetWorkChat
 * @author stephaned68
 * @version 1.0.0
 *
 * The character sheet must have an hidden attribute with a name of attr_chatmsg by default
 * When a sheet worker script needs to send a message to the chat, it needs to set this attribute value to a serialized object
 * using JSON.stringify({ message })
 * Where message has the following schema :
 * {
 *   sender: <string> Message sender (defaults to character name)
 *   whisper: <bool> Message is whispered
 *   recipient: <string> Recipient of the whispered message (defaults to 'GM')
 *   text: <string> Message text
 *   rollTemplate: { 
 *     id: <string> Roll template identifier
 *     props: [
 *       {
 *         name: <string> Property name,
 *         value: <string> Property values
 *       }
 *     ]
 *   }
 * }
 * 
 * The {text} property is for a simple text or HTML message
 * The {rollTemplate} property sub-object is for a message using a roll template
 *
 */

var SheetWorkerChat =
  SheetWorkerChat ||
  (function () {

    const STATEKEY = "SheetWorkerChat";
    const MOD_NAME = `Mod:${STATEKEY}`;
    const MOD_VERSION = "1.0.0";
    const MOD_COMMAND = "!sw-chat";

    const GM_ONLY = "/w gm ";

    /**
     * Parse string and return integer value
     * @param {string} value string to parse
     * @param {int} onError default value
     * @returns integer or default value
     */
    function int(value, onError = 0) {
      return parseInt(value) || onError;
    }

    /**
     * Parse string and return float value
     * @param {string} value string to parse
     * @param {float} onError default value
     * @returns float or default value
     */
    function float(value, onError = 0) {
      return parseFloat(value) || onError;
    }

    /**
     * Return string or default/empty if falsey
     * @param {string} value string valie
     * @param {string} onError default value
     * @returns string or default value
     */
    function stringOrDefault(value, onError = "") {
      return value || onError;
    }

    /**
     * Log a message to the debug console
     * @param {string} msg
     * @param {boolean} force
     */
    function writeLog(msg, force = true) {
      if (state[STATEKEY].logging || force) {
        if (typeof msg !== "object") {
          log(`${MOD_NAME} | ${msg}`);
        } else {
          for (const [prop, value] of Object.entries(msg)) {
            log(`${MOD_NAME} | ${prop} = ${value}`);
          }
        }
      }
    }

    /**
     * Send a non archived message to chat
     * @param {string} message 
     */
    function writeChat(message) {
      sendChat(
        MOD_NAME,
        message,
        null, 
        { noarchive: true }
      );
    }    

    /**
     * Display configuration options
     */
    function configDisplay() {
      let helpMsg = GM_ONLY + `&{template:default} {{name=${MOD_NAME} v${MOD_VERSION} Config}}`;
      helpMsg += `{{Attribute name=${state[STATEKEY].attrName} [Change](${MOD_COMMAND} config --attr ?{Attribute name})}}`;
      helpMsg += `{{Logging=${state[STATEKEY].logging} [Toggle](${MOD_COMMAND} config --logging) }}`;
      
      writeChat(helpMsg);
    }

    /**
     * Parse arguments and configure the state object
     * @param {string[]} args arguments
     */
    function configSetup(args) {
      if (args.length === 0) {
        configDisplay();
        return;
      }

      switch (args[0].toLowerCase()) {
        case "--attr":
          state[STATEKEY].attrName = stringOrDefault(args[1]);
          break;
        case "--logging":
          state[STATEKEY].logging = !state[STATEKEY].logging;
          break;
      }

      configDisplay(); // Display new configuration state
    }

    /**
     * Display script help
     */
    function displayHelp() {
      let helpMsg = GM_ONLY + `&{template:default} {{name=${MOD_NAME} v${MOD_VERSION} Help }}`;
      const helpText = [
        { command: MOD_COMMAND, description: "followed by..." },
        {
          command: "config",
          description: "Configure attribute name and logging option",
        },
      ];
      helpText.forEach((help) => {
        helpMsg += `{{${help.command}=${help.description} }}`;
      });

      writeChat(helpMsg);
    }

    /**
     * Process the MOD chat command
     * @param {string[]} args command line arguments
     */
    function handleInput(args) {
      const [cmd, ...args] = msg.content.replace(/<br\/>/g, "").split(/\s+/);
      if (args.length > 0) {
        if ((args[0] || "") === "{{") args.shift();
        if ((args[args.length - 1] || "") === "}}") args.pop();
      }

      if (msg.type !== "api" || cmd.indexOf(MOD_COMMAND) === -1) return;
      
      const action = args[0] || "";

      // help command
      if (action.toLowerCase() === "help") {
        displayHelp();
        return;
      }

      // config command
      if (action.toLowerCase() === "config") {
        args.shift();
        configSetup(args);
        return;
      }

    }

    /**
     * Return roll macro with attribute references resolved
     * @param {string} characterId Character Id
     * @param {string} text Roll macro with attribute references
     * @returns string
     */
    function resolveAttributes(characterId, text) {
      while (true) {
        const attr = text.indexOf("@{");
        if (attr == -1) break;
        let attrName = text.substring(attr + 2);
        const attrNameVal = attrName
          .substring(0, attrName.indexOf("}"))
          .split("|");
        attrVal = getAttrByName(
          characterId,
          attrNameVal[0],
          attrNameVal[1] || "current"
        );
        text = text.replace(`@{${attrNameVal[0]}}`, attrVal);
      }
      return text;
    }

    /**
     * Output sheet worker message to chat
     * @param {object} attributeObj Roll20 attribute object
     * @returns void
     */
    function outputChatMessage(attributeObj) {
      const attrName = attributeObj.get("name").toLowerCase();
      if (attrName !== state[STATEKEY].attrName) return;

      // get character id
      const characterId = attributeObj.get("_characterid");

      // get message object
      const message = attributeObj.get("current") || "";
      if (message.trim() === "") return;
      const messageObj = JSON.parse(message);
      if (!messageObj.text && !messageObj.rollTemplate) return;

      // parse message object
      const who = messageObj.sender || `character|${characterId}`;
      let whisper = "";
      if (messageObj.whisper) {
        whisper = "/w " + messageObj.recipient || "GM";
      }
      let msgText = " " + messageObj.text;

      // format message with template
      let rollTemplate = "";
      const templateInfo = messageObj.rollTemplate;
      if (templateInfo) {
        rollTemplate = ` &{template:${
          templateInfo.id
        }} {{perso= ${resolveAttributes(characterId, "character_name")} }}`;
        if (templateInfo.props) {
          msgText = "";
          for (const prop of templateInfo.props) {
            msgText += ` {{${prop.name}= ${resolveAttributes(
              characterId,
              prop.value
            )} }}`;
          }
        }
      }
      
      sendChat(
        who, 
        `${whisper}${rollTemplate}${msgText}`,
        null, 
        { noarchive: true }
      );
    }

    /**
     * Update state object schema
     */
    function migrateState() {
      // code here any changes to the state schema

      state[STATEKEY].version = MOD_VERSION;
    }

    const defaultState = {
      version: MOD_VERSION,
      attrName: "chatmsg",
      logging: false,
    };

    /**
     * Check MOD installed
     */
    function checkInstall() {
      if (!state[STATEKEY]) state[STATEKEY] = defaultState;

      writeChat(`Type '${MOD_COMMAND} help' for help on commands`);
      writeChat(`Type '${MOD_COMMAND} config' to configure the MOD script`);

      if (state[STATEKEY].version !== MOD_VERSION) {
        migrateState();
      }

      writeLog(state[STATEKEY], true);
    }

    function registerEventHandlers() {
      /**
       * Wire-up event for API chat message
       */
      on("chat:message", handleInput);

      /**
       * Wire-up event for attribute current value change
       */
      on("change:attribute:current", outputChatMessage);
    }

    return {
      name: MOD_NAME,
      version: MOD_VERSION,
      checkInstall,
      registerEventHandlers,
    };
  })();

/**
 * Runs when game/campaign loaded and ready
 */
on("ready", function () {

  SheetWorkerChat.checkInstall();

  SheetWorkerChat.registerEventHandlers();

  log(`${SheetWorkerChat.name} version ${SheetWorkerChat.version} running`);
});
