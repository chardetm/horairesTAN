// Partie 1 : thème sombre

var themes = [
    $("#theme").attr('href'),
    "https://bootswatch.com/4/darkly/bootstrap.min.css"
];
var theme_courrant = 0;

function changeTheme() {
    theme_courrant = (theme_courrant+1) % (themes.length);
    $("#theme").attr('href', themes[theme_courrant])
}

$('#theme-button').on('click', changeTheme);


// Partie 2 : chargement de la liste des arrêts

function rechargeListeArrets() {
    $.getJSON("/liste_arrets", changeListeArrets);
}

function changeListeArrets(arrets) {
    let html_select_options = `<option value="">Sélectionner un arrêt</option>`;
    for (let arret of arrets) {
        let code = arret["codeLieu"];
        let nom = arret["libelle"];
        let lignes = [];
        for (let l of arret["ligne"]) {
            lignes.push(l["numLigne"]);
        }
        html_select_options += `<option value="${code}">${nom} (${lignes.join(", ")})</option>`;
    }

    $("#ligne-select").html(html_select_options);
}


// Partie 3 : chargement des horaires d'un arrêt

var arret_courrant = "";

function rechargeArret(montrer_chargement=false) {
    if (arret_courrant === '') {
        $("#lignes").html("");
    } else {
        if (montrer_chargement)
            $("#lignes").html("Chargement...");
        $.getJSON(`/arret/${arret_courrant}`, changeArret);
    }
}

function changeArret(passages_arret) {
    lignes = mettreEnFormePassages(passages_arret);

    lignes_html = ``;
    for (let [ligne, details_ligne] of lignes) {
        lignes_html += `<div class="ligne col-xl-3 col-sm-6 col-12"><div class="card">
                          <h2 class="card-header">${ligne}</h2><div class="card-body">`;
        for (let [direction, details_direction] of details_ligne.get("directions")) {
            lignes_html += `<div class="direction">
                              <h3 class="card-title">${details_direction.get("terminus")}</h3>
                              <ol class="passages">`;
            for (let passage of details_direction.get("passages").slice(0,10)) {
                lignes_html += `<li>${passage}</li>`;
            }
            lignes_html += `</ol></div>`;
        }
        lignes_html += `</div></div></div>`;
    }

    $("#lignes").html(lignes_html);
}

function mettreEnFormePassages(passages_arret) {
    let lignes = new Map();
    for (let passage of passages_arret) {
        let ligne = passage["ligne"]["numLigne"];
        let type_ligne = passage["ligne"]["typeLigne"];
        let direction = passage["sens"];
        let terminus = passage["terminus"];
        let temps = passage["temps"];
        if (!lignes.has(ligne)) {
            lignes.set(ligne, new Map([
                ['type', type_ligne],
                ['directions', new Map()]
            ]));
        }
        let ligne_directions = lignes.get(ligne).get("directions");
        if (!ligne_directions.has(direction)) {
            ligne_directions.set(direction, new Map([
                ["terminus", terminus],
                ["passages", []]
            ]));
        }
        if (temps === "horaire.proche") {
            temps = "Proche";
        }
        ligne_directions.get(direction).get("passages").push(temps);

    }
    return lignes;
}

$('#ligne-select').on('change', function() {
    arret_courrant = this.value;
    rechargeArret(true);
});

$(function() {
    rechargeListeArrets();
    setInterval(rechargeArret, 30000);
});
