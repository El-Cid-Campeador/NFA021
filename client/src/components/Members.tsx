import { Link } from "react-router-dom";
import { PartialMemberInfo } from "../functions";

type Props = {
    result: PartialMemberInfo[]
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
