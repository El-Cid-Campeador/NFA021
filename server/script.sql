CREATE TABLE IF NOT EXISTS Users (
    id VARCHAR(12) PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    additionDate TIMESTAMP DEFAULT NOW(),
    deletionDate TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Librarians (
    id VARCHAR(12) PRIMARY KEY,
    addedBy VARCHAR(12) NOT NULL,
    FOREIGN KEY (id) REFERENCES Users(id),
    FOREIGN KEY (addedBy) REFERENCES Librarians(id)
);

CREATE TABLE IF NOT EXISTS Members (
    id VARCHAR(12) PRIMARY KEY,
    deletedBy VARCHAR(12),
    FOREIGN KEY (id) REFERENCES Users(id),
    FOREIGN KEY (deletedBy) REFERENCES Librarians(id)
);

CREATE TABLE IF NOT EXISTS Books (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    imgUrl VARCHAR(255) NOT NULL,
    authorName VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    lang VARCHAR(50) NOT NULL,
    descr LONGTEXT NOT NULL,
    yearPubl SMALLINT UNSIGNED NOT NULL,
    numEdition SMALLINT UNSIGNED NOT NULL,
    nbrPages MEDIUMINT UNSIGNED NOT NULL,
    addedBy VARCHAR(12) NOT NULL,
    additionDate TIMESTAMP DEFAULT NOW(),
    deletedBy VARCHAR(12) ,
    deletionDate TIMESTAMP,
    FOREIGN KEY (addedBy) REFERENCES Librarians(id),
    FOREIGN KEY (deletedBy) REFERENCES Librarians(id)
);

CREATE TABLE IF NOT EXISTS Borrowings (
    memberId VARCHAR(12),
    bookId VARCHAR(36),
    borrowDate TIMESTAMP DEFAULT NOW(),
    lenderId VARCHAR(12) NOT NULL,
    returnDate TIMESTAMP,
    receiverId VARCHAR(12) ,
    PRIMARY KEY (memberId, bookId, borrowDate),
    FOREIGN KEY (memberId) REFERENCES Members(id),
    FOREIGN KEY (bookId) REFERENCES Books(id),
    FOREIGN KEY (lenderId) REFERENCES Librarians(id),
    FOREIGN KEY (receiverId) REFERENCES Librarians(id)
);

CREATE TABLE IF NOT EXISTS Modifications (
    librarianId VARCHAR(12),
    bookId VARCHAR(36),
    modificationDate TIMESTAMP DEFAULT NOW(),
    oldValues JSON NOT NULL,
    newValues JSON NOT NULL,
    PRIMARY KEY (librarianId, bookId, modificationDate),
    FOREIGN KEY (librarianId) REFERENCES Librarians(id),
    FOREIGN KEY (bookId) REFERENCES Books(id)
);

CREATE TABLE IF NOT EXISTS Fees (
    id VARCHAR(36) PRIMARY KEY,
    amount FLOAT NOT NULL,
    year SMALLINT UNSIGNED NOT NULL,
    memberId VARCHAR(12) NOT NULL,
    librarianId VARCHAR(12) NOT NULL,
    paymentDate TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (memberId) REFERENCES Members(id)
);

CREATE TABLE IF NOT EXISTS Suggestions (
    id VARCHAR(36) PRIMARY KEY,
    descr LONGTEXT NOT NULL,
    memberId VARCHAR(12) NOT NULL,
    bookId VARCHAR(36) NOT NULL,
    additionDate TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (memberId) REFERENCES Members(id),
    FOREIGN KEY (bookId) REFERENCES Books(id)
);


INSERT INTO Users (id, firstName, lastName, email, password) VALUES (
    '111101246123', 'Super', 'Admin', 'admin@gmail.com', '$2b$10$dIU3y7WwpgYEf7Z3GH4oh.vBcom9rEMyLyyOUhfMpgefNIH4/JNj2'
);

ALTER TABLE Librarians DISABLE KEYS;
INSERT INTO Librarians (id, addedBy) VALUES ('111101246123', '111101246123');
ALTER TABLE Librarians ENABLE KEYS;

INSERT INTO Books (id, title, imgUrl, authorName, category, lang, descr, yearPubl, numEdition, nbrPages, addedBy) VALUES (
    UUID(),
    'Head First Java : A Brain-Friendly Guide',
    'https://images.bwbcovers.com/059/Head-First-Java-Sierra-Kathy-9780596009205.jpg',
    'Kathy Sierra',
    'Technology',
    'English',
    'Learning a complex new language is no easy task especially when its an object-oriented computer programming language like Java. This resource combines puzzles, strong visuals, mysteries, and soul-searching interviews to offer a complete introduction to object-oriented programming and Java.',
    2005,
    2,
    688,
    '111101246123'
), ( 
    UUID(),
    'The Da Vinci Code : A Novel', 
    'https://images.bwbcovers.com/038/The-Da-Vinci-Code-Brown-Dan-9780385504201.jpg', 
    'Dan Brown', 
    'Fiction',
    'English', 
    'While in Paris on business, Harvard symbologist Robert Langdon receives an urgent late-night phone call: the elderly curator of the Louvre has been murdered inside the museum. Near the body, police have found a baffling cipher. While working to solve the enigmatic riddle, Langdon is stunned to discover it leads to a trail of clues hidden in the works of Da Vinci -- clues visible for all to see -- yet ingeniously disguised by the painter.
    Langdon joins forces with a gifted French cryptologist, Sophie Neveu, and learns the late curator was involved in the Priory of Sion - an actual secret society whose members included Sir Isaac Newton, Botticelli, Victor Hugo, and Da Vinci, among others.
    In a breathless race through Paris, London, and beyond, Langdon and Neveu match wits with a faceless powerbroker who seems to anticipate their every move. Unless Langdon and Neveu can decipher the labyrinthine puzzle in time, the Priory’s ancient secret - and an explosive historical truth - will be lost forever.
    THE DA VINCI CODE heralds the arrival of a new breed of lightning-paced, intelligent thriller...utterly unpredictable right up to its stunning conclusion.', 
    2003, 
    1,
    454,
    '111101246123'
), (
    UUID(),
    'Influencer: the New Science of Leading Change', 
    'https://images.bwbcovers.com/007/Influencer-Patterson-Kerry-9780071808866.jpg', 
    'Al Switzler', 
    'Psychology',
    'English', 
    "From the author team of the million-selling 'Crucial Conversations', this new edition of 'Influencer' brings you up to date on how to become an agent of change in a way that benefits your organization, the lives of others, and the world around you.", 
    2013, 
    2,
    320,
    '111101246123'
), (
    UUID(),
    'The Seven Spiritual Laws of Success : A Practical Guide to the Fulfillment of Your Dreams', 
    'https://images.bwbcovers.com/144/The-Seven-Spiritual-Laws-of-Success-9781442973589.jpg', 
    'Deepak Chopra', 
    'Business',
    'English', 
    'Based on natural laws which govern all of creation, this book shatters the myth that success is the result of hard work, exacting plans, or driving ambition. In The Seven Spiritual Laws of Success, Deepak Chopra offers a life-altering perspective on the attainment of success: Once we understand our true nature and learn to live in harmony with natural law, a sense of well-being, good health, fulfilling relationships, energy and enthusiasm for life, and material abundance will spring forth easily and effortlessly. Filled with timeless wisdom and practical steps you can apply right away, this is a book you will want to read and refer to again and again.', 
    2009, 
    2,
    106,
    '111101246123'
), (
    UUID(),
    'Les châtiments', 
    'https://servimg.eyrolles.com/static/media/6029/9782070406029_internet_w290.jpg', 
    'Victor Hugo', 
    'Literature',
    'French', 
    '"Quoi que fassent ceux qui règnent chez eux par la violence et hors de chez eux par la menace, quoi que fassent ceux qui se croient les maîtres des peuples et qui ne sont que les tyrans des consciences, l’homme qui lutte pour la justice et la vérité trouvera toujours le moyen d’accomplir son devoir tout entier. La toute-puissance du mal n’a jamais abouti qu’à des efforts inutiles. La pensée échappe toujours à qui tente de l’étouffer. Elle se fait insaisissable à la compression ; elle se réfugie d’une forme dans l’autre. Le flambeau rayonne ; si on l’éteint, si on l’engloutit dans les ténèbres, le flambeau devient une voix, et l’on ne fait pas la nuit sur la parole ; si l’on met un baîllon à la bouche qui parle, la parole se change en lumière, et l’on ne baîllonne pas la lumière. Rien ne dompte la conscience de l’homme, car la conscience de l’homme, c’est la pensée de Dieu."',
    1998,
    1,
    416,
    '111101246123'
), (
    UUID(),
    'Physique-Chimie - Exercices incontournables BCPST 2', 
    'https://www.dunod.com/sites/default/files/styles/principal_desktop/public/thumbnails/image/9782100850655-001-X.jpeg', 
    'Isabelle Côte & Anne Vidal', 
    'Science',
    'French', 
    'Pour être à l’aise dans le passage du cours aux exercices et être capable d’affronter un problème de type concours, l’étudiant de classes préparatoires doit connaître un certain nombre d’exercices fondamentaux et en maîtriser parfaitement la méthode de résolution.',
    2023, 
    3,
    368,
    '111101246123'
);

-- mysql -u root -p nfa021 < ./server/script.sql
