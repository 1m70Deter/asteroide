for(var i = 0; i < Math.floor(Math.random()*30)+30; i++) {
    e = document.createElement("span");
    e.className = "etoile";
    e.id = Math.floor(Math.random()*screen.width) + ";" + Math.floor(Math.random()*screen.height);
    document.body.append(e);
}
function fond_etoile() {
    for(var i = 0; i < document.getElementsByClassName("etoile").length; i++) {
        e = document.getElementsByClassName("etoile")[i];
        var ex = Number(e.id.split(";")[0]) + (Math.floor(Math.random()*3)-1), ey = Number(e.id.split(";")[1]) + (Math.floor(Math.random()*3)-1);
        e.id = ex + ";" + ey;
        e.style = "top: " + ey + "px; left: " + ex + "px;";
    }
}
window.setInterval(function() {
    fond_etoile();
}, 3000);
fond_etoile();
function trembler_asteroide() {
    // Fait trambler la fenêtre de droite à gauche lors de la destruction d'un asteroide
    document.body.className = "body-shake";
    window.setTimeout(function() {
        document.body.removeAttribute("class");
    }, 200);
}
col = ["#68d5f7", "#f7f568", "#81f768", "#f768ab"]
trembler_rythme = window.setInterval(function() {
    document.body.style.transition = "0ms";
    document.body.style.top = "7px";
    if(multijoueur == 0) {
        for(var i = 0; i < document.getElementsByClassName("asteroide").length; i++) {
            var bgCol = col[Math.floor(Math.random()*4)];
            for(var j = 0; j < document.getElementsByClassName("asteroide")[i].getElementsByTagName("span").length; j++) {
                document.getElementsByClassName("asteroide")[i].getElementsByTagName("span")[j].style.background = bgCol;
            }
        }
    }
    window.setTimeout(function() {
        document.body.style.transition = "200ms";
        document.body.style.top = "0px";
        if(multijoueur == 0) {
            for(var i = 0; i < document.getElementsByClassName("asteroide").length; i++) {
                for(var j = 0; j < document.getElementsByClassName("asteroide")[i].getElementsByTagName("span").length; j++) {
                    document.getElementsByClassName("asteroide")[i].getElementsByTagName("span")[j].style.background = "#fff";
                }
            }
        }
    }, 462);
}, 923);
