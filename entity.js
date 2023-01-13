/*
 * ENTITY
 * Defines Entity class, which is used as an interface between JavaScript and the SQL database
 */
import { db_pool } from './database/db-connector.js'; // Database
import { dateFormat, ADD, DELETE, UPDATE, SEARCH, FK, BOOKS } from './public/constants.js';
import { attributes, hasQuotations } from './public/attributes.js';


export default class Entity {
    constructor(name, path, queryDisplay) {
        this.name = name;                   // Name of database table/entity
        this.path = path;                   // Path after top level domain (e.g., '/readers')
        this.queryDisplay = queryDisplay;   // SQL query to display table

        // Create DELETE query based on name and DELETE attributes
        let deleteAttributes = attributes[name][DELETE];
        this.queryDelete = `DELETE FROM ${name} WHERE `;
        for (let i = 0; i < deleteAttributes.length; i++) {
            let attrName = deleteAttributes[i];
            if (i > 0) {
                this.queryDelete += ' AND ';
            }
            this.queryDelete += `${attrName} = :${attrName}_input`;
        }
        this.queryDelete += ' LIMIT 1;';

        // Create UPDATE query based on name and UPDATE attributes
        let updateAttribtutes = attributes[name][UPDATE];
        this.queryUpdate = `UPDATE ${name} SET \n`;
        for (let i = 0; i < updateAttribtutes.length; i++) {
            let attrName = updateAttribtutes[i];
            this.queryUpdate += `\t${attrName} = :${attrName}_input`
            if (i != updateAttribtutes.length - 1) {
                this.queryUpdate += ',\n';
            }
        }
        this.queryUpdate += '\nWHERE ';
        for (let i = 0; i < deleteAttributes.length; i++) {
            let attrName = deleteAttributes[i];
            if (i > 0) {
                this.queryUpdate += ' AND ';
            }
            this.queryUpdate += `${attrName} = :${attrName}_input`
        }
        this.queryUpdate += ';';
    }

    // Query database for specified table
    read = (searchValue, callback, errorCallback) => {
        // Add search field to query if specified
        let query = this.queryDisplay;
        if (searchValue !== undefined && searchValue.length != 0) {
            let searchAttr = attributes[this.name][SEARCH];
            let q = `WHERE ${searchAttr} LIKE '%${searchValue}%' ORDER BY`;
            query = query.replace('ORDER BY', q);
        }
        console.log(query + '\n');

        // Query database for table
        let name = this.name;
        db_pool.query(query, function (err, rows, fields) {
            // Terminate if error
            if (err != null) {
                errorCallback(err);
                return;
            }

            // Get attributes (column names) based on query result
            const attrs = parseAttributes(rows, fields);
            // console.log(attrs);

            // Construct JSON table
            const table = {
                'name': name,
                'attributes': attrs,
                'rows': rows
            };

            callback(table);
        });
    }

    // Update entry in database
    update = (data, callback, errorCallback) => {
        let read = this.read;
        let attrs = attributes[this.name][UPDATE].concat(attributes[this.name][DELETE]);

        let query = parseQuery(data, this.queryUpdate, attrs)

        console.log(query + '\n');

        // Try to update entry in database
        db_pool.query(query, function (err, rows, fields) {
            if (err) {
                errorCallback(err);
                return;
            }
            read(undefined, callback, errorCallback);
            // callback(rows);
        });
    }

    // Insert data into database table
    insert = (data, callback, errorCallback) => {
        // Save display query for later 'cause JavaScript is stupid
        let queryDisplay = this.queryDisplay;

        // Create comma separated string of JSON values
        let values = '';
        for (var attr in data) {
            // Put quotes around string types
            if (hasQuotations(attr, data[attr])) {
                values += `'${data[attr]}',`;
            } else {
                values += `${data[attr]},`;
            }
        }
        values = values.slice(0, -1); // Remove excess comma

        // Create insert query
        let queryInsert = `INSERT INTO ${this.name} (${attributes[this.name][ADD].toString()})\nVALUES (${values});`;
        console.log(queryInsert + '\n');

        // Insert data into database
        db_pool.query(queryInsert, function (err, rows, fields) {
            // Check to see if there was an error
            if (err) {
                errorCallback(err);
                return;
            }
            // console.log(rows);
            db_pool.query(queryDisplay, function (err, rows, fields) {
                if (err) {
                    errorCallback(err);
                    return;
                }
                callback(rows);
            });
        });
    }

    // Delete entry from database
    delete = (data, callback, errorCallback) => {
        // Insert input into query
        let query = parseQuery(data, this.queryDelete, attributes[this.name][DELETE])
        console.log(query + '\n');

        // Try to delete entry in database
        db_pool.query(query, function (err, rows, fields) {
            if (err) {
                errorCallback(err);
                return;
            }
            callback(rows);
        });
    }

    // Get dropdown values by querying FK entitites
    getDropdowns = (entities, callback, errorCallback) => {
        let entityName = this.name;

        if (attributes[entityName][FK] == undefined) {
            callback({});
            return;
        }

        let dropdowns = [];

        let numQueries = Object.keys(attributes[entityName][FK]).length;
        let i = 0;
        for (let foreignEntity in attributes[entityName][FK]) {
            let foreignAttributes = attributes[entityName][FK][foreignEntity];

            // Copy keys of attributes constant into dropdowns
            let dropdown = {};
            for (let foreignKey in foreignAttributes) {
                if (entityName == BOOKS && foreignKey == 'author_id') {
                    dropdown[foreignKey] = {'NULL': 'NULL'};
                } 
                else {
                    dropdown[foreignKey] = {};                    
                }
            }
            // console.log(dropdown);

            // console.log(entities[foreignEntity].queryDisplay);
            db_pool.query(entities[foreignEntity].queryDisplay, function (err, rows, fields) {
                // Terminate if error
                if (err != null) {
                    errorCallback(err);
                    return;
                }
                // console.log(rows);
                populateDropdowns(dropdown, rows, foreignAttributes);
                dropdowns.push(dropdown);

                // console.log(i);
                if (numQueries - 1 == i) {
                    let mergedDropdowns = {};
                    // console.log(dropdowns);
                    for (let i in dropdowns) {
                        mergedDropdowns = { ...mergedDropdowns, ...dropdowns[i] };
                    }
                    // console.log(mergedDropdowns);
                    callback(mergedDropdowns);
                    return;
                }
                i++;
            });
        }
    }
}

// Insert data input into query template with types
function parseQuery(data, queryTemplate, attributes) {
    // Create copy of update query template to modify
    let query = queryTemplate;

    // Replace placeholders in update template with passed data
    for (let i = 0; i < attributes.length; i++) {
        let attr = attributes[i];
        if (hasQuotations(attr, data[attr])) {
            query = query.replace(`:${attr}_input`, `'${data[[attr]]}'`);
        } else {
            query = query.replace(`:${attr}_input`, data[[attr]]);
        }
    }

    return query;
}

// Dynamically retrieve attributes from SQL fields packet & format dates
function parseAttributes(rows, fields) {
    // Populate list of attributes (column names)
    const attributes = [];
    for (let i = 0; i < fields.length; i++) {
        attributes.push(fields[i].name);
    }
    // Format dates & other non-primitive objects
    for (let i in rows) {
        for (let attribute in rows[i]) {
            // Change null values to string
            if (rows[i][attribute] == null) {
                rows[i][attribute] = 'NULL';
            }
            // Only dates should match with this type check (hopefully)
            if (typeof rows[i][attribute] == 'object') {
                rows[i][attribute] = rows[i][attribute].toLocaleDateString('en-US', dateFormat);
            }
        }
    }
    return attributes;
}

function populateDropdowns(dropdowns, rows, foreignAttributes) {
    // console.log(foreignAttributes);
    // console.log(rows);
    // Populate list of foreign key values for dropdowns
    for (let i in rows) {
        // console.log(rows[i]);
        for (let fk in dropdowns) {
            let foreignValue = ''
            // console.log(foreignAttributes[fk]);
            for (let j in foreignAttributes[fk]) {
                let foreignAttr = foreignAttributes[fk][j];
                if (j > 0) foreignValue += ' ';
                foreignValue += rows[i][foreignAttr];
                // console.log(fk);
                // console.log(foreignAttr);
                // console.log(foreignValue);
                // console.log(rows[i]);
            }
            // console.log(foreignValue);
            let fkValue = String(rows[i][fk]);
            try {
                dropdowns[fk][fkValue] = foreignValue
            } catch (e) {
                dropdowns[fk] = {
                    [fkValue]: foreignValue
                }
            }
        }
    }
}