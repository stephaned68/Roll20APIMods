/**
 * @name Corpse
 * @author stephaned68
 * @version 1.0.0
 * 
 * @description Handle dead tokens
 */
on('ready', () => {

  const MOD_VERSION = "1.0.0";
  
  const STATEKEY = "Corpse";

  HEALTH_BAR1 = "bar1_value";
  HEALTH_BAR2 = "bar2_value";
  HEALTH_BAR3 = "bar3_value";

  const DEF_TOKEN_MARKER = "dead";
  const DEF_HEALTH_BAR_VALUE = "bar1_value";
  const DEF_TOKEN_BURY = 1;

  const CHAT_COMMAND = "!corpse";

  /**
   * Localisation here...
   */
  const LANG = {
    HealthBar: "Barre de santé",
    TokenMarker: "Nom du marker",
    BuryToken: "Enterrer le jeton",
  }

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
    if (!Object.keys(state[STATEKEY]).includes(name))
      return defaultValue;
    return state[STATEKEY][name];
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
   * Send a non archived message to chat
   * @param {string} outputMessage - chat message
   */
  const writeChat = function(outputMessage) {
    sendChat(
      `MOD:${STATEKEY}`,
      outputMessage, 
      null, 
      { noarchive: true }
    );
  }

  /**
   * Send a message to sandbox log 
   * @param {string} logText - log message
   */
  const writeLog = function(logText) {
    log(`MOD:Corpse ${logText}`);
  }

  /**
   * Display configuration menu
   */
  const displayConfig = function() {
    const helpMsg = [
      "/w gm &{template:default}",
      `{{name=${STATEKEY} v${MOD_VERSION} | Configuration}}`,
      `{{${LANG.HealthBar}=${ getParam("TokenBar", DEF_HEALTH_BAR_VALUE) } [Change](${CHAT_COMMAND} bar|?{${LANG.HealthBar}}) }}`,
      `{{${LANG.TokenMarker}=${ getParam("TokenMarker", DEF_TOKEN_MARKER) } [Change](${CHAT_COMMAND} marker|?{${LANG.TokenMarker}}) }}`,
      `{{${LANG.BuryToken}=${ (getParam("TokenBury", DEF_TOKEN_BURY) === 1) ? "*On* [Off]" : "*Off* [On]" }(${CHAT_COMMAND} bury) }}`,
    ].join(" ");
    writeChat(helpMsg);
  }

  /**
   * Handle !corpse configuration menu
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
      case "bury":
        const bury = 1 - getParam("TokenBury", DEF_TOKEN_BURY);
        setParam("TokenBury", bury);
        break;
      case "reset":
        state[STATEKEY] = {};
        break;
    }
    displayConfig();
  }

  /**
   * Process a 'dead' token
   * @param {string} bar - name of token bar value
   * @param {object} token - Roll20 token object
   * @returns {void}
   */
  const processToken = function (bar, token) {
    const healthBar = getParam("TokenBar", DEF_HEALTH_BAR_VALUE);
    if (healthBar !== bar)
      return;
    const linkedTo = token.get(bar.replace("_value", "_link")) || "";
    const health = parseInt(token.get(healthBar)) || 0;
    if (health > 0)
      return;
    const deadMarker = getParam("TokenMarker", DEF_TOKEN_MARKER);
    let logMsg = token.get("name") + " is dead"
    token.set({ "statusmarkers": deadMarker, [healthBar]: 0 });
    if (getParam("TokenBury", DEF_TOKEN_BURY) === 1 && linkedTo === "") {
      token.set({ layer: "map", tint_color: "000000" });
      logMsg += " & buried";
    }
    writeLog(logMsg);
  }

  /**
   * Process change of value in health bar
   */
  on(`change:token:${HEALTH_BAR1}`, function(token) {
    processToken(HEALTH_BAR1, token);
  });
  on(`change:token:${HEALTH_BAR2}`, function(token) {
    processToken(HEALTH_BAR2, token);
  });
  on(`change:token:${HEALTH_BAR3}`, function(token) {
    processToken(HEALTH_BAR3, token);
  });

  /**
   * Handle chat messages
   */
  on("chat:message", function(m) {
    // Configuration menu
    if (m.type === "api" && m.content.includes(CHAT_COMMAND)) {
      handleInput(m);
    }
  });

  /**
   * Display initialization message in sandbox log
   */
  const config = [
    { name: "TokenMarker", default: DEF_TOKEN_MARKER },
    { name: "TokenBar", default: DEF_HEALTH_BAR_VALUE },
    { name: "TokenBury", default: DEF_TOKEN_BURY }
  ].reduce((configAll, config) => {
    configAll += " | " + config.name + "=" + getParam(config.name, config.default);
    return configAll;
  }, "");
  writeLog(`version ${MOD_VERSION} running${config}`);

});