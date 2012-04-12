import random
import math
import os
import string
import cgi
import time

from types import *
from google.appengine.ext.webapp import template
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
from google.appengine.api import memcache
from google.appengine.api import users

class StoredData(db.Model):
    data = db.ListProperty(int)
    
class MainPage(webapp.RequestHandler):
    def get(self):
        N = 28*28

        ''' MNIST Data 
        f = open('data/mnist0.txt', 'r')
        mnist_str = f.readline()
        mnist_str = string.split(mnist_str)
        mnist = []
        for i in range(N):
            mnist.append(int(mnist_str[i]))
        f.close()
        '''
        
        ''' Read Data '''
        queries = db.GqlQuery("SELECT * FROM StoredData")
        query = queries.get()
        #query.delete()

        if type(query) is NoneType:
            x_pre = []
            for i in range(N):
                if random.random() > 0.5:
                    x_pre.append(1)
                else:
                    x_pre.append(0)
            query = StoredData()
        else:
            x_pre = []
            for i in range(N):
                x_pre.append(int(query.data[i]))
        
        start = time.clock()

        
        ''' Boltzmann machine '''
        h = []
        for i in range(N):
            h.append(2)
            
        w = []
        for i in range(N*N):
            w.append(0)
            #w.append(random.normalvariate(.01,1))
            #w.append(10/N)
            
        for i in range(N):
            for j in range(i+1,N):
                if i > N/2:
                    w[i*N+j] = 0.02
                w[i+1+N*j] = w[i*N+j]
                
        u = []
        for i in range(N):
            u.append(0)

        f = []
        for i in range(N):
            for j in range(N):
                u[i] += w[i*N+j]*x_pre[j]
            u[i] = u[i] - h[i]
        
            f.append( 1/(1+math.exp(-u[i]/1)) )
            
        x = []
        for i in range(N):
            if random.random() < f[i]:
                x.append(1)
            else:
                x.append(0) 

        stop = time.clock()
        self.response.out.write( (stop-start)/10 )

        query.data = x
        query.put()
        
        
        template_values = {
            'n': int(math.sqrt(N)),
            'x': x,
            'x_pre': x_pre,
            }     
 
        path = os.path.join(os.path.dirname(__file__), 'test3.html')
        self.response.out.write(template.render(path, template_values))

application = webapp.WSGIApplication([('/', MainPage)],
                                     debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
