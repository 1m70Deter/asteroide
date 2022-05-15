<?php
function getPos($id) {
    $bdd = new PDO('mysql:host=localhost;dbname=asteroide;charset=utf8','root');
    $rs = $bdd->prepare("SELECT * FROM jeu WHERE id=" . $id);
    $rs->execute();
    foreach($rs->fetchAll() as $p) {
        return $p;
    }
}
?>
