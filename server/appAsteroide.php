<?php
function apparitionAsteroides($t, $posD, $id) {
    if($t == 0) {
        $t = rand(1, 2);
    }
    $signe = rand(0, 1);
    if($signe == 0) {
        $signe = -1;
    }
    if($posD != 0) {
        $posA = [
            "x" => $posD['x'] + ($signe * rand(10, 30)),
            "y" => $posD['y'] + ($signe * rand(10, 30)),
            "a" => rand(0, 360),
            "t" => $t,
        ];
    } else {
        $posJ = json_decode(getPos($id)[1]);
        do {
            $posA = [
                "x" => rand(0, 1000),
                "y" => rand(0, 750),
                "a" => rand(0, 360),
                "t" => $t,
            ];
            $continuer = true;
            $r = sqrt(pow($posA['x'] - $posJ[0]->x, 2) + pow($posA['y'] - $posJ[0]->y, 2));
            if($r < 100) {
                $continuer = false;
            }
            if(isset($posJ[1])) {
                $r = sqrt(pow($posA['x'] - $posJ[1]->x, 2) + pow($posA['y'] - $posJ[1]->y, 2));
                if($r < 100) {
                    $continuer = false;
                }
            }
        } while($continuer == false);
    }
    return $posA;
}
?>
