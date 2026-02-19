import { type Reducer } from 'react'
import {
  ActionTypes, type Actions, type ILocStorage, IsCategory,
  type ICategoriesState, type ICategory, type ICategoryRow, type IQuestion,
  actionStoringToLocalStorage, FormMode, doNotModifyTree, doNotCallInnerReducerActions,
  _generateId
} from "@/categories/types";

export const subCatRow: ICategoryRow = {
  topId: _generateId, // for top rows: topId = ToUpperCase(id)
  id: _generateId,
  parentId: null,
  level: 1,
  isExpanded: false,
  categoryRows: [],
  kind: 0,
  title: '',
  link: null,
  header: '',
  hasSubCategories: false,
  variations: [],
  numOfQuestions: 0,
  questionRows: []
}

export const initialQuestion: IQuestion = {
  topId: '',
  parentId: 'null',
  id: _generateId, //  keep _generateId, it is expected at BackEnd
  categoryTitle: '',
  title: '',
  assignedAnswers: [],
  numOfAssignedAnswers: 0,
  relatedFilters: [],
  numOfRelatedFilters: 0,
  source: 0,
  status: 0,
  included: false
}

export const initialCategory: ICategory = {
  topId: 'null',
  parentId: 'null',
  id: 'define at BackEnd',
  kind: 0,
  title: '',
  link: '',
  header: '',
  level: 0,
  variations: [],
  hasSubCategories: false,
  categoryRows: [],
  questionRows: [],
  numOfQuestions: 0,
  hasMoreQuestions: false,
  isExpanded: false,
  doc1: ''
}

export const CategoryReducer: Reducer<ICategoriesState, Actions> = (state, action) => {

  console.log('------------------------------->')
  console.log('------------------------------->', action.type)
  console.log('------------------------------->')
  // ----------------------------------------------------------------------
  // Rubljov: "By giving the right name, you reveal the essence of things"
  // ----------------------------------------------------------------------
  //
  // - firstLevelCategoryRow AAA
  // ------> categoryRow AAA.1
  // --------- > categoryRow AAA 1.1
  // --------- > ...
  //
  // ------> categoryRow AAA.2
  // --------- > categoryRow AAA 2.1
  // --------- > categoryRow AAA 2.2
  // ------------ > Category Row AAA 2.2.1
  // ------------ > categoryRow AAA 2.2.2
  // --------------- > categoryRow AAA 2.2.2.1
  // --------------- > categoryRow AAA 2.2.2.2
  //
  // --------- > categoryRow AAA 2.3
  //
  // - firstLevelCategoryRow BBB
  // - ...

  const { categoryRow } = action.payload;
  // const isCategory = IsCategory(categoryRow); // ICategory rather than ICategoryRow

  if (action.type === ActionTypes.SET_KEY_EXPANDED) {
    const { keyExpanded } = action.payload;
    return {
      ...state,
      keyExpanded,
      nodeOpened: keyExpanded === null ? true : state.nodeOpened
    }
  }

  let modifyTree = categoryRow
    ? doNotModifyTree.includes(action.type) ? false : true
    : false;

  const { topRows } = state;

  const newState = doNotCallInnerReducerActions.includes(action.type)
    ? { ...state }
    : innerReducer(state, action);

  // return { ...state } // calling this, state would be destroyed, because of shallow copy
  // Action that modify Tree
  // Actually part topRows of state
  if (modifyTree && categoryRow) { //} && categoryRow.topId !== 'ROOT') {
    let newTopRows: ICategoryRow[];
    const SET_CATEGORY_ADDED = action.type === 'SET_CATEGORY_ADDED';
    const { topId, id } = categoryRow!;
    if (id === topId) {
      if (SET_CATEGORY_ADDED) {
        newTopRows = topRows.map(c => c.id === _generateId
          ? new DeepClone(categoryRow!).categoryRow
          : new DeepClone(c).categoryRow
        );
      }
      else {
        // actually topRows is from previous state
        newTopRows = topRows.map(c => c.id === topId
          ? new DeepClone(categoryRow!).categoryRow
          : new DeepClone(c).categoryRow
        );
      }
    }
    else {
      // actually topRows is from previous state
      const topRow: ICategoryRow = topRows.find(c => c.id === topId)!;
      DeepClone.idToSet = action.type === 'SET_CATEGORY_ADDED' ? _generateId : id;
      DeepClone.newCategoryRow = categoryRow!;
      const newTopRow = new DeepClone(topRow).categoryRow;
      newTopRows = topRows.map(c => c.id === topId
        ? newTopRow
        : new DeepClone(c).categoryRow
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
    localStorage.setItem('CATEGORIES_STATE', JSON.stringify(locStorage));
  }

  console.log('CategoryReducer newState', newState)
  return newState;
}

const innerReducer = (state: ICategoriesState, action: Actions): ICategoriesState => {
  switch (action.type) {

    //////////////////////////////////////////////////
    // Rows Level: 1

    case ActionTypes.SET_TOP_ROWS_LOADING:
      return {
        ...state,
        loadingCategories: true,
        topRowsLoading: true,
        topRowsLoaded: false
      }

    case ActionTypes.SET_TOP_ROWS: {
      const { topRows } = action.payload;
      console.log('=> CategoriesReducer ActionTypes.SET_TOP_ROWS', state.topRows, topRows)
      return {
        ...state,
        topRows,
        topRowsLoading: false,
        topRowsLoaded: true,
        loadingCategories: false
      };
    }

    case ActionTypes.SET_ALL_CATEGORY_ROWS: {
      const { allCategoryRows } = action.payload;
      return {
        ...state,
        allCategoryRows,
        allCategoryRowsLoaded: Date.now()
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
      const { categoryId_questionId_done } = action.payload;
      //const { keyExpanded /*, activeCategory, activeQuestion */ } = state;
      return {
        ...state,
        categoryId_questionId_done,
        nodeOpening: true,
        loadingCategories: true,
        nodeOpened: false,
        //keyExpanded: fromChatBotDlg ? null : { ...keyExpanded! },
        activeCategory: null, //fromChatBotDlg ? null : activeCategory,
        activeQuestion: null //fromChatBotDlg ? null : activeQuestion
      }
    }

    case ActionTypes.SET_NODE_EXPANDED_UP_THE_TREE: {
      const { category, questionId, question, formMode } = action.payload;
      return {
        ...state,
        activeCategory: category,
        activeQuestion: question,
        selectedQuestionId: questionId,
        formMode,
        nodeOpening: false,
        nodeOpened: true,
        loadingCategories: false
      };
    }

    case ActionTypes.SET_LOADING_CATEGORIES:
      return {
        ...state,
        //activeCategory: null,
        loadingCategories: true
      }

    case ActionTypes.SET_LOADING_CATEGORY:
      return {
        ...state,
        //activeCategory: null,
        loadingCategory: true,
        categoryLoaded: false
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

    case ActionTypes.FORCE_OPEN_NODE:
      const { keyExpanded } = action.payload;
      alert('FORCE_OPEN_NODE is deprecated, use SET_QUESTION_SELECTED instead')
      return {
        ...state,
        topRows: state.topRows.filter(row => row.parentId === null),
        keyExpanded,
        nodeOpened: false, // keep topRows, and openNode
        activeCategory: null,
        activeQuestion: null,
        selectedQuestionId: null
      }

    // case ActionTypes.RESET_CATEGORY_QUESTION_DONE: {
    //   return {
    //     ...state,
    //     categoryId_questionId_done: undefined,
    //     categoryNodeLoaded: false
    //   };
    // }

    case ActionTypes.SET_SUB_CATEGORIES: {
      //const { categoryRows } = action.payload;
      //const { topRows } = state;
      //categoryRows.forEach((categoryRow: ICategoryRow) => {
      //const { id, hasSubCategories, numOfQuestions } = categoryRow;
      //})
      return {
        ...state,
        loadingCategory: false,
        //categoryLoaded: false proveri
      };
    }


    case ActionTypes.SET_ERROR: {
      const { error, whichRowId } = action.payload; // category.id or question.id
      return {
        ...state,
        error,
        whichRowId,
        loadingCategories: false,
        loadingQuestions: false,
        loadingCategory: false, categoryLoaded: false,
        loadingQuestion: false, questionLoaded: false
      };
    }


    // case ActionTypes.SET_CATEGORY_ROW: {
    //   const { categoryRow } = action.payload; // category doesn't contain  inAdding 
    //   console.assert(IsCategory(categoryRow));
    //   const categoryKey = new CategoryKey(categoryRow).categoryKey!;
    //   return {
    //     ...state,
    //     // keep mode
    //     loadingCategory: false,
    //     //keyExpanded: { ...categoryKey },
    //     activeCategory: categoryRow,
    //     activeQuestion: null
    //   }
    // }

    case ActionTypes.SET_CATEGORY: {
      const { categoryRow } = action.payload; // category doesn't contain  inAdding 
      console.assert(IsCategory(categoryRow));
      //const categoryKey = new CategoryKey(categoryRow).categoryKey!;
      return {
        ...state,
        // keep mode
        loadingCategory: false,
        categoryLoaded: true,
        //keyExpanded: { ...categoryKey },
        activeCategory: categoryRow,
        activeQuestion: null,
        selectedQuestionId: null,

      }
    }

    case ActionTypes.SET_ROW_EXPANDING: {
      return {
        ...state,
        rowExpanding: true,
        rowExpanded: false,
        loadingCategories: true
      }
    }

    case ActionTypes.SET_ROW_EXPANDED: {
      const { categoryRow } = action.payload; // , selectedQuestionId
      const { topId, id } = categoryRow;
      const { keyExpanded } = state;
      const questionId = keyExpanded ? keyExpanded.questionId : null; // (topId === keyExpanded?.topId && id === keyExpanded.categoryId)
      //? keyExpanded.questionId
      //: null;
      // Do not work with categoryRow, 
      // categoryRow will be proccesed in CategoryReducer, rather than in innerReducer
      return {
        ...state,
        // keep mode
        loadingCategories: false,
        keyExpanded: {
          topId,
          categoryId: id,
          questionId
        },
        //activeCategory: null,
        activeQuestion: null,
        selectedQuestionId: questionId, //selectedQuestionId ?? null,
        loadingQuestion: false,
        questionLoaded: false,
        rowExpanding: false,
        rowExpanded: true
        //formMode
      }
    }

    // case ActionTypes.SET_ROW_COLLAPSING: {
    //   return {
    //     ...state,
    //     // keep mode
    //     loadingCategories: true, 
    //     rowExpanding: true, // actually collapsing
    //     rowExpanded: false
    //   }
    // }


    case ActionTypes.SET_ROW_COLLAPSED: {
      const { categoryRow } = action.payload; // category doesn't contain  inAdding 
      const { topId, parentId } = categoryRow;
      //const categoryKey = new CategoryKey(categoryRow).categoryKey
      return {
        ...state,
        // keep mode
        loadingCategories: false,
        keyExpanded: { topId, categoryId: parentId ?? '', questionId: null },
        rowExpanding: false, // actually collapsing
        rowExpanded: true,
        activeCategory: null,
        activeQuestion: null,
        selectedQuestionId: null
      }
    }


    case ActionTypes.SET_CATEGORY_TO_VIEW: {
      const { categoryRow } = action.payload;
      console.assert(IsCategory(categoryRow))
      const category: ICategory = categoryRow as ICategory;
      const activeCategory: ICategory = { ...category, isExpanded: false }
      //const { topId, id, parentId } = category;
      return {
        ...state,
        formMode: FormMode.ViewingCategory,
        loadingCategory: false,
        //keyExpanded: { ...state.keyExpanded, questionId: null },
        activeCategory,
        activeQuestion: null,
        selectedQuestionId: null,
        error: undefined
      };
    }

    case ActionTypes.SET_CATEGORY_TO_ADD: {
      const { newCategoryRow } = action.payload; // ICategory extends ICategoryRow
      const { parentId } = newCategoryRow;
      //const { topId } = category;
      //console.assert(IsCategory(categoryRow))
      // TODO what about instanceof?
      return {
        ...state,
        loadingCategory: false,
        categoryLoaded: true,
        activeCategory: { ...newCategoryRow!, doc1: '' },
        activeQuestion: null,
        selectedQuestionId: null,
        topRows: parentId ? state.topRows : [newCategoryRow!, ...state.topRows],
        formMode: FormMode.AddingCategory
      };
    }

    case ActionTypes.SET_CATEGORY_ADDED: {
      const { categoryRow } = action.payload; // ICategory extends ICategoryRow
      console.assert(IsCategory(categoryRow))
      // TODO what about instanceof?
      const category: ICategory = categoryRow as ICategory;
      const activeCategory: ICategory = { ...category, isExpanded: false }
      const { topId, id } = activeCategory;
      //const { parentId } = category;
      //const topRowsLoaded = parentId ? true : false;
      return {
        ...state,
        formMode: FormMode.EditingCategory, // none
        loadingCategory: false,
        categoryLoaded: false,
        // topRowsLoaded,
        //categoryKeyExpanded: state.categoryKeyExpanded ? { ...state.categoryKeyExpanded, questionId: null } : null,
        activeCategory,
        activeQuestion: null,
        selectedQuestionId: null,
        keyExpanded: { topId, categoryId: id, questionId: null }, // set id to call openNode from categories
      };
    }

    case ActionTypes.SET_CATEGORY_TO_EDIT:   // doesn't modify Tree
    case ActionTypes.SET_CATEGORY_UPDATED: { // modifies Tree
      const { categoryRow, category } = action.payload; // ICategory extends ICategoryRow
      console.assert(IsCategory(categoryRow))
      // TODO what about instanceof?
      //const activeCategory: ICategory = { ...category, isExpanded: false }
      const { topId, id } = category;
      return {
        ...state,
        formMode: FormMode.EditingCategory,
        loadingCategory: false,
        categoryLoaded: true,
        keyExpanded: { topId, categoryId: id, questionId: null },
        //keyExpanded: null, //{ topId, categoryId: parentId!, questionId: null },
        //categoryKeyExpanded: state.categoryKeyExpanded ? { ...state.categoryKeyExpanded, questionId: null } : null,
        activeCategory: category,
        activeQuestion: null,
        selectedQuestionId: null,
        error: undefined
      };
    }

    case ActionTypes.SET_CATEGORY_QUESTIONS_LOADING:
      //const { loadingQuestion } = action.payload; // category doesn't contain inAdding 
      return {
        ...state,
        loadingQuestions: true,
        questionLoaded: false
      }

    case ActionTypes.CATEGORY_QUESTIONS_LOADED: {
      // const { categoryRow } = action.payload;
      //const { id, topId: topId, questionRows, hasMoreQuestions } = categoryRow;
      return {
        ...state,
        //loadingQuestion: false,
        loadingQuestions: false
      }
    }

    case ActionTypes.CATEGORY_DELETED: {
      const { categoryRow, id } = action.payload;
      const topRows = !categoryRow
        ? state.topRows.filter(catRow => catRow.id !== id)
        : state.topRows;
      return {
        ...state,
        topRows,
        loadingCategories: false,
        activeCategory: null,
        formMode: FormMode.None,
        error: undefined,
        whichRowId: undefined,
        keyExpanded: {
          topId: categoryRow ? categoryRow.topId : '',
          categoryId: categoryRow ? categoryRow.parentId ?? '' : '',
          questionId: ''
        }
      };
    }

    case ActionTypes.CANCEL_CATEGORY_FORM:
    case ActionTypes.CLOSE_CATEGORY_FORM: {
      return {
        ...state,
        activeCategory: null,
        formMode: FormMode.None
      };
    }


    // First we add a new question to the category.guestions
    // After user clicks Save, we call createQuestion 
    /*
    case ActionTypes.ADD_QUESTION: {
      const { categoryInfo } = action.payload;
      const { categoryKey, level } = categoryInfo;
      const { topId, id } = categoryKey;
      const question: IQuestion = {
        ...initialQuestion,
        topId: id ?? '',
        parentId: id,
        inAdding: true
      }
      return {
        ...state,
        mode: Mode.AddingQuestion,
        activeQuestion: question
      };
    }
    */

    case ActionTypes.CANCEL_ADD_CATEGORY: {
      const { topRows } = action.payload;
      return {
        ...state,
        topRows,
        activeCategory: null,
        activeQuestion: null,
        selectedQuestionId: null,
        formMode: FormMode.None
      };
    }

    case ActionTypes.SET_LOADING_QUESTION:
      return {
        ...state,
        loadingQuestion: true,
        questionLoaded: false
      }

    case ActionTypes.CANCEL_ADD_QUESTION: {
      return {
        ...state,
        formMode: FormMode.None,
        activeQuestion: null,
        selectedQuestionId: null
      };
    }

    case ActionTypes.SET_QUESTION_SELECTED: { // from Categories / AutoSuggestQuestion
      const { questionKey } = action.payload;
      const { topId, parentId: categoryId, id: questionId } = questionKey;
      return {
        ...state,
        topRows: state.topRows.filter(row => row.parentId === null),
        keyExpanded: {
          topId,
          categoryId: categoryId,
          questionId
        },
        /////nodeOpened: false, // keep topRows, and openNode
        activeCategory: null,
        activeQuestion: null,
        selectedQuestionId: null
      };
    }


    case ActionTypes.ADD_NEW_QUESTION_TO_ROW: {
      const { newQuestionRow } = action.payload;
      return {
        ...state,
        selectedQuestionId: newQuestionRow.id
      };
    }


    case ActionTypes.SET_QUESTION: {
      const { question, formMode } = action.payload;
      console.log(ActionTypes.SET_QUESTION, question)
      return {
        ...state,
        activeCategory: null,
        activeQuestion: question,
        formMode,
        error: undefined,
        loadingCategory: false,
        loadingQuestion: false,
        questionLoaded: true
      };
    }

    case ActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER: {
      const { question } = action.payload;
      //const { parentId, id } = question;
      //const inAdding = state.formMode === FormMode.AddingQuestion;

      // for inAdding, _id is IDBValidKey('000000000000000000000000')
      // thats why we look for q.inAdding instead of q._id === _id
      // const x = state.categories.filter(c => c.id === parentId).filter(q=>q.id === id);
      // console.error('SET_QUESTION_AFTER_ASSIGN_ANSWER', {x})

      // TODO Popravi
      // const rootRows = newTopRows.map((c: ICategory) => c.id === parentId
      //   ? {
      //     ...c,
      //     questionRows: inAdding
      //       ? c.questionRows.map(q => q.inAdding ? { ...question, inAdding: q.inAdding } : q)
      //       : c.questionRows.map(q => q.id === id ? { ...question } : q), // TODO sta, ako je inViewing
      //     inAdding: c.inAdding
      //   }
      //   : c
      // );
      return {
        ...state,
        //formMode: state.formMode, // keep mode
        activeQuestion: question,
        loadingQuestion: false,
        questionLoaded: true
      };
    }


    case ActionTypes.SET_QUESTION_TO_VIEW: {
      const { question } = action.payload;
      //const { topId, id, parentId } = question;
      const { keyExpanded } = state;
      return {
        ...state,
        formMode: FormMode.ViewingQuestion,
        keyExpanded,
        activeQuestion: question,
        loadingQuestion: false,
        questionLoaded: true
      }
    }

    case ActionTypes.SET_QUESTION_TO_EDIT: {
      const { question } = action.payload;
      const { topId, id, parentId } = question;
      //const { keyExpanded } = state;
      return {
        ...state,
        // categoryKeyExpanded: categoryKeyExpanded
        //   ? { ...categoryKeyExpanded, questionId: categoryKeyExpanded.id === parentId ? id : null }
        //   : null,
        keyExpanded: { topId, categoryId: parentId, questionId: id },
        activeQuestion: question,
        formMode: FormMode.EditingQuestion,
        selectedQuestionId: question.id,
        loadingQuestion: false,
        questionLoaded: true
      }
    }

    case ActionTypes.QUESTION_DELETED: {
      //const { question } = action.payload;
      //const { parentId, id } = question;
      return {
        ...state, // Popravi
        activeQuestion: null,
        selectedQuestionId: null,
        formMode: FormMode.None,
        loadingQuestion: false,
        questionLoaded: true
      }
    }

    case ActionTypes.CANCEL_QUESTION_FORM:
    case ActionTypes.CLOSE_QUESTION_FORM: {
      //const { question } = action.payload;
      return {
        ...state,
        formMode: FormMode.None,
        activeQuestion: null,
        selectedQuestionId: null
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
  static newCategoryRow: ICategoryRow;
  constructor(categoryRow: ICategoryRow) {
    const { topId, id, parentId, title, link, kind, header, level, variations, numOfQuestions,
      hasSubCategories, categoryRows, created, modified, questionRows, isExpanded } = categoryRow;

    const subCatRows = categoryRows.map((catRow: ICategoryRow) => {
      console.log('DeepClone >>>>>>>>>>>>>>>', catRow.id)
      if (catRow.id === DeepClone.idToSet) {
        return { ...DeepClone.newCategoryRow }
      }
      else {
        return new DeepClone(catRow).categoryRow
      }
    });

    this.categoryRow = {
      topId,
      parentId,
      id,
      kind,
      title,
      link,
      header,
      level,
      hasSubCategories,
      categoryRows: subCatRows,
      numOfQuestions,
      questionRows,
      variations: variations ?? [],
      created,
      modified,
      isExpanded
    }
  }
  categoryRow: ICategoryRow;
}


