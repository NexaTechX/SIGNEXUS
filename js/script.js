// Language translations
const translations = {
  en: {
    clear: "Clear",
    undo: "Undo",
    save: "Save",
    customize: "Customize your Signature",
    signatureList: "Signature List",
    error: "Please sign before saving",
    languageSelection: "Choose Language:",
    lineWidth: "Line Width:",
    lineColor: "Line Color:"
  },
  es: {
    clear: "Limpiar",
    undo: "Deshacer",
    save: "Guardar",
    customize: "Personaliza tu firma",
    signatureList: "Lista de firmas",
    error: "Por favor firma antes de guardar",
    languageSelection: "Elige el idioma:",
    lineWidth: "Ancho de línea:",
    lineColor: "Color de línea:"
  },
  fr: {
    clear: "Effacer",
    undo: "Annuler",
    save: "Enregistrer",
    customize: "Personnalisez votre signature",
    signatureList: "Liste des signatures",
    error: "Veuillez signer avant d'enregistrer",
    languageSelection: "Choisissez la langue:",
    lineWidth: "Largeur de ligne:",
    lineColor: "Couleur de ligne:"
  }
};

function updateLanguage(language) {
  document.getElementById("clear-btn").textContent = translations[language].clear;
  document.getElementById("undo-btn").textContent = translations[language].undo;
  document.getElementById("save-btn").textContent = translations[language].save;
  document.querySelector(".sig-cus").textContent = translations[language].customize;
  document.querySelector(".sig-list").textContent = translations[language].signatureList;
  document.querySelector("label[for='language']").textContent = translations[language].languageSelection;
  document.querySelector("label[for='line-width']").textContent = translations[language].lineWidth;
  document.querySelector("label[for='line-color']").textContent = translations[language].lineColor;
}

// Language selection event
document.getElementById("language").addEventListener("change", (e) => {
  const selectedLanguage = e.target.value;
  updateLanguage(selectedLanguage);
});

// Canvas variables and setup
const canvas = document.getElementById("signature-pad");
const clearBtn = document.getElementById("clear-btn");
const saveBtn = document.getElementById("save-btn");
const undoBtn = document.getElementById("undo-btn");
const lineWidthInput = document.getElementById("line-width");
const lineColorInput = document.getElementById("line-color");
const context = canvas.getContext("2d");
const display = document.getElementById("show");
let painting = false;
let drawStart = false;
let actionHistory = []; // Store saved drawings
let unsavedDrawings = []; // Store unsaved drawings

// Initialize canvas with default settings
context.lineWidth = lineWidthInput.value;
context.strokeStyle = lineColorInput.value;

// Canvas drawing functions
function startPosition(e) {
  painting = true;
  drawStart = true;
  draw(e);
}

function finishedPosition() {
  painting = false;
  context.beginPath();
  saveState(); // Save after finishing drawing
}

function draw(e) {
  if (!painting) return;
  let clientX, clientY;
  if (e.type.startsWith("touch")) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  const x = clientX - canvas.offsetLeft;
  const y = clientY - canvas.offsetTop;

  context.lineTo(x, y);
  context.stroke();
  context.beginPath();
  context.moveTo(x, y);
}

// Save each action for undo functionality
function saveState() {
  const dataUrl = canvas.toDataURL();
  actionHistory.push(dataUrl); // Store saved states
  unsavedDrawings.push(dataUrl); // Store unsaved drawings
  if (actionHistory.length > 20) actionHistory.shift(); // Limit action history
}

// Load last action state for undo
function undoAction() {
  if (unsavedDrawings.length > 0) {  // Only undo unsaved drawings
    unsavedDrawings.pop();  // Remove the last unsaved drawing
    redrawCanvas();  // Redraw the canvas based on current state
  }
}

// Redraw the canvas based on current unsaved drawings
function redrawCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  unsavedDrawings.forEach((drawing) => {
    const img = new Image();
    img.src = drawing;
    img.onload = () => {
      context.drawImage(img, 0, 0);
    };
  });
}

// Clear canvas and reset states
function clearCanvas() {
  drawStart = false;
  context.clearRect(0, 0, canvas.width, canvas.height);
  actionHistory = []; // Clear all saved actions
  unsavedDrawings = []; // Clear unsaved drawings
  display.innerHTML = ""; // Clear display
  saveState(); // Save clear state
}

// Load saved state
function loadState() {
  const savedData = localStorage.getItem("canvas");
  if (savedData) {
    const img = new Image();
    img.src = savedData;
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0);
      unsavedDrawings = []; // Reset unsaved drawings after loading a saved state
    };
  }
}

// Event listeners for canvas interaction
canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", finishedPosition);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("touchstart", startPosition);
canvas.addEventListener("touchend", finishedPosition);
canvas.addEventListener("touchmove", draw);

// Update line width and color dynamically
lineWidthInput.addEventListener("input", () => {
  context.lineWidth = lineWidthInput.value;
});

// Update line color dynamically
lineColorInput.addEventListener("input", () => {
  context.strokeStyle = lineColorInput.value;
});

// Clear canvas event
clearBtn.addEventListener("click", clearCanvas);

// Undo action event
undoBtn.addEventListener("click", undoAction);

// Save and display signature with translated error message
saveBtn.addEventListener("click", () => {
  const selectedLanguage = document.getElementById("language").value;
  if (drawStart) {
    const dataURL = canvas.toDataURL();
    let img = document.createElement("img");
    img.setAttribute("class", "signature-img");
    img.src = dataURL;
    const aFilename = document.createElement("a");
    aFilename.href = dataURL;
    aFilename.download = "Download";
    const filenameTextNode = document.createTextNode("Download");
    aFilename.appendChild(filenameTextNode);
    display.appendChild(img);
    display.appendChild(aFilename);
    actionHistory.push(dataURL); // Save the last drawn signature
    unsavedDrawings.push(dataURL); // Add to unsavedDrawings for possible undo
  } else {
    display.innerHTML = `<span class='error'>${translations[selectedLanguage].error}</span>`;
  }
});

// Load saved state
loadState();
window.onload = () => {
  drawStart = false;
  clearCanvas();
  updateLanguage("en"); // Set default language to English on load
};
