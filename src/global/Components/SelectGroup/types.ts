import type { IGroupKey, IGroupRow } from '@/groups/types';


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
