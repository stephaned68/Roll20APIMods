/**
 * @name MultiAttack
 * @author stephaned68
 * @version 2.0.0
 * 
 * This MOD script needs to be used with a macro that has the following command :
 * !ma @{selected|character_id} @{selected|repeating_npcaction_$0_attack_damagetype}
 * This macro can be created by the script with the following command :
 * !ma-macro <Macro Name>
 * Check the box to have the macro appear in the macro-bar at the bottom of the screen
 *
 * The damage type on the Multiattack action on the statblock must be set as a list of comma-separated action commands
 * Each action command has the following format : <code>name*number</code>
 * The name does not have to reflect exactly the name setup on the sheet
 * A partial name will work as long as it is sufficently unique to find the attack action
 * The search for a matching action is case insensitive
 * Example :
 * The Multiattack action is first on the Xorn statblock and reads as :
 * "The xorn makes three claw attacks and one bite attack."
 * In the Multiattack damage type, enter : claw*3,bite
 * 
 * To use the MOD, select an NPC token and click the macro button
 */
var MultiAttack =
  MultiAttack ||
  (function () {

    const MOD_NAME = `Mod:MultiAttack`;
    const MOD_VERSION = "2.0.0";
    const MOD_COMMAND = "!ma";
    const MOD_HELP_HANDOUT = "Mod-MultiAttack-Help";

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
    

    function checkInstall() {
      let helpHandout = findObjs({
        _type:	"handout",
        name: MOD_HELP_HANDOUT
      });
      if (helpHandout.length > 0) return;
      helpHandout = createObj("handout", {
        name: MOD_HELP_HANDOUT,
      });
      if (helpHandout) {
        helpHandout.set("notes", `
        <h1>MultiAttack MOD script v${MOD_VERSION}</h1>
        <p>by stephaned68</p>
        <hr>
        <h2>Setting up macro</h2>
        <p>This MOD script needs to be used with a macro that has the following command :</p>
        <code>!ma @{selected|character_id} @{selected|repeating_npcaction_$0_attack_damagetype}</code>
        <p>This macro can be created by the script with the following command :</p>
        <code>!ma-macro &lt;Macro Name&gt;</code>
        <p>Check the box to have the macro appear in the macro-bar at the bottom of the screen.
        <hr>
        <h2>Setting up NPC sheets</h2>
        <p>
        The damage type on the Multiattack action on the statblock must be set as a list of comma-separated action commands.<br>
        Each action command has the following format : <code>name*number</code>.<br>
        The name does not have to reflect exactly the name setup on the sheet, a partial name will work as long as it is sufficently unique to find the attack action.<br>
        The search for a matching action is case insensitive.
        </p>
        <p>
        <strong>Example :</strong>
        <br>The Multiattack action is first on the Xorn statblock and reads as :
        <br><em>"The xorn makes three claw attacks and one bite attack."</em>
        <br>In the Multiattack damage type, simply enter : <code>claw*3,bite</code>
        </p>
        <p>
        You can combine these action commands with Roll20 queries.<br>
        <strong>Example :</strong>
        <code>?{Attack with ?|Bite,bite*2|Tentacle,tentacle*2},slam</code>
        </p>
        <hr>
        <h2>Usage</h2>
        <p>
        Select a token and click the button in the macro-bar to have the MOD script whisper the list of attacks in the chat window to the GM.
        </p>
        `);
      }
    }

    /**
     * Create the companion macro
     * @param {string} macroName name of macro to create
     * @returns {void}
     */
    function createMacro(macroName, playerId) {
      if (!macroName) return;
      const macro = createObj("macro", {
        type: "macro",
        playerid: playerId,
        name: macroName,
        action: "!ma @{selected|character_id} @{selected|repeating_npcaction_$0_attack_damagetype}"
      });
      if (!macro) return;
      if (macro.id) {
        writeChat(`/w gm Macro ${macroName} created successfully`);
      }
    }

    /**
     * Build multi-attack chat message
     * @param {string} charId character id
     * @param {string} attacks list of attack numbers
     * @returns {string} message to output to chat
     */
    function multiAttack(charId, attacks) {
      if (!attacks) return;

      // get character name
      character = getObj("character", charId);
      const charName = character.get("name");

      // build chat message
      let chatMsg = "";
      const attackList = attacks.split(",");
      attackList.forEach((attack) => {
        let [ atkName, atkCount ] = attack.split("*");
        atkCount = parseInt(atkCount) || 1;
        const rowId = findObjs({
          _type: "attribute",
          _characterid: charId
        }).reduce((rows, attr) => { // build list of npcaction row ids
          const name = attr.get("name");
          if (name.startsWith("repeating_npcaction")) {
            const rowId = name.split("_")[2];
            if (!rows.includes(rowId)) rows.push(rowId);
          }
          return rows;
        }, []).filter(rowId => { // get the rowid for name
          const action = getAttrByName(charId, `repeating_npcaction_${rowId}_name`);
          return action.toLowerCase().includes(atkName.toLowerCase());
        })[0];
        if (!rowId) return;
        for (let atk = 1; atk <= atkCount; atk++) {
          chatMsg += `\n%{${charName}|repeating_npcaction_${rowId}_npc_action}`;
        }
      });

      return `@{${charName}|repeating_npcaction_$0_description} ` + chatMsg;
    }

    /**
     * Handle chat messages
     * @param {object} msg Roll20 chat message object
     */
    function handleInput(msg) {
      if (msg.type == "api" && msg.content.indexOf(MOD_COMMAND) == 0) {
        const message = msg.content.replace(/\s\s+/g, " ");
        const [ command, ...params ] = message.split(" ");
        if (command == "!ma-macro") {
          createMacro(params.join(" "), msg.playerid);
        } else {
          const charId = params.shift();
          const chatMsg = multiAttack(charId, params.join(" "));
          writeChat("/w gm " + chatMsg);
        }
      }
    }

    /**
     * Register 'chat:message' event hendler
     */
    function registerEventHandlers() {
      /**
       * Wire-up event for API chat message
       */
      on("chat:message", handleInput);
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

  MultiAttack.checkInstall();
  MultiAttack.registerEventHandlers();

  log(`${MultiAttack.name} version ${MultiAttack.version} running`);

});
