<?php
// Ce fichier sert à créer une nouvelle partie
include("getPos.php");
include("appAsteroide.php");
// Retirez pour afficher les éventuelles erreurs :
//ini_set('display_errors', 1);
$bdd = new PDO('mysql:host=localhost;dbname=asteroide;charset=utf8','root');
$j = "[{\"ip\":\"" . $_SERVER['REMOTE_ADDR'] . "\", \"x\" : " . rand(0, 500) . ", \"y\" : " . rand(0, 350) . ", \"rt\" : 0}]";
$cmd = $bdd->prepare("INSERT INTO jeu(joueurs, asteroide, balle, plus) VALUES('" . $j . "', '[]', '[]', '[{\"vies\" : 3}, {\"points\" : 0}, {\"immunite\" : 0}, {\"tpsImun\" : 100}]')");
$cmd->execute();
// On renvoie l'id de la partie :
$rs = $bdd->prepare("SELECT * FROM jeu ORDER BY id DESC LIMIT 1");
$rs->execute();
foreach($rs->fetchAll() as $p) {
    // La réponse sera téléchargée par le client afin de connaître son ID de partie + son IP dans le jeu
    echo $p[0] . "|" . $_SERVER['REMOTE_ADDR'];
    $a = [];
    for($i = 0; $i < rand(3, 6); $i++) {
        $a[count($a)] = apparitionAsteroides(0, 0, $p[0]);
    }
    $a = json_encode($a);
    $cmd = $bdd->prepare("UPDATE jeu SET asteroide='" . $a . "' WHERE id=" . $p[0]);
    $cmd->execute();
}
?>
