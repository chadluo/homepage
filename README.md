# Home of all homes

## Motive

To sync bookmarks between all browsers.

Chrome and Chrome Canary can sync via Google account, Vivaldi can sync via
Vivaldi account. You can actually import bookmarks from Chrome to Vivaldi, but
it's not syncing.

Also there's quite a few browser extentions out there changing your browser's
new tab like showing a random picture or having a simple GTD.

So I can just maintain an HTML doc, containing all the bookmarks I want, on my
filesystem, and I can point browser new tabs to this particular file.

(Vivaldi supports this; Chrome will need another [extension](https://chrome.google.com/webstore/detail/new-tab-redirect/icpgjfneehieebagbmdbhnlpiopdcmna))

## and more

For showing links, the viewport is bigger than the browser bookmarks bar, and
you have more control over the layout than the predefined quickdials. It might
take you a few lunchbreaks to write the the layout, but later every time it just
helps you out. I would say the original motive is perfectly satisfied.

For the links you can also use other schemes like [windows settings](https://docs.microsoft.com/en-us/windows/uwp/launch-resume/launch-settings-app) or [vscode](https://code.visualstudio.com/docs/editor/command-line#_opening-vs-code-with-urls).

Since this is a local and static environment, it's naturally fast and allows
radical optimizations. It's probably not a bad idea even to hardcode things.

## JS in the 90's

I have some lightly more complicated examples. I know they are shit code but
they just work and saves me time and energy so I'm happy with them.

These examples use `localStorage` to store some data and it's not reserved for
another browser, but this shouldn't affect too much at least for me. Personally
I use different browsers for different purposes. I would care more about links
than recent jira searches, and I can always refer to one browser's home page for
the GTD items.

### Jira opener

It's not really slow but still takes extra steps to get to the Jira page if you
are only given the jira number, whether someone sent it to you on slack or
passed it to your ears via air vibration.

The jira opener checks the input with some simple regex. Assuming a default
project, plain numbers go to that default project, full id goes to their own
projects as well. If your environment supports JQL it can just search by text
content, or you can just build different urls here.

I'm using `localStorage` to save my recent searches and put them to links.

For demonstration I'm using Apache's Jira page because it's publicly available
and the default project is Maven. You might need some tweak if you are using
 other project management software, but if they have similar url patterns you
 should be able to work with them.

### GTD

If you feel excited about writing a simple GTD in vanilla.js, please visit your
nearest clinic right away as I did.

New items active by default. Click on the content toggles active/inactive. They
will be reordered only when you refresh. Inactive items can be cleaned.