import { type Reducer } from 'react'
import {
  ActionTypes, type Actions, type ILocStorage, IsGroup,
  type IGroupsState, type IGroup, type IGroupRow, type IAnswer,
  actionStoringToLocalStorage, FormMode, doNotModifyTree, doNotCallInnerReducerActions
} from "@/groups/types";


export const initialAnswer: IAnswer = {
  topId: '',
  parentId: 'null',
  id: 'generateId', //  keep 'generateId', it is expected at BackEnd
  groupTitle: '',
  title: '',
  source: 0,
  status: 0,
  included: false
}

export const initialGroup: IGroup = {
  topId: 'null',
  parentId: 'null',
  id: 'define at BackEnd',
  kind: 0,
  title: '',
  link: '',
  header: '',
  level: 0,
  variations: [],
  hasSubGroups: false,
  groupRows: [],
  answerRows: [],
  numOfAnswers: 0,
  hasMoreAnswers: false,
  isExpanded: false,
  doc1: ''
}

export const GroupReducer: Reducer<IGroupsState, Actions> = (state, action) => {

  console.log('------------------------------->')
  console.log('----------------------- GroupReducer >', action.type)
  console.log('------------------------------->')
  // ----------------------------------------------------------------------
  // Rubljov: "By giving the right name, you reveal the essence of things"
  // ----------------------------------------------------------------------
  //
  // - firstLevelGroupRow AAA
  // ------> groupRow AAA.1
  // --------- > groupRow AAA 1.1
  // --------- > ...
  //
  // ------> groupRow AAA.2
  // --------- > groupRow AAA 2.1
  // --------- > groupRow AAA 2.2
  // ------------ > Group Row AAA 2.2.1
  // ------------ > groupRow AAA 2.2.2
  // --------------- > groupRow AAA 2.2.2.1
  // --------------- > groupRow AAA 2.2.2.2
  //
  // --------- > groupRow AAA 2.3
  //
  // - firstLevelGroupRow BBB
  // - ...

  const { groupRow } = action.payload;
  // const isGroup = IsGroup(groupRow); // IGroup rather than IGroupRow

  if (action.type === ActionTypes.SET_KEY_EXPANDED) {
    const { keyExpanded } = action.payload;
    return {
      ...state,
      keyExpanded,
      nodeOpened: keyExpanded === null ? true : state.nodeOpened
    }
  }

  let modifyTree = groupRow
    ? doNotModifyTree.includes(action.type) ? false : true
    : false;

  const { topRows } = state;


  const newState = doNotCallInnerReducerActions.includes(action.type)
    ? { ...state }
    : innerReducer(state, action);

  // return { ...state } // calling this, state would be destroyed, because of shallow copy
  // Action that modify Tree
  // Actually part topRows of state
  if (modifyTree && groupRow) { //} && groupRow.topId !== 'ROOT') {
    let newTopRows: IGroupRow[];
    const { topId, id } = groupRow!;
    if (id === topId) {
      // actually topRows is from previous state
      newTopRows = topRows.map(c => c.id === topId
        ? new DeepClone(groupRow!).groupRow
        : new DeepClone(c).groupRow
      );
    }
    else {
      // actually topRows is from previous state
      const topRow: IGroupRow = topRows.find(c => c.id === topId)!;
      DeepClone.idToSet = action.type === 'SET_GROUP_ADDED' ? 'generateId' : id;
      DeepClone.newGroupRow = groupRow!;
      const newTopRow = new DeepClone(topRow).groupRow;
      newTopRows = topRows.map(c => c.id === topId
        ? newTopRow
        : new DeepClone(c).groupRow
      );
      DeepClone.idToSet = '';
    }
    newState.topRows = newTopRows;
  }
  else {
    // just clone to enable time-travel debugging
  }

  if (actionStoringToLocalStorage.includes(action.type)) {
    const { keyExpanded } = newState;
    const locStorage: ILocStorage = {
      keyExpanded
    }
    localStorage.setItem('GROUPS_STATE', JSON.stringify(locStorage));
  }

  console.log('GroupReducer newState', newState)
  return newState;
}

const innerReducer = (state: IGroupsState, action: Actions): IGroupsState => {
  switch (action.type) {

    //////////////////////////////////////////////////
    // Rows Level: 1

    case ActionTypes.SET_TOP_ROWS_LOADING:
      return {
        ...state,
        loadingGroups: true,
        topRowsLoading: true,
        //topRowsLoaded: false
      }

    case ActionTypes.SET_TOP_ROWS: {
      const { topRows } = action.payload;
      console.log('=> GroupsReducer ActionTypes.SET_TOP_ROWS', topRows)
      return {
        ...state,
        topRows,
        topRowsLoading: false,
        topRowsLoaded: true,
        loadingGroups: false
      };
    }

    case ActionTypes.SET_ALL_GROUP_ROWS: {
      const { allGroupRows } = action.payload;
      return {
        ...state,
        allGroupRows,
        allGroupRowsLoaded: Date.now()
      };
    }

    case ActionTypes.SET_NODE_EXPANDING_UP_THE_TREE: {
          const { groupId_answerId_done } = action.payload;
          //const { keyExpanded /*, activeCategory, activeQuestion */ } = state;
          return {
            ...state,
            groupId_answerId_done,
            nodeOpening: true,
            loadingGroups: true,
            nodeOpened: false,
            //keyExpanded: fromChatBotDlg ? null : { ...keyExpanded! },
            activeGroup: null, //fromChatBotDlg ? null : activeCategory,
            activeAnswer: null //fromChatBotDlg ? null : activeQuestion
          }
        }



    case ActionTypes.SET_NODE_EXPANDED_UP_THE_TREE: {
      const { group, formMode, grpKey, answerId, answer } = action.payload;
      const { id } = grpKey; //;
      return {
        ...state,
        activeGroup: group,
        activeAnswer: answer,
        selectedAnswerId: answerId,
        formMode,
        groupId_answerId_done: `${id}_${answerId}`,
        nodeOpening: false,
        nodeOpened: true,
        loadingGroups: false
      };
    }

    case ActionTypes.SET_LOADING_GROUP:
      return {
        ...state,
        //activeGroup: null,
        loadingGroup: true,
        groupLoaded: false
      }


    // case ActionTypes.FORCE_OPEN_NODE:
    //   const { keyExpanded } = action.payload;
    //   return {
    //     ...state,
    //     nodeOpening: false,
    //     nodeOpened: false,
    //     topRows: [],
    //     topRowsLoaded: false,
    //     keyExpanded
    //   }

    case ActionTypes.FORCE_GROUP_OPEN_NODE:
      const { keyExpanded } = action.payload;
      return {
        ...state,
        topRows: state.topRows.filter(row => row.parentId === null),
        keyExpanded,
        nodeOpened: false, // keep topRows, and openNode
        activeGroup: null,
        activeAnswer: null,
        selectedAnswerId: null
      }

    // case ActionTypes.RESET_GROUP_ANSWER_DONE: {
    //   return {
    //     ...state,
    //     groupId_answerId_done: undefined,
    //     groupNodeLoaded: false
    //   };
    // }

    case ActionTypes.SET_SUB_GROUPS: {
      //const { groupRows } = action.payload;
      //const { topRows } = state;
      //groupRows.forEach((groupRow: IGroupRow) => {
      //const { id, hasSubGroups, numOfAnswers } = groupRow;
      //})
      return {
        ...state,
        loadingGroup: false,
        //groupLoaded: false proveri
      };
    }


    case ActionTypes.SET_GROUP_ERROR: {
      const { error, whichRowId } = action.payload; // group.id or answer.id
      return {
        ...state,
        error,
        whichRowId,
        loadingGroups: false,
        loadingAnswers: false,
        loadingGroup: false, groupLoaded: false,
        loadingAnswer: false, answerLoaded: false
      };
    }

    case ActionTypes.ADD_SUB_GROUP: {
      const { groupKey, level } = action.payload;
      const { topId } = groupKey;
      const group: IGroup = {
        ...initialGroup,
        topId,
        level,
        parentId: '' //null
      }
      return {
        ...state,
        activeGroup: group,
        formMode: FormMode.AddingGroup
      };
    }

    /*
    case ActionTypes.SET_GROUP_ADDED: {
      const { groupRow } = action.payload;
      return {
        ...state,
        // TODO Popravi
        formMode: FormMode.None,
        activeGroup: groupRow!,
        loading: false
      }
    }
      */


    // case ActionTypes.SET_GROUP_ROW: {
    //   const { groupRow } = action.payload; // group doesn't contain  inAdding 
    //   console.assert(IsGroup(groupRow));
    //   const groupKey = new GroupKey(groupRow).groupKey!;
    //   return {
    //     ...state,
    //     // keep mode
    //     loadingGroup: false,
    //     //keyExpanded: { ...groupKey },
    //     activeGroup: groupRow,
    //     activeAnswer: null
    //   }
    // }

    case ActionTypes.SET_GROUP: {
      const { groupRow } = action.payload; // group doesn't contain  inAdding 
      console.assert(IsGroup(groupRow));
      //const groupKey = new GroupKey(groupRow).groupKey!;
      return {
        ...state,
        // keep mode
        loadingGroup: false,
        groupLoaded: true,
        //keyExpanded: { ...groupKey },
        activeGroup: groupRow,
        activeAnswer: null,
        selectedAnswerId: null,

      }
    }

    case ActionTypes.SET_ROW_EXPANDING: {
      return {
        ...state,
        rowExpanding: true,
        rowExpanded: false,
        loadingGroups: true
      }
    }

    case ActionTypes.SET_ROW_EXPANDED: {
      const { groupRow } = action.payload; // , selectedAnswerId
      const { topId, id } = groupRow;
      const { keyExpanded } = state;
      const answerId = keyExpanded ? keyExpanded.answerId : null; // (topId === keyExpanded?.topId && id === keyExpanded.groupId)
      //? keyExpanded.answerId
      //: null;
      // Do not work with groupRow, 
      // groupRow will be proccesed in GroupReducer, rather than in innerReducer
      return {
        ...state,
        // keep mode
        loadingGroups: false,
        keyExpanded: {
          topId,
          groupId: id,
          answerId
        },
        //activeGroup: null,
        activeAnswer: null,
        selectedAnswerId: answerId, //selectedAnswerId ?? null,
        loadingAnswer: false,
        answerLoaded: false,
        rowExpanding: false,
        rowExpanded: true
        //formMode
      }
    }

    // case ActionTypes.SET_ROW_COLLAPSING: {
    //   return {
    //     ...state,
    //     // keep mode
    //     loadingGroups: true, 
    //     rowExpanding: true, // actually collapsing
    //     rowExpanded: false
    //   }
    // }


    case ActionTypes.SET_ROW_COLLAPSED: {
      const { groupRow } = action.payload; // group doesn't contain  inAdding 
      const { topId, parentId } = groupRow;
      //const groupKey = new GroupKey(groupRow).groupKey
      return {
        ...state,
        // keep mode
        loadingGroups: false,
        keyExpanded: { topId, groupId: parentId ?? '', answerId: null },
        rowExpanding: false, // actually collapsing
        rowExpanded: true,
        activeGroup: null,
        activeAnswer: null,
        selectedAnswerId: null
      }
    }


    case ActionTypes.SET_GROUP_TO_VIEW: {
      const { groupRow } = action.payload;
      console.assert(IsGroup(groupRow))
      const group: IGroup = groupRow as IGroup;
      const activeGroup: IGroup = { ...group, isExpanded: false }
      //const { topId, id, parentId } = group;
      return {
        ...state,
        formMode: FormMode.ViewingGroup,
        loadingGroup: false,
        //keyExpanded: { ...state.keyExpanded, answerId: null },
        activeGroup,
        activeAnswer: null,
        selectedAnswerId: null
      };
    }

    case ActionTypes.SET_GROUP_TO_ADD_TOP: {
      const { newGroupRow } = action.payload; // IGroup extends IGroupRow
      //const { topId } = group;
      //console.assert(IsGroup(groupRow))
      // TODO what about instanceof?
      return {
        ...state,
        loadingGroup: false,
        groupLoaded: true,
        activeGroup: { ...newGroupRow, doc1: '' },
        activeAnswer: null,
        selectedAnswerId: null,
        topRows: [newGroupRow!, ...state.topRows],
        formMode: FormMode.AddingGroup,
      };
    }

    case ActionTypes.SET_GROUP_TO_ADD: {
      const { newGroupRow } = action.payload; // IGroup extends IGroupRow
      //const { topId } = group;
      //console.assert(IsGroup(groupRow))
      // TODO what about instanceof?
      return {
        ...state,
        loadingGroup: false,
        groupLoaded: true,
        activeGroup: { ...newGroupRow!, doc1: '' },
        activeAnswer: null,
        selectedAnswerId: null,
        formMode: FormMode.AddingGroup
      };
    }

    case ActionTypes.SET_GROUP_ADDED: {
      const { groupRow } = action.payload; // IGroup extends IGroupRow
      console.assert(IsGroup(groupRow))
      // TODO what about instanceof?
      const group: IGroup = groupRow as IGroup;
      const activeGroup: IGroup = { ...group, isExpanded: false }
      const { topId, id } = activeGroup;
      //const { parentId } = group;
      //const topRowsLoaded = parentId ? true : false;
      return {
        ...state,
        formMode: FormMode.EditingGroup, // none
        loadingGroup: false,
        groupLoaded: false,
        //topRowsLoaded,
        //groupKeyExpanded: state.groupKeyExpanded ? { ...state.groupKeyExpanded, answerId: null } : null,
        activeGroup,
        activeAnswer: null,
        selectedAnswerId: null,
        keyExpanded: { topId, groupId: id, answerId: null }, // set id to call openNode from groups
        /////nodeOpened: false
      };
    }

    case ActionTypes.SET_GROUP_TO_EDIT:   // doesn't modify Tree
    case ActionTypes.SET_GROUP_UPDATED: { // modifies Tree
      const { groupRow, group } = action.payload; // IGroup extends IGroupRow
      console.assert(IsGroup(groupRow))
      // TODO what about instanceof?
      //const activeGroup: IGroup = { ...group, isExpanded: false }
      const { topId, id } = group;
      return {
        ...state,
        formMode: FormMode.EditingGroup,
        loadingGroup: false,
        groupLoaded: true,
        keyExpanded: { topId, groupId: id, answerId: null },
        //keyExpanded: null, //{ topId, groupId: parentId!, answerId: null },
        //groupKeyExpanded: state.groupKeyExpanded ? { ...state.groupKeyExpanded, answerId: null } : null,
        activeGroup: group,
        activeAnswer: null,
        selectedAnswerId: null,
      };
    }

    case ActionTypes.SET_ANSWERS_LOADING:
      //const { loadingAnswer } = action.payload; // group doesn't contain inAdding 
      return {
        ...state,
        loadingAnswers: true,
        answerLoaded: false
      }

    case ActionTypes.GROUP_ANSWERS_LOADED: {
      // const { groupRow } = action.payload;
      //const { id, topId: topId, answerRows, hasMoreAnswers } = groupRow;
      return {
        ...state,
        //loadingAnswer: false,
        loadingAnswers: false
      }
    }

    case ActionTypes.DELETE_GROUP: {
      //const { id } = action.payload;
      // TODO Popravi
      return {
        ...state,
        activeGroup: null,
        formMode: FormMode.None,
        error: undefined,
        whichRowId: undefined
      };
    }

    case ActionTypes.CANCEL_GROUP_FORM:
    case ActionTypes.CLOSE_GROUP_FORM: {
      return {
        ...state,
        activeGroup: null,
        formMode: FormMode.None
      };
    }


    // First we add a new answer to the group.guestions
    // After user clicks Save, we call createAnswer 
    /*
    case ActionTypes.ADD_ANSWER: {
      const { groupInfo } = action.payload;
      const { groupKey, level } = groupInfo;
      const { topId, id } = groupKey;
      const answer: IAnswer = {
        ...initialAnswer,
        topId: id ?? '',
        parentId: id,
        inAdding: true
      }
      return {
        ...state,
        mode: Mode.AddingAnswer,
        activeAnswer: answer
      };
    }
    */

    case ActionTypes.CANCEL_ADD_SUB_GROUP: {
      return {
        ...state,
        activeGroup: null,
        activeAnswer: null,
        selectedAnswerId: null,
        formMode: FormMode.None
      };
    }

    case ActionTypes.SET_LOADING_ANSWER:
      return {
        ...state,
        loadingAnswer: true,
        answerLoaded: false
      }

    case ActionTypes.CANCEL_ADD_ANSWER: {
      return {
        ...state,
        formMode: FormMode.None,
        activeAnswer: null,
        selectedAnswerId: null
      };
    }

    case ActionTypes.SET_ANSWER_SELECTED: { // from Groups / AutoSuggestAnswer
      const { answerKey } = action.payload;
      const { topId, parentId: groupId, id: answerId } = answerKey;
      return {
        ...state,
        topRows: state.topRows.filter(row => row.parentId === null),
        keyExpanded: {
          topId,
          groupId: groupId,
          answerId
        },
        /////nodeOpened: false, // keep topRows, and openNode
        activeGroup: null,
        activeAnswer: null,
        selectedAnswerId: null
      };
    }


    case ActionTypes.ADD_NEW_ANSWER_TO_ROW: {
      const { newAnswerRow } = action.payload;
      return {
        ...state,
        selectedAnswerId: newAnswerRow.id
      };
    }


    case ActionTypes.SET_ANSWER: {
      const { answer, formMode } = action.payload;
      console.log(ActionTypes.SET_ANSWER, answer)
      return {
        ...state,
        activeGroup: null,
        activeAnswer: answer,
        formMode,
        error: undefined,
        loadingGroup: false,
        loadingAnswer: false,
        answerLoaded: true
      };
    }

    case ActionTypes.SET_ANSWER_AFTER_ASSIGN_ANSWER: {
      const { answer } = action.payload;
      //const { parentId, id } = answer;
      //const inAdding = state.formMode === FormMode.AddingAnswer;

      // for inAdding, _id is IDBValidKey('000000000000000000000000')
      // thats why we look for q.inAdding instead of q._id === _id
      // const x = state.groups.filter(c => c.id === parentId).filter(q=>q.id === id);
      // console.error('SET_ANSWER_AFTER_ASSIGN_ANSWER', {x})

      // TODO Popravi
      // const rootRows = newTopRows.map((c: IGroup) => c.id === parentId
      //   ? {
      //     ...c,
      //     answerRows: inAdding
      //       ? c.answerRows.map(q => q.inAdding ? { ...answer, inAdding: q.inAdding } : q)
      //       : c.answerRows.map(q => q.id === id ? { ...answer } : q), // TODO sta, ako je inViewing
      //     inAdding: c.inAdding
      //   }
      //   : c
      // );
      return {
        ...state,
        //formMode: state.formMode, // keep mode
        activeAnswer: answer,
        loadingAnswer: false,
        answerLoaded: true
      };
    }


    case ActionTypes.SET_ANSWER_TO_VIEW: {
      const { answer } = action.payload;
      //const { topId, id, parentId } = answer;
      const { keyExpanded } = state;
      return {
        ...state,
        formMode: FormMode.ViewingAnswer,
        keyExpanded,
        activeAnswer: answer,
        loadingAnswer: false,
        answerLoaded: true
      }
    }

    case ActionTypes.SET_ANSWER_TO_EDIT: {
      const { answer } = action.payload;
      const { topId, id, parentId } = answer;
      //const { keyExpanded } = state;
      return {
        ...state,
        // groupKeyExpanded: groupKeyExpanded
        //   ? { ...groupKeyExpanded, answerId: groupKeyExpanded.id === parentId ? id : null }
        //   : null,
        keyExpanded: { topId, groupId: parentId, answerId: id },
        activeAnswer: answer,
        formMode: FormMode.EditingAnswer,
        selectedAnswerId: answer.id,
        loadingAnswer: false,
        answerLoaded: true
      }
    }

    case ActionTypes.ANSWER_DELETED: {
      //const { answer } = action.payload;
      //const { parentId, id } = answer;
      return {
        ...state, // Popravi
        activeAnswer: null,
        selectedAnswerId: null,
        formMode: FormMode.None,
        loadingAnswer: false,
        answerLoaded: true
      }
    }

    case ActionTypes.CANCEL_ANSWER_FORM:
    case ActionTypes.CLOSE_ANSWER_FORM: {
      //const { answer } = action.payload;
      return {
        ...state,
        formMode: FormMode.None,
        activeAnswer: null,
        selectedAnswerId: null
      };
    }

       case ActionTypes.SET_ERROR: {
          const { error, whichRowId } = action.payload; // category.id or question.id
          return {
            ...state,
            error,
            whichRowId,
            loadingGroups: false,
            loadingAnswers: false,
            loadingGroup: false, groupLoaded: false,
            loadingAnswer: false, answerLoaded: false
          };
        }

    default:
      alert(`Action ${action.type} not allowed`)
      return {
        ...state
      }
  }
};



/* -----------------------------
   Deep Clone
----------------------------- */
export class DeepClone {
  static idToSet: string;
  static newGroupRow: IGroupRow;
  constructor(groupRow: IGroupRow) {
    const { topId, id, parentId, title, link, kind, header, level, variations, numOfAnswers,
      hasSubGroups, groupRows, created, modified, answerRows, isExpanded } = groupRow;

    const subGrpRows = groupRows.map((catRow: IGroupRow) => {
      console.log('DeepClone >>>>>>>>>>>>>>>', catRow.id)
      if (catRow.id === DeepClone.idToSet) {
        return { ...DeepClone.newGroupRow }
      }
      else {
        return new DeepClone(catRow).groupRow
      }
    });

    this.groupRow = {
      topId,
      parentId,
      id,
      kind,
      title,
      link,
      header,
      level,
      hasSubGroups,
      groupRows: subGrpRows,
      numOfAnswers,
      answerRows,
      variations: variations ?? [],
      created,
      modified,
      isExpanded
    }
  }
  groupRow: IGroupRow;
}


