# TableRoller

Ce script MOD permet de faire un lancer sur une table aléatoire Roll20 ("rollable table") et d'afficher le résultat dans le chat.

Il supporte la notion de "poids" pour chaque résultat possible. De plus, les jet en ligne ("inline rolls", jets entre [[ ]]) présents dans le résultat choisi aléatoirement sont automatiquement résolus.

## Version courante

v1.0.0

## Utilisation

La syntaxe de base de ce MOD est la suivante

<kbd>!tbr _nom-de-la-table_ [--whisper] _Titre du lancer_</kbd>

Le premier paramètre après la commande <kb>!tbr</kbd> est le nom de la table sur laquelle le jet doit être effectué.

Si la commande comporte l'option <kbd>--whisper</kbd>, le résultat du tirage sur la table est chuchoté au MJ

Tout ce qui se trouve à la suite du nom de la table est considéré comme le contenu de la barre de titre du résultat affiché dans le chat.

# Notes de version

## v1.0.0 (2023-11-18)

- Version initiale