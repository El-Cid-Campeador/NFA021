import { Link } from "react-router-dom";

type Props = {
    result: Book[]
}

export default function Books({ result }: Props) {
    return (
        <ul className="flex gap-[10px] flex-wrap m-[10px]">
            {
                result.map(book => {
                    return (
                        <li key={book.id} className="flex flex-col w-[200px]">
                            <Link to={`/books/${book.id}`} >
                                <img src={book.imgUrl} alt="The image could not be loaded" />
                                <h1 className="text-sm">{book.title}</h1>
                            </Link>
                        </li>
                    );
                })
            }
        </ul>
    );
}

