import { lazy, Suspense, useEffect, useState } from 'react'
import { Container, Row, Col, Button } from "react-bootstrap";

import { useParams } from 'react-router-dom';

import { ActionTypes, type IGroupKey, type IAnswerKey, FormMode } from "./types";

import { useGlobalContext, useGlobalState } from '@/global/GlobalProvider';

import { GroupProvider, useGroupContext, useGroupDispatch } from "./GroupProvider";

import GroupList from "@/groups/components/GroupList";
import ViewGroup from "@/groups/components/ViewGroup";
import EditGroup from "@/groups/components/EditGroup";
import ViewAnswer from "@/groups/components/answers/ViewAnswer";
import EditAnswer from "@/groups/components/answers/EditAnswer";

import { initialGroup, initialAnswer } from "@/groups/GroupReducer";
import ModalAddAnswer from './ModalAddAnswer';
import AddGroup from './components/AddGroup';
//import { AutoSuggestAnswers } from '@/global/Components/AutoSuggests/AutoSuggestAnswers';
import AddAnswer from './components/answers/AddAnswer';

interface IProps {
    groupId_answerId?: string;
    fromChatBotDlg?: string;
}

const AutoSuggestAnswers = lazy(() =>
    import("@/global/Components/AutoSuggests/AutoSuggestAnswers").then((module) => ({ default: module.AutoSuggestAnswers }))
);

const Providered = ({ groupId_answerId, fromChatBotDlg }: IProps) => {
    const { state, expandNodesUpToTheTree, loadTopRows, addGroup } = useGroupContext();
    const {
        allGroupRows, //allGroupRowsLoaded,
        topRows, topRowsLoading, topRowsLoaded,
        keyExpanded,
        groupId_answerId_done,
        nodeOpening, nodeOpened,
        activeGroup,
        activeAnswer,
        formMode,
        loadingGroups, loadingGroup,
        loadingAnswers, loadingAnswer
    } = state;

    const { searchAnswers, setLastRouteVisited, setChatBotDlgEnabled } = useGlobalContext();
    const { isDarkMode, chatBotDlgEnabled, lastRouteVisited } = useGlobalState();

    const [modalShow, setModalShow] = useState(false);
    // const handleClose = () => {
    //     setModalShow(false);
    // }

    const [newAnswer, setNewAnswer] = useState({ ...initialAnswer });

    const dispatch = useGroupDispatch();

    const onSelectAnswer = async (answerKey: IAnswerKey) => {
        //navigate(`/groups/${answerKey.topId}_${answerKey.id}`)
        dispatch({ type: ActionTypes.SET_ANSWER_SELECTED, payload: { answerKey } })
    }


    let tekst = '';

    useEffect(() => {
        (async () => {
            if (!topRowsLoading && !topRowsLoaded) {
                console.log('ZOVEM 111 loadTopRows()')
                await loadTopRows();
            }
        })()
    }, [topRowsLoading, topRowsLoaded, loadTopRows]);


    useEffect(() => {
        (async () => {
            if (!nodeOpening && topRowsLoaded && topRows.length > 0) {
                if (groupId_answerId) {
                    if (groupId_answerId === 'add_answer') {
                        const sNewAnswer = localStorage.getItem('New_Answer');
                        if (sNewAnswer) {
                            const q = JSON.parse(sNewAnswer);
                            setNewAnswer({ ...initialAnswer, groupTitle: 'Select', ...q })
                            setModalShow(true);
                            localStorage.removeItem('New_Answer');
                            return null;
                        }
                    }
                    else if (groupId_answerId !== groupId_answerId_done) { //} && !nodeOpened) {
                        const arr = groupId_answerId.split('_');
                        const groupId = arr[0];
                        const answerId = arr[1];
                        const grpKey: IGroupKey = { topId: '', id: groupId, parentId: 'ROOT' };
                        console.log('zovem expandNodesUpToTheTree 1111111111111111111)', { groupId_answerId }, { groupId_answerId_done })
                        await expandNodesUpToTheTree(grpKey, answerId !== 'null' ? answerId : null)
                        console.log('zavrsio expandNodeUpToTheTree 1111111111111111111 DONE)', { groupId_answerId })
                    }
                }
                else if (keyExpanded && !nodeOpened) {
                    const { topId, groupId, answerId } = keyExpanded;
                    if (groupId !== '') {
                        const grpKey: IGroupKey = { topId, id: groupId, parentId: 'ROOT' }
                        console.log('zovem expandNodeUpToTheTree 2222222222222)', { keyExpanded, grpKey })
                        await expandNodesUpToTheTree(grpKey, answerId);
                        console.log('zavrsio expandNodeUpToTheTree 2222222222222 DONE)')
                    }
                }

                if (!chatBotDlgEnabled) // show ChatBotDlg button
                    setChatBotDlgEnabled();
            }
        })()
    }, [groupId_answerId, groupId_answerId_done, topRowsLoaded, keyExpanded, nodeOpening, nodeOpened, expandNodesUpToTheTree, fromChatBotDlg, chatBotDlgEnabled, setChatBotDlgEnabled]);

    const route = `/knowledge/groups`;
    useEffect(() => {
        if (lastRouteVisited !== route)
            setLastRouteVisited(route);
    }, [lastRouteVisited, setLastRouteVisited]);

    if (groupId_answerId !== 'add_answer') {
        if (/*keyExpanded ||*/ (groupId_answerId && groupId_answerId !== groupId_answerId_done)) {
            console.log("zzzzzz loading...", { keyExpanded, groupId_answerId, groupId_answerId_done })
            return <div>loading...</div>
        }
    }

    //if (!nodeOpened)
    //if (!allGroupRowsLoaded || !topRowsLoaded || topRows.length === 0) {
    if (!topRowsLoaded) {// || topRows.length === 0) {
        console.log('===>>> Groups  VRATIO')
        return null
    }

    console.log('===>>> Groups !!!!!!!!!!!!!!!!!', activeGroup)

    return (
        <>
            <Container>
                <h5 className="text-warning mx-auto w-75 fw-bold"><span className='groups'>Groups / </span><span className='answers'>Answers</span></h5>

                <Row className={`${isDarkMode ? "dark" : ""}`}>
                    <Col>
                        <div className="d-flex justify-content-start align-items-center">
                            <div className="w-75 my-1 answers">
                                <Suspense fallback={<div>Loading...</div>}>
                                    <AutoSuggestAnswers
                                        tekst={tekst}
                                        onSelectAnswer={onSelectAnswer}
                                        allGroupRows={allGroupRows}
                                        searchAnswers={searchAnswers}
                                    />
                                </Suspense>
                            </div>
                        </div>
                    </Col>
                </Row>

                <Button variant="secondary" size="sm" type="button" style={{ padding: '1px 4px' }}
                    onClick={
                        () => addGroup(null)
                    }
                >
                    Add Group
                </Button>

                <Row className="my-1 h-auto">
                    <Col xs={12} md={5}>
                        <div className="groups-border" style={{ position: 'relative' }}>
                            <GroupList groupRow={{ ...initialGroup, groupRows: topRows }} isExpanded={true} />
                        </div>
                    </Col>
                    <Col xs={0} md={7}>
                        {/* visible on medium screens and above. */}
                        <div id='div-details' className="d-none d-md-block">
                            {activeGroup && formMode === FormMode.ViewingGroup && <ViewGroup inLine={false} />}
                            {activeGroup && formMode === FormMode.EditingGroup &&
                                <EditGroup inLine={false} />
                            }
                            {activeGroup && formMode === FormMode.AddingGroup && <AddGroup activeGroup={activeGroup} />}

                            {activeAnswer && formMode === FormMode.ViewingAnswer && <ViewAnswer inLine={false} />}
                            {activeAnswer && formMode === FormMode.EditingAnswer &&
                                <EditAnswer inLine={false} />
                            }
                            {activeAnswer && formMode === FormMode.AddingAnswer && <AddAnswer />}
                        </div>
                    </Col>
                </Row>
            </Container>
            {modalShow && activeAnswer &&
                <ModalAddAnswer
                    show={modalShow}
                    onHide={() => { setModalShow(false) }}
                    newAnswerRow={newAnswer}
                />
            }


            {(loadingGroups || loadingAnswers) &&
                <div className="d-flex justify-content-center align-items-center" style={{ position: 'absolute', top: '40%', left: '20%' }}>
                    <div className={`spinner-border ${loadingAnswers ? 'answer' : 'group'}-spinner`} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            }

            {loadingGroup &&
                <div className="d-flex justify-content-center align-items-center" style={{ position: 'absolute', top: '50%', left: '50%' }}>
                    <div className="spinner-border group-spinner" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            }

            {loadingAnswer &&
                <div className="d-flex justify-content-center align-items-center" style={{ position: 'absolute', top: '50%', left: '50%' }}>
                    <div className="spinner-border answer-spinner" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            }
        </>
    );
};

type Params = {
    groupId_answerId?: string;
    fromChatBotDlg?: string;
};

const Groups = () => {

    let { groupId_answerId, fromChatBotDlg } = useParams<Params>();

    if (groupId_answerId && groupId_answerId === 'groups')
        groupId_answerId = undefined;

    if (groupId_answerId) {
        const arr = groupId_answerId!.split('_');
        console.assert(arr.length === 2, "expected 'groupId_answerId'")
    }
    // const globalState = useGlobalState();
    // const { isAuthenticated } = globalState;

    // if (!isAuthenticated)
    //     return <div>groups loading...</div>;

    return (
        <GroupProvider>
            <Providered groupId_answerId={groupId_answerId} fromChatBotDlg={fromChatBotDlg} />
        </GroupProvider>
    )
}

export default Groups;

