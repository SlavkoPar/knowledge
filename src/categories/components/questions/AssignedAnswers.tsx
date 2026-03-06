import { lazy, Suspense, useState } from "react";
import { Button, ListGroup, Modal } from "react-bootstrap";
import type { IAssignedAnswer, IAssignedAnswerKey, IQuestionKey } from "@/categories/types";
import { useCategoryContext } from "@/categories/CategoryProvider";
import { useGlobalContext } from "@/global/GlobalProvider";
import AssignedAnswer from "./AssignedAnswer";
//import { AutoSuggestAnswers } from '@/global/Components/AutoSuggests/AutoSuggestAnswers';
import { type IAnswer, type IAnswerRow } from "@/groups/types";
import AddAnswer from "@/categories/components/questions/AddAnswer"

const AutoSuggestAnswers = lazy(() =>
    import("@/global/Components/AutoSuggests/AutoSuggestAnswers").then((module) => ({ default: module.AutoSuggestAnswers }))
);

interface IProps {
    questionKey: IQuestionKey,
    questionTitle: string,
    assignedAnswers: IAssignedAnswer[],
    isDisabled: boolean
}

const AssignedAnswers = ({ questionKey, questionTitle, assignedAnswers, isDisabled }: IProps) => {

    const { globalState, searchAnswers } = useGlobalContext();
    const { isDarkMode, variant } = globalState;

    const [showAdd, setShowAdd] = useState(false);
    const handleClose = () => setShowAdd(false);

    const [lessThan15, setLessThan15] = useState(false);
    const [lessThan15Answers, setLessThan15Answers] = useState<IAnswerRow[]>([]);

    const myGetAnswerCount = async () => {
        const alreadyAssignedIds = assignedAnswers.map(a => a.id);
        const answers = await getAnswerCount();
        return answers.filter((a: IAnswerRow) => !alreadyAssignedIds.includes(a.id));
    }

    const mySearchAnswers = async (filter: string, count: number) => {
        const alreadyAssignedIds = assignedAnswers.map(a => a.id);
        const answers = await searchAnswers(filter, count, questionKey);
        return answers.filter((a: IAnswerRow) => !alreadyAssignedIds.includes(a.id));
    }

    const closeModal = () => {
        handleClose();
    }

    const { state, assignQuestionAnswer, getAnswerCount } = useCategoryContext();
    const { allGroupRows } = state;

    const [showAssign, setShowAssign] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    //const alreadyAssignedIds = assignedAnswers.map(a => a.id);


    const onSelectAnswer = async (assignedAnswerKey: IAssignedAnswerKey) => {
        // TODO in next version do not update MongoDB immediately, wait until user presses Save
        // User could have canceled question update
        await assignQuestionAnswer('Assign', questionKey, assignedAnswerKey);
        setShowAssign(false);
    }

    const onAnswerCreated = async (answer: IAnswer | null) => {
        if (answer) {
            await onSelectAnswer({ topId: answer.topId, id: answer.id } as IAssignedAnswerKey);
        }
        handleClose()
    }

    const unAssignAnswer = async (assignedAnswerKey: IAssignedAnswerKey) => {
        // const unAssigned: IWhoWhen = {
        //     time: new Date(),
        //     nickName: globalState.authUser.nickName
        // }
        await assignQuestionAnswer('UnAssign', questionKey, assignedAnswerKey);
        setErrorMsg('');

        // User could have canceled question update
        //setShowAssign(false);
    }


    const assignAnswer = async () => {
        const list: IAnswerRow[] = await getAnswerCount();
        const alreadyAssignedIds = assignedAnswers.map(a => a.id);
        const listUnassigned = list.filter(a => !alreadyAssignedIds.includes(a.id));
        if (listUnassigned.length === 0) {
            setErrorMsg('No answers available to assign. Navigate to Answers and create ones.');
            return;
        }
        setShowAssign(true);
        setLessThan15Answers(listUnassigned);
        setLessThan15(true);
    }

    const addNewAnswer = async () => {
        const list: IAnswerRow[] = await getAnswerCount();
        if (list.length === 0) {
            setErrorMsg('Please, Navigate to Answers and create ones.');
            return;
        }
        setShowAdd(true);
    }


    // if(allGroupRows.size === 0)
    //     return null;

    return (
        <div className={'mx-0 my-0 px-1 py-1 border border-2 rounded-2 border-info bg-info'} >
            <div>
                <label className="text-muted bg-info fs-6">Assigned Answers</label>
                <ListGroup as="ul" variant={variant} className='my-1'>
                    {assignedAnswers.map((assignedAnswer: IAssignedAnswer) =>
                        <AssignedAnswer
                            key={assignedAnswer.id}
                            questionTitle={questionTitle}
                            assignedAnswer={assignedAnswer}
                            groupInAdding={false}
                            isDisabled={isDisabled}
                            unAssignAnswer={unAssignAnswer}
                        />)
                    }
                </ListGroup>
                {state.error && <div>state.error</div>}
                {/* {state.loading && <div>...loading</div>} */}
            </div>
            {true && // we expect no question will ever assign all the answers from the database
                <>
                    <div className="d-flex justify-content-start w-100 align-items-center py-1">
                        <Button
                            size="sm"
                            className="button-edit py-0 rounded-1"
                            title="Assign a new Answer"
                            style={{ border: '1px solid silver', fontSize: '12px' }}
                            variant={variant}
                            disabled={isDisabled}
                            onClick={assignAnswer} // event.preventDefault()}
                        >
                            Assign answer
                        </Button>
                        <Button
                            size="sm"
                            className="button-edit py-0 rounded-1 mx-1"
                            title="Add and Assign a new Answer"
                            style={{ border: '1px solid silver', fontSize: '12px' }}
                            variant={variant}
                            disabled={isDisabled}
                            onClick={(e) => {
                                addNewAnswer();
                                e.preventDefault();
                            }
                            }
                        >
                            Add a new answer
                        </Button>

                    </div>
                    <div className="text-muted d-block">
                        {errorMsg && <span className="text-danger">{errorMsg}</span>}
                    </div>
                </>
            }

            <Modal
                show={showAdd}
                onHide={handleClose}
                animation={true}
                centered
                size="lg"
                className={`${isDarkMode ? "" : ""}`}
                contentClassName={`${isDarkMode ? "bg-info bg-gradient" : ""}`}
            >
                <Modal.Header closeButton>
                    <Modal.Title><label>Question:</label> {questionTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddAnswer
                        closeModal={closeModal}
                        showCloseButton={false}
                        onAnswerCreated={onAnswerCreated}
                    />
                </Modal.Body>
            </Modal>

            <Modal
                show={showAssign}
                onHide={() => setShowAssign(false)}
                animation={true}
                size="lg"
                centered
                className={`${isDarkMode ? "dark" : ""}`}
                contentClassName={`${isDarkMode ? "dark" : ""}`}>
                <Modal.Header closeButton>
                    <Modal.Title>Assign the answer</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: '40vh', width: '50vw' }} className="answers">
                    <Suspense fallback={<div>Loading...</div>}>
                        <AutoSuggestAnswers
                            tekst={lessThan15 ? '' : 'tekst'}
                            onSelectAnswer={onSelectAnswer}
                            allGroupRows={allGroupRows}
                            lessThan15Answers={lessThan15Answers}
                            getAnswerCount={myGetAnswerCount}
                            searchAnswers={(val: string, count: number) => mySearchAnswers(val, count)}
                        />
                    </Suspense>
                </Modal.Body>
            </Modal>
        </div >
    );
};

export default AssignedAnswers;

