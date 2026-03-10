import { /*forwardRef, */useCallback, useImperativeHandle, useState, type Ref } from 'react';
import { Accordion } from "react-bootstrap";
//import { useNavigate } from "react-router-dom";

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFolder } from '@fortawesome/free-solid-svg-icons'

// import { type ICategoryRowegoryKey, type ICategoryRow, type IQuestionShort } from '@/categorys/types';

//import Q from '@/assets/Q.png';
//import A from '@/assets/A.png';
import type { AccordionEventKey } from 'react-bootstrap/esm/AccordionContext';
import type { IAccordionMethods } from '@/global/types';
import type { ICategoryRow } from '@/categories/types';

// const PINK = 'rgba(255, 192, 203, 0.6)';
// const BLUE = 'rgb(224, 207, 252)';

// 2. Type the component's props, including the optional ref
type MapProps = {
    ref?: Ref<IAccordionMethods>;
    allCategoryRows: Map<string, ICategoryRow>;
    setParentId: (row: ICategoryRow) => void;
};

const SelectCat = ({ ref, allCategoryRows, setParentId }: MapProps) => {
    const [topRows, setTopRows] = useState<ICategoryRow[]>([]);

    const setParentGrp = (grp: ICategoryRow) => {
        setParentId!(grp);
    }

    const Row = ({ row, setParentGrp }: { row: ICategoryRow, setParentGrp: (grp: ICategoryRow) => void }) => {
        const { id, hasSubCategories, questionRows, title } = row;
        return (
            <Accordion.Item eventKey={id}>
                <Accordion.Header className={`${!hasSubCategories ? 'hide-icon' : ''} `}>
                    <div className="px-1  m-0 category-row" onClick={() => setParentGrp(row)}>
                        {title}
                    </div>

                    {questionRows && questionRows.length > 0 &&
                        <i className='ms-2 fw-light fs-6'>#{questionRows.length}a</i>
                    }
                </Accordion.Header>
                <Accordion.Body>
                    {row.hasSubCategories &&
                        <List rows={row.categoryRows} />
                    }
                </Accordion.Body>
            </Accordion.Item>
        )
    }

    const List = ({ rows }: { rows: ICategoryRow[] }) => {
        return (
            <>
                {rows.map((row) => (
                    <Row key={row.id} row={row} setParentGrp={setParentGrp} />
                ))}
            </>
        )
    }

    const onSelectGrp = async (eventKey: AccordionEventKey, e: React.SyntheticEvent<unknown>) => {
        const id = eventKey![0];
        const parentCat = allCategoryRows.get(id);
        if (parentCat) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    const loadSubTree = useCallback(async (grpRow: ICategoryRow): Promise<boolean> => {
        const { id } = grpRow;
        allCategoryRows.forEach(async (row) => {
            if (row.id !== id && row.parentId === id) {
                await loadSubTree(row);
                grpRow.categoryRows.push(row);
            }
        });
        return true;
    }, [allCategoryRows]);

    //////////////////
    useImperativeHandle(ref, () => ({
        resetNavigator: () => {
            setTopRows([]);
            allCategoryRows.forEach(async (row) => {
                row.categoryRows = [];
                if (row.parentId === null) {
                    await loadSubTree(row);
                    setTopRows(prevTopRows => [...prevTopRows, row]);
                }
            });
        }
    }), [loadSubTree, allCategoryRows]);

    return (
        <Accordion defaultActiveKey="" alwaysOpen={true} onSelect={onSelectGrp} >
            <List rows={topRows}></List>
        </Accordion>
    );
};

export default SelectCat;