const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.querySelector("#load-btn");
const statusEl = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");

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
