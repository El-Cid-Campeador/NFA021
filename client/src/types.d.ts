type User = { 
    id: string,
    firstName: string, 
    lastName: string, 
    isMember: number 
}

type Member = {
    id: string,
    firstName: string, 
    lastName: string,
    email: string,
    creationDate: string
}

type Book = {
    id: string, 
    title: string, 
    imgUrl: string, 
    authorName: string, 
    category: string,
    lang: string,
    descr: string,  
    yearPubl: number, 
    numEdition: number,
    nbrPages: number,
    memberId: string,
    borrowedAt: string 
}

type BookFormData = {
    title: string,
    imgUrl: string,
    authorName: string,
    category: string,
    lang: string,
    descr: string,
    yearPubl: number,
    numEdition: number,
    nbrPages: number
}

type Suggestion = {
    id: string,
    descr: string,
    firstName: string,
    lastName: string,
    creationDate: string
}
