import { useState } from "react";
import { useGroupContext } from '@/groups/GroupProvider'
import { useGlobalState } from '@/global/GlobalProvider'

import GroupForm from "@/groups/components/GroupForm";
import { FormMode, type IGroup } from "@/groups/types";

const AddGroup = ({ activeGroup }: { activeGroup: IGroup | null }) => {
    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;
    const { cancelAddGroup, createGroup } = useGroupContext();
    //const { activeGroup } = state;

    const [formValues] = useState<IGroup>({ ...activeGroup! });

     const cancel = async () => {
        await cancelAddGroup();
    }

    const close = async () => {
        await cancelAddGroup();
    }
    const submitForm = async (group: IGroup) => {
        const cat: IGroup = {
            ...group,
            created: {
                time: new Date(),
                nickName: nickName
            },
            modified: undefined
        }
        console.log("**********object", cat)
        await createGroup(cat);
    }
    if (!activeGroup === null)
        return null;

    console.log('AddGroup render >>>>>:', activeGroup);
    return (
        <>
            {/* {inLine ?
                <InLineGroupForm
                    inLine={true}
                    group={formValues}
                    mode={FormMode.adding}
                    submitForm={submitForm}
                >
                    Create
                </InLineGroupForm>
                : */}
            <GroupForm
                inLine={false}
                group={formValues}
                answerId={null}
                formMode={FormMode.AddingGroup}
                cancel={cancel}
                close={close}
                submitForm={submitForm}
            >
                Create Group
            </GroupForm >
            {/* } */}
        </>
    )
}

export default AddGroup
