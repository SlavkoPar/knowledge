import{r,ar as ce,n as e,as as k,t as de,u as ue,c as xe,at as S,v as me,R as z,p as H,B as R,au as he,q as we,k as E}from"./index-ChErOrSK.js";import{A as ge}from"./AutoSuggestQuestions-0y0Zqmgm.js";import"./lib-LZpFbUG8.js";class _{constructor(h){const{topId:w,id:g,answerTitle:p,answerLink:f}=h;this.chatBotAnswer={topId:w,id:g,answerTitle:p??"",answerLink:f??"",created:h.created,modified:h.modified}}chatBotAnswer}const pe=()=>{const[l,h]=r.useState(null),[w,g]=r.useState(0),p=async u=>{h(u);let c=!1,x=null;if(u){const{assignedAnswers:n}=u;if(n&&n.length>0){const o=n[0];x=new _(o).chatBotAnswer,c=n.length>1,g(0)}}return{firstChatBotAnswer:x,hasMoreAnswers:c}},f=r.useCallback(async()=>l,[l]),j=r.useCallback(async()=>{const{assignedAnswers:u}=l,c=u.length,x=w+1;return w+1<c?(g(x),{nextChatBotAnswer:new _(u[x]).chatBotAnswer,hasMoreAnswers:x+1<c}):{nextChatBotAnswer:null,hasMoreAnswers:!1}},[l,w]);return[p,f,j]},fe=r.forwardRef(({allCategoryRows:l},h)=>{const w=ce(),[g,p]=r.useState([]),f=({row:n})=>{const{id:o,hasSubCategories:m,title:y,link:t}=n;return e.jsxs(k.Item,{eventKey:o,children:[e.jsx(k.Header,{className:`${m?"":"hide-icon"}`,children:n.link?e.jsx("a",{href:"#",className:"cat-link",onClick:()=>w(`${t}/from_chat`),children:y}):e.jsx("span",{className:"cat-title",children:y})}),e.jsx(k.Body,{children:n.hasSubCategories&&e.jsx(j,{rows:n.categoryRows})})]})},j=({rows:n})=>e.jsx(e.Fragment,{children:n.map(o=>e.jsx(f,{row:o},o.id))}),u=async(n,o)=>{const m=n[0],y=l.find(t=>m===t.id);console.log("onSelectCategory",{cat:y,eventKey:n,e:o})},c=async n=>{const{id:o}=n;return l.forEach(async m=>{m.id!==o&&m.parentId===o&&(await c(m),n.categoryRows.push(m))}),!0},x=()=>{p([]),l.forEach(async n=>{n.categoryRows=[],n.parentId===null&&(await c(n),p(o=>[...o,n]))})};return r.useImperativeHandle(h,()=>({resetNavigator:x}),[]),e.jsx(k,{defaultActiveKey:"",alwaysOpen:!0,onSelect:u,children:e.jsx(j,{rows:g})})}),Ae=({show:l,onHide:h})=>{let{tekst:w}=de();const[g,p]=r.useState(w),[f,j,u]=pe(),[c,x]=r.useState(null),[n,o]=r.useState(1),[m,y]=r.useState(!1),[t,v]=r.useState(null),[$,C]=r.useState(!1),{loadAllCategoryRowsGlobal:I,getQuestion:V,addHistory:D,addHistoryFilter:W,searchQuestions:J}=ue(),{authUser:B,isDarkMode:P,allCategoryRowsGlobalLoaded:T,allCategoryRowsGlobal:M}=xe(),[X]=r.useState(!0),[q,K]=r.useState(!0),[F,Y]=r.useState([]),G=r.useRef(null),[Z,N]=r.useState([]);let L;(s=>{s[s.AUTO_SUGGEST=0]="AUTO_SUGGEST",s[s.QUESTION=1]="QUESTION",s[s.ANSWER=2]="ANSWER"})(L||(L={})),r.useEffect(()=>{(async()=>T?Y(Array.from(M.values())):await I())()},[T,I]);const ee=async()=>{const s=performance.now();await G?.current?.resetNavigator();const a=performance.now()-s;console.log(`Execution time: ${a} milliseconds`)},te=r.useRef(null),se=async(s,i)=>{const a=await j();if(a){console.log({questionCurr:a});const b={questionKey:new E(a).questionKey,filter:i,created:{time:new Date,nickName:B.nickName}};await W(b)}if(t){const b={type:2,isDisabled:!0,txt:t.answerTitle,link:t.answerLink};N(Q=>[...Q,b])}const A=await V(s),{question:d}=A;if(!d)return;d.numOfRelatedFilters>0&&p(d.relatedFilters[0].filter);const oe=await f(d);let{firstChatBotAnswer:ie,hasMoreAnswers:le}=oe;if(d){const b={type:1,isDisabled:!0,txt:d.title,link:null};N(Q=>[...Q,b])}o(b=>b+1),K(!1),x(d),y(!0),C(le),v(ie)},ne=async()=>{const s={type:2,isDisabled:!0,txt:t?t.answerTitle:"no answer title",link:t?t.answerLink:"no answer link",hasMoreAnswers:!0};N(a=>[...a,s]);const i={questionKey:new E(c).questionKey,assignedAnswerKey:{topId:t.topId,id:t.id},userAction:"Fixed",created:{nickName:B.nickName,time:new Date}};D(i),C(!1),v(t),y(!1)},re=async()=>{const s={type:2,isDisabled:!0,txt:t?t.answerTitle:"no answer",link:t?t.answerLink:"no link",hasMoreAnswers:!0};N(d=>[...d,s]);const i=await u(),{nextChatBotAnswer:a,hasMoreAnswers:A}=i;if(t){const d={questionKey:new E(c).questionKey,assignedAnswerKey:{topId:t.topId,id:t.id},userAction:a?"NotFixed":"NotClicked",created:{nickName:B.nickName,time:new Date}};D(d)}C(A),console.log("----->>>>",{nextChatBotAnswer:a}),v(a)},ae=s=>{const{txt:i}=s;return e.jsx("div",{id:n.toString(),className:"d-flex flex-row mx-0 justify-content-start align-items-center",children:e.jsxs("div",{className:"d-flex flex-row mx-0 justify-content-start align-items-center",children:[e.jsx("img",{width:"22",height:"18",src:we,alt:"Question",className:"ms-1"}),e.jsx("div",{className:"p-1 bg-warning text-light flex-wrap text-wrap border rounded-1",children:i})]})})},O=s=>{console.log("--------------------------------------AnswerComponent",s);const{isDisabled:i,txt:a,link:A}=s;return e.jsx("div",{id:t?.id,className:`${P?"dark":"light"} mt-1 mx-1 border border-0 rounded-1`,children:e.jsxs("div",{className:"d-flex flex-row mx-0 justify-content-start align-items-center",children:[e.jsxs("div",{className:"d-flex flex-row mx-0 justify-content-start align-items-center",children:[e.jsx("img",{width:"22",height:"18",src:he,alt:"Answer",className:"ms-1"}),A?e.jsx("div",{className:"p-1 bg-info text-light flex-wrap text-wrap border rounded-1 ",children:e.jsx("a",{href:A,rel:"noopener noreferrer",target:"_blank",className:"text-light text-decoration-underline",children:a})}):e.jsx("div",{className:"p-1 bg-info text-light flex-wrap text-wrap border rounded-1",children:a})]}),!i&&t&&e.jsxs("div",{children:[e.jsx(R,{size:"sm",type:"button",onClick:ne,disabled:!t,className:"align-middle ms-1 px-1  py-0",variant:"success",children:"Fixed"}),e.jsx(R,{size:"sm",type:"button",onClick:re,disabled:!t,className:"align-middle ms-1 border border-1 rounded-1 px-1 py-0",variant:"danger",children:"Not fixed"})]})]})})},U=s=>{const{isDisabled:i,txt:a}=s;return e.jsxs("div",{className:"dark",children:[e.jsx("label",{className:"text-warning",children:"Please enter the Question"}),e.jsx("div",{className:"text-start",children:e.jsxs("div",{className:"questions",children:[i&&e.jsx("div",{children:a}),!i&&e.jsx(ge,{tekst:a,onSelectQuestion:se,allCategoryRows:M,searchQuestions:J})]})})]})};return console.log("=====================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> rendering ChatBotDlg"),F.length===0?e.jsx("div",{children:"Loading ..."}):e.jsxs("div",{className:"pe-6 overflow-auto chat-bot-dlg",children:[e.jsx("style",{children:`
                /*
                .card-header {
                    padding: 0.0rem 0.03rem;
                    padding-right: 0;
                    font-size: 0.8rem;
                }
                    */

                // .card-header button  {
                //     border: 0.3px solid silver;
                //     border-radius: 3px;
                //     text-align: left;
                // }

                .accordion-body {
                    padding: 0.0rem 0.5rem;
                    padding-right: 0;
                    font-size: 0.6rem;
                }

                .accordion-button  {
                    padding: 0rem 0.2rem !important;
                    padding-right: 0 !important;
                    border: 0; //px solid inset;
                    //border-radius: 3px;
                    //text-align: left;
                    font-size: 1rem;
                }
                    
                ul {
                    list-style-type: none;
                }

                .cat-link {
                    // text-decoration:  none;
                    color: inherit;
                }

                .cat-link.btn {
                    padding: 0;
                }

                .cat-title {
                    // text-decoration:  none;
                    color: inherit;
                }

                .accordion-header.hide-icon > button.accordion-button::after {
                    display: none;
                    padding: 0rem 0.2rem !important;
                    padding-right: 0 !important;
                }

                // .accordion-button.hide-icon::after {
                //     display: none;
                //     padding: 0rem 0.2rem !important;
                //     padding-right: 0 !important;
                // }

            }

            `}),e.jsxs(S,{show:l,onHide:h,placement:"end",scroll:!0,backdrop:!0,onEntering:ee,children:[" ",e.jsx(S.Header,{closeButton:!0,children:e.jsx(S.Title,{className:"fs-6",children:"I am your Buddy"})}),e.jsx(S.Body,{className:"p-0 border border-1 rounded-3",children:e.jsxs(me,{id:"container",fluid:!0,className:"text-primary",children:[" ",e.jsx(z,{className:"m-0",children:e.jsx(H,{className:"border border-0 border-primary mx-1 text-white p-0",children:e.jsx(fe,{allCategoryRows:F,ref:G})})}),e.jsx(z,{className:"m-0",children:e.jsxs(H,{className:"border border-0 border-primary mx-1 text-white p-0",children:[e.jsx("div",{className:"history",children:Z.map(s=>{switch(s.type){case 0:return e.jsx(U,{...s});case 1:return e.jsx(ae,{...s});case 2:return e.jsx(O,{...s});default:return e.jsx("div",{children:"unknown"})}})},"history"),m&&e.jsx("div",{children:e.jsx(O,{type:2,isDisabled:!1,txt:t?t.answerTitle:"no answers",hasMoreAnswers:$,link:t?t.answerLink:""})},"answer"),X&&!q&&e.jsx(R,{variant:"secondary",size:"sm",type:"button",onClick:()=>{o(n+1),K(!0)},className:"m-1 border border-1 rounded-1 py-0",children:"New Question"},"newQuestion"),q&&e.jsx("div",{className:"pb-35 questions",children:e.jsx(U,{type:0,isDisabled:!1,txt:g,link:null})}),e.jsx("div",{ref:te,children:"dno dna"})]})})]})})]})]})};export{Ae as default};
//# sourceMappingURL=ChatBotDlg-DGy1oduU.js.map
