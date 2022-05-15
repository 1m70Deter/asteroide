<?php
// Cette fonction gère les événements liés aux tirs des joueurs
$bdd = new PDO('mysql:host=localhost;dbname=asteroide;charset=utf8','root');
include("getPos.php");
include("verif.php");
// Retirez pour afficher les éventuelles erreurs :
//ini_set('display_errors', 1);
if(isset($_GET["id"]) && $_GET["id"] != 0) {
    $id = verifierParametre($_GET["id"]);
    $p = getPos($id);
    $b = json_decode($p[3]);
    $b[count($b)] = [
        'x' => verifierParametre($_GET['x']),
        'y' => verifierParametre($_GET['y']),
        'a' => verifierParametre($_GET['a']),
    ];
    $b = json_encode($b);
    $cmd = $bdd->prepare("UPDATE jeu SET balle='" . $b . "' WHERE id=" . $id);
    $cmd->execute();
}
 ?>
