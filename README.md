# Home of all homes

## Motive

To sync bookmarks between all browsers.

Chrome and Chrome Canary can sync via Google account, Vivaldi can sync via
Vivaldi account. You can actually import bookmarks from Chrome to Vivaldi, but
it's not syncing.

Also there's quite a few browser extentions out there changing your browser's
new tab like showing a random picture or have a simple GTD.

So I can just maintain an HTML doc, containing all the bookmarks I want, on my
filesystem, and I can point browser new tabs to this particular file.

## and more

Using the whole viewport you will have more space than the bookmark bar and more
flexible layout than the quick dial page. The most straightforward part is to
layout the links on the homepage however you want. You can definitely introduce
Bootstrap or other CSS libraries, and to be fast you might better download the
file to your filesystem as well. Or you just write everything barehand. You
don't have to be very precise so you don't need CSS resets or very complicated
polyfills so it doesn't take very much code.

You can make some links bigger and more close to the center of the viewport so
they will be as easy to reach as from speed dials.

For the links you can also use other schemes like [windows settings](https://docs.microsoft.com/en-us/windows/uwp/launch-resume/launch-settings-app) or [vscode](https://code.visualstudio.com/docs/editor/command-line#_opening-vs-code-with-urls).

## JS in the 90's

I have two slightly more complicated examples. I know they are shit code but
they just work and saves me time and energy so I'm happy with them.

### Jira opener

It's not really slow but still takes extra steps to get to the Jira page if you
are only given the jira number, whether someone sent it to you on slack or passed
through air to your ears via vibration.

The jira opener takes the text input and opens the corresponding jira page.
Assume you are working on a major project you can set a default project name, so
that any number you put in will have the name in front. Otherwise it can open
jiras from other projects.

I'm also using `localStorage` to save my recent searches and put them to links.

For demonstration I'm using Apache's Jira page and the default project is Maven.
I'm using it because it's publicly available.

### GTD

If you feel excited about writing a simple GTD in vanilla.js, please visit your
nearest clinic right away as I did.

New items active by default. Click on the content (not timestamp) toggles
active/inactive. They will be reordered only when you refresh. Inactive items
can be cleaned.