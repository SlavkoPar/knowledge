import { useGlobalState, useGlobalContext } from '@/global/GlobalProvider'
import React, { createContext, useContext, useReducer, useCallback, type Dispatch, useEffect } from 'react';

import type {
  IGroup, IAnswer, IGroupsContext,
  IGroupDtoEx, IGroupKey,
  IAnswerDtoEx, IAnswerEx, IAnswerKey, IAnswerRow,
  IGroupRow,
  IGroupRowDtoEx,
  IGroupRowDto,
  ILoadGroupAnswers,
  IExpandInfo,
  IKeyExpanded,
  IGroupsState,
  ILocStorage
} from '@/groups/types';


import {
  ActionTypes,
  GroupKey, Group, GroupDto,
  Answer,
  AnswerDto,
  AnswerRowDto,
  GroupRow,
  AnswerKey,
  FormMode,
  GroupRowDto,
  _generateId
} from '@/groups/types';

import { GroupReducer, initialAnswer, initialGroup } from '@/groups/GroupReducer';

const GroupsContext = createContext<IGroupsContext>({} as any);
const GroupDispatchContext = createContext<Dispatch<any>>(() => null);

type IProps = {
  children: React.ReactNode
}

export const initialState: IGroupsState = {
  formMode: FormMode.None,

  allGroupRows: new Map<string, IGroupRow>(),
  allGroupRowsLoaded: undefined,

  topRows: [],
  topRowsLoading: false,
  topRowsLoaded: false,

  nodeOpening: false,
  nodeOpened: false,

  keyExpanded: null,

  groupId_answerId_done: undefined,

  activeGroup: null,
  activeAnswer: null,
  selectedAnswerId: null,

  loadingGroups: false,
  loadingAnswers: false,
  loadingGroup: false, groupLoaded: false,
  loadingAnswer: false, answerLoaded: false,

  error: undefined,

  rowExpanding: false,
  rowExpanded: false
}

export const GroupProvider: React.FC<IProps> = ({ children }) => {

  const { loadAllGroupRowsGlobal } = useGlobalContext();
  const globalState = useGlobalState();
  const { KnowledgeAPI, isAuthenticated, workspace, authUser, canEdit } = globalState;
  const { nickName } = authUser;

  const [state, dispatch] = useReducer(GroupReducer, initialState);

  const { formMode, activeGroup, activeAnswer, keyExpanded, topRows, allGroupRows, allGroupRowsLoaded } = state;

  console.log('----->>> ----->>> ----->>> GroupProvider', topRows)

  useEffect(() => {

    let keyExpanded: IKeyExpanded | null = workspace === 'DEMO'
      ? { topId: "MTS", groupId: "REMOTECTRLS", answerId: "qqqqqq111" }
      : null;

    if ('localStorage' in window) {
      let s = localStorage.getItem('GROUPS_STATE');
      console.log('GROUPS_STATE from localStorage', s)
      if (s !== null) {
        const locStorage: ILocStorage = JSON.parse(s);
        if (locStorage.keyExpanded !== null)
          keyExpanded = locStorage.keyExpanded!;
      }
    }
    /**/
    dispatch({ type: ActionTypes.SET_KEY_EXPANDED, payload: { keyExpanded } });
  }, [workspace]);


  const Execute = useCallback(
    async (
      method: string,
      endpoint: string,
      data: Object | null = null,
      whichRowId: string | undefined = undefined
    ): Promise<any> => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        try {
          console.log("------Execute endpoint:", endpoint)
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
                dispatch({
                  type: ActionTypes.SET_ERROR, payload: {
                    error: new Error(`Response status: ${response.status}`),
                    whichRowId
                  }
                });
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
            dispatch({ type: ActionTypes.SET_ERROR, payload: { error, whichRowId } });
          }
        }
        catch (e) {
          console.log('-------------->>> execute', method, endpoint, e)
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(`fetch eror`), whichRowId } });
        }
      }
      return null;
    }, []);


  // ---------------------------
  // load all groupRows
  // ---------------------------
  const loadAllGroupRows = useCallback(async (): Promise<Map<string, IGroupRow> | null> => {
    return new Promise(async (resolve) => {
      const allGroupRows = await loadAllGroupRowsGlobal();
      if (allGroupRows) {
        dispatch({ type: ActionTypes.SET_ALL_GROUP_ROWS, payload: { allGroupRows } });
      }
      else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Zajeb allGroupRows') } });
      }
      resolve(allGroupRows);
    })
  }, [loadAllGroupRowsGlobal]);


  const getGrp = useCallback(async (id: string): Promise<IGroupRow | undefined> => {
    try {
      const grp: IGroupRow | undefined = allGroupRows.get(id);  // globalState.cats is Map<string, ICat>
      return grp;
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
    return undefined;
  }, [allGroupRows]);

  useEffect(() => {
    (async () => {
      //if (allGroupRowsLoaded === undefined) {
      await loadAllGroupRows();
      //}
    })()
  }, [loadAllGroupRows]);

  const getSubGrps = useCallback(async (groupId: string | null) => {
    try {
      let parentHeader = "";
      const subGrps: IGroupRow[] = [];
      allGroupRows.forEach((cat, id) => {  // globalState.cats is Map<string, ICat>
        if (id === groupId) {
          parentHeader = ""; //cat.header!;
        }
        else if (cat.parentId === groupId) {
          subGrps.push(cat);
        }
      })
      return { subGrps, parentHeader };
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      return { subGrps: [], parentHeader: 'Kiks subGrps' }
    }
  }, [allGroupRows]);

  const loadTopRows = useCallback(async () => {
    return new Promise(async (resolve) => {
      //const { keyExpanded } = state;
      try {
        dispatch({ type: ActionTypes.SET_TOP_ROWS_LOADING, payload: {} });
        const url = `${KnowledgeAPI.endpointGroupRow}/${workspace}/toprows`;
        console.log('GroupProvider loadTopRows url:', url)
        console.log('loadTopRows AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
        console.time();
        await Execute("GET", url)
          .then((dtos: IGroupRowDto[]) => {
            console.timeEnd();
            console.log('loadTopRows CCCCCCCCCCCCCCCCCCCC')
            const topRows: IGroupRow[] = dtos!.map((dto: IGroupRowDto) => {
              dto.IsExpanded = keyExpanded
                ? dto.Id === keyExpanded.groupId
                : false;
              //dto.TopId = dto.AnswerId;
              return new GroupRow(dto).groupRow;
            })
            dispatch({ type: ActionTypes.SET_TOP_ROWS, payload: { topRows } });
            resolve(true);
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    })
  }, [Execute, KnowledgeAPI.endpointGroupRow, keyExpanded, workspace]); // state, 


  // get group With subgroupRows and answerRows
  const getGroup = useCallback(
    async (groupKey: IGroupKey, includeAnswerId: string | null): Promise<any> => {
      const { topId, id } = groupKey;
      console.log({ groupKey, includeAnswerId })
      return new Promise(async (resolve) => {
        try {
          const url = `${KnowledgeAPI.endpointGroup}/${workspace}/${topId}/${id}/${PAGE_SIZE}/${includeAnswerId}`;
          console.time()
          console.log('================ getGroup =======================')
          await Execute("GET", url)
            .then((groupDtoEx: IGroupDtoEx) => {
              console.timeEnd();
              const { groupDto, msg } = groupDtoEx;
              if (groupDto) {
                resolve(new Group(groupDto).group);
              }
              else {
                resolve(new Error(msg));
              }
            });
        }
        catch (error: any) {
          console.log(error)
          resolve(error);
        }
      })
    }, [Execute, KnowledgeAPI.endpointGroup, workspace]);

  const findGroupRow = useCallback(
    async (groupRow: IGroupRow, id: string): Promise<IGroupRow | undefined> => {
      if (groupRow.topId === id)
        return groupRow;
      const { groupRows } = groupRow;
      let grp: IGroupRow | undefined = groupRows.find(c => c.id === id);
      if (!grp) {
        for (const c of groupRows) {
          const grpRow = await findGroupRow(c, id);
          if (grpRow) {
            grp = grpRow;
            console.log("findGroup Stop the loop for: " + id);
            break;
          }
        }
      }
      return grp;
    }, []);


  const expandNodesUpToTheTree = useCallback(
    async (grpKey: IGroupKey, answerId: string | null, fromChatBotDlg = false): Promise<boolean> => {
      return new Promise(async (resolve) => {
        try {
          let { topId, parentId, id } = grpKey;
          console.assert(id !== null, 'id ne sme biti null u expandNodesUpToTheTree');
          if (id) {
            // const groupRow: IGroupRow | undefined = allGroupRows.get(id);
            // if (groupRow) {
            //   //topId = groupRow.topId;
            //   parentId = groupRow.parentId;
            // }
            // else {
            //   alert('reload all groupRow:' + id)
            //   //return
            // }
          }
          dispatch({
            type: ActionTypes.SET_NODE_EXPANDING_UP_THE_TREE, payload: {
              groupId_answerId_done: `${id}_${answerId}`
            }
          })
          // ---------------------------------------------------------------------------
          console.time();
          const groupKey: IGroupKey = { topId, id, parentId: null }; // proveri ROOT
          const query = new GroupKey(groupKey).toQuery(workspace);
          const url = `${KnowledgeAPI.endpointGroupRow}?${query}&pageSize=${PAGE_SIZE}&includeAnswerId=${answerId ?? null}`;
          await Execute("GET", url)
            .then(async (groupRowDtoEx: IGroupRowDtoEx) => {
              //dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { groupKey: groupKey! } });
              const { groupRowDto } = groupRowDtoEx;
              console.timeEnd();
              if (groupRowDto) {
                let group: IGroup | null = null;
                let answer: IAnswer | null = null;
                const topRowNew: IGroupRow | null = new GroupRow(groupRowDto).groupRow;
                const bottomRow = await findGroupRow(topRowNew, id!);
                if (parentId !== null) {
                  //topRow = groupRow!;
                  group = { ...bottomRow!, doc1: '' };
                  if (answerId) {
                    const answerRow = bottomRow!.answerRows!.find(q => q.id === answerId && q.included)!;
                    if (answerRow) {
                      group = null;
                      answer = {
                        ...answerRow,
                        source: 0,
                        status: 0
                      }
                    }
                  }
                }
                else {
                  console.log('WHAT') // TODO
                }
                console.log('>>> expandNodeUpToTheTree groupRow', { topRowNew, groupRow: bottomRow, answerId: "'" + (answerId ?? 'jok') + "'" + (answerId ?? "JOK") })
                const formMode = answerId
                  ? canEdit
                    ? FormMode.EditingAnswer
                    : FormMode.ViewingAnswer
                  : canEdit
                    ? FormMode.EditingGroup
                    : FormMode.ViewingGroup;
                dispatch({
                  type: ActionTypes.SET_NODE_EXPANDED_UP_THE_TREE, payload: {
                    grpKey,
                    groupRow: topRowNew,
                    group: group!,
                    answerId: answerId ?? null,
                    answer,
                    formMode,
                    fromChatBotDlg //: fromChatBotDlg === 'true'
                  }
                })
                resolve(true);
              }
              else {
                resolve(false);
              }
            });
        }
        catch (error: any) {
          console.log(error)
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
        }
      })
    }, [workspace, KnowledgeAPI.endpointGroupRow, Execute, allGroupRows, findGroupRow, canEdit]);


  const getGroupRow = useCallback(
    async (groupKey: IGroupKey, hidrate: boolean = false, includeAnswerId: string | null = null): Promise<any> => {
      const query = new GroupKey(groupKey).toQuery(workspace);
      return new Promise(async (resolve) => {
        try {
          const url = `${KnowledgeAPI.endpointGroupRow}/${hidrate}/${PAGE_SIZE}/${includeAnswerId}?${query}`;
          console.time()
          await Execute("GET", url)
            .then((groupRowDtoEx: IGroupRowDtoEx) => {
              console.timeEnd();
              const { groupRowDto, msg } = groupRowDtoEx;
              if (groupRowDto) {
                //groupRowDto.TopId = topId;
                resolve(new GroupRow(groupRowDto).groupRow);
              }
              else {
                resolve(new Error(msg));
              }
            });
        }
        catch (error: any) {
          console.log(error)
          resolve(error);
        }
      })
    }, [Execute, KnowledgeAPI.endpointGroupRow, workspace]);


  const expandGroup = useCallback(
    async ({ groupKey, includeAnswerId, newAnswerRow, formMode }: IExpandInfo): Promise<any> => {
      try {
        //const { keyExpanded } = state;
        dispatch({ type: ActionTypes.SET_ROW_EXPANDING, payload: {} });
        const groupRow: IGroupRow = await getGroupRow(groupKey, true, includeAnswerId); // to reload Group
        if (groupRow instanceof Error) {
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error: groupRow } });
          console.error({ groupRow })
        }
        else {
          let selectedAnswerId: string | undefined = undefined;
          if (includeAnswerId && groupRow.answerRows!.filter((row: IAnswerRow) => row.included).length > 0) {
            selectedAnswerId = includeAnswerId;
          }
          // if (newGroupRow) {
          //   groupRow.groupRows = [newGroupRow, ...groupRow.groupRows];
          // }
          if (newAnswerRow) {
            groupRow.answerRows = [newAnswerRow, ...groupRow.answerRows!];
          }
          groupRow.isExpanded = true;
          console.log('@@@@@@@@@@@@@@@@@ expandGroup:', formMode, includeAnswerId)
          if (formMode === FormMode.None && includeAnswerId) {
            formMode = canEdit ? FormMode.EditingAnswer : FormMode.ViewingAnswer
          }
          dispatch({ type: ActionTypes.SET_ROW_EXPANDED, payload: { groupRow, formMode: formMode!, selectedAnswerId } });
          return groupRow;
        }
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
        return null;
      }
    }, [canEdit, getGroupRow]);


  const collapseGroup = useCallback(
    async (groupRow: IGroupRow) => {
      const { topId, id } = groupRow;
      //const { topRows } = state;
      const topRow: IGroupRow = topRows.find(c => c.id === topId)!;
      const grpRow: IGroupRow | undefined = await findGroupRow(topRow, id);
      /*
      const catRow: IGroupRow = (topRow.id === id)
        ? topRow
        : (await findGroupRow(topRow, id))!;
      */
      if (grpRow) {
        groupRow = { ...grpRow, isExpanded: false, groupRows: [], answerRows: [] }
        // rerender
        dispatch({ type: ActionTypes.SET_ROW_COLLAPSED, payload: { groupRow } })
      }
      else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('findGroup sranje'), whichRowId: id } });
      }
    }, [findGroupRow, topRows]);


  const addGroup = useCallback(
    async (parentGroupRow: IGroupRow | null) => {
      try {
        //if (formMode !== FormMode.None) {
        dispatch({ type: ActionTypes.CLOSE_GROUP_FORM, payload: {} })
        //}
        //const id = _generateId;
        const { topId, id, level } = parentGroupRow ?? { topId: _generateId, id: _generateId, level: 0 };
        const newGroupRow: IGroupRow = {
          ...initialGroup,
          topId,
          parentId: parentGroupRow ? id : null,
          id: _generateId,
          level: level + 1,
          title: 'New Group',
          isExpanded: false
        }
        if (parentGroupRow === null) { // add topRow
          dispatch({
            type: ActionTypes.SET_GROUP_TO_ADD_TOP, payload: {
              //groupRow: { groupRow, groupRows: [newGroupRow, ...groupRow.groupRows]
              newGroupRow
            }
          });
        }
        else {
          // if (id !== null) {
          //   const topRow: IGroupRow = state.topRows.find(c => c.id === topId)!;
          //   parentGroupRow = findGroupRow(topRow, id)!;
          // }
          const groupRow: IGroupRow = {
            ...parentGroupRow,
            level: level + 1,
            groupRows: [newGroupRow, ...parentGroupRow.groupRows],
            hasSubGroups: true,
            isExpanded: true
          }
          dispatch({
            type: ActionTypes.SET_GROUP_TO_ADD, payload: {
              groupRow,
              newGroupRow: { ...newGroupRow } // , title: ''
            }
          })
          // dispatch({
          //   type: ActionTypes.SET_GROUP, payload: {
          //     groupRow: { ...newGroupRow, doc1: ''}
          //   }
          // })
          //const groupKey: IGroupKey = { topId, parentId, id };
          // const newGroupRow: IGroupRow = {
          //   ...initialGroup,
          //   topId,
          //   parentId,
          //   id: _generateId,
          //   level,
          //   title: '' // new Group
          // }
          /*
          if (isExpanded) {
            groupRows.map(g => g.isExpanded = false);
            const groupRow2: IGroupRow = {
              ...groupRow,
              groupRows: [newGroupRow, ...groupRows],
            }
            dispatch({ type: ActionTypes.SET_ROW_EXPANDED, payload: { groupRow: groupRow2, formMode: FormMode.AddingGroup } });
            dispatch({ type: ActionTypes.SET_GROUP, payload: { groupRow: { ...newGroupRow, doc1: '' } } });
          }
          else {
            const expandInfo: IExpandInfo = {
              groupKey,
              formMode: FormMode.AddingGroup,
              newGroupRow
            }
            const row: IGroupRow | null = await expandGroup(expandInfo);
            if (row) {
              const group: IGroup = {
                ...newGroupRow,
                doc1: ''
              }
              dispatch({ type: ActionTypes.SET_GROUP, payload: { groupRow: group } });
            }
          }
            */
        }
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, []);


  const cancelAddGroup = useCallback(
    async () => {
      try {
        const { parentId } = activeGroup!;
        let parentRow: IGroupRow | undefined = undefined;

        let rows: IGroupRow[] = [];
        topRows.forEach(async topRow => {
          if (parentId === null) {
            rows = topRows.filter(catRow => catRow.id !== _generateId);
          }
          else {
            parentRow = await findGroupRow(topRow, parentId!);
            if (parentRow) {
              parentRow.groupRows = parentRow.groupRows.filter((catRow: { id: string; }) => catRow.id !== _generateId);
            }
          }
        });
        dispatch({ type: ActionTypes.CANCEL_ADD_GROUP, payload: { topRows: (rows.length > 0) ? rows : topRows } });
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [activeGroup, expandGroup]);


  const createGroup = useCallback(
    async (group: IGroup) => {
      const { id } = group;
      dispatch({ type: ActionTypes.SET_LOADING_GROUP, payload: {} });
      try {
        const groupDto = new GroupDto(group, workspace).groupDto;
        console.log("groupDto", { groupDto })
        const url = `${KnowledgeAPI.endpointGroup}`; //
        console.time()
        await Execute("POST", url, groupDto, id)
          .then(async (groupDtoEx: IGroupDtoEx) => {   //  | null
            console.timeEnd();
            const { groupDto } = groupDtoEx;
            if (groupDto) {
              //groupDto.TopId = topId!;
              const group = new Group(groupDto).group;
              console.log('Group successfully created', { group })
              dispatch({ type: ActionTypes.CLOSE_GROUP_FORM, payload: {} })
              // await loadAllGroupRows()
              allGroupRows.set(group.id, { // TODO check it
                ...group,
                isExpanded: false
              });
              //.then(async () => { // done: boolean
              //await loadTopRows();
              //await onGroupIdChanged(topId, group.id); // replace _generateId with id, inside of tree
              if (group.parentId === null) {
                dispatch({ type: ActionTypes.SET_GROUP_ADDED, payload: { groupRow: group } }); // IGroup extends IGroup Row
              }
              else {
                // const parentGroupKey: IGroupKey = {
                //   topId: group.topId,
                //   parentId: "doesn't matter",
                //   id: group.parentId!
                // };
                // const expandInfo: IExpandInfo = {
                //   groupKey: parentGroupKey,
                //   formMode: FormMode.AddingGroup
                // }
                // alert('zovem expa')
                // await expandGroup(expandInfo).then(() => {
                //   dispatch({ type: ActionTypes.SET_GROUP_ADDED, payload: { groupRow: group } }); // IGroup extends IGroup Row
                // });
                dispatch({ type: ActionTypes.SET_GROUP_ADDED, payload: { groupRow: group } }); // IGroup extends IGroup Row
              }
              //})
            }
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [Execute, KnowledgeAPI.endpointGroup, loadAllGroupRows, loadTopRows, workspace]);


  const cancelAddAnswer = useCallback(
    async () => {
      try {
        const { topId, parentId } = activeAnswer!;
        const groupKey: IGroupKey = { topId, parentId, id: parentId! };
        const expandInfo: IExpandInfo = {
          groupKey,
          formMode: FormMode.None
        }
        const groupRow: IGroupRow | null = await expandGroup(expandInfo);
        if (groupRow) {
          dispatch({ type: ActionTypes.CANCEL_ADD_ANSWER, payload: { groupRow } });
        }
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [activeAnswer, expandGroup]);

  const viewGroup = useCallback(async (groupRow: IGroupRow, includeAnswerId: string | null) => {
    if (formMode === FormMode.AddingAnswer) {
      await cancelAddAnswer();
    }
    else if (formMode === FormMode.AddingGroup) {
      await cancelAddGroup();
    }
    dispatch({ type: ActionTypes.SET_LOADING_GROUP, payload: { groupRow } });
    const groupKey = new GroupKey(groupRow).groupKey!;
    const group: IGroup = await getGroup(groupKey, includeAnswerId);
    if (group instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: group } });
    else {
      group.topId = groupRow.topId;
      dispatch({ type: ActionTypes.SET_GROUP_TO_VIEW, payload: { groupRow: group } });
    }
  }, [cancelAddGroup, cancelAddAnswer, formMode, getGroup]);


  const editGroup = useCallback(async (groupRow: IGroupRow, includeAnswerId: string | null) => {
    // includeAnswerId = null;
    //const { topId, parentId } = groupRow;
    if (formMode === FormMode.AddingAnswer) {
      await cancelAddAnswer();
    }
    else if (formMode === FormMode.AddingGroup) {
      await cancelAddGroup();
    }
    dispatch({ type: ActionTypes.SET_LOADING_GROUP, payload: {} });
    const groupKey = new GroupKey(groupRow).groupKey!;
    const group: IGroup = await getGroup(groupKey, includeAnswerId);
    if (group instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: group } });
    else {
      const grpRow: IGroupRow = { ...group, isExpanded: false, groupRows: [], answerRows: [] }
      dispatch({ type: ActionTypes.SET_GROUP_TO_EDIT, payload: { groupRow: grpRow, group } });
      /*
      if (parentId === null) { // topRow
        group.topId = groupRow.topId;
        dispatch({ type: ActionTypes.SET_GROUP_TO_EDIT, payload: { groupRow: group } });
      }
      else {
        const parentKey: IGroupKey = { topId, parentId, id: parentId }
        // get acurate info from server (children will be collapsed)
        const expandInfo: IExpandInfo = {
          groupKey: parentKey,
          formMode: FormMode.EditingGroup
        }
        await expandGroup(expandInfo).then(() => {
          group.topId = groupRow.topId;
          dispatch({ type: ActionTypes.SET_GROUP_TO_EDIT, payload: { groupRow: group } });
        })
      }
        */
    }
  }, [cancelAddGroup, cancelAddAnswer, formMode, getGroup]);


  const updateGroup = useCallback(
    async (group: IGroup) => { // , closeForm: boolean
      //const { topId, id, variations, title, kind, modified } = group;
      dispatch({ type: ActionTypes.SET_LOADING_GROUP, payload: {} });
      try {
        const groupDto = new GroupDto(group, workspace).groupDto;
        const url = `${KnowledgeAPI.endpointGroup}`;
        console.time()
        await Execute("PUT", url, groupDto)
          .then((groupDtoEx: IGroupDtoEx) => {
            console.timeEnd();
            const { groupDto, msg } = groupDtoEx;
            if (groupDto) {
              const group = new Group(groupDto).group;
              const { topId } = group;
              group.isExpanded = false;
              group.topId = topId;
              dispatch({ type: ActionTypes.SET_GROUP_UPDATED, payload: { /*groupRow: group, */group } });
              // if (closeForm) {
              //   dispatch({ type: ActionTypes.CLOSE_GROUP_FORM, payload: {} })
              // }
            }
            else {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(`${msg}`) } });
            }
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("Karambol") } });
        return error;
      }
    }, [Execute, KnowledgeAPI.endpointGroup, workspace]);


  const deleteGroup = useCallback(async (groupRow: IGroupRow) => {
    //dispatch({ type: ActionTypes.SET_GROUP_LOADING, payload: { id, loading: false } });
    try {
      const { parentId, id } = groupRow;
      groupRow.modified = { time: new Date(), nickName };
      const groupDto = new GroupRowDto(groupRow, workspace).groupRowDto;
      const url = `${KnowledgeAPI.endpointGroup}`;
      console.time()
      dispatch({ type: ActionTypes.SET_LOADING_GROUPS, payload: {} });
      await Execute("DELETE", url, groupDto)    //Modified: {  Time: new Date(), NickName: globalState.authUser.nickName }
        .then(async (groupDtoEx: IGroupDtoEx) => {
          console.timeEnd();
          const { groupDto, msg } = groupDtoEx;
          if (msg === "OK") {
            console.log('Group successfully deleted', { groupRow })
            let parentRow: IGroupRow | undefined = undefined;
            let rows: IGroupRow[] = [];
            topRows.forEach(async topRow => {
              if (parentId === null) {
                rows = topRows.filter(catRow => catRow.id !== id);
              }
              else {
                parentRow = await findGroupRow(topRow, parentId!);
                if (parentRow) {
                  parentRow.groupRows = parentRow.groupRows.filter((groupRow: { id: string; }) => groupRow.id !== id);
                }
              }
            });
            dispatch({ type: ActionTypes.GROUP_DELETED, payload: { id } });
          }
          else if (msg === "HasSubGroups") {
            dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("First remove sub groups"), whichRowId: groupDto!.Id } });
          }
          else if (msg === "HasAnswers") {
            dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("First remove group answers"), whichRowId: groupDto!.Id } });
          }
          else {
            dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg), whichRowId: groupDto!.Id } });
          }
        })
    }
    catch (error: any) {
      console.log(error)
      return error;
    }
  }, [Execute, KnowledgeAPI.endpointGroup, expandGroup, loadAllGroupRows, loadTopRows, workspace]);


  const deleteGroupVariation = async (groupKey: IGroupKey, variationName: string) => {
    try {
      console.log("Deleting Group Tag...", { groupKey, variationName });
      // const group = await dbp!.get('Groups', id);
      // const obj: IGroup = {
      //   ...group,
      //   variations: group.variations.filter((variation: string) => variation !== variationName),
      //   modified: {
      //     Time: new Date(),
      //     by: {
      //       nickName: globalState.authUser.nickName
      //     }
      //   }
      // }
      // POPRAVI TODO
      //updateGroup(obj, false);
      console.log("Group Tag successfully deleted");
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  };


  ////////////////////////////////////
  // Answers
  //

  const PAGE_SIZE = 12;
  const loadGroupAnswers = useCallback(async ({ groupKey, startCursor, includeAnswerId }: ILoadGroupAnswers): Promise<any> => {
    try {
      const { topId, id } = groupKey;
      dispatch({ type: ActionTypes.SET_ANSWERS_LOADING, payload: {} })
      try {
        const url = `${KnowledgeAPI.endpointAnswer}/${workspace}/${topId}/${id}/${startCursor}/${PAGE_SIZE}/${includeAnswerId}`;
        console.time()
        await Execute!("GET", url).then((groupDtoEx: IGroupDtoEx) => {
          console.timeEnd();
          const { groupDto } = groupDtoEx;
          if (groupDto !== null) {
            const group = new Group(groupDto).group;
            // const { Title, AnswerRowDtos, HasMoreAnswers } = groupDto;
            // AnswerRowDtos!.forEach((answerRowDto: IAnswerRowDto) => {
            //   if (includeAnswerId && answerRowDto.Id === includeAnswerId) {
            //     answerRowDto.Included = true;
            //   }
            //   answerRowDto.GroupTitle = Title; // TODO treba li
            //   answerRowDtos.push(answerRowDto);
            // })
            // const answerRows: IAnswerRow[] = answerRowDtos.map(dto => new AnswerRow(dto).answerRow);
            // dispatch({
            //   type: ActionTypes.GROUP_ANSWERS_LOADED,
            //   payload: { id, answerRows, hasMoreAnswers: HasMoreAnswers! }
            // });
            dispatch({
              type: ActionTypes.GROUP_ANSWERS_LOADED,
              payload: { groupRow: group }
            });
          }
        });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }
    catch (error: any) {
      console.log(error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    }
  }, [Execute, KnowledgeAPI.endpointAnswer, workspace]);


  const addAnswer = useCallback(
    async (groupKey: IGroupKey) => {
      try {
        const { topId, id } = groupKey;
        let groupRow = await getGrp(id!);
        if (!groupRow) {
          alert(`Not found ${id}. Reload all Groups`)
          return;
        }
        const newAnswerRow: IAnswerRow = {
          topId,
          parentId: groupKey.id,
          id: _generateId, // do not change
          title: 'answer text',
          groupTitle: groupRow.title,
          included: true
        }
        const answer: IAnswer = {
          ...initialAnswer,
          ...newAnswerRow,
          title: ''
        }
        // console.assert(isExpanded);
        // if (isExpanded) {
        const topRow: IGroupRow = state.topRows.find(c => c.id === topId)!;
        const grpRow: IGroupRow | undefined = await findGroupRow(topRow, id)!;
        dispatch({
          type: ActionTypes.ADD_NEW_ANSWER_TO_ROW, payload: {
            groupRow: { ...grpRow!, answerRows: [newAnswerRow, ...grpRow!.answerRows!] },
            newAnswerRow
          }
        });
        dispatch({ type: ActionTypes.SET_ANSWER, payload: { answer, formMode: FormMode.AddingAnswer } });
        //}
        // else {
        //   const expandInfo: IExpandInfo = {
        //     groupKey,
        //     formMode: FormMode.AddingAnswer,
        //     newAnswerRow
        //   }
        //   await expandGroup(expandInfo);
        //   dispatch({ type: ActionTypes.SET_ANSWER, payload: { answer, formMode: FormMode.AddingAnswer } });
        // }

      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [expandGroup, findGroupRow, getGrp, state.topRows]);


  const createAnswer = useCallback(
    async (answer: IAnswer) => {
      const { topId, id, parentId } = answer; // title, modified, 
      // TODO
      dispatch({ type: ActionTypes.SET_LOADING_GROUP, payload: {} });
      try {
        answer.created!.nickName = nickName;
        const answerDto = new AnswerDto(answer, workspace).answerDto;
        const url = `${KnowledgeAPI.endpointAnswer}`;
        console.time()
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> createAnswer', answerDto)
        await Execute("POST", url, answerDto)
          .then(async (answerDtoEx: IAnswerDtoEx | null) => {
            console.timeEnd();
            if (answerDtoEx) {
              console.log("::::::::::::::::::::", { answerDtoEx });
              const { answerDto } = answerDtoEx;
              if (answerDto) {
                const answer = new Answer(answerDto).answer;
                answer.topId = topId;
                console.log('Answer successfully created')
                //dispatch({ type: ActionTypes.CLOSE_ANSWER_FORM })
                await loadAllGroupRows() // numOfAnswers changed
                  .then(async () => {
                    const parentGroupKey: IGroupKey = { topId, parentId, id: parentId! };
                    const expandInfo: IExpandInfo = {
                      groupKey: parentGroupKey,
                      formMode: FormMode.EditingAnswer
                    }
                    await expandGroup(expandInfo).then(() => {
                      dispatch({ type: ActionTypes.SET_ANSWER, payload: { formMode: FormMode.EditingAnswer, answer } });
                    });
                  })
              }
            }
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [Execute, KnowledgeAPI.endpointAnswer, expandGroup, loadAllGroupRows, nickName, workspace]);


  const updateAnswer = useCallback(
    async (oldParentId: string, answer: IAnswer, groupChanged: boolean) => {
      const { id } = answer; // , title, modified, parentId
      // dispatch({ type: ActionTypes.SET_GROUP_LOADING, payload: { id: parentId!, loading: false } });
      try {
        answer.modified!.nickName = nickName;
        const answerDto = new AnswerDto(answer, workspace).answerDto;
        const url = `${KnowledgeAPI.endpointAnswer}`;
        console.time()
        answerDto.oldParentId = oldParentId;
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> updateAnswer', answerDto)
        let answerRet: IAnswer | null = null;
        await Execute("PUT", url, answerDto)
          .then(async (answerDtoEx: IAnswerDtoEx) => {
            console.timeEnd();
            const { answerDto, msg } = answerDtoEx;
            if (answerDto) {
              answerRet = new Answer(answerDto).answer!;
              console.log('Answer successfully updated: ', answerRet)
              const { topId, parentId } = answerRet;
              if (groupChanged) {
                // nema koristi
                // dispatch({ type: ActionTypes.SET_ANSWER, payload: { answer: answerRet } })
                const { topId, parentId, id } = answerRet;
                const keyExpanded: IKeyExpanded = {
                  topId,
                  groupId: parentId!,
                  answerId: id
                }
                dispatch({ type: ActionTypes.FORCE_OPEN_NODE, payload: { keyExpanded } })
              }
              else {
                const parentGroupKey: IGroupKey = { topId, parentId, id: parentId! }; // proveri
                const expandInfo: IExpandInfo = {
                  groupKey: parentGroupKey,
                  formMode: FormMode.EditingAnswer
                }
                await expandGroup(expandInfo).then(() => {
                  dispatch({ type: ActionTypes.SET_ANSWER, payload: { formMode: FormMode.EditingAnswer, answer: answerRet! } });
                });
              }
            }
            else {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
            }
          });
        return answerRet;
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [Execute, KnowledgeAPI.endpointAnswer, expandGroup, nickName, workspace]);


  const deleteAnswer = useCallback(
    async (answerRow: IAnswerRow, isActive: boolean) => {
      const { id, parentId, topId } = answerRow;
      dispatch({ type: ActionTypes.SET_LOADING_ANSWER, payload: {} });
      try {
        const answerDto = new AnswerRowDto(answerRow, workspace).answerRowDto;
        const url = `${KnowledgeAPI.endpointAnswer}`;
        console.time()
        await Execute("DELETE", url, answerDto)
          .then(async (answerDtoEx: IAnswerDtoEx) => {
            const { answerDto } = answerDtoEx;
            console.timeEnd();
            if (answerDto) {
              const answer = new Answer(answerDto).answer;
              console.log('Answer successfully deleted')
              if (isActive) {
                dispatch({ type: ActionTypes.ANSWER_DELETED, payload: { answer } });
              }
              /*
              //dispatch({ type: ActionTypes.CLOSE_ANSWER_FORM })
              await loadAndCacheAllGroupRows(); // reload
              */
              const parentGroupKey: IGroupKey = { topId, parentId, id: parentId! }; // proveri
              const expandInfo: IExpandInfo = {
                groupKey: parentGroupKey,
                formMode: FormMode.None
              }
              await expandGroup(expandInfo).then(() => {
                // dispatch({ type: ActionTypes.SET_GROUP, payload: { groupRow: group } }); // IGroup extends IGroup Row
              })
            }
            else {
              console.error(answerDtoEx);
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
            }
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [Execute, KnowledgeAPI.endpointAnswer, expandGroup, workspace]);


  const getAnswer = useCallback(
    async (answerKey: IAnswerKey): Promise<any> => {
      return new Promise(async (resolve) => {
        try {
          const query = new AnswerKey(answerKey).toQuery(workspace);
          const url = `${KnowledgeAPI.endpointAnswer}?${query}`;
          console.time()
          console.log('getAnswer', answerKey)
          await Execute("GET", url)
            .then((answerDtoEx: IAnswerDtoEx) => {
              console.timeEnd();
              const { answerDto, msg } = answerDtoEx;
              if (answerDto) {
                const answerEx: IAnswerEx = {
                  answer: new Answer(answerDto).answer,
                  msg
                }
                resolve(answerEx);
              }
              else {
                const answerEx: IAnswerEx = {
                  answer: null,
                  msg
                }
                resolve(answerEx);
              }
              //}
            });
        }
        catch (error: any) {
          console.log(error);
          const answerEx: IAnswerEx = {
            answer: null,
            msg: "Problemos"
          }
          resolve(answerEx);
        }
      })
    }, [Execute, KnowledgeAPI.endpointAnswer, workspace]);


  const viewAnswer = useCallback(async (answerRow: IAnswerRow) => {
    const answerKey = new AnswerKey(answerRow).answerKey;
    dispatch({ type: ActionTypes.SET_LOADING_ANSWER, payload: {} });
    const answerEx: IAnswerEx = await getAnswer(answerKey!);
    if (formMode === FormMode.AddingAnswer) {
      await cancelAddAnswer();
    }
    else if (formMode === FormMode.AddingGroup) {
      await cancelAddGroup();
    }
    const { answer, msg } = answerEx;
    if (answer) {
      answer.topId = answerRow.topId;
      dispatch({ type: ActionTypes.SET_ANSWER_TO_VIEW, payload: { answer } });
    }
    else
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
  }, [cancelAddGroup, cancelAddAnswer, formMode, getAnswer]);


  // const editAnswer = useCallback(async (answerRow: IAnswerRow) => {
  //   const answerKey: IAnswerKey = new AnswerKey(answerRow).answerKey!;
  //   if (formMode === FormMode.AddingAnswer) {
  //     await cancelAddAnswer();
  //   }
  //   else if (formMode === FormMode.AddingGroup) {
  //     await cancelAddGroup();
  //   }
  //   dispatch({ type: ActionTypes.SET_LOADING_ANSWER, payload: {} });
  //   console.log("editAnswer:", answerKey)
  //   const answer = initialAnswer;
  //   if (answer) {
  //     // we don't reload groupRows, just use isSelected from activeAnswer
  //     answer.topId = answerRow.topId;
  //     dispatch({ type: ActionTypes.SET_ANSWER_TO_EDIT, payload: { answer } });
  //   }
  // }, [cancelAddGroup, cancelAddAnswer, formMode]);


  const editAnswer = useCallback(async (answerRow: IAnswerRow) => {
    const answerKey: IAnswerKey = new AnswerKey(answerRow).answerKey!;
    if (formMode === FormMode.AddingAnswer) {
      await cancelAddAnswer();
    }
    else if (formMode === FormMode.AddingGroup) {
      await cancelAddGroup();
    }
    dispatch({ type: ActionTypes.SET_LOADING_ANSWER, payload: {} });
    console.log("editAnswer:", answerKey)
    const answerEx: IAnswerEx = await getAnswer(answerKey!);
    const { answer, msg } = answerEx;
    if (answer) {
      // we don't reload groupRows, just use isSelected from activeAnswer
      answer.topId = answerRow.topId;

      // const topRow: IGroupRow = state.topRows.find(c => c.id === answerRow.topId)!;
      // const groupRow: IGroupRow = findGroupRow(topRow, answerRow.parentId)!;
      //dispatch({ type: ActionTypes.SET_ANSWER_TO_EDIT, payload: { groupRow, answer } });
      dispatch({ type: ActionTypes.CLOSE_ANSWER_FORM, payload: { answer } }); // to reset AnswerForm
      dispatch({ type: ActionTypes.SET_ANSWER_TO_EDIT, payload: { answer } });
    }
    else
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
  }, [cancelAddGroup, cancelAddAnswer, formMode, getAnswer]);



  // const onGroupIdChanged = useCallback(
  //   async (topId: string, id: string): Promise<void> => {
  //     const topRow: IGroupRow = topRows.find(c => c.id === topId)!;
  //     console.log('Provider onGroupIdChanged >>>>>>:', topRow)
  //     const groupRow: IGroupRow | undefined = await findGroupRow(topRow, _generateId);
  //     console.log('Provider onGroupIdChanged >>>>>>:', groupRow, id)
  //     groupRow!.id = id;
  //     dispatch({ type: ActionTypes.RE_RENDER_TREE, payload: { groupRow: groupRow! } });
  //   }, [findGroupRow, topRows]);

  const onGroupTitleChanged = useCallback(
    async (topId: string, id: string, title: string): Promise<void> => {
      const topRow: IGroupRow = topRows.find(c => c.id === topId)!;
      let groupRow: IGroupRow | undefined = await findGroupRow(topRow, id);
      console.log('PROVIDER onGroupTitleChanged::', groupRow!.title, title)
      if (groupRow!.title !== title) {
        groupRow!.title = title === '' ? 'New Category' : title; // to avoid empty title
        dispatch({
          type: ActionTypes.RE_RENDER_TREE, payload: {} //categoryRow: categoryRow! }
        });
      }
      return;
    }, [findGroupRow, topRows]);

  const onAnswerTitleChanged = useCallback(
    async (topId: string, id: string, title: string): Promise<void> => {
      const topRow: IGroupRow = topRows.find(c => c.id === topId)!;
      let groupRow: IGroupRow | undefined = await findGroupRow(topRow, id);
      if (groupRow) {
        const answerRow = groupRow.answerRows!.find(a => a.id === id)!;
        if (answerRow!.title !== title) {
          answerRow.title = title === '' ? 'New Question' : title; // to avoid empty title;
          // rerender
          console.log('onAnswerTitleChanged+++>>>', id, groupRow)
          dispatch({ type: ActionTypes.ANSWER_TITLE_CHANGED, payload: { groupRow } })
        }
      }
      return;
    }, [findGroupRow, topRows]);


  const contextValue: IGroupsContext = {
    state, getSubGrps, getGrp,
    loadAllGroupRows,
    expandNodesUpToTheTree,
    loadTopRows,
    addGroup, cancelAddGroup, createGroup,
    viewGroup, editGroup, updateGroup, deleteGroup, deleteGroupVariation,
    expandGroup, collapseGroup, onGroupTitleChanged,
    loadGroupAnswers,
    addAnswer, cancelAddAnswer, createAnswer,
    viewAnswer, editAnswer, updateAnswer, deleteAnswer, onAnswerTitleChanged
  }

  if (!isAuthenticated || !allGroupRowsLoaded)  // removed keyExpanded === null
    return null;

  return (
    <GroupsContext.Provider value={contextValue}>
      <GroupDispatchContext.Provider value={dispatch}>
        {children}
      </GroupDispatchContext.Provider>
    </GroupsContext.Provider>
  );
}

export function useGroupContext() {
  return useContext(GroupsContext);
}

export const useGroupDispatch = () => {
  return useContext(GroupDispatchContext)
};

