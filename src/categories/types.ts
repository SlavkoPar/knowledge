import { type ActionMap, type IWhoWhen, type IRecord, Dto2WhoWhen, WhoWhen2Dto, type IWhoWhenDto, type IDtoKey } from '@/global/types';
import type { IGroupRow } from '@/groups/types';

export enum FormMode {
	None = 'None',

	AddingCategory = 'AddingCategory',
	ViewingCategory = 'ViewingCategory',
	EditingCategory = 'EditingCategory',
	DeletingCategory = 'DeletingCategory',

	AddingQuestion = 'AddingQuestion',
	ViewingQuestion = 'ViewingQuestion',
	EditingQuestion = 'EditingQuestion',
	DeletingQuestion = 'DeletingQuestion',

	AddingVariation = 'AddingVariation',
	EditingVariation = 'EditingVariation',
	ViewingVariation = 'ViewingVariation'
}

export interface IFromUserAssignedAnswer {
	id: string,
	createdBy: string
}


export interface ICategoryRowDto extends IDtoKey {
	Kind: number;
	Title: string;
	Link: string | null;
	Header: string;
	Variations: string[];
	Level: number;
	HasSubCategories: boolean;
	RowDtos: ICategoryRowDto[];
	NumOfQuestions?: number;
	QuestionRowDtos?: IQuestionRowDto[];
	HasMoreQuestions?: boolean;
	IsExpanded?: boolean;
}

export interface ICategoryDto extends ICategoryRowDto {
	Doc1: string;
}

export interface IKeyExpanded {
	topId: string,
	categoryId: string;
	questionId: string | null;
}

export interface ICategoryKey {
	topId: string,
	id: string;
	parentId: string | null;
}

export interface ICategoryRow extends ICategoryKey, IRecord {
	kind: number;
	title: string;
	link: string | null;
	header: string;
	level: number;
	hasSubCategories: boolean;
	categoryRows: ICategoryRow[];
	variations: string[];
	numOfQuestions: number;
	questionRows?: IQuestionRow[];
	hasMoreQuestions?: boolean;
	isExpanded?: boolean;
	titlesUpTheTree?: string;
}
export interface ICategory extends ICategoryRow {
	doc1: string, // some document optionally, used in Category, but not not in CategoryRow
}

export class CategoryRowDto {
	constructor(categoryRow: ICategoryRow, Workspace: string) {
		const { topId, id, parentId, modified } = categoryRow;
		this.categoryRowDto = {
			Workspace,
			TopId: topId,
			Id: id,
			ParentId: parentId,
			Title: '',
			Link: '',
			Header: '',
			Variations: [],
			// TODO proveri []
			HasSubCategories: false,
			RowDtos: [],
			NumOfQuestions: 0,
			QuestionRowDtos: [],
			Level: 0,
			Kind: 0,
			Modified: modified ? new WhoWhen2Dto(modified).whoWhenDto! : undefined
		}
	}
	categoryRowDto: ICategoryRowDto;
}

export class CategoryRow {
	constructor(categoryRowDto: ICategoryRowDto) {
		const { TopId, Id, ParentId, Kind, Title, Link, Header, Variations, Level,
			HasSubCategories, RowDtos,
			NumOfQuestions, QuestionRowDtos,
			IsExpanded } = categoryRowDto;
		this.categoryRow = {
			topId: TopId,
			id: Id,
			parentId: ParentId ?? null,
			title: Title,
			link: Link,
			header: Header,
			titlesUpTheTree: '', // traverse up the tree, until root
			variations: Variations ?? [],
			hasSubCategories: HasSubCategories, //!, Odakle ovo
			categoryRows: RowDtos
				? RowDtos.map(dto => new CategoryRow({ ...dto, TopId }).categoryRow)
				: [],
			numOfQuestions: NumOfQuestions ?? 0,
			questionRows: QuestionRowDtos
				? QuestionRowDtos.map(dto => new QuestionRow({ ...dto, TopId: TopId ?? undefined }).questionRow)
				: [],
			level: Level,
			kind: Kind,
			isExpanded: IsExpanded ?? false
		}
	}
	categoryRow: ICategoryRow;
}


/////////////////////////////////////
// Question
export interface IQuestionDtoKey {
	Workspace?: string;
	TopId: string,
	ParentId?: string;
	Id: string;
}


export interface IQuestionKey {
	topId: string,
	parentId: string;
	id: string;
}

export interface IQuestionRow extends IQuestionKey, IRecord {
	title: string;
	numOfAssignedAnswers: number;
	categoryTitle?: string;
	// isSelected?: boolean;
	included: boolean;
}

export interface IQuestion extends IQuestionRow {
	assignedAnswers: IAssignedAnswer[];
	relatedFilters: IRelatedFilter[]
	numOfRelatedFilters: number,
	source: number;
	status: number;
	fromUserAssignedAnswer?: IFromUserAssignedAnswer[];
	categoryTitle?: string;
}

export interface IRelatedFilter {
	questionKey: IQuestionKey | null;
	filter: string;
	numOfUsages: number;
	created: IWhoWhen | null;
	lastUsed: IWhoWhen | null;
}

export interface IQuestionKeyDto {
	Workspace?: string;
	TopId: string,
	ParentId: string | null;
	Id: string;
}

export class QuestionKeyDto {
	constructor(key: IQuestionKey, Workspace: string) { //, parentId: string) {
		const { topId, parentId, id } = key;
		this.dto = {
			Workspace,
			TopId: topId,
			ParentId: parentId,
			Id: id
		}
	}
	dto: IQuestionKeyDto
}



export interface IRelatedFilterDto {
	QuestionKey?: IQuestionKey;
	Filter: string;
	NumOfUsages: number;
	Created: IWhoWhenDto | null;
	LastUsed: IWhoWhenDto | null;
}

export interface IRelatedFilterDtoEx {
	relatedFilterDto: IRelatedFilterDto | null;
	msg: string;
}


export class RelatedFilterDto {
	constructor(relatedFilter: IRelatedFilter) {
		const { questionKey, filter, numOfUsages, created, lastUsed } = relatedFilter;
		this.relatedFilterDto = {
			QuestionKey: questionKey ?? undefined,
			Filter: filter,
			Created: created ? new WhoWhen2Dto(created).whoWhenDto! : null,
			LastUsed: lastUsed ? new WhoWhen2Dto(lastUsed).whoWhenDto! : null,
			NumOfUsages: numOfUsages
		}
	}
	relatedFilterDto: IRelatedFilterDto;
}

export class RelatedFilter {
	constructor(dto: IRelatedFilterDto) {
		const { QuestionKey, Filter, Created, LastUsed, NumOfUsages } = dto;
		this.relatedFilter = {
			questionKey: QuestionKey ?? null,
			filter: Filter,
			created: Created ? new Dto2WhoWhen(Created).whoWhen! : null,
			lastUsed: LastUsed ? new Dto2WhoWhen(LastUsed).whoWhen! : null,
			numOfUsages: NumOfUsages
		}
	}
	relatedFilter: IRelatedFilter;
}


export interface IVariation {
	name: string;
}

// ICategory rather than ICategoryRow
export const IsCategory = (obj: any): boolean => typeof obj === 'object' && obj !== null &&
	obj.hasOwnProperty('doc1') && typeof obj.doc1 === 'string';



export class QuestionRow {
	constructor(rowDto: IQuestionRowDto) { //, parentId: string) {
		const { TopId, ParentId, Id, NumOfAssignedAnswers, Title, CategoryTitle, Created, Modified, Included } = rowDto;
		this.questionRow = {
			topId: TopId,
			parentId: ParentId ?? '',
			id: Id,
			numOfAssignedAnswers: NumOfAssignedAnswers ?? 0,
			title: Title,
			categoryTitle: CategoryTitle,
			created: new Dto2WhoWhen(Created!).whoWhen,
			modified: Modified
				? new Dto2WhoWhen(Modified).whoWhen
				: undefined,
			included: Included ?? false
			//isSelected: Included
		}
	}

	// const { TopId, ParentId, Id, Title, NumOfAssignedAnswers, Included } = rowDto;
	// return {
	//   topId: TopId,
	//   parentId: ParentId ?? '',
	//   id: Id,
	//   title: Title,
	//   categoryTitle: '',
	//   numOfAssignedAnswers: NumOfAssignedAnswers ?? 0,
	//   included: Included ?? false,
	// }


	questionRow: IQuestionRow
}

export class QuestionRowDto {
	constructor(row: IQuestionRow, Workspace: string) { //, parentId: string) {
		const { topId, parentId, id, numOfAssignedAnswers, created, modified, included } = row;
		this.questionRowDto = {
			Workspace,
			TopId: topId,
			ParentId: parentId ?? '',
			Id: id,
			NumOfAssignedAnswers: numOfAssignedAnswers ?? 0,
			Title: '',
			CategoryTitle: '',
			Created: new WhoWhen2Dto(created!).whoWhenDto!,
			Modified: new WhoWhen2Dto(modified).whoWhenDto!,
			Included: included
		}
	}
	questionRowDto: IQuestionRowDto
}


export class CategoryKey {
	constructor(x: IQuestionKey | ICategoryRow | ICategory | ICategoryKey) {
		const { topId, id, parentId } = x;
		this.categoryKey = {
			topId,
			id,
			parentId
		}
	}
	categoryKey: ICategoryKey;
	toQuery = (workspace: string) => {
		const { topId, id, parentId } = this.categoryKey;
		return [
			`catKey.workspace=${encodeURIComponent(workspace)}`,
			`catKey.topId=${encodeURIComponent(topId)}`,
			`catKey.id=${encodeURIComponent(id)}`,
			`catKey.parentId=${encodeURIComponent(parentId ?? 'null')}`
		].join('&')
	};
}



export class Category {
	constructor(dto: ICategoryDto) {
		const { TopId, Id, ParentId, Kind, Title, Link, Header, Level, Variations, NumOfQuestions,
			HasSubCategories, RowDtos, Created, Modified, QuestionRowDtos, IsExpanded, Doc1 } = dto;

		const categoryRows = RowDtos
			? RowDtos.map((rowDto: ICategoryRowDto) => new CategoryRow(rowDto).categoryRow)
			: [];

		const questionRows = QuestionRowDtos
			? QuestionRowDtos.map((dto: IQuestionDto) => new Question(dto).question)
			: [];

		this.category = {
			topId: TopId,
			id: Id,
			parentId: ParentId ?? null,
			kind: Kind,
			title: Title,
			link: Link,
			header: Header,
			level: Level!,
			variations: Variations ?? [],
			hasSubCategories: HasSubCategories!,
			categoryRows,
			created: new Dto2WhoWhen(Created!).whoWhen,
			modified: Modified
				? new Dto2WhoWhen(Modified).whoWhen
				: undefined,
			numOfQuestions: NumOfQuestions!,
			questionRows: questionRows ?? [],
			isExpanded: IsExpanded === true,
			doc1: Doc1
		}
	}
	category: ICategory;
}

export class CategoryDto {
	constructor(category: ICategory, Workspace: string) {
		const { topId, id, parentId, kind, title, link, header, level, variations, created, modified, doc1 } = category;
		this.categoryDto = {
			Workspace,
			TopId: topId,
			Id: id,
			Kind: kind,
			ParentId: parentId,
			Title: title,
			Link: link,
			Header: header ?? '',
			Level: level,
			HasSubCategories: true,
			RowDtos: [],
			NumOfQuestions: 0,
			QuestionRowDtos: [],
			Variations: variations,
			Created: new WhoWhen2Dto(created).whoWhenDto!,
			Modified: new WhoWhen2Dto(modified).whoWhenDto!,
			Doc1: doc1
		}
	}
	categoryDto: ICategoryDto;
}

// dupliakt, ima u QuestionProvideru
export class Question {
	constructor(dto: IQuestionDto) { //, parentId: string) {
		const assignedAnswers = dto.AssignedAnswerDtos ?
			dto.AssignedAnswerDtos.map((dto: IAssignedAnswerDto) => new AssignedAnswer(dto).assignedAnswer)
			: [];
		const relatedFilters = dto.RelatedFilterDtos
			? dto.RelatedFilterDtos.map((Dto: IRelatedFilterDto) => new RelatedFilter(Dto).relatedFilter)
			: [];
		// TODO possible to call base class construtor
		this.question = {
			topId: dto.TopId, // TODO will be set later
			parentId: dto.ParentId ?? '',
			id: dto.Id,
			title: dto.Title,
			categoryTitle: dto.CategoryTitle,
			assignedAnswers,
			numOfAssignedAnswers: dto.NumOfAssignedAnswers ?? 0,
			relatedFilters,
			numOfRelatedFilters: dto.NumOfRelatedFilters ?? 0,
			source: dto.Source ?? 0,
			status: dto.Status ?? 0,
			included: dto.Included !== undefined,
			created: new Dto2WhoWhen(dto.Created!).whoWhen,
			modified: dto.Modified
				? new Dto2WhoWhen(dto.Modified).whoWhen
				: undefined
		}
	}
	question: IQuestion
}

export class QuestionKey {
	constructor(question: IQuestionRow | IQuestion | IQuestionKey) { //| undefined) {
		this.questionKey = {
			topId: question.topId,
			parentId: question.parentId ?? null,
			id: question.id
		}
	}
	questionKey: IQuestionKey;
	toQuery = (workspace: string) => {
		const { topId, parentId, id } = this.questionKey;
		return [
			`qKey.workspace=${encodeURIComponent(workspace)}`,
			`qKey.topId=${encodeURIComponent(topId)}`,
			`qKey.parentId=${encodeURIComponent(parentId ?? 'null')}`,
			`qKey.id=${encodeURIComponent(id)}`
		].join('&')
	};
}

export class QuestionDto {
	constructor(question: IQuestion, Workspace: string) {
		const { topId, parentId, id, title, source, status, created, modified,
			numOfAssignedAnswers, numOfRelatedFilters } = question;
		this.questionDto = {
			Workspace,
			TopId: topId,
			ParentId: parentId ?? 'null',  // TODO proveri
			Id: id,
			Title: title,
			//AssignedAnswerDtos: question.assignedAnswers.map((a: IAssignedAnswer) => new AssignedAnswerDto(a).assignedAnswerDto),
			NumOfAssignedAnswers: numOfAssignedAnswers,
			//RelatedFilterDtos: question.relatedFilters.map((a: IRelatedFilter) => new RelatedFilterDto(a).relatedFilterDto),
			NumOfRelatedFilters: numOfRelatedFilters,
			Source: source,
			Status: status,
			Created: new WhoWhen2Dto(created).whoWhenDto!,
			Modified: new WhoWhen2Dto(modified).whoWhenDto!
		}
	}
	questionDto: IQuestionDto;
}

export interface IQuestionRowDto extends IDtoKey {
	NumOfAssignedAnswers?: number,
	Title: string;
	CategoryTitle?: string;
	Included?: boolean;
	Source?: number;
	Status?: number;
}

export interface IQuestionRowDtosEx {
	questionRowDtos: IQuestionRowDto[];
	msg: string;
}

export interface IQuestionDto extends IQuestionRowDto {
	AssignedAnswerDtos?: IAssignedAnswerDto[];
	RelatedFilterDtos?: IRelatedFilterDto[]
	NumOfRelatedFilters?: number;
	oldParentId?: string;
}

export interface IQuestionDtoEx {
	questionDto: IQuestionDto | null;
	msg: string;
}

export interface IQuestionEx {
	question: IQuestion | null;
	msg: string;
}


export interface IQuestionsMore {
	questions: IQuestionDto[];
	hasMoreQuestions: boolean;
}



export interface ICategoryDtoEx {
	categoryDto: ICategoryDto | null;
	msg: string;
}

export interface ICategoryRowDtoEx {
	categoryRowDto: ICategoryRowDto | null;
	msg: string;
}


export interface ICategoryDtoListEx {
	categoryDtoList: ICategoryDto[];
	msg: string;
}


export interface ICategoryInfo {
	categoryKey: ICategoryKey;
	level: number
}

export interface IExpandInfo {
	categoryKey: ICategoryKey;
	formMode?: FormMode;
	includeQuestionId?: string;
	newCategoryRow?: ICategoryRow;
	newQuestionRow?: IQuestionRow;
}


export interface IParentInfo {
	//execute?: (method: string, endpoint: string) => Promise<any>,
	// topId: string | null,
	// parentId: string | null,
	//categoryKey: ICategoryKey,
	categoryRow: ICategoryRow,
	startCursor?: number,
	includeQuestionId?: string | null
	level?: number,
	title?: string, // to easier follow getting the list of sub-categories
	inAdding?: boolean,
	isExpanded?: boolean
	//subCategories?: ICategory[]
}

export const _generateId = 'generateId';

export interface ICategoriesState {
	formMode: FormMode;
	topRows: ICategoryRow[];
	allCategoryRows: Map<string, ICategoryRow>;
	allCategoryRowsLoaded?: number;
	allGroupRows: Map<string, IGroupRow>; // AutoSuggestAnswers uses it
	allGroupRowsLoaded?: number;
	topRowsLoading: boolean;
	topRowsLoaded: boolean;
	keyExpanded: IKeyExpanded | null; // ICategoryKey + questionId
	categoryId_questionId_done?: string;
	nodeOpening: boolean;
	nodeOpened: boolean;
	rowExpanding: boolean;
	rowExpanded: boolean;
	activeCategory: ICategory | null;
	activeQuestion: IQuestion | null;
	selectedQuestionId: string | null;
	loadingCategories: boolean,
	loadingQuestions: boolean,
	loadingCategory: boolean, categoryLoaded: boolean,
	loadingQuestion: boolean, questionLoaded: boolean,
	error?: Error;
	whichRowId?: string; // category.id or question.id
}

export interface ILocStorage {
	keyExpanded: IKeyExpanded | null
}

export interface ILoadCategoryQuestions {
	categoryKey: ICategoryKey,
	startCursor: number,
	includeQuestionId: string | null
}

export interface ICategoriesContext {
	state: ICategoriesState,
	loadAllCategoryRows: () => Promise<Map<string, ICategoryRow> | null>;
	loadAllGroupRows: () => Promise<Map<string, IGroupRow> | null>;
	getCat: (id: string) => Promise<ICategoryRow | undefined>;
	expandNodesUpToTheTree: (catKey: ICategoryKey, questionId: string | null, fromChatBotDlg?: boolean) => Promise<boolean>;
	loadTopRows: () => Promise<any>,
	addCategory: (parentCategoryRow: ICategoryRow | null) => Promise<any>;
	cancelAddCategory: () => Promise<any>;
	createCategory: (category: ICategory) => void,
	viewCategory: (categoryRow: ICategoryRow, includeQuestionId: string) => void,
	editCategory: (categoryRow: ICategoryRow, includeQuestionId: string) => void,
	updateCategory: (category: ICategory, closeForm: boolean) => void,
	deleteCategory: (categoryRow: ICategoryRow) => void,
	deleteCategoryVariation: (categoryKey: ICategoryKey, name: string) => void,
	expandCategory: (expandInfo: IExpandInfo) => Promise<any>
	collapseCategory: (categoryRow: ICategoryRow) => void,
	// findCategory: (categoryRows: ICategoryRow[], id: string) => ICategoryRow | undefined;
	onCategoryTitleChanged: (topId: string, id: string, title: string) => Promise<void>;
	//////////////
	// questions
	loadCategoryQuestions: (catParams: ILoadCategoryQuestions) => Promise<void>;  //(parentInfo: IParentInfo) => void,
	getSubCats: (categoryId: string | null) => Promise<any>;
	addQuestion: (categoryKey: ICategoryKey, isExpanded: boolean) => Promise<any>;
	cancelAddQuestion: () => Promise<any>;
	getAnswerCount: () => Promise<number>;
	createQuestion: (question: IQuestion, fromModal: boolean) => Promise<any>;
	viewQuestion: (questionRow: IQuestionRow) => void;
	editQuestion: (questionRow: IQuestionRow) => void;
	updateQuestion: (oldParentId: string, question: IQuestion, categoryChanged: boolean) => Promise<any>;
	assignQuestionAnswer: (action: 'Assign' | 'UnAssign', questionKey: IQuestionKey, assignedAnswerKey: IAssignedAnswerKey) => Promise<any>;
	deleteQuestion: (questionRow: IQuestionRow, isActive: boolean) => void;
	onQuestionTitleChanged: (topId: string, categoryId: string, id: string, title: string) => Promise<void>;
}

export interface ICategoryFormProps {
	inLine: boolean;
	category: ICategory;
	questionId: string | null;
	formMode: FormMode;
	cancel: () => void,
	close: () => void,
	submitForm: (category: ICategory) => void,
	children: string
}

export interface IQuestionFormProps {
	question: IQuestion;
	closeModal?: () => void;
	submitForm: (question: IQuestion) => void,
	showCloseButton: boolean;
	source: number,
	children: string
}


/////////////////////////////////////////////////
// Assigned Answers


export interface IAssignedAnswerDtoKey {
	TopId: string;
	Id: string;
}

export interface IAssignedAnswerKey {
	topId: string;
	id: string;
}


export interface IAssignedAnswer extends IAssignedAnswerKey {
	answerTitle?: string;
	answerLink?: string;
	created?: IWhoWhen,
	modified?: IWhoWhen
}


export interface IAssignedAnswerDto {
	QuestionKeyDto?: IQuestionKeyDto;
	TopId: string;
	Id: string;
	AnswerTitle: string;
	AnswerLink: string;
	Created?: IWhoWhenDto;
	Modified?: IWhoWhenDto;
}

export interface IAssignedAnswerDtoEx {
	assignedAnswerDto: IAssignedAnswerDto | null;
	msg: string;
}

export class AssignedAnswerDto {
	constructor(assignedAnswer: IAssignedAnswer) {
		const { topId, id, answerTitle, created } = assignedAnswer;
		this.assignedAnswerDto = {
			TopId: topId,
			Id: id,
			AnswerTitle: answerTitle ?? '',
			AnswerLink: answerTitle ?? '',
			Created: new WhoWhen2Dto(created).whoWhenDto!
			//Modified: new WhoWhen2Dto(modified).whoWhenDto
		}
	}
	assignedAnswerDto: IAssignedAnswerDto;
}

export class AssignedAnswer {
	constructor(dto: IAssignedAnswerDto) {
		const { TopId, Id, AnswerTitle, AnswerLink, Created, Modified } = dto;
		this.assignedAnswer = {
			topId: TopId,
			id: Id,
			answerTitle: AnswerTitle,
			answerLink: AnswerLink,
			created: new Dto2WhoWhen(Created).whoWhen,
			modified: new Dto2WhoWhen(Modified).whoWhen
		}
	}
	assignedAnswer: IAssignedAnswer;
}


export enum ActionTypes {
	SET_KEY_EXPANDED = "SET_KEY_EXPANDED",
	SET_TOP_ROWS = 'SET_TOP_ROWS',
	SET_NODE_EXPANDED_UP_THE_TREE = "SET_NODE_EXPANDED_UP_THE_TREE",
	SET_LOADING_CATEGORY = 'SET_LOADING_CATEGORY',
	SET_LOADING_CATEGORIES = 'SET_LOADING_CATEGORIES',
	SET_LOADING_QUESTION = 'SET_LOADING_QUESTION',
	SET_TOP_ROWS_LOADING = 'SET_TOP_ROWS_LOADING',
	SET_CATEGORY_QUESTIONS_LOADING = 'SET_CATEGORY_QUESTIONS_LOADING',
	SET_SUB_CATEGORIES = 'SET_SUB_CATEGORIES',
	SET_ERROR = 'SET_ERROR',
	RE_RENDER_TREE = 'RE_RENDER_TREE',
	SET_CATEGORY = 'SET_CATEGORY',
	//SET_CATEGORY_ROW = 'SET_CATEGORY_ROW',
	ADD_NEW_QUESTION_TO_ROW = 'ADD_NEW_QUESTION_TO_ROW',
	SET_ROW_EXPANDING = 'SET_ROW_EXPANDING',
	SET_ROW_EXPANDED = 'SET_ROW_EXPANDED',
	SET_ROW_COLLAPSING = 'SET_ROW_COLLAPSING',
	SET_ROW_COLLAPSED = 'SET_ROW_COLLAPSED',
	SET_CATEGORY_TO_ADD = 'SET_CATEGORY_TO_ADD',
	CANCEL_ADD_CATEGORY = 'CANCEL_ADD_CATEGORY',
	SET_CATEGORY_ADDED = 'SET_CATEGORY_ADDED',
	SET_ALL_CATEGORY_ROWS = 'SET_ALL_CATEGORY_ROWS',
	SET_ALL_GROUP_ROWS = 'SET_ALL_GROUP_ROWS',

	SET_CATEGORY_TO_VIEW = 'SET_CATEGORY_TO_VIEW',
	SET_CATEGORY_TO_EDIT = 'SET_CATEGORY_TO_EDIT',
	SET_CATEGORY_UPDATED = 'SET_CATEGORY_UPDATED',
	CATEGORY_DELETED = 'CATEGORY_DELETED',
	RESET_CATEGORY_QUESTION_DONE = 'RESET_CATEGORY_QUESTION_DONE',

	CLOSE_CATEGORY_FORM = 'CLOSE_CATEGORY_FORM',
	CANCEL_CATEGORY_FORM = 'CANCEL_CATEGORY_FORM',

	SET_NODE_EXPANDING_UP_THE_TREE = "SET_NODE_EXPANDING_UP_THE_TREE",
	FORCE_OPEN_NODE = "FORCE_OPEN_NODE",

	// questions
	CATEGORY_QUESTIONS_LOADED = 'CATEGORY_QUESTIONS_LOADED',
	ADD_QUESTION = 'ADD_QUESTION',
	QUESTION_TITLE_CHANGED = 'QUESTION_TITLE_CHANGED',

	CANCEL_ADD_QUESTION = 'CANCEL_ADD_QUESTION',
	SET_QUESTION_TO_VIEW = 'SET_QUESTION_TO_VIEW',
	SET_QUESTION_TO_EDIT = 'SET_QUESTION_TO_EDIT',

	SET_QUESTION_SELECTED = 'SET_QUESTION_SELECTED',
	SET_QUESTION = 'SET_QUESTION',
	SET_QUESTION_AFTER_ASSIGN_ANSWER = 'SET_QUESTION_AFTER_ASSIGN_ANSWER',
	SET_QUESTION_ANSWERS = 'SET_QUESTION_ANSWERS',
	QUESTION_DELETED = 'QUESTION_DELETED',

	CLOSE_QUESTION_FORM = 'CLOSE_QUESTION_FORM',
	CANCEL_QUESTION_FORM = 'CANCEL_QUESTION_FORM'
}

export const actionStoringToLocalStorage = [
	// ActionTypes.SET_CATEGORY_NODE_OPENED
	ActionTypes.SET_ROW_EXPANDED,
	ActionTypes.SET_ROW_COLLAPSED,
	ActionTypes.SET_CATEGORY_ADDED,
	ActionTypes.SET_CATEGORY_TO_VIEW,
	ActionTypes.SET_CATEGORY_TO_EDIT,
	ActionTypes.SET_QUESTION_TO_VIEW,
	ActionTypes.SET_QUESTION_TO_EDIT,
	ActionTypes.FORCE_OPEN_NODE,
	ActionTypes.CATEGORY_DELETED,
	ActionTypes.QUESTION_DELETED
];

export const doNotModifyTree = [
	//ActionTypes.SET_TOP_ROWS_LOADING,
	//ActionTypes.SET_TOP_ROWS,
	//ActionTypes.SET_LOADING_CATEGORY,
	ActionTypes.SET_NODE_EXPANDING_UP_THE_TREE,
	//ActionTypes.SET_NODE_OPENED,
	//ActionTypes.SET_CATEGORY_TO_ADD,
	//ActionTypes.SET_CATEGORY_ADDED,
	// zasto je bilo ActionTypes.SET_CATEGORY_UPDATED,
	//ActionTypes.ADD_NEW_QUESTION_TO_ROW,
	ActionTypes.CANCEL_CATEGORY_FORM,
	ActionTypes.CANCEL_ADD_CATEGORY
	// ActionTypes.CLOSE_CATEGORY_FORM
]

export const doNotCallInnerReducerActions = [
	ActionTypes.RE_RENDER_TREE,
	ActionTypes.QUESTION_TITLE_CHANGED
]

export type Payload = {

	[ActionTypes.SET_KEY_EXPANDED]: {
		categoryRow?: ICategoryRow;
		keyExpanded: IKeyExpanded | null;
	}

	[ActionTypes.SET_TOP_ROWS_LOADING]: {
		categoryRow?: ICategoryRow;
	}

	[ActionTypes.SET_LOADING_CATEGORIES]: {
		categoryRow?: ICategoryRow;
	}

	[ActionTypes.SET_LOADING_CATEGORY]: {
		categoryRow?: ICategoryRow;
	}

	[ActionTypes.SET_LOADING_QUESTION]: {
		categoryRow?: ICategoryRow;
	}

	[ActionTypes.SET_CATEGORY_QUESTIONS_LOADING]: {
		categoryRow?: ICategoryRow;
	}

	[ActionTypes.SET_NODE_EXPANDING_UP_THE_TREE]: {
		categoryRow?: ICategoryRow;
		fromChatBotDlg: boolean;
		categoryId_questionId_done?: string;
		//categoryKeyExpanded: IQuestionKey
	};

	[ActionTypes.SET_NODE_EXPANDED_UP_THE_TREE]: {
		// categoryNodesUpTheTree: ICategoryKeyExtended[]; /// we could have used Id only
		categoryRow?: ICategoryRow;
		category: ICategory | null,
		formMode: FormMode,
		catKey: ICategoryKey;
		questionId: string | null,
		question: IQuestion | null,
		fromChatBotDlg?: boolean;
	};


	[ActionTypes.SET_TOP_ROWS]: {
		categoryRow?: ICategoryRow;
		topRows: ICategoryRow[];
	};

	[ActionTypes.SET_SUB_CATEGORIES]: {
		categoryRow?: ICategoryRow;
		id: string | null;
		categoryRows: ICategoryRow[];
	};

	[ActionTypes.SET_ALL_CATEGORY_ROWS]: {
		categoryRow?: ICategoryRow;
		allCategoryRows: Map<string, ICategoryRow>
	};

	[ActionTypes.SET_ALL_GROUP_ROWS]: {
		categoryRow?: ICategoryRow;
		allGroupRows: Map<string, IGroupRow>
	};

	[ActionTypes.RE_RENDER_TREE]: {
		categoryRow?: ICategoryRow;
	}

	[ActionTypes.QUESTION_TITLE_CHANGED]: {
		categoryRow?: ICategoryRow;
	}

	[ActionTypes.CANCEL_ADD_CATEGORY]: {
		categoryRow?: ICategoryRow;
		topRows: ICategoryRow[];
	}

	[ActionTypes.SET_CATEGORY]: {
		categoryRow: ICategory;
	};

	// [ActionTypes.SET_CATEGORY_ROW]: {
	// 	categoryRow: ICategoryRow;
	// };

	[ActionTypes.SET_CATEGORY_TO_VIEW]: {
		categoryRow: ICategoryRow; // ICategory extends ICategoryRow
	};

	[ActionTypes.SET_CATEGORY_TO_EDIT]: {
		categoryRow: ICategoryRow; // ICategory extends ICategoryRow
		category: ICategory
	};

	[ActionTypes.SET_CATEGORY_UPDATED]: {
		categoryRow?: ICategoryRow; // ICategory extends ICategoryRow
		category: ICategory
	};


	[ActionTypes.ADD_NEW_QUESTION_TO_ROW]: {
		categoryRow?: ICategoryRow;
		newQuestionRow: IQuestionRow;
	};


	[ActionTypes.SET_ROW_EXPANDING]: {
		categoryRow?: ICategoryRow;
	};

	[ActionTypes.SET_ROW_EXPANDED]: {
		categoryRow: ICategoryRow;
		formMode: FormMode;
		selectedQuestionId?: string | null;
	};

	[ActionTypes.SET_ROW_COLLAPSING]: {
		categoryRow?: ICategoryRow;
	};

	[ActionTypes.SET_ROW_COLLAPSED]: {
		categoryRow: ICategoryRow;
	};

	[ActionTypes.SET_CATEGORY_TO_ADD]: {
		categoryRow?: ICategoryRow;
		newCategoryRow: ICategoryRow;
		//category: ICategory;
	};

	[ActionTypes.SET_CATEGORY_ADDED]: {
		categoryRow?: ICategoryRow;
		idToSet?: string;
		//category: ICategory;
	};

	[ActionTypes.CATEGORY_DELETED]: {
		categoryRow?: ICategoryRow;
		id: string;
	};


	[ActionTypes.CLOSE_CATEGORY_FORM]: {
		categoryRow?: ICategoryRow;
	};

	[ActionTypes.CANCEL_CATEGORY_FORM]: {
		categoryRow?: ICategoryRow;
	};


	[ActionTypes.SET_ERROR]: {
		categoryRow?: ICategoryRow;
		error: Error;
		whichRowId?: string;
	};

	[ActionTypes.RESET_CATEGORY_QUESTION_DONE]: {
		categoryRow?: ICategoryRow
	};

	[ActionTypes.FORCE_OPEN_NODE]: {
		categoryRow?: ICategoryRow,
		keyExpanded: IKeyExpanded
	};



	/////////////
	// questions
	[ActionTypes.CATEGORY_QUESTIONS_LOADED]: {
		categoryRow: ICategoryRow
	};

	[ActionTypes.ADD_QUESTION]: {
		categoryRow?: ICategoryRow;
		categoryInfo: ICategoryInfo;
	}

	[ActionTypes.CANCEL_ADD_QUESTION]: {
		categoryRow?: ICategoryRow;
	}


	[ActionTypes.SET_QUESTION_TO_VIEW]: {
		categoryRow?: ICategoryRow;
		question: IQuestion;
	};

	[ActionTypes.SET_QUESTION_TO_EDIT]: {
		categoryRow?: ICategoryRow;
		question: IQuestion;
	};

	[ActionTypes.SET_QUESTION_SELECTED]: {
		categoryRow?: ICategoryRow;
		questionKey: IQuestionKey;
	};

	[ActionTypes.SET_QUESTION]: {
		categoryRow?: ICategoryRow;
		formMode: FormMode;
		question: IQuestion;
	};

	[ActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER]: {
		categoryRow?: ICategoryRow;
		question: IQuestion
	};

	[ActionTypes.SET_QUESTION_ANSWERS]: {
		categoryRow?: ICategoryRow;
		answers: IAssignedAnswer[];
	};

	[ActionTypes.QUESTION_DELETED]: {
		categoryRow?: ICategoryRow;
		question: IQuestion
	};

	[ActionTypes.CLOSE_QUESTION_FORM]: {
		categoryRow?: ICategoryRow;
		question: IQuestion;
	};

	[ActionTypes.CANCEL_QUESTION_FORM]: {
		categoryRow?: ICategoryRow;
		question: IQuestion;
	};
};

export type Actions =
	ActionMap<Payload>[keyof ActionMap<Payload>];

