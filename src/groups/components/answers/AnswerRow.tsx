import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRemove } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button } from "react-bootstrap";

import { useGlobalState } from '@/global/GlobalProvider'
import { FormMode, type IGroupKey, type IAnswerRow } from "@/groups/types";
import { useGroupContext } from '@/groups/GroupProvider'
import { useHover } from "@uidotdev/usehooks";

import AddAnswer from "@/groups/components/answers/AddAnswer";
import EditAnswer from "@/groups/components/answers/EditAnswer";
import ViewAnswer from "@/groups/components/answers/ViewAnswer";
import A from '@/assets/ATrans.png';
import APlus from '@/assets/APlusTrans.png'; 


//const AnswerRow = ({ answer, categoryInAdding }: { ref: React.ForwardedRef<HTMLLIElement>, answer: IAnswer, categoryInAdding: boolean | undefined }) => {
const AnswerRow = ({ answerRow, isSelected }: { answerRow: IAnswerRow, isSelected: boolean }) => {
    const { id, topId, parentId, title } = answerRow; // , isSelected
    //const answerKey: IAnswerKey = new AnswerKey(answerRow).answerKey!;
    const groupKey: IGroupKey = { topId, parentId, id: parentId! } // proveri

    const { canEdit, authUser } = useGlobalState();
    const { state, viewAnswer, addAnswer, editAnswer, deleteAnswer } = useGroupContext();

    const { activeAnswer, formMode, loadingAnswer, answerLoaded } = state;
    //const isSelected = useState(id === selectedAnswerId);

    const showForm = activeAnswer !== null && activeAnswer.id === id;

    //const [alreadyAdding] = useState(formMode === FormMode.AddingAnswer);
    const alreadyAdding = formMode === FormMode.AddingAnswer;

    const del = () => {
        answerRow.modified = {
            time: new Date(),
            nickName: authUser.nickName
        }
        deleteAnswer(answerRow, showForm /* isActive */);
    };

    // const edit = async (Id: string) => {
    //     // Load data from server and reinitialize answer
    //     await editAnswer(answerRow);
    // }

    const onSelectAnswer = async (id: string) => {
        console.log('AnswerRow onSelectAnswer', { id });
        if (canEdit)
            await editAnswer(answerRow);
        else
            await viewAnswer(answerRow);
    }

    const [hoverRef, hovering] = useHover();

    useEffect(() => {
        (async () => {
            if (isSelected && !loadingAnswer && !answerLoaded) {
                switch (formMode) {
                    case FormMode.ViewingAnswer:
                        await viewAnswer(answerRow);
                        break;
                    case FormMode.EditingAnswer:
                        console.log('Zovem from AnswerRow')
                        canEdit
                            ? await editAnswer(answerRow)
                            : await viewAnswer(answerRow);
                        break;
                }
                // hoverRef!.current?
                const el = document.getElementById(`AnswerRow${id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        })()
        // after using new Answer() in getAnswer() editAnswer gets modified // viewAnswer, editAnswer
    }, [canEdit, editAnswer, formMode, id, isSelected, loadingAnswer, answerLoaded, answerRow, viewAnswer]);

    const Row1 =

        <div id={`AnswerRow${id}`} className={`d-relative d-flex justify-content-start align-items-center w-100 mt-0 answer-row${isSelected ? '-selected' : ''}`} style={{ marginTop: '1px' }} >
            <Button
                variant='link'
                size="sm"
                className="d-flex align-items-center px-1 text-secondary"
            >
                <img width="22" height="18" src={A} alt="Answer" />
            </Button>
            <Button
                variant='link'
                size="sm"
                className={`p-0 px-1 m-1 ms-0 answer-row-title ${showForm ? 'fw-bold' : ''}`}
                title={`id:${id!.toString()}`}
                onClick={() => onSelectAnswer(id!)}
                disabled={alreadyAdding}
            >
                {title}
            </Button>
            
            {/* {canEdit && !alreadyAdding && hovering &&
                <Button variant='link' size="sm" className="ms-1 py-0 px-1 text-secondary"
                    //onClick={() => { dispatch({ type: ActionTypes.EDIT, answer }) }}>
                    onClick={() => edit(_id!)}
                >
                    <FontAwesomeIcon icon={faEdit} size='lg' />
                </Button>
            } */}

            {canEdit && !alreadyAdding && hovering &&
                <div className="position-absolute text-nowrap d-flex align-items-center border border-0 border-warning p-0 end-0">
                    <Button
                        variant='link'
                        size="sm"
                        className="ms-1 p-0 text-secondary d-flex align-items-center"
                        title="Add Answer"
                        onClick={() => {
                            //const categoryInfo: IGroupInfo = { groupKey, level: 0 }
                            addAnswer(groupKey, true);
                        }}
                    >
                        <img width="22" height="18" src={APlus} alt="Add Answer" />
                    </Button>
                    <Button variant='link' size="sm" className="ms-0 p-0 text-secondary"
                        onClick={del}
                    >
                        <FontAwesomeIcon icon={faRemove} size='lg' />
                    </Button>

                </div>
            }
        </div>

    // console.log('---@@@@@@@@@@@@@ AnswerRow', { id, isSelected, formMode, answerLoaded })
    return (
        // border border-3 border-danger"
        // <div className="py-0 px-0 w-100 list-group-item border">
        <ListGroup.Item
            // variant={"primary"}
            className="py-0 px-0 w-100"
            as="li"
        >
            {isSelected && formMode === FormMode.AddingAnswer &&
                <>
                    <div id='div-answer' className="ms-0 d-md-none w-100">
                        <AddAnswer
                            showCloseButton={true}
                            source={0} />
                    </div>
                    <div ref={hoverRef} className="d-none d-md-block  border rounded-3">
                        {Row1}
                    </div>
                </>
            }

            {isSelected && formMode === FormMode.EditingAnswer &&
                <>
                    <div ref={hoverRef} className="">
                        {/* d-none d-md-block */}
                        {Row1}
                    </div>
                    {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                    {/* <div id='div-answer' className="ms-0 d-md-none w-100"> */}
                    <div id='div-answer' className="ms-0 d-md-none w-100">
                        <EditAnswer inLine={true} />
                    </div>
                </>
            }

            {isSelected && formMode === FormMode.ViewingAnswer &&
                <>
                    <div ref={hoverRef} className="">
                        {/* d-none d-md-block */}
                        {Row1}
                    </div>
                    {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                    <div ref={hoverRef} id='div-answer' className="ms-0 d-md-none w-100">
                        <ViewAnswer inLine={true} />
                    </div>
                </>
            }

            {!isSelected &&
                // d-none d-md-block
                <div ref={hoverRef} className="">
                    {Row1}
                </div>
            }

        </ListGroup.Item>
    );
};

export default AnswerRow;
