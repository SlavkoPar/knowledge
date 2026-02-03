import { useEffect, useRef, type ChangeEvent, type FormEvent, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Form, CloseButton, Row, Stack } from "react-bootstrap";
import { CreatedModifiedForm } from "@/common/CreateModifiedForm"
import { FormButtons } from "@/common/FormButtons"
import type { IGroupFormProps, IGroup, IVariation, IGroupKey } from "@/groups/types";
import { FormMode, ActionTypes, GroupKey } from "@/groups/types";

import { useGroupContext, useGroupDispatch } from "@/groups/GroupProvider";
import AnswerList from "@/groups/components/answers/AnswerList";
import VariationList from "@/groups/VariationList";
import { Select } from "@/common/components/Select";
import { kindOptions } from "@/common/Options";
import { useDebounce } from "@uidotdev/usehooks";

const GroupForm = ({ formMode, group, submitForm, children }: IGroupFormProps) => {

  //const { globalState } = useGlobalContext();
  //const { isDarkMode, variant, bg } = globalState;

  const { onGroupTitleChanged } = useGroupContext();

  const viewing = formMode === FormMode.ViewingGroup;
  const editing = formMode === FormMode.EditingGroup;
  const adding = formMode === FormMode.AddingGroup;

  const { topId, id, variations, answerRows, title: catTitle } = group;
  console.log('GroupForm render: ', { topId, id, catTitle, formMode })
  const groupKey: IGroupKey = new GroupKey(group).groupKey!;
  //const groupKeyExpanded: IAnswerKey = { topId, id, answerId };

  if (!document.getElementById('div-details')) {

  }
  const showAnswers = answerRows && answerRows.length > 0 //!answers.find(q => q.inAdding);
  /* 
  We have, at two places:
    <EditGroup inLine={true} />
    <EditGroup inLine={false} />
    so we execute loadGroupAnswers() twice in AnswerList, but OK
  */

  const dispatch = useGroupDispatch();

  const closeForm = () => {
    dispatch({ type: ActionTypes.CLOSE_GROUP_FORM, payload: {} })
  }

  const cancelForm = () => {
    dispatch({ type: ActionTypes.CANCEL_GROUP_FORM, payload: {} })
  }

  const [searchTerm, setSearchTerm] = useState(catTitle);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: group,
    validationSchema: Yup.object().shape({
      title: Yup.string().required("Required"),
      // email: Yup.string()
      //   .email("You have enter an invalid email address")
      //   .required("Required"),
      // rollno: Yup.number()
      //   .positive("Invalid roll number")
      //   .integer("Invalid roll number")
      //   .required("Required"),
    }),
    onSubmit: (values: IGroup) => {
      //alert(JSON.stringify(values, null, 2));
      console.log('GroupForm.onSubmit', JSON.stringify(values, null, 2))
      submitForm(values);
      //props.handleClose(false);
      setSearchTerm(values.title);
    }
  });

   useEffect(() => {
    const goBre = async () => {
      console.log('GroupForm.useEffect - onGroupTitleChanged', { debouncedSearchTerm, title: formik.values.title });
      if (/*debouncedSearchTerm &&*/ formik.values.title !== debouncedSearchTerm) {
        /*await*/ onGroupTitleChanged(topId, id, formik.values.title);
      }
    };
    goBre();
  }, [debouncedSearchTerm, formik.values.title, onGroupTitleChanged]);

  const handleChangeTitle = (event: ChangeEvent<HTMLTextAreaElement>) => {
    formik.handleChange(event);
    const value = event.target.value;
    //if (value !== debouncedTitle)
    //setTitle(value);
    setSearchTerm(value);
  };

  // eslint-disable-next-line no-self-compare
  // const nameRef = useRef<HTMLAreaElement | null>(null);
  const nameRef = useRef<HTMLTextAreaElement>(null);


  //useEffect(() => {
    //setTitle(group.title);
    //nameRef.current?.focus()
    //nameRef.current?.select()
  //}, [nameRef])

  const isDisabled = false;

  console.log('GroupForm render return: ', searchTerm);

  return (
    // data-bs-theme={`${isDarkMode ? 'dark' : 'light'}`}
    <div className="form-wrapper p-2 group-form" >
      <CloseButton onClick={closeForm} className="float-end" />
      <Row className='text-center text-muted'>
        <Form.Label>Group {viewing ? 'Viewing' : editing ? 'Editing' : 'Adding'}</Form.Label>
      </Row>
      <Form onSubmit={() => formik.handleSubmit}>

        <Form.Group controlId="Variations">
          <Stack direction="horizontal" gap={1}>
            <div className="px-0"><Form.Label>Variations:</Form.Label></div>
            <div className="px-1 border border-1 border-secondary rounded">
              <VariationList
                groupKey={groupKey}
                variations={variations
                  ? variations.map(variation => ({ name: variation } as IVariation))
                  : []
                }
              />
            </div>
            <div className="ps-2"><Form.Label>Kind:</Form.Label></div>
            <div className="px-1 border border-1 border-secondary rounded">
              <Form.Group controlId="kind">
                {/* <Form.Label>Kind</Form.Label> */}
                <Select
                  id="kind"
                  name="kind"
                  options={kindOptions}
                  onChange={(e: FormEvent<HTMLSelectElement>, value: any) => {
                    e.preventDefault(); // ?
                    formik.setFieldValue('kind', value)
                    // .then(() => { if (editing) formik.submitForm() })
                  }}
                  value={formik.values.kind}
                  disabled={isDisabled}
                  classes="text-primary"
                />
                <Form.Text className="text-danger">
                  {formik.touched.kind && formik.errors.kind ? (
                    <div className="text-danger">{formik.errors.kind}</div>
                  ) : null}
                </Form.Text>
              </Form.Group>
            </div>
          </Stack>
        </Form.Group>

        <Form.Group controlId="title">
          <Form.Label>Title</Form.Label>
          <Form.Control
            as="textarea"
            name="title"
            placeholder={"new Group"}
            value={searchTerm}
            onChange={handleChangeTitle}
            onFocus={(e) => { if (formMode === FormMode.AddingGroup) e.target.select()}}
            ref={nameRef}
            //onChange={handleChangeTitle}
            // onChange={(e: any, value: any): {e: ChangeEvent<HTMLTextAreaElement>, value: string} => {
            //         formik.handleChange(e, value);
            //         console.log(value)
            //       }}
            //onBlur={formik.handleBlur}
            // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
            //   if (isEdit && formik.initialValues.title !== formik.values.title)
            //     formik.submitForm();
            // }}
            rows={3}
            className="text-primary w-100"
            disabled={viewing}
          />
          <Form.Text className="text-danger">
            {formik.touched.title && formik.errors.title ? (
              <div className="text-danger">{formik.errors.title}</div>
            ) : null}
          </Form.Text>
        </Form.Group>


        <Form.Group controlId="link">
          <Form.Label>Link</Form.Label>
          {formik.values.hasSubGroups
            ? <Form.Control
              as="input"
              placeholder="/groups/..."
              name="link"
              onChange={formik.handleChange}
              //onBlur={formik.handleBlur}
              // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
              //   if (isEdit && formik.initialValues.title !== formik.values.title)
              //     formik.submitForm();
              // }}
              className="text-primary w-100"
              value={"Can't have link (has sub groups)"}
              disabled={true}
            />
            : <>
              <Form.Control
                as="input"
                placeholder="/groups/..."
                name="link"
                onChange={formik.handleChange}
                //onBlur={formik.handleBlur}
                // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
                //   if (isEdit && formik.initialValues.title !== formik.values.title)
                //     formik.submitForm();
                // }}
                className="text-primary w-100"
                value={formik.values.link ?? ''}
                disabled={viewing}
              />
              <Form.Text className="text-danger">
                {formik.touched.link && formik.errors.link ? (
                  <div className="text-danger">{formik.errors.link}</div>
                ) : null}
              </Form.Text>
            </>
          }
        </Form.Group>

        {/* <Form.Group>
          <Form.Label>Number of Answers </Form.Label>
          <div className="text-secondary">{formik.values.numOfAnswers}</div>
          // <div className="p-1 bg-dark text-white">{createdBy}, {formatDate(created.date)}</div> 
        </Form.Group> */}

        <Form.Group>
          <Form.Label className="m-1 mb-0">Answers ({`${formik.values.numOfAnswers}`}) </Form.Label>
          {showAnswers &&
            <AnswerList groupRow={group} />  // IGroup extends IGroupRow
          }
        </Form.Group>

        {(viewing || editing) &&
          <CreatedModifiedForm
            created={group.created}
            modified={group.modified}
            classes="text-primary"
          />
        }

        {((formik.dirty && editing) || adding) &&
          <FormButtons
            cancelForm={cancelForm}
            handleSubmit={formik.handleSubmit}
            title={children}
          />
        }
      </Form>
    </div >
  );
};

export default GroupForm;