import { Link } from "react-router-dom";

type Props = {
    result: { id: string, title: string, imgUrl: string }[]
}

export default function Books({ result }: Props) {
    return (
        <ul className="flex gap-[10px] flex-wrap m-[10px]">
            {
                result.map(book => {
                    return (
                        <li key={book.id} className="flex flex-col justify-center w-[200px]">
                            <Link to={`/books/${book.id}`} className="text-black">
                                <img src={book.imgUrl} alt="The image could not be loaded" />
                                <h1 className="mt-4 text-sm">{book.title}</h1>
                            </Link>
                        </li>
                    );
                })
            }
        </ul>
    );
}

