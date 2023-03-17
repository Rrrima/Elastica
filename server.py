from websocket_server import WebsocketServer
import threading
import os
import json
from gesture import HandPosAnalyzer, GestureClassifier
import torch
from torch import nn

server = None
clients = []
allHandPosResults = []
handAnalyzer = None
model = {}
device = "cuda" if torch.cuda.is_available() else "cpu"
model['left'] = GestureClassifier().to(device)
model['left'].load_state_dict(torch.load('model/gesture_left'))
model['right'] = GestureClassifier().to(device)
model['right'].load_state_dict(torch.load('model/gesture_right'))
print("model loaded!")

def new_client(client, server):
    clients.append(client)
    print("New client connected and was given id %d" % client['id'])

def client_left(client, server):
    clients.remove(client)
    print("Client(%d) disconnected" % client['id'])

def message_received(client, server, message):
    # print("Client(%d) said: %s" % (client['id'], message))
    message=json.loads(message)
    send_message(message)

def warp(name,s):
    return json.dumps({name:s})

def warpdict(dict):
    return json.dumps(dict)

def run_server():
    global server
    global clients
    server = WebsocketServer(host='127.0.0.1',port=8000)
    print('serving on port 8000...')
    server.set_fn_new_client(new_client)
    server.set_fn_client_left(client_left)
    server.set_fn_message_received(message_received)
    server.run_forever()

def send_message(message):
    global model
    global handAnalyzer
    funcname = message['name']
    params = message['params']

    if funcname == 'registerHandAnalyzer':
        # register new analyzer
        handAnalyzer = HandPosAnalyzer(model, params["handed"])
        # handPosAnalyzers[params["relatedText"]] = handAnalyzer
        print("register handpose analyzer for : {}".format(params["relatedText"]))
        result = {'name':'registerHandAnalyzer'}

    if funcname == 'destroyHandAnalyzer':
        result = {'name': "destroyHandAnalyzer"}

    if funcname == 'getAnimationParam':
        handPosArr = params['handPosArr']
        handCenterArr = params['handCenterArr']
        res =  handAnalyzer.getGestureType(handPosArr,handCenterArr )
        result = {"name":'returnAnimationParam', "gesture": res[0], "avgDis": res[1],"dirVec": res[2] }

    server.send_message_to_all(warpdict(result))

if __name__ == "__main__":
    t = threading.Thread(target=run_server)
    t.start()
