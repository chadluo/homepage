# Home of all homes

[Example page](https://adluo.ch/homepage/example)

## Motive

To sync bookmarks between all browsers.

I use different browsers for different purpose. Browsers might have account
systems to sync bookmarks and other stuff, and some can import from others. But
there isn't a global sync mechanism. If I edit one bookmark I'll need to either
remember where else it's recorded and to change each of them.

Also there's quite a few browser extentions out there changing your browser's
new tab, like showing a random picture or having a simple GTD.

So I can just maintain an HTML doc, containing all the bookmarks I want, on my
filesystem, and I can point browser new tabs to this particular file. Vivaldi
supports this; Chrome will need another
[extension](https://chrome.google.com/webstore/detail/new-tab-redirect/icpgjfneehieebagbmdbhnlpiopdcmna).

## and more

Browsers might have bookmark bars and quickdials, but by writing your own page
you can just simulate these; and you have full control over the layout. It might
take you a few lunchbreaks to write the the layout, but later every time it just
helps you out. I would say the original motive is perfectly satisfied.

For the links you can also use other schemes like [windows settings](https://docs.microsoft.com/en-us/windows/uwp/launch-resume/launch-settings-app) or [vscode](https://code.visualstudio.com/docs/editor/command-line#_opening-vs-code-with-urls).

And you can also write JS for other functionalities. It's like the very old use
of JS, but contemporary browsers are pretty well standardised and provides many
useful APIs so it's not hard to actually implement stuff bare handed, and even
write once run in every browser.

And since this page is on your disk, it loads very fast. You can definitely
introduce other resources like images or js/css libraries even on CDN, but if it
slows down the page it's probably not that worthy.

## Interactions

Links might be only supposed to click, other elements can carry more complicated
functionalities. But every element should be swiftly and subtly reactive.
Changing colors is good, animations might be unnecessary. Nothing should change
its size and affect other elements under your cursor unless you expect that.

But this is all personal preferences. You can just make a copy of the example
and change whatever you like.

## What you can do with vanilla js

[`navigator.clipboard`](https://developer.mozilla.org/docs/Web/API/Navigator/clipboard)
is long-awaited and super useful. Some other examples use
[`localStorage`](https://developer.mozilla.org/en/docs/Web/API/Window/localStorage)
which doesn't work cross-browser but it's fine, as I can just refer to one
browser for these stored information. Supporting cross-browser storage would be
uncecessarily complicated.

Jira searcher/opener was originally to quick open the page by Jira number, and
later I start to record recent searches, and instead of complaining bad inputs I
just redirected this to search query parameter. For demonstration I'm just using
Apache's Jira. It's only concatenating url strings so it should work for other
task management systems with tweaks.

GTD is more about balancing between how much I need something and how much does
it cost to implement it. The active/inactive links are only rearranged when you
refresh the page or manually clean inactive ones, so that they don't move when
you just click on them. Clicking on an item also copies the text so that you can
paste it to other places later.

Light/dark mode is just using the
[Solarized](https://ethanschoonover.com/solarized/) colorscheme. I was thinking
of switching the color in the evening but later I just wanted to change whenever
I like. This is a case where animation is preferrable because we are changing
the whole page, but I don't want the animation when you turn on the dark mode
and refresh the page. This is more about interaction.
