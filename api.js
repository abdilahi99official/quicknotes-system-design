const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.querySelector("#load-btn");
const submitBtn = document.querySelector("#submit-btn");
const statusEl = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");
const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");

let notes = [];

// Helper to update status message with state styling
function setStatus(message, state = "") {
    statusEl.textContent = message;
    statusEl.className = state;
}

// Reusable generic async request function with response.ok check
async function request(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    }
    return null;
}

// Render notes securely using textContent only
function renderNotes() {
    notesList.textContent = "";

    if (notes.length === 0) {
        const emptyLi = document.createElement("li");
        emptyLi.textContent = "No notes found.";
        emptyLi.style.padding = "1rem";
        emptyLi.style.textAlign = "center";
        emptyLi.style.color = "#64748b";
        notesList.appendChild(emptyLi);
        return;
    }

    notes.forEach(note => {
        const li = document.createElement("li");
        li.className = "note-card";

        const contentDiv = document.createElement("div");
        contentDiv.className = "note-content";

        const titleH3 = document.createElement("h3");
        titleH3.textContent = note.title;

        const bodyP = document.createElement("p");
        bodyP.textContent = note.body || "";

        contentDiv.appendChild(titleH3);
        contentDiv.appendChild(bodyP);

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => deleteNote(note.id, li));

        li.appendChild(contentDiv);
        li.appendChild(deleteBtn);

        notesList.appendChild(li);
    });
}

// 1. GET: Load 10 notes
async function loadNotes() {
    loadBtn.disabled = true;
    setStatus("Loading notes...", "loading");
    notesList.textContent = "";

    try {
        const data = await request(`${API_URL}?_limit=10`);
        notes = data;
        renderNotes();
        setStatus(`Loaded ${notes.length} notes from the server.`, "success");
    } catch (error) {
        setStatus(`Failed to load notes: ${error.message}`, "error");
    } finally {
        loadBtn.disabled = false;
    }
}

// 2. POST: Create note
async function createNote(event) {
    event.preventDefault();
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    // Validation
    if (!title) {
        setStatus("Validation Error: Title is required.", "error");
        titleInput.focus();
        return;
    }
    if (title.length > 100) {
        setStatus("Validation Error: Title must be 100 characters or fewer.", "error");
        titleInput.focus();
        return;
    }

    submitBtn.disabled = true;
    setStatus("Creating note...", "loading");

    try {
        const newNotePayload = {
            title: title,
            body: body,
            userId: 1
        };

        const createdNote = await request(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify(newNotePayload)
        });

        /*
           Note on JSONPlaceholder:
           JSONPlaceholder simulates server creation by returning an object with a new ID (e.g., 101),
           but it does not actually persist the record in its server-side database.
           Approach: We capture the returned object and prepend it to our client-side `notes` array
           so the user immediately sees feedback in the UI.
        */
        notes.unshift(createdNote);
        renderNotes();
        setStatus(`Note created (status 201, id ${createdNote.id}).`, "success");

        titleInput.value = "";
        bodyInput.value = "";
    } catch (error) {
        setStatus(`Failed to create note: ${error.message}`, "error");
    } finally {
        submitBtn.disabled = false;
    }
}

// 3. DELETE: Remove note
async function deleteNote(id, listItemElement) {
    const deleteBtn = listItemElement.querySelector(".delete-btn");
    deleteBtn.disabled = true;
    setStatus("Deleting note...", "loading");

    try {
        await request(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        notes = notes.filter(note => note.id !== id);
        renderNotes();
        setStatus(`Note successfully deleted (status 200/204, id ${id}).`, "success");
    } catch (error) {
        setStatus(`Failed to delete note: ${error.message}`, "error");
        deleteBtn.disabled = false;
    }
}

loadBtn.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);
