# Conditions

Un script MOD pour Roll20 et D&D 5e permettant de gérer les conditions préjudiciables d'un personnage

## Version courante

v1.0.0

## Dépendances

Script MOD TokenMod

Token markers : https://drive.google.com/drive/folders/1p8PTqBHkgSrKVqqOyI2_kFcPmbgLcX72

# Mise en place
- Vous devez installer le script MOD TokenMod
- Vous devez télécharger le jeu de token markers indiqué ci-dessus et l'ajouter à la partie
- Vous devez créer pour chaque condition un handout nommé <kbd>Condition:{nom}</kbd> qui contient le texte descriptif à afficher dans le chat

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

<kbd>!condition {nom}</kbd> Affiche dans le chat la description de la condition nommée

<kbd>!conditions</kbd> Crée la macro MOD-Conditions

La macro MOD-Conditions permet de choisir une condition à appliquer au token sélectionné
- TokenMod permet d'appliquer le token marker correspondant à la condition
- La description trouvée dans le handout nommé Condition:{nom} est affichée dans un message de chat non archivé

# Notes de version

## v1.0.0 (2024-03-28)

- Version initiale

