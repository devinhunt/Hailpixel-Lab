import os
import socket
from bottle import route, run, static_file, template

"""
This is the simplest, dumbest content engine ever
Love, Devin
"""

PROJECT_PATH = os.path.dirname(os.path.realpath(__file__))

TEMPLATE_PATH = os.path.join(PROJECT_PATH, 'template')
STATIC_PATH = os.path.join(PROJECT_PATH, 'static')

LATEST = 1

@route('/static/<filename:path>')
def static(filename):
  return static_file(filename, root=STATIC_PATH)

@route('/')
@route('/<lab_id>')
def home(lab_id=None):
  view_id = lab_id if lab_id else LATEST
  return template("%s.html" % view_id)


if socket.gethostname() == 'web219.webfaction.com':
  run(port = 29653, server='cherrypy')
else:
  run(host='localhost', port=8000, reloader=True)