const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.querySelector("#load-btn");
const statusEl = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");
const submitBtn = document.querySelector("#submit-btn");
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
        li.appendChild(contentDiv);

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

loadBtn.addEventListener("click", loadNotes);

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

        // Prepend created note to local array for UI feedback
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

noteForm.addEventListener("submit", createNote);
