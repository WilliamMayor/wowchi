from flask import Flask, render_template
from flask.ext.assets import Environment, Bundle

app = Flask(__name__)
app.config['ROLLBAR_ENV'] = "development"
assets = Environment(app)

css = Bundle(
    'css/main.scss',
    filters='scss,cssmin',
    output='main.min.css',
    depends=['css/*.scss', 'css/base/*.scss', 'css/base/extends/*.scss'])
assets.register('css', css)

unminified_js = Bundle(
    'js/static_data.js',
    'js/message.js',
    'js/wowchi.js',
    #'js/view_functions.js',
    #'js/save_load.js',
    'js/ready.js',
    #filters='rjsmin',
    depends='js/*.js')
js = Bundle(
    'js/vendor/knockout-3.2.0.js',
    'js/vendor/jquery-2.1.1.min.js',
    'js/vendor/underscore-min.js',
    'js/vendor/jquery.scrollintoview.min.js',
    unminified_js,
    output='main.min.js')
assets.register('js', js)

@app.route('/')
def home():
    return render_template('home.html')
