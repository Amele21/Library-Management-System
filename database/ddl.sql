-- CS340 Project Step 4 - Data Definition Queries & Sample Data
-- Authors: Adrian Melendrez & Christopher LeMoss
-- Date: 24 Februrary 2022

SET FOREIGN_KEY_CHECKS=0; 
DROP TABLE IF EXISTS `Books`;
DROP TABLE IF EXISTS `Subjects`;
DROP TABLE IF EXISTS `Classifications`;
DROP TABLE IF EXISTS `Authors`;
DROP TABLE IF EXISTS `Readers`;
DROP TABLE IF EXISTS `BorrowedBooks`;
SET FOREIGN_KEY_CHECKS=1; 



-- Classifications
CREATE TABLE `Classifications` (
	`class_id` char(3) UNIQUE NOT NULL,
	`name` varchar(255) NOT NULL,
	PRIMARY KEY (class_id)
);

INSERT INTO Classifications (class_id, `name`) VALUES 
('000', 'Computer Science, Information, & General Works'),
('100', 'Philosophy & Psychology'),
('200', 'Religion'),
('300', 'Social Sciences'),
('400', 'Language'),
('500', 'Science'),
('600', 'Technology'),
('700', 'Arts & Recreation'),
('800', 'Literature'),
('900', 'History & Geography');



-- Subjects
CREATE TABLE `Subjects` (
	`subject_id` char(3) UNIQUE NOT NULL,
	`name` varchar(255) NOT NULL,
	`class_id` char(3) NOT NULL,
	PRIMARY KEY (subject_id),
	FOREIGN KEY (class_id) REFERENCES Classifications(class_id)
);

INSERT INTO Subjects (subject_id, `name`, class_id) VALUES
('001', 'Knowledge', '000'),
('106', 'Organizations & Management', '100'),
('170', 'Ethics', '100'),
('203', 'Public Worship & Other Practices', '200'),
('307', 'Communities', '300'),
('409', 'Geographic Treatment & Biography', '400'),
('508', 'Natural History', '500'),
('608', 'Patents', '600'),
('700', 'The Arts', '700'),
('800', 'Literature & Rhetoric', '800'),
('813', 'American Fiction in English', '800'),
('823', 'English Fiction', '800'),
('833', 'German Fiction', '800'),
('843', 'French Fiction', '800'),
('909', 'World History', '900');



-- Authors
CREATE TABLE `Authors` (
	`author_id` int(11) UNIQUE NOT NULL AUTO_INCREMENT,
	`first_name` varchar(255) NOT NULL,
	`last_name` varchar(255) NOT NULL,
	CONSTRAINT UNIQUE(first_name, last_name),
	PRIMARY KEY(author_id)
);

INSERT INTO Authors (first_name, last_name) VALUES
('Frank', 'Herbert'),
('Russ', 'Shafer-Landau'),
('George', 'Orwell'),
('Voltaire', ''),
('Hermann', 'Hesse');



-- Books
CREATE TABLE `Books` (
	`book_id` int(11) UNIQUE NOT NULL AUTO_INCREMENT,
	`title` varchar(255) NOT NULL,
	`date_published` date,
	`quantity` int(11) NOT NULL,
	`available` int(11) NOT NULL,
	`subject_id` char(3) NOT NULL,
	`author_id` int(11),
	PRIMARY KEY (book_id),
	FOREIGN KEY (subject_id) REFERENCES Subjects(subject_id),
	FOREIGN KEY (author_id) REFERENCES Authors(author_id)
);

INSERT INTO Books (title, date_published, quantity, available, subject_id, author_id) VALUES
('1984', '1949-06-08', 3, 2, '823', 
	(SELECT author_id FROM Authors WHERE first_name='George' AND last_name='Orwell')),
('Dune', '1965-08-01', 7, 6, '813', 
	(SELECT author_id FROM Authors WHERE first_name='Frank' AND last_name='Herbert')),
('Animal Farm', '1945-08-17', 4, 4, '823', 
	(SELECT author_id FROM Authors WHERE first_name='George' AND last_name='Orwell')),
('The Fundamentals of Ethics', '2010-07-24', 2, 1, '170', 
	(SELECT author_id FROM Authors WHERE first_name='Russ' AND last_name='Shafer-Landau')),
('Siddhartha', '1922-01-01', 6, 5, '833', 
	(SELECT author_id FROM Authors WHERE first_name='Hermann' AND last_name='Hesse')),
('Candide', '1759-01-01', 5, 5, '843', 
	(SELECT author_id FROM Authors WHERE first_name='Voltaire'));



-- Readers
CREATE TABLE `Readers` (
	`reader_id` int(11) UNIQUE NOT NULL AUTO_INCREMENT,
	`first_name` varchar(255) NOT NULL,
	`last_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone_num` char(15) NOT NULL
);

INSERT INTO Readers (first_name, last_name, email, phone_num) VALUES
('John', 'Doe', 'john@example.com', '(940) 991-6588'),
('Mary', 'Moe', 'mary@example.com', '(669) 442-5538'),
('Bernard', 'Smith', 'bernard@example.com', '(202) 555-0103'),
('Alice', 'Palace', 'alice@example.com', '(503) 555-0176'),
('July', 'Dooley', 'july@example.com', '(628) 790-9934');



-- BorrowedBooks
CREATE TABLE `BorrowedBooks` (
	`book_id` int(11) NOT NULL,
	`reader_id` int(11) NOT NULL,
	`date_borrowed` date NOT NULL,
	`date_due` date NOT NULL,
	`is_active` bool NOT NULL DEFAULT true,
	PRIMARY KEY (book_id, reader_id),
	FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE,
	FOREIGN KEY (reader_id) REFERENCES Readers(reader_id) ON DELETE CASCADE
);

INSERT INTO BorrowedBooks (book_id, reader_id, date_borrowed, date_due) VALUES
(	(SELECT book_id FROM Books WHERE title='1984'), 
	(SELECT reader_id FROM Readers WHERE first_name='John'), 
	'2022-03-08', '2022-03-17'
),
(	(SELECT book_id FROM Books WHERE title='The Fundamentals of Ethics'), 
	(SELECT reader_id FROM Readers WHERE first_name='Mary'), 
	'2022-02-08', '2022-02-16'
),
(	(SELECT book_id FROM Books WHERE title='Dune'), 
	(SELECT reader_id FROM Readers WHERE first_name='July'), 
	'2022-03-02', '2022-03-11'
),
(	(SELECT book_id FROM Books WHERE title='Dune'), 
	(SELECT reader_id FROM Readers WHERE first_name='Bernard'), 
	'2022-03-20', '2022-04-03'
),
(	(SELECT book_id FROM Books WHERE title='Siddhartha'), 
	(SELECT reader_id FROM Readers WHERE first_name='Mary'), 
	'2022-02-03', '2022-02-15'
);