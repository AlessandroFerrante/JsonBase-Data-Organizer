const registrySelect = document.getElementById("registrySelect");
const newRegistryButton = document.getElementById("newRegistryButton");
const deleteRegistryButton = document.getElementById("deleteRegistryButton");
const newRegistry = document.getElementById("newRegistry");
const importFile = document.getElementById("importFile");
const exportButton = document.getElementById("exportButton");

const noteList = document.getElementById("noteList");
const headerRow = document.getElementById("headerRow");

const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const MBstorage = document.getElementById("MBstorage");

const createColumnsButton = document.getElementById("createColumnsButton");
const createTableButton = document.getElementById("createTableButton");
const addRecordButton = document.getElementById("addRecordButton");
const recordCounter = document.getElementById("recordCounter");
const numColumnsInput = document.getElementById("numColumns");
const tableArea = document.getElementById("tableArea");
const noteForm = document.getElementById("noteForm");
const tableInputsContainer = document.getElementById("tableInputs");

const modal = document.getElementById("modal");

const maxStorageSize = 5120; // 5 MB in KB

let currentColumns = [];
let columnTypes = [];
let currentRegisterName = '';

// to update the list of registers in the Select
function updateRegistryList() {
    registrySelect.innerHTML = ""; 
    const registryKeys = Object.keys(localStorage);

    registryKeys.forEach(key => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = key.replace("registro_", "");
        registrySelect.appendChild(option);
    });

    if (registryKeys.length > 0) {
        registrySelect.value = registryKeys[0];
        displayNotes();
    }
}

// to calculate and view the used local storage
function updateProgressBar() {

    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        totalSize += new Blob([value]).size;
    }

    const usedPercentage = (totalSize / (maxStorageSize * 1024)) * 100;
    const usedMB = (totalSize / 1024 / 1024).toFixed(2);
    const availableMB = ((maxStorageSize * 1024 - totalSize) / 1024 / 1024).toFixed(2);

    progressBar.value = usedPercentage;
    progressText.textContent = `Spazio rimanente: ${Math.max(0, (100 - usedPercentage)).toFixed(2)}% `;
    MBstorage.textContent = `available : ${availableMB} / 5 MB`;
}

// to view notes 
function displayNotes() {

    headerRow.innerHTML = ""; 
    noteList.innerHTML = "";  
    
    const notes = JSON.parse(localStorage.getItem(registrySelect.value)) || { columns: { names: [], types: [] }, records: [] };

    if (notes.records.length > 0) {
        const headers = notes.columns.names;
        const columnTypes = notes.columns.types;

        // create the heading of the table
        headers.forEach((header) => {
            const th = document.createElement("th");
            th.textContent = header;
            headerRow.appendChild(th);
        });

        // modify and elimination columns
        const modifyHeader = document.createElement("th");
        modifyHeader.textContent = "Modify";
        headerRow.appendChild(modifyHeader);
        modifyHeader.style.width = "40px";

        const deleteHeader = document.createElement("th");
        deleteHeader.textContent = "Remove";
        headerRow.appendChild(deleteHeader);
        deleteHeader.style.width = "40px";
        
        // create the lines of the table
        notes.records.forEach((note, index) => {
            const row = document.createElement("tr");

            headers.forEach((header, colIndex) => {
                const cell = document.createElement("td");
                const value = note[header];
                const columnType = columnTypes[colIndex]; 

                // manage the types of column
                if (columnType === "image" && value) {
                    const img = document.createElement("img");
                    img.src = value;
                    img.alt = header;
                    img.style.width = "70px";
                    img.style.height = "auto";
                    cell.appendChild(img);
                } else if (columnType === "number") {
                    cell.textContent = value != null ? value.toFixed(2) : "";  
                } else if (columnType === "date") {
                    const date = new Date(value);
                    cell.textContent = date.toLocaleDateString() || ""; 
                } else {
                    cell.textContent = value || "";
                }

                row.appendChild(cell);
            });

            // modify button
            const modifyCell = document.createElement("td");
            const modifyButton = document.createElement("button");
            modifyButton.textContent = "Modify";
            
            modifyButton.addEventListener("click", () => {
                modifyRow(index, note);
            });
            
            modifyCell.appendChild(modifyButton);
            row.appendChild(modifyCell);
            modifyCell.style.maxWidth = "min-content";

            // delete button
            const deleteCell = document.createElement("td");
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Remove";
            
            deleteButton.addEventListener("click", () => {
                deleteRow(index);
            })
            
            deleteCell.appendChild(deleteButton);
            row.appendChild(deleteCell);
            deleteCell

            noteList.appendChild(row);
        });
    }
    updateProgressBar();
    updateRecordCounter();
}

// to open the modal and create input dynamically
function modifyRow(index, note) {

    const modal = document.getElementById("modal");
    const modalForm = document.getElementById("modalForm");
    const saveChangesButton = document.getElementById("saveChanges");
    const cancelChangesButton = document.getElementById("cancelChanges");

    // types of the columns
    const notes = JSON.parse(localStorage.getItem(registrySelect.value)) || { columns: { names: [], types: [] }, records: [] };
    
    modalForm.innerHTML = "";  

    const headers = Object.keys(note);
    
    headers.forEach((header, i) => {
        const columnType = notes.columns.types[i]; // type of column

        const label = document.createElement("label");
        label.textContent = `Change ${header}:`;

        let input;

        if (columnType === "image") {
            input = document.createElement("input");
            input.type = "url"; 
            input.value = note[header];
            input.placeholder = "Insert URL image";
        } else {
            input = document.createElement("input");
            input.type = columnType;
            input.value = note[header];
            input.placeholder = `Enter ${header}`;
        }

        // modal
        const div = document.createElement("div");
        div.appendChild(label);
        div.appendChild(input);
        modalForm.appendChild(div);
    });

    modal.style.display = "block";

    document.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            saveChangesButton.click();
            modal.style.display = "none";
        }
    });

    // rescue of changes
    saveChangesButton.onclick = () => {
        const newValues = {};

        // new values ​​of all inputs
        const inputs = modalForm.querySelectorAll("input");
        inputs.forEach((input, i) => {
        
            const header = headers[i];
            let newValue = input.value;

            if (notes.columns.types[i] === "number") {
                newValue = Number(newValue); 
            } else if (notes.columns.types[i] === "date") {
                newValue = new Date(newValue); 
            }

            newValues[header] = newValue;
        });

       // update the register with the new values
        notes.records[index] = newValues;
        localStorage.setItem(registrySelect.value, JSON.stringify(notes));

        displayNotes();

        modal.style.display = "none";
    };

    cancelChangesButton.onclick = () => {
        modal.style.display = "none";
    };
}

// for the Modal
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }    
};

// to delete a row
function deleteRow(index) {
    // modal 
    const modal = document.getElementById("deleteConfirmationModal");
    const confirmButton = document.getElementById("confirmDeleteButton");
    const cancelButton = document.getElementById("cancelDeleteButton");

    modal.style.display = "flex";

    document.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            confirmButton.click();
            modal.style.display = "none";
        }
    });

    confirmButton.onclick = () => {
        const notes = JSON.parse(localStorage.getItem(registrySelect.value)) || { columns: { names: [], types: [] }, records: [] };

        // remove record from array
        notes.records.splice(index, 1);

        // update the localstorage
        localStorage.setItem(registrySelect.value, JSON.stringify(notes));

        modal.style.display = "none";

        displayNotes();
    };

    cancelButton.onclick = () => {
        modal.style.display = "none";
    }
}

// create a new register
newRegistry.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const newRegistryInput = document.getElementById("newRegistryInput");
    const registryName = newRegistryInput.value;
    
    if (registryName) {
    
        const registryKey = `registro_${registryName}`;
        if (!localStorage.getItem(registryKey)) {

            newRegistryInput.value = '';
            localStorage.setItem(registryKey, JSON.stringify({ columns: { names: [], types: [] }, records: [] }));
        
            updateRegistryList();
            registrySelect.value = registryKey;
            currentRegisterName = registrySelect.value.trim();
        
            updateButtonLabel();
            displayNotes();
        } else {
            alert("A register with this name already exists.");
        }
        checkAndDisplayFormInputs();
        generateFormInputsRecords();
    }
    newRegistryInput.value = '';
});

// delete the current register
deleteRegistryButton.addEventListener("click", () => {
    const deleteRegisterModal = document.getElementById("deleteRegistryModal");
    const confirmDeleteButton = document.getElementById("confirmDeleteRegistryButton");
    const cancelDeleteButton = document.getElementById("cancelDeleteRegistryButton");

    deleteRegisterModal.style.display = "flex";

    document.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            confirmDeleteButton.click();
            deleteRegisterModal.style.display = "none";
            modal.style.display = "none";
        }
    });

    confirmDeleteButton.onclick = () => {
        localStorage.removeItem(registrySelect.value);
        updateRegistryList();
        currentRegisterName = registrySelect.value.trim();
        displayNotes();
        updateButtonLabel();
        checkAndDisplayFormInputs();
        deleteRegisterModal.style.display = "none";
    };

    cancelDeleteButton.onclick = () => {
        deleteRegisterModal.style.display = "none";
    };
   
});

// export the current register as Json file
exportButton.addEventListener("click", () => {
    const notes = JSON.parse(localStorage.getItem(registrySelect.value)) || [];
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${registrySelect.value.replace("registro_", "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

document.addEventListener("DOMContentLoaded", () => {
    const exportAllButton = document.getElementById("exportAllButton");
    const importAllFile = document.getElementById("importAllFile");

    // export all the registers of local storage in a unique json file
    exportAllButton.addEventListener("click", () => {
        const allData = {};
       
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            const storedData = JSON.parse(value);

            // check if the structure is correct
            if (storedData.columns && storedData.records) {
                allData[key] = storedData;
            } else {
                console.warn(`Il registro ${key} non ha una struttura corretta.`);
            }
        }

        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "tutti_i_registri.json";
        a.click();
        URL.revokeObjectURL(url);
    });

    // import all the registers from a json file
    importAllFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importedData = JSON.parse(event.target.result);
                // Verifica che i dati importati abbiano la struttura corretta
                if (importedData && typeof importedData === 'object') {
                    Object.keys(importedData).forEach(key => {
                    
                        const registryData = importedData[key];
                        if (registryData.columns && registryData.records) {
                            localStorage.setItem(key, JSON.stringify(registryData));
                        } else {
                            console.warn(`Il registro ${key} non ha una struttura corretta.`);
                        }
                    });

                    updateRegistryList();
                    displayNotes();
                    updateButtonLabel();
                    checkAndDisplayFormInputs();

                } else {
                    alert("Il file JSON non ha la struttura corretta.");
                }
            
            } catch (error) {
                alert("Errore nella lettura del file JSON.");
            }
        };
        reader.readAsText(file);
    });
});

// import one registry
importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);

            if (importedData && importedData.columns && importedData.records) {
                localStorage.setItem(registrySelect.value, JSON.stringify(importedData));
                displayNotes();
                updateButtonLabel();
                checkAndDisplayFormInputs();
            } else {
                alert("The Json file does not have the correct structure.");
            }

        } catch (error) {
            alert("Reading error of the Json file.");
        }
    };
    reader.readAsText(file);
});

// change/show the selected register
registrySelect.addEventListener("change", displayNotes);

// load the registers to startup
document.addEventListener("DOMContentLoaded", () => {
    updateRegistryList();
});

// to change register
registrySelect.addEventListener("change", () => {
    currentRegisterName = registrySelect.value.trim();
});

/**********************************/
//- ******** NEW TABLE ***********/
/********************************/

// update the button based on existing columns
const updateButtonLabel = () => {
    const registerName = registrySelect.value.trim();
    const existingData = JSON.parse(localStorage.getItem(registerName));

    if (existingData && existingData.columns && existingData.columns.names.length > 0) {
        numColumnsInput.style.display = "none";
        createColumnsButton.style.display = "none";
        createColumnsButton.textContent = "Add record";
    } else {
        numColumnsInput.style.display = "initial";
        createColumnsButton.style.display = "initial";
        addRecordButton.style.display = "none";
        createColumnsButton.textContent = "Create Columns";
    }
};

function updateRecordCounter(){
    const tableData = JSON.parse(localStorage.getItem(registrySelect.value));
    const counter = tableData.records.length; // starts from 0, and we consider the next record
    recordCounter.textContent = `Record counter : ${counter}`;

}
// every time the user changes the selected register 
registrySelect.addEventListener("change", updateButtonLabel);

// to create inputs to define the dynamic columns or directly show the insertion form if they are already given to us
let numColumns = 0;
tableForm.addEventListener("submit", (e) => {
    e.preventDefault();
        addRecordButton.style.display = "none";

        // if there are already given in the register
        const existingData = JSON.parse(localStorage.getItem(currentRegisterName)) || [];
        
        /************** for the data with the data ***********/
        if (existingData && existingData.columns && existingData.columns.names.length > 0) {
            // Registro esistente con colonne
            currentColumns = existingData.columns.names;
            columnTypes = existingData.columns.types;

            // Mostra il form per aggiungere nuovi record
            generateFormInputsRecords();
            createColumnsButton.style.display = "none";
            addRecordButton.style.display = "initial";
           
            return;
        }
        /************** for registers without data ***********/
        else { 
            numColumns = parseInt(numColumnsInput.value);
            
            // check that the number of columns is valid
            if (numColumns < 1 || isNaN(numColumns)) {
                alert("Please enter a valid number of columns.");
                return;
            } else{
                numColumnsInput.style.display = "none";
                createColumnsButton.style.display = "none";
            }

            tableArea.innerHTML = '';
            tableInputsContainer.innerHTML = '';

            // input for each column
            currentColumns = [];
            columnTypes = [];
            for (let i = 0; i < numColumns; i++) {
                const columnDiv = document.createElement("div");
                columnDiv.innerHTML = `
                    <label>Colonna ${i + 1}</label>
                    <input type="text" placeholder="Nome Colonna" id="columnName${i}" required>
                    <select id="columnType${i}">
                        <option value="text">Testo</option>
                        <option value="number">Numero</option>
                        <option value="date">Data</option>
                        <option value="email">Email</option>
                        <option value="tel">Telefono</option>
                        <option value="url">URL</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="range">Intervallo</option>
                        <option value="color">Colore</option>
                        <option value="time">Tempo</option>
                        <option value="month">Mese</option>
                        <option value="week">Settimana</option>
                        <option value="hidden">Nascosto</option>
                        <option value="file">File</option>
                        <option value="search">Cerca</option>
                        <option value="datetime-local">Data e ora</option>
                        <option value="password">Password</option>
                        <option value="file">File</option>
                        <option value="image">Immagine</option>
                    </select>
                `;
                tableInputsContainer.appendChild(columnDiv);
            }
            createTableButton.style.display = "initial";
        }
});

// for (createTableButton) and (addRecordButton) 
// to save the dynamic columns
// to save the data entered as new lines
function handleSubmit(e) {
    e.preventDefault();
    const action = e.submitter.value; 
    const registerName = registrySelect.value.trim();
    
    if (!registerName) {
        alert("Seleziona un registro.");
        return;
    }
    // for createtable button
    if (action === "createTableButton") {
        // save the names of the columns and the types
        currentColumns = [];
        columnTypes = [];
        for (let i = 0; i < numColumns; i++) {
            let columnName = document.getElementById(`columnName${i}`).value;
            const columnType = document.getElementById(`columnType${i}`).value;

            if (columnName && columnType) {
                currentColumns.push(columnName);
                columnTypes.push(columnType);
            }
        }
       
        const tableWithColumns = {
                columns: { names: currentColumns, types: columnTypes },
                records: [] 
            };

        // save everything in the storage
        localStorage.setItem(registrySelect.value, JSON.stringify(tableWithColumns));
        addRecordButton.style.display = "initial";
        createTableButton.style.display = "none";
        generateFormInputsRecords();
    
    } else if(action === "addRecordButton"){
        const row = {};
        currentColumns.forEach((col, index) => {
            const columnName = col;
            const columnType = columnTypes[index];
            const columnValue = document.getElementById(`inputColumn${index}`).value;

            if (columnType === "number") {
            row[columnName] = parseFloat(columnValue);
            } else if (columnType === "date") {
            row[columnName] = new Date(columnValue).toISOString();
            } else {
            row[columnName] = columnValue;
            }
        });

        // recover existing data (columns and records)
        const tableData = JSON.parse(localStorage.getItem(registrySelect.value));
        const recordCount = tableData.records.length + 2; // starts from 0, and we consider the next record
        addRecordButton.textContent = `Add Record ${recordCount}`;
        
        // if there are no data, then create a new table (with empty columns and no records)
        if (!tableData) {
            alert("Registro non trovato. Seleziona un registro esistente");
            return;
        }

        // add the new record to existing records
        tableData.records.push(row);

        localStorage.setItem(registrySelect.value, JSON.stringify(tableData));
        displayNotes();
    }
};

// to check and view the inputs or the column creation form
function checkAndDisplayFormInputs() {
    const registerName = registrySelect.value.trim();
    const existingData = JSON.parse(localStorage.getItem(registerName));

    if (existingData && existingData.columns && existingData.columns.names.length > 0) {
        // if there are columns and records
        currentColumns = existingData.columns.names;
        columnTypes = existingData.columns.types;
        generateFormInputsRecords();

        addRecordButton.style.display = "initial";
        createTableButton.style.display = "none";
        createColumnsButton.style.display = "none"; 
        tableInputsContainer.style.display = "initial";  
    } else {
        // if the register is empty
        tableInputsContainer.innerHTML = '';  
        addRecordButton.style.display = "none"; 
        createColumnsButton.style.display = "initial"; 
    }
}
// call the function to change the register
registrySelect.addEventListener("change", checkAndDisplayFormInputs);

// to generate dynamic inputs for each column
function generateFormInputsRecords() {

    tableInputsContainer.style.display = "initial"; 
    tableInputsContainer.innerHTML = '';
    
    currentColumns.forEach((col, index) => {
        const inputDiv = document.createElement("div");
        
        // for the type it is "image"
        if (columnTypes[index] === "image") {
            inputDiv.innerHTML = `
                <label>${col}</label>
                <input type="url" id="inputColumn${index}" placeholder="Inserisci URL dell'immagine" required onchange="displayImage(this, ${index})">
                <img id="imagePreview${index}" src="" alt="${col}" style="display:none; width: 100px; height: auto;"> `;
        } else {
            // for other types of inputs
            inputDiv.innerHTML = `
                <label>${col}</label>
                <input type="${columnTypes[index]}" id="inputColumn${index}" placeholder="Inserisci ${col}" required> `;
        }
        
        tableInputsContainer.appendChild(inputDiv);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    checkAndDisplayFormInputs();
    updateButtonLabel();
});

// to view the image when the URL is inserted
function displayImage(inputElement, index) {
    const imgElement = document.getElementById(`imagePreview${index}`);
    const imageUrl = inputElement.value;
    
    if (imageUrl) {
        imgElement.src = imageUrl;
        imgElement.style.display = "flex"; 
        imgElement.style.alignContent = "center";
    } else {
        imgElement.style.display = "none";
    }
}

// load the existing registers to upload the page
document.addEventListener("DOMContentLoaded", () => {
    const savedRegistries = Object.keys(localStorage).filter(key => key !== 'registrySelect');
    currentRegisterName = registrySelect.value.trim();
});

// to add a new column
function addColumn() {
    const registerName = registrySelect.value.trim();
    const newColumnName = document.getElementById("newColumnName").value.trim();
    const newColumnType = document.getElementById("newColumnType").value;

    if (!newColumnName) {
        alert("Enter a name for the column.");
        return;
    }

    if (!registerName) {
        alert("Select a register.");
        return;
    }

    const tableData = JSON.parse(localStorage.getItem(registerName)) || { columns: { names: [], types: [] }, records: [] };

    // add the new column
    tableData.columns.names.push(newColumnName);
    tableData.columns.types.push(newColumnType);

    // add the new column to each record with a predefined value
    tableData.records.forEach((row) => {
        row[newColumnName] = newColumnType === "image" ? "" : null;
    });

    localStorage.setItem(registerName, JSON.stringify(tableData));

    // update variables
    currentColumns.push(newColumnName);
    columnTypes.push(newColumnType);

    displayNotes();
    updateButtonLabel();
    checkAndDisplayFormInputs();
    document.getElementById("newColumnName").value = "";
}

document.getElementById("addColumnButton").addEventListener("click", addColumn);

const iconInfo = document.getElementById("info");
const infoModal = document.getElementById("infoModal");
const closeInfoButton = document.getElementById("closeInfoButton");

iconInfo.addEventListener("click", () => {
    infoModal.style.display = "block";
});

closeInfoButton.addEventListener("click", () => {
    infoModal.style.display = "none";
});
