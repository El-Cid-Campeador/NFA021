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

export { fetcher, hasEmptyValues };
