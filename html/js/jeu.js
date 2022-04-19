// Avant toutes choses, vérifions si la partie est multijoueur grâce à l'URL :
var multijoueur = 0, ip = "", idDeJeu = 0, posChange = false;
window.setTimeout(function() {
    try {
        var rep = pywebview.api.lireConf();
        rep.then((r) => {
            multijoueur = r.multij;
            ip = r.jip;
            idDeJeu = document.getElementById("idPartie").textContent = r.jid;
            if(multijoueur == 0) {
                document.getElementById("idPartie").style.display = 'none';
            }
        });
    } catch(e) {
        console.warn("Pas d'API disponible : " + e);
    }
}, 100);

// Variables plus globales :
var mvt = [0, 0, 0, 0], tir = false;
var j1 = {
    rt : 0,
    x : document.getElementsByTagName("html")[0].offsetWidth / 2,
    y : document.getElementsByTagName("html")[0].offsetHeight / 2,
    centre : {
        x : 0,
        y : 0
    },
    vie : 3
}
var oldx = j1.x, oldy = j1.y, oldrt = j1.rt;

window.setTimeout(function() {
    if(multijoueur == 1) {
        var rep = pywebview.api.getPosition(idDeJeu);
        rep.then((r) => {
            posJ = JSON.parse(r.split("|")[1]);
        });
        window.setTimeout(function() {
            if(indexJ != -1 && posJ.length != 1) {
                posJ[0], posJ[indexJ] = posJ[indexJ], posJ[0];
            }
            j1.x = posJ[0].x; j1.y = posJ[0].y
        }, 100);
    }
    posChange = true;
}, 250);

function changerPosJoueur(j) {
    /*
        Cette fonction permet de changer les déplacements du joueur J1.
        Elle met à jour les variables présentes dans j1
        Liste des mouvements :
            * mvt[0] => Avancer
            * mvt[1] => Tourner dans le sens des aiguilles d'une montre
            * mvt[2] => Reculer
            * mvt[3] => Tourner dans le sens inverse des aiguilles d'une montre
    */
    j.x = Number(j.x), j.y = Number(j.y), j.rt = Number(j.rt)
    if(mvt[0] == 1) {
        j.x += Math.cos((j.rt*Math.PI)/180) * 5;
        j.y += Math.sin((j.rt*Math.PI)/180) * 5;
    }
    if(mvt[1] == 1) {
        j.rt += 3;
    }
    if(mvt[2] == 1) {
        j.x -= Math.cos((j.rt*Math.PI)/180) * 2;
        j.y -= Math.sin((j.rt*Math.PI)/180) * 2;
    }
    if(mvt[3] == 1) {
        j.rt -= 3;
    }
    if(j.x > 1010) {
        j.x = -50;
    }
    if(j.x < -50) {
        j.x = 1005;
    }
    if(j.y > 760) {
        j.y = -30;
    }
    if(j.y < -30) {
        j.y = 755;
    }
    // Événement lié au toucher d'un Astéroïdes
    for(var i = 0; i < document.getElementsByClassName("asteroide").length; i++) {
        var a = document.getElementsByClassName("asteroide")[i];
        var posA = {
            x: Number(a.id.split(":")[0]) + 10,
            y: Number(a.id.split(":")[1]) + 2,
            x2: Number(a.id.split(":")[0]) + Number(a.offsetWidth) - 10,
            y2: Number(a.id.split(":")[1]) + Number(a.offsetHeight) - 2,
        }
        if(j.x < posA.x && j.x > posA.x2) {
            if((j.y < posA.y && j.y > posA.y2) || (j.y > posA.y && j.y < posA.y2)) {
                perdreVie(a);
            }
        }
        if(j.x > posA.x && j.x < posA.x2) {
            if((j.y < posA.y && j.y > posA.y2) || (j.y > posA.y && j.y < posA.y2)) {
                perdreVie(a);
            }
        }
    }
}
// Avance les doubles décoratifs :
dpSub1 = window.setInterval(function() { document.getElementsByClassName("sub-player1")[0].style = "transform: rotate(" + j1.rt + "deg); top: " + j1.y + "px; left: " + j1.x + "px;"; }, 30)
dpSub2 = window.setInterval(function() { document.getElementsByClassName("sub-player2")[0].style = "transform: rotate(" + j1.rt + "deg); top: " + j1.y + "px; left: " + j1.x + "px;"; }, 50)

window.onkeydown = function(e) {
    if(e.key == 'ArrowUp' || e.key == "z") {
        mvt[0] = 1;
        pywebview.api.bruitage("avancer");
    }
    if(e.key == 'ArrowRight' || e.key == "d") {
        mvt[1] = 1;
    }
    if(e.key == 'ArrowDown' || e.key == "s") {
        mvt[2] = 1;
        pywebview.api.bruitage("avancer");
    }
    if(e.key == 'ArrowLeft' || e.key == "q") {
        mvt[3] = 1;
    }
    if(e.key == ' ') {
        if(j1.vie != 0) {
            tir = true;
            tirer();
        }
    }
    if(j1.vie == 0) {
        mvt = [0, 0, 0, 0]
    }
}
window.onkeyup = function(e) {
    if(e.key == 'ArrowUp' || e.key == "z") {
        mvt[0] = 0;
        pywebview.api.arreterBruitage("avancer");
    }
    if(e.key == 'ArrowRight' || e.key == "d") {
        mvt[1] = 0;
    }
    if(e.key == 'ArrowDown' || e.key == "s") {
        mvt[2] = 0;
        pywebview.api.arreterBruitage("avancer");
    }
    if(e.key == 'ArrowLeft' || e.key == "q") {
        mvt[3] = 0;
    }
    if(e.key == ' ') {
        tir = false;
    }
}
var long = 50, larg = 30; // défini la longueur et la largeur du joueur
dpplayer = window.setInterval(function() {
    changerPosJoueur(j1);
    document.getElementsByClassName("player")[0].style = "transform: rotate(" + j1.rt + "deg); top: " + j1.y + "px; left: " + j1.x + "px;";
    // On calcule les coordonnées du centre du joueur
    // Ces fonctions trigonomètriques trouvées au hasard sont incompréhensibles mais fonctionnent...
    if(Math.ceil(Math.cos((Math.PI*j1.rt)/180)) > 0) {
        j1.centre.x = 1 * (long*Math.abs(Math.cos((Math.PI*j1.rt)/180))/5)+15;
    } else {
        j1.centre.x = -1 * (long*Math.abs(Math.cos((Math.PI*j1.rt)/180))/1.25)+15;
    }
    if(Math.ceil(Math.sin((Math.PI*j1.rt)/180)) > 0) {
        j1.centre.y = 1 * (long*Math.abs(Math.sin((Math.PI*j1.rt)/180))/5)+15;
    } else {
        j1.centre.y = -1 * (long*Math.abs(Math.sin((Math.PI*j1.rt)/180))/1.25)+15;
    }
}, 10);
window.setInterval(function() {
    for(var i = document.getElementsByClassName("tir").length-1; i >= 0; i--) {
        t = document.getElementsByClassName("tir")[i];
        ta = t.id.split(";")[0];
        tx = Number(t.style.left.split("px")[0]) + (Math.cos((ta*Math.PI)/180) * 25);
        ty = Number(t.style.top.split("px")[0]) + (Math.sin((ta*Math.PI)/180) * 25);
        if(tx > document.getElementsByTagName("html")[0].offsetWidth + 10) {
            document.body.removeChild(t);
        }
        if(tx < -50) {
            document.body.removeChild(t);
        }
        if(ty > document.getElementsByTagName("html")[0].offsetHeight + 10) {
            document.body.removeChild(t);
        }
        if(ty < -30) {
            document.body.removeChild(t);
        }
        t.id = ta + ";" + tx + ";" + ty;
        t.style = "transform: rotate(" + ta + "deg); top: " + ty + "px; left: " + tx + "px;";
        // Toucher d'asteroides imprécis
        for(var j = 0; j < document.getElementsByClassName("asteroide").length; j++) {
            var a = document.getElementsByClassName("asteroide")[j];
            pointe = {
                x: tx + 40 * Math.cos(Number(ta)*Math.PI/180),
                y: ty + 40 * Math.sin(Number(ta)*Math.PI/180)
            };
            if(pointe.x > a.offsetLeft && pointe.x < (a.offsetLeft + a.offsetWidth)) {
                if(pointe.y > a.offsetTop && pointe.y < (a.offsetTop + a.offsetHeight)) {
                    document.body.removeChild(t);
                    detruireAsteroide(j);
                    continue;
                }
            }
        }
    }
}, 50);
cooldown = true;
function tirer() {
    if(tir == true && cooldown == true) {
        cooldown = false;
        window.setTimeout(function() {
            cooldown = true;
        }, 400)
        if(multijoueur == 0) {
            // <span class="tir" id="angle;x;y"></span>
            var t = document.createElement("span"); t.className = "tir";
            t.style = "transform: rotate(" + j1.rt + "deg); top: " + (document.getElementsByClassName("player")[0].offsetTop+j1.centre.y-3) + "px; left: " + (document.getElementsByClassName("player")[0].offsetLeft+j1.centre.x) + "px;";
            document.body.appendChild(t);
            t.id = j1.rt + ";" + (j1.x+j1.centre.x) + ";" + (j1.y+j1.centre.y);
        } else {
            pywebview.api.tirerBalle(idDeJeu, Math.floor(j1.x+j1.centre.x), Math.floor(j1.y+j1.centre.y), j1.rt);
            // La récupération de la position des balles se fait dans dpj
        }
    }
}
window.setInterval(function() {
    tirer();
}, 20);
var peutPerdreVie = true;
function perdreVie(a) {
    if(peutPerdreVie == false) {
        return false;
    } else {
        peutPerdreVie = false;
    }
    j1.vie--;
    detruireAsteroide(a);
    if(j1.vie <= 0) {
        finDePartie();
        return true;
    }
    document.getElementsByClassName("player")[0].className = document.getElementsByClassName("player")[0].className + " clignoter";
    document.getElementsByClassName("sub-player1")[0].className = document.getElementsByClassName("sub-player1")[0].className + " clignoter";
    document.getElementsByClassName("sub-player2")[0].className = document.getElementsByClassName("sub-player2")[0].className + " clignoter";
    window.setTimeout(function() {
        peutPerdreVie = true;
        document.getElementsByClassName("player")[0].className = document.getElementsByClassName("player")[0].className.split(" ")[0];
        document.getElementsByClassName("sub-player1")[0].className = document.getElementsByClassName("sub-player1")[0].className.split(" ")[0];
        document.getElementsByClassName("sub-player2")[0].className = document.getElementsByClassName("sub-player2")[0].className.split(" ")[0];
    }, 5000);
}
var posJ = [], posA = [], posT = [], indexJ = -1;
dpj = window.setInterval(function() {
    if(ip == "" | ip == "0") {
        return false;
    }
    var rep = pywebview.api.getPosition(idDeJeu);
    window.setTimeout(function() {
        rep.then((r) => {
            posJ = JSON.parse(r.split("|")[1]);
            posA = JSON.parse(r.split("|")[2]);
            posT = JSON.parse(r.split("|")[3]);
        });
        // Il faut trier les positions pour mettre celle du client en premier :
        if(indexJ != -1 && posJ.length != 1) {
            [posJ[0], posJ[indexJ]] = [posJ[indexJ], posJ[0]];
        }
        // Puis on charge toutes les positions de chaque joueur. On crée également les joueurs n'existant pas.
        for(var i = 0; i < posJ.length; i++) {
            if(posJ[i].ip == ip) {
                indexJ = i;
                continue;
            } else {
                if(typeof document.getElementsByClassName("player")[i] == "undefined") {
                    document.body.innerHTML += '<div class="player" style=" display: none;"><span class="line" style="width: 50px; transform: rotate(15deg); top: 6px; left: 0px;"></span><span class="line" style="width: 50px; transform: rotate(-15deg); top: 15px; left: 0px;"></span><span class="line" style="width: 15px; transform: rotate(60deg); top: 0px; left: -1px;"></span><span class="line" style="width: 15px; transform: rotate(-60deg); top: 8px; left: -2px;"></span></div><div class="sub-player1" style="transition: 500ms; display: none;"><span class="line" style="background: #f9f65e; width: 50px; transform: rotate(15deg); top: 6px; left: 0px;"></span><span class="line" style="background: #f9f65e; width: 50px; transform: rotate(-15deg); top: 15px; left: 0px;"></span><span class="line" style="background: #f9f65e; width: 15px; transform: rotate(60deg); top: 0px; left: -1px;"></span><span class="line" style="background: #f9f65e; width: 15px; transform: rotate(-60deg); top: 8px; left: -2px;"></span></div><div class="sub-player2" style="transition: 800ms; display: none;"><span class="line" style="background: #f85ef9; width: 50px; transform: rotate(15deg); top: 6px; left: 0px;"></span><span class="line" style="background: #f85ef9; width: 50px; transform: rotate(-15deg); top: 15px; left: 0px;"></span><span class="line" style="background: #f85ef9; width: 15px; transform: rotate(60deg); top: 0px; left: -1px;"></span><span class="line" style="background: #f85ef9; width: 15px; transform: rotate(-60deg); top: 8px; left: -2px;"></span></div>';
                }
                if(i != 0) {
                    document.getElementsByClassName("player")[i].style = "top: " + posJ[i].y + "px; left: " + posJ[i].x + "px; transform: rotate(" + posJ[i].rt + "deg);";
                }
            }
        }
        // On change ensuite les positions des asteroides
        for(var i = document.getElementsByClassName("asteroide").length-1; i >= 0; i--) {
            document.body.removeChild(document.getElementsByClassName("asteroide")[i]);
        }
        for(var i = 0; i < posA.length; i++) {
            document.body.innerHTML += asteroideElt[posA[i].t-1];
            var a = document.getElementsByClassName("asteroide")[i];
            a.id = posA[i].x + ":" + posA[i].y + ":" + posA[i].a + ":" + posA[i].t;
            a.style = "width: " + a.offsetWidth + "px; height: " + a.offsetHeight + "px; top: " + Math.floor(posA[i].y) + "px; left: " + Math.floor(posA[i].x) + "px; transform: rotate(" + Math.floor(posA[i].a) + "deg);";
        }
        // Puis on met à jour la position des balles
        for(var i = document.getElementsByClassName("tir").length-1; i >= 0; i--) {
            document.body.removeChild(document.getElementsByClassName("tir")[i]);
        }
        for(var i = 0; i < posT.length; i++) {
            var t = document.createElement("span"); t.className = "tir";
            t.style = "transform: rotate(" + posT[i].a + "deg); top: " + posT[i].y + "px; left: " + posT[i].x + "px;";
            document.body.appendChild(t);
            t.id = posT[i].a + ";" + posT[i].x + ";" + posT[i].y;
        }
        // Si la position du joueur à changé, on le signale à la base de données
        if(posChange == true) {
            if(j1.x != oldx || j1.y != oldy || j1.rt != oldrt) {
                pywebview.api.postPosition(j1, idDeJeu);
                oldx = j1.x, oldy = j1.y, oldrt = j1.rt;
            }
        }
    }, 30);
}, 50);
const asteroideElt = [
    "<div class='asteroide' style='width: 150px; height: 80px;'><span class='as-line' style='top: 0px; left: 0px; width: 100px; transform: rotate(0deg);'></span><span class='as-line' style='top: 35px; left: -38px; width: 80px; transform: rotate(90deg);'></span><span class='as-line' style='top: 66px; left: 30px; width: 100px; transform: rotate(10deg);'></span><span class='as-line' style='top: 60px; left: -1px; width: 35px; transform: rotate(-21deg);'></span><span class='as-line' style='top: 25px; left: 68px; width: 90px; transform: rotate(70deg);'></span></div>",
    "<div class='asteroide' style='width: 120px; height: 125px;'><span class='as-line' style='top: 0px; left: 0px; width: 100px; transform: rotate(0deg);'></span><span class='as-line' style='top: 44px; left: -48px; width: 100px; transform: rotate(90deg);'></span><span class='as-line' style='top: 100px; left: 0px; width: 70px; transform: rotate(20deg);'></span><span class='as-line' style='top: 83px; left: 56px; width: 70px; transform: rotate(134deg);'></span><span class='as-line' style='top: 20px; left: 69px; width: 75px; transform: rotate(77deg);'></span></div>",
    "<div class='asteroide' style='width: 100px; height: 35px;'><span class='as-line' style='top: 0px; left: 0px; width: 100px; transform: rotate(0deg);'></span><span class='as-line' style='top: 11px; left: 30px; width: 75px; transform: rotate(155deg);'></span><span class='as-line' style='top: 7px; left: -7px; width: 50px; transform: rotate(41deg);'></span></div>",
    "<div class='asteroide' style='width: 70px; height: 50px;'><span class='as-line' style='top: 0px; left: 0px; width: 70px; transform: rotate(0deg);'></span><span class='as-line' style='top: 17px; left: -21px; width: 46px; transform: rotate(90deg);'></span><span class='as-line' style='top: 35px; left: 0px; width: 50px; transform: rotate(0deg);'></span><span class='as-line' style='top: 9px; left: 32px; width: 52px; transform: rotate(-65deg);'></span></div>"
];
var nbAsteroide = 0;
function apparitionAsteroides(t = Math.floor(Math.random()*4)+1, posD) {
    /*
        Les asteroides apparaissent dans les zones où il n'y a pas de joueurs.
        Il existe 4 tailles tailles d'asteroides (1, 2, 3, 4) allant du plus gros au plus petit
    */
    // posD reprsente la position d'un astéroide détruit
    // <img id="x:y:a:t" /> t => taille de l'asteroide
    var signe = Math.floor(Math.random()*2)-1;
    if(signe == 0) {
        signe++;
    }
    if(typeof posD != "undefined") {
        var posA = {
            x: posD.x + (signe * (Math.floor(Math.random()*30)+10)),
            y: posD.y + (signe * (Math.floor(Math.random()*25)+7)),
            a: Math.floor(Math.random()*360)
        }
    } else {
        var posA = {
            x: j1.x + (signe * (Math.floor(Math.random()*300)+100)),
            y: j1.y + (signe * (Math.floor(Math.random()*250)+75)),
            a: Math.floor(Math.random()*360)
        }
    }
    document.body.innerHTML += asteroideElt[t-1];
    var a = document.getElementsByClassName("asteroide")[document.getElementsByClassName("asteroide").length-1];
    a.id = posA.x + ":" + posA.y + ":" + posA.a + ":" + t;
    a.style = "width: " + a.style.width + "; height: " + a.style.height + "; top: " + posA.y + "px; left: " + posA.x + "px; transform: rotate(" + posA.a + "deg);";
    nbAsteroide++;
}
function detruireAsteroide(i) {
    if(typeof i != "number") {
        var a = i;
    } else {
        var a = document.getElementsByClassName("asteroide")[i];
    }
    if(a.id.split(":")[3] != 4) {
        const posD = {
            x: Number(a.id.split(":")[0]),
            y: Number(a.id.split(":")[1]),
            a: Number(a.id.split(":")[2])
        };
        document.body.removeChild(a);
        apparitionAsteroides(Number(a.id.split(":")[3])+1, posD);
        apparitionAsteroides(Number(a.id.split(":")[3])+1, posD);
    } else {
        document.body.removeChild(a);
    }
    trembler_asteroide();
    pts += (3 * Number(a.id.split(":")[3])); nbAsteroide--;
    document.getElementById("score").textContent = pts + " pts";
}
dpAsteroide = window.setInterval(function() {
    if(multijoueur != 0) {
        return false;
    }
    for(var i = 0; i < document.getElementsByClassName("asteroide").length; i++) {
        const attr = document.getElementsByClassName("asteroide")[i].id.split(":");
        var posA = {
            x: Number(attr[0]),
            y: Number(attr[1]),
            a: Number(attr[2])
        }
        posA.a = posA.a + Math.floor(Math.random()*3)-1;
        posA.x += Math.cos((posA.a*Math.PI)/180) * 2;
        posA.y += Math.sin((posA.a*Math.PI)/180) * 2;
        if(posA.x > 1010) { posA.x = -130; }
        if(posA.x < -130) { posA.x = 1005; }
        if(posA.y > 760) { posA.y = -200; }
        if(posA.y < -200) { posA.y = 755; }
        document.getElementsByClassName("asteroide")[i].id = posA.x + ":" + posA.y + ":" + posA.a + ":" + attr[3];
        document.getElementsByClassName("asteroide")[i].style.top = posA.y + "px";
        document.getElementsByClassName("asteroide")[i].style.left = posA.x + "px";
        document.getElementsByClassName("asteroide")[i].style.transform = "rotate(" + posA.a + "deg);";
    }
}, 50);
function nouveauxAsteroidesRegulier(t=20000) {
    if(t < 2000) {
        t = 2000;
    }
    window.setTimeout(function() {
        if(nbAsteroide < 15) {
            apparitionAsteroides();
        }
        nouveauxAsteroidesRegulier(t*0.8);
    }, t);
}
// On fait apparaître les trois premiers asteroides de la partie
if(multijoueur == 0) {
    for(var i = 0; i < 5; i++) { apparitionAsteroides(); }
    nouveauxAsteroidesRegulier();
}
