# QuickNotes REST API Design

## Endpoints

| Method | Path | Description | Success Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/notes` | Retrieves a paginated list of notes for the authenticated user. | `200 OK` |
| `GET` | `/api/v1/notes/:id` | Retrieves a single note by its unique ID. | `200 OK` |
| `POST` | `/api/v1/notes` | Creates a new note. | `201 Created` |
| `PUT` | `/api/v1/notes/:id` | Replaces or updates an existing note completely. | `200 OK` |
| `DELETE` | `/api/v1/notes/:id` | Deletes a note by its ID. | `204 No Content` |
| `GET` | `/api/v1/tags` | Lists all tags associated with the authenticated user's notes. | `200 OK` |

---

## Examples

### Creating a Note (`POST /api/v1/notes`)
* **Request Body Example:**
  ```json
  {
    "title": "Project Architecture Review",
    "body": "Prepare slides and review database scaling metrics with the engineering team.",
    "tag_ids": [2, 5]
  }

  Response Body Example (201 Created):

JSON
{
  "id": 402,
  "user_id": 15,
  "title": "Project Architecture Review",
  "body": "Prepare slides and review database scaling metrics with the engineering team.",
  "created_at": "2026-10-31T08:30:00Z",
  "updated_at": "2026-10-31T08:30:00Z"
}
Listing Notes (GET /api/v1/notes)
Response Body Example (200 OK):

JSON
[
  {
    "id": 402,
    "user_id": 15,
    "title": "Project Architecture Review",
    "body": "Prepare slides and review database scaling metrics...",
    "created_at": "2026-10-31T08:30:00Z",
    "updated_at": "2026-10-31T08:30:00Z"
  }
]
Error Codes & Handling
400 Bad Request: Triggered when validation fails (e.g., missing title or title exceeding 100 characters).

401 Unauthorized: Triggered when request lacks valid authentication credentials or Bearer token.

403 Forbidden: Triggered when an authenticated user attempts to access or modify a note belonging to another user.

404 Not Found: Triggered when the requested note ID does not exist in the database.

500 Internal Server Error: Triggered by unexpected server faults or database connection timeouts.

Example Error Response Body (400 Bad Request)
JSON
{
  "error": "Bad Request",
  "status": 400,
  "message": "Validation failed: 'title' is required and must not exceed 100 characters."
}

---
