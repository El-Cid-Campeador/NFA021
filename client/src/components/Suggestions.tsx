import { Suggestion } from "../functions";
import GetSuggestion from "./GetSuggestion";

type Props = {
    list: Suggestion[]
}

export default function Suggestions({ list }: Props) {
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
