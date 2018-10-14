# Guess the Correlation Game

_This project was generated with [create-empirica-app](https://github.com/empiricaly/create-empirica-app)._

## Experiment Demo:

You and a group of friends can play with this experiment as we ran it by following these instructions (assuming you have [Meteor installed](https://www.meteor.com/install)):

1. [Download](https://github.com/amaatouq/guess-the-correlation) the repository (and unzip). Alternatively, from terminal just run:

```ssh
git clone https://github.com/amaatouq/guess-the-correlation.git
```

2. Go into the folder with `cd guess-the-correlation`
3. Install the required dependencies by running `meteor npm install`
4. Edit the `admin` password in the settings file `local.json` to something you like.
5. Run the local instance with `meteor --settings local.json`
6. Go to `http://localhost:3000/admin` (or whatever port you are running Meteor on).
7. login with the credentials username: `admin` and the password you have in `local.json`
8. Start a new batch with whatever configuration you want (see the example configuration).

### Example Config:

First, you have to enter the Configuration mode instead of the Monitoring model in the admin UI.

![config-mode][config-mode-image]

[config-mode-image]: ./readme_screenshots/configuration_mode.png

This will allow you to configure the experiment: Factors, Lobby, and Treatments:

![config-mode-inside][config-mode-inside-image]

[config-mode-inside-image]: ./readme_screenshots/configuration_mode_inside.png

Now, you have the option to create your own configuration (see below) or load an example configuration by clicking on `import` and then choosing the file `./example-config.yaml`.
Loading the example configurations will choose some example values for the factors (i.e., independent variables), lobby configuration, and few treatments.

The example factors will look like this:
![factors][factors-img]

[factors-img]: ./readme_screenshots/factors_example.png

And the example treatments will look like this:
![treatments][treatments-img]

[treatments-img]: ./readme_screenshots/treatments_example.png

Finally, you can go back to the Monitoring mode:

![monitoring-mode][monitoring-mode-image]

[monitoring-mode-image]: ./readme_screenshots/monitoring_mode.png

Now the **_Batchs_** tab make sure you add a new batch, add the treatments you want, choose your lobby configurations, and then **_start_** the batch.

![batches][batches-img]

[batches-img]: ./readme_screenshots/new_batch.png

Go to `http://localhost:3000/` and enjoy! If you don't have 3 friends to play with you, you always can use the `new player` button in development (for more details see this), which can add an arbitrary number players to the experiment while staying in the same browser (i.e., no need to open different browsers).

![game][game-img]

[game-img]: ./readme_screenshots/game.png

## Changing the experiment to make it your own

The experiment is built with Empirica, which is based on [Meteor](https://www.meteor.com/) web
development framework. In Empirica, the code is split in 2 main categories: code
running on the **client** (the browser) and code running on the **server**.
This functional separation is immediately reflected in the folders structure.

### Client

All code in the `/client` directory will be ran on the client. The entry point
for your app on the client can be found in `/client/main.js`. In there you will
find more details about how to customize how a game _Round_ should be rendered,
what _Consent_ message and which _Intro Steps_ you want to present the players
with, etc.

The HTML root of you app in `/client/main.html` shouldn't generally be changed
much, other than to update the app's HTML `<head>`, which contains the app's
title, and possibly 3rd party JS and CSS imports.

All styling starts in `/client/main.less`, and is written in
[LESS](http://lesscss.org/), a simple superset of CSS. You can also add a plain
CSS files in `/client`.

The `/client/game`, `/client/intro`, `/client/exit` directories all contain
[React](https://reactjs.org/) components, which compose the UI of your app.
If you are new to React, we recommend you try out the official
[React Tutorial](https://reactjs.org/tutorial/tutorial.html).

### Server

Server-side code all starts in the `/server/main.js` file. In that file, we set
an important Empirica integration point, the `Empirica.gameInit`, which allows
to configure each game as they are initiated by Empirica.

From there we import 2 other files. First the `/server/callback.js` file, which
contains all the possible callbacks used in the lifecycle of a game. These
callbacks, such as `onRoundEnd`, offer powerful ways to add logic to a game in a
central point (the server), which is often preferable to adding all the logic on
the client.

Finally, the `/server/bots.js` file is where you can add bot definitions
to your app.

### Public

The `/public` is here to host any static assets you might need in the game, such
as images. For example, if you add an image at `/public/my-logo.jpeg`, it will
be available in the app at `http://localhost:3000/my-logo.jpeg`.

### Settings

We generated a basic settings file (`/local.json`), which should originally only
contain configuration for admin login. More documentation for settings is coming
soon.

You can run the app with the settings like this:

```sh
meteor --settings local.json
```

## Updating Empirica Core

As new versions of Empirica become available, you might want to update the
version you are using in your app. To do so, simply run:

```sh
meteor update empirica:core
```

## Learn more

- Empirica Website: https://empirica.ly/
- Meteor Tutorial: https://www.meteor.com/tutorials/react/creating-an-app
- React Tutorial: https://reactjs.org/tutorial/tutorial.html
- LESS Intro: http://lesscss.org/#overview
- JavaScript Tutorial: https://javascript.info/
