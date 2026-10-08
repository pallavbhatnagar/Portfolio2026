# Ambient music

The track behind the speaker button in the nav (muted until a visitor clicks it).

- `ambient.mp3` is a 3-minute ambient loop (generated; its end flows back into its start).
- To use your own track, save it here as `ambient.mp3` (MP3 keeps it small: aim for 1-4 MB).
  A different name or format works too: set `ambient: "/assets/audio/ambient/your-file.mp3"`
  in js/content.js (the SITE settings).
- It loops, so a track that starts and ends quietly, or flows from its end back to its start, works best.
- If no file is here, the button stays hidden.
