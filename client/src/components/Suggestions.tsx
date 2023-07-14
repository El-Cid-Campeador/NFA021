import GetSuggestion from "./GetSuggestion";

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
                    return <GetSuggestion sugg={sugg} key={sugg.id} />;
                })
            }
        </ul>
    );
}
