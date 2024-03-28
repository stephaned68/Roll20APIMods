/**
 * @name GMNotes
 * @author stephaned68
 * @version 1.0.1
 * 
 * @description Displays token's GM notes or linked character avatar in chat
 */

var GMNotes =
  GMNotes ||
  (function () {

    /**
     * Constants
     */
    const modName = "GMNotes";
    const modVersion = "1.0.1";
    const modCommand = [ "!gmnote", "!gmnotes", "!avatar" ];

    /**
     * Send a non archived message to chat
     * @param {string} message 
     */
    const writeChat = function (message) {
      sendChat(
        `MOD:${modName}`,
        message,
        null, 
        { noarchive: true }
      );
    }

    /**
     * Retrieve properties that need asynchronous
     * @param {string} prop property to retrieve
     * @param {object} obj Roll20 object
     * @returns value of the requested property
     */
    const getBlob = function (prop,obj) {
      return new Promise((resolve, reject) => {
          obj.get(prop, (p) => {
              resolve(p);
          });
      });
    };

    /**
     * Decode a unicode blob
     * @param {string} str string to decode
     * @returns decoded string
     */
    const decodeUnicode = (str) =>
      str.replace(/%u[0-9a-fA-F]{2,4}/g, (m) =>
        String.fromCharCode(parseInt(m.slice(2), 16))
      );

    /**
     * Displays the avatar image for the selected token
     * @param {object} token selected token's object
     * @returns {void}
     * @summary
     * - Name is token's name or character's name
     * - Avatar is searched
     *   - As the avatar of the first handout link found in the character's bio
     *   - Or as the character's avatar if no handout link in the bio
     */
    const displayAvatar = async function (token) {
      
      const character = getObj("character", token.get("represents"));
      if (!character) return;
      
      let characterName = token.get("name");
      if (!characterName) characterName = character.get("name");

      let avatarSrc;

      const bio = await getBlob("bio", character);
      if (bio) { 
        let handoutId = (bio.split("\"http://journal.roll20.net/handout/")[1] || "").split("\"")[0];
        if (!handoutId) handoutId = (bio.split("\"https://journal.roll20.net/handout/")[1] || "").split("\"")[0];
        if (handoutId) {
          const handOut = getObj("handout", handoutId);
          avatarSrc = handOut.get("avatar");
        }
      }

      if (!avatarSrc) avatarSrc = character.get("avatar");

      if (!avatarSrc) return;

      writeChat(`/desc ${characterName} ${avatarSrc}`);

    }
    
    /**
     * Whispers token's GM notes to chat
     * @param {object} token selected token's object
     * @returns {void}
     */
    const whisperGMNotes = function (token) {
      
      let gmNotes = token.get("gmnotes");
      if (!gmNotes) return;

      gmNotes = decodeUnicode(gmNotes);
      gmNotes = unescape(gmNotes);

      writeChat(
        `/w gm <div style="width: calc(100% - 10px); padding: 5px; border: 1px solid #333; border-radius: 5px; background: white; box-shadow: 5px 5px 5px #333;">${gmNotes}</div>`
      );      
    }

    /**
     * Handle API message input in chat
     * @param {object} msg message object
     * @returns {void}
     */
    const handleInput = function (msg) {
      if (msg.type !== "api") return;

      const [ command ] = msg.content.split(" ");
      if (!command || !modCommand.includes(command)) return;

      const [ selected ] = msg.selected;

      if (!selected) {
        writeChat("Sélectionnez d'abord un token");
        return;
      }

      const token = getObj(selected._type, selected._id);

      if (command === "!avatar") {
        displayAvatar(token);
      }

      if (command.includes("gmnote")) {
        whisperGMNotes(token);
      }
    };

    return {
      name: modName,
      version: modVersion,
      handleInput,
    };
  })();

/**
 * Wire-up chat message event
 */
on("ready", function () {
  on("chat:message", GMNotes.handleInput);

  log(`Mod:${GMNotes.name} version ${GMNotes.version} running`);
});
