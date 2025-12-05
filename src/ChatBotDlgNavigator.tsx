import { useContext, type ReactNode, forwardRef, useImperativeHandle, useState } from 'react';
import { Accordion, AccordionContext, Button, Card, useAccordionButton } from "react-bootstrap";
import { useNavigate } from "react-router-dom";


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

const ChatBotDlgNavigator = forwardRef<IChatBotDlgNavigatorMethods, { allCategoryRows: ICategoryRow[] }>(
    ({ allCategoryRows }, ref) => {

        const navigate = useNavigate();
        // const linkGo = (link: string) => {
        //     navigate(link);
        // }

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
                                ? <Button href="#" variant="link" className="cat-link" onClick={() => navigate(`${row.link}/from_chat`)}>{row.title}</Button>
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
            const parentCat = allCategoryRows.find(x => id === x.id);
            if (parentCat) {
                e.stopPropagation();
                e.preventDefault();
            }
            // console.log('onSelectCategory', { parentCat, eventKey, e });
        }

        //////////////////
        const loadSubTree = async (categoryRow: ICategoryRow): Promise<boolean> => {
            const { id } = categoryRow;
            allCategoryRows.forEach(async (row) => {
                if (row.id !== id && row.parentId === id) {
                    await loadSubTree(row);
                    categoryRow.categoryRows.push(row);
                }
            });
            return true;
        };

        //////////////////
        const resetNavigator = (): void => {
            setTopRows([]);
            allCategoryRows.forEach(async (categoryRow) => {
                categoryRow.categoryRows = [];
                if (categoryRow.parentId === null) {
                    await loadSubTree(categoryRow);
                    setTopRows(prevTopRows => [...prevTopRows, categoryRow]);
                }
            });
        }


        useImperativeHandle(ref, () => ({
            resetNavigator
        }), []);

        return (
            <Accordion defaultActiveKey="" alwaysOpen={true} onSelect={onSelectCategory} >
                <CatList rows={topRows}></CatList>
            </Accordion>
        );
    });

export default ChatBotDlgNavigator;