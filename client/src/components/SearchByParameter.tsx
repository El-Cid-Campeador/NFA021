import { useNavigate } from "react-router-dom";
import { printColumnName } from "../functions";
import { useMemo } from "react";

type Props = {
    columnName: string,
    listOptions: string[] | number[]
}

export default function SearchByParameter({ columnName, listOptions }: Props) {
    const navigate = useNavigate();

    const x = useMemo(() => {
        return printColumnName(columnName);
    }, []);

    return (
        <>
            <div>
                <select onChange={(e) => navigate(`/explore/${columnName}/${e.target.value}`)}>
                    <option value={x}>{x}</option>
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
