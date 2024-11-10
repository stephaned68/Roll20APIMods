/**
 * @name Inspiration
 * @author stephaned68
 * @version 1.0.0
 * 
 * @description Set/Unset Inspiration marker on token and display message in chat
 */

on('ready', function () {

  const MOD_VERSION = "1.0.0";

  const MOD_NAME = "MOD:Inspiration";

  const MOD_MARKER = "three-leaves";

  /**
   * Return Inspiration marker tag
   * @param {string} markerName - Name of marker to find
   * @returns {string}
   */
  const getMarker = (markerName) => {
    const statusMarkers = JSON.parse(Campaign().get("token_markers"));
    const [ marker ] = statusMarkers.filter(m => m.name === markerName);
    if (!marker) 
      return null;
    return marker.tag;
  };

  /**
   * Add or remove the Inspiration marker on the token 
   * @param {object} token - Roll20 token object
   * @param {boolean} hasInspiration - Inspiration flag
   * @returns {void}
   */
  const changeTokenMarkers = (token, hasInspiration) => {
    const inspirationMarker = getMarker(MOD_MARKER);
    if (!inspirationMarker) 
      return;

    let markers = token.get("statusmarkers").split(",").filter(m => m !== "");
    if (hasInspiration) {
      if (!markers.includes(inspirationMarker))
        markers.push(inspirationMarker);
    } else {
      if (markers.includes(inspirationMarker))
        markers = markers.filter(m => m !== inspirationMarker);
    }
    token.set("statusmarkers", markers.join(","));
  };

  /**
   * Output message to chat
   * @param {object} character - Roll20 character object
   * @param {object} token - Roll20 token object
   * @returns {void}
   */
  const output = (character, token) => {
    const charName = character.get("name") || token.get("name") || "";
    sendChat(
      MOD_NAME,
      `**${ charName }** a l'Inspiration Héroïque et peut bénéficier d'un **avantage** sur un jet de d20`,
      null,
      { noarchive: true }
    );
  };

  /**
   * Process attribute change
   * @param {object} attr - Roll20 attribute object
   * @returns {void}
   */
  const processAttributeChange = (attr) => {
    if (attr.get("name") !== "inspiration") 
      return;

    const charId = attr.get("_characterid");
    if (!charId) 
      return;
    
    const hasInspiration = attr.get("current") === "on" ? true : false;

    const currentPageId = Campaign().get("playerpageid");

    const [ token ] = findObjs({
      _type: "graphic",
      _subtype: "token",
      _pageid: currentPageId,
      represents: charId
    });
    
    if (token) 
      changeTokenMarkers(token, hasInspiration);

    if (hasInspiration) {
      const [ character ] = findObjs({ _id: charId, type: "character" });
      output(character, token);
    }
  };

  /**
   * Process token marker change
   * @param {object} token - Roll20 token object
   * @returns {void}
   */
  const processMarkerChange = (token) => {
    const charId = token.get("represents");
    if (!charId) 
      return;

    const inspirationMarker = getMarker(MOD_MARKER);
    if (!inspirationMarker) 
      return;
    
    const [ character ] = findObjs({ _id: charId, type: "character" });
    if (!character) 
      return;

    const [ attribute ] = findObjs({
      _type: "attribute",
      _characterid: charId,
      name: "inspiration"
    });
    if (!attribute) 
      return;

    const hasInspiration = token.get("statusmarkers").split(",").includes(inspirationMarker);
    attribute.set("current", hasInspiration ? "on" : "0");

    if (hasInspiration) 
      output(character, token);
  };

  /**
   * Wire-up change attribute event
   */
  on("change:attribute", processAttributeChange);

  /**
   * Wire-up change token markers event
   */
  on("change:token:statusmarkers", processMarkerChange);
  
  /**
   * Wire-up TokenMod event observer
   */
  if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange) {
    TokenMod.ObserveTokenChange(processMarkerChange);
  }
  
  log(`${MOD_NAME} v${MOD_VERSION} running`);

});