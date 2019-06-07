// Partie 1 : thème sombre

let themes = [
    $("#theme").attr('href'),
    "https://bootswatch.com/4/darkly/bootstrap.min.css"
];
let theme_courant = 0;

function changeTheme() {
    theme_courant = (theme_courant+1) % (themes.length);
    $("#theme").attr('href', themes[theme_courant])
}

$('#theme-button').click(changeTheme);


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

$(function() {
    rechargeListeArrets();
});


// Partie 3 : chargement des horaires d'un arrêt

let arret_courant = "";
let message_bienvenue = $("#lignes").html();

function rechargeArret(montrer_chargement=false) {
    if (arret_courant === '') {
        $("#lignes").html(message_bienvenue);
    } else {
        if (montrer_chargement)
            $("#lignes").html("Chargement...");
        $.getJSON(`/arret/${arret_courant}`, changeArret);
    }
}

function changeArret(lignes) {
    let lignes_html = ``;
    for (let details_ligne of lignes) {
        let ligne = details_ligne["nom"];
        lignes_html += `<div class="ligne col-xl-3 col-sm-6 col-12"><div class="card">
                          <h2 class="card-header">${ligne}</h2><div class="card-body">`;
        for (let details_direction of details_ligne["directions"]) {
            lignes_html += directionHtml(details_direction);
        }
        lignes_html += `</div></div></div>`;
    }

    $("#lignes").html(lignes_html);
}

function directionHtml(details_direction) {
    let dictionnaire_terminus = details_direction["terminus"];
    let liste_terminus = Object.keys(dictionnaire_terminus);
    let terminus_string = liste_terminus[0];
    if (liste_terminus.length > 1) {
        terminus_string = Object.entries(dictionnaire_terminus).map(pair => `${pair[0]} (${pair[1]})`).join(" / ");
    }

    let direction_html = `<div class="direction">
                              <h3 class="card-title">${terminus_string}</h3>
                              <ul class="passages">`;
    for (let passage of details_direction["passages"].slice(0,10)) {
        if (liste_terminus.length > 1) {
            direction_html += `<li>${passage["temps"]} (${passage["no_terminus"]})</li>`;
        } else {
            direction_html += `<li>${passage["temps"]}</li>`;
        }
    }
    direction_html += `</ul></div>`;
    return direction_html;
}

$('#ligne-select').change(function() {
    arret_courant = this.value;
    rechargeArret(true);
});

$(function() {
    setInterval(rechargeArret, 30000);
});
