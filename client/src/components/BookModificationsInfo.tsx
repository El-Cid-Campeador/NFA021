import { displayBookProperty } from "../functions";

type Props = {
    oldValues: Book,
    newValues: Book
}

export default function BookModificationsInfo({ oldValues, newValues }: Props) {
    const keys = Object.keys(oldValues);

    return (
        <>
            {
                keys.map((key) => {
                    const property = key as keyof Book;

                    if (oldValues[property] !== newValues[property]) {
                        return (
                            <div key={key} >
                                <strong>{displayBookProperty(key)}: </strong> 
                                <div className="ml-5">
                                    <p className={"bg-[#da3633] mb-3 text-white rounded"}>
                                        <span className="ml-1 mr-3">-</span>
                                        {oldValues[property]}
                                    </p>
                                    <p className={"bg-[#238636] mb-3 text-white rounded"}>
                                        <span className="ml-1 mr-3">+</span>
                                        {newValues[property]}
                                    </p>
                                </div>
                            </div>
                        )
                    }
                })
            }
        </>
    );
}
