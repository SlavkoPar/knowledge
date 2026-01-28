
import { useGroupContext } from '@/groups/GroupProvider'

import { FormMode } from "@/groups/types";
import GroupForm from "@/groups/components/GroupForm";

const ViewGroup = ({ inLine }: { inLine: boolean }) => {
    const { state, cancelAddGroup } = useGroupContext();
    const { activeGroup, keyExpanded } = state;
    const { answerId } = keyExpanded!;
    const close = async () => {
        await cancelAddGroup();
    }
    return (
        <GroupForm
            inLine={inLine}
            group={{ ...activeGroup! }}
            answerId={answerId}
            formMode={FormMode.ViewingGroup}
            close={close}
            cancel={close}
            submitForm={() => { }}
        >
            View Group
        </GroupForm>
    );
}

export default ViewGroup;
