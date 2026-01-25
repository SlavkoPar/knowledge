import { GroupKey, type IGroupRow, type ILoadGroupAnswers, type IAnswerRow } from "@/groups/types";
import { useGroupContext } from "@/groups/GroupProvider";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { List, ListItem, Loading } from "@/common/components/InfiniteList";
import AnswerRow from "@/groups/components/answers/AnswerRow";

//const AnswerList = ({ title, groupRow, level }: IParentInfo) => {
const AnswerList = ({ groupRow }: { groupRow: IGroupRow }) => {
  const { state, loadGroupAnswers } = useGroupContext();
  const { keyExpanded, loadingAnswer, error, selectedAnswerId } = state;
  const { answerId } = keyExpanded!;
  //? keyExpanded

  groupRow.level += 1;
  const { answerRows } = groupRow;
  // console.log('@@@@@@@@@@@@@ AnswerList', { answerRows })

  let hasMoreAnswers = false;

  async function loadMore() {
    try {
      // const parentInfo: IParentInfo = {
      //   groupRow,
      //   startCursor: answerRows.length,
      //   includeAnswerId: answerId ?? null
      // }

      const x: ILoadGroupAnswers = {
        groupKey: new GroupKey(groupRow).groupKey!,
        startCursor: answerRows!.length,
        includeAnswerId: answerId ?? null
      }
      console.log('^^^^^^^^^^^^^ loadMore')
      console.log('^^^^^^^^^^^^^', { x })
      console.log('^^^^^^^^^^^^^ loadMore')
      await loadGroupAnswers(x);
    }
    catch (error) {
    }
    finally {
    }
  }

  // useEffect(() => {
  //   //if (numOfAnswers > 0 && answerRows.length === 0) { // TODO
  //   if (answerRows.length === 0) { // TODO
  //     loadMore();
  //   }
  // }, [numOfAnswers, answerRows])


  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: loadingAnswer,
    hasNextPage: hasMoreAnswers!,
    onLoadMore: loadMore,
    disabled: Boolean(error),
    rootMargin: '0px 0px 100px 0px',
  });

  // console.log("QQQQQQQQQQQQQQQQQQQQQQQQQQQQQ AnswerList", answerRows)
  // if (loadingAnswer)
  //   return <div> ... loading</div>

  return (
    <div
      ref={rootRef}
      className="ms-0" // border border-1 border-info rounded-2"
      // className="max-h-[500px] max-w-[500px] overflow-auto bg-slate-100"
      style={{ maxHeight: '400px', overflowY: 'auto' }}
    >
      <List>
        {answerRows!.length === 0 &&
          <label>No answers</label>
        }
        {answerRows!.map((answerRow: IAnswerRow) => {
          return <AnswerRow key={answerRow.id} answerRow={answerRow} isSelected={answerRow.id === selectedAnswerId} />
        })}
        {hasMoreAnswers && (
          <ListItem ref={infiniteRef}>
            <Loading />
          </ListItem>
        )}
      </List>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
};

export default AnswerList;
