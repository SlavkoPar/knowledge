import { useContext, type ReactNode, useCallback, forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Accordion, AccordionContext, Card, useAccordionButton } from "react-bootstrap";


// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFolder } from '@fortawesome/free-solid-svg-icons'

import { type ICategoryRow } from '@/categories/types';

//import Q from '@/assets/Q.png';
//import A from '@/assets/A.png';
import type { AccordionEventKey } from 'react-bootstrap/esm/AccordionContext';
import type { IChatBotDlgNavigatorMethods } from './global/types';
// import { useCategoryDispatch } from '@/categories/CategoryProvider';


const PINK = 'rgba(255, 192, 203, 0.6)';
const BLUE = 'rgb(224, 207, 252)';

const ChatBotDlgNavigator = forwardRef<IChatBotDlgNavigatorMethods, { allCategoryRows: Map<String, ICategoryRow> }>(
    ({ allCategoryRows }, ref) => {

        const [topRows, setTopRows] = useState<ICategoryRow[]>([]);

        function ContextAwareToggle({ children, eventKey, hasSubCategories, callback }:
            { children: ReactNode; eventKey: AccordionEventKey; hasSubCategories: boolean; callback?: (eventKey?: AccordionEventKey) => void }) {

            const { activeEventKey } = useContext(AccordionContext);
            const decoratedOnClick = useAccordionButton(
                String(eventKey ?? ''),
                () => callback && callback(eventKey),
            );
            const isCurrentEventKey = activeEventKey === eventKey;
            return (
                <button
                    type="button"
                    className={`accordion-button${!hasSubCategories ? ' hide-icon' : ''}`}
                    style={{
                        backgroundColor: isCurrentEventKey ? PINK : BLUE
                    }}
                    onClick={decoratedOnClick}
                >
                    {children}
                </button>
            );
        }

        const CatRow = ({ row }: { row: ICategoryRow }) => {
            return (
                <Card>
                    <Card.Header>
                        <ContextAwareToggle eventKey={row.id} hasSubCategories={row.hasSubCategories}>
                            {row.link
                                ? <a href={`${row.link}/true`} className="cat-link">{row.title}</a>
                                : <span className="cat-title">{row.title}</span>
                            }
                        </ContextAwareToggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey={row.id}>
                        <Card.Body>
                            {row.hasSubCategories &&
                                <CatList rows={row.categoryRows} />
                            }
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>

                // <Accordion.Item key={row.id} eventKey={row.id}>
                //     <Accordion.Header>
                //         <ContextAwareToggle eventKey={row.id} hasSubCategories={row.hasSubCategories}>
                //             {row.title}
                //         </ContextAwareToggle>
                //     </Accordion.Header>
                //     {row.hasSubCategories && <Accordion.Collapse eventKey={row.id}>
                //         {/* <Accordion.Body> */}
                //         {row.hasSubCategories &&
                //             <CatList rows={row.categoryRows} />
                //         }
                //         {/* </Accordion.Body> */}
                //     </Accordion.Collapse>
                //     }

                // </Accordion.Item>
            )
        }

        const CatList = ({ rows }: { rows: ICategoryRow[] }) => {
            return (
                <>
                    {rows.map((row) => (
                        <CatRow key={row.id} row={row} />
                    ))}
                </>
            )
        }

        const onSelectCategory = async (eventKey: AccordionEventKey, e: React.SyntheticEvent<unknown>) => {
            const id = eventKey![0];
            console.log(allCategoryRows, allCategoryRows.get(id));
            e.preventDefault();
            console.log('onSelectCategory', { eventKey, e });
            //await getSubCats(eventKey as string);
        }

        const loadSubTree = useCallback(async (categoryRow: ICategoryRow) => {
            const { id } = categoryRow;
            allCategoryRows.forEach(async (catRow) => {
                catRow.categoryRows = [];
                if (catRow.id !== id && catRow.parentId === id) {
                    await loadSubTree(catRow);
                    categoryRow.categoryRows.push(catRow)
                }
            });
            //return subCats;
        }, [allCategoryRows]);

        const resetNavigator = (): void => {
            setTopRows([]);
            const topRowsTmp: ICategoryRow[] = []
            allCategoryRows.forEach(async (categoryRow) => {
                if (categoryRow.parentId === null) {
                    categoryRow.categoryRows = [];
                    loadSubTree(categoryRow);
                    topRowsTmp.push(categoryRow);
                }
            });
            setTopRows(topRowsTmp);
        }

        useEffect(() => {
            // resetNavigator();
        }, [])

        useImperativeHandle(ref, () => ({
            resetNavigator
            //loadSubTree: (categoryRow: ICategoryRow|null) => loadSubTree(categoryRow)
        }), []);

        return (
            <Accordion defaultActiveKey="MTS" alwaysOpen={true} onSelect={onSelectCategory} >
                <CatList rows={topRows}></CatList>
            </Accordion>
        );
    });

export default ChatBotDlgNavigator;