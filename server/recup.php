<?php
// Cette fonction met à jour les différentes positions avant de les envoyer aux joueurs.
$bdd = new PDO('mysql:host=localhost;dbname=asteroide;charset=utf8','root');
include("getPos.php");
include("verif.php");
include("appAsteroide.php");
include("destrAsteroide.php");
// Retirez pour afficher les éventuelles erreurs :
//ini_set('display_errors', 1);
function aJourAsteroide($positions) {
    // Cette fonction déplace les astéroides
    $posA = json_decode($positions["asteroide"]);
    for($i = 0; $i < count($posA); $i++) {
        $posA[$i] = [
            "x" => round(($posA[$i]->x + cos(($posA[$i]->a*pi())/180) * 2), 10),
            "y" => round(($posA[$i]->y + sin(($posA[$i]->a*pi())/180) * 2), 10),
            "a" => $posA[$i]->a + rand(-1, 1),
            "t" => $posA[$i]->t,
        ];
        if($posA[$i]['x'] > 1010) { $posA[$i]['x'] = -130; }
        if($posA[$i]['x'] < -130) { $posA[$i]['x'] = 1005; }
        if($posA[$i]['y'] > 760) { $posA[$i]['y'] = -200; }
        if($posA[$i]['y'] < -200) { $posA[$i]['y'] = 755; }
    }
    return json_encode($posA);
}
function aJourBalle($positions, $id) {
    // Cette fonction déplace les balles tirées par les joueurs
    $posB = json_decode($positions["balle"]);
    $posA = json_decode($positions["asteroide"]);
    $tailleAsteroide = [
        [
            "width"  => 150,
            "height" => 80,
        ],
        [
            "width"  => 120,
            "height" => 125,
        ],
        [
            "width"  => 100,
            "height" => 35,
        ],
        [
            "width"  => 70,
            "height" => 50,
        ],
    ];
    for($i = count($posB)-1; $i >=0; $i--) {
        $posB[$i] = [
            'x' => round(($posB[$i]->x + cos(($posB[$i]->a*pi())/180) * 25), 3),
            'y' => round(($posB[$i]->y + sin(($posB[$i]->a*pi())/180) * 25), 3),
            'a' => $posB[$i]->a,
        ];
        if($posB[$i]['x'] > 1010) { array_splice($posB, $i, 1); continue; }
        if($posB[$i]['x'] < -130) { array_splice($posB, $i, 1); continue; }
        if($posB[$i]['y'] >  760) { array_splice($posB, $i, 1); continue; }
        if($posB[$i]['y'] < -200) { array_splice($posB, $i, 1); continue; }
        // On regarde si les balles touchent des astéroides
        $pointe = [
            'x' => $posB[$i]['x'] + 40 * cos($posB[$i]['a']*pi()/180),
            'y' => $posB[$i]['y'] + 40 * cos($posB[$i]['a']*pi()/180),
        ];
        for($j = 0; $j < count($posA); $j++) {
            if($pointe['x'] > $posA[$j]->x && $pointe['x'] < ($posA[$j]->x + $tailleAsteroide[$posA[$j]->t - 1]["width"])) {
                if($pointe['y'] > $posA[$j]->y && $pointe['y'] < ($posA[$j]->y + $tailleAsteroide[$posA[$j]->t - 1]["height"])) {
                    array_splice($posB, $i, 1);
                    detruireAsteroide($j, $id, $positions);
                    $destruction = true;
                    break;
                }
            }
        }
    }
    if(isset($destruction) && $destruction == true) {
        return [json_encode($posB), 1];
    } else {
        return json_encode($posB);
    }
}

if(isset($_GET["id"]) && $_GET["id"] != "") {
    $id = verifierParametre($_GET["id"]);
    $p = getPos($id);
    if(json_decode($p[1])[0]->ip == $_SERVER['REMOTE_ADDR']) {
        $b = aJourBalle($p, $id);
        if(gettype($b) == "array") {
            $a = aJourAsteroide(getPos($id));
            $cmd = $bdd->prepare("UPDATE jeu SET asteroide='" . $a . "', balle='" . $b[0] . "' WHERE id=" . $id);
        } else {
            $a = aJourAsteroide($p);
            if(rand(1, 20) == 5) {
                $a = json_decode($a);
                if(count($a) < 10) {
                    $a[count($a)] = apparitionAsteroides(0, 0, $p[0]);
                }
                $a = json_encode($a);
            }
            $cmd = $bdd->prepare("UPDATE jeu SET asteroide='" . $a . "', balle='" . $b . "' WHERE id=" . $id);
        }
        $cmd->execute();
    }
    // On laisse une partie pour la correction de bug rendant le tout plus lisible :
    if(isset($_GET["debug"]) && $_GET["debug"] == "true") {
        echo "id : " . $p[0] . "<br>";
        echo "joueurs : " . $p[1] . "<br>";
        echo "asteroides : " . $p[2] . "<br>";
        echo "tirs : " . $p[3] . "<br>";
    } else {
        echo $p[0] . '|' . $p[1] . '|' . $p[2] . "|" . $p[3] . "|" . $p[4];
    }
}
?>
