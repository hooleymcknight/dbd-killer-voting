/* 
realistically, the first thing I should do is check cache/storage
for accesstoken.
--> if I have one, I can try it out. 
    // jk, no-- I will store expiry date. check that.
--> --> I'm in? sweet.
--> --> no good? let's check out our options.

if I have a refresh token that isn't expired, I should use it.

....

access tokens die after 4 hours, so when we store them, 
let's store them with an expiry date. then we can check
that, rather than bothering to try an AT that might be
very expired.

...where is it that I think I'm gonna safely store any 
cache on an electron app?
if I store it on my server that could be safe in theory,
but what would be the point-- it would take a fetch
to get it. I might as well just fetch w/ my refresh token.
wait... lol where am I storing the refresh token?

okay maybe both are stored on the server, I fetch them,
and then I look at what I have, and make a decision 
based on that data, where I should fetch next:
- refresh the access token (RT valid, AT expired)
- start the oauth flow (RT and AT both expired)

okay, so RTs expire after 30 days. I likely won't hit 
this bc when I get a new AT, I'll get a new RT,
but I should store an RT expiry regardless to
save me a fetch.

*/

