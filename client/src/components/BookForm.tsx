import { useState, ChangeEvent, useEffect, Dispatch } from 'react';
import { isAnyOfTheAttributesAnEmptyString, bookCategories, bookLanguages, generateYears, isNumber } from "../functions";
import { UseMutateFunction } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

type Props = {
    initialValues: BookFormData,
    onSubmit: UseMutateFunction<AxiosResponse<unknown, unknown>, unknown, BookFormData, unknown>,
    onCancel: () => void,
    error: string,
    setError: Dispatch<React.SetStateAction<string>>
}

export default function BookForm({ initialValues, onSubmit, onCancel, error, setError }: Props) {
    const [formData, setFormData] = useState<BookFormData>(initialValues);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;

        setFormData((prevData) => ({ ...prevData, [name]: value }));
    }

    function handleSubmit() {
        if (isAnyOfTheAttributesAnEmptyString(formData)) {
            setError('No empty fields!');

            return;
        }

        const { title, imgUrl, authorName, yearPubl, numEdition, nbrPages } = formData;

        if (title.length > 255) {
            setError('Invalid title! It must not exceed 255 characters!');

            return;
        }

        if (imgUrl.length > 255) {
            setError('Invalid image URL! It must not exceed 255 characters!');

            return;
        }

        if (authorName.length > 50) {
            setError('Invalid author name! It must not exceed 50 characters!');

            return;
        }

        if (!isNumber(yearPubl) && !isNumber(numEdition) && !isNumber(nbrPages) ) {
            setError('Invalid fields type!');
            
            return;
        }

        if (String(numEdition).length > 3) {
            setError('Invalid No. Edition! It must not exceed 3 characters!');

            return;
        }

        if (String(nbrPages).length > 5) {
            setError('Invalid number of pages! It must not exceed 5 characters!');

            return;
        }
        
        onSubmit(formData);
    }

    useEffect(() => {
        setError('');
    }, [formData, setError]);

    return (
        <div className="w-[500px] h-[95vh] my-[10px] mx-auto p-[10px] border-[1px]  border-solid border-customBlue rounded-2xl">
            <>
                <div>
                    <label htmlFor="title">Title: </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        maxLength={255}
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="imgUrl">Image URL: </label>
                    <input
                        type="text"
                        id="imgUrl"
                        name="imgUrl"
                        maxLength={255}
                        value={formData.imgUrl}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="authorName">Author name: </label>
                    <input
                        type="text"
                        id="authorName"
                        name="authorName"
                        maxLength={50}
                        value={formData.authorName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="category">Category: </label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Category</option>
                        {bookCategories.map((option) => (
                            <option value={option} key={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="lang">Language: </label>
                    <select
                        id="lang"
                        name="lang"
                        value={formData.lang}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Language: </option>
                        {bookLanguages.map((option) => (
                            <option value={option} key={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center">
                    <label htmlFor="descr">Description: </label>
                    <textarea
                        name="descr"
                        id="descr"
                        value={formData.descr}
                        onChange={handleChange}
                        cols={30}
                        rows={10}
                        required
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="yearPubl">Year of publication: </label>
                    <select
                        id="yearPubl"
                        name="yearPubl"
                        value={formData.yearPubl}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Year of publication</option>
                        {generateYears().map((option) => (
                            <option value={option} key={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="numEdition">No. Edition: </label>
                    <input
                        type="number"
                        id="numEdition"
                        name="numEdition"
                        maxLength={3}
                        value={formData.numEdition}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="nbrPages">Number of pages: </label>
                    <input
                        type="number"
                        id="nbrPages"
                        name="nbrPages"
                        maxLength={5}
                        value={formData.nbrPages}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button className="btn" onClick={() => handleSubmit()}>Submit</button>
                <button className="btn" onClick={() => onCancel()}>Cancel</button>
            </>
            <p className='error-msg'>{error}</p>
        </div>
    );
}
