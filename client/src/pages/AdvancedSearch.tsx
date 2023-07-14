import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { bookCategories, bookLanguages, generateYears, fetcher, areAllAttributesEmptyStrings } from "../functions";
import Books from "../components/Books";
import SearchByParameter from "../components/SearchByParameter";
import NavBar from "../components/NavBar";

export default function AdvancedSearch() {
    const [category, setCategory] = useState('');
    const [year, setYear] = useState('');
    const [lang, setLang] = useState('');

    const search = useMemo(() => {
        return { category, year, lang };
    }, [category, year, lang]);

    const { data: queryBooks, isLoading, error } = useQuery({
		queryKey: ['books', { ...search }],
        queryFn: async () => {
            if (areAllAttributesEmptyStrings(search)) {
                return { result: [] };
            }

            const { data } = await fetcher.get(`http://localhost:8080/books/search`, {
                params: { ...search }
            });
            
            return data as { result: Book[] };
        }
	});

    if (error) return <Navigate to="/signin" />;

    return (
        <>
            <NavBar />
            <div className="w-[510px] max-h-[200px] y-[10px] mx-auto p-[10px] border-[1px] border-solid border-customBlue rounded-2xl">
                <div className="flex gap-[10px]">
                    <SearchByParameter fieldName="Category" listOptions={bookCategories} value={category} onChange={setCategory} />
                    <SearchByParameter fieldName="Year of publishing" listOptions={generateYears()} value={year} onChange={setYear} />
                    <SearchByParameter fieldName="Language" listOptions={bookLanguages} value={lang} onChange={setLang} />
                </div>
                
            </div>
            {
                isLoading ? (
                    <h1>Loading...</h1>
                ) : (
                    queryBooks!.result.length > 0 ? (
                        <Books result={queryBooks!.result} />
                    ) : <p className="text-center mt-[10px]">No results found!</p>
                )
            }
        </>
    );
}
