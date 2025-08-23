/**
 * @name TurnOrderManager
 * @author stephaned68
 * @version 1.0.0
 *
 * Script to simplify Turn Order Management, and move it into chat.
 * Commands:
 *
 * !to-begin / !to-start
 * Sort the Turn Counter numerically descending, and add a turn counter to the
 * top of the order
 *
 * !to-clear
 * Clear the turn order. NOTE: THERE IS NO CONFIRMATION.
 *
 * !to-down <n> [--<before|after> prefix] name
 * Add an item to the list that counts down from n. By default this is added
 * to the current end of the order. If --before or --after is provided, the
 * argument is used as a prefix search for a name to put the item before or
 * after.
 *
 * !to-up <n> [--<before|after> prefix] name
 * Add an item to the list that counts up from n. By default this is added
 * to the current end of the order. If --before or --after is provided, the
 * argument is used as a prefix search for a name to put the item before or
 * after.
 *
 * !to-clean
 * Remove all elements with a counter of 0.
 */

var TurnOrderManager =
  TurnOrderManager ||
  (() => {
    "use strict";

    const scriptName = "TurnOrderManager";
    const scriptVersion = "1.0.0";

    const COUNTER = {
      name: "ROUND",
      value: 101
    };

    // Get turn order object
    const getTurns = () => {
      let turns = Campaign().get("turnorder");
      try {
        turns = JSON.parse(turns);
      } catch (error) {
        turns = [];
      }
      
      turns.forEach(t => t.pr = parseFloat(t.pr) || 0);
      
      return turns;
    };

    // Update turn order
    const setTurns = (turns) => {
      Campaign().set("turnorder", JSON.stringify(turns));
    };

    // Get player name
    const playerName = (playerId) => {
      const player = getObj("player", playerId);
      if (!player) 
        return playerId;
      return player.get("_displayname");
    };

    // Whisper message to chat
    const whisperToId = (id, msg) => {
      const name = id === "GM" ? id : playerName(id);
      if (!name) 
        return;
      sendChat(scriptName, `/w "${name}" ${msg}`, null, { noarchive: true });
    };

    // Get item name
    const itemName = (item) => {
      if (item.id === "-1") 
        return item.custom;
      const g = getObj("graphic", item.id);
      if (!g) 
        return null;
      const name = g.get("name");
      if (name) 
        return name;
      const char = getObj("character", g.get("represents"));
      if (!char) 
        return null;
      return char.get("name");
    };

    // Find item index by prefix in name
    const findPrefixIndex = (turns, prefix) => {
      turns.findIndex((t) => {
        const name = itemName(t);
        if (!name)
          return false;
        return name.toLowerCase().startsWith(prefix);
      });
    }

    // Add an entry
    const addWithFormula = (msg, isGM, playerId, formula) => {
      const parts = msg.split(/\s+/);
      parts.shift();
      const newItem = { id: "-1", pr: parseFloat(parts.shift()), formula };
      if (!isGM) 
        newItem.p = true;

      let position = null;
      let search = null;
      if (parts[0].startsWith("--")) {
        position = parts.shift().substring(2);
        search = parts.shift().toLowerCase();
      }
      newItem.custom = parts.join(" ");

      let turns = getTurns();
      let i = null;

      if (search) {
        i = findPrefixIndex(turns, search);
        if (i == -1) {
          i = null;
          whisperToId(playerId, `could not find item prefix “${search}”. Putting “${newItem.custom}” at the end.`);
        } else if (position === "after") i++;
      }

      if (i !== null) 
        turns.splice(i, 0, newItem);
      else 
        turns.push(newItem);

      setTurns(turns);

      if (!isGM) {
        const name = playerName(playerId) || "";
        let pos = "";
        if (i !== null) 
          pos = ` in position ${i + 1}`;
        whisperToId("GM", `Player (${name}) added turn item “${newItem.custom}${pos}”`);
      }
    };

    // !to-clear
    const handleClear = (msg, isGM, playerId) => {
      if (!isGM) {
        whisperToId(playerId, "Only the GM can clear turn data.");
        return;
      }
      const turns = Campaign().get("turnorder");
      setTurns([]);
      log(`${scriptName}: CLEARING: ${turns}`);
      whisperToId("GM", `Turns cleared. To restore, run <code>!to-load ${turns}</code>`);
    };

    // !to-load
    const handleLoad = (msg, isGM, playerId) => {
      if (!isGM) {
        whisperToId(playerId, "Only the GM can load turn data.");
        return;
      }
      Campaign().set("turnorder", msg.split(/\s+/, 2)[1]);
    };

    // !to-append
    const handleAppend = (msg, isGM, playerId) => {
      if (!isGM) {
        whisperToId(playerId, "Only the GM can append turn data.");
        return;
      }

      try {
        const data = JSON.parse(msg.split(/\s+/, 2)[1]);
        turns = getTurns();
        setTurns(turns.concat(data));
      } catch (e) {
        whisperToId(playerId, `ERROR appending data: '${e.message}'`);
      }
    };

    // !to-clean
    const handleClean = () => {
      let turns = getTurns();
      turns = _.filter(turns, (t) => t.pr <= 0);
      setTurns(turns);
    };

    // !to-begin | !to-start
    const handleBegin = (msg, isGM) => {
      if (!isGM) {
        whisperToId(playerId, "Only the GM can start the counter.");
        return;
      }

      let turns = getTurns();
      turns = _.filter(turns, (t) => t.custom !== COUNTER.name);
      turns = _.sortBy(turns, (t) => -t.pr);
      turns.unshift({ 
        id: "-1", 
        custom: COUNTER.name, 
        pr: COUNTER.value, 
        formula: "+1" }
      );

      setTurns(turns);
    };

    // !to-up
    const handleUp = (msg, isGM, playerId) => {
      addWithFormula(msg, isGM, playerId, "+1");
    };

    // !to-down
    const handleDown = (msg, isGM, playerId) => {
      addWithFormula(msg, isGM, playerId, "-1");
    };

    // !to-remove | !to-rm
    const handleRemove = (msg, isGM, playerId) => {
      const parts = msg.split(/\s+/, 2);
      const prefix = parts[1];
      if (!prefix) {
        whisperToId(playerId, `missing item to remove!`);
        return;
      }

      const turns = getTurns();
      const i = findPrefixIndex(turns, prefix);
      if (i === -1) {
        whisperToId(playerId, `Cannot find prefix “${prefix}” to remove.`);
        return;
      }

      if (isGM || turns[i].p) {
        turns.splice(i, 1);
        setTurns(turns);
        return;
      }
      const name = itemName(turns[i]) || "that item";
      whisperToId(playerId, `You do not have permission to remove ${name}. Please ask the GM to do it.`);
    };

    // Handlers Map
    const handlers = new Map([
      [ "clear", handleClear ],
      [ "load", handleLoad ],
      [ "append", handleAppend ],
      [ "clean", handleClean ],
      [ "begin", handleBegin ],
      [ "up", handleUp ],
      [ "down", handleDown ],
      [ "remove", handleRemove ],
      [ "start", handleBegin ],
      [ "rm", handleRemove ],
    ]);

    // Handle API messages
    const handleMessage = (msg) => {
      if (msg.type != "api" || !msg.content.startsWith("!to-")) 
        return;
      const cmd = msg.content.split(/\s+/)[0].substring(4);
      const handler = handlers.get(cmd) || "";
      if (handler !== "") {
        handler(msg.content, playerIsGM(msg.playerid), msg.playerid);
        return;
      }
      log(`${scriptName}: unknown cmd: ${cmd}`);
      whisperToId(playerId, `Unknown command: ${cmd}`);
    };

    // Register chat message handler
    const registerHandlers = () => {
      on("chat:message", handleMessage);
    };

    // Log script startup
    const notifyStart = () => {
      log(`${scriptName} ${scriptVersion} Loading.`);
    };

    return {
      notifyStart: notifyStart,
      registerHandlers: registerHandlers,
    };
  })();

// Start script
on("ready", () => {
  "use strict";

  TurnOrderManager.notifyStart();

  TurnOrderManager.registerHandlers();
});