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
                            <p>{sugg.firstName} {sugg.lastName}</p>
                            <p>{sugg.additionDate}</p>
                            <p>{sugg.descr}</p>
                        </li>
                    );
                })
            }
        </ul>
    );
}
