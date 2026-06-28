# Read API

The public, read-only API that serves your **published** content. This is what a
website, app, or any frontend fetches at runtime.

- No key or session required.
- Only ever returns the published copy of an entry. Drafts and unpublished entries
  are invisible here (they come back as `404`).
- A project is addressed by its slug in the URL, so the same content is reachable
  from anywhere.

Base URL: `https://mcp.inhalt.tech`

## List entries

```
GET /api/read/<project>/<type>
```

Returns the published entries of a content type, newest first.

| Query param | Default | Notes |
|-------------|---------|-------|
| `limit`     | `50`    | Max 200. |
| `offset`    | `0`     | For paging. |
| any other key | -     | Filters on a field value, e.g. `?category=news`. |

Any query param that is not `limit` or `offset` is treated as a field filter and
matched exactly against the published values.

**Example**

```
GET /api/read/acme-blog/post?category=news&limit=10
```

```json
{
  "entries": [
    {
      "slug": "hello-world",
      "publishedAt": "2026-06-20T10:00:00.000Z",
      "values": {
        "title": "Hello world",
        "category": "news",
        "body": "<p>...</p>"
      }
    }
  ]
}
```

## Get one entry

```
GET /api/read/<project>/<type>/<slug>
```

Returns a single published entry.

```json
{
  "slug": "hello-world",
  "publishedAt": "2026-06-20T10:00:00.000Z",
  "values": {
    "title": "Hello world",
    "category": "news",
    "body": "<p>...</p>"
  }
}
```

Returns `404` if the project, type, or slug does not exist, or if the entry has
never been published.

## Fetching from a site

Responses are plain JSON, so any HTTP client works. A typical page fetches a list
for an index and one entry for a detail page:

```js
const BASE = "https://mcp.inhalt.tech/api/read/acme-blog";

// Index page: the latest posts in the "news" category.
const { entries } = await fetch(`${BASE}/post?category=news&limit=10`)
  .then((res) => res.json());

// Detail page: one post by its slug.
const post = await fetch(`${BASE}/post/hello-world`).then((res) => res.json());
console.log(post.values.title); // "Hello world"
```

A `404` comes back as the error shape (see [API reference](README.md#error-shape)),
so check `res.ok` before reading `values`.

## Notes

- `values` holds the typed fields exactly as defined on the content type.
- Responses are plain JSON. Fetch them with anything (`fetch`, `curl`, your
  framework's data layer).
