type Props = {
    message: string,
    onConfirm: () => void,
    onCancel: () => void
}

export default function Modal({ message, onConfirm, onCancel }: Props) {
    return (
        <div 
            className="absolute top-0 right-0 bottom-0 left-0 flex justify-center items-center bg-[#000000cb] z-[9000]" 
            onClick={() => onCancel()}
        >
            <div 
                role="dialog" 
                className="absolute max-[640px]:top-[25%] p-[15px] bg-white rounded-lg shadow-xl dark:bg-gray-900 z-[9100]" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="m-5 text-white">{message}</div>
                <div className="flex justify-end ml-[65%]">
                    <span onClick={() => onCancel()} className="text-white font-bold m-2.5 p-2.5 border-2 border-solid border-white rounded-[8px] cursor-pointer">No</span>
                    <span onClick={() => onConfirm()} className="text-white font-bold m-2.5 p-2.5 border-2 border-solid border-white rounded-[8px] cursor-pointer">Yes</span>
                </div>
            </div>
        </div>
    );
}
