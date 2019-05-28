import flask
import urllib.request

from flask import Flask, url_for

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
    return flask.Response(
        urllib.request.urlopen("http://open.tan.fr/ewp/tempsattente.json/%s" % code).read(),
        mimetype='application/json'
    )


if __name__ == '__main__':
    app.run()
