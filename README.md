# thumper

loopah in yah browsah

## Usage

`npm start` runs on `locahost:3000`.

`npm run build` to actually build.

## todo

[x] add visual representation of the audio to the clip display
[] sync up all looping to the playing of the root clip
  [] replace individual clip play/stop to clip enable/disable
[] click to set looping start/stop points
[] when recording a clip, add silence to the beginning to match up timing with root clip
  [] overdub if it goes too long
[] CSS

[] fix annoying clicking sound at the beginning of recording
[] allow clips to have names / generate automatically


[] audio normalization
[] click track?


[] websockets for collaboration
  [] connect to a websocket server
  [] send a message once the recording stops
  [] send state change
  [] respond to state change
  [] what do about race conditions?
