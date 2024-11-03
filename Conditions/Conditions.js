/**
 * @name Conditions
 * @author stephaned68
 * @version 1.1.0
 * 
 * @description Set condition marker on token and display description in chat
 * 
 * Requirements :
 * This set of token markers must be installed in the Roll20 game
 * https://drive.google.com/drive/folders/1p8PTqBHkgSrKVqqOyI2_kFcPmbgLcX72 
 * 
 * A handout named as 'Condition:{name}' should be created for each condition
 * Where {name} is the name of a condition token marker
 */
on('ready', () => {

  const MOD_VERSION = "1.1.0";

  const MOD_NAME = "MOD:Conditions"

  const DIV_STYLE = [
    "width: calc(100% - 10px)",
    "border: 1px solid #333", 
    "border-radius: 5px",
    "background: white",
    "box-shadow: 5px 5px 5px #333",
    "padding: 5px"
  ].join("; ");

  const MACRO_NAME = "MOD-Conditions";

  const CONDITION_QUERY = [
    "?{Condition ?",
    "Agrippé,Grappled",
    "Assourdi,Deafened",
    "Au sol,Prone",
    "Aveuglé,Blinded",
    "Charmé,Charmed",
    "Effrayé,Frightened",
    "Empoisonné,Poisoned",
    "Entravé,Restrained",
    "Epuisé,Exhausted",
    "Etourdi,Stunned",
    "Incapacité,Incapacited",
    "Invisible,Invisible",
    "Paralysé,Paralysed",
    "Pétrifié,Petrified"
  ].join("|")+"}";

  const MARKER_BLOODIED = "Bleeding";

  const MACRO_ACTION = [
    `!token-mod --set statusmarkers|${CONDITION_QUERY}`,
    `!condition ${CONDITION_QUERY}`
  ].join("\n");

  /**
   * Display condition description from handout
   * @param {string} name - Condition marker name
   * @returns {void}
   */
  const displayCondition = function(name) {
    const [ handout ] = findObjs({ 
      _type: "handout", 
      name: `Condition:${name}` 
    });
    if (!handout) return;
    handout.get("notes", (blob) => {
      sendChat(
        MOD_NAME,
        `<div style="${DIV_STYLE};">${blob}</div>`,
        null,
        { noarchive: true }
      );
    });
  }

  /**
   * Detect new condition added to token
   * @param {object} token - Roll20 token object
   * @param {object} prior - Prior state of token object
   * @returns {void}
   */
  const conditionAdded = function(token, prior) {
    const priorMarkers = prior.statusmarkers
                              .split(",")
                              .map(m => m.split(":")[0]);
    token.get("statusmarkers").split(",").forEach(marker => {
      const [ name ] = marker.split(":");
      if (priorMarkers.includes(name)) return;
      displayCondition(name);
    });

  }

  /**
   * Install MOD macro
   * @param {string} playerId - Roll20 player id
   * @returns {void}
   */
  const installMOD = function (playerId) {
    let [ macro ] = findObjs({ _type: "macro", name: MACRO_NAME });
    if (!macro) {
      macro = createObj("macro", {
        _playerid: playerId,
        name: MACRO_NAME,
        visibleto: "all"
      });
    }
    if (!macro) {
      log(`Cannot create macro ${MACRO_NAME}`);
      return;
    }
    macro.set("action", MACRO_ACTION);
  }
  
  /**
   * Wire-up change of token markers event
   */
  on(`change:token:statusmarkers`, function (t, p) {
    conditionAdded(t, p);
  });

  /**
   * Wire-up change of HP value event (bloodied message)
   */
  on('change:attribute', function (attribute) {
    if (attribute._type !== "attribute" && attribute.get("name") !== "hp") return;

    const currentHP = parseInt(attribute.get("current")) || 0;
    const maxHP = parseInt(attribute.get("max")) || 0;
    if (maxHP === 0 || currentHP === 0) return;

    if (currentHP <= Math.floor(maxHP / 2)) {
      const charId = attribute.get("_characterid");
      if (!charId) return;
      const [ character ] = findObjs({ 
        _type: "character", 
        _id: charId
      });
      if (!character) return;
      sendChat(
        MOD_NAME,
        `<div style="${DIV_STYLE};">${character.get("name")} est <strong>en sang</strong></div>`,
        null,
        { noarchive: true }
      );
    }
  });

  /**
   * Wire-up chat message event
   */
  on("chat:message", function (m) {
    const chatMsg = m.content + " ";
    if (m.type === "api") {
      if (chatMsg.includes("!condition ")) {
        const name = chatMsg.split(" ")[1] || "";
        if (name !== "") displayCondition(name);
      }
      const hasTokenMod = typeof TokenMod === "object";
      if (chatMsg.includes("!conditions ")) {
        if (hasTokenMod) {
          installMOD(m.playerid);
        } else {
          sendChat(
            MOD_NAME,
            "/w gm token-mod MOD script is not installed",
            null,
            { noarchive: true }
          );       
        }
      }
    }
  });

  log(`${MOD_NAME} v${MOD_VERSION} running`);
});