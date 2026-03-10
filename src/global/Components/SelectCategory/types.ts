import type { ICategoryKey, ICategoryRow } from '@/categories/types';


/////////////////////////////////////////////////////////////////////////
// DropDown Select Category

export interface ICatState {
	loading: boolean,
	parentId: string | null,
	title: string,
	cats: ICategoryRow[], // drop down categories
	error?: Error;
}

export interface ICatInfo {
	selId: string | null;
	categoryKey: ICategoryKey | null,
	level: number,
	setParentId: (cat: ICategoryRow) => void;
}

export enum CatActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_CATS = 'SET_SUB_CATS',
	SET_ERROR = 'SET_ERROR',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_PARENT_CAT = 'SET_PARENT_CAT'
}



