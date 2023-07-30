import { formatDate } from "../functions";

type Props = {
    list: Suggestion[]
}

export default function Suggestions({ list }: Props) {
    if (list.length <= 0) {
        return <h1>No suggestions found!</h1>;
    }

    return (
        <ul>
            {
                list.map(sugg => {
                    return (
                        <li key={sugg.id}>
                            <p>
                                By
                                <strong> {sugg.firstName} {sugg.lastName} </strong>
                                on
                                <strong> {formatDate(sugg.additionDate)}</strong>
                            </p>
                            <div className="mt-[20px]">{sugg.descr}</div>
                        </li>
                    );
                })
            }
        </ul>
    );
}
