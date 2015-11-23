slack-bot-joke
==============

Just tell :
```
blague
chaton
nope
excuse
film
inutile
```

And enjoy the answer!

## Build the image

```bash
docker build -t myimage .
docker run --rm -it -e SLACK_TOKEN='xxxxxxxxxxxxxxxxx' -e BOT_SERVICES='jokeProviders,chatons,poils,excusesdedev,savoirinutile,citation' myimage
```

if you do not provide BOT_SERVICES variable, all the services are enabled by default.

## Run from Docker registry

```bash
docker run --rm -it -e SLACK_TOKEN='xxxxxxxxxxxxxxxxx' denouche/slack-bot:clown
```
