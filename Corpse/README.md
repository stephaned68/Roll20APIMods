# Corpse

Un script MOD pour Roll20 permettant de détecter la valeur de la barre de vie / santé d'un token et :
- si elle tombe à la moitié du maximum, de lui appliquer une teinte de fond rouge
- si elle tombe à 0, de lui appliquer un marker "Mort" ainsi qu'optionnellement jouer un FX et l'_enfouir_ 

_Enfouir_ un token consiste à lui appliquer une teinte noire et à le déplacer sur la couche de la carte.

## Version courante

v1.3.0

# Utilisation

<kbd>!corpse</kbd> : Affiche le menu de configuration du script MOD

Les paramètres suivants peuvent être changés :
- No de la barre de santé (par défaut : <kbd>1</kbd>)
- Token Marker "Mort" à appliquer quand la valeur de la barre de santé tombe à 0 ou moins (par défaut : <kbd>dead</kbd>)
- Changer la teinte : Oui (par défaut) / Non ; une teinte de fond rouge est appliquée au jeton quand la valeur de la barre de santé tombe à la moitié de la valeur maximum
- Enfouir le jeton : Oui (par défaut) / Non ; cette action ne se produit que pour les mooks (PNJ dont la barre de vie n'est liée à aucun attribut)
- FX "Mort" à appliquer quand la valeur de la barre de santé tombe à 0 ou moins (par défaut : <kbd>bomb-blood</kbd>)

# Notes de version

## v1.3.0 (2026-01-19)

- Ajout d'un FX configurable à jouer lorsque la barre de santé tombe à 0.

## v1.2.0 (2025-09-08)

Nouvelles commandes :
- <kbd>!corpse bury|--sel</kbd> : Force l'enfouissement du ou des tokens sélectionnés.
- <kbd>!corpse bury|--dead</kbd> : Force l'enfouissement de tous les tokens affectés du marker "Mort".

## v1.1.0 (2025-07-29)

- Ajout d'une teinte rouge au token quand la barre de vie est inférieure ou égale à la moitié du maximum.

## v1.0.0 (2025-07-16)

- Version initiale

