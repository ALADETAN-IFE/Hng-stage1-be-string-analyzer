# 📘 API Documentation — HNG Stage 1 Backend (String Analyzer Service)

This API analyzes strings and stores them in-memory. It supports creating analyzed string records, retrieving records, filtering with query parameters, and a natural-language filter endpoint.

---

## Base URL

All endpoints are relative to the project root. Example local base when running:

http://localhost:5000

---

## Endpoints

### POST /strings

Create a new analyzed string record.

Request body (application/json):

```json
{ "value": "your string here" }
```

Successful response (201):

```json
{
  "id": "<sha256_hash>",
  "value": "your string here",
  "properties": {
    "length": 16,
    "is_palindrome": false,
    "unique_characters": 10,
    "word_count": 3,
    "character_frequency_map": { "y":1, "o":2, "u":1, ... },
    "sha256_hash": "<sha256_hash>"
  },
  "created_at": "2025-10-22T12:00:00.000Z"
}
```

Errors:

- 400 when `value` is missing or empty
- 422 when `value` is not a string
- 409 when the same string already exists

---

### GET /strings

Retrieve analyzed strings. Requires at least one query parameter for filtering.

Allowed query parameters (all are optional but at least one must be present):

- `is_palindrome` — "true" or "false"
- `min_length` — integer (inclusive)
- `max_length` — integer (inclusive)
- `word_count` — integer
- `contains_character` — string (case-insensitive substring match)

Example: /strings?is_palindrome=false&min_length=3

Successful response (200):

```json
{
  "data": [
    /* array of matching records */
  ],
  "count": 2,
  "filters_applied": { "is_palindrome": "false", "min_length": "3" }
}
```

Errors:

- 400 when no allowed query parameters are provided
- 400 when a parameter has invalid format (e.g., non-integer for `min_length`)
- 400 when unknown query parameters are present

---

### GET /strings/:value

Retrieve a single string record by its exact value.

Responses:

- 200 with the record
- 400 if `value` param is missing/empty
- 404 if the string is not found

---

### DELETE /strings/:value

Delete the record with the given value. Returns 204 on success, 404 if not found.

---

### GET /strings/filter-by-natural-language?query=...

Interpret a natural language query and apply filters. Supported phrases:

- "palindromic" → is_palindrome=true
- "single word" → word_count=1
- "longer than N" → min_length = N+1 (approximate)
- "containing the letter X" → contains_character = X

Responses:

- 200 with filtered records and `interpreted_query` showing parsed filters
- 400 if no filters could be parsed from the query ("Unable to parse natural language query")
- 422 if parsed filters are contradictory (e.g., min_length > max_length)

Example:
/strings/filter-by-natural-language?query=Find%20palindromic%20strings%20longer%20than%205

---

## Notes

- Data is stored in-memory (process lifetime). Restarting the server clears records.
- Provide `Content-Type: application/json` when POSTing JSON bodies.

---

## Errors (summary)

Common error responses from the API:

- 400 Bad Request — missing/invalid input or missing query parameters
- 409 Conflict — duplicate string
- 422 Unprocessable Entity — type mismatch for request body or conflicting parsed filters
- 404 Not Found — resource not present
- 500 Internal Server Error — unexpected errors

---

## Author

Aladetan Fortune Ifeloju (IfeCodes)

---

_This documentation now matches the String Analyzer service implemented in this repository._
