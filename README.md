# Part Counter

## Installing the project

Create a virtual environment for python and activate it.
```
python -m venv venv
source venv/bin/active
```
Install the python dependencies
```
pip install -r requirements.txt
```
Install the node dependencies
```
npm install
```
Now you are ready to run the project.

## Running the project

```
npm run server:start
npm run watch
```

## Docker
To create the docker image run
```
docker build . -t $USERNAME/$APPNAME
```