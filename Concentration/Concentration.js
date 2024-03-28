/**
 * @name Concentration
 * @author stephaned68
 * @version 1.0.0
 * 
 * @description Handle Concentration Marker & Concentration Roll
 * Requires this set of token markers to be installed in the Roll20 game
 * https://drive.google.com/drive/folders/1p8PTqBHkgSrKVqqOyI2_kFcPmbgLcX72
 */
on('ready', () => {

  const MOD_VERSION = "1.0.0";
  
  const STATEKEY = "Concentration";

  const CONCENTRATION_MARKER = "Concentration"

  const HP_BAR_VALUE = "bar1_value";

  /**
   * Get a state parameter value
   * @param {string} name - Parameter name
   * @param {any} defaultValue - Default parameter value
   * @returns {any} - Parameter value
   */
  const getParam = function(name, defaultValue = "") {
    if (!state[STATEKEY]) {
      return defaultValue;
    } 
    return state[STATEKEY][name] || defaultValue;
  }

  /**
   * Set a state parameter value
   * @param {string} name - Parameter name
   * @param {any} value - Parameter value
   */
  const setParam = function(name, value) {
    if (!state[STATEKEY]) {
      state[STATEKEY] = {};
    }
    state[STATEKEY][name] = value;
  }

  /**
   * Get array of markers for token
   * @param {object} token - token object
   * @returns {string[]}
   */
  const getMarkers = function(token) {
    return markers = token.get("statusmarkers")
      .split(",")
      .map(m => m.split(":")[0]);
  }

  /**
   * Send a non archived message to chat
   * @param {string} outputMessage - chat message
   */
  const writeChat = function(outputMessage) {
    sendChat(
      "MOD:Concentration",
      outputMessage, 
      null, 
      { noarchive: true }
    );
  }
  /**
   * Output chat message for Concentration
   * @param {object} token - Roll20 token object
   * @param {object} previous - Prior values of token object
   * @returns {void}
   */
  const keepConcentration = function(token, previous) {

    const concentrationMarker = getParam("TokenMarker", CONCENTRATION_MARKER);
    const markers = getMarkers(token);
    if (!markers.includes(concentrationMarker)) return;

    const hpBarValue = getParam("TokenBarValue", HP_BAR_VALUE);
    if (previous[hpBarValue] <= token.get(hpBarValue)) return;

    let finalConcentrationDC = 10;
    let computedConcentrationDC = (previous[HP_BAR_VALUE] - token.get(HP_BAR_VALUE)) / 2;
    if (computedConcentrationDC > finalConcentrationDC) {
      finalConcentrationDC = Math.floor(computedConcentrationDC);
    }

    let tokenName = token.get("name");

    let outputMessage =
      `/w gm &{template:npcaction} {{rname=Test de Concentration ${tokenName}}} {{name=${tokenName}}} {{description=[JS Constitution DD ${finalConcentrationDC}](~selected|constitution_save)&#10;[Perte Concentration](!token-mod --sel --set statusmarkers|!${CONCENTRATION_MARKER})}}`;
    
    writeChat(outputMessage);

  };

  /**
   * Automatically set concentration marker based on chat message output
   * @param {string} charName - Name of character extracted from chat message
   * @returns {void}
   */
  const setConcentrationMarker = function(charName) {
    const [ character ] = findObjs({ _type: "character", name: charName });
    if (!character) return false;
    let result;
    character.get("_defaulttoken", function (json) {
      const { name } = JSON.parse(json);
      const tokens = findObjs({ 
        _type: "graphic", 
        _subtype: "token", 
        _pageid: Campaign().get("playerpageid"), 
        name 
      });
      if (tokens.length === 0) {
        result = false;
        return
      }
      const allMarkers = JSON.parse(Campaign().get("token_markers"));
      const marker = allMarkers.find(tm => tm.name === CONCENTRATION_MARKER);
      tokens.forEach(token => {
        const markers = getMarkers(token);
        if (!markers.includes(marker.tag)) {
          markers.push(marker.tag);
          token.set("statusmarkers", markers.join(","));
        }
      });
      result = true;
    });
    return result;
  }

  /**
   * Output concentrating message
   * @param {string} chatMsg - Chat message content
   */
  const concentratingMsg = function(chatMsg) {
    if (chatMsg.includes("{{concentration=1}}")) {
      const charName = chatMsg.split("{{charname=")[1]?.split("}}")[0];
      const spellName = chatMsg.split("{{name=")[1]?.split("}}")[0];
      const spellDuration = chatMsg.split("{{duration=")[1]?.split("}}")[0];
      if (charName) {
        const concentrating = setConcentrationMarker(charName);
        if (concentrating) {
          // const description = `${charName} is concentrating on *${spellName}* **${spellDuration}**`;
          const description = `${charName} se concentre sur *${spellName}* **${spellDuration}**`;
          const outputMessage = `&{template:npcaction} {{rname=Concentration}} {{name=${charName} }} {{description=${description} }}`;
          writeChat(outputMessage);
        }
      }
    }
  }

  /**
   * Display configuration menu
   */
  const displayConfig = function() {
    let helpMsg = `/w gm &{template:default} {{name=${STATEKEY} v${MOD_VERSION} Config}}`;
    helpMsg += `{{Token Marker=${getParam("TokenMarker", CONCENTRATION_MARKER)} [Change](!concentration marker|?{Marker Name}) }}`;
    helpMsg += `{{HP Token Bar=${getParam("TokenBar", HP_BAR_VALUE)} [Change](!concentration bar|?{Token Bar}) }}`;
    writeChat(helpMsg);
  }

  /**
   * Handle !concentration configuration menu
   * @param {object} chatMsg - Roll20 chat message object
   * @returns {void}
   */
  const handleInput = function(chatMsg) {
    const param = chatMsg.content.replace(/<br\/>/g, "").split(/\s+/)[1];
    if (!param) {
      displayConfig();
      return;
    }
    const [ name, value ] = param.split("|");
    switch (name) {
      case "marker":
        setParam("TokenMarker", value);
        break;
      case "bar":
        if (["1", "2", "3"].includes(value)) {
          setParam("TokenBar", `bar${value}_value`);
        }
        break;
      case "reset":
        state[STATEKEY] = {};
        break;
    }
    displayConfig();
  }

  /**
   * Output chat message on HP loss
   */
  on(`change:graphic:${HP_BAR_VALUE}`, function (t, p) {
    keepConcentration(t, p);
  });

  /**
   * Handle chat messages
   */
  on("chat:message", function(m) {
    // Detect concentration flag in spell chat message
    if (m.type === "general") {
      concentratingMsg(m.content);
    }
    // Handle configuration menu
    if (m.type === "api" && m.content.includes("!concentration")) {
      handleInput(m);
    }
  })

  const config = [
    { name: "TokenMarker", default: CONCENTRATION_MARKER },
    { name: "TokenBar", default: HP_BAR_VALUE }
  ].reduce((allConfigs, config) => {
    allConfigs += " | " + config.name + "=" + getParam(config.name, config.default);
    return allConfigs;
  }, "");
  
  log(`Mod:Concentration version ${MOD_VERSION} running ${config}`);

});