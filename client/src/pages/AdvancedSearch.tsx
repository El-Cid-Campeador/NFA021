import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { bookCategories, bookLanguages, generateYears, fetcher, areAllAttributesEmptyStrings } from "../functions";
import Books from "../components/Books";
import SearchByParameter from "../components/SearchByParameter";
import Container from "../components/Container";
import Loading from "../components/Loading";

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

            const { data } = await fetcher.get(`/api/books/search`, {
                params: { ...search }
            });
            
            return data as { result: { id: string, title: string, imgUrl: string }[] };
        }
	});

    if (error) return <Navigate to="/signin" />;

    return (
       <Container content={
            <>
                <div className="w-[310px] sm:w-[510px] h-auto sm:max-h-[200px] mt-[100px] sm:mt-[10px] mx-auto p-[10px] border-[1px] border-solid border-customBlue rounded-2xl">
                    <div className="flex flex-col sm:flex-row flex-wrap gap-[10px]">
                        <SearchByParameter fieldName="Category" listOptions={bookCategories} value={category} onChange={setCategory} />
                        <SearchByParameter fieldName="Year of publishing" listOptions={generateYears()} value={year} onChange={setYear} />
                        <SearchByParameter fieldName="Language" listOptions={bookLanguages} value={lang} onChange={setLang} />
                    </div>
                </div>

                {
                    isLoading ? (
                        <Loading />
                    ) : (
                        queryBooks!.result.length > 0 ? (
                            <Books result={queryBooks!.result} />
                        ) : <h1 className="text-center mt-[10px]">No results found!</h1>
                    )
                }
            </>
       } />
    );
}
