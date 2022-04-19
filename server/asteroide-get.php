<?php
$bdd = new PDO('mysql:host=localhost;dbname=asteroide;charset=utf8','root');
// Ce fichier sert à récupérer les valeurs stockées dans la base de données à l'aide de la méthode GET
/*

    URL type : http://127.0.0.1/asteroide-get.php?id=id_de_partie
    Ce qui est renvoyé :
        * pos j1
        * pos j2
        * pos asteroides

    http://127.0.0.1/asteroide-get.php?createGame=1
    aura pour effet de créer une nouvelle partie
    (nouvelle ligne dans la table jeu)

    Si l'objectif est d'ajouter un nouveau joueur à la partie, alors la syntaxe sera :
    http://127.0.0.1/asteroide-get.php?joinGame=id
    id est le numéro associé à la partie

    Avant de quitter la partie, le client doit envoyer cette requête permettant de mettre à jour le nombre de joueurs
    http://127.0.0.1/asteroide-get.php?quitGame=id
    id est le numéro associé à la partie

 */
// Retirez pour afficher les éventuelles erreurs :
ini_set('display_errors', 1);
function getPos($id) {
    $bdd = new PDO('mysql:host=localhost;dbname=asteroide;charset=utf8','root');
    $rs = $bdd->prepare("SELECT * FROM jeu WHERE id=" . $id);
    $rs->execute();
    foreach($rs->fetchAll() as $p) {
        return $p;
    }
}
function verifierParametre($p) {
    // Vérifie s'il n'y a pas d'injection SQL à l'intérieur des paramètres
    if(!is_numeric($p)) {
        echo "Pas d'injections SQL ici :p";
        die();
    } elseif(str_contains("SELECT", $p) || str_contains("INSERT", $p) || str_contains("UPDATE", $p) || str_contains("DELETE", $p)) {
        echo "Pas d'injections SQL ici :p";
        die();
    } else {
        return $p;
    }
}

if(isset($_GET["id"]) && $_GET["id"] != "") {
    $p = verifierParametre($_GET["id"]);
    $p = getPos($p);
    echo $p[0] . '|' . $p[1] . '|' . $p[2];
}
if(isset($_GET["createGame"]) && $_GET["createGame"] == 1) {
    $j = "[{\"ip\":\"" . $_SERVER['REMOTE_ADDR'] . "\", \"x\" : " . rand(0, 500) . ", \"y\" : " . rand(0, 350) . ", \"rt\" : 0, \"vies\" : 3}]";
    $cmd = $bdd->prepare("INSERT INTO jeu(joueurs, asteroide) VALUES('" . $j . "', '[{}]')");
    $cmd->execute();
    // On renvoie l'id de la partie :
    $rs = $bdd->prepare("SELECT * FROM jeu ORDER BY id DESC LIMIT 1");
    $rs->execute();
    foreach($rs->fetchAll() as $p) {
        // La réponse sera téléchargée par le client afin de connaître son ID de partie + son IP dans le jeu
        echo $p[0] . "|" . $_SERVER['REMOTE_ADDR'];
    }
}
if(isset($_GET["joinGame"]) && strlen(strval($_GET["joinGame"])) != 0) {
    $p = verifierParametre($_GET["joinGame"]);
    $j = getPos($p)[1];
    $j = explode("]", $j)[0] . ", {\"ip\":\"" . $_SERVER['REMOTE_ADDR'] . "\", \"x\" : " . rand(0, 500) . ", \"y\" : " . rand(0, 350) . ", \"rt\" : 0, \"vies\" : 3}" . "]";
    if(count(json_decode($j)) > 2) {
        // On ne peut être que deux par partie pour éviter les lags
        echo "max";
        die();
    } else {
        $cmd = $bdd->prepare("UPDATE jeu SET joueurs='" . $j . "' WHERE id=" . $p);
        $cmd->execute();
        // On renvoie son IP au joueur pour que le client puisse le reconnaître
        echo $_SERVER['REMOTE_ADDR'];
    }
}
if(isset($_GET["quitGame"]) && strlen(strval($_GET["quitGame"])) != 0) {
    $p = verifierParametre($_GET["quitGame"]);
    $j = getPos($p)[1];
    $j = json_decode($j);
    $j2 = [];
    for($i=0; $i<count($j); $i+=1) {
        if(isset($_GET["nom"]) && $_GET["nom"] != "") {
            // L'url est du type http://localhost/asteroide-get.php?quitGame=1&nom=string&score=int
            $score = verifierParametre($_GET["score"]);
            // Il faut aussi vérifier l'intégrité de la variable $_GET["nom"]
            if(str_contains("SELECT", $_GET["nom"]) || str_contains("INSERT", $_GET["nom"]) || str_contains("UPDATE", $_GET["nom"]) || str_contains("DELETE", $_GET["nom"])) {
                echo "Pas d'injections SQL ici :p";
                die();
            }
            $cmd = $bdd->prepare("INSERT INTO scoreboard(nom, score) VALUES('" . $_GET['nom'] . "', '" . $_GET['score'] . "')");
            $cmd->execute();
            // Il faut ensuite passer à l'utilisateur les 10 premiers résultats de la base de données
            $cmd = $bdd->prepare("SELECT * FROM scoreboard ORDER BY score DESC LIMIT 10");
            $cmd->execute();
            foreach($cmd->fetchAll() as $rs) {
                echo $rs[1] . "|" . $rs[2] . ",";
            }
        }
        if($j[$i]->ip == $_SERVER['REMOTE_ADDR']) {
            continue;
        } else {
            $j2[count($j2)] = $j[$i];
        }
    }
    $j = $j2;
    // Si j est vide, alors il faut supprimer la partie de la base de données
    // Sinon, on met la base de données à jour.
    if(count($j) == 0) {
        $cmd = $bdd->prepare("DELETE FROM jeu WHERE id=" . $p);
    } else {
        $cmd = $bdd->prepare("UPDATE jeu SET joueurs='" . $j . "' WHERE id=" . $p);
    }
    $cmd->execute();
}
function apparitionAsteroides($t = rand(1, 4), $posD = {}) {
    echo $t;
}
if(isset($_GET["mettreAjour"])) {
    // Cette fonction a pour but de mettre à jour les positions des astéroides lorsque la partie est multijoueure
    echo "ent";
    apparitionAsteroides();
}
?>
