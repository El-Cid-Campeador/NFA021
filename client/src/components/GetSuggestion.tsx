import { Suggestion } from "../functions";

type Props = {
    sugg: Suggestion
}

export default function GetSuggestion({ sugg }: Props) {
    return (
        <li>
            <p>{sugg.descr}</p>
            <p>{sugg.firstName}</p>
            <p>{sugg.lastName}</p>
            <p>{sugg.createdAt}</p>
        </li>
    );
}
