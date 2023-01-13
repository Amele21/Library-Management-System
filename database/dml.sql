-- CS340 Project Step 4 - Data Manipulation Queries
-- Authors: Adrian Melendrez & Christopher LeMoss
-- Date: 24 Februrary 2022

---- Authors
-- display Authors
SELECT * FROM Authors ORDER BY author_id ASC;

-- add author
INSERT INTO Authors (first_name, last_name)
VALUES (:fname_input, :lname_input);

-- update author
UPDATE Authors
SET first_name  = :first_name_input, 
    last_name   = :last_name_input 
WHERE author_id = :author_id_input;

-- delete author
DELETE FROM Authors WHERE author_id = :author_id_input;

-- search Authors
SELECT * FROM Authors WHERE last_name LIKE %:last_name_input%;


---- Books
-- display Books
SELECT book_id, title, date_published, quantity, available, Books.subject_id, Subjects.name as subject_name, Books.author_id, first_name, last_name 
FROM Books
    LEFT JOIN Authors ON Books.author_id = Authors.author_id
    LEFT JOIN Subjects ON Books.subject_id = Subjects.subject_id
ORDER BY Books.book_id ASC;

-- add book
INSERT INTO Books (title, date_published, quantity, available, subject_id, author_id)
VALUES (:title_input, :date_input, :quantity_input, :available_input, :subject_input, :author_input);

-- update book
UPDATE Books
SET title           = :title_input, 
    date_published  = :date_input, 
    quantity        = :quantity_input, 
    available       = :available_input,
    subject_id      = :subject_input,
    author_id       = :author_input
WHERE book_id = :book_id_input;

-- delete book
DELETE FROM Books WHERE book_id = :book_id_input;

-- search book titles
SELECT book_id, title, date_published, quantity, available, Books.subject_id, Subjects.name as subject_name, Books.author_id, first_name, last_name 
FROM Books
    LEFT JOIN Authors ON Books.author_id = Authors.author_id
    LEFT JOIN Subjects ON Books.subject_id = Subjects.subject_id
WHERE title LIKE %:book_id_input%
ORDER BY Books.book_id ASC;



---- BorrowedBooks
-- display borrowed books
SELECT BorrowedBooks.book_id, BorrowedBooks.reader_id, date_borrowed, date_due, is_active, title, first_name, last_name
FROM BorrowedBooks
    INNER JOIN Books ON BorrowedBooks.book_id = Books.book_id
    INNER JOIN Readers ON BorrowedBooks.reader_id = Readers.reader_id
ORDER BY date_borrowed ASC;

-- add borrowed book (checkout)
INSERT INTO BorrowedBooks (book_id, reader_id, date_borrowed, date_due)
VALUES (:book_id_input, :reader_id_input, :borrowed_input, :due_input);

-- update borrowed book
UPDATE BorrowedBooks
SET date_borrowed = :date_borrowed_input,
    date_due      = :date_due_input,
    is_active     = :is_active_input
WHERE book_id = book_id_input AND reader_id = reader_id_input;

-- delete borrowed book (return)
DELETE FROM BorrowedBooks 
WHERE book_id = :book_id_input AND reader_id = :reader_id_input;

-- search BorrowedBooks
SELECT BorrowedBooks.book_id, BorrowedBooks.reader_id, date_borrowed, date_due, is_active, title, first_name, last_name
FROM BorrowedBooks
    INNER JOIN Books ON BorrowedBooks.book_id = Books.book_id
    INNER JOIN Readers ON BorrowedBooks.reader_id = Readers.reader_id
WHERE Books.title LIKE %:title_input%
ORDER BY date_borrowed ASC;



---- Classifications
-- display Classifications
SELECT * FROM Classifications ORDER BY class_id ASC;

-- add classification
INSERT INTO Classifications (class_id, `name`)
VALUES (:class_id_input, :name_input);

-- update classification
UPDATE Classifications
SET class_name = :class_name_input
WHERE class_id = :class_id_input;

-- delete classifcation
DELETE FROM Classifications WHERE class_id = :class_id_input;

-- search Classifications
SELECT * FROM Classifications WHERE `name` LIKE %:name_input% ORDER BY class_id ASC;


---- Readers
-- display Readers
SELECT * FROM Readers ORDER BY reader_id ASC;

-- add reader
INSERT INTO Readers (first_name, last_name, email, phone_num)
VALUES (:fname_input, :lname_input, :email_input, :phone_num_input);

-- update reader
UPDATE Readers
SET first_name = :fname_input, 
    last_name  = :lname_input, 
    email      = :email_input, 
    phone_num  = :phone_num_input
WHERE reader_id = :reader_id_input;

-- delete reader
DELETE FROM Readers WHERE reader_id = :reader_id_input;

-- search Readers
SELECT * FROM Readers WHERE last_name LIKE %:last_name_input% ORDER BY reader_id ASC;



---- Subjects
-- display Subjects
SELECT subject_id, Subjects.name as subject_name, Subjects.class_id, Classifications.name as class_name
FROM Subjects
    INNER JOIN Classifications ON Subjects.class_id = Classifications.class_id
ORDER BY Subjects.subject_id ASC;

-- add subject
INSERT INTO Subjects (subject_id, `name`, class_id)
VALUES (:subject_id_input, :name_input, :class_id_input);

-- update subject
UPDATE Subjects
SET `name`   = :name_input,
    class_id = :class_id_input
WHERE subject_id = :subject_id_input;

-- delete subject
DELETE FROM Subjects WHERE subject_id = :subject_id_input;

-- search Subjects
SELECT subject_id, Subjects.name as subject_name, Subjects.class_id, Classifications.name as class_name
FROM Subjects
    INNER JOIN Classifications ON Subjects.class_id = Classifications.class_id
WHERE Subjects.name LIKE %:subject_name_input%
ORDER BY Subjects.subject_id ASC;