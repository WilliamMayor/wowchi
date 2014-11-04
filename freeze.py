from flask_frozen import Freezer
from wowchi import app, unminified_js

app.config['ROLLBAR_ENV'] = 'production'
app.config['FREEZER_DESTINATION'] = '../../gh-pages'
app.config['FREEZER_DESTINATION_IGNORE'] = ['.git*', 'CNAME']
unminified_js._set_filters('rjsmin')
freezer = Freezer(app)

if __name__ == '__main__':
    freezer.freeze()