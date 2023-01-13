/* 
 * CRUD: Create, Read, Update, Delete
 */
import attributes from './attributes.js';
import { ALL, ADD, DELETE, UPDATE, dateFormat, DISPLAY } from './constants.js';

// Get constants for current page
const entityName = document.getElementById('entity-name').textContent;
const allAttributes = attributes[entityName][ALL]; // Values displayed in delete modal
const addAttributes = attributes[entityName][ADD]; // Values displayed in add modal
const updateAttributes = attributes[entityName][UPDATE]; // Values displayed in update modal
var displayAttributes = attributes[entityName][DISPLAY]; // Used to get values from table by column
if (attributes[entityName][DISPLAY] === undefined) displayAttributes = allAttributes;

// Get buttons from DOM
const addModal = document.getElementById('add-modal');
const addButton = document.getElementById('add-entity-button');

const deleteModal = document.getElementById('delete-modal');
const confirmDeleteButton = document.getElementById('confirm-delete-button');
const deleteButtons = document.getElementsByClassName('delete-row-button');

const updateModal = document.getElementById('update-modal');
const confirmUpdateButton = document.getElementById('confirm-update-button');
const updateButtons = document.getElementsByClassName('update-row-button');


/*
 * SHARED FUNCTIONS
 */

// Insert content into modal (UPDATE and DELETE)
function insertModalContent(modalType, rowContent, attrs) {
    // Save lowercase version of type for DOM ID retrieval
    let modalName = modalType.toLowerCase();

    // Insert row content into modal in proper fields
    for (let i = 0; i < attrs.length; i++) {
        let attrName = attrs[i];
        let inputElement = document.getElementById(`${modalName}-attr-${attrName}`);
        // Convert display date to SQL date format (YYYY-MM-DD)
        if (attrName.includes('date')) {
            try {
                rowContent[attrName] = new Date(rowContent[attrName]).toISOString().split('T')[0]
            } catch (e) {
                console.log(e);
            }
        }
        inputElement.value = rowContent[attrName];
    }
}

// Get content of modal as object (attributeName: attributeinputValue)
function getModalContent(modalType) {
    let modalIdPrefix = modalType.toLowerCase() + '-';
    if (modalType === ADD) {
        modalIdPrefix = '';
    }

    let data = {};
    for (let i = 0; i < attributes[entityName][modalType].length; i++) {
        let attrName = attributes[entityName][modalType][i];
        let inputValue = document.getElementById(`${modalIdPrefix}attr-${attrName}`).value;
        if (inputValue.length > 0) {
            data[attrName] = inputValue;
        }
    }

    return data;
}

// Send data to server
function postToServer(data, route, callback) {
    // Setup AJAX request
    let xhttp = new XMLHttpRequest();
    xhttp.open('POST', route, true);
    xhttp.setRequestHeader('Content-type', 'application/json');

    // Tell AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            callback(xhttp.response);
        }
        else if (xhttp.readyState == 4 && xhttp.status != 200) {
            displayError(xhttp.response);
        }
    }

    // Send the request and wait for the response
    xhttp.send(JSON.stringify(data));
}

// Display window alert of SQL error message
function displayError(response) {
    let error = JSON.parse(response);
    console.log(error);
    let alertBody = error.code + '\n\nQuery:\n' + error.sql + '\n\nError:\n' + error.sqlMessage;
    window.alert(alertBody);
}



/*
 * CREATE
 */

// Enter key shortcut
addModal.addEventListener('keyup', function (event) {
    if (event.key == 'Enter') {
        addEntry();
    }
});

// Add entry button
addButton.addEventListener('click', addEntry);
function addEntry() {
    // Get entered values
    let data = getModalContent(ADD);

    if (Object.keys(data).length == addAttributes.length) {
        postToServer(data, `/add-${entityName}`, function (response) {
            // Reload page rather than modifying w/ AJAX due to button mess & simplicity in these trying times
            location.reload(true);
        });
    }
}



/*
 * DELETE
 */

// Event listeners
for (let i = 0; i < deleteButtons.length; i++) {
    deleteButtons[i].addEventListener('click', deleteEntry, false);
}

// Delete clicked entry from database
function deleteEntry() {
    // Get index of clicked row
    let rowIndex = this.id.split('-').slice(-1);

    // Get list of cells in row
    let row = document.getElementById(`row-${rowIndex}`);
    let cells = row.children;

    // Populate map of row content (knowing the attribute is necessary since cells may be out of order)
    let rowContent = {};
    for (let i = 0; i < cells.length - 1; i++) { // -1 to exclude actions/buttons
        // Get column/attribute index
        let attributeIndex = parseInt(cells[i].className.slice(-1));
        // Get attribute name 
        let attr = displayAttributes[attributeIndex];
        // Map attribute name to cell content
        rowContent[[attr]] = cells[i].textContent;
    }

    // console.log(rowIndex);
    // console.log(rowContent);

    // Insert row content into modal
    insertModalContent(DELETE, rowContent, allAttributes);

    // Listen for user pressing confirm delete
    // (place listener here rather than gloabl to pass rowContent)
    // (and use onclick to prevent queueing of addEventListener() when many 
    // row buttons are clicked before pressing confirm)
    confirmDeleteButton.onclick = function () {
        postToServer(rowContent, `/delete-${entityName}`, function () {
            // Delete table row
            row.remove();

            // Decrement all subsequent row id indexes
            // (necessary due to how DELETE button gets row content from index)
            let subsequentRows = [];
            let i = parseInt(rowIndex) + 1;
            while (true) {
                let elem = document.getElementById(`row-${i}`);
                if (elem == undefined) break;
                subsequentRows[i] = elem;
                i++;
            }
            for (let i in subsequentRows) {
                subsequentRows[i].id = `row-${i - 1}`;
            }

            // Hide modal
            bootstrap.Modal.getInstance(deleteModal).hide();
        });
    }
}



/*
 * UPDATE
 */
// Click event listeners for update row buttons
for (let i = 0; i < updateButtons.length; i++) {
    updateButtons[i].addEventListener('click', updateEntry);
}

function updateEntry() {
    // Get index of clicked row
    let rowIndex = parseInt(this.id.split('-').slice(-1));

    // Get list of cells in row
    let row = document.getElementById(`row-${rowIndex}`);
    let cells = row.children;

    // Populate map of row content (knowing the attribute is necessary since cells may be out of order)
    let rowContent = {};
    for (let i = 0; i < cells.length - 1; i++) { // -1 to exclude actions/buttons
        // Get column/attribute index
        let attributeIndex = parseInt(cells[i].className.slice(-1));
        // Get attribute name 
        let attr = displayAttributes[attributeIndex];
        // Map attribute name to cell content
        rowContent[[attr]] = cells[i].textContent;
    }

    // Insert row content into modal
    insertModalContent(UPDATE, rowContent, updateAttributes);

    // Listen for enter key shortcut
    updateModal.onkeydown = function (event) {
        if (event.key == 'Enter') {
            event.preventDefault();
            updateRow();
        }
    }

    // Listen for user pressing confirm update
    // (place listener here rather than gloabl to pass rowContent)
    // (and use onclick to prevent queueing of addEventListener() when many 
    // row buttons are clicked before pressing confirm)
    confirmUpdateButton.onclick = updateRow;
    function updateRow() {
        // Get entered values
        let data = getModalContent(UPDATE);

        // Merge row content (old values) with entered values to include omitted info (e.g., primary key)
        data = { ...rowContent, ...data };

        if (Object.keys(data).length >= updateAttributes.length) {
            postToServer(data, `/update-${entityName}`, function (response) {
                let data = JSON.parse(response).rows[rowIndex];
                // console.log(data);

                // Clear input fields for another transaction
                for (let i = 0; i < updateAttributes.length; i++) {
                    document.getElementById(`update-attr-${updateAttributes[i]}`).value = '';
                }

                // Update HTML table row
                for (let i = 0; i < cells.length - 1; i++) { // -1 to exclude actions/buttons
                    // Get column/attribute index
                    let attributeIndex = parseInt(cells[i].className.slice(-1));
                    // Get attribute name 
                    let attr = displayAttributes[attributeIndex];
                    // Map attribute name to cell content
                    if (attr.includes('date')) {
                        cells[i].textContent = new Date(data[[attr]]).toLocaleDateString('en-US', dateFormat);
                    } else {
                        cells[i].textContent = data[[attr]];
                    }
                }

                // Hide modal
                bootstrap.Modal.getInstance(updateModal).hide();
            });
        }
    }
}