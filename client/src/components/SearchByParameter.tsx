import { Dispatch } from "react";

type Props = {
    fieldName: string,
    listOptions: string[] | number[],
    value: string,
    onChange: Dispatch<React.SetStateAction<string>>
}

export default function SearchByParameter({ fieldName, listOptions, value, onChange }: Props) {
    return (
        <div>
            <select value={value} onChange={(e) => onChange(e.target.value)}>
                <option value="">{fieldName}</option>
                {
                    listOptions.map(option => {
                        return <option value={option} key={option}>{option}</option>;
                    })
                }
            </select> 
        </div>
    );
}
