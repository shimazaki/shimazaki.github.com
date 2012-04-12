import random
import math
import os

from google.appengine.ext.webapp import template
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

class MainPage(webapp.RequestHandler):
    def get(self):
        x = []
        for i in range(50**2):
            if random.random() > .5:
                x.append(1)
            else:
                x.append(0)
    
        template_values = {
            'x': x,
            }
        path = os.path.join(os.path.dirname(__file__), 'test1.html')
        self.response.out.write(template.render(path, template_values))

application = webapp.WSGIApplication([('/', MainPage)],
                                     debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
