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
        default:
            break;
    }

    return res;
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
    displayBookProperty 
};
