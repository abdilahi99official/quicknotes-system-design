```markdown
# QuickNotes Data Model

## Entities & Schema

1. **`users`**
   * `id`: `INTEGER` (PK, Auto-increment)
   * `username`: `VARCHAR(50)` (NOT NULL, UNIQUE)
   * `email`: `VARCHAR(100)` (NOT NULL, UNIQUE)
   * `created_at`: `TIMESTAMP` (NOT NULL)

2. **`notes`**
   * `id`: `INTEGER` (PK, Auto-increment)
   * `user_id`: `INTEGER` (FK references `users(id)`, NOT NULL)
   * `title`: `VARCHAR(100)` (NOT NULL)
   * `body`: `TEXT`
   * `created_at`: `TIMESTAMP` (NOT NULL)
   * `updated_at`: `TIMESTAMP` (NOT NULL)

3. **`tags`**
   * `id`: `INTEGER` (PK, Auto-increment)
   * `name`: `VARCHAR(30)` (NOT NULL, UNIQUE)

4. **`note_tags`** (Join Table)
   * `note_id`: `INTEGER` (FK references `notes(id)`, NOT NULL)
   * `tag_id`: `INTEGER` (FK references `tags(id)`, NOT NULL)
   * *Primary Key:* Composite `(note_id, tag_id)`

---

## Relationships
* **One-to-Many (`users` to `notes`)**: One user can author many notes, but each note belongs to exactly one user.
* **Many-to-Many (`notes` to `tags`)**: A single note can have multiple tags, and a tag can be applied to multiple notes. This relationship is resolved using the **`note_tags`** junction table.

---

## CREATE TABLE Statements
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
Example SQL Queries
1. Get all notes for a specific user
SQL
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 15
ORDER BY created_at DESC;
2. JOIN Query: Get notes associated with a specific tag name
SQL
SELECT n.id, n.title, n.body
FROM notes n
JOIN note_tags nt ON n.id = nt.note_id
JOIN tags t ON t.id = nt.tag_id
WHERE t.name = 'Work' AND n.user_id = 15;
3. Aggregate Query: Count notes per user
SQL
SELECT u.username, COUNT(n.id) AS total_notes
FROM users u
LEFT JOIN notes n ON u.id = n.user_id
GROUP BY u.id, u.username;
Recommended Index
SQL
CREATE INDEX idx_notes_user_id ON notes(user_id);
Reason: Because users frequently fetch and filter their own notes list, indexing user_id on the notes table prevents full table scans and drastically accelerates retrieval speeds.

SQL vs. NoSQL Justification
We choose SQL (Relational Database) for QuickNotes because the application domain relies on structured data with explicit relational constraints (users owning notes, and notes linked via foreign keys to tags). SQL provides robust ACID compliance, ensuring that note creation, updates, and cascading deletions maintain strict data integrity. Furthermore, relational databases effortlessly handle complex queries, aggregations, and joins required for tag filtering and user statistics.


---
