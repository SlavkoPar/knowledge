import { useState } from "react";
import { useCategoryContext } from '@/categories/CategoryProvider'
import { useGlobalState } from '@/global/GlobalProvider'

import CategoryForm from "@/categories/components/CategoryForm";
import { FormMode, type ICategory } from "@/categories/types";

const AddCategory = ({ activeCategory }: { activeCategory: ICategory | null }) => {
    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;
    const { cancelAddCategory, createCategory } = useCategoryContext();
    //const { activeCategory } = state;

    const [formValues] = useState<ICategory>({ ...activeCategory! });


    const cancel = async () => {
        await cancelAddCategory();
    }

    const close = async () => {
        await cancelAddCategory();
    }


    const submitForm = async (category: ICategory) => {
        const cat: ICategory = {
            ...category,
            created: {
                time: new Date(),
                nickName: nickName
            },
            modified: undefined
        }
        console.log("**********object", cat)
        await createCategory(cat);
    }
    if (!activeCategory === null)
        return null;

    console.log('AddCategory render >>>>>:', activeCategory);
    return (
        <>
            {/* {inLine ?
                <InLineCategoryForm
                    inLine={true}
                    category={formValues}
                    mode={FormMode.adding}
                    submitForm={submitForm}
                >
                    Create
                </InLineCategoryForm>
                : */}
            <CategoryForm
                inLine={false}
                category={formValues}
                questionId={null}
                formMode={FormMode.AddingCategory}
                cancel={cancel}
                close={close}
                submitForm={submitForm}
            >
                Create Category
            </CategoryForm >
            {/* } */}
        </>
    )
}

export default AddCategory
