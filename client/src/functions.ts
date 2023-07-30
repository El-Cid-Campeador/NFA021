import axios from "axios";

const fetcher = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true
});

const bookCategories = [
    'Adventure',
    'Art',
    'Autobiography',
    'Biography',
    'Business',
    'Children',
    'Comics',
    'Cooking',
    'Dystopian',
    'Education',
    'Essays',
    'Fantasy',
    'Film',
    'Finance',
    'Fitness',
    'Fiction',
    'Graphic Novels',
    'Health',
    'History',
    'Horror',
    'Humor',
    'Literature',
    'Mathematics',
    'Memoir',
    'Music',
    'Mystery',
    'Philosophy',
    'Photography',
    'Plays',
    'Poetry',
    'Politics',
    'Psychology',
    'Religion',
    'Romance',
    'Satire',
    'Science',
    'Science Fiction',
    'Self-help',
    'Short Stories',
    'Social Sciences',
    'Spirituality',
    'Sports',
    'Technology',
    'Thriller',
    'Tragedy',
    'Travel'
];

const bookLanguages = [
    'Arabic',
    'Chinese',
    'English',
    'French',
    'German',
    'Hindi',
    'Italian',
    'Japanese',
    'Korean',
    'Persian',
    'Portuguese',
    'Russian',
    'Spanish',
    'Swedish',
    'Tamil',
    'Telugu',
    'Turkish',
    'Ukrainian',
    'Urdu',
    'Vietnamese'
];

function generateYears(): number[] {
    const arr = [];
    for (let year = new Date().getFullYear(); year >= 1970; year -= 1) {
        arr.push(year);  
    }

    return arr;
}

function isAnyOfTheAttributesAnEmptyString(obj: any) {
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            if (obj[key] === '') {
                return true;
            }
        }
    }

    return false;
}

function areAllAttributesEmptyStrings(obj: any) {
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            if (obj[key] !== '') {
                return false;
            }
        }
    }

    return true;
}

function isNumber(x: any) {
    return typeof x === 'number';
}

function generateFeesYears() {
    const arr = [];

    for (let year = 2023; year <= new Date().getFullYear(); year += 1) {
        arr.push(year);
    }

    return arr;
}

function displayBookProperty(key: string) {
    let res = '';

    switch (key) {
        case 'title':
            res = 'Title';
            break;
        case 'imgUrl':
            res = 'Image URL';
            break;
        case 'authorName':
            res = 'Author name';
            break;
        case 'category':
            res = 'Category';
            break;
        case 'lang':
            res = 'Language';
            break;
        case 'descr':
            res = 'Description';
            break;
        case 'yearPubl':
            res = 'Year of publication';
            break;
        case 'numEdition':
            res = 'No. Edition';
            break;
        case 'nbrPages':
            res = 'Number of pages';
            break;
        case 'addedBy':
            res = 'Added by';
            break;
        case 'additionDate':
            res = 'Addition date';
            break;
        default:
            break;
    }

    return res;
}

function displayMemberProperty(key: string) {
    let res = '';

    switch (key) {
        case 'id':
            res = 'ID';
            break;
        case 'firstName':
            res = 'First name';
            break;
        case 'lastName':
            res = 'Last name';
            break;
        case 'email':
            res = 'Email';
            break;
        case 'lang':
            res = 'Language';
            break;
        case 'additionDate':
            res = 'Addition date';
            break;
        case 'deletionDate':
            res = 'Deletion date';
            break;
        case 'deletedBy':
            res = 'Deleted by';
            break;
        default:
            break;
    }

    return res;
}

function displayLibrarianProperty(key: string) {
    let res = '';

    switch (key) {
        case 'id':
            res = 'ID';
            break;
        case 'firstName':
            res = 'First name';
            break;
        case 'lastName':
            res = 'Last name';
            break;
        case 'email':
            res = 'Email';
            break;
        case 'lang':
            res = 'Language';
            break;
        case 'additionDate':
            res = 'Addition date';
            break;
        case 'addedBy':
            res = 'Added by';
            break;
        case 'deletionDate':
            res = 'Deletion date';
            break;
        case 'deletedBy':
            res = 'Deleted by';
            break;
        default:
            break;
    }

    return res;
}

function formatDate(date: string) {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
}

function formatProperty(obj: any, displayedProperty: string, originalProperty: string) {
    if (displayedProperty.includes('date')) {
        return formatDate(obj[originalProperty]);
    }

    return obj[originalProperty];
}

export { 
    fetcher, 
    bookCategories, 
    bookLanguages, 
    generateYears, 
    isAnyOfTheAttributesAnEmptyString, 
    areAllAttributesEmptyStrings, 
    isNumber, 
    generateFeesYears, 
    displayBookProperty,
    displayMemberProperty,
    displayLibrarianProperty,
    formatProperty,
    formatDate
};
