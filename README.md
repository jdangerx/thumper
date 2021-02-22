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
[x] add ticks in track based on scale
[] scrolling
[] scaling
[x] clip deletion - ctrl click?
[x] help text
[x] CSS - tailwind?
[x] tailwind - get rid of most inline styles
[] show pcm of clip while you're recording
[] keep track armed after recording?

[x] allow clips to have names / generate automatically

[] clip envelope editing?

[x] audio normalization
[] click track?
[] fix annoying clicking sound at the beginning of recording
[] ctrl-click to set playback pos
  [] this needs some work - get the correct playback pos from click, and make sure the events are getting propagated at the right time

[] import/export
[] websockets for collaboration
  [] connect to a websocket server
  [] send a message once the recording stops
  [] send state change
  [] respond to state change
  [] what do about race conditions?
