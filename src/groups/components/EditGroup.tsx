import { useGroupContext } from '@/groups/GroupProvider'
import { useGlobalState } from '@/global/GlobalProvider'

import GroupForm from "@/groups/components/GroupForm";
import { FormMode, type IGroup } from "@/groups/types";

const EditGroup = ({ inLine }: { inLine: boolean }) => {
    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;

    const { state, updateGroup, cancelAddGroup } = useGroupContext();

    const { activeGroup, keyExpanded } = state;
    const { answerId } = keyExpanded!;

    const cancel = async () => {
        await cancelAddGroup();
    }

    const close = async () => {
        await cancelAddGroup();
    }

    const submitForm = async (groupObject: IGroup) => {
        const object: IGroup = {
            ...groupObject,
            created: undefined,
            modified: {
                time: new Date(),
                nickName: nickName
            }
        }
        await updateGroup(object, true /* closeForm */)
    };

    return (
        <GroupForm
            inLine={inLine}
            group={{ ...activeGroup! }}
            answerId={answerId}
            formMode={FormMode.EditingGroup}
            cancel={cancel}
            close={close}
            submitForm={submitForm}
        >
            Update Group
        </GroupForm>
    );
};

export default EditGroup;
