# MultiAttack

Ce script MOD pour la fiche de personnage D&D 5e de Roll20 permet d'automatiser les jets d'attaque d'une créature (PNJ) dotée de la capacité "Attaques multiples".

## Version courante

v2.0.0

## Utilisation

La syntaxe de base de ce MOD est la suivante

<kbd>!ma _characterid_ _nom*nombre,...,nom*nombre_</kbd>

Où <kbd>_characterid_</kbd> est l'id du personnage

Et <kbd>_nom*nombre,...,nom*nombre_</kbd> est la liste des actions d'attaque à envoyer dans le chat

En utilisant le champ du type de dégâts de la capacité _**Attaques multiples**_ de la fiche de PNJ pour lister les actions d'attaque, on peut utiliser la syntaxe suivante et l'enregistrer dans une macro :

<kbd>!ma @{selected|character_id} @{selected|repeating_npcaction_$0_attack_damagetype}</kbd>

## Configuration

La macro de lancement des attaques multiples peut être créé dans une partie en utilisant la commande suivante :

<kbd>!ma-macro _NomDeLaMacro_</kbd>

Une fois la macro créée, il est possible de la faire apparaître dans la barre de macro en bas de l'écran de jeu.

Sur la fiche de PNJ, on doit indiquer la liste des attaques à lancer dans le champ du type de dégâts (non utilisé) de l'action _Attaques multiples_ sous la forme d'une suite de commandes d'attaques séparées par des virgules.

Chaque commande d'attaque est exprimée sous la forme <kbd>nom*nombre</kbd>, où <kbd>nom</kbd> est le nom d'une action d'attaque. Ce nom peut être partiel mais il doit être suffisamment unique pour être identifié par le script.

### Exemple

L'action "Attaque multiples" sur le statblock du Xorn indique :
"Le xorn fait trois attaques avec ses griffes et une attaque de morsure."

La seconde action du statblock est l'attaque de griffes et la troisième action est l'attaque de morsure.

Dans le champ du type de dommages de l'action "Attaque multiples", entrez <kbd>griffes*3,morsure</kbd>

## Aide de jeu

Au premier lancement de la partie après installation du script, ce dernier crée une aide de jeu nommée <kbd>Mod-MultiAttack-Help</kbd> qui contient toutes les informations ci-dessus.

# Notes de version

## v2.0.0 (2024-03-03)

Changement de la syntaxe pour les commandes d'attaque

Le champ du type de dommages de l'action "Attaque multiples" doit être configuré comme une liste séparées par des virgules de commandes `nom*nombre`

Où 
- `nom` est un nom éventuellement partiel mais suffisamment unique pour que le script trouve l'action d'attaque correspondante
- `nombre` est le nombre d'attaques de ce type que la créature effectue

Ce nouveau format rend la configuration des blocs-stats plus simple

Il permet également de résoudre les cas où les actions ont été déplacées dans la liste et que les indexs \_$n\_ dans la section répétable ne correspondent plus à la séquence d'affichage

## v1.0.0 (2023-11-18)

- Version initiale