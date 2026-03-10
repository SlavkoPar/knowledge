import { /*forwardRef, */useCallback, useImperativeHandle, useState, type Ref } from 'react';
import { Accordion } from "react-bootstrap";
//import { useNavigate } from "react-router-dom";

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFolder } from '@fortawesome/free-solid-svg-icons'

// import { type IGroupRowegoryKey, type IGroupRow, type IQuestionShort } from '@/groups/types';

//import Q from '@/assets/Q.png';
//import A from '@/assets/A.png';
import type { AccordionEventKey } from 'react-bootstrap/esm/AccordionContext';
import type { IAccordionMethods } from '@/global/types';
import type { IGroupRow } from '@/groups/types';

// const PINK = 'rgba(255, 192, 203, 0.6)';
// const BLUE = 'rgb(224, 207, 252)';

// 2. Type the component's props, including the optional ref
type MapProps = {
    ref?: Ref<IAccordionMethods>;
    allGroupRows: Map<string, IGroupRow>;
    setParentId: (row: IGroupRow) => void;
};

const SelectGrp = ({ ref, allGroupRows, setParentId }: MapProps) => {
    const [topRows, setTopRows] = useState<IGroupRow[]>([]);

    const setParentGrp = (grp: IGroupRow) => {
        setParentId!(grp);
    }

    const Row = ({ row, setParentGrp }: { row: IGroupRow, setParentGrp: (grp: IGroupRow) => void }) => {
        const { id, hasSubGroups, numOfAnswers, title } = row;
        return (
            <Accordion.Item eventKey={id}>
                <Accordion.Header className={`${!hasSubGroups ? 'hide-icon' : ''} `}>
                    <div className="px-1  m-0 group-row" onClick={() => setParentGrp(row) }>
                        {title}
                    </div>

                    {numOfAnswers > 0 &&
                        <i className='ms-2 fw-light fs-6'>#{numOfAnswers}a</i>
                    }
                </Accordion.Header>
                <Accordion.Body>
                    {row.hasSubGroups &&
                        <List rows={row.groupRows} />
                    }
                </Accordion.Body>
            </Accordion.Item>
        )
    }

    const List = ({ rows }: { rows: IGroupRow[] }) => {
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
        const parentCat = allGroupRows.get(id);
        if (parentCat) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    const loadSubTree = useCallback(async (grpRow: IGroupRow): Promise<boolean> => {
        const { id } = grpRow;
        allGroupRows.forEach(async (row) => {
            if (row.id !== id && row.parentId === id) {
                await loadSubTree(row);
                grpRow.groupRows.push(row);
            }
        });
        return true;
    }, [allGroupRows]);

    //////////////////
    useImperativeHandle(ref, () => ({
        resetNavigator: () => {
            setTopRows([]);
            allGroupRows.forEach(async (row) => {
                row.groupRows = [];
                if (row.parentId === null) {
                    await loadSubTree(row);
                    setTopRows(prevTopRows => [...prevTopRows, row]);
                }
            });
        }
    }), [loadSubTree, allGroupRows]);

    return (
        <Accordion defaultActiveKey="" alwaysOpen={true} onSelect={onSelectGrp} >
            <List rows={topRows}></List>
        </Accordion>
    );
};

export default SelectGrp;