"""
Goal: Implement the default-config and test-config clases

@authors:
    Andrei Sura             <sura.andrei@gmail.com>
    Ruchi Vivek Desai       <ruchivdesai@gmail.com>
    Sanath Pasumarthy       <sanath@ufl.edu>
"""

import os
from datetime import timedelta
import logging

_basedir = os.path.abspath(os.path.dirname(__file__))
LOG_LEVEL = logging.DEBUG


class DefaultConfig(object):

    """ Default configuration data """

    # @see http://flask.pocoo.org/docs/0.10/config/
    SERVER_NAME = 'localhost:5000'

    # the browser will not send a cookie with the secure flag set over an
    # unencrypted HTTP request
    SESSION_COOKIE_SECURE = True

    # https://www.owasp.org/index.php/Session_Management_Cheat_Sheet
    # flask.pocoo.org/docs/0.10/api/#flask.Flask.permanent_session_lifetime
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=30)

    DEBUG = False
    TESTING = False
    DEBUG_TB_ENABLED = False

    # Set to True in order to view every redirect in the debug toolbar
    DEBUG_TB_INTERCEPT_REDIRECTS = False

    # email config
    MAIL_SENDER_SUPPORT = os.getenv(
        'REDIDROPPER_MAIL_SENDER_SUPPORT',
        'admin@dropper.ctsi.ufl.edu')
    MAIL_SERVER = os.getenv(
        'REDIDROPPER_MAIL_SERVER',
        'smtp.gmail.com')
    MAIL_PORT = os.getenv('REDIDROPPER_MAIL_PORT', 465)
    # MAIL_PORT = os.getenv('REDIDROPPER_MAIL_PORT', 587)
    MAIL_USE_TLS = False
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.environ.get('REDIDROPPER_MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('REDIDROPPER_MAIL_PASSWORD')

    print MAIL_SERVER, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD
    # Database configuration is stored outside version control
    # in the `application.cfg` file
    DB_HOST = ''
    DB_NAME = ''

    SECRET_KEY = os.getenv('SECRET_KEY', 'insecure_key')
    # Limit the max upload size for the app to 20 MB
    # @see https://pythonhosted.org/Flask-Uploads/
    DEFAULT_MAX_CONTENT_LENGTH = 20 * 1024 * 1024
    MAX_CONTENT_LENGTH = os.getenv(
        'REDI_DROPPER_MAX_CONTENT_LENGTH',
        DEFAULT_MAX_CONTENT_LENGTH)

    # THREADS_PER_PAGE = 8
    CSRF_ENABLED = True
    CSRF_SESSION_KEY = ""

    # http://effbot.org/librarybook/os-path.htm
    # @TODO: add code to check for valid paths
    INCOMING_TEMP_DIR = os.getenv('REDI_DROPPER_INCOMING_TEMP_DIR',
                                  os.path.expanduser('~/.redidropper/temp'))

    INCOMING_SAVED_DIR = os.getenv('REDI_DROPPER_NCOMING_SAVED_DIR',
                                   os.path.expanduser('~/.redidropper/saved'))


class DebugConfig(DefaultConfig):

    """ Extra flag for debugging """
    DEBUG_TB_ENABLED = True
    DEBUG_TB_INTERCEPT_REDIRECTS = False


class TestConfig(DefaultConfig):

    """ Configuration for running tests """
    TESTING = True
    CSRF_ENABLED = False

    DATABASE = 'tests.db'
    DATABASE_PATH = os.path.join(_basedir, DATABASE)

    run_fast = True
    if run_fast:
        SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    else:
        # If we want to inspect the results we can use a file instead of memory
        SQLALCHEMY_DATABASE_URI = 'sqlite:///' + DATABASE_PATH
