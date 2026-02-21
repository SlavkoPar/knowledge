import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRemove, faCaretRight, faCaretDown, faPlus, faFolder } from '@fortawesome/free-solid-svg-icons'
import APlus from '@/assets/APlus.png';

import { ListGroup, Button, Badge, Collapse } from "react-bootstrap";

import { useGlobalState } from '@/global/GlobalProvider'
import { type IGroupKey, type IGroupRow, FormMode, type IExpandInfo, GroupKey } from "@/groups/types";
import { useGroupContext, } from '@/groups/GroupProvider'

import { useHover } from "@uidotdev/usehooks";

import GroupList from "@/groups/components/GroupList";
import EditGroup from "@/groups/components/EditGroup";
import ViewGroup from "@/groups/components/ViewGroup";
import AnswerList from './answers/AnswerList';
import AddGroup from './AddGroup';

const GroupRow = ({ groupRow, answerId }: { groupRow: IGroupRow, answerId: string | null }) => {

    const { id, title, hasSubGroups, numOfAnswers, isExpanded, groupRows } = groupRow;
    groupRow.level += 1;

    console.log(groupRow);
    const groupKey: IGroupKey = new GroupKey(groupRow).groupKey!;
    console.log(groupKey);
    // const [groupKey] = useState<IGroupKey>({ topId, id }); // otherwise reloads
    // const [catKeyExpanded] = useState<IAnswerKey>({ topId, id, answerId }); // otherwise reloads

    const { canEdit, authUser } = useGlobalState();

    const { state, addGroup, viewGroup, editGroup, deleteGroup, expandGroup, collapseGroup, addAnswer } = useGroupContext();
    //const dispatch = useGroupDispatch();

    let { formMode, activeGroup, loadingGroup, groupLoaded } = state;
    const isSelected = activeGroup !== null && (activeGroup.id === id);

    const inAdding = formMode === FormMode.AddingGroup;
    // TODO proveri ovo
    const showAnswers = isExpanded && numOfAnswers > 0 // || answers.find(q => q.inAdding) // && !answers.find(q => q.inAdding); // We don't have answers loaded

    const deleteGroupRow = () => {
        groupRow.modified = {
            time: new Date(),
            nickName: authUser.nickName
        }
        deleteGroup(groupRow);
    };

    const handleExpandClick = async () => {
        if (isExpanded) {
            await collapseGroup(groupRow);
        }
        else {
            const expandInfo: IExpandInfo = {
                groupKey
            }
            await expandGroup(expandInfo);
        }
    }

    // const edit = async () => {
    //     // Load data from server and reinitialize group
    //     await editGroup(groupRow, answerId ?? 'null');
    // }

    const [open, setOpen] = useState<boolean>(false);
    useEffect(() => {
        //if (groupRows.length > 0) 
        setOpen(true);
    }, [groupRows]);

    const onSelectGroup = async (): Promise<any> => {
        if (canEdit)
            await editGroup(groupRow, answerId ?? 'null');
        else
            await viewGroup(groupRow, answerId ?? 'null');
    }

    const [queue, setQueue] = useState<boolean>(false);

    useEffect(() => {
        if (queue) {// && groupRow.id === _generateId) {
            addGroup(groupRow);
            setQueue(false);
        }
    }, [addGroup, groupRow, queue]);


    const [queue2, setQueue2] = useState<boolean>(false);
    useEffect(() => {
        if (queue2) {// && groupRow.id === _generateId) {
            // actegoryRow is after reducer update
            addAnswer(groupKey, isExpanded ?? false);
            setQueue2(false);
        }
    }, [addAnswer, groupKey, isExpanded, queue2]);


    useEffect(() => {
        (async () => {
            if (isSelected && !loadingGroup && !groupLoaded && !inAdding) {
                console.log('GroupRow formMode:', formMode)
                switch (formMode) {
                    case FormMode.ViewingGroup:
                        await viewGroup(groupRow, answerId ?? 'null');
                        break;
                    case FormMode.EditingGroup:
                        canEdit
                            ? await editGroup(groupRow, answerId ?? 'null')
                            : await viewGroup(groupRow, answerId ?? 'null');
                        break;
                }
            }
        })()
    }, [canEdit, groupKey, groupLoaded, groupRow, editGroup, expandGroup, formMode, inAdding, isSelected, loadingGroup, answerId, viewGroup]);

    const [hoverRef, hovering] = useHover();
    //console.log("..........................: ", document.querySelectorAll(`#Row${id}`)!.length);

    const Row1 =
        <div>
            <div id={`Row${id}`}
                className={`d-relative d-flex justify-content-start align-items-end w-100 mt-1 group-row${isSelected ? '-selected' : ''}`}
                style={{ marginTop: '1px' }} >
                <Button
                    variant='link'
                    size="sm"
                    className="py-0 px-1" //  bg-light"
                    aria-controls={id + '-2'}
                    aria-expanded={open}
                    onClick={(e) => { handleExpandClick(); e.stopPropagation() }}
                    title="Expand"
                    disabled={inAdding || (!hasSubGroups && numOfAnswers === 0)}
                >
                    <FontAwesomeIcon icon={isExpanded ? faCaretDown : faCaretRight} size='lg' />
                </Button>
                <Button
                    variant='link'
                    size="sm"
                    className="py-0 px-1 bg-light"
                    // onClick={expand}
                    title="Expand"
                    disabled={true} //{alreadyAdding || (!hasSubGroups && numOfAnswers === 0)}
                >
                    <FontAwesomeIcon icon={faFolder} size='sm' />
                </Button>
                <Button
                    variant='link'
                    size="sm"
                    className={`py-0 ms-0 me-1 group-row-title ${isSelected ? 'fw-bold text-white bg-transparent' : ''}`}
                    title={id}
                    onClick={onSelectGroup}
                    disabled={inAdding}
                >
                    {title}
                    {/* &nbsp;<span>{formMode.substring(0, 3)}</span>&nbsp;<span>{hovering?'hov':'jok'}</span> */}
                </Button>

                {numOfAnswers > 0 &&
                    <Badge pill bg="secondary" className={'d-inline bg-transparent'}>
                        {numOfAnswers}A
                        {/* <FontAwesomeIcon icon={faAnswer} size='sm' /> */}
                        {/* <img width="22" height="18" src={Q} alt="Answer" /> */}
                    </Badge>
                }

                {!inAdding && canEdit && hovering &&

                    <div className="position-absolute text-nowrap d-flex align-items-end border border-0 border-warning p-0 end-0">
                        <div className="d-flex align-items-end">
                            {numOfAnswers === 0 &&
                                <Button
                                    variant='link'
                                    size="sm"
                                    className="border-0 py-0 px-0 ms-0 text-success"
                                    title="Add SubGroup"
                                    onClick={async () => {
                                        //dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM, payload: {} })
                                        if (!isExpanded && (hasSubGroups || numOfAnswers > 0)) {
                                            await handleExpandClick();
                                        }
                                        setTimeout(() => setQueue(true), 1000);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faPlus} size='lg' />
                                </Button>
                            }
                        </div>

                        {!hasSubGroups &&
                            // top-0 end-0
                            <div className="d-flex align-items-end">
                                <Button
                                    variant='link'
                                    size="sm"
                                    className="p-0 mx-0 text-secondary d-flex align-items-end border border-0 border-warning"
                                    title="Add Answer"
                                    onClick={async () => {
                                        //const groupInfo: IGroupInfo = { groupKey: { workspace: topId, id: groupRow.id }, level: groupRow.level }
                                        if (!isExpanded && numOfAnswers > 0) {
                                            await handleExpandClick();
                                        }
                                        setTimeout(() => setQueue2(true), 500);
                                    }}
                                >
                                    <img width="22" height="18" src={APlus} alt="Add Answer" />
                                </Button>

                                <Button variant='link' size="sm"
                                    className="d-flex align-items-end border border-0 border-warning p-0"
                                    disabled={hasSubGroups || numOfAnswers > 0}
                                    onClick={deleteGroupRow}
                                >
                                    <FontAwesomeIcon icon={faRemove} size='lg' />
                                </Button>
                            </div>
                        }

                    </div>
                }

                {/* TODO what about archive answers  numOfAnswers === 0 &&*/}

            </div>
            {showAnswers &&
                <div className='ps-3'>
                    <AnswerList groupRow={groupRow} />
                </div>
            }
        </div>

    // console.log({ title, isExpanded })

    // if (group.level !== 1)
    //     return (<div>GroupRow {group.id}</div>)

    // console.log('groupRow:', { isSelected, formMode, id})
    return (
        <>
            <ListGroup.Item
                // variant={"primary"}
                className="py-0 px-1 w-100 group-bg"
                as="li"
            >
                {isSelected && formMode === FormMode.AddingGroup &&
                    <div>
                        <div ref={hoverRef} className="">
                            {Row1}
                        </div>
                        {/* ms-0 d-md-none w-100 */}
                        <div className="ms-0 d-md-none w-100">
                            <AddGroup activeGroup={activeGroup} />
                        </div>
                    </div>
                }

                {isSelected && formMode === FormMode.EditingGroup &&
                    <>
                        {/* <div class="d-none d-md-block">
                            This content will be hidden on small screens and below, 
                            but visible on medium screens and above.</div> */}
                        <div ref={hoverRef}>
                            {Row1}
                        </div>
                        {/* <div id='divInLine' className="ms-0 d-md-none w-100"> */}
                        <div id='divInLine' className="ms-0 d-md-none w-100">
                            <EditGroup inLine={false} />
                        </div>
                    </>
                }

                {isSelected && formMode === FormMode.ViewingGroup &&
                    <>
                        {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                        <div ref={hoverRef}>
                            {Row1}
                        </div>
                        {/* <div id='divInLine' className="ms-0 d-md-none w-100"> */}
                        <div id='divInLine' className="ms-0 d-md-none w-100">
                            <ViewGroup inLine={false} />
                        </div>
                    </>
                }

                {isSelected && formMode === FormMode.None &&
                    <>
                        {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                        <div ref={hoverRef}>
                            {Row1}
                        </div>
                        {/* <div id='divInLine' className="ms-0 d-md-none w-100"> */}
                        <div id='divInLine' className="ms-0 d-md-none w-100">
                            <ViewGroup inLine={false} />
                        </div>
                    </>
                }

                {!isSelected &&
                    <div ref={hoverRef}>
                        {Row1}
                    </div>
                }

                {/* {isSelected &&
                    <div className="d-none d-md-block">
                        {Row1}
                    </div>
                } */}


            </ListGroup.Item>

            {state.error && state.whichRowId === id && <div className="text-danger">{state.error.message}</div>}

            {/* !inAdding && */}
            {(isExpanded) && // Row2   //  || inAdding
                <ListGroup.Item
                    className="py-0 px-0 border-0 border-warning border-bottom-0 group-bg p-0 m-0" // border border-3 "
                    variant={"primary"}
                    as="li"
                >
                    <div className="rambo">
                        {hasSubGroups &&
                            <Collapse in={open}>
                                <div id={id + '-2'} style={{ marginTop: '1px' }}>
                                    {/* Wrap content in a div to prevent choppy animations caused by margins/padding */}
                                    <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
                                        <GroupList groupRow={groupRow} isExpanded={isExpanded} />
                                    </div>
                                </div>
                            </Collapse>
                        }
                        {/* {showAnswers &&
                                <AnswerList groupRow={groupRow} />
                            } */}
                    </div>
                </ListGroup.Item>
            }
        </>
    );
};

export default GroupRow;
