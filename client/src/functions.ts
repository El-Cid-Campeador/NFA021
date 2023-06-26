import axios from "axios";

const fetcher = axios.create({
    withCredentials: true
});

export type PartialBookInfo = {
    title: string, 
    imgUrl: string, 
    authorName: string, 
    category: string,
    descr: string,  
    yearPubl: number, 
    numEdition: number,
    memberId: string
}

export type FullBookInfo = {
    id: string, 
    title: string, 
    imgUrl: string, 
    authorName: string, 
    category: string,  
    yearPubl: number, 
    memberId: string
}

const bookCategories = [
    'Adventure',
    'Art',
    'Autobiography',
    'Biography',
    'Business',
    'Children',
    'Comics',
    'Computer science',
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
    for (let i = new Date().getFullYear(); i >= 1970 ; i -= 1) {
        arr.push(i);  
    }

    return arr;
}

function areAllAttributesEmptyString(obj: any) {
    for (var key in obj) {
        if (obj[key] !== '') {
            return false;
        }
    }

    return true;
}

export { fetcher, bookCategories, bookLanguages, generateYears, areAllAttributesEmptyString };
