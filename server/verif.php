<?php
function verifierParametre($p) {
    // Vérifie s'il n'y a pas d'injection SQL à l'intérieur des paramètres
    if(!is_numeric($p)) {
        echo "Pas d'injections SQL ici :p";
        die();
    } else {
        return (int) $p;
    }
}
?>
