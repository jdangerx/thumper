# thumper

loopah in yah browsah

## Usage

`npm start` runs on `locahost:3000`.

`npm run build` to actually build.

## todo

[x] add visual representation of the audio to the clip display
[x] fix recording time
[x] add notion of pausing (oh! then we don't have to get rid of the requestAnimationFrame)
[x] recording preserves current play state
[x] play audio again
[x] pause audio, when paused (on play, figure out where in each buffer we need to start playing from)
[x] playback timeline
[x] looping
  [x] have to be able to play audio from the middle
  [x] make loop start/end handles draggable instead of using the weird input
[x] drag clips
[x] unarm track after recording
[] add ticks in track based on scale
[] scrolling
[x] clip deletion - ctrl click?
[x] help text
[] CSS - tailwind?

[x] allow clips to have names / generate automatically

[] clip envelope editing?

[] audio normalization
[] click track?
[] fix annoying clicking sound at the beginning of recording

[] websockets for collaboration
  [] connect to a websocket server
  [] send a message once the recording stops
  [] send state change
  [] respond to state change
  [] what do about race conditions?
