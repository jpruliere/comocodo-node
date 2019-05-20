# Comocodo

Comme [mocodo](https://github.com/laowantong/mocodo) mais en collaboratif :tada:

## Comment l'installer

- Cloner ce repo
- S'assurer d'avoir une version post-URSS de Node (la 10.x LTS est très bien)
- `npm install` depuis le clone
- `npm test` pour vérifier que tout roule
  - Problème le plus fréquent : droits insuffisants sur le dossier _rooms_, où sont stockés les scripts des utilisateurs => `sudo chmod a+rw rooms`
- `npm start` se charge de compiler le seul et unique fichier à compiler de l'application puis lance le service

## Comment l'utiliser

:warning: L'UI est mochissime mais fonctionnelle, l'auteur va bientôt se pencher dessus :pray:

- Direction `/room/welcome` pour intégrer la room _welcome_ : les noms de room peuvent contenir des chiffres, lettres (:warning: case senstive), espaces, tirets etc. (juste pas de  `/`)
- Si vous utilisez Comocodo pour la première fois, choisissez votre pseudo
- Invitez d'autres personnes dans votre room
- Le premier arrivé a le "crayon", c'est-à-dire qu'il est le seul à pouvoir éditer le script
  - Les autres ont la possibilité de demander le crayon, ce qui laisse une minute (**paramétrable**) à l'auteur actuel pour finir ses modifications
  - L'auteur peut "lâcher le crayon" avant
- Toute modification relance un chrono de quelques secondes (**paramétrable**) qui, en l'absence d'autres modifications, aboutit à la génération du schéma correspondant au script
  - Le schéma est broadcasté, il apparaît chez tous les utilisateurs de la room actuelle

tl;dr : vous éditez le script, ça dessine le MCD, votre collègue vous pique le crayon, édite le script, ça redessine le MCD

## TODO

- L'UI
- Le bug de l'utilisateur qui demande le crayon et se casse (pour l'instant, on peut le récupérer en le redemandant mais il faut attendre tout le timeout)
- L'UI
- L'UI
- L'UX
- L'UI aussi
- Téléchargement du MCD résultant et des quelques autres trucs cools généré par Mocodo
- Reset de la room