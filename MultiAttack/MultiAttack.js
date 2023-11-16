/**
 * @name MultiAttack
 * @author stephaned68
 * @version 1.0.0
 * 
 * This MOD script needs to be used with a macro that has the following command :
 * !ma @{selected|character_id} @{selected|repeating_npcaction_$0_attack_damagetype}
 * This macro can be created by the script with the following command :
 * !ma-macro <Macro Name>
 * Check the box to have the macro appear in the macro-bar at the bottom of the screen
 * 
 * The damage type on the Multiattack action on the statblock must be set as a list of comma-separated action numbers
 * Each number represent an attack in the action's list.
 * Example :
 * The Multiattack action is first on the Xorn statblock and reads as :
 * "The xorn makes three claw attacks and one bite attack."
 * 2nd action is claw attack, 3rd action is bite attack
 * In the Multiattack damage type, enter : 2,2,2,3
 * 
 * To use the MOD, select an NPC token and click the macro button
 */
var MultiAttack =
  MultiAttack ||
  (function () {

    const modName = `Mod:MultiAttack`;
    const modVersion = "1.0.0";
    const modCmd = "!ma";
    const modHelpHandout = "Mod-MultiAttack-Help";

    function checkInstall() {
      let helpHandout = findObjs({
        _type:	"handout",
        name: modHelpHandout
      });
      if (helpHandout.length > 0) return;
      helpHandout = createObj("handout", {
        name: modHelpHandout,
      });
      if (helpHandout) {
        helpHandout.set("notes", `
        <h1>MultiAttack MOD script v${modVersion}</h1>
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
        The damage type on the Multiattack action on the statblock must be set as a list of comma-separated action numbers. Each number represent an attack in the action's list.
        </p>
        <p>
        <strong>Example :</strong>
        <br>The Multiattack action is first on the Xorn statblock and reads as :
        <br><em>"The xorn makes three claw attacks and one bite attack."</em>
        <br>2nd action is claw attack, 3rd action is bite attack.
        <br>In the Multiattack damage type, enter : <code>2,2,2,3</code>
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
        sendChat("Mod:MultiAttack", `/w gm Macro ${macroName} created successfully`, null, {noarchive: true});
      }
    }

    /**
     * Process multiattack chat message
     * @param {string} charId character id
     * @param {string} attacks list of attack numbers
     * @returns {void}
     */
    function multiAttack(charId, attacks) {
      if (!attacks) return;
      // get character name
      character = getObj("character", charId);
      const charName = character.get("name");
      // build and send chat message
      let chatMsg = "";
      const attackList = JSON.parse(`[${attacks}]`) || [];
      attackList.forEach((index) => {
        chatMsg += `\n%{${charName}|repeating_npcaction_$${index - 1}_npc_action}`;
      });
      sendChat("Mod:MultiAttack", `/w gm @{${charName}|repeating_npcaction_$0_description} ` + chatMsg);
    }

    /**
     * Handle chat messages
     * @param {object} msg Roll20 chat message object
     */
    function handleInput(msg) {
      if (msg.type == "api" && msg.content.indexOf(modCmd) == 0) {
        const params = msg.content.replace(/\s\s+/g, " ");
        const [ command, param1, param2 ] = params.split(" ");
        if (command == "!ma-macro") {
          createMacro(param1, msg.playerid);
        } else {
          multiAttack(param1, param2);
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

  MultiAttack.checkInstall();
  MultiAttack.registerEventHandlers();

  log(`${MultiAttack.name} version ${MultiAttack.version} loaded`);

});
