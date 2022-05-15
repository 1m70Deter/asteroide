<?php
// Cette fonction permet à un joueur de rejoindre une partie déjà existante.
$bdd = new PDO('mysql:host=localhost;dbname=asteroide;charset=utf8','root');
include("getPos.php");
include("verif.php");
// Retirez pour afficher les éventuelles erreurs :
//ini_set('display_errors', 1);
if(isset($_GET["id"]) && strlen(strval($_GET["id"])) != 0) {
    $p = verifierParametre($_GET["id"]);
    $j = getPos($p)[1];
    $j = explode("]", $j)[0] . ", {\"ip\":\"" . $_SERVER['REMOTE_ADDR'] . "\", \"x\" : " . rand(0, 500) . ", \"y\" : " . rand(0, 350) . ", \"rt\" : 0}" . "]";
    if(count(json_decode($j)) > 2) {
        // On ne peut être que deux par partie pour éviter les lags
        echo "max";
        die();
    } else {
        $cmd = $bdd->prepare("UPDATE jeu SET joueurs='" . $j . "' WHERE id=" . $p);
        $cmd->execute();
        // On renvoie son IP au joueur pour que le client puisse le reconnaître au cas où
        echo $_SERVER['REMOTE_ADDR'];
    }
}
?>
