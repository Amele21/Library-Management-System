/*
 * ENTITIES
 * Instantiate database entities using custom class
 */
import {
    BOOKS, READERS, BORROWED_BOOKS, AUTHORS, CLASSIFICATIONS, SUBJECTS
} from './public/constants.js';
import Entity from './entity.js';


export const booksEntity = new Entity(
    BOOKS, // Name
    '/books', // Subdirectory
    `SELECT book_id, title, date_published, quantity, available, ${BOOKS}.subject_id, ${SUBJECTS}.name as subject_name, ${BOOKS}.author_id, first_name, last_name 
    FROM ${BOOKS}
    LEFT JOIN ${AUTHORS} ON ${BOOKS}.author_id = ${AUTHORS}.author_id
    LEFT JOIN ${SUBJECTS} ON ${BOOKS}.subject_id = ${SUBJECTS}.subject_id
    ORDER BY book_id ASC;` // Display query
);

export const readersEntity = new Entity(
    READERS, // Name
    '/readers', // Subdirectory
    `SELECT * FROM ${READERS} ORDER BY reader_id ASC;`, // Display query
);

export const borrowedEntity = new Entity(
    BORROWED_BOOKS, // Name
    '/borrowed', // Subdirectory
    `
    SELECT ${BORROWED_BOOKS}.book_id, ${BORROWED_BOOKS}.reader_id, date_borrowed, date_due, is_active, title, first_name, last_name
    FROM ${BORROWED_BOOKS}
    INNER JOIN ${BOOKS} ON ${BORROWED_BOOKS}.book_id = ${BOOKS}.book_id
    INNER JOIN ${READERS} ON ${BORROWED_BOOKS}.reader_id = ${READERS}.reader_id
    ORDER BY date_borrowed ASC;`, // Display query
);

export const authorsEntity = new Entity(
    AUTHORS, // Name
    '/authors', // Subdirectory
    `SELECT * FROM ${AUTHORS} ORDER BY author_id ASC;`, // Display query
);

export const classificationsEntity = new Entity(
    CLASSIFICATIONS, // Name
    '/classifications', // Subdirectory
    `SELECT * FROM ${CLASSIFICATIONS} ORDER BY class_id ASC;`, // Display query
);

export const subjectsEntity = new Entity(
    SUBJECTS, // Name
    '/subjects', // Subdirectory
    `SELECT subject_id, ${SUBJECTS}.name as subject_name, ${SUBJECTS}.class_id, ${CLASSIFICATIONS}.name as class_name
    FROM ${SUBJECTS}
    INNER JOIN ${CLASSIFICATIONS} ON ${SUBJECTS}.class_id = ${CLASSIFICATIONS}.class_id
    ORDER BY ${SUBJECTS}.subject_id ASC;`, // Display query
);


export const entities = {
    [BOOKS]: booksEntity,
    [READERS]: readersEntity,
    [BORROWED_BOOKS]: borrowedEntity,
    [AUTHORS]: authorsEntity,
    [CLASSIFICATIONS]: classificationsEntity,
    [SUBJECTS]: subjectsEntity
}