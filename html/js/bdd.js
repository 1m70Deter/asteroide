var pts = 0;
function finDePartie() {
    // Cette fonction gère toutes les intéractions avec pyWebview faites en fin de partie
    // On affiche le score au joueur
    document.getElementsByClassName("score-win-parent")[0].style = "top: 0px;";
    clearInterval(trembler_rythme);
    clearInterval(dpplayer);
    clearInterval(dpSub1);
    clearInterval(dpSub2);
    clearInterval(dpj);
    document.body.removeChild(document.getElementsByClassName("player")[0]);
    document.body.removeChild(document.getElementsByClassName("sub-player1")[0]);
    document.body.removeChild(document.getElementsByClassName("sub-player2")[0]);
    pywebview.api.quitterPartie(idDeJeu);
}
function checkLength() {
    // Permet de connaître la longueur du nom et ainsi de faire perdre le focus à l'éditeur en cas de complet
    if(document.getElementsByTagName("input")[0].value.length == 3) {
        document.getElementsByTagName("input")[0].blur();
    }
}
function ecrireScore() {
    // On écrit le score dans un BDD gérée par pyWebview
    // Peu importe si la partie est en multijoueur ou non
    if(document.getElementById("nom-joueur").value.length != 3) {
        for(var i = 0; i < document.getElementsByClassName("score-win")[0].getElementsByClassName("line").length; i++) {
            document.getElementsByClassName("score-win")[0].getElementsByClassName("line")[i].style.background = "#e99";
        }
        window.setTimeout(function() {
            for(var i = 0; i < document.getElementsByClassName("score-win")[0].getElementsByClassName("line").length; i++) {
                document.getElementsByClassName("score-win")[0].getElementsByClassName("line")[i].style.background = "#eee";
            }
        }, 300);
    } else {
        var rep = pywebview.api.writeScore(document.getElementById("nom-joueur").value, pts, multijoueur, idDeJeu);
        rep.then((r) => {
            document.getElementsByClassName("score-win-parent")[0].style = "top: 0%; right: 100%;";
            document.getElementsByClassName("scoreboard-win-parent")[0].style = "top: 0%; right: 0%;";
            for(var i = 0; i < r.length; i++) {
                var p = document.createElement("p"); p.className = "ligneScore";
                p.innerHTML = "<span>" + (i+1) + "</span><span>" + r[i][1] + "</span><span>" + r[i][2] + " pts</span>";
                document.getElementsByClassName("scoreboard-win")[0].append(p);
            }
            let b = document.createElement("button"); b.textContent = "Retourner au Menu";
            b.style = "margin-top: 13px;"
            b.onclick = function() {
                pywebview.api.ouvrirMenu();
            }
            document.getElementsByClassName("scoreboard-win")[0].append(b);
        });
    }
}
