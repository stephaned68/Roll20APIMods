/**
 * @name Conditions
 * @author stephaned68
 * @version 1.2.0
 * 
 * @description Set condition marker on token and display description in chat
 * 
 * Requirements :
 * This set of token markers must be installed in the Roll20 game
 * https://drive.google.com/drive/folders/1p8PTqBHkgSrKVqqOyI2_kFcPmbgLcX72 
 * 
 * A handout named as 'Condition:{name}' is created for each condition
 * Where {name} is the name of a condition token marker
 */
on('ready', () => {

  const MOD_VERSION = "1.2.0";

  const MOD_NAME = "MOD:Conditions"

  const DIV_STYLE = [
    "width: calc(100% - 10px)",
    "border: 1px solid #333", 
    "border-radius: 5px",
    "background: white",
    "box-shadow: 5px 5px 5px #333",
    "padding: 5px"
  ].join("; ");

  const MACRO_NAME = "MOD-Conditions";

  const CONDITION_QUERY = [
    "?{Condition ?",
    "Agrippé,Grappled",
    "Assourdi,Deafened",
    "Au sol,Prone",
    "Aveuglé,Blinded",
    "Charmé,Charmed",
    "Effrayé,Frightened",
    "Empoisonné,Poisoned",
    "Entravé,Restrained",
    "Epuisé,Exhausted",
    "Etourdi,Stunned",
    "Incapacité,Incapacited",
    "Invisible,Invisible",
    "Paralysé,Paralysed",
    "Pétrifié,Petrified"
  ].join("|")+"}";

  const CONDITIONS_HANDOUTS = [
    {
      name: "Blinded",
      title: "Aveuglé-e",
      effects: [
        "Une créature aveuglée ne voit pas et rate automatiquement tout jet de caractéristique qui nécessite la vue.",
        "Les jets d'attaque contre la créature ont un avantage, et les jets d'attaque de la créature ont un désavantage."
      ]
    },
    {
      name: "Charmed",
      title: "Charmé-e",
      effects: [
        "Une créature charmée ne peut pas attaquer le charmeur ou le cibler avec des capacités ou des effets magiques nuisibles.",
        "Le charmeur a un avantage à ses jets de caractéristique pour interagir socialement avec la créature.",
      ]
    },
    {
      name: "Deafened",
      title: "Assourdi-e",
      effects: [
        "Une créature assourdie n'entend pas et rate automatiquement tout jet de caractéristique qui nécessite l’ouïe.",
      ]
    },
    {
      name: "Frightened",
      title: "Effrayé-e",
      effects: [
        "Une créature effrayée a un désavantage aux jets de caractéristique et aux jets d'attaque tant que la source de sa peur est dans sa ligne de vue.",
        "La créature ne peut se rapprocher volontairement de la source de sa peur.",
      ]
    },
    {
      name: "Grappled",
      title: "Agrippé-e",
      effects: [
        "La vitesse d'une créature agrippée passe à 0, et elle ne peut bénéficier d'aucun bonus à sa vitesse.",
        "L'état prend fin si la créature qui agrippe est incapable d'agir (voir l'état).",
        "L'état se termine également si un effet met la créature agrippée hors de portée de la créature ou de l'effet qui l'agrippe, comme par exemple lorsqu'une créature est projetée par le sort vague tonnante.",
      ]
    },
    {
      name: "Incapacited",
      title: "Neutralisé-e",
      effects: [
        "Une créature incapable d'agir ne peut effectuer aucune action ni aucune réaction.",
      ]
    },
    {
      name: "Invisible",
      title: "Invisible",
      effects: [
        "Une créature invisible ne peut être vue sans l'aide de la magie ou un sens particulier. En ce qui concerne le fait de se cacher, la créature est considérée dans une zone à visibilité nulle. L'emplacement de la créature peut être détecté par un bruit qu'elle fait ou par les traces qu'elle laisse.",
        "Les jets d'attaque contre la créature ont un désavantage, et les jets d'attaque de la créature ont un avantage.",
      ]
    },
    {
      name: "Paralyzed",
      title: "Paralysé-e",
      effects: [
        "Une créature paralysée est incapable d'agir (voir l'état) et ne peut plus bouger ni parler.",
        "La créature rate automatiquement ses jets de sauvegarde de Force et de Dextérité.",
        "Les jets d'attaque contre la créature ont un avantage.",
        "Toute attaque qui touche la créature est un coup critique si l'attaquant est à 1,50 mètre ou moins de la créature.",
      ]
    },
    {
      name: "Petrified",
      title: "Pétrifié-e",
      effects: [
        "Une créature pétrifiée est transformée, ainsi que tout objet non magique qu'elle porte, en une substance inanimée solide (généralement en pierre). Son poids est multiplié par dix et son vieillissement cesse.",
        "La créature est incapable d'agir (voir l'état), ne peut plus bouger ni parler, et n'est plus consciente de ce qui se passe autour d'elle.",
        "Les jets d'attaque contre la créature ont un avantage.",
        "La créature rate automatiquement ses jets de sauvegarde de Force et de Dextérité.",
        "La créature obtient la résistance contre tous les types de dégâts.",
        "La créature est immunisée contre le poison et la maladie, mais un poison ou une maladie déjà dans son organisme est seulement suspendu, pas neutralisé.",
      ]
    },
    {
      name: "Poisoned",
      title: "Empoisonné-e",
      effects: [
        "Une créature empoisonnée a un désavantage aux jets d'attaque et aux jets de caractéristique.",
      ]
    },
    {
      name: "Prone",
      title: "Au sol",
      effects: [
        "La seule option de mouvement possible pour une créature à terre est de ramper, à moins qu'elle ne se relève et mette alors un terme à son état.",
        "La créature a un désavantage aux jets d'attaque.", 
        "Un jet d'attaque contre la créature a un avantage si l'attaquant est à 1,50 mètre ou moins de la créature. Sinon, le jet d'attaque a un désavantage.",
      ]
    },
    {
      name: "Restrained",
      title: "Entravé-e",
      effects: [
        "La vitesse d'une créature entravée passe à 0, et elle ne peut bénéficier d'aucun bonus à sa vitesse.",
        "Les jets d'attaque contre la créature ont un avantage, et les jets d'attaque de la créature ont un désavantage.",
        "La créature a un désavantage à ses jets de sauvegarde de Dextérité.",
      ]
    },
    {
      name: "Stunned",
      title: "Etourdi-e",
      effects: [
        "Une créature étourdie est incapable d'agir (voir l'état), ne peut plus bouger et parle de manière hésitante.",
        "La créature rate automatiquement ses jets de sauvegarde de Force et de Dextérité.",
        "Les jets d'attaque contre la créature ont un avantage.",
      ]
    },
    {
      name: "Unconscious",
      title: "Inconscient",
      effects: [
        "Une créature inconsciente est incapable d'agir (voir l'état), ne peut plus bouger ni parler, et n'est plus consciente de ce qui se passe autour d'elle.",
        "La créature lâche ce qu'elle tenait et tombe à terre.",
        "La créature rate automatiquement ses jets de sauvegarde de Force et de Dextérité.",
        "Les jets d'attaque contre la créature ont un avantage.",
        "Toute attaque qui touche la créature est un coup critique si l'attaquant est à 1,50 mètre ou moins de la créature.",
      ]
    },
  ];

  const MACRO_ACTION = [
    `!token-mod --set statusmarkers|${CONDITION_QUERY}`,
    `!condition ${CONDITION_QUERY}`
  ].join("\n");

  /**
   * Display condition description from handout
   * @param {string} name - Condition marker name
   * @returns {void}
   */
  const displayCondition = function(name) {
    const [ handout ] = findObjs({ 
      _type: "handout", 
      name: `Condition:${name}` 
    });
    if (!handout) return;
    handout.get("notes", (blob) => {
      sendChat(
        MOD_NAME,
        `<div style="${DIV_STYLE};">${blob}</div>`,
        null,
        { noarchive: true }
      );
    });
  };

  /**
   * Detect new condition added to token
   * @param {object} token - Roll20 token object
   * @param {object} prior - Prior state of token object
   * @returns {void}
   */
  const conditionAdded = function(token, prior) {
    const priorMarkers = prior.statusmarkers
                              .split(",")
                              .map(m => m.split(":")[0]);
    token.get("statusmarkers").split(",").forEach(marker => {
      const [ name ] = marker.split(":");
      if (priorMarkers.includes(name)) return;
      displayCondition(name);
    });
  };

  /**
   * Install MOD macro
   * @param {string} playerId - Roll20 player id
   * @returns {void}
   */
  const installMOD = function(playerId) {
    let [ macro ] = findObjs({ _type: "macro", name: MACRO_NAME });
    if (!macro) {
      macro = createObj("macro", {
        _playerid: playerId,
        name: MACRO_NAME,
        visibleto: "all"
      });
    }
    if (!macro) {
      log(`Cannot create macro ${MACRO_NAME}`);
      return;
    }
    macro.set("action", MACRO_ACTION);    
  };

  /**
   * Create/Update Conditions handouts
   */
  const updateHandouts = function() {
    CONDITIONS_HANDOUTS.forEach(handoutData => {
      const name = `Condition:${handoutData.name}`;
      let [ handout ] = findObjs({ _type: "handout", name });
      if (!handout) {
        handout = createObj("handout", {
          name,
          inplayerjournals: "all"
        });
      }
      if (!handout) {
        log(`Cannot create handout ${name}`);
        return;
      }
      handout.get("notes", function(currNotes) {
        const notes = `
        <p style="font-family: 'proxima nova'"><strong>${ handoutData.title } [${ handoutData.name }]</strong></p>
        <ul>
        ${ handoutData.effects.map(effect => `<li>${ effect }</li>`).join("") }
        </ul>
        `;
        if (notes !== currNotes) 
          handout.set("notes", notes);
      });
    });
  };
  
  /**
   * Wire-up change of token markers event
   */
  on(`change:token:statusmarkers`, function (t, p) {
    conditionAdded(t, p);
  });

  /**
   * Wire-up change of HP value event (bloodied message)
   */
  on('change:attribute', function (attribute) {
    if (attribute._type !== "attribute" && attribute.get("name") !== "hp") return;

    const currentHP = parseInt(attribute.get("current")) || 0;
    const maxHP = parseInt(attribute.get("max")) || 0;
    if (maxHP === 0 || currentHP === 0) return;

    if (currentHP <= Math.floor(maxHP / 2)) {
      const charId = attribute.get("_characterid");
      if (!charId) return;
      const [ character ] = findObjs({ 
        _type: "character", 
        _id: charId
      });
      if (!character) return;
      sendChat(
        MOD_NAME,
        `<div style="${DIV_STYLE};">${character.get("name")} est <strong>en sang</strong></div>`,
        null,
        { noarchive: true }
      );
    }
  });

  /**
   * Wire-up chat message event
   */
  on("chat:message", function (m) {
    if (m.type === "api") {
      const [ command, argument ] = m.content.split(" ");
      if (command === "!condition ") {
        if (argument) 
          displayCondition(argument);
      }
      const hasTokenMod = typeof TokenMod === "object";
      if (command === "!conditions") {
        updateHandouts();
        if (hasTokenMod) {
          installMOD(m.playerid);
        } else {
          sendChat(
            MOD_NAME,
            "/w gm token-mod MOD script is not installed",
            null,
            { noarchive: true }
          );       
        }
      }
    }
  });

  log(`${MOD_NAME} v${MOD_VERSION} running - Use !conditions command to install or update handouts`);
});