# bwex
BrightWheel Coding Exercise

## How To Install
### Docker
```
git clone git@github.com:mcampbell/bwex.git
cd bwex/node
docker build -t mcampbell/bwex .
docker run -d -p 3000:3000 --name bwex mcampbell/bwex
```

This should run the image in the background.  You may now use your http client of choice
to hit the various endpoints.  I like `http`. (https://httpie.io/)

You may adjust the port with the `-p x:3000` option, where `x` is whatever port you want
your host to "see" the service on.  I chose 3000, but that's often used so you can choose
another.  The examples below all assume 3000.

Note: Testing is more easily done from the "Native" install.  You can `docker exec` into
the container if you are willing.

### Stopping/Killing
```
docker stop bwex
```

You will need to `docker rm bwex` if you want to run again from scratch.

### "Native" install
```
# Ensure node is installed; I used the current version 16.8.
git clone git@github.com:mcampbell/bwex.git
cd bwex/node
npm install
nodemon index.js
```

You should now be able to hit the endpoint on port 3000.  There is no configuration for a
port, though that would be easy to provide.  (I'd use
https://www.npmjs.com/package/dotenv, likely.)

### Usage/Examples

(All using http from the above link)

Check if service is running: `http get localhost:3000/ping`

Note: The following syntax is a convenience for creating a `POST` body in `httpie` using
key:value pairs.  You may also pipe it a "normal" JSON body.  The `-v` parameter shown
below is "verbose", so you can see exactly what it's sending to the endpoint.

Or of course, use `wget`, `curl`, `postman`, etc.

Hit the email endpoint (*default* spendgrid provider):
```
http -v post localhost:3000/email \
    to=michael.campbell@gmail.com \
    to_name=michael \
    from=bill@example.com \
    from_name=bill \
    subject="test subject" \
    body='<h1>Weekly Report</h1><p>You saved 10 hours this week!</p>'
```

Hit the email endpoint (*specifically* the spendgrid provider):
```
http -v post localhost:3000/email \
    to=michael.campbell@gmail.com \
    to_name=michael \
    from=bill@example.com \
    from_name=bill \
    subject="test subject" \
    body='<h1>Weekly Report</h1><p>You saved 10 hours this week!</p>' \
    provider=spendgrid
```

Hit the email endpoint (mailgun provider):
```
http -v post localhost:3000/email \
    to=michael.campbell@gmail.com \
    to_name=michael \
    from=bill@example.com \
    from_name=bill \
    subject="test subject" \
    body='<h1>Weekly Report</h1><p>You saved 10 hours this week!</p>' \
    provider=mailgun
```

You can play around with leaving off required body components, or no body at all, or
malformed emails etc to check validation.

## Testing
I've chose Cypress.io for testing.  As such you may run it in GUI mode (`npm run
test:open`) or headless mode (`npm run test:run`).

It does assume the server is running, and on port 3000.

######################
Note:  You may see an error on Linux:
```
Your system is missing the dependency: Xvfb

Install Xvfb and run Cypress again.
```

Run `sudo apt install xvfb` to fix and try `npm run test:run` again.
######################


## Tech Choices
### Implementation
Since I am working with {java|type}script currently, this is what I chose for an
implementation language, since it would be quickest for me.

`node.js` plus `express` is the perhaps obvious choice in that area for server-side,
having access to an enormous library of tools, tooling, etc.

### Installation
I chose Docker as an installation mechanism due to its ubiquity and "surgical" method of
install/uninstall; it won't "pollute" anyone's development environment if I happened to
have chosen a different version of any of the tools I've landed on.

### Testing
https://www.cypress.io/ Mostly familiarity, but it also provides a common testing
framework for front and back ends.  You can also mock network calls with it, but I have
run into a snag there and was unable for this task given the time.  (See "Misc")


### Libraries
https://www.npmjs.com/package/html-to-text, since it works more or less out of the
box, and would handle a lot more cases than I would have been able to do in a couple hours
along with everything else.  I'm a big fan of "buy, don't build", when you're doing
something outside your domain's core competency.  Doing so has tradeoffs though, explained
below.

https://axios-http.com/ for http client functionality; it is one of the de-facto standards
if you choose not to use the built-in `fetch`.  It is also marginally more sane for
returning json.

ramda (https://ramdajs.com/) is a general purpose functional utility library that I just
install as a matter of routine since I generally end up using 1 or more functions from
it.

https://www.npmjs.com/package/is-email for email validation.  I've used it before and
although it's essentially just a big regex ("Now you have 2 problems..." -- jwz), its one
I'd rather have someone else maintain.


## Tradeoffs

### "Buy, Don't Build"
When you use a library from someone else, you're adopting all their issues, design
decisions, un-needed functionality/bloat, and lack of ability to change it if needed.
However, one can view this as offloading the day-to-day maintenance to someone else who's
better equipped to handle it.  I COULD grow all my own food for example, but I don't.

Too, having many eyes on a library pointing out issues is better than just mine.


## Misc

The documentation specifies to convert the incoming mail "body" from HTML to text, but
both provider examples use the initial HTML, passed through as-is.  I'm unsure as to where
the text conversion comes into play.  I'll return it as a response to show that it can be
done.

I spent on the high side of 3 hours on coding; I tend to think and tweak and debug a lot
as I go.  The documentation and some of the testing was on top of that.

As much as I have played up Cypress, I was unable to get it to mock/stub a network
response.  This works for me in my "day job", so I am unsure where I've gone wrong here,
but given the time constraints I have to leave it at mostly happy path with a smidgen of
testing things in each provider that wouldn't occur in the other.
