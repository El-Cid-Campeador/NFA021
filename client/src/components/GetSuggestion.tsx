type Props = {
    sugg: Suggestion
}

export default function GetSuggestion({ sugg }: Props) {
    return (
        <li>
            <p>{sugg.firstName}</p>
            <p>{sugg.lastName}</p>
            <p>{sugg.additionDate}</p>
            <p>{sugg.descr}</p>
        </li>
    );
}
