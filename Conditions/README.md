# Conditions

Un script MOD pour Roll20 et D&D 5e permettant de gérer les conditions préjudiciables d'un personnage

## Version courante

v1.0.0

## Dépendances

Script MOD Token-Mod

Token markers : https://drive.google.com/drive/folders/1p8PTqBHkgSrKVqqOyI2_kFcPmbgLcX72

# Mise en place
- Vous devez télécharger le jeu de token markers indiqué ci-dessus et l'ajouter à la partie dans Roll20
- Vous devez créer pour chaque condition un handout nommé <kbd>Condition:{nom}</kbd> contenant le texte descriptif qui sera affiché dans le chat 

## Liste des noms de conditions
- Grappled (agrippé)
- Deafened (assourdi)
- Prone (au sol)
- Blinded (aveuglé)
- Charmed (charmé)
- Frightened (effrayé)
- Exhausted (épuisé)
- Poisoned (empoisonné)
- Restrained (entravé)
- Stunned (étourdi)
- Incapacited (inconscient)
- Invisible (invisible)
- Paralysed (paralysé)
- Petrified (pétrifié)

# Utilisation

<kbd>!condition {nom}</kbd> Affiche dans le chat la condition nommée

<kbd>!conditions</kbd> Crée la macro MOD-Conditions

La macro MOD-Conditions permet de choisir une condition à appliquer au token sélectionné sous la forme d'un token marker
- Token-Mod permet d'appliquer le token marker correspondant à la condition
- La description de la condition est affichée dans un message de chat non archivé

# Notes de version

## v1.0.0 (2024-03-28)

- Version initiale

