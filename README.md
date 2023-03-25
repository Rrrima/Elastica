# ScriptLive: Adaptive Animation for Live Augmented Presentation

### To start ScriptLive:

#### Run Client:

All the interative features are available with only running the client. Only the scriptfollowing part needs to run the server.

- `npm install`
- `npm run start`
- in web browser, open `localhost:xxxx` to start. developed with chrome.
  NOTE: the webcam canvas and the fabric canvas alignment stiil need to be fixed. for now, resizing the browser to manually fit them.

#### Run Server;`:

- install venv if haven't `pip install virtualenv`
- source to venv: `source server/bin/activate`
- install dependencies: `pip install -r requirements.txt`
- open another terminal: `python server.py`
- refresh web client, the server should print `New client connected and was given id [x]`. Then they are connected.

NOTE: not all the dependencies are needed. not using the server for gesture detection anymore... you might encounter some <model path> not found. We don't need those so just comment codes related to that. (I def need to clean up the server code...)

### :bug:

[-] latency in handpose detection \
[ ] logic error in preview update animation \
[ ] seesawing animation relative position not correct

### :cake:

[ ] two hand gesture customization \
[ ] rotation adaptation
