# Concentration

Un script MOD pour Roll20 et D&D 5e permettant de gérer la concentration d'un personnage sur un sort

## Version courante

v1.0.0

## Dépendances

Script MOD TokenMod

Token markers : https://drive.google.com/drive/folders/1p8PTqBHkgSrKVqqOyI2_kFcPmbgLcX72

# Mise en place
- Vous devez installer le script MOD TokenMod
- Vous devez télécharger le jeu de token markers indiqué ci-dessus et l'ajouter à la partie

# Utilisation

Un fois le script installé, il peut être utilisé tel quel si le jeu de token markers indiqué a été installé et que les points de vie des personnages sont liés à la barre 1 des tokens. Dans le cas contraire, il suffit de taper la commande de configuration <kbd>!concentration</kbd> dans le chat (voir ci-dessous).

Lorsque votre personnage se concentre sur un sort, ajoutez le marker **Concentration** au token. Un message s'affiche dans le chat indiquant le nom du personnage, le nom du sort et la durée maximum de concentration.

Ce marker est ajouté automatiquement si vous envoyez ou murmurez la description du sort dans le chat depuis votre fiche, et que celui-ci a été correctement configuré en cochant la case *Concentration*.

Une fois le marker placé sur le token, dès que le script détecte que votre personnage a perdi des points de vie, il affiche dans le chat un menu avec deux boutons :
- Un bouton qui permet de faire un jet de Concentration, le DD du jet est calculé selon les dégâts reçus et indiqué sur le texte du bouton.
- Un bouton qui permet de retirer le token marker **Concentration** si le jet a échoué. Le script MOD **TokenMod** doit être installé pour ce faire.

# Configuration

<kbd>!concentration</kbd> : Affiche dans le chat le menu de configuration du script MOD

Deux paramètres de fonctionnement du script peuvent être configurés :
- Le token marker permettant d'indiquer que le personnage lié se concentre sur un sort

  Par défaut, il s'agit du marker **Concentration**
- Le numéro de la barre de token qui représente les points de vie du personnage

  Par défaut, il s'agit de la barre numéro 1

# Notes de version

## v1.0.0 (2024-03-28)

- Version initiale

