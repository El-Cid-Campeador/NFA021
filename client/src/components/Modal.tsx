type Props = {
    message: string,
    onConfirm: () => void,
    onCancel: () => void
}

export default function Modal({ message, onConfirm, onCancel }: Props) {
    return (
        <div className="absolute top-0 right-0 bottom-0 left-0 bg-[#000000cb] z-9999 flex justify-center items-center" onClick={() => onCancel()}>
            <div className="flex flex-col w-[500px] h-[300px] bg-[#dc143c] rounded-[8px] overflow-hidden"  onClick={(e) => e.stopPropagation()}>
                <div className="m-5 text-white">{message}</div>
                <div className="flex justify-between">
                    <span onClick={() => onConfirm()} className="text-white font-bold m-2.5 p-2.5 border-2 border-solid border-white rounded-[8px] cursor-pointer">Yes</span>
                    <span onClick={() => onCancel()} className="text-white font-bold m-2.5 p-2.5 border-2 border-solid border-white rounded-[8px] cursor-pointer">No</span>
                </div>
            </div>
        </div>
    );
}
