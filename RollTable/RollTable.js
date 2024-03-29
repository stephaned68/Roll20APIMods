/**
 * @name TableRoller
 * @author stephaned68
 * @version 1.0.0
 * 
 * Throw on a rollable table and display pretty result in chat
 */

var TableRoller =
  TableRoller ||
  (function () {
    
    const MOD_NAME = "TableRoller";
    const MOD_VERSION = "1.0.0";
    const MOD_COMMAND = "!tbr";

    /**
     * Return player's color
     * @param {string} playerId player id
     * @returns {string} color value in hex format (#rrggbb)
     */
    const getBackColor = function (playerId) {
      const [ player ] = findObjs({
        _type: "player",
        _id: playerId
      });
      if (player && player.color !== "transparent") return player.get("color");
    }

    /**
     * Reverse a color for optimal contrast
     * @param {string} hexColor hexadecimal color value
     * @param {boolean} blackOrWhite return black or white
     * @returns {string}
     */
    const invertColor = function (hexColor, blackOrWhite) {
      if (!hexColor) return;

      if (hexColor.indexOf('#') === 0) {
          hexColor = hexColor.slice(1);
      }
      // convert 3-digit hex to 6-digits
      if (hexColor.length === 3) {
          hexColor = hexColor[0] + hexColor[0] + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2];
      }
      if (hexColor.length !== 6) {
          log('Invalid HEX color');
          return "";
      }
      let r = parseInt(hexColor.slice(0, 2), 16),
          g = parseInt(hexColor.slice(2, 4), 16),
          b = parseInt(hexColor.slice(4, 6), 16);

      if (blackOrWhite) {
          // https://stackoverflow.com/a/3943023/112731
          return (r * 0.299 + g * 0.587 + b * 0.114) > 186
              ? '#000000'
              : '#FFFFFF';
      }
      // invert color components
      r = (255 - r).toString(16);
      g = (255 - g).toString(16);
      b = (255 - b).toString(16);
      // pad each with zeros and return
      return "#" + ("0" + r).slice(-2) + ("0" + g).slice(-2) + ("0" + b).slice(-2);
    }

    /**
     * Return player's colors
     * @param {string} playerId Player's id
     * @returns {object} backround and text colors
     */
    const playerColors = function (playerId) {
      const background = getBackColor(playerId);
      return {
        background,
        text: invertColor(background, true)
      };
    }

    /**
     * Pick a random item on a rollable table
     * @param {string} tableName Rollable table name
     * @returns {string} result of the roll
     */
    const pickItem = function (tableName) {
      const rollableTable = findObjs(
        {
          _type: "rollabletable",
          name: tableName,
        },
        { caseInsensitive: true }
      )[0];
      if (!rollableTable) {
        log(`Rollable table ${tableName} not found`);
        return "";
      }

      const rollTableItems = findObjs({
        _type: "tableitem",
        _rollabletableid: rollableTable.get("_id"),
      });
      if (rollTableItems.length === 0) {
        log(`No items found for table ${tableName}`);
        return "";
      }

      const rollItems = [];
      rollTableItems.forEach((item) => {
        const weight = item.get("weight");
        for (let e = 0; e < weight; e++) {
          rollItems.push(item.get("name"));
        }
      });

      return rollItems[randomInteger(rollItems.length) - 1];
    }

    /**
     * Handle chat input
     * @param {object} msg Chat message object
     * @returns {void}
     */
    const handleInput = function (msg) {
      if (msg.type !== "api") return;

      const [ command, rollTable, ...args ] = msg.content.split(" ");
      
      if (command !== MOD_COMMAND) return;
      if (!rollTable) {
        log("Missing rollable table name");
        return;
      }

      const colors = playerColors(msg.playerid);
      const title = args.join(" ") || rollTable;

      const result = pickItem(rollTable);
      if (!result) return;

      const htmlTemplate = `<div style="width: calc(100% - 10px); border: 1px solid #333; border-radius: 5px; background: white; box-shadow: 5px 5px 5px #333;">${
        `<span style="display: inline-block; width: 100%; border-radius: 5px 5px 0 0; text-align: center; background-color: ${ colors.background }; color:${ colors.text };">${title}</span>`
      }${
        `<div style="padding: 5px;">${result}</div>`
      }</div>`; 

      sendChat(
        `MOD:${MOD_NAME}`,
        htmlTemplate,
        null,
        { noarchive: true }
      );
    };

    return {
      name: MOD_NAME,
      version: MOD_VERSION,
      pickItem,
      handleInput,
    };
  })();

on("ready", function () {
  on("chat:message", TableRoller.handleInput);

  log(`Mod:${TableRoller.name} version ${TableRoller.version} running`);
});
