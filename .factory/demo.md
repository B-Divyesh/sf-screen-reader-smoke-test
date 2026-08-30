# Demo sandbox

## Entry point

- Production: <https://screen-reader-smoke-test.sociobot.in/demo/>
- Local: run `npm run dev:site`, then open `/demo/` on the printed origin.

The home page links to the demo with the visible action “Try it with sample
data.” The direct `/demo/` URL opens the same populated state.

## Sample data

The playground contains an approved three-event signup transcript and a
received transcript with a changed status announcement at event 3. Both inputs
are editable. “Compare transcripts” runs the package's exported comparison
logic and marks the first changed event.

## Isolation and reset

The banner reads “Demo — sample data, nothing is saved.” The demo does not read
or write cookies, localStorage, sessionStorage, IndexedDB, or a backend. Its
sample state exists only in the page's form controls. “Reset demo” restores the
bundled sample and “Start for real” opens the package install section.

The service worker caches the public demo shell for offline use. That cache
contains only shipped assets and is not a real-data namespace.
