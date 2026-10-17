# TagInput

Free-form tags: skills, keywords, recipients. Type and press Enter or a comma to add one.

**Consumer provides:** `label`, `value` + `onChange(string[])` or `defaultValue`, optional `max`, `validate(tag, tags)` returning an error message to reject a tag, `placeholder`, `hint`, `error`, `disabled`, `name` (one hidden input per tag).

**Motion:** new tags pop in with a spring.

- Backspace in an empty field removes the last tag; each tag also has its own remove button, named "Remove React" and so on.
- Duplicates are turned away case-insensitively with a message, and text left in the field is added on blur.
- If the tags must come from a fixed list, use Combobox instead.
