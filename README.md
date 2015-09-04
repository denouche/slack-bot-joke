slack-bot-joke
==============

## Build the image

```bash
docker build -t myimage .
docker run --rm -it -e SLACK_TOKEN='xxxxxxxxxxxxxxxxx' myimage
```


## Run from Docker registry

```bash
docker run --rm -it -e SLACK_TOKEN='xxxxxxxxxxxxxxxxx' denouche/slack-bot:clown
```

