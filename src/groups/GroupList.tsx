import { ListGroup } from "react-bootstrap";
import GroupRow from "@/groups/components/GroupRow";
import type { IGroupRow, IParentInfo } from "@/groups/types";
import { useGroupContext } from "@/groups/GroupProvider";

const GroupList = ({ groupRow, title }: IParentInfo) => {

    const { state } = useGroupContext();
    let { keyExpanded } = state;
    const { answerId } = keyExpanded ?? { topId: '', groupId: '', answerId: null };

    let level = 1;
    let groupRows: IGroupRow[] = [];
    if (title === 'ROOT') {
        groupRows = state.topRows;
    }
    else {
        groupRows = groupRow!.groupRows;
        level = groupRow!.level;
    }

    return (
        <div className={level! > 1 ? 'ms-2' : ''} >
            <ListGroup as="ul" variant='dark' className="mb-0 group-bg">
                {groupRows!.map((c: IGroupRow) =>
                    <GroupRow
                        //groupRow={{ ...c, isSelected: c.id === id }}
                        groupRow={c}
                        answerId={answerId === '' ? null : answerId}
                        // {c.topId === topId && c.id === id ? answerId : null}
                        key={c.id}
                    />
                )}
            </ListGroup>
            {/* {state.error && state.error} */}
            {/* {state.loading && <div>...loading</div>} */}
        </div>
    );
};

export default GroupList;
