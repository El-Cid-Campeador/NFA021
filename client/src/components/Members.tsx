import { Link } from "react-router-dom";
import { Member } from "../functions";

type Props = {
    result: Member[]
}

export default function Books({ result }: Props) {
    return (
        <ul>
            {
                result.map(member => {
                    return (
                        <li key={member.id}>
                            <Link to={`/members/${member.id}`}>{member.firstName} {member.lastName}</Link>
                        </li>
                    );
                })
            }
        </ul>
    );
}
