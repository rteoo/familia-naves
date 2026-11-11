# Collection receipt

- Collection date: 2026-11-11.
- Origin: https://editoranaves.com.br/ .
- Exact scope: public WordPress posts in category `12` (`blog-do-jales`).
- Category-reported count: 683.
- Retrieved pages: 7; record counts: 100, 100, 100, 100, 100, 100, 83.
- Unique post IDs: 683; all bodies nonempty; one empty title (ID 13659).
- Publication range returned by the site: 2005-11-06 through 2026-11-09. These timestamps can describe republished or backdated material; they are not proof of first publication.
- Author accounts: Jales Naves (ID 2), 679 posts; Editora (ID 1), 4 posts. Category membership and personal authorship are not identical.

## Method

Firecrawl mapped the site (500-URL cap), then fetched the site's public WordPress REST API with `maxAge: 0`. The map includes tags and navigation and is not the coverage denominator. Category enumeration is the coverage denominator.

The collection fetched each of the following seven pages, with identical fields and ascending ID ordering:

```text
https://editoranaves.com.br/wp-json/wp/v2/posts?categories=12&per_page=100&page={1..7}&orderby=id&order=asc&_fields=id,date,modified,slug,link,title,author,content
```

Taxonomy and author identity endpoints:

- https://editoranaves.com.br/wp-json/wp/v2/categories?per_page=100
- https://editoranaves.com.br/wp-json/wp/v2/users?include=1,2&_fields=id,name,slug

HTML tags were stripped, whitespace normalized and common entities decoded for discovery fields. Source URLs/timestamps/IDs were retained. Names (first 12 matches), date/year tokens (first 15 matches) and body links (first 5) are bounded automatic indexes, not complete extraction or human validation. Article prose and media were not mirrored. Focused summaries are original paraphrases of inspected articles.

A direct Python HTTPS read was unavailable in this sandbox (WinError 10013); the Firecrawl connector retrieved all seven API pages successfully. A live response was requested; this is a dated capture, not a permanent freshness guarantee.

## Boundaries

No Blogger collection, comments, drafts, password-protected posts, site pages, magazine PDFs, books, images or off-site linked pages were collected. Links to those resources may remain in source records. The count validates this public category, not all material ever published by Jales. No civil certificates or archival scans were independently authenticated. Earlier supplied drafts and Elma's correction are explicitly marked when discussed.

ID 13659 has no title in the API and is preserved under its ID rather than inventing a title. Similar or repeated posts are not merged automatically.

## Validation

The final local validation checks 683 unique catalogue anchors, one source URL per entry, matching yearly totals, valid internal Markdown links/anchors, UTF-8 decoding, and absence of Blogger URLs in the collection. It does not certify the historical accuracy of the source.
