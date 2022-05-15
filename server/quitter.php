<?php
// Cette fonction gère les événements liés à l'intéruption d'une partie
$bdd = new PDO('mysql:host=localhost;dbname=asteroide;charset=utf8','root');
include("getPos.php");
include("verif.php");
// Retirez pour afficher les éventuelles erreurs :
//ini_set('display_errors', 1);
if(isset($_GET["id"]) && strlen(strval($_GET["id"])) != 0) {
    $p = verifierParametre($_GET["id"]);
    $j = getPos($p)[1];
    $j = json_decode($j);
    $j2 = [];
    for($i=0; $i<count($j); $i+=1) {
        if(isset($_GET["nom"]) && $_GET["nom"] != "") {
            // L'url est du type http://localhost/quitter.php?id=1&nom=string&score=int
            $score = verifierParametre($_GET["score"]);
            // Il faut aussi vérifier l'intégrité de la variable $_GET["nom"]
            if(strlen($_GET["nom"]) > 3) {
                echo "Pas d'injections SQL ici :p";
                die();
            }
            $cmd = $bdd->prepare("INSERT INTO scoreboard(nom, score) VALUES('" . $_GET['nom'] . "', " . strval($score) . ")");
            $cmd->execute();
            // Il faut ensuite passer à l'utilisateur les 10 premiers résultats de la base de données
            $cmd = $bdd->prepare("SELECT * FROM scoreboard ORDER BY score DESC LIMIT 7");
            $cmd->execute();
            foreach($cmd->fetchAll() as $rs) {
                echo $rs[1] . "|" . strval($rs[2]) . ",";
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
?>
