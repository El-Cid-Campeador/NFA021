import { Link } from "react-router-dom";
import { BookInfo } from "../functions";

type Props = {
    result: BookInfo[]
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

