# TurnOrderManager version 1.2.0

Ce script permet de simplifier la gestion du Turn Order à l'aide de commande de chat.

## Commandes

### `!tom-begin` / `!tom-start` (GM uniquement)

Trie le Turn Order par ordre décroissant et ajoute un compteur de round au début.

Les options `--count-name|<nom>` et `--count-value|<valeur>` peuvent être indiquées pour spécifier le nom et la valeur de départ du compteur de round.

### `!tom-clear` (GM Only)

Efface le contenu du Turn Order, **sans message de confirmation**. Un message est murmuré au MJ dans le chat avec la commande à utiliser pour restaurer le contenu effacé, en cas d'erreur.

Si l'option `--no-load` est spécifiée, le script MOD n'envoie pas la commande de rechargement dans le chat.

Si l'option `--close` est spécifiée, la fenêtre du Turn Order est refermée.

### `!tom-down <n> [--<before|after> prefix] name`

Ajoute un élément avec le nom `name` au Turn Order qui décompte à partir de _n_. Par défaut, l'élément est ajouté à la fin de la liste. Si les options `--before` or `--after` sont spécifiées, l'argument `prefix` est utilisé pour effectuer une recherche par nom afin d'insérer l'élément avant ou après.

### `!tom-up <n> [--<before|after> prefix] name`

Ajoute un élément avec le nom `name` au Turn Order qui compte à partir de _n_. Par défaut, l'élément est ajouté à la fin de la liste. Si les options `--before` or `--after` sont spécifiées, l'argument `prefix` est utilisé pour effectuer une recherche par nom afin d'insérer l'élément avant ou après.

### `!tom-clean`

Efface tous les éléments dont la valeur de compteur est inférieure ou égale à 0.

### `!tom-remove prefix` / `!tom-rm prefix` (GM uniquement)

Efface le premier élément dont le nom commande par `prefix`.

### `!tom-load <blob JSON>` (GM uniquement)

Charge le Turn Order à partir d'un bloc de données JSON sérialisées.

### `!tom-append <blob JSON>` (GM uniquement)

Ajoute des éléments au Turn Order à partir d'un bloc de données JSON sérialisées.

## Notes sur les autorisations

Les commandes d'effacement et de chargement du Turn Order ainsi que le démarrage d'une rencontre sont des fonctions limitées au MJ.