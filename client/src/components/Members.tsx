import { Link } from "react-router-dom";
import { MemberInfo } from "../functions";

type Props = {
    result: MemberInfo[]
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
