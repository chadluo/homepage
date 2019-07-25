# Home of all homes

__Motive__

- To sync bookmarks between all browsers.
  - Maintain an HTML doc on fs containing the bookmark links.
  - Make this HTML doc homepage/new tab default page for browsers.
- Add features with JS since this is a HTML anyway, example
  - Jump to jira page with only jira number
    - Make it a &lt;form&gt; and keep recent search queries in `localStorage`
  - Call other search engines: concat url with search queries
  - Url schemes like [windows settings](https://docs.microsoft.com/en-us/windows/uwp/launch-resume/launch-settings-app) or [vscode](https://code.visualstudio.com/docs/editor/command-line#_opening-vs-code-with-urls)
- As simple and fast as possible. A few hundred lines of hand written
  HTML/JS/CSS should be enough for most of the stuff. Can come with necessary
  typesetting but avoid complicated decorations. Try to avoid 3rd party
  libraries.

__Decisions__

- Generate site instead of manual work.
  - Using TS for
    1. page gen
    2. compile to prod js