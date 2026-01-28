
import { useCategoryContext } from '@/categories/CategoryProvider'

import { FormMode } from "@/categories/types";
import CategoryForm from "@/categories/components/CategoryForm";

const ViewCategory = ({ inLine }: { inLine: boolean }) => {
    const { state, cancelAddCategory } = useCategoryContext();
    const { activeCategory, keyExpanded } = state;
    const { questionId } = keyExpanded!;

    
    const close = async () => {
        await cancelAddCategory();
    }

    return (
        <CategoryForm
            inLine={inLine}
            category={{ ...activeCategory! }}
            questionId={questionId}
            formMode={FormMode.ViewingCategory}
            close={close}
            cancel={close}
            submitForm={() => { }}
        >
            View Category
        </CategoryForm>
    );
}

export default ViewCategory;
