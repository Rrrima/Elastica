# ScriptLive: Adaptive Animation for Live Augmented Presentation

### To start ScriptLive:

#### Run Client:

All the interative features are available with only running the client. Only the scriptfollowing part needs to run the server.

- at root `npm install`
- `npm run start`
- in web browser, open `localhost:xxxx` to start. developed with chrome.
  NOTE: the webcam canvas and the fabric canvas alignment stiil need to be fixed. for now, resizing the browser to manually fit them.

#### Run Server:

- install venv if haven't `pip install virtualenv` (optional)
- source to venv: `source server/bin/activate`(optional)
- install dependencies: `pip install -r requirements.txt`
- open another terminal: `python server.py`
- refresh web client, the server should print `New client connected and was given id [x]`. Then they are connected.
