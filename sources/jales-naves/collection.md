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

## Follow-up validation on 2026-11-11

All seven API pages (683 post bodies) were fetched again to reconcile the flagged years across the corpus. [Family-history notes](family-history.md#year-validation-and-reference-check) record the original wording, corroborating posts, the visually inspected linked chart, inaccessible book-reader content and remaining documentary limits. [Institutional checks for Haroldo](family-history.md#haroldo-naves--institutional-cross-check) distinguish mayoral terms, FGM mandates, award base year and reporting year.

Direct family confirmations update the [Quirinópolis notes](quirinopolis.md) and [validation status](open-questions.md) without changing the source catalogue or website. Descendant counting is deferred until descendant records are validated, as requested. The supplied local biographies `sources/bio/neyde-aparecida.md` and `sources/bio/gilmar-alves.md` were inspected and left unchanged. Their claims are not automatically promoted to independently verified facts. These locally supplied files are outside the original 18-file collection and are ignored by the current workspace rule; this update does not change that rule or publish them.

The additional [supplied PDF and screenshot review](pdf-review.md) covers all 14 PDF pages, using text extraction and visual rendering. It preserves the PDF's SHA-256, physical-page references, source conflicts and distinction between compiled charts and original records. The PDF and attached screenshot were not changed or uploaded. The original 683-record catalogue remains unchanged; the PDF review is a separate local validation note outside the original 18-file collection.
