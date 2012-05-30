import webapp2

import random
import math
import os
import string

from google.appengine.ext.webapp import template
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

class MainPage(webapp.RequestHandler):
    def get(self):
        f = open('data/mnist0.txt', 'r')
        mnist_str = f.readline()
        mnist_str = string.split(mnist_str)
        mnist = []
        for i in range(28*28):
            mnist.append(int(mnist_str[i]))
        f.close()
        
        x = []
        for i in range(28**2):
            if random.random() > .5:
                x.append(1)
            else:
                x.append(0)
    
        template_values = {
            'x': x,
            'mnist': mnist,
            }
        path = os.path.join(os.path.dirname(__file__), 'test.html')
        self.response.out.write(template.render(path, template_values))

application = webapp2.WSGIApplication([('/', MainPage)],
                                     debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
