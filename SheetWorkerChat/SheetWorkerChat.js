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
    const stateKey = "SheetWorkerChat";
    const modName = `Mod:${stateKey}`;
    const modVersion = "1.0.0";
    const modCmd = "!sw-chat";

    const gmOnly = "/w gm ";

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
    function sendLog(msg, force = true) {
      if (state[stateKey].logging || force) {
        if (typeof msg !== "object") {
          log(`${modName} | ${msg}`);
        } else {
          for (const [prop, value] of Object.entries(msg)) {
            log(`${modName} | ${prop} = ${value}`);
          }
        }
      }
    }

    /**
     * Display configuration options
     */
    function configDisplay() {
      let helpMsg = gmOnly + `&{template:default} {{name=${modName} v${modVersion} Config}}`;
      helpMsg += `{{Attribute name=${state[stateKey].attrName} [Change](${modCmd} config --attr ?{Attribute name})}}`;
      helpMsg += `{{Logging=${state[stateKey].logging} [Toggle](${modCmd} config --logging) }}`;
      sendChat(modName, helpMsg, null, {noarchive: true});
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
          state[stateKey].attrName = stringOrDefault(args[1]);
          break;
        case "--logging":
          state[stateKey].logging = !state[stateKey].logging;
          break;
      }

      configDisplay(); // Display new configuration state
    }

    /**
     * Display script help
     */
    function displayHelp() {
      let helpMsg = gmOnly + `&{template:default} {{name=${modName} v${modVersion} Help }}`;
      const helpText = [
        { command: modCmd, description: "followed by..." },
        {
          command: "config",
          description: "Configure attribute name and logging option",
        },
      ];
      helpText.forEach((help) => {
        helpMsg += `{{${help.command}=${help.description} }}`;
      });

      sendChat(modName, helpMsg, null, {noarchive: true});
    }

    /**
     * Process the MOD chat command
     * @param {string[]} args command line arguments
     */
    function processCmd(args) {
      
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
      if (attrName !== state[stateKey].attrName) return;

      // get character id
      const characterId = attributeObj.get("_characterid");

      // get message object
      const message = attributeObj.get("current");
      if (!message) return;
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
      const text = `${whisper}${rollTemplate}${msgText}`;
      sendChat(who, text);
    }

    /**
     * Update state object schema
     */
    function migrateState() {
      // code here any changes to the state schema

      state[stateKey].version = modVersion;
    }

    const defaultState = {
      version: modVersion,
      attrName: "chatmsg",
      logging: false,
    };

    /**
     * Check MOD installed
     */
    function checkInstall() {
      if (!state[stateKey]) state[stateKey] = defaultState;

      sendChat(modName, `Type '${modCmd} help' for help on commands`, null, {noarchive: true});
      sendChat(modName, `Type '${modCmd} config' to configure the MOD script`, null, {noarchive: true});

      if (state[stateKey].version !== modVersion) {
        migrateState();
      }

      sendLog(state[stateKey], true);
    }

    function registerEventHandlers() {
      /**
       * Wire-up event for API chat message
       */
      on("chat:message", function (msg) {
        // parse chat message
        // cmd : command entered
        // args[] : list of arguments
        const [cmd, ...args] = msg.content.replace(/<br\/>/g, "").split(/\s+/);
        if (args.length > 0) {
          if ((args[0] || "") === "{{") args.shift();
          if ((args[args.length - 1] || "") === "}}") args.pop();
        }

        if (msg.type == "api" && cmd.indexOf(modCmd) === 0) {
          processCmd(args);
        }
      });

      /**
       * Wire-up event for attribute current value change
       */
      on("change:attribute:current", outputChatMessage);
    }

    return {
      name: modName,
      version: modVersion,
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

  log(`${SheetWorkerChat.name} version ${SheetWorkerChat.version} loaded`);
});
