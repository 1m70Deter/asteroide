import webview, pygame, sqlite3, random, time, requests

###################################################################################
#                                                                                 #
#   Ce programme lance une copie du jeu Asteroide recréé en JS et en Python       #
#   Nous avons implémenté la possibilité de jouer à plusieurs grâce à une BDD     #
#   Parties du cours utilisées pour ce projet :                                   #
#       * Modularité                                                              #
#       * POO (tant en Python qu'en JS ici)                                       #
#       * Base de données et SQL                                                  #
#                                                                                 #
###################################################################################

#####################################################
#                                                   #
#   Ce programme est créé par Clément et Samuel     #
#   C'est le projet de fin d'année de Terminale     #
#                                                   #
#####################################################

# L'interface graphique est déssiné avec PyWebview, bien plus pratique que TKinter
# Ainsi, le code du jeu en lui-même est présent dans html/

# Les musiques sont gérées par le module pygame
# Elles ont été créées spécialement pour l'occasion par Clément

# Le module sqlite3 sert à faire la jonction avec la base de données présents dans les fichiers

# La classe Api sert de passerelle entre les fonctions JS et python
# Elle est directement injectée dans le code par PyWebview
class Api:

    def getPosition(self, jid):
        # Renvoie les positions des éléments sous forme d'un objet (dictionnaire) mis en chaine de texte
        # Ce sont les positions de J2
        url = "http://" + serverIP + "/recup.php?id=" + jid
        return requests.get(url).text

    def postPosition(self, j, jid):
        # Cette fonction a pour but d'envoyer les coordonnées du joueur et des astéroides à la BDD
        # Les objets (dictionnaires) sont mis sous forme d'une chaîne de texte
        donne = {
            'id' : jid,
            'x' : j['x'],
            'y' : j['y'],
            'rt' : j['rt'],
            'centre' : {
                "x" : j["centre"]["x"],
                "y" : j["centre"]["y"]
            }
        }
        url = "http://" + serverIP + "/postPos.php"
        return requests.post(url, donne).text

    def tirerBalle(self, jid, x, y, rt):
        # Cette fonction envoie la positions des tirs à la base de données
        url = "http://" + serverIP + "/tirer.php?id=" + str(jid) + "&x=" + str(x) + "&y=" + str(y) + "&a=" + str(rt)
        requests.get(url)

    def lancerMusiqueMenu(self):
        # Cette méthode lance la musique du Menu avec pygame
        m_menu.play(-1)
    
    def creerPartie(self):
        # Cette fonction crée une partie sur la base de données
        return requests.get("http://" + serverIP + "/creer.php").text

    def rejoindrePartie(self, idj):
        # Cette fonction permet d'ajouter un joueur à la base de données grâce à une id de partie
        return requests.get("http://" + serverIP + "/rejoindre.php?id=" + str(idj)).text

    def quitterPartie(self, idj):
        # Cette fonction permet de retirer le joeur de la base de données
        requests.get("http://" + serverIP + "/quitter.php?id=" + idj)

    def ecrireConf(self, multij, jip, jid, sip):
        # Cette fonction permet d'écrire les valeurs multij, ip du joueur et id de la partie
        # Toutes ces valeurs sont enregistrées à l'intérieur du fichier conf.txt
        f = open("conf.txt", 'r')
        cnt = f.read().split("\n")
        f.close()
        if not sip == "":
            cnt[3] = cnt[3].split("=")[0] + "=" + sip
        else:
            cnt[0] = cnt[0].split("=")[0] + "=" + str(jid)
            cnt[1] = cnt[1].split("=")[0] + "=" + str(jip)
            cnt[2] = cnt[2].split("=")[0] + "=" + str(multij)
        f = open("conf.txt", 'w')
        f.write("\n".join(cnt))
        f.close()

    def lireConf(self):
        # Renvoie la liste des configurations enregistrées dans conf.txt 
        # sous la forme d'un dictionnaire
        f = open("conf.txt", 'r')
        cnt = f.read().split("\n")
        c = {
            "jid" : cnt[0].split("=")[1],
            "jip" : cnt[1].split("=")[1],
            "multij" : cnt[2].split("=")[1],
            "sip" : cnt[3].split("=")[1]
        }
        return c

    def writeScore(self, nom, pts, multij, idj):
        # Cette fonction écrit le score à l'intérieur d'une base de données
        # Si la partie est multijoueur, alors elle envoie une requête à ip/asteroide-get.php?quitGame=1
        # Sinon, elle sauvegarde le score à l'intérieur de la BDD
        if int(multij) == 1:
            # Le serveur gère en cas de défaite ou de victoire de joueurs
            rep = requests.get("http://" + serverIP + "/quitter.php?id=" + idj + "&nom=" + nom + "&score=" + str(pts)).text
            rep = rep.split(",")
            count = 0
            for i in rep:
                rep[count] = [count] + i.split("|")
                count += 1
            return rep
        else:
            # On se connecte à la base de données
            bdd = sqlite3.connect("sql/bdd.sqlite")
            curs = bdd.cursor()
            bdd.execute("INSERT INTO scoreboard(nom, score) VALUES('" + nom + "', " + str(pts) + ")")
            bdd.commit()
            curs.execute("SELECT * FROM scoreboard ORDER BY score DESC LIMIT 7")
            rs = []
            for ligne in curs.fetchall():
                rs.append(ligne)
            bdd.close()
            return rs

    def ouvrirMenu(self):
        # Cette fonction ouvre le menu à la fin d'une partie
        # On doit d'abord détruire la fenêtre précédente nommée game
        global game
        global menu
        m_main.stop()
        menu = webview.create_window('Asteroide', 'html/start.html', fullscreen=False, width=800, height=650, js_api=api, resizable=False)
        game.destroy()
        webview.start(debug=True)

    def ouvrirJeu(self):
        # Cette fonction lance la fenêtre du jeu, rien de plus
        global game
        global menu
        m_menu.stop()
        m_main.play(-1)
        game = webview.create_window('Asteroide', 'html/index.html', width=1000, height=750, js_api=api, resizable=False)
        menu.destroy()
        webview.start(debug=True)

    def bruitage(self, bruit):
        if bruit == "ent":
            voiture = pygame.mixer.Sound("html/asset/bruits/voiture.mp3")
            voiture.play()

    def arreterBruitage(self, bruit):
        x = 0

# Variables liées à la Musique et au Bruitage
pygame.mixer.init()
m_menu = pygame.mixer.Sound("html/asset/musiques/menu.mp3")
m_main = pygame.mixer.Sound("html/asset/musiques/main.mp3")

# Chargement de l'IP depuis les confs
f = open("conf.txt", 'r')
serverIP = f.read().split("\n")[3].split("=")[1]
print("[INFO] IP du serveur Multijoueur : " + serverIP)
f.close()

# Pour plus de praticité dans l'exécution, on renomme la variable avant de la passer
api=Api()

# Ces deux lignes lance le menu principal du jeu.
# Il est inutile mais donne un aire plus professionel :)
menu = webview.create_window('Asteroide', 'html/start.html', fullscreen=False, width=800, height=650, js_api=api, resizable=False)
webview.start(debug=True)
