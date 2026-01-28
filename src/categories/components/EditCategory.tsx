import { useCategoryContext } from '@/categories/CategoryProvider'
import { useGlobalState } from '@/global/GlobalProvider'

import CategoryForm from "@/categories/components/CategoryForm";
import { FormMode, type ICategory } from "@/categories/types";

const EditCategory = ({ inLine }: { inLine: boolean }) => {
    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;

    const { state, cancelAddCategory, updateCategory } = useCategoryContext();

    const { activeCategory, keyExpanded } = state;
    const { questionId } = keyExpanded!;


    const cancel = async () => {
        await cancelAddCategory();
    }

    const close = async () => {
        await cancelAddCategory();
    }

    const submitForm = async (categoryObject: ICategory) => {
        const object: ICategory = {
            ...categoryObject,
            created: undefined,
            modified: {
                time: new Date(),
                nickName: nickName
            }
        }
        await updateCategory(object, true /* closeForm */)
    };

    return (
        <CategoryForm
            inLine={inLine}
            category={{ ...activeCategory! }}
            questionId={questionId}
            formMode={FormMode.EditingCategory}
            cancel={cancel}
            close={close}
            submitForm={submitForm}
        >
            Update Category
        </CategoryForm>
    );
};

export default EditCategory;
