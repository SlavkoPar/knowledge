import { type ActionMap, type IRecord, Dto2WhoWhen, WhoWhen2Dto, type IDtoKey } from '@/global/types';

export enum FormMode {
	None = 'None',

	AddingGroup = 'AddingGroup',
	ViewingGroup = 'ViewingGroup',
	EditingGroup = 'EditingGroup',
	DeletingGroup = 'DeletingGroup',

	AddingAnswer = 'AddingAnswer',
	ViewingAnswer = 'ViewingAnswer',
	EditingAnswer = 'EditingAnswer',
	DeletingAnswer = 'DeletingAnswer',

	AddingVariation = 'AddingVariation',
	EditingVariation = 'EditingVariation',
	ViewingVariation = 'ViewingVariation'
}


export interface IGroupRowDto extends IDtoKey {
	Kind: number;
	Title: string;
	Link: string | null;
	Header: string;
	Variations: string[];
	Level: number;
	HasSubGroups: boolean;
	RowDtos: IGroupRowDto[];
	NumOfAnswers: number;
	AnswerRowDtos?: IAnswerRowDto[];
	HasMoreAnswers?: boolean;
	IsExpanded?: boolean;
}

export interface IGroupDto extends IGroupRowDto {
	Doc1: string;
}


export interface IGroupKey {
	topId: string,
	id: string;
	parentId: string | null;
}

export interface IKeyExpanded {
	topId: string,
	groupId: string;
	answerId: string | null;
}

export interface IGroupRow extends IGroupKey, IRecord {
	kind: number;
	title: string;
	link: string | null;
	header: string;
	level: number;
	hasSubGroups: boolean;
	groupRows: IGroupRow[];
	variations: string[];
	numOfAnswers: number;
	answerRows: IAnswerRow[];
	hasMoreAnswers?: boolean;
	isExpanded?: boolean;
	titlesUpTheTree?: string;
}
export interface IGroup extends IGroupRow {
	doc1: string, // some document optionally, used in Group, but not not in GroupRow
}

export class GroupRowDto {
	constructor(groupRow: IGroupRow, Workspace: string) {
		const { topId, id, parentId, modified } = groupRow;
		this.groupRowDto = {
			Workspace,
			TopId: topId,
			Id: id,
			ParentId: parentId,
			Title: '',
			Link: '',
			Header: '',
			Variations: [],
			// TODO proveri []
			HasSubGroups: false,
			RowDtos: [],
			NumOfAnswers: 0,
			AnswerRowDtos: [],
			Level: 0,
			Kind: 0,
			Modified: modified ? new WhoWhen2Dto(modified).whoWhenDto! : undefined
		}
	}
	groupRowDto: IGroupRowDto;
}

export class GroupRow {

	constructor(groupRowDto: IGroupRowDto) {
		const { TopId, Id, ParentId, Kind, Title, Link, Header, Variations, Level,
			HasSubGroups, RowDtos,
			NumOfAnswers, AnswerRowDtos,
			IsExpanded } = groupRowDto;
		this.groupRow = {
			topId: TopId,
			id: Id,
			parentId: ParentId ?? null,
			title: Title,
			link: Link,
			header: Header,
			titlesUpTheTree: '', // traverse up the tree, until root
			variations: Variations,
			hasSubGroups: HasSubGroups, //!, Odakle ovo
			groupRows: RowDtos
				? RowDtos.map(dto => new GroupRow({ ...dto, TopId }).groupRow)
				: [],
			numOfAnswers: NumOfAnswers,
			answerRows: AnswerRowDtos
				? AnswerRowDtos.map(dto => new AnswerRow({ ...dto, TopId: TopId ?? undefined }).answerRow)
				: [],
			level: Level,
			kind: Kind,
			isExpanded: IsExpanded
		}
	}
	groupRow: IGroupRow;
}


/////////////////////////////////////
// Answer
export interface IAnswerDtoKey {
	Workspace?: string;
	TopId: string,
	ParentId?: string;
	Id: string;
}


export interface IAnswerKey {
	topId: string,
	parentId: string;
	id: string;
}


export interface IAnswerRow extends IAnswerKey, IRecord {
	title: string;
	groupTitle?: string;
	included: boolean;
}

export interface IAnswer extends IAnswerRow {
	source: number;
	status: number;
	groupTitle?: string;
}



export interface IAnswerKeyDto {
	Workspace?: string;
	TopId: string,
	ParentId: string | null;
	Id: string;
}

export class AnswerKeyDto {
	constructor(key: IAnswerKey, Workspace: string) { //, parentId: string) {
		const { topId, parentId, id } = key;
		this.dto = {
			Workspace,
			TopId: topId,
			ParentId: parentId,
			Id: id
		}
	}
	dto: IAnswerKeyDto
}


export const _generateId = 'generateId';


export interface IVariation {
	name: string;
}

// IGroup rather than IGroupRow
export const IsGroup = (obj: any): boolean => typeof obj === 'object' && obj !== null &&
	obj.hasOwnProperty('doc1') && typeof obj.doc1 === 'string';



export class AnswerRow {
	constructor(rowDto: IAnswerRowDto) { //, parentId: string) {
		const { TopId, ParentId, Id, Title, GroupTitle, Created, Modified, Included } = rowDto;
		this.answerRow = {
			topId: TopId,
			parentId: ParentId ?? '',
			id: Id,
			title: Title,
			groupTitle: GroupTitle,
			created: new Dto2WhoWhen(Created!).whoWhen,
			modified: Modified
				? new Dto2WhoWhen(Modified).whoWhen
				: undefined,
			included: Included ?? false
			//isSelected: Included
		}
	}
	answerRow: IAnswerRow
}

export class AnswerRowDto {
	constructor(row: IAnswerRow, Workspace: string) { //, parentId: string) {
		const { topId, parentId, id, created, modified, included } = row;
		this.answerRowDto = {
			Workspace,
			TopId: topId,
			ParentId: parentId ?? '',
			Id: id,
			Title: '',
			GroupTitle: '',
			Created: new WhoWhen2Dto(created!).whoWhenDto!,
			Modified: new WhoWhen2Dto(modified).whoWhenDto!,
			Included: included
		}
	}
	answerRowDto: IAnswerRowDto
}


export class GroupKey {
	constructor(x: IAnswerKey | IGroupRow | IGroup | IGroupKey) {
		const { topId, id, parentId } = x;
		this.groupKey = {
			topId,
			id,
			parentId
		}
	}
	groupKey: IGroupKey;
	toQuery = (workspace: string) => {
		const { topId, id, parentId } = this.groupKey;
		return [
			`grpKey.workspace=${encodeURIComponent(workspace)}`,
			`grpKey.topId=${encodeURIComponent(topId)}`,
			`grpKey.id=${encodeURIComponent(id)}`,
			`grpKey.parentId=${encodeURIComponent(parentId ?? 'null')}`
		].join('&')
	};
}



export class Group {
	constructor(dto: IGroupDto) {
		const { TopId, Id, ParentId, Kind, Title, Link, Header, Level, Variations, NumOfAnswers,
			HasSubGroups, RowDtos, Created, Modified, AnswerRowDtos, IsExpanded, Doc1 } = dto;

		const groupRows = RowDtos
			? RowDtos.map((rowDto: IGroupRowDto) => new GroupRow(rowDto).groupRow)
			: [];

		const answerRows = AnswerRowDtos
			? AnswerRowDtos.map((dto: IAnswerDto) => new Answer(dto).answer)
			: [];

		this.group = {
			topId: TopId,
			id: Id,
			parentId: ParentId ?? null,
			kind: Kind,
			title: Title,
			link: Link,
			header: Header,
			level: Level!,
			variations: Variations ?? [],
			hasSubGroups: HasSubGroups!,
			groupRows,
			created: new Dto2WhoWhen(Created!).whoWhen,
			modified: Modified
				? new Dto2WhoWhen(Modified).whoWhen
				: undefined,
			numOfAnswers: NumOfAnswers!,
			answerRows: answerRows ?? [],
			isExpanded: IsExpanded === true,
			doc1: Doc1
		}
	}
	group: IGroup;
}

export class GroupDto {
	constructor(group: IGroup, Workspace: string) {
		const { topId, id, parentId, kind, title, link, header, level, variations, created, modified, doc1 } = group;
		this.groupDto = {
			Workspace,
			TopId: topId,
			Id: id,
			Kind: kind,
			ParentId: parentId,
			Title: title,
			Link: link,
			Header: header ?? '',
			Level: level,
			HasSubGroups: true,
			RowDtos: [],
			NumOfAnswers: 0,
			AnswerRowDtos: [],
			Variations: variations,
			Created: new WhoWhen2Dto(created).whoWhenDto!,
			Modified: new WhoWhen2Dto(modified).whoWhenDto!,
			Doc1: doc1
		}
	}
	groupDto: IGroupDto;
}

// dupliakt, ima u AnswerProvideru
export class Answer {
	constructor(dto: IAnswerDto) { //, parentId: string) {

		// TODO possible to call base class construtor
		this.answer = {
			topId: dto.TopId, // TODO will be set later
			parentId: dto.ParentId ?? '',
			id: dto.Id,
			title: dto.Title,
			groupTitle: dto.GroupTitle,
			source: dto.Source ?? 0,
			status: dto.Status ?? 0,
			included: dto.Included !== undefined,
			created: new Dto2WhoWhen(dto.Created!).whoWhen,
			modified: dto.Modified
				? new Dto2WhoWhen(dto.Modified).whoWhen
				: undefined
		}
	}
	answer: IAnswer
}

export class AnswerKey {
	constructor(answer: IAnswerRow | IAnswer | IAnswerKey) { //| undefined) {
		this.answerKey = {
			topId: answer.topId,
			parentId: answer.parentId ?? null,
			id: answer.id
		}
	}
	answerKey: IAnswerKey;
	toQuery = (workspace: string) => {
		const { topId, parentId, id } = this.answerKey;
		return [
			`qKey.workspace=${encodeURIComponent(workspace)}`,
			`qKey.topId=${encodeURIComponent(topId)}`,
			`qKey.parentId=${encodeURIComponent(parentId ?? 'null')}`,
			`qKey.id=${encodeURIComponent(id)}`
		].join('&')
	};
}

export class AnswerDto {
	constructor(answer: IAnswer, Workspace: string) {
		const { topId, parentId, id, title, source, status, created, modified } = answer;
		this.answerDto = {
			Workspace,
			TopId: topId,
			ParentId: parentId ?? 'null',  // TODO proveri
			Id: id,
			Title: title,
			Source: source,
			Status: status,
			Created: new WhoWhen2Dto(created).whoWhenDto!,
			Modified: new WhoWhen2Dto(modified).whoWhenDto!
		}
	}
	answerDto: IAnswerDto;
}

export interface IAnswerRowDto extends IDtoKey {
	Title: string;
	GroupTitle?: string;
	Included?: boolean;
	Source?: number;
	Status?: number;
}

export interface IAnswerRowDtosEx {
	answerRowDtos: IAnswerRowDto[];
	msg: string;
}

export interface IAnswerDto extends IAnswerRowDto {
	oldParentId?: string;
}

export interface IAnswerDtoEx {
	answerDto: IAnswerDto | null;
	msg: string;
}

export interface IAnswerEx {
	answer: IAnswer | null;
	msg: string;
}


export interface IAnswersMore {
	answers: IAnswerDto[];
	hasMoreAnswers: boolean;
}



export interface IGroupDtoEx {
	groupDto: IGroupDto | null;
	msg: string;
}

export interface IGroupRowDtoEx {
	groupRowDto: IGroupRowDto | null;
	msg: string;
}


export interface IGroupDtoListEx {
	groupDtoList: IGroupDto[];
	msg: string;
}


export interface IGroupInfo {
	groupKey: IGroupKey;
	level: number
}

export interface IExpandInfo {
	groupKey: IGroupKey;
	formMode?: FormMode;
	includeAnswerId?: string;
	newGroupRow?: IGroupRow;
	newAnswerRow?: IAnswerRow;
	byClick?: boolean;
}


export interface IParentInfo {
	//execute?: (method: string, endpoint: string) => Promise<any>,
	// topId: string | null,
	// parentId: string | null,
	//groupKey: IGroupKey,
	groupRow: IGroupRow,
	startCursor?: number,
	includeAnswerId?: string | null
	level?: number,
	//title: string, // to easier follow getting the list of sub-groups
	inAdding?: boolean,
	isExpanded?: boolean
	//subGroups?: IGroup[]
}

export interface IGroupsState {
	formMode: FormMode;
	topRows: IGroupRow[];
	allGroupRows: Map<string, IGroupRow>;
	allGroupRowsLoaded?: number;
	topRowsLoading: boolean;
	topRowsLoaded: boolean;
	keyExpanded: IKeyExpanded | null; // IGroupKey + answerId
	groupId_answerId_done?: string;
	nodeOpening: boolean;
	nodeOpened: boolean;
	rowExpanding: boolean;
	rowExpanded: boolean;
	activeGroup: IGroup | null;
	activeAnswer: IAnswer | null;
	selectedAnswerId: string | null;
	loadingGroups: boolean,
	loadingAnswers: boolean,
	loadingGroup: boolean, groupLoaded: boolean,
	loadingAnswer: boolean, answerLoaded: boolean,
	error?: Error;
	whichRowId?: string; // group.id or answer.id
}

export interface ILocStorage {
	keyExpanded: IKeyExpanded | null
}

export interface ILoadGroupAnswers {
	groupKey: IGroupKey,
	startCursor: number,
	includeAnswerId: string | null
}

export interface IGroupsContext {
	state: IGroupsState,
	loadAllGroupRows: () => Promise<Map<string, IGroupRow> | null>
	getGrp: (id: string) => Promise<IGroupRow | undefined>;
	expandNodesUpToTheTree: (grpKey: IGroupKey, answerId: string | null, fromChatBotDlg?: boolean) => Promise<boolean>;
	loadTopRows: () => Promise<any>,
	addGroup: (parentGroupRow: IGroupRow | null) => Promise<any>;
	cancelAddGroup: () => Promise<any>;
	createGroup: (group: IGroup) => void,
	viewGroup: (groupRow: IGroupRow, includeAnswerId: string) => void,
	editGroup: (groupRow: IGroupRow, includeAnswerId: string) => void,
	updateGroup: (group: IGroup, closeForm: boolean) => void,
	deleteGroup: (groupRow: IGroupRow) => void,
	deleteGroupVariation: (groupKey: IGroupKey, name: string) => void,
	expandGroup: (expandInfo: IExpandInfo) => Promise<any>,
	collapseGroup: (groupRow: IGroupRow) => void,
	// findGroup: (groupRows: IGroupRow[], id: string) => IGroupRow | undefined;
	onGroupTitleChanged: (topId: string, id: string, title: string) => Promise<void>;
	//////////////
	// answers
	loadGroupAnswers: (catParams: ILoadGroupAnswers) => void;  //(parentInfo: IParentInfo) => void,
	getSubGrps: (groupId: string | null) => Promise<any>;
	addAnswer: (groupKey: IGroupKey, isExpanded: boolean) => Promise<any>;
	cancelAddAnswer: () => Promise<any>;
	createAnswer: (answer: IAnswer, fromModal: boolean) => Promise<any>;
	viewAnswer: (answerRow: IAnswerRow) => void;
	editAnswer: (answerRow: IAnswerRow) => void;
	updateAnswer: (oldParentId: string, answer: IAnswer, groupChanged: boolean) => Promise<any>;
	deleteAnswer: (answerRow: IAnswerRow, isActive: boolean) => void;
	onAnswerTitleChanged: (topId: string, id: string, title: string) => Promise<void>;
}

export interface IGroupFormProps {
	inLine: boolean;
	group: IGroup;
	answerId: string | null;
	formMode: FormMode;
	cancel: () => void,
	close: () => void,
	submitForm: (group: IGroup) => void,
	children: string
}

export interface IAnswerFormProps {
	answer: IAnswer;
	closeModal?: () => void;
	submitForm: (answer: IAnswer) => void,
	showCloseButton: boolean;
	source: number,
	children: string
}



export enum ActionTypes {
	SET_KEY_EXPANDED = "SET_KEY_EXPANDED",
	SET_TOP_ROWS = 'SET_TOP_ROWS',
	SET_NODE_EXPANDED_UP_THE_TREE = "SET_NODE_EXPANDED_UP_THE_TREE",
	SET_LOADING_GROUPS = 'SET_LOADING_GROUPS',
	SET_LOADING_GROUP = 'SET_LOADING_GROUP',
	SET_LOADING_ANSWER = 'SET_LOADING_ANSWER',
	SET_TOP_ROWS_LOADING = 'SET_TOP_ROWS_LOADING',
	SET_ANSWERS_LOADING = 'SET_ANSWERS_LOADING',
	SET_SUB_GROUPS = 'SET_SUB_GROUPS',
	SET_GROUP_ERROR = 'SET_GROUP_ERROR',
	ADD_SUB_GROUP = 'ADD_SUB_GROUP',
	SET_ERROR = 'SET_ERROR',
	RE_RENDER_TREE = 'RE_RENDER_TREE',
	CANCEL_ADD_GROUP = 'CANCEL_ADD_GROUP',
	SET_GROUP = 'SET_GROUP',
	//SET_GROUP_ROW = 'SET_GROUP_ROW',
	ADD_NEW_ANSWER_TO_ROW = 'ADD_NEW_ANSWER_TO_ROW',
	SET_ROW_EXPANDING = 'SET_ROW_EXPANDING',
	SET_ROW_EXPANDED = 'SET_ROW_EXPANDED',
	SET_ROW_COLLAPSING = 'SET_ROW_COLLAPSING',
	SET_ROW_COLLAPSED = 'SET_ROW_COLLAPSED',
	SET_GROUP_TO_ADD_TOP = 'SET_GROUP_TO_ADD_TOP',
	SET_GROUP_TO_ADD = 'SET_GROUP_TO_ADD',
	SET_GROUP_ADDED = 'SET_GROUP_ADDED',
	SET_ALL_GROUP_ROWS = 'SET_ALL_GROUP_ROWS',

	SET_GROUP_TO_VIEW = 'SET_GROUP_TO_VIEW',
	SET_GROUP_TO_EDIT = 'SET_GROUP_TO_EDIT',
	SET_GROUP_UPDATED = 'SET_GROUP_UPDATED',
	GROUP_DELETED = 'GROUP_DELETED',

	RESET_GROUP_ANSWER_DONE = 'RESET_GROUP_ANSWER_DONE',

	CLOSE_GROUP_FORM = 'CLOSE_GROUP_FORM',
	CANCEL_GROUP_FORM = 'CANCEL_GROUP_FORM',

	SET_NODE_EXPANDING_UP_THE_TREE = "SET_NODE_EXPANDING_UP_THE_TREE",
	FORCE_OPEN_NODE = "FORCE_OPEN_NODE",

	// answers
	GROUP_ANSWERS_LOADED = 'GROUP_ANSWERS_LOADED',
	ADD_ANSWER = 'ADD_ANSWER',
	ANSWER_TITLE_CHANGED = 'ANSWER_TITLE_CHANGED',

	CANCEL_ADD_ANSWER = 'CANCEL_ADD_ANSWER',
	SET_ANSWER_TO_VIEW = 'SET_ANSWER_TO_VIEW',
	SET_ANSWER_TO_EDIT = 'SET_ANSWER_TO_EDIT',

	SET_ANSWER_SELECTED = 'SET_ANSWER_SELECTED',
	SET_ANSWER = 'SET_ANSWER',
	SET_ANSWER_AFTER_ASSIGN_ANSWER = 'SET_ANSWER_AFTER_ASSIGN_ANSWER',
	ANSWER_DELETED = 'ANSWER_DELETED',

	CLOSE_ANSWER_FORM = 'CLOSE_ANSWER_FORM',
	CANCEL_ANSWER_FORM = 'CANCEL_ANSWER_FORM'
}

export const actionStoringToLocalStorage = [
	ActionTypes.SET_KEY_EXPANDED,
	ActionTypes.SET_ROW_EXPANDED,
	ActionTypes.SET_ROW_COLLAPSED,
	ActionTypes.SET_GROUP_ADDED,
	ActionTypes.SET_GROUP_TO_VIEW,
	ActionTypes.SET_GROUP_TO_EDIT,
	ActionTypes.SET_ANSWER_TO_VIEW,
	ActionTypes.SET_ANSWER_TO_EDIT
];

export const doNotModifyTree = [
	//ActionTypes.SET_TOP_ROWS_LOADING,
	//ActionTypes.SET_TOP_ROWS,
	ActionTypes.SET_NODE_EXPANDING_UP_THE_TREE,
	//ActionTypes.SET_NODE_OPENED,
	//ActionTypes.SET_GROUP_TO_ADD,
	//ActionTypes.SET_GROUP_UPDATED,
	ActionTypes.ADD_NEW_ANSWER_TO_ROW,
	ActionTypes.CANCEL_GROUP_FORM,
	ActionTypes.CLOSE_GROUP_FORM,
	ActionTypes.CANCEL_ADD_GROUP
]

export const doNotCallInnerReducerActions = [
	ActionTypes.RE_RENDER_TREE,
	ActionTypes.ANSWER_TITLE_CHANGED
]

export type Payload = {

	[ActionTypes.SET_KEY_EXPANDED]: {
		groupRow?: IGroupRow;
		keyExpanded: IKeyExpanded | null;
	}

	[ActionTypes.SET_TOP_ROWS_LOADING]: {
		groupRow?: IGroupRow;
	}

	[ActionTypes.SET_LOADING_GROUPS]: {
		groupRow?: IGroupRow;
	}

	[ActionTypes.SET_LOADING_GROUP]: {
		groupRow?: IGroupRow;
	}

	[ActionTypes.SET_LOADING_ANSWER]: {
		groupRow?: IGroupRow;
	}

	[ActionTypes.SET_ANSWERS_LOADING]: {
		groupRow?: IGroupRow;
	}

	[ActionTypes.SET_NODE_EXPANDING_UP_THE_TREE]: {
		groupRow?: IGroupRow;
		groupId_answerId_done: string;
		// id: string;
		// answerId: string | null
		//groupKeyExpanded: IAnswerKey
	};

	[ActionTypes.SET_NODE_EXPANDED_UP_THE_TREE]: {
		// groupNodesUpTheTree: IGroupKeyExtended[]; /// we could have used Id only
		groupRow?: IGroupRow;
		group: IGroup | null,
		formMode: FormMode,
		grpKey: IGroupKey;
		answerId: string | null,
		answer: IAnswer | null,
		fromChatBotDlg?: boolean;
	};

	[ActionTypes.FORCE_OPEN_NODE]: {
		groupRow?: IGroupRow,
		keyExpanded: IKeyExpanded
	};

	[ActionTypes.SET_TOP_ROWS]: {
		groupRow?: IGroupRow;
		topRows: IGroupRow[];
	};

	[ActionTypes.SET_SUB_GROUPS]: {
		groupRow?: IGroupRow;
		id: string | null;
		groupRows: IGroupRow[];
	};

	[ActionTypes.ADD_SUB_GROUP]: {
		groupRow?: IGroupRow;
		topId: string,
		groupKey: IGroupKey,
		level: number
	}

	[ActionTypes.SET_ALL_GROUP_ROWS]: {
		groupRow?: IGroupRow;
		allGroupRows: Map<string, IGroupRow>
	};

	[ActionTypes.RE_RENDER_TREE]: {
		groupRow?: IGroupRow;
	}

	[ActionTypes.ANSWER_TITLE_CHANGED]: {
		groupRow?: IGroupRow;
	}

	[ActionTypes.CANCEL_ADD_GROUP]: {
		groupRow?: IGroupRow;
		topRows: IGroupRow[];
	}

	[ActionTypes.SET_GROUP]: {
		groupRow: IGroup;
	};

	// [ActionTypes.SET_GROUP_ROW]: {
	// 	groupRow: IGroupRow;
	// };

	[ActionTypes.SET_GROUP_TO_VIEW]: {
		groupRow: IGroupRow; // IGroup extends IGroupRow
	};

	[ActionTypes.SET_GROUP_TO_EDIT]: {
		groupRow: IGroupRow; // IGroup extends IGroupRow
		group: IGroup
	};

	[ActionTypes.SET_GROUP_UPDATED]: {
		groupRow?: IGroupRow; // IGroup extends IGroupRow
		group: IGroup
	};


	[ActionTypes.ADD_NEW_ANSWER_TO_ROW]: {
		groupRow?: IGroupRow;
		newAnswerRow: IAnswerRow;
	};


	[ActionTypes.SET_ROW_EXPANDING]: {
		groupRow?: IGroupRow;
	};

	[ActionTypes.SET_ROW_EXPANDED]: {
		groupRow: IGroupRow;
		formMode: FormMode;
		selectedAnswerId?: string | null;
	};

	[ActionTypes.SET_ROW_COLLAPSING]: {
		groupRow?: IGroupRow;
	};

	[ActionTypes.SET_ROW_COLLAPSED]: {
		groupRow: IGroupRow;
	};

	[ActionTypes.SET_GROUP_TO_ADD_TOP]: {
		groupRow?: IGroupRow;
		newGroupRow: IGroupRow;
		//group: IGroup;
	};

	[ActionTypes.SET_GROUP_TO_ADD]: {
		groupRow: IGroupRow;
		newGroupRow: IGroupRow;
		//group: IGroup;
	};

	[ActionTypes.SET_GROUP_ADDED]: {
		groupRow?: IGroupRow;
		//group: IGroup;
	};

	[ActionTypes.GROUP_DELETED]: {
		groupRow?: IGroupRow;
		id: string;
	};


	[ActionTypes.CLOSE_GROUP_FORM]: {
		groupRow?: IGroupRow;
	};

	[ActionTypes.CANCEL_GROUP_FORM]: {
		groupRow?: IGroupRow;
	};


	[ActionTypes.SET_GROUP_ERROR]: {
		groupRow?: IGroupRow;
		error: Error;
		whichRowId?: string;
	};

	[ActionTypes.RESET_GROUP_ANSWER_DONE]: {
		groupRow?: IGroupRow
	};

	[ActionTypes.FORCE_OPEN_NODE]: {
		groupRow?: IGroupRow,
		keyExpanded: IKeyExpanded
	};



	/////////////
	// answers
	[ActionTypes.GROUP_ANSWERS_LOADED]: {
		groupRow: IGroupRow
	};

	[ActionTypes.ADD_ANSWER]: {
		groupRow?: IGroupRow;
		groupInfo: IGroupInfo;
	}

	[ActionTypes.CANCEL_ADD_ANSWER]: {
		groupRow?: IGroupRow;
	}


	[ActionTypes.SET_ANSWER_TO_VIEW]: {
		groupRow?: IGroupRow;
		answer: IAnswer;
	};

	[ActionTypes.SET_ANSWER_TO_EDIT]: {
		groupRow?: IGroupRow;
		answer: IAnswer;
	};

	[ActionTypes.SET_ANSWER_SELECTED]: {
		groupRow?: IGroupRow;
		answerKey: IAnswerKey;
	};

	[ActionTypes.SET_ANSWER]: {
		groupRow?: IGroupRow;
		formMode: FormMode;
		answer: IAnswer;
	};

	[ActionTypes.SET_ANSWER_AFTER_ASSIGN_ANSWER]: {
		groupRow?: IGroupRow;
		answer: IAnswer
	};


	[ActionTypes.ANSWER_DELETED]: {
		groupRow?: IGroupRow;
		answer: IAnswer
	};

	[ActionTypes.CLOSE_ANSWER_FORM]: {
		groupRow?: IGroupRow;
		answer: IAnswer;
	};

	[ActionTypes.CANCEL_ANSWER_FORM]: {
		groupRow?: IGroupRow;
		answer: IAnswer;
	};

	[ActionTypes.SET_ERROR]: {
		groupRow?: IGroupRow;
		error: Error;
		whichRowId?: string;
	};
};

export type Actions =
	ActionMap<Payload>[keyof ActionMap<Payload>];

