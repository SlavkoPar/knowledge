import type { IGroupKey, IGroupRow } from '@/groups/types';

import type { ActionMap } from "@/global/types";

/////////////////////////////////////////////////////////////////////////
// DropDown Select Group

export interface IGrpState {
	parentId: string | null,
	title: string,
	grps: IGroupRow[], // drop down groups
	error?: Error;
}

export interface IGrpInfo {
	selId: string | null;
	groupKey: IGroupKey | null,
	level: number,
	setParentId: (cat: IGroupRow) => void;
	allGroupRows?: Map<string, IGroupRow>;
}

export enum GrpActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_GRPS = 'SET_SUB_GRPS',
	SET_ERROR = 'SET_ERROR',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_PARENT_CAT = 'SET_PARENT_CAT'
}

export type GrpsPayload = {
	[GrpActionTypes.SET_LOADING]: false;

	[GrpActionTypes.SET_SUB_GRPS]: {
		subGrps: IGroupRow[];
	};

	[GrpActionTypes.SET_EXPANDED]: {
		id: string;
		expanding: boolean;
	}

	[GrpActionTypes.SET_ERROR]: {
		error: Error;
	};

	[GrpActionTypes.SET_PARENT_CAT]: {
		cat: IGroupRow;
	};

};

export type GrpsActions =
	ActionMap<GrpsPayload>[keyof ActionMap<GrpsPayload>];



export type GrpActions = ActionMap<GrpsPayload>[keyof ActionMap<GrpsPayload>];

export interface INavigatorMethods {
	resetNavigator: () => void;
	//loadSubTree: (categoryRow: ICategoryRow | null) => void;
}

export interface IRow {
	topId: string;
	id: string;
	parentId: string | null; // it is null for Top Categories
	level: number;
	title: string;
	hasSubCategories: boolean;
	numOfQuestions: number,
	subRows: IRow[];
}
