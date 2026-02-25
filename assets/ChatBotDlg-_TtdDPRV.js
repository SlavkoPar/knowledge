import{r,au as ue,n as e,av as S,v as xe,u as me,c as he,aw as k,w as we,R as U,q as z,B as R,V as ge,s as pe,k as E}from"./index-DVrvjaPi.js";import{A as fe}from"./AutoSuggestQuestions-ClQ38yLa.js";import"./lib-BYJEwAAL.js";import"./utilities-8g5q_ELR.js";class H{constructor(h){const{topId:w,id:g,answerTitle:p,answerLink:f}=h;this.chatBotAnswer={topId:w,id:g,answerTitle:p??"",answerLink:f??"",created:h.created,modified:h.modified}}chatBotAnswer}const ye=()=>{const[l,h]=r.useState(null),[w,g]=r.useState(0),p=async u=>{h(u);let c=!1,x=null;if(u){const{assignedAnswers:n}=u;if(n&&n.length>0){const o=n[0];x=new H(o).chatBotAnswer,c=n.length>1,g(0)}}return{firstChatBotAnswer:x,hasMoreAnswers:c}},f=r.useCallback(async()=>l,[l]),b=r.useCallback(async()=>{const{assignedAnswers:u}=l,c=u.length,x=w+1;return w+1<c?(g(x),{nextChatBotAnswer:new H(u[x]).chatBotAnswer,hasMoreAnswers:x+1<c}):{nextChatBotAnswer:null,hasMoreAnswers:!1}},[l,w]);return[p,f,b]},je=r.forwardRef(({allCategoryRows:l},h)=>{const w=ue(),[g,p]=r.useState([]),f=({row:n})=>{const{id:o,hasSubCategories:m,title:y,link:s}=n;return e.jsxs(S.Item,{eventKey:o,children:[e.jsx(S.Header,{className:`${m?"":"hide-icon"}`,children:n.link?e.jsx("a",{href:"#",className:"cat-link",onClick:()=>w(`${s}/from_chat`),children:y}):e.jsx("span",{className:"cat-title",children:y})}),e.jsx(S.Body,{children:n.hasSubCategories&&e.jsx(b,{rows:n.categoryRows})})]})},b=({rows:n})=>e.jsx(e.Fragment,{children:n.map(o=>e.jsx(f,{row:o},o.id))}),u=async(n,o)=>{const m=n[0],y=l.find(s=>m===s.id);console.log("onSelectCategory",{cat:y,eventKey:n,e:o})},c=async n=>{const{id:o}=n;return l.forEach(async m=>{m.id!==o&&m.parentId===o&&(await c(m),n.categoryRows.push(m))}),!0},x=()=>{p([]),l.forEach(async n=>{n.categoryRows=[],n.parentId===null&&(await c(n),p(o=>[...o,n]))})};return r.useImperativeHandle(h,()=>({resetNavigator:x}),[]),e.jsx(S,{defaultActiveKey:"",alwaysOpen:!0,onSelect:u,children:e.jsx(b,{rows:g})})}),ke=({show:l,onHide:h})=>{let{tekst:w}=xe();const[g,p]=r.useState(w),[f,b,u]=ye(),[c,x]=r.useState(null),[n,o]=r.useState(1),[m,y]=r.useState(!1),[s,v]=r.useState(null),[_,C]=r.useState(!1),[I,$]=r.useState(!1),{loadAllCategoryRowsGlobal:D,getQuestion:V,addHistory:T,addHistoryFilter:W,searchQuestions:J}=me(),{authUser:B,isDarkMode:P}=he(),[X]=r.useState(!0),[M,q]=r.useState(!0),[Y,Z]=r.useState(new Map),[K,ee]=r.useState([]),L=r.useRef(null),[te,N]=r.useState([]);let F;(t=>{t[t.AUTO_SUGGEST=0]="AUTO_SUGGEST",t[t.QUESTION=1]="QUESTION",t[t.ANSWER=2]="ANSWER"})(F||(F={})),r.useEffect(()=>{(async()=>{if(!I){const t=await D();t&&($(!0),Z(t),ee(Array.from(t.values())))}})()},[I,D]);const se=async()=>{const t=performance.now();await L?.current?.resetNavigator();const a=performance.now()-t;console.log(`Execution time: ${a} milliseconds`)},ne=r.useRef(null),re=async(t,i)=>{const a=await b();if(a){console.log({questionCurr:a});const j={questionKey:new E(a).questionKey,filter:i,created:{time:new Date,nickName:B.nickName}};await W(j)}if(s){const j={type:2,isDisabled:!0,txt:s.answerTitle,link:s.answerLink};N(Q=>[...Q,j])}const A=await V(t),{question:d}=A;if(!d)return;d.numOfRelatedFilters>0&&p(d.relatedFilters[0].filter);const le=await f(d);let{firstChatBotAnswer:ce,hasMoreAnswers:de}=le;if(d){const j={type:1,isDisabled:!0,txt:d.title,link:null};N(Q=>[...Q,j])}o(j=>j+1),q(!1),x(d),y(!0),C(de),v(ce)},ae=async()=>{const t={type:2,isDisabled:!0,txt:s?s.answerTitle:"no answer title",link:s?s.answerLink:"no answer link",hasMoreAnswers:!0};N(a=>[...a,t]);const i={questionKey:new E(c).questionKey,assignedAnswerKey:{topId:s.topId,id:s.id},userAction:"Fixed",created:{nickName:B.nickName,time:new Date}};T(i),C(!1),v(s),y(!1)},oe=async()=>{const t={type:2,isDisabled:!0,txt:s?s.answerTitle:"no answer",link:s?s.answerLink:"no link",hasMoreAnswers:!0};N(d=>[...d,t]);const i=await u(),{nextChatBotAnswer:a,hasMoreAnswers:A}=i;if(s){const d={questionKey:new E(c).questionKey,assignedAnswerKey:{topId:s.topId,id:s.id},userAction:a?"NotFixed":"NotClicked",created:{nickName:B.nickName,time:new Date}};T(d)}C(A),console.log("----->>>>",{nextChatBotAnswer:a}),v(a)},ie=t=>{const{txt:i}=t;return e.jsx("div",{id:n.toString(),className:"d-flex flex-row mx-0 justify-content-start align-items-center",children:e.jsxs("div",{className:"d-flex flex-row mx-0 justify-content-start align-items-center",children:[e.jsx("img",{width:"22",height:"18",src:pe,alt:"Question",className:"ms-1"}),e.jsx("div",{className:"p-1 bg-warning text-light flex-wrap text-wrap border rounded-1",children:i})]})})},G=t=>{console.log("--------------------------------------AnswerComponent",t);const{isDisabled:i,txt:a,link:A}=t;return e.jsx("div",{id:s?.id,className:`${P?"dark":"light"} mt-1 mx-1 border border-0 rounded-1`,children:e.jsxs("div",{className:"d-flex flex-row mx-0 justify-content-start align-items-center",children:[e.jsxs("div",{className:"d-flex flex-row mx-0 justify-content-start align-items-center",children:[e.jsx("img",{width:"22",height:"18",src:ge,alt:"Answer",className:"ms-1"}),A?e.jsx("div",{className:"p-1 bg-info text-light flex-wrap text-wrap border rounded-1 ",children:e.jsx("a",{href:A,rel:"noopener noreferrer",target:"_blank",className:"text-light text-decoration-underline",children:a})}):e.jsx("div",{className:"p-1 bg-info text-light flex-wrap text-wrap border rounded-1",children:a})]}),!i&&s&&e.jsxs("div",{children:[e.jsx(R,{size:"sm",type:"button",onClick:ae,disabled:!s,className:"align-middle ms-1 px-1  py-0",variant:"success",children:"Fixed"}),e.jsx(R,{size:"sm",type:"button",onClick:oe,disabled:!s,className:"align-middle ms-1 border border-1 rounded-1 px-1 py-0",variant:"danger",children:"Not fixed"})]})]})})},O=t=>{const{isDisabled:i,txt:a}=t;return e.jsxs("div",{className:"dark",children:[e.jsx("label",{className:"text-warning",children:"Please enter the Question"}),e.jsx("div",{className:"text-start",children:e.jsxs("div",{className:"questions",children:[i&&e.jsx("div",{children:a}),!i&&e.jsx(fe,{tekst:a,onSelectQuestion:re,allCategoryRows:Y,searchQuestions:J})]})})]})};return console.log("=====================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> rendering ChatBotDlg"),K.length===0?e.jsx("div",{children:"Loading ..."}):e.jsxs("div",{className:"pe-6 overflow-auto chat-bot-dlg",children:[e.jsx("style",{children:`
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

            `}),e.jsxs(k,{show:l,onHide:h,placement:"end",scroll:!0,backdrop:!0,onEntering:se,children:[" ",e.jsx(k.Header,{closeButton:!0,children:e.jsx(k.Title,{className:"fs-6",children:"I am your Buddy"})}),e.jsx(k.Body,{className:"p-0 border border-1 rounded-3",children:e.jsxs(we,{id:"container",fluid:!0,className:"text-primary",children:[" ",e.jsx(U,{className:"m-0",children:e.jsx(z,{className:"border border-0 border-primary mx-1 text-white p-0",children:e.jsx(je,{allCategoryRows:K,ref:L})})}),e.jsx(U,{className:"m-0",children:e.jsxs(z,{className:"border border-0 border-primary mx-1 text-white p-0",children:[e.jsx("div",{className:"history",children:te.map(t=>{switch(t.type){case 0:return e.jsx(O,{...t});case 1:return e.jsx(ie,{...t});case 2:return e.jsx(G,{...t});default:return e.jsx("div",{children:"unknown"})}})},"history"),m&&e.jsx("div",{children:e.jsx(G,{type:2,isDisabled:!1,txt:s?s.answerTitle:"no answers",hasMoreAnswers:_,link:s?s.answerLink:""})},"answer"),X&&!M&&e.jsx(R,{variant:"secondary",size:"sm",type:"button",onClick:()=>{o(n+1),q(!0)},className:"m-1 border border-1 rounded-1 py-0",children:"New Question"},"newQuestion"),M&&e.jsx("div",{className:"pb-35 questions",children:e.jsx(O,{type:0,isDisabled:!1,txt:g,link:null})}),e.jsx("div",{ref:ne,children:"dno dna"})]})})]})})]})]})};export{ke as default};
//# sourceMappingURL=ChatBotDlg-_TtdDPRV.js.map
