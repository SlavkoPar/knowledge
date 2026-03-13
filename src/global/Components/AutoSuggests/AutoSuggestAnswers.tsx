import React, { type JSX } from 'react';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from "autosuggest-highlight/match";
import AutosuggestHighlightParse from "autosuggest-highlight/parse";

import { isMobile } from 'react-device-detect'

import { debounce, escapeRegexCharacters } from '@/common/utilities'
import './AutoSuggestAnswers.css'
import { type IGroupRow, type IAnswerKey, type IAnswerRow, AnswerKey } from '@/groups/types';


interface ICatMy {
	id: string,
	parentGroupUp: string,
	groupParentTitle: string,
	groupTitle: string,
	answerRows: IAnswerRow[]
}

interface ICatSection {
	id: string | null,
	groupTitle: string,
	parentGroupUp: string,
	groupParentTitle: string, // TODO ???
	answerRows: IAnswerRow[]
}

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expression
// s#Using_Special_Characters
// function escapeRegexCharacters(str: string): string {
// 	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// }

// autoFocus does the job
//let inputAutosuggest = createRef<HTMLInputElement>();
// interface ICatIdTitle {
// 	id: string;
// 	title: string;
// }

const AnswerAutosuggestMulti = Autosuggest as { new(): Autosuggest<IAnswerRow, ICatMy> };

export class AutoSuggestAnswers extends React.Component<{
	tekst: string | undefined,
	onSelectAnswer: (answerKey: IAnswerKey, underFilter: string) => void,
	allGroupRows: Map<string, IGroupRow>,
	lessThan15Answers: IAnswerRow[],
	getAnswerCount?: () => Promise<IAnswerRow[]>,
	searchAnswers: (filter: string, count: number) => Promise<IAnswerRow[]>
}, any> {
	// region Fields
	state: any;
	isMob: boolean;
	allGroupRows: Map<string, IGroupRow>;
	lessThan15Answers: IAnswerRow[];
	getAnswerCount: () => Promise<IAnswerRow[]>;
	searchAnswers: (filter: string, count: number) => Promise<IAnswerRow[]>;
	debouncedLoadSuggestions: (value: string) => void;
	//inputAutosuggest: React.RefObject<HTMLInputElement>;
	// endregion region Constructor
	constructor(props: any) {
		console.log("AutoSuggestAnswers CONSTRUCTOR")
		super(props);
		this.state = {
			value: props.tekst,
			suggestions: this.getCatSections(props.lessThan15Answers, props.allGroupRows),
			noSuggestions: false,
			highlighted: ''
		};
		//this.inputAutosuggest = createRef<HTMLInputElement>();
		this.allGroupRows = props.allGroupRows;
		this.lessThan15Answers = props.lessThan15Answers;
		this.getAnswerCount = props.getAnswerCount;
		this.searchAnswers = props.searchAnswers;
		this.isMob = isMobile;
		this.loadSuggestions = this.loadSuggestions.bind(this);
		this.debouncedLoadSuggestions = debounce(this.loadSuggestions, 300);
	}


	async loadSuggestions(value: string) {
		if (this.lessThan15Answers.length === 0 && typeof this.getAnswerCount === 'function') {
			this.setState({
				isLoading: true
			});
		}

		console.time();
		const suggestions = await this.getSuggestions(value);
		console.log('suggestions >>>>>>>>>>', suggestions);
		console.timeEnd();

		if (value === this.state.value) {
			this.setState({
				isLoading: false,
				suggestions,
				noSuggestions: suggestions.length === 0
			});
		}
		else { // Ignore suggestions if input value changed
			this.setState({
				isLoading: false
			});
		}
	}

	componentDidMount() {

		// if (this.lessThan15Answers.length > 0) {
		// 	this.setState({
		// 		suggestions: this.getCatSections(this.lessThan15Answers),
		// 		noSuggestions: false
		// 	});
		// }
		setTimeout(() => {
			window.focus();
			//inputAutosuggest!.current!.focus();
		}, 300)
		//this.loadSuggestions(this.state.value);
	}

	// endregion region Rendering methods
	render(): JSX.Element {
		const { value, suggestions, noSuggestions } = this.state;

		console.log('render AutoSuggestAnswers', { value, suggestions, noSuggestions });

		return <div>
			<AnswerAutosuggestMulti
				onSuggestionsClearRequested={this.onSuggestionsClearRequested}  // (sl) added
				multiSection={true}
				suggestions={suggestions}
				onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(this)}
				onSuggestionSelected={this.onSuggestionSelected.bind(this)}
				getSuggestionValue={this.getSuggestionValue}
				renderSuggestion={this.renderSuggestion}
				renderSectionTitle={this.renderSectionTitle}
				getSectionSuggestions={this.getSectionSuggestions}
				alwaysRenderSuggestions={true}
				// onSuggestionHighlighted={this.onSuggestionHighlighted} (sl)
				onSuggestionHighlighted={this.onSuggestionHighlighted.bind(this)}
				highlightFirstSuggestion={false}
				renderInputComponent={this.renderInputComponent}
				// renderSuggestionsContainer={this.renderSuggestionsContainer}
				focusInputOnSuggestionClick={!this.isMob}
				inputProps={{
					// placeholder: `Type 'remote'`,
					value,
					onChange: (e, changeEvent) => this.onChange(e, changeEvent),
					autoFocus: true
				}}
			/>
			{noSuggestions &&
				<div className="no-suggestions">
					No answers to suggest
				</div>
			}
		</div>
	}

	protected getCatSections = (answerRows: IAnswerRow[], allGroupRows: Map<string, IGroupRow>): ICatSection[] => {
		try {
			const answerKeys: IAnswerKey[] = [];
			const catSection = new Map<string | null, IAnswerRow[]>();
			console.log('answerRows.length', answerRows.length);
			answerRows.forEach((answerRow: IAnswerRow) => {
				console.log('answerRow', answerRow);
				const { topId, parentId, id, title, included } = answerRow;
				const answerKey = new AnswerKey(answerRow).answerKey!;
				if (!answerKeys.includes(answerKey)) {
					answerKeys.push(answerKey);
					// 2) Group answers by parentId
					const row: IAnswerRow = {
						topId,
						parentId,
						id,
						title,
						groupTitle: '',
						included
					}
					if (!catSection.has(parentId)) {
						catSection.set(parentId, [row]);
					}
					else {
						catSection.get(parentId)!.push(row);
					}
				}
			});

			if (answerKeys.length === 0)
				return [];

			////////////////////////////////////////////////////////////
			// map
			// 0 = {'DALJINSKI' => IAnswerRow[2]}
			// 1 = {'EDGE2' => IAnswerRow[3]}
			// 2 = {'EDGE3' => IAnswerRow[4]}4

			let catSections: ICatSection[] = [];
			catSection.forEach((quests, id) => {
				//let variationsss: string[] = [];
				const catSection: ICatSection = {
					id,
					groupTitle: '',
					groupParentTitle: 'kuro',
					parentGroupUp: '',
					answerRows: []
				};
				if (id !== null) {
					const cat = allGroupRows.get(id);
					if (cat) {
						const { title, titlesUpTheTree/*, variations*/ } = cat!;
						catSection.groupTitle = title;
						catSection.parentGroupUp = titlesUpTheTree!;
						//variationsss = variations;
					}
					else {
						alert(`${id} Not found in allCats`)
					}
				}
				else {
				}
				quests.forEach(quest => {
					catSection.answerRows.push(quest);
				});
				catSections.push(catSection);
			});
			return catSections;
		}
		catch (error: any) {
			console.log(error)
		};
		return [];
	}

	protected async getSuggestions(search: string): Promise<ICatSection[]> {
		const escapedValue = escapeRegexCharacters(search.trim());
		let answerRows: IAnswerRow[] = []
		try {
			if (escapedValue === '' && typeof this.getAnswerCount === 'function') {
				if (this.lessThan15Answers.length > 0) {
					answerRows = [...this.lessThan15Answers];
					this.lessThan15Answers = [];
				}
				else {
					answerRows = await this.getAnswerCount();
				}
			}
			else if (search.length < 3) {
				return [];
			}
			else {
				answerRows = await this.searchAnswers(escapedValue, 10);
			}
			return this.getCatSections(answerRows, this.allGroupRows);
		}
		catch (error: any) {
			console.log(error)
		};
		return [];
	}


	protected onSuggestionsClearRequested = () => {
		this.setState({
			suggestions: [],
			noSuggestions: false
		});
	};

	protected onSuggestionSelected(event: React.FormEvent<any>, data: Autosuggest.SuggestionSelectedEventData<IAnswerRow>): void {
		event.preventDefault(); // ?
		const answer: IAnswerRow = data.suggestion;
		const { topId, parentId, id } = answer;
		// alert(`Selected answer is ${answer.answerId} (${answer.text}).`);
		this.props.onSelectAnswer({ topId, parentId, id }, this.state.value);
	}

	// TODO bac ovo u external css   style={{ textAlign: 'left'}}
	protected renderSuggestion(suggestion: IAnswerRow, params: Autosuggest.RenderSuggestionParams): JSX.Element {
		// const className = params.isHighlighted ? "highlighted" : undefined;
		//return <span className={className}>{suggestion.name}</span>;
		const matches = AutosuggestHighlightMatch(suggestion.title, params.query);
		const parts = AutosuggestHighlightParse(suggestion.title, matches);
		return (
			<span className="d-inline-block text-truncate" style={{ textAlign: 'left' }}>
				{parts.map((part, index) => {
					const cls = part.highlight ? 'react-autosuggest__suggestion-match' : undefined;
					return (
						<span key={index} className={`${cls ?? ''}`}>
							{part.text}
						</span>
					);
				})}
			</span>
		);
	}

	protected renderSectionTitle(section: ICatMy): JSX.Element {
		const { parentGroupUp } = section; // , groupParentTitle, groupTitle
		// let str = (groupParentTitle ? (groupParentTitle + " / ") : "") + groupTitle;
		// if (parentGroupUp)
		// 	str = " ... / " + str;
		return <span>{parentGroupUp}</span>
		// <strong>
		//{parentGroupUp}
		// </strong>;
	}

	// protected renderInputComponent(inputProps: Autosuggest.InputProps<IAnswerShort>): JSX.Element {
	// 	 const { onChange, onBlur, ...restInputProps } = inputProps;
	// 	 return (
	// 		  <div>
	// 				<input {...restInputProps} />
	// 		  </div>
	// 	 );
	// }

	protected renderInputComponent(inputProps: Autosuggest.RenderInputComponentProps): JSX.Element {
		const { ref, ...restInputProps } = inputProps;
		// if (ref !== undefined)
		// 	this.inputAutosuggest = ref as React.RefObject<HTMLInputElement>;

		return (
			<div>
				{/* <input {...restInputProps} ref={inputAutosuggest} /> */}
				<input ref={ref} autoFocus {...restInputProps} />
			</div>
		);
	}

	// const Input = forwardRef<HTMLInputElement, Omit<InputProps, "ref">>(
	// 	(props: Omit<InputProps, "ref">, ref): JSX.Element => (
	// 	  <input {...props} ref={ref} />
	// 	)
	//   );

	// protected renderSuggestionsContainer({ containerProps, children, query }:	RenderSuggestionsContainerParams): JSX.Element {
	// 	return (
	// 		<div {...containerProps}>
	// 			<span>{children}</span>
	// 		</div>
	// 	);
	// }
	// endregion region Event handlers



	protected onChange(event: /*React.ChangeEvent<HTMLInputElement>*/ React.FormEvent<any>, { newValue }: Autosuggest.ChangeEvent): void {
		event.preventDefault(); // ?
		this.setState({ value: newValue });
	}

	// getParentTitle = async (id: string): Promise<any> => {
	// 	let group = await this.dbp.get('Categories', id);
	// 	return { parentGroupTitle: group.title, parentGroupUp: '' };
	// }

	protected async onSuggestionsFetchRequested({ value }: any): Promise<void> {
		return /*await*/ this.debouncedLoadSuggestions(value);
	}

	// private anyWord = (valueWordRegex: RegExp[], answerWords: string[]): boolean => {
	// 	for (let valWordRegex of valueWordRegex)
	// 		for (let answerWord of answerWords)
	// 			if (valWordRegex.test(answerWord))
	// 				return true;
	// 	return false;
	// }

	////////////////////////////////////
	// endregion region Helper methods

	protected getSuggestionValue(suggestion: IAnswerRow) {
		return suggestion.title;
	}

	protected getSectionSuggestions(section: ICatMy) {
		return section.answerRows;
	}

	protected onSuggestionHighlighted(params: Autosuggest.SuggestionHighlightedParams): void {
		this.setState({
			highlighted: params.suggestion
		});
	}
	// endregion
}