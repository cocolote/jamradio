## [JamRadio](https://jamradio.herokuapp.com/)

This a basic player that uses Soundcloud API to download the music

* Radios:
  This are playlist generated based on a genre or an artist name

* My Playlist
  This is the user personal playlist of individual songs. with the like button
  the user can add a song that is playing on the radio to listen later.

* Jams
  This is the social part of the radio. A user can create a new Jam and invite
  some friends to create a playlist together.

* Ruby version: 2.0.0

#### Configuration

To have the app up and running first clone the repository
````
$ git clone https://github.com/cocolote/jamradio.git
cd jamradio
bundle install
rake db:create
rake db:migrate
````

<tt>rake doc:app</tt>.

[![Build Status](https://travis-ci.org/cocolote/jamradio.svg?branch=master)](https://travis-ci.org/cocolote/jamradio) [![Code Climate](https://codeclimate.com/github/cocolote/jamradio.png)](https://codeclimate.com/github/cocolote/jamradio) [![Coverage Status](https://coveralls.io/repos/cocolote/jamradio/badge.png)](https://coveralls.io/r/cocolote/jamradio)
