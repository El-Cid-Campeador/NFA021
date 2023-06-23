import { useNavigate } from "react-router-dom";

type Props = {
    columnName: string,
    listOptions: string[] | number[]
}

export default function SearchByParameter({ columnName, listOptions }: Props) {
    const navigate = useNavigate();

    return (
        <>
            <div>
                <select onChange={(e) => navigate(`/explore/${columnName}/${e.target.value}`)}>
                    <option value={columnName}>{columnName}</option>
                    {
                        listOptions.map(option => {
                            return <option value={option} key={option}>{option}</option>;
                        })
                    }
                </select> 
            </div>
        </>
    );
}
