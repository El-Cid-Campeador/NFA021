import { Link } from "react-router-dom";

type Props = {
    result: Book[]
}

export default function Books({ result }: Props) {
    return (
        <ul>
            {
                result.map(book => {
                    return (
                        <li key={book.id}>
                            <Link to={`/books/${book.id}`} >
                                {book.title}
                            </Link>
                        </li>
                    );
                })
            }
        </ul>
    );
}

