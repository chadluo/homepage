# Home of all homes

## Motive

To sync bookmarks between all browsers.

A static page would do a lot of work. I just added a simple backend to make it
more powerful, like syncing dynamic data cross browsers.

I'm setting the page (whether it's `file` or `http` schema) as browser new tab
default page. Vivaldi and Edge supports this; Chrome will need another
[extension](https://chrome.google.com/webstore/detail/new-tab-redirect/icpgjfneehieebagbmdbhnlpiopdcmna).

For the links you can also use other schemes like [windows settings](https://docs.microsoft.com/en-us/windows/uwp/launch-resume/launch-settings-app) or [vscode](https://code.visualstudio.com/docs/editor/command-line#_opening-vs-code-with-urls).

## Usage

1. clone here
2. `npm i`
3. add your bookmarks/configs to `homepage.html` and `app.js`
4. `npm start`

## Explanations

JIRA opener is the first dynamic part I felt I need, and it's just regex and url
string concatenation, and later I wanted to store recently searched jiras and
show them as links. 

GTD is similar but does slightly more. Clicking on an item toggles active or
inactive and copies the text content in case you'll need it elsewhere. If the
text begins with something looks like a jira number it actually inserts it as a
more persistant note to the recent jira search area.

DOM APIs like
[`navigator.clipboard`](https://developer.mozilla.org/docs/Web/API/Navigator/clipboard)
and
[`localStorage`](https://developer.mozilla.org/en/docs/Web/API/Window/localStorage)
are quite powerful for these tasks.
