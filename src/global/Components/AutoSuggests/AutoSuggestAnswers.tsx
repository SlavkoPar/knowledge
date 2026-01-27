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
	searchAnswers: (filter: string, count: number) => Promise<IAnswerRow[]>
}, any> {
	// region Fields
	state: any;
	isMob: boolean;
	allGroupRows: Map<string, IGroupRow>;
	searchAnswers: (filter: string, count: number) => Promise<IAnswerRow[]>;
	debouncedLoadSuggestions: (value: string) => void;
	//inputAutosuggest: React.RefObject<HTMLInputElement>;
	// endregion region Constructor
	constructor(props: any) {
		console.log("AutoSuggestAnswers CONSTRUCTOR")
		super(props);
		this.state = {
			value: props.tekst || '',
			suggestions: [], //this.getSuggestions(''),
			noSuggestions: false,
			highlighted: ''
		};
		//this.inputAutosuggest = createRef<HTMLInputElement>();
		this.allGroupRows = props.allGroupRows;
		this.searchAnswers = props.searchAnswers;
		this.isMob = isMobile;
		this.loadSuggestions = this.loadSuggestions.bind(this);
		this.debouncedLoadSuggestions = debounce(this.loadSuggestions, 300);
	}


	async loadSuggestions(value: string) {
		this.setState({
			isLoading: true
		});

		console.time();
		const suggestions = await this.getSuggestions(value);
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
		setTimeout(() => {
			window.focus()
			// inputAutosuggest!.current!.focus();
		}, 300)
	}

	// endregion region Rendering methods
	render(): JSX.Element {
		const { value, suggestions, noSuggestions } = this.state;

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
				// onSuggestionHighlighted={this.onSuggestionHighlighted} (sl)
				onSuggestionHighlighted={this.onSuggestionHighlighted.bind(this)}
				highlightFirstSuggestion={false}
				renderInputComponent={this.renderInputComponent}
				// renderSuggestionsContainer={this.renderSuggestionsContainer}
				focusInputOnSuggestionClick={!this.isMob}
				inputProps={{
					placeholder: `Type 'remote'`,
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


	// private satisfyingCategories = (searchWords: string[]): ICatIdTitle[] => {
	// 	const arr: ICatIdTitle[] = [];
	// 	searchWords.filter(w => w.length >= 3).forEach(w => {
	// 		this.allGroupRows.forEach(async cat => {
	// 			//const parentId = cat.id;
	// 			//let j = 0;
	// 			// cat.words.forEach(catw => {
	// 			// 	if (catw.includes(w)) {
	// 			// 		console.log("Add all answers of group")
	// 			// 		arr.push({ id: cat.id, title: cat.title })
	// 			// 	}
	// 			// })
	// 		})
	// 	})
	// 	return arr;
	// }

	protected async getSuggestions(search: string): Promise<ICatSection[]> {
		const escapedValue = escapeRegexCharacters(search.trim());
		if (escapedValue === '') {
			return [];
		}
		if (search.length < 3)
			return [];
		const catSection = new Map<string | null, IAnswerRow[]>();
		const answerKeys: IAnswerKey[] = [];
		try {
			console.log('--------->>>>> getSuggestions')
			var answerRows: IAnswerRow[] = await this.searchAnswers(escapedValue, 10);
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
			})
		}
		catch (error: any) {
			console.debug(error)
		};

		////////////////////////////////////////////////////////////////////////////////
		// Search for Categories title words, and add all the answers of the Group
		/*
		if (answerKeys.length === 0) {
			try {
				const tx = this.dbp!.transaction('Answers')
				const index = tx.store.index('parentGroup_idx');
				const catIdTitles = this.satisfyingCategories(searchWords)
				let i = 0;
				while (i < catIdTitles.length) {
					const catIdTitle = catIdTitles[i];
					const parentId = catIdTitle.id;
					for await (const cursor of index.iterate(parentId)) {
						const q: IAnswer = cursor.value;
						const { id, title } = q;
						//if (!answerRows.includes(id!))
						//	answerRows.push(id!);

						const answerKey = { parentId, id }
						if (!answerKeys.includes(answerKey)) {
							answerKeys.push(answerKey);

							//console.log(q);
							// 2) Group answers by parentId
							const quest: IAnswerRow = {
								id,
								parentId,
								title,
								groupTitle: catIdTitle.title
							}
							if (!catQuests.has(parentId)) {
								catQuests.set(parentId, [quest]);
							}
							else {
								catQuests.get(parentId)!.push(quest);
							}
						}
					}
					await tx.done;
				}
			}
			catch (error: any) {
				console.debug(error)
			};
		}
		await tx.done;
		*/

		if (answerKeys.length === 0)
			return [];

		try {
			////////////////////////////////////////////////////////////
			// map
			// 0 = {'DALJINSKI' => IAnswerRow[2]}
			// 1 = {'EDGE2' => IAnswerRow[3]}
			// 2 = {'EDGE3' => IAnswerRow[4]}4

			////////////////////////////////////////////////////////////
			// 
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
					const cat = this.allGroupRows.get(id);
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
				// const catSection: ICatSection = {
				// 	id: id,
				// 	groupTitle: title,
				// 	groupParentTitle: 'kuro',
				// 	parentGroupUp: titlesUpTheTree!,
				// 	answerRows: []
				// };
				quests.forEach(quest => {
					// console.log(quest);
					/*
					if (variationsss.length > 0) {
						let wordsIncludesTag = false;
						// searchWords.forEach(w => {
						// 	variationsss.forEach(variation => {
						// 		if (variation === w.toUpperCase()) {
						// 			wordsIncludesTag = true;
						// 			catSection.quests.push({ ...quest, title: quest.title + ' ' + variation });
						// 		}
						// 	})
						// })
						if (!wordsIncludesTag) {
							// variationsss.forEach(variation => {
							// 	// console.log(quest);
							// 	catSection.answerRows.push({ ...quest, title: quest.title + ' ' + variation });
							// });
						}
					}
					else {
					*/
					catSection.answerRows.push(quest);
					/*}*/
				});
				catSections.push(catSection);
				//console.log(catSections)
			});
			return catSections;
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

	/*
	protected renderSuggestion(suggestion: Answer, params: Autosuggest.RenderSuggestionParams): JSX.Element {
		 const className = params.isHighlighted ? "highlighted" : undefined;
		 return <span className={className}>{suggestion.name}</span>;
	}
	*/

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

	// protected renderSuggestionsContainer({ containerProps, children, query }:
	// 	Autosuggest.RenderSuggestionsContainerParams): JSX.Element {
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