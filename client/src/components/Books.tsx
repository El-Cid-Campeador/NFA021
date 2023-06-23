import { Link } from "react-router-dom";
import { FullBookInfo } from "../functions";

type Props = {
    queryResult: { result: FullBookInfo[] }
}

export default function Books({ queryResult }: Props) {
    return (
        <ul>
            {
                queryResult.result.map(book => {
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

