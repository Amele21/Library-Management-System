/*
 * SETUP
 */
import { entities } from './entities.js'; // Import instances of custom class "Entity"
import attributes from './public/attributes.js';
import { ADD, ALL, BORROWED_BOOKS, SEARCH, UPDATE } from './public/constants.js';
import { join, resolve } from 'path';
import express from 'express'; // Import express library to host web server
import { create } from 'express-handlebars'; // Handlebars for templating

// Configuration
const PORT = 7152;
const app = express(); // Get instance of express to interact with server
const hbs = create({ extname: '.hbs' });
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');
app.use(express.static(join(resolve(), 'public'))); // Let express use public folder to allow JavaScript imports
app.use(express.json()) // Allow express to receive JSON POST requests

// Register equality helper function for use in .hbs files
hbs.handlebars.registerHelper('eq', function (arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

hbs.handlebars.registerHelper('access', function (obj, id) {
    return obj[id];
});

hbs.handlebars.registerHelper('contains', function (arg1, arg2, index, entityName) {
    if (index == 0 && entityName != BORROWED_BOOKS) return false; // hacky solution to prevent subject_id dropdown in Subjects
    return arg1.includes(arg2);
})



/*
 * ROUTES
 */
app.get(
    '/', function (req, res) {
        res.render('home', { activePage: '/' });
    });

for (var entityName in entities) {
    let entity = entities[entityName];

    // Entity page w/ GET request (Ex: '/books')
    app.get(entity.path, function (req, res) {
        // Display error view if SQL query fails
        let handleError = function (err) {
            console.log(err);
            res.render('error', { message: err.message });
        };

        let searchFieldValue = req.query.q; // Get search field value
        entity.read(
            searchFieldValue,
            function (table) {
                // Specify which attributes show up in modal prompts
                table['attrAll'] = attributes[entity.name][ALL];
                table['attrAdd'] = attributes[entity.name][ADD];
                table['attrUpdate'] = attributes[entity.name][UPDATE];
                table['attrSearch'] = attributes[entity.name][SEARCH];
                // console.log(table);
                // console.log(dropdowns);

                // Create dropdowns based on foreign keys
                entity.getDropdowns(entities, function (dropdowns) {
                    // Render entity view
                    res.render('entity', {
                        activePage: entity.path,
                        entity: table,
                        dropdowns: dropdowns
                    });
                }, handleError);
            }, handleError);
    });

    // Add row/entry to entity w/ POST request (Ex: '/add-Books')
    app.post(`/add-${entityName}`, function (req, res) {
        entity.insert(
            req.body,
            function (rows) { res.sendStatus(200); },
            // Return error view if SQL query fails
            function (err) {
                console.log(err);
                res.status(400).send(err);
            }
        );
    });

    // Remove row/entry from entity w/ POST request (Ex: '/delete-Books')
    app.post(`/delete-${entityName}`, function (req, res) {
        entity.delete(
            req.body,
            function (rows) { res.send(rows); },
            function (err) {
                console.log(err);
                res.status(400).send(err);
            }
        );
    });

    // Update row/entry in entity w/ POST request (Ex: '/update-Books')
    app.post(`/update-${entityName}`, function (req, res) {
        entity.update(
            req.body,
            function (rows) { res.send(rows); },
            function (err) {
                console.log(err);
                res.status(400).send(err);
            }
        );
    });
}

/*
 * LISTENER
 */
app.listen(PORT, function () {
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});
