
import { type Reducer } from 'react'
import type { IGlobalState, GlobalActions, IAuthUser, ILocStorage } from "./types";
import { ROLES, GlobalActionTypes, } from "./types";

export const initialAuthUser: IAuthUser = {
    nickName: '',
    name: '',
    email: '',
    color: 'blue',
    role: ROLES.VIEWER
}



export const GlobalReducer: Reducer<IGlobalState, GlobalActions> = (state, action) => {
    const newState = reducer(state, action);
    const aTypesToStore = [
        GlobalActionTypes.AUTHENTICATE,
        GlobalActionTypes.DARK_MODE,
        GlobalActionTypes.LIGHT_MODE,
        GlobalActionTypes.UN_AUTHENTICATE,
        GlobalActionTypes.SET_LAST_ROUTE_VISITED
    ];
    if (aTypesToStore.includes(action.type)) {
        const { authUser, everLoggedIn, isDarkMode, variant, bg, lastRouteVisited } = newState;
        const { nickName } = authUser;
        const obj: ILocStorage = {
            nickName,
            everLoggedIn,
            isDarkMode,
            variant,
            bg,
            lastRouteVisited
        }
        localStorage.setItem('GLOBAL_STATE', JSON.stringify(obj));
    }

    console.log('==============================================================================')
    console.log('=========================' + action.type + '=======================================')
    console.log('==============================================================================')
    return newState;
}

const reducer: Reducer<IGlobalState, GlobalActions> = (state, action) => {
    const str = action.type
    switch (action.type) {

        case GlobalActionTypes.SET_LOADING:
            return {
                ...state,
                loading: true
            }

        case GlobalActionTypes.SET_FROM_LOCAL_STORAGE: {
            const { locStorage } = action.payload;
            return {
                ...state,
                ...locStorage
            }
        }

        case GlobalActionTypes.SET_ERROR: {
            const { error } = action.payload;
            return {
                ...state,
                error,
                loading: false
            };
        }

        case GlobalActionTypes.AUTHENTICATE: {
            console.log('GlobalActionTypes.AUTHENTICATE', action.payload)
            const { user } = action.payload;
            const { nickName, name, workspace } = user;
            return {
                ...state,
                authUser: {
                    nickName,
                    name,
                    email: '',
                    color: 'blue',
                    everLoggedIn: true,
                },
                workspace,
                canEdit: true, //user.parentRole !== ROLES.VIEWER,
                isOwner: true, //user.parentRole === ROLES.OWNER,
                isAuthenticated: true,
                everLoggedIn: true,
                error: undefined
            };
        }

        case GlobalActionTypes.UN_AUTHENTICATE: {
            return {
                ...state,
                isAuthenticated: false,
                everLoggedIn: false,
                authUser: initialAuthUser,
                isOwner: false
            };
        }

        case GlobalActionTypes.LIGHT_MODE:
            return { ...state, isDarkMode: false, variant: 'light', bg: 'light' };

        case GlobalActionTypes.DARK_MODE:
            return { ...state, isDarkMode: true, variant: 'dark', bg: 'dark' };

        case GlobalActionTypes.SET_LAST_ROUTE_VISITED: {
            const { lastRouteVisited } = action.payload;
            return {
                ...state,
                lastRouteVisited
            };
        }

        case GlobalActionTypes.SET_ALL_CATEGORY_ROWS_GLOBAL: {
            const { allCategoryRows } = action.payload;
            return {
                ...state,
                allCategoryRowsGlobal: allCategoryRows,
                allCategoryRowsGlobalLoaded: Date.now()
            };
        }

        case GlobalActionTypes.SET_ALL_GROUP_ROWS_GLOBAL: {
            const { allGroupRows } = action.payload;
            return {
                ...state,
                allGroupRows,
                allGroupRowsLoaded: Date.now()
            };
        }

        case GlobalActionTypes.SET_TOP_ROWS_LOADING:
              return {
                ...state,
                topRowsLoading: true,
                topRowsLoaded: false
              }
        
            case GlobalActionTypes.SET_TOP_ROWS: {
              const { topRows } = action.payload;
              //console.log('=> CategoriesReducer ActionTypes.SET_TOP_ROWS', state.topRows, topRows)
              return {
                ...state,
                topRows,
                topRowsLoading: false,
                topRowsLoaded: true
              };
            }

        case GlobalActionTypes.SET_NODES_RELOADED: {
            return {
                ...state,
                nodesReLoaded: true
            };
        }


        default: {
            throw Error('Unknown action: ' + str);
        }
    }
};

