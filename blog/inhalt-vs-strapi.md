Strapi and Inhalt agree on a lot: open source, self hosted, your database, no seat bill. Both are the kind of tool you run yourself and own end to end. Where they split is the admin app. Strapi ships one and asks you to keep it running. Inhalt has none.

Inhalt is ours, so read this as the honest case and weigh it yourself.

## The short version

- **Strapi** is an open source, self hosted CMS with an admin app built in.
- **Inhalt** is open source and self hosted too, but drops the admin app. Content is exposed through the Model Context Protocol, so an AI client edits it by chatting.
- Both keep your content and keys on your own setup.

## Where they line up

- **Open source.** Both are free to run and yours to own.
- **Self hosted.** Both run on your own servers, your database, your keys.
- **No seat bill.** Neither charges per editor.

## Where they part ways

### The admin app

Strapi comes with an admin panel your team logs into and that you keep patched and running. Inhalt has no panel. The AI client you already use becomes the way you read and change content.

### How the schema is defined

Strapi lets you shape content types in its admin UI. With Inhalt the schema lives in your code, where you can read it and review changes to it like any other part of the codebase.

### Day to day upkeep

Both need hosting, but Strapi also asks you to maintain the admin app, its plugins, and its upgrades. Inhalt is one container with less surface to keep running.

## When Strapi is the better fit

- Your team wants a built in admin app to click through.
- You rely on Strapi's plugins and the wider set of tools around it.
- You are happy owning and upgrading the whole stack, admin app included.

## When Inhalt is the better fit

- You want to keep self hosting but would rather not run an admin app.
- You like the schema living in code where it can be reviewed.
- You want editing to happen in a client your team already has open.

## The bottom line

If a built in admin app is part of what you want, Strapi is a solid self hosted pick. If the admin app is the piece you would rather not run, Inhalt keeps the open source, self hosted feel and gives you typed content and a review step without it. Take a look at [getting started](/docs/getting-started).
