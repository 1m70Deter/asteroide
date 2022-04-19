<?php
$bdd = new PDO('mysql:host=localhost;dbname=asteroide;charset=utf8','root');
// Ce fichier est à placer sur un serveur afin de faire tourner le jeu asteroide de manière normale sur des clients
/*

    Ce fichier met à jour la base de donnée en les recevant via une requête POST
    Informations à pourvoir :
        * id de partie
        * x du joueur
        * y du joueur

*/
ini_set('display_errors', 1);
function getPos($id) {
    $bdd = new PDO('mysql:host=localhost;dbname=asteroide;charset=utf8','root');
    $rs = $bdd->prepare("SELECT * FROM jeu WHERE id=" . $id);
    $rs->execute();
    foreach($rs->fetchAll() as $p) {
        return $p;
    }
}
if(isset($_POST["id"]) && strlen($_POST["id"]) != 0) {
    if((isset($_POST["x"]) && $_POST["x"] != "") || (isset($_POST["y"]) && $_POST["y"] != "")) {
        $j = getPos($_POST["id"])[1];
        $j = json_decode($j);
        $j2 = [];
        for($i=0; $i<count($j); $i+=1) {
            if($j[$i]->ip == $_SERVER['REMOTE_ADDR']) {
                $j[$i]->x = $_POST["x"];
                $j[$i]->y = $_POST["y"];
                $j[$i]->rt = $_POST["rt"];
                $j2[count($j2)] = $j[$i];
            } else {
                $j2[count($j2)] = $j[$i];
            }
        }
        $j = json_encode($j2);
        echo $j;
        $cmd = $bdd->prepare("UPDATE jeu SET joueurs='" . $j . "' WHERE id=" . $_POST["id"]);
        $cmd->execute();
    } else {
        echo "Mauvaise utilisation de la page...";
    }
}
?>
