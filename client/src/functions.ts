import axios from "axios";

const fetcher = axios.create({
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
    for (let i = new Date().getFullYear(); i >= 1970; i -= 1) {
        arr.push(i);  
    }

    return arr;
}

function isAnyOfTheAttributesAnEmptyString(obj: any) {
    for (var key in obj) {
        if (typeof obj[key] === 'string') {
            if (obj[key] === '') {
                return true;
            }
        }
    }

    return false;
}

function areAllAttributesEmptyStrings(obj: any) {
    for (var key in obj) {
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

export { fetcher, bookCategories, bookLanguages, generateYears, isAnyOfTheAttributesAnEmptyString, areAllAttributesEmptyStrings, isNumber };
