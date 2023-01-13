import {
    BOOKS, READERS, BORROWED_BOOKS, AUTHORS, CLASSIFICATIONS, SUBJECTS,
    ALL, ADD, DELETE, UPDATE, SEARCH, DISPLAY, FK
} from './constants.js';

// Required attributes for each category
export const attributes = {
    [BOOKS]: {
        [ALL]: ['book_id', 'title', 'date_published', 'quantity', 'available', 'subject_id', 'author_id'],
        [ADD]: ['title', 'date_published', 'quantity', 'available', 'subject_id', 'author_id'],
        [DELETE]: ['book_id'],
        [UPDATE]: ['title', 'date_published', 'quantity', 'available', 'subject_id', 'author_id'],
        [SEARCH]: ['title'],
        [DISPLAY]: ['book_id', 'title', 'date_published', 'quantity', 'available', 'subject_id', 'subject_name', 'author_id', 'first_name', 'last_name'],
        [FK]: {
            [SUBJECTS]: { 'subject_id': ['subject_name'] },
            [AUTHORS]: { 'author_id': ['first_name', 'last_name'] }
        }
    },
    [READERS]: {
        [ALL]: ['reader_id', 'first_name', 'last_name', 'email', 'phone_num'],
        [ADD]: ['first_name', 'last_name', 'email', 'phone_num'],
        [DELETE]: ['reader_id'],
        [UPDATE]: ['first_name', 'last_name', 'email', 'phone_num'],
        [SEARCH]: ['last_name']
    },
    [BORROWED_BOOKS]: {
        [ALL]: ['book_id', 'reader_id', 'date_borrowed', 'date_due', 'is_active'],
        [ADD]: ['book_id', 'reader_id', 'date_borrowed', 'date_due'],
        [DELETE]: ['book_id', 'reader_id'],
        [UPDATE]: ['date_borrowed', 'date_due', 'is_active'],
        [SEARCH]: [`${BOOKS}.title`],
        [DISPLAY]: ['book_id', 'reader_id', 'date_borrowed', 'date_due', 'is_active', 'title', 'first_name', 'last_name'],
        [FK]: {
            [BOOKS]: { 'book_id': ['title'] },
            [READERS]: { 'reader_id': ['first_name', 'last_name'] }
        }
    },
    [AUTHORS]: {
        [ALL]: ['author_id', 'first_name', 'last_name'],
        [ADD]: ['first_name', 'last_name'],
        [DELETE]: ['author_id'],
        [UPDATE]: ['first_name', 'last_name'],
        [SEARCH]: ['last_name']
    },
    [CLASSIFICATIONS]: {
        [ALL]: ['class_id', 'name'],
        [ADD]: ['class_id', 'name'],
        [DELETE]: ['class_id'],
        [UPDATE]: ['name'],
        [SEARCH]: ['name']
    },
    [SUBJECTS]: {
        [ALL]: ['subject_id', 'name', 'class_id'],
        [ADD]: ['subject_id', 'name', 'class_id'],
        [DELETE]: ['subject_id'],
        [UPDATE]: ['name', 'class_id'],
        [SEARCH]: [`${SUBJECTS}.name`],
        [DISPLAY]: ['subject_id', 'name', 'class_id', 'class_name'],
        [FK]: {
            [CLASSIFICATIONS]: { 'class_id': ['name'] }
        }
    }
};

// Determine whether to include quotes around user's database inputs
export function hasQuotations(attribute, attributeValue) {
    return attribute == 'title' ||
        attribute == 'subject_id' ||
        attribute == 'class_id' ||
        attribute.includes('date') ||
        (String(attributeValue).toLowerCase() != 'null' &&
            isNaN(attributeValue));
}

export default attributes;