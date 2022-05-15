<?php
function detruireAsteroide($i, $id, $positions) {
    $posA = json_decode($positions["asteroide"]);
    $a = $posA[$i];
    $points = json_decode($positions["plus"]);
    $points[1]->points += 3 * $a->t;
    if($a->t != 4) {
        $posD = [
            'x' => $a->x,
            'y' => $a->y,
            'a' => $a->a,
        ];
        array_splice($posA, $i, 1);
        $posA[count($posA)] = apparitionAsteroides($a->t + 1, $posD, $id);
        $posA[count($posA)] = apparitionAsteroides($a->t + 1, $posD, $id);
    } else {
        array_splice($posA, $i, 1);
    }
    $bdd = new PDO('mysql:host=localhost;dbname=asteroide;charset=utf8','root');
    $cmd = $bdd->prepare("UPDATE jeu SET asteroide='" . json_encode($posA) . "', plus='" . json_encode($points) . "' WHERE id=" . $id);
    $cmd->execute();
    return true;
}
?>
