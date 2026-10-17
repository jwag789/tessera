# FileDropzone

Drag files in or click to browse. Lists what was added and explains anything it turns away.

**Consumer provides:** `label`, optional `accept` (like the input's: ".pdf,.docx", "image/*"), `multiple`, `maxSize` in bytes, `files` + `onFilesChange` or `defaultFiles`, `onReject(rejected)`, `hint`, `disabled`, `name`.

**Motion:** while files are dragged over it, the zone lifts onto the hard tile shadow and its saffron tile jumps.

- It's a real file input inside a label, so it works with the keyboard and screen readers, and the hint lists the accepted types and size automatically.
- Rejections name the file and the reason ("huge.pdf is over 5.0 MB").
- Uploading is up to you: the component hands you `File` objects.
