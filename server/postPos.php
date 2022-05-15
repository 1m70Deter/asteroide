<?php
// Ce fichier est à placer sur un serveur afin de faire tourner le jeu asteroide de manière normale sur des clients
/*

    Ce fichier met à jour la base de donnée en les recevant via une requête POST
    Informations à pourvoir :
        * id de partie
        * x du joueur
        * y du joueur

*/
$bdd = new PDO('mysql:host=localhost;dbname=asteroide;charset=utf8','root');
include("getPos.php");
include("verif.php");
include("appAsteroide.php");
include("destrAsteroide.php");
// Décommentez cette ligne pour afficher les erreurs :
ini_set('display_errors', 1);

if(isset($_POST["id"]) && strlen($_POST["id"]) != 0) {
    if((isset($_POST["x"]) && $_POST["x"] != "") || (isset($_POST["y"]) && $_POST["y"] != "")) {
        $_POST["id"] = verifierParametre($_POST["id"]);
        $_POST['x']  = verifierParametre($_POST['x']);
        $_POST['y']  = verifierParametre($_POST['y']);
        $_POST["rt"] = verifierParametre($_POST["rt"]);

        $positions = getPos($_POST["id"]);
        $j = $positions[1];
        $j = json_decode($j);
        $j2 = [];
        $index = 0;
        for($i=0; $i<count($j); $i+=1) {
            if($j[$i]->ip == $_SERVER['REMOTE_ADDR']) {
                $j[$i]->x = $_POST["x"];
                $j[$i]->y = $_POST["y"];
                $j[$i]->rt = $_POST["rt"];
                $j2[count($j2)] = $j[$i];
                $index = $i;
            } else {
                $j2[count($j2)] = $j[$i];
            }
        }
        $j = $j2;
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
        $plus = json_decode($positions["plus"]);
        if($plus[2]->immunite == 0) {
            $a = json_decode($positions["asteroide"]);
            for($i = 0; $i < count($a); $i++) {
                $posA = [
                    'x'  => $a[$i]->x,
                    'y'  => $a[$i]->y,
                    'x2' => $a[$i]->x + $tailleAsteroide[$a[$i]->t - 1]["width"] - 10,
                    'y2' => $a[$i]->y + $tailleAsteroide[$a[$i]->t - 1]["height"] - 2,
                ];
                if($j[$index]->x < $posA['x'] && $j[$index]->x > $posA['x2']) {
                  if(($j[$index]->y < $posA['y'] && $j[$index]->y > $posA['y2']) || ($j[$index]->y > $posA['y2'] && $j[$index]->y < $posA['y2'])) {
                        detruireAsteroide($i, $_POST["id"], $positions);
                        $plus[2]->immunite = 1;
                        $plus[0]->vies -= 1;
                        break;
                    }
                }
                if($j[$index]->x > $posA['x'] && $j[$index]->x < $posA["x2"]) {
                  if(($j[$index]->y < $posA['y'] && $j[$index]->y > $posA['y2']) || ($j[$index]->y > $posA['y'] && $j[$index]->y < $posA["y2"])) {
                        detruireAsteroide($i, $_POST["id"], $positions);
                        $plus[2]->immunite = 1;
                        $plus[0]->vies -= 1;
                        break;
                    }
                }
            }
        } else {
            $plus[3]->tpsImun -= 1;
            if($plus[3]->tpsImun <= 0) {
                $plus[3]->tpsImun = 100;
                $plus[2]->immunite = 0;
            }
        }
        $j = json_encode($j); $p = json_encode($plus);
        $cmd = $bdd->prepare("UPDATE jeu SET joueurs='" . $j . "', plus='" . $p . "' WHERE id=" . $_POST["id"]);
        $cmd->execute();
        echo $j;
    } else {
        echo "Mauvaise utilisation de la page...";
    }
}
?>
