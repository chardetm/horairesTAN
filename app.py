import flask
import urllib.request

from flask import Flask, url_for, json

app = Flask(__name__)


@app.route('/')
def index():
    return flask.Response(flask.render_template(
        "horaires.html.jinja2",
        js_path=url_for("static", filename="js/horaires.js"),
        css_path=url_for("static", filename="css/horaires.css")
    ))


@app.route('/liste_arrets')
def get_liste_arrets():
    return flask.Response(
        urllib.request.urlopen("http://open.tan.fr/ewp/arrets.json").read(),
        mimetype='application/json'
    )


@app.route('/arret/<code>')
def get_arret(code):
    # Chargement des prochains passages dans l'API de la TAN
    passages_arret = json.loads(urllib.request.urlopen("http://open.tan.fr/ewp/tempsattente.json/%s" % code).read())
    lignes = {}

    # Première partie du traitement : changement de représentation des données
    for passage in passages_arret:
        ligne = passage["ligne"]["numLigne"]
        type_ligne = passage["ligne"]["typeLigne"]
        direction = passage["sens"]
        terminus = passage["terminus"]
        temps = passage["temps"]
        if not ligne in lignes:
            lignes[ligne] = {
                "nom": ligne,
                "type": type_ligne,
                "directions": {}
            }
        ligne_directions = lignes[ligne]["directions"]
        if not direction in ligne_directions:
            ligne_directions[direction] = {
                "terminus": {},
                "passages": []
            }
        direction_terminus = ligne_directions[direction]["terminus"]
        if not terminus in direction_terminus:
            direction_terminus[terminus] = len(direction_terminus)+1
        if temps == "horaire.proche":
            temps = "Proche"
        ligne_directions[direction]["passages"].append({
            "temps": temps,
            "no_terminus": direction_terminus[terminus]
        })

    # Deuxième partie : simplification du format de données (dictionnaires -> tableaux)
    lignes_tableau = []
    for ligne, infos_ligne in sorted(lignes.items()):
        lignes_tableau.append(infos_ligne)

    for infos_ligne in lignes_tableau:
        directions_tableau = []
        for direction, infos_direction in sorted(infos_ligne["directions"].items()):
            directions_tableau.append(infos_direction)
        infos_ligne["directions"] = directions_tableau

    return json.jsonify(lignes_tableau)


if __name__ == '__main__':
    app.run()
