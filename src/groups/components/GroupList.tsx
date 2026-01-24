import { ListGroup } from "react-bootstrap";
import GroupRow from "@/groups/components/GroupRow";
import type { IGroupRow, IParentInfo } from "@/groups/types";
import { useGroupContext } from "@/groups/GroupProvider";

const GroupList = ({ groupRow }: IParentInfo) => {

    const { level, groupRows } = groupRow;

    const { state } = useGroupContext();
    let { keyExpanded } = state;
    const { answerId } = keyExpanded ?? { topId: '', groupId: '', answerId: null };

    return (
        <div className={level! > 1 ? 'ms-2' : ''} >
            <ListGroup as="ul" variant='dark' className="mb-0 group-bg">
                {groupRows!.map((c: IGroupRow) =>
                    <GroupRow
                        //groupRow={{ ...c, isSelected: c.id === id }}
                        groupRow={c}
                        answerId={answerId === '' ? null : answerId}
                        // {c.topId === topId && c.id === id ?answerId : null}
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
