/**
 * @name TurnOrderManager
 * @author stephaned68
 * @version 1.2.0
 *
 * Script to simplify Turn Order Management, and move it into chat.
 * Commands:
 *
 * !tom-begin / !tom-start
 * Sort the Turn Counter numerically descending, and add a turn counter to the
 * top of the order
 *
 * !tom-clear
 * Clear the turn order. NOTE: THERE IS NO CONFIRMATION.
 * Add --close to close the Turn Order window
 *
 * !tom-down <n> [--<before|after> prefix] name
 * Add an item to the list that counts down from n. By default this is added
 * to the current end of the order. If --before or --after is provided, the
 * argument is used as a prefix search for a name to put the item before or
 * after.
 *
 * !tom-up <n> [--<before|after> prefix] name
 * Add an item to the list that counts up from n. By default this is added
 * to the current end of the order. If --before or --after is provided, the
 * argument is used as a prefix search for a name to put the item before or
 * after.
 *
 * !tom-clean
 * Remove all elements with a counter of 0.
 */

var TurnOrderManager =
  TurnOrderManager ||
  (() => {
    "use strict";

    const scriptName = "TurnOrderManager";
    const scriptVersion = "1.2.0";

    const COUNTER = {
      name: "ROUND",
      value: 1
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

    // Parse API command string
    const parseArgs = (msg) => {
      const params = msg.replace(/<br\/>/g, "").split(/\s+/);
      const command = params[0] || "";
      const args = {};
      params.splice(1).forEach(param => {
        const [ name, value ] = param.split("|");
        if (!name.startsWith("--"))
          return;
        args[name.substring(2)] = value || "";
      });
      return { command, args };
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

    // !tom-clear
    const handleClear = (msg, isGM, playerId) => {
      if (!isGM) {
        whisperToId(playerId, "Only the GM can clear turn data.");
        return;
      }
      const { args } = parseArgs(msg);
      const turns = Campaign().get("turnorder");
      setTurns([]);
      log(`${scriptName}: CLEARING: ${turns}`);
      if (turns !== "[]" && !Object.keys(args).includes("no-load"))
        whisperToId("GM", `Turns cleared. To restore, run <code>!tom-load ${turns}</code>`);
      if (Object.keys(args).includes("close"))
        Campaign().set("initiativepage", false);
    };

    // !tom-load
    const handleLoad = (msg, isGM, playerId) => {
      if (!isGM) {
        whisperToId(playerId, "Only the GM can load turn data.");
        return;
      }
      Campaign().set("turnorder", msg.split(/\s+/, 2)[1]);
    };

    // !tom-append
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

    // !tom-clean
    const handleClean = () => {
      let turns = getTurns();
      turns = _.filter(turns, (t) => t.pr <= 0);
      setTurns(turns);
    };

    // !tom-begin | !tom-start
    const handleBegin = (msg, isGM) => {
      if (!isGM) {
        whisperToId(playerId, "Only the GM can start the counter.");
        return;
      }

      const { args } = parseArgs(msg);

      let turns = getTurns();
      turns = _.filter(turns, (t) => t.custom !== COUNTER.name);
      turns = _.sortBy(turns, (t) => -t.pr);
      turns.unshift({ 
        id: "-1", 
        custom: args["counter-name"] || COUNTER.name, 
        pr: args["counter-value"] || COUNTER.value, 
        formula: "+1" }
      );

      setTurns(turns);
    };

    // !tom-up
    const handleUp = (msg, isGM, playerId) => {
      addWithFormula(msg, isGM, playerId, "+1");
    };

    // !tom-down
    const handleDown = (msg, isGM, playerId) => {
      addWithFormula(msg, isGM, playerId, "-1");
    };

    // !tom-remove | !tom-rm
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
      if (msg.type != "api" || !msg.content.startsWith("!tom-")) 
        return;
      const cmd = msg.content.split(/\s+/)[0].substring(5);
      if (cmd.toLowerCase() === "help") {
        const help = Object.keys(Object.fromEntries(handlers)).map(c => `!tom-${c}`).join(", ");
        whisperToId(msg.playerid, `Usage: ${help}`);
        return;
      }
      const handler = handlers.get(cmd) || "";
      if (handler !== "") {
        handler(msg.content, playerIsGM(msg.playerid), msg.playerid);
        return;
      }
      log(`${scriptName}: unknown cmd: ${cmd}`);
      whisperToId(msg.playerid, `Unknown command: ${cmd}`);
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