import { useState, ChangeEvent, FormEvent, useEffect, Dispatch } from 'react';
import { BookFormData, bookCategories, bookLanguages, generateYears } from "../functions";
import { UseMutateFunction } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

type Props = {
    onSubmit: UseMutateFunction<AxiosResponse<any, any>, unknown, BookFormData, unknown>,
    initialValues: BookFormData,
    error: string,
    setError: Dispatch<React.SetStateAction<string>>
}

export default function BookForm({ onSubmit, initialValues, error, setError }: Props) {
    const [formData, setFormData] = useState<BookFormData>(initialValues);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setFormData((prevData) => {
            return ({
                ...prevData,
                [name]: value
            });
        });
    }

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        onSubmit(formData);
    };

    useEffect(() => {
        setError('');
    }, [formData]);

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Title: </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required />
                </div>
                <div>
                    <label htmlFor="imgUrl">Image URL: </label>
                    <input
                        type="text"
                        id="imgUrl"
                        name="imgUrl"
                        value={formData.imgUrl}
                        onChange={handleChange}
                        required />
                </div>
                <div>
                    <label htmlFor="authorName">Author name: </label>
                    <input
                        type="text"
                        id="authorName"
                        name="authorName"
                        value={formData.authorName}
                        onChange={handleChange}
                        required />
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
                <div>
                    <label htmlFor="descr">Description: </label>
                    <textarea
                        name="descr"
                        id="descr"
                        value={formData.descr}
                        onChange={handleChange}
                        cols={30}
                        rows={10}
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
                        value={formData.numEdition}
                        onChange={handleChange}
                        required />
                </div>
                <div>
                    <label htmlFor="numPages">Number of pages: </label>
                    <input
                        type="number"
                        id="numPages"
                        name="numPages"
                        value={formData.numPages}
                        onChange={handleChange}
                        required />
                </div>
                <button type="submit">Submit</button>
            </form>
            <p>{error}</p>
        </>
    );
}
