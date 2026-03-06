import { useCategoryContext } from '@/categories/CategoryProvider'
import { useGlobalContext } from '@/global/GlobalProvider';
import { initialAnswer } from '@/groups/GroupReducer';

import AnswerForm from "@/categories/components/answers/AnswerForm";
import { type IAnswer } from "@/groups/types";
import { useState } from 'react';

interface IProps {
    closeModal?: () => void;
    showCloseButton?: boolean;
    source?: number;
    //setError?: (msg: string) => void;
    onAnswerCreated?: (answer: IAnswer) => void;
}

const AddAnswer = ({ onAnswerCreated, closeModal, showCloseButton, source }: IProps) => {

    const { createAnswer } = useGlobalContext();
    const { state } = useCategoryContext(); //, 
    const { activeQuestion } = state;
    const { topId } = activeQuestion!;
    const activeAnswer: IAnswer = { ...initialAnswer };

    if (!closeModal) {
        // const cat = state.topGroupRows.find(c => c.id === answerRow.parentId)
        // answerRow.groupTitle = cat ? cat.title : '';
    }

    const cancelAdd = async () => {
        closeModal!();
    }

    const [errorMsg, setErrorMsg] = useState('');


    const submitForm = async (answerObject: IAnswer) => {
        const newAnswer: IAnswer = {
            ...answerObject,
            topId: topId!,
            created: {
                time: new Date(),
                nickName: ''
            },
            modified: undefined
        }
        const { answer, msg } = await createAnswer(newAnswer);
        if (answer) {
            onAnswerCreated!(answer);
            if (closeModal) {
                closeModal();
                //dispatch({ type: ActionTypes.CLEAN_TREE, payload: { id: q.parentId } })
                //await openNode({ topId: '', id: q.parentId, answerId: q.id });
            }
        }
        else {
            setErrorMsg!(msg);
        }
    }

    if (!activeAnswer)
        return null;

    // activeAnswer.title += odakle
    return (
        <>
            <AnswerForm
                answer={activeAnswer!}
                showCloseButton={showCloseButton ?? true}
                source={source ?? 0}
                closeModal={cancelAdd}
                //formMode={FormMode.AddingAnswer}
                submitForm={submitForm}
            >
                Create Answer
            </AnswerForm >
            <div className="text-muted d-block">
                {errorMsg && <span className="text-danger">{errorMsg}</span>}
            </div>
        </>

    )
}

export default AddAnswer


