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

function hasEmptyValues(obj: any) {
    for (let key in obj) {
        if (obj[key] === '') {
            return true;
        }
    }

    return false;
}

function generateYears(): number[] {
    const arr = [];
    for (let i = new Date().getFullYear(); i >= 1970 ; i -= 1) {
        arr.push(i);  
    }

    return arr;
}

export { fetcher, hasEmptyValues, generateYears };
