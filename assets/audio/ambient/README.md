# Ambient music

The track behind the speaker button in the nav (muted until a visitor clicks it).

- Replace `ambient.wav` with your own track. The current one is a generated
  placeholder (a soft 52-second loop).
- MP3 is smaller: save it as `ambient.mp3` and set `ambient: "/assets/audio/ambient/ambient.mp3"`
  in js/content.js (the SITE settings), or keep the .wav name.
- It loops, so a track that starts and ends quietly works best.
- Keep it light (about 2-4 MB) so it starts quickly.
- If no file is here, the button stays hidden.
