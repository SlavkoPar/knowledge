import React, { createContext, useContext, useReducer, type Dispatch, useCallback, useEffect } from "react";

import type {
  IGlobalContext,
  IHistory,
  IGlobalState,
  IHistoryFilter,
  IWorkspaceDto,
  IWorkspaceDtoEx,
  IUser,
  ILocStorage
} from '@/global/types'

import { GlobalActionTypes } from '@/global/types'

import { HistoryDto, HistoryFilterDto } from '@/global/types'

import { GlobalReducer, initialAuthUser } from "@/global/GlobalReducer";

import type {
  IQuestionRow, IQuestionRowDto, IQuestionRowDtosEx,
  IQuestionDtoEx, IQuestionEx, IQuestionKey,
  ICategoryRowDto, ICategoryRow
} from "@/categories/types";

import { CategoryRow, QuestionKey, Question, QuestionRow } from "@/categories/types";

import type {
  IAnswer, IAnswerDto, IAnswerKey, IAnswerRow, IAnswerRowDto, IAnswerRowDtosEx, IGroupRow, IGroupRowDto
} from "@/groups/types";

import { Answer, AnswerRow, GroupRow } from "@/groups/types";

// import { escapeRegexCharacters } from 'common/utilities'

//////////////////
// Initial data
import { protectedResources } from "@/authConfig";

const GlobalContext = createContext<IGlobalContext>({} as any);
const GlobalDispatchContext = createContext<Dispatch<any>>(() => null);

interface Props {
  children: React.ReactNode
}

const endPoints = protectedResources.KnowledgeAPI.endPoints;
const initGlobalState: IGlobalState = {
  KnowledgeAPI: {
    endpointCategoryRow: endPoints.Category.Row,
    endpointCategory: endPoints.Category.Category,
    endpointQuestion: endPoints.Category.Question,
    endpointQuestionAnswer: endPoints.Category.QuestionAnswer,

    endpointGroupRow: endPoints.Group.Row,
    endpointGroup: endPoints.Group.Group,
    endpointAnswer: endPoints.Group.Answer,

    endpointHistory: endPoints.History.endpointHistory,
    endpointHistoryFilter: endPoints.History.endpointHistoryFilter,

    endpointWorkspace: endPoints.Workspace.endpointWorkspace
  },
  workspace: 'unknown',
  authUser: initialAuthUser,
  isAuthenticated: false,
  everLoggedIn: true,
  canEdit: true,
  isOwner: true,
  isDarkMode: true,
  variant: 'dark',
  bg: 'dark',
  loading: true,
  topRows: [],
  nodesReLoaded: false,
  lastRouteVisited: '/knowledge/categories',
  chatBotDlgEnabled: false
}

export const GlobalProvider: React.FC<Props> = ({ children }) => {
  // If we update globalState, form inner Provider, 
  // we reset changes, and again we use initialGlobalState
  // so, don't use globalDispatch inside of inner Provider, like Categories Provider
  const [globalState, dispatch] = useReducer(GlobalReducer, initGlobalState);
  const { KnowledgeAPI, workspace, loading } = globalState;

  console.log('--------> GlobalProvider')


  useEffect(() => {
    let locStorage: ILocStorage | null = null;
    if ('localStorage' in window) {
      console.log('GLOBAL_STATE loaded before signIn')
      let s = localStorage.getItem('GLOBAL_STATE');
      if (s !== null) {
        locStorage = JSON.parse(s);
      }
    }
    dispatch({ type: GlobalActionTypes.SET_STATE, payload: { locStorage } });
  }, []);

  const Execute = async (method: string, endpoint: string, data: Object | null = null): Promise<any> => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      try {
        console.log({ accessToken })
        let response = null;

        const headers = new Headers();
        const bearer = `Bearer ${accessToken}`;
        headers.append("Authorization", bearer);

        if (data) headers.append('Content-Type', 'application/json');

        let options = {
          method: method,
          headers: headers,
          body: data ? JSON.stringify(data) : null,
        };

        response = (await fetch(endpoint, options));
        if (response.ok) {
          if ((response.status === 200 || response.status === 201)) {
            let responseData = null; //response;
            try {
              responseData = await response.json();
            }
            catch (error) {
              dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error: new Error(`Response status: ${response.status}`) } });
            }
            finally {
              return responseData;
            }
          }
        }
        else {
          const { errors } = await response.json();
          const error = new Error(
            errors?.map((e: { message: any; }) => e.message).join('\n') ?? 'unknown',
          )
          dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
        }
      }
      catch (e) {
        console.log('-------------->>> execute', method, endpoint, e)
        dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error: new Error(`fetch eror`) } });
      }
    }
    return null;
  }
  // }, [dispatch]);
  /*
  const getUser = async (nickName: string) => {
    try {
      const { dbp } = globalState;
      const user: IUser = await dbp!.get("Users", nickName);
      return user;
    }
    catch (error: any) {
      console.log(error);
      return undefined;
    }
  }
    */



  // ---------------------------
  // load all categoryRows
  // ---------------------------
  const loadAllCategoryRowsGlobal = useCallback(async (): Promise<Map<string, ICategoryRow> | null> => {
    return new Promise(async (resolve) => {
      try {
        console.time();
        const url = `${KnowledgeAPI.endpointCategoryRow}/${workspace}`;
        await Execute("GET", url, null)
          .then((rowDtos: ICategoryRowDto[]) => {   //  | Response
            const allCategoryRows = new Map<string, ICategoryRow>();
            console.timeEnd();
            rowDtos.forEach((rowDto: ICategoryRowDto) => allCategoryRows.set(rowDto.Id, new CategoryRow(rowDto).categoryRow));
            allCategoryRows.forEach(cat => {
              let { id, parentId } = cat; // , title, variations, hasSubCategories, level, kind
              let titlesUpTheTree = id;
              let parentCat = parentId;
              while (parentCat) {
                const cat2 = allCategoryRows.get(parentCat)!;
                titlesUpTheTree = cat2!.id + ' / ' + titlesUpTheTree;
                parentCat = cat2.parentId;
              }
              cat.titlesUpTheTree = titlesUpTheTree;
              allCategoryRows.set(id, cat);
            })
            resolve(allCategoryRows)
            // with no dispatch
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
      }
      resolve(null);
    });
  }, [KnowledgeAPI.endpointCategoryRow, workspace]);

 

  // ---------------------------
  // load all groupRows
  // ---------------------------

  const loadAllGroupRowsGlobal = useCallback(async (): Promise<Map<string, IGroupRow> | null> => {
    return new Promise(async (resolve) => {
      try {
        console.time();
        const url = `${KnowledgeAPI.endpointGroupRow}/${workspace}`;
        await Execute("GET", url, null)
          .then((rowDtos: IGroupRowDto[]) => {   //  | Response
            const allGroupRows = new Map<string, IGroupRow>();
            console.timeEnd();
            rowDtos.forEach((rowDto: IGroupRowDto) => allGroupRows.set(rowDto.Id, new GroupRow(rowDto).groupRow));
            allGroupRows.forEach(grp => {
              let { id, parentId } = grp; // , title, variations, hasSubCategories, level, kind
              let titlesUpTheTree = id;
              let parentGrp = parentId;
              while (parentGrp) {
                const grp2 = allGroupRows.get(parentGrp)!;
                titlesUpTheTree = grp2!.id + ' / ' + titlesUpTheTree;
                parentGrp = grp2.parentId;
              }
              grp.titlesUpTheTree = titlesUpTheTree;
              allGroupRows.set(id, grp);
            })
            resolve(allGroupRows)
            // with no dispatch
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
      }
      resolve(null);
    });
  }, [KnowledgeAPI.endpointGroupRow, workspace]);

  //const searchQuestions = useCallback(async (execute: (method: string, endpoint: string) => Promise<any>, filter: string, count: number): Promise<any> => {
  const searchQuestions = async (filter: string, count: number): Promise<any> => {
    return new Promise(async (resolve) => {
      try {
        console.time();
        const filterEncoded = encodeURIComponent(filter);
        const url = `${KnowledgeAPI.endpointQuestion}/${workspace}/${filterEncoded}/${count}/null/null`;
        await Execute("GET", url).then((dtosEx: IQuestionRowDtosEx) => {
          const { questionRowDtos: dtos, msg } = dtosEx;
          console.log('questionRowDtos:', { dtos: dtosEx }, KnowledgeAPI.endpointCategory);
          console.timeEnd();
          if (dtos) {
            const questionRows: IQuestionRow[] = dtos.map((rowDto: IQuestionRowDto) => {
              const questionRow = new QuestionRow(rowDto).questionRow;
              return questionRow;
            })
            resolve(questionRows);
          }
          else {
            // reject()
            console.log('no cat rows in search' + msg)
          }
        })
      }
      catch (error: any) {
        console.log(error)
        //dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
      }
    });
  }
  //}, []);


  const searchAnswers = async (filter: string, count: number, questionKey?: IQuestionKey): Promise<IAnswerRow[]> => {
    //const { allGroupRows } = globalState;
    return new Promise(async (resolve) => {
      try {
        console.time();
        const filterEncoded = encodeURIComponent(filter);
        const url = `${KnowledgeAPI.endpointAnswer}/${workspace}/${filterEncoded}/${count}/${questionKey ? `${questionKey.topId}/${questionKey.id}` : 'null/null'}`;
        await Execute("GET", url).then((answerRowDtosEx: IAnswerRowDtosEx) => {
          const { answerRowDtos: dtos, msg } = answerRowDtosEx;
          console.log('ANSWERSSSSS', { answerRowDtos: dtos }, url);
          console.timeEnd();
          if (dtos) {
            const list: IAnswerRow[] = dtos.map((rowDto: IAnswerRowDto) => {
              const answerRow = new AnswerRow(rowDto).answerRow;
              return answerRow;
            })
            resolve(list);
          }
          else {
            // reject()
            console.log('no group rows in search' + msg)
          }
        })
      }
      catch (error: any) {
        console.log(error)
        //dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
      }
    });
  }

  /*
  const OpenDB = useCallback(async (): Promise<any> => {
    try {
      // await loadAndCacheAllCategoryRows();
      // await loadAndCacheAllGroupRows();
      //console.log('*** loadAndCacheAllCategoryRows')
      // return true;
    }
    catch (err: any) {
      console.log(err);
      dispatch({
        type: GlobalActionTypes.SET_ERROR,
        payload: {
          error: new Error("Greska Teska")
        }
      });
      return false;
    }
  }, []);
  */

  // differs from CategoryProvider, here we don't dispatch
  const getQuestion = useCallback(
    async (questionKey: IQuestionKey): Promise<any> => {

      return new Promise(async (resolve) => {
        try {
          //const { topId, id } = questionKey;
          const query = new QuestionKey(questionKey).toQuery(workspace);
          const url = `${KnowledgeAPI.endpointQuestion}?${query}`;
          console.time()
          await Execute("GET", url)
            .then((questionDtoEx: IQuestionDtoEx) => {
              console.timeEnd();
              const { questionDto, msg } = questionDtoEx;
              if (questionDto) {
                const questionEx: IQuestionEx = {
                  question: new Question(questionDto).question,
                  msg
                }
                resolve(questionEx);
              }
              else {
                const questionEx: IQuestionEx = {
                  question: null,
                  msg
                }
                resolve(questionEx);
              }
              //}
            });
        }
        catch (error: any) {
          console.log(error);
          const questionEx: IQuestionEx = {
            question: null,
            msg: "Problemos"
          }
          resolve(questionEx);
        }
      })
    }, [KnowledgeAPI.endpointQuestion, workspace]);

  /*
  const getCatsByKind = async (kind: number): Promise<ICategoryRow[]> => {
    try {
      const { allCategoryRowsGlobal: allCategoryRows } = globalState;
      const categories: ICategoryRow[] = [];
      allCategoryRows.forEach((c) => {
        if (c.kind === kind) {
          //const { topId, id, title, level, link, header } = c;
          // const cat: ICat = {
          //   topId,
          //   id: id,
          //   header,
          //   title,
          //   link,
          //   parentId: "",
          //   titlesUpTheTree: "",
          //   variations: [],
          //   hasSubCategories: false,
          //   numOfQuestions: 0,
          //   level,
          //   kind,
          //   isExpanded: false
          // }
          categories.push(c);
        }
      })
      return categories;
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
    }
    return [];
  }
  */

  /*
  const getCatsByLevel = async (kind: number): Promise<ICategoryRow[]> => {
    try {
      const categories: ICategoryRow[] = [];
      allCategoryRows.forEach((c, id) => {
        if (c.kind === kind) {
          const { topId, id, header, title, link, level } = c;
          // const cat: ICategoryRow = {
          //   topId,
          //   id,
          //   header,
          //   title,
          //   link,
          //   parentId: "",
          //   titlesUpTheTree: "",
          //   variations: [],
          //   hasSubCategories: false,
          //   numOfQuestions: 0,
          //   level,
          //   kind,
          //   isExpanded: false
          // }
          categories.push(c);
        }
      })
      return categories;
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
    }
    return [];
  } */

  /*
const getSubCats = useCallback(async (categoryId: string | null) => {
  try {
    let parentHeader = "";
    const subCats: ICategoryRow[] = [];
    allGroupRows.forEach((cat, id) => {  // globalState.cats is Map<string, ICat>
      if (id === categoryId) {
        parentHeader = ""; //cat.header!;
      }
      else if (cat.parentId === categoryId) {
        subCats.push(cat);
      }
    })
    return { subCats, parentHeader };
  }
  catch (error: any) {
    console.log(error)
    dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
    return { subCats: [], parentHeader: 'Kiks subCats' }
  }
}, [allGroupRows]);
*/

  /*
  const getCat = useCallback(async (id: string): Promise<ICategoryRow | undefined> => {
    try {
      const cat: ICategoryRow | undefined = allGroupRows.get(id);  // globalState.cats is Map<string, ICat>
      return cat;
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
    }
    return undefined;
  }, [allGroupRows]);
  */


  const health = () => {
    //const url = `api/health`;
    // axios
    //   .post(url)
    //   .then(({ status }) => {
    //     if (status === 200) {
    //       console.log('health successfull:', status)
    //     }
    //     else {
    //       console.log('Status is not 200', status)
    //     }
    //   })
    //   .catch((err: any | Error) => {
    //     console.log(err);
    //   });
  };

  const setNodesReloaded = () => {
    if (!globalState.nodesReLoaded) {
      dispatch({ type: GlobalActionTypes.SET_NODES_RELOADED })
    }
  }

  const getAnswer = async (answerKey: IAnswerKey): Promise<any> => {
    return new Promise(async (resolve) => {
      try {
        const { topId, id } = answerKey;
        //const url = `${process.env.REACT_APP_API_URL}/Answer/${parentId}/${id}`;
        //console.log(`FETCHING --->>> ${url}`)
        //dispatch({ type: GlobalActionTypes.SET_LOADING, payload: {} })
        console.time()
        /*
        axios
          .get(url, {
            withCredentials: false,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': "*"
            }
          })
          .then(({ data: answerDto }) => {
            const categories: IGroup[] = [];
            console.timeEnd();
            const answer: IAnswer = new Answer(answerDto, parentId).answer;
            answer.groupTitle = 'nadji me';
            resolve(answer);
          })
          .catch((error) => {
            console.log('FETCHING --->>>', error);
          });
        */
        const url = `${KnowledgeAPI.endpointAnswer}/${topId}/${id}`;
        await Execute("GET", url).then((answerDto: IAnswerDto) => {
          console.timeEnd();
          console.log({ response: answerDto });
          const answer: IAnswer = new Answer(answerDto).answer;
          resolve(answer);
        });
      }
      catch (error: any) {
        console.log(error);
        dispatch({ type: GlobalActionTypes.SET_ERROR, payload: error });
      }
    });
  }

  /*
  const globalGetGroupRow = useCallback(async (id: string): Promise<IGroupRow | undefined> => {
    try {
      //const { allGroupRows: groupRows } = globalState;
      const groupRow: IGroupRow | undefined = allGroupRowsGlobal.get(id);  // globalState.cats is Map<string, ICat>
      return groupRow!;
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
    }
    return undefined;
  }, [allGroupRowsGlobal]);


  const getGroupRowsByKind = async (kind: number): Promise<IGroupRow[]> => {
    try {
      const { allGroupRowsGlobal: shortGroups } = globalState;
      const groups: IGroupRow[] = [];
      shortGroups.forEach((c) => {
        if (c.kind === kind) {
          const { topId, id, header, title, level } = c;
          const groupRow: IGroupRow = {
            topId,
            id,
            header,
            title,
            //link,
            parentId: "",
            titlesUpTheTree: "",
            //variations: [],
            hasSubGroups: false,
            level,
            kind,
            isExpanded: false,
            link: null,
            groupRows: [],
            variations: [],
            numOfAnswers: 0,
            answerRows: []
          }
          groups.push(groupRow);
        }
      })
      return groups;
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
    }
    return [];
  }
  */

  const createWorkspace = useCallback(
    async (wsDto: IWorkspaceDto) => {
      //dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
      try {
        console.log("workspaceDto", wsDto)
        const url = `${KnowledgeAPI.endpointWorkspace}/create`;
        console.time()
        const { DisplayName, Email, Environment } = wsDto;
        await Execute("POST", url, wsDto)
          .then(async (workspaceDtoEx: IWorkspaceDtoEx) => {
            const { workspaceDto } = workspaceDtoEx;
            console.timeEnd();
            if (workspaceDto) {
              console.log('Workspace successfully created', { workspaceDto });
              const user: IUser = {
                workspace: Email!,
                nickName: DisplayName!,
                name: DisplayName!,
                email: Email!,
                environment: Environment!
              }
              dispatch({ type: GlobalActionTypes.AUTHENTICATE, payload: { user } });
            }
          });
      }
      catch (error: any) {
        console.log(error)
        //dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error') } });
      }
    }, [KnowledgeAPI.endpointWorkspace]);


  const getWorkspace = useCallback(
    async (wsDto: IWorkspaceDto) => {
      //dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
      try {
        console.log("workspaceDto", wsDto)
        const url = `${KnowledgeAPI.endpointWorkspace}/get`;
        const { DisplayName, Email, Environment } = wsDto;
        console.time()
        await Execute("POST", url, { Email })
          .then(async (workspaceDtoEx: IWorkspaceDtoEx) => {
            const { workspaceDto } = workspaceDtoEx;
            console.timeEnd();
            if (workspaceDto) {
              console.log('Workspace successfully created', { workspaceDto });
              //const { ObjectId, DisplayName } = workspaceDto;
              const { Workspace } = workspaceDto;
              const user: IUser = {
                workspace: Workspace,
                nickName: DisplayName!,
                name: DisplayName!,
                email: Email!,
                environment: Environment!
              }
              dispatch({ type: GlobalActionTypes.AUTHENTICATE, payload: { user } });
            }
          });
      }
      catch (error: any) {
        console.log(error)
        //dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error') } });
      }
    }, [KnowledgeAPI.endpointWorkspace]);

  const addHistory = useCallback(
    async (history: IHistory) => {
      //const { topId, id, variations, title, kind, modified } = history;
      //dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
      try {
        const historyDto = new HistoryDto(history, workspace).historyDto;
        console.log("historyDto", { historyDto })
        const url = `${KnowledgeAPI.endpointHistory}`;
        console.time()
        await Execute("POST", url, historyDto)
          .then(async (questionDtoEx: IQuestionDtoEx) => {
            const { questionDto } = questionDtoEx;
            console.timeEnd();
            if (questionDto) {
              //const history = new History(historyDto).history;
              console.log('History successfully created', { questionDto })
              // dispatch({ type: ActionTypes.SET_ADDED_CATEGORY, payload: { category: { ...category, questions: [] } } });
              // dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM })
              //await loadCats(); // reload
            }
          });
      }
      catch (error: any) {
        console.log(error)
        //dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error') } });
      }
    }, [KnowledgeAPI.endpointHistory, workspace]);

  const getAnswersRated = async (/*questionKey: IQuestionKey*/): Promise<any> => {
    // const mapAnswerRating = new Map<string, IAssignedAnswer>();
    // try {
    //   console.log("getAnswersRated", { questionKey })
    //   const url = `${KnowledgeAPI.endpointHistory}/${questionKey.topId}/${questionKey.id}`;
    //   console.time()
    //   const answerRatedListEx: IAnswerRatedListEx = { answerRatedList: null, msg: "" }
    //   await Execute("GET", url)
    //     .then(async (answerRatedDtoListEx: IAnswerRatedDtoListEx) => {
    //       console.timeEnd();
    //       const { answerRatedDtoList, msg } = answerRatedDtoListEx;
    //       if (answerRatedDtoList) {
    //         answerRatedDtoList.forEach(answerRatedDto => {
    //           const answerRated = new AnswerRated(answerRatedDto).answerRated;
    //           const { answerKey, numOfFixed, numOfNotFixed, numOfNotClicked } = answerRated;
    //           const answerId = answerKey.id;
    //           /*
    //           if (!mapAnswerRating.has(answerId)) {
    //             mapAnswerRating.set(answerId, { fixed: fixed === true ? 1 : 0, notFixed: fixed === false ? 1 : 0, Undefined: fixed === undefined ? 1 : 0 });
    //           }
    //           else {
    //             const answerRating = mapAnswerRating.get(answerId);
    //             switch (fixed) {
    //               case true:
    //                 answerRating!.fixed++;
    //                 break;
    //               case false:
    //                 answerRating!.notFixed++;
    //                 break;
    //               case undefined:
    //                 answerRating!.Undefined++;
    //                 break;
    //               default:
    //                 alert('unk rate')
    //                 break;
    //             }
    //             mapAnswerRating.set(answerId, answerRating!);
    //           }
    //           const arr: IAnswerRated[] = [];
    //           mapAnswerRating.forEach((value, key) => {
    //             arr.push({ answerId: key, ...value })
    //           })
    //           answerRatings.answerRatedList = arr.sort(compareFn);
    //             */
    //         })
    //       }
    //       else {
    //         answerRatedListEx.msg = msg;
    //       }
    //     });
    //   return answerRatedListEx;
    // }
    // catch (error: any) {
    //   console.log(error);
    //   const answerRatedListEx: IAnswerRatedListEx = {
    //     answerRatedList: null, msg: "Server problemos"
    //   }
    //   return answerRatedListEx;
    // }
  }

  const addHistoryFilter = useCallback(async (historyFilter: IHistoryFilter) => {
    //const { topId, id, variations, title, kind, modified } = history;
    //dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
    try {
      const historyFilterDto = new HistoryFilterDto(historyFilter, workspace).historyFilterDto;
      //console.log("historyDto", { historyDto })
      const url = `${KnowledgeAPI.endpointHistoryFilter}`;
      console.time()
      await Execute("POST", url, historyFilterDto)
        .then(async (questionDtoEx: IQuestionDtoEx) => {
          const { questionDto } = questionDtoEx;
          console.timeEnd();
          if (questionDto) {
            //const history = new History(historyDto).history;
            console.log('History Filter successfully created', { questionDto });
            // dispatch({ type: ActionTypes.SET_ADDED_CATEGORY, payload: { category: { ...category, questions: [] } } });
            // dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM })
            //await loadCats(); // reload
          }
        });
    }
    catch (error: any) {
      console.log(error)
      //dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error') } });
    }
  }, [KnowledgeAPI.endpointHistoryFilter, workspace]);

  const setLastRouteVisited = useCallback((lastRouteVisited: string): void => {
    dispatch({ type: GlobalActionTypes.SET_LAST_ROUTE_VISITED, payload: { lastRouteVisited } });
  }, []);

  const setChatBotDlgEnabled = () => {
    dispatch({ type: GlobalActionTypes.SET_ENABLE_CHATBOT_DLG });
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <GlobalContext.Provider value={{
      globalState, setLastRouteVisited,
      health,
      loadAllCategoryRowsGlobal,
      loadAllGroupRowsGlobal,
      searchQuestions, getQuestion,
      searchAnswers, getAnswer,
      setNodesReloaded,
      createWorkspace, getWorkspace,
      addHistory, getAnswersRated, addHistoryFilter,
      setChatBotDlgEnabled
    }}>
      <GlobalDispatchContext.Provider value={dispatch}>
        {children}
      </GlobalDispatchContext.Provider>
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  return useContext(GlobalContext);
}

export const useGlobalDispatch = () => {
  return useContext(GlobalDispatchContext)
}

export const useGlobalState = () => {
  const { globalState } = useGlobalContext()
  return globalState;
}
