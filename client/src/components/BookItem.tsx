import { Book } from "../functions";

type Props = {
    book: Book
}

export default function BookItem({ book }: Props) {
    return (
        <div>
            <h1>{book.title}</h1>
            <p>{book.descr}</p>
        </div>
    );
}
