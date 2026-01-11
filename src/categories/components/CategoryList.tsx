import { ListGroup } from "react-bootstrap";
import CategoryRow from "@/categories/components/CategoryRow";
import type { ICategoryRow, IParentInfo } from "@/categories/types";
import { useCategoryContext } from "@/categories/CategoryProvider";

const CategoryList = ({ categoryRow }: IParentInfo) => {

    const { level, categoryRows} = categoryRow;

    const { state } = useCategoryContext();
    let { keyExpanded } = state;
    const { questionId } = keyExpanded ?? { topId: '', categoryId: '', questionId: null };

    return (
        <div className={level! > 1 ? 'ms-2' : ''} >
            <ListGroup as="ul" variant='dark' className="mb-0 category-bg">
                {categoryRows!.map((c: ICategoryRow) =>
                    <CategoryRow
                        //categoryRow={{ ...c, isSelected: c.id === id }}
                        categoryRow={c}
                        questionId={questionId === '' ? null : questionId}
                        // {c.topId === topId && c.id === id ? questionId : null}
                        key={c.id}
                    />
                )}
            </ListGroup>
            {/* {state.error && state.error} */}
            {/* {state.loading && <div>...loading</div>} */}
        </div>
    );
};

export default CategoryList;
