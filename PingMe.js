/**
 * @name PingMe
 * @author stephaned68
 * @version 1.0.0
 * 
 * Usage :
 * - !pingme      pings the token who's name is included in the player's name
 *                  or the token controlled by the player
 *                  or the first token if player controls more than one
 * - !pingme all  displays a chat menu of all tokens controlled by the user
 * - !pingme {id} pings the token identified by {id}
 */

on('ready', function () {

  const MOD_COMMAND = "!pingme";

  /**
   * @returns {string} Id of current page
   */
  const currentPage = () => Campaign().get("playerpageid");

  /**
   * Return the list of tokens on the page
   * @returns {object[]}
   */
  const findPageTokens = function() {
    return findObjs({
      _type: "graphic",
      _subtype: "token",
      _pageid: currentPage(),
    });
  }

  /**
   * Find the token which name matches the player name
   * @param {string} playerName 
   * @returns {object}
   */
  const findTokenByName = function(playerName) {    
    const [ playerToken ] = findPageTokens().filter(token => {
      const tokenName = token.get("name");
      if (playerName.toLowerCase().includes(tokenName.toLowerCase())) {
        return true;
      }
    });
    return playerToken;
  }

  /**
   * Display a chat menu with all tokens controlled by player
   * @param {string} playerId 
   * @param {string} playerName 
   * @param {boolean} forceMenu
   * @returns {void}
   */
  const findTokens = function(playerId, playerName, forceMenu) {
    const chatMsg = [];
    let firstToken;
    findPageTokens().forEach(token => {
      const characterId = token.get("represents");
      if (!characterId) return;
      const character = getObj("character", characterId);
      if (!character) return;
      const controlledBy = character.get("controlledby").split(",");
      if (controlledBy.includes("all") || controlledBy.includes(playerId)) {
        const tokenId = token.get("_id");
        if (!firstToken) firstToken = tokenId;
        chatMsg.push(`[${ character.get("name") }](!pingme ${ tokenId })`)
      }
    });
    if (chatMsg.length > 0) {
      if (!forceMenu) {
        return firstToken;
      }
      sendChat(
        "Mod:PingMe",
        `/w "${playerName}" ${ chatMsg.join(" ") }`,
        null,
        { noarchive: true }
      );
    }
  }

  /**
   * Ping the token found for player or clicked on the chat menu
   * @param {string} playerId
   * @param {string} tokenId
   * @returns {void}
   */
  const pingMe = function(playerId, tokenId) {
    const player = getObj("player", playerId);
    const playerName = player.get("_displayname");

    let playerToken;
    if (tokenId && tokenId !== "all") {
      playerToken = getObj("graphic", tokenId);
    }
    if (!playerToken) {
      playerToken = findTokenByName(playerName);
    }
    if (!playerToken) {
      const forceMenu = tokenId && tokenId.toLowerCase() === "all";
      tokenId = findTokens(playerId, playerName, forceMenu);
      if (!tokenId) return;
      playerToken = getObj("graphic", tokenId);
    }
    
    sendPing(
      playerToken.get("left"),
      playerToken.get("top"),
      currentPage(),
      playerId,
      true,
      playerId
    );
  }

  /**
   * Handle chat message input
   * @param {object} msg - Roll20 chat message object
   */
  const handleInput = function (msg) {
    const [ command, tokenId ] = msg.content.replace(/<br\/>/g, "").split(/\s+/);
    if (msg.type === "api" && command === MOD_COMMAND) {
      const playerId = msg.playerid;
      pingMe(playerId, tokenId);
    }
  }

  /**
   * Wire-up message event
   */
  on("chat:message", handleInput);

});