Ceci est le projet effectué pour la NSI en classe de Terminale
Il est encore incomplet (pas d'options, mode deux joueurs incomplet)

Pour installer ce logiciel, il faut python dans sa version 3
Les versions trop récentes de python ne fonctionnent pas, la dernière fonctionnelle est python 3.9

Python peut être installer ici pour windows :
https://www.python.org/ftp/python/3.9.7/python-3.9.7-amd64.exe

Avec cette commande sur Debian :
# apt install python3

Ou celle-ci sur Arch :
# pacman -S python


Pour installer les dépendances liés à python :
 * Windows :
    python -m pip install -r requirements.txt
 * Linux (Debian/Arch) :
    pip3 install -r requirements.txt


Pour lancer le logiciel il n'y aura plus qu'à exécuter le fichier main.py ou à taper :
python main.py