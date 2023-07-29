type User = { 
    id: string,
    firstName: string, 
    lastName: string, 
    role?: string 
}

type Member = {
    id: string,
    firstName: string, 
    lastName: string,
    email: string,
    additionDate: string, 
    deletionDate?: string, 
    deletedBy?: string 
}

type Book = {
    title: string, 
    imgUrl: string, 
    authorName: string, 
    category: string,
    lang: string,
    descr: string,  
    yearPubl: number, 
    numEdition: number,
    nbrPages: number,
    addedBy: string,
    additionDate: string,
    deletedBy?: string,
    deletionDate?: string
}

type BookDataInput = {
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
    additionDate: string
}
