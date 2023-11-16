/**
 * @name ShowHandout
 * @author stephaned68
 * @version 1.0.0
 */

var ShowHandout =
ShowHandout ||
  (function () {
    
    const stateKey = "ShowHandout";
    const modName = `Mod:${stateKey}`;
    const modVersion = "1.0.0";
    const modCmd = "!show-handout";

    const gmOnly = '/w gm ';

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
    function stringOrDefault(value, onError = '') {
      return value || onError;
    }

    /**
     * Log a message to the debug console
     * @param {string} msg
     * @param {boolean} force
     */
    function sendLog(msg, force = true) {
      if (state[stateKey].logging || force) {
        if (typeof(msg) !== 'object') {
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
      helpMsg += `{{Macro name=${state[stateKey].macro}`;
      helpMsg += ` [Change](${modCmd} config --macro ?{Macro name})`;
      helpMsg += ' }}';
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
        case '--macro':
          let macroName = stringOrDefault(args[1]).replace(" ", "-");
          state[stateKey].macro = macroName;
          break;
        case '--logging':
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
        { command: "macro [filter]", description: "Create the helper macro with optional [filter]" }
      ];
      helpText.forEach((help) => {
        helpMsg += `{{${help.command}=${help.description} }}`;
      });
      
      sendChat(modName, helpMsg, null, {noarchive: true});
    }

    function findGMId() {
      const playerList = findObjs({
        type: 'player',
      });
      const gmInfo = playerList.filter(function (player) {
        return playerIsGM(player.id);
      });
      return gmInfo[0].get('_id');
    }

    function showHandoutMacro(args) {
      const macroName = state[stateKey].macro;
      const handoutFilter = args[0] || 'Handout:';
    
      const handouts = findObjs({
        _type: 'handout',
        inplayerjournals: '',
        archived: false,
      });
      let macroCmd = `${modCmd} ?{Handout?`;
      handouts.forEach((handout) => {
        const name = handout.get('name');
        if (handoutFilter === "" || name.indexOf(handoutFilter) == 0) {
          macroCmd += `|${name},${handout.get('_id')}`;
        }
      });
      macroCmd += '}';
    
      const macros = findObjs({
        _type: 'macro',
        name: macroName,
      });
      if (macros.length == 1) {
        macros[0].remove();
      }
    
      createObj('macro', {
        _playerid: findGMId(),
        name: macroName,
        action: macroCmd,
      });
    }

    /**
     * Display the show handout macro
     * @param {string[]} args handout id
     * @returns {void}
     */
    function showHandout(args) {
      if (args.length == 0) return;

      handoutId = args[0];
      handout = findObjs({
        _type: 'handout',
        _id: handoutId,
      })[0];
      if (!handout) return;

      handout.set('inplayerjournals', 'all');
      let name = handout.get('name');
      if (name.indexOf(':') !== -1) name = name.split(':')[1].trim();
      chatMsg = `[${name}](http://journal.roll20.net/handout/${handout.get(
        '_id'
      )})`;
      sendChat(modName, chatMsg);
    }

    /**
     * Process the MOD chat command
     * @param {string[]} args command line arguments
     */
    function processCmd(args) {

      const action = args[0] || "";
      // help command
      if (action.toLowerCase() === 'help') {
        displayHelp();
        return;
      }

      // config command
      if (action.toLowerCase() === 'config') {
        args.shift();
        configSetup(args);
        return;
      }

      // parse command line arguments starting with --
      // hydrate an options object
      // i.e. 
      // !xxx {{ --this|thisValue --that|thatValue }}
      // results in 
      // options = {
      //   this: thisValue
      //   that: thatValue
      // }
      const options = {};
      for (const argv of args) {
        if (argv.indexOf('--') == 0) {
          const argd = argv.slice(2).split('|');
          argd[1] = (argd[1] || 'true').toLowerCase() === 'true' ? true : argd[1];
          argd[1] = argd[1].toLowerCase() === 'false' ? false : argd[1];
          options[argd[0]] = argd[1];
        }
      }

      if (action.toLowerCase() === 'macro') {
        args.shift();
        showHandoutMacro(args);
      } else {
        showHandout(args);
      }

    }

    function migrateState() {

      // code here any changes to the state schema

      state[stateKey].version = modVersion;
    }

    const defaultState = {
      version: modVersion,
      macro: 'show-handout',
      logging: false,
    };

    function checkInstall() {
      
      if (!state[stateKey]) state[stateKey] = defaultState;

      sendChat(modName, gmOnly + `Type '${modCmd} help' for help on commands`, null, {noarchive: true});
      sendChat(modName, gmOnly + `Type '${modCmd} config' to configure the MOD script`, null, {noarchive: true});

      if (state[stateKey].version !== modVersion) {
        migrateState();
      }

      sendLog(state[stateKey], true);
    }

    function registerEventHandlers() {

      /**
       * Wire-up event for API chat message 
       */
      on('chat:message', function (msg) {
        // parse chat message
        // cmd : command entered
        // args[] : list of arguments
        const [cmd, ...args] = msg.content.replace(/<br\/>/g, '').split(/\s+/);
        if (args.length > 0) {
          if (args[0] === "{{") args.shift();
          if (args[args.length - 1]  === "}}") args.pop();
        }

        if (msg.type == 'api' && cmd.indexOf(modCmd) === 0) {
          processCmd(args);
        }
      });

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
on('ready', function () {

  ShowHandout.checkInstall();

  ShowHandout.registerEventHandlers();

  log(`${ShowHandout.name} version ${ShowHandout.version} loaded`);

});
