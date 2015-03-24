
"""
Define the routes for the api
"""
import os
import math
from flask import request
from flask import url_for
from flask import redirect
from flask import render_template

from flask_user import login_required, roles_required

from redidropper.main import app

@app.route('/api/list_subject_files', methods=['POST', 'GET'])
def list_subject_files(subject_id):
    return """[
{"file_name": "123.jpg", "file_added": "today", "file_added_by": "technician 1"},
{"file_name": "xyz.jpg", "file_added": "2015-01-01 01:02:03", "file_added_by": "technician 2"},
{"file_name": "abc.jpg", "file_added": "today", "file_added_by": "technician 3"}
]"""

@app.route('/api/list_redcap_subjects', methods=['POST', 'GET'])
def list_redcap_subjects():
    """ Receives files on the server side """
    return """[
{ "id": "1", "name": "Billy Joe", "files": "3"},
{ "id": "002", "name": "Anne Blue", "files": "1"},
{ "id": "200", "name": "Maggie Magic", "files": "10"}
]"""

#@app.route('/api/upload', methods=['POST', 'GET'])
@app.route('/api/upload', methods=['POST'])
def api_upload():
    """ Receives files on the server side """

    chunkNumber = request.form['resumableChunkNumber']
    chunkSize = int(request.form['resumableChunkSize'])
    totalSize = int(request.form['resumableTotalSize'])
    identifier =request.form['resumableIdentifier']
    filename = request.form['resumableFilename']

    partfilename = "{}.part{}".format(filename, chunkNumber)

    file = request.files['file']        

    if not file:
        print "No file specified"
        return

    file.save(os.path.join(app.config['TEMP_FOLDER'], partfilename))
    currentTestChunk = 1

    # can't multiply sequence by non-int of type 'float'
    numberOfChunks = max(math.floor(totalSize/chunkSize), 1)

    # For every request recived we store the chunk to a temp folder
    # until all chunks are ready
    for i in range(1, int(numberOfChunks)+1):
        currentFileName = "{}.part{}".format(filename, i)
        if os.path.isfile(os.path.join(app.config['TEMP_FOLDER'], currentFileName)):
            if i == numberOfChunks:
                # Join the list of files
                print 'Done . You can Merge the Files'
                merge_files(numberOfChunks,filename)
        else:
            break

    return "success"

def merge_files(numberOfChunks,filename):
    print "got Values"
    print numberOfChunks
    print filename
    f = open(os.path.join(app.config['UPLOAD_FOLDER'], filename), "w")
    for i in range(1, int(numberOfChunks)+1):        
        currentFileName = "{}.part{}".format(filename, i)
        tempfile =  open(os.path.join(app.config['TEMP_FOLDER'], currentFileName), "r")
        f.write(tempfile.read())
    # delete all the files
    for i in range(1, int(numberOfChunks)+1):        
        currentFileName = "{}.part{}".format(filename, i)
        os.remove(os.path.join(app.config['TEMP_FOLDER'], currentFileName))
