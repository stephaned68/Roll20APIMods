/**
 * @name TableRoller
 * @author stephaned68
 * @version 1.0.0
 */

var TableRoller =
  TableRoller ||
  (function () {
    const modName = "TableRoller";
    const modVersion = "1.0.0";
    const modCommand = "!tbr";

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

    const handleInput = function (msg) {
      if (msg.type !== "api") return;

      const backColor = getBackColor(msg.playerid);
      const titleColor = invertColor(backColor, true)

      let args = msg.content.split(" ");
      
      const command = args.shift();
      if (command !== modCommand) return;
      
      const rollTable = args.shift();
      if (!rollTable) {
        log("Missing rollable table name");
        return;
      }

      const title = args.join(" ") || rollTable;

      const rollableTable = findObjs(
        {
          _type: "rollabletable",
          name: rollTable,
        },
        { caseInsensitive: true }
      )[0];
      if (!rollableTable) {
        log(`Rollable table ${rollTable} not found`);
        return;
      }

      const rollTableItems = findObjs({
        _type: "tableitem",
        _rollabletableid: rollableTable.get("_id"),
      });
      if (rollTableItems.length === 0) {
        log(`No items found for table ${rollTable}`);
        return;
      }

      const rollItems = [];
      rollTableItems.forEach((item) => {
        const weight = item.get("weight");
        for (let e = 0; e < weight; e++) {
          rollItems.push(item.get("name"));
        }
      });

      const item = rollItems[randomInteger(rollItems.length) - 1];

      const htmlTemplate = `<div style="width: calc(100% - 10px); border: 1px solid #333; border-radius: 5px; background: white; box-shadow: 5px 5px 5px #333;">${
        `<span style="display: inline-block; width: 100%; border-radius: 5px 5px 0 0; text-align: center; background-color: ${backColor}; color:${titleColor};">${title}</span>`
      }${
        `<div style="padding: 5px;">${item}</div>`
      }</div>`; 

      sendChat(
        `MOD:${modName}`,
        htmlTemplate,
        null,
        { noarchive: true }
      );
    };

    return {
      name: modName,
      version: modVersion,
      handleInput,
    };
  })();

on("ready", function () {
  on("chat:message", TableRoller.handleInput);

  log(`${TableRoller.name} version ${TableRoller.version} loaded`);
});
