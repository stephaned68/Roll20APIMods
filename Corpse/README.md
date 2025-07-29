# Corps

Un script MOD pour Roll20 permettant de détecter la valeur de la barre de vie / santé d'un token et :
- si elle tombe à la moitié du maximum, de lui appliquer une teinte de fond rouge
- si elle tombe à 0, de lui appliquer un marker "Mort" ainsi que de l'envoyer optionnellement sur la couche de la carte.

## Version courante

v1.1.0

# Utilisation

<kbd>!corpse</kbd> : Affiche le menu de configuration du script MOD

Les paramètres suivants peuvent être changés :
- No de la barre de santé (par défaut : <kbd>1</kbd>)
- Token Marker à appliquer quand la valeur de la barre de santé tombe à 0 ou moins (par défaut : <kbd>dead</kbd>)
- Application d'une teinte de fond rouge quand la valeur de la barre de santé tombe à la moitié de la valeur maximum
- Envoi du token vers la couche de la carte : Oui (par défaut) / Non. Cette action ne se produit que pour les mooks (PNJ dont la barre de vie n'est liée à aucun attribut).

# Notes de version

## v1.0.0 (2025-07-16)

- Version initiale

