# MultiAttack

Ce script MOD pour la fiche de personnage D&D5 de Roll20 permet d'automatiser les jets d'attaque d'une créature (PNJ) dotée de la capacité "Attaques multiples".

## Version courante

v1.0.0

## Utilisation

La syntaxe de base de ce MOD est la suivante

<kbd>!ma _characteid_ _no,...,no_</kbd>

Où <kbd>_characterid_</kbd> est l'id du personnage

Et <kbd>_no,...,no_</kbd> est une liste de numéros d'action dans la fiche de PNJ

En utilisant le champ du type de dégâts de la capacité _**Attaques multiples**_ de la fiche de PNJ pour lister les numéros des actions d'attaque, on peut utiliser la syntaxe suivante et l'enregistrer dans une macro :

<kbd>!ma @{selected|character_id} @{selected|repeating_npcaction_$0_attack_damagetype}</kbd>

## Configuration

La macro de lancement des attaques multiples peut être créé dans une partie en utilisant la commande suivante :

<kbd>!ma-macro _NomDeLaMacro_</kbd>

Une fois la macro créée, il est possible de la faire apparaître dans la barre de macro en bas de l'écran de jeu.

Sur la fiche de PNJ, on doit indiquer la liste des attaques à lancer dans le champ du type de dégâts (non utilisé) de l'action _Attaques multiples_ sous la forme d'une suite de numéros séparés par des virgules.

### Exemple

L'action "Attaque multiples" sur le statblock du Xorn indique :
"Le xorn fait trois attaques avec ses griffes et une attaque de morsure."

La seconde action du statblock est l'attaque de griffes et la troisième action est l'attaque de morsure.

Dans le champ du type de dommages de l'action "Attaque multiples", entrez 2,2,2,3

## Aide de jeu

Au premier lancement de la partie après installation du script, ce dernier crée une aide de jeu nommée <kbd>Mod-MultiAttack-Help</kbd> qui contient toutes les informations ci-dessus.

# Notes de version

## v1.0.0 (2023-11-18)

- Version initiale