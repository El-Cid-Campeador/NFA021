import { Link } from "react-router-dom";

type Props = {
    result: Member[]
}

export default function Books({ result }: Props) {
    return (
        <ul className="flex gap-[10px] flex-wrap m-[10px]">
            {
                result.map(member => {
                    return (
                        <li key={member.id} className="flex flex-col justify-center w-[120px]">
                            <Link to={`/members/${member.id}`}>
                                <img src="/user.svg" alt="The image could not be loaded" width={70} height={70} />
                                <h1 className="text-sm mt-[10px]">{member.firstName} {member.lastName}</h1>
                            </Link>
                        </li>
                    );
                })
            }
        </ul>
    );
}
