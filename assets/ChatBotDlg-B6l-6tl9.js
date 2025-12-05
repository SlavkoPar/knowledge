import{r as s,S as j,n as e,T as C,a9 as Y,aq as ve,ar as V,B as R,as as be,at as ke,s as Se,u as Be,c as Re,au as B,t as Te,R as W,p as J,av as Ie,q as Qe,k as E}from"./index-1nDaFkSe.js";import{A as Ee}from"./AutoSuggestQuestions-D_itONab.js";import"./lib-synsYzVW.js";const H=s.forwardRef(({className:n,bsPrefix:t,as:a="div",...r},o)=>(t=j(t,"card-body"),e.jsx(a,{ref:o,className:C(n,t),...r})));H.displayName="CardBody";const Z=s.forwardRef(({className:n,bsPrefix:t,as:a="div",...r},o)=>(t=j(t,"card-footer"),e.jsx(a,{ref:o,className:C(n,t),...r})));Z.displayName="CardFooter";const P=s.createContext(null);P.displayName="CardHeaderContext";const ee=s.forwardRef(({bsPrefix:n,className:t,as:a="div",...r},o)=>{const m=j(n,"card-header"),x=s.useMemo(()=>({cardHeaderBsPrefix:m}),[m]);return e.jsx(P.Provider,{value:x,children:e.jsx(a,{ref:o,...r,className:C(t,m)})})});ee.displayName="CardHeader";const te=s.forwardRef(({bsPrefix:n,className:t,variant:a,as:r="img",...o},m)=>{const x=j(n,"card-img");return e.jsx(r,{ref:m,className:C(a?`${x}-${a}`:x,t),...o})});te.displayName="CardImg";const se=s.forwardRef(({className:n,bsPrefix:t,as:a="div",...r},o)=>(t=j(t,"card-img-overlay"),e.jsx(a,{ref:o,className:C(n,t),...r})));se.displayName="CardImgOverlay";const ne=s.forwardRef(({className:n,bsPrefix:t,as:a="a",...r},o)=>(t=j(t,"card-link"),e.jsx(a,{ref:o,className:C(n,t),...r})));ne.displayName="CardLink";const De=Y("h6"),ae=s.forwardRef(({className:n,bsPrefix:t,as:a=De,...r},o)=>(t=j(t,"card-subtitle"),e.jsx(a,{ref:o,className:C(n,t),...r})));ae.displayName="CardSubtitle";const re=s.forwardRef(({className:n,bsPrefix:t,as:a="p",...r},o)=>(t=j(t,"card-text"),e.jsx(a,{ref:o,className:C(n,t),...r})));re.displayName="CardText";const He=Y("h5"),oe=s.forwardRef(({className:n,bsPrefix:t,as:a=He,...r},o)=>(t=j(t,"card-title"),e.jsx(a,{ref:o,className:C(n,t),...r})));oe.displayName="CardTitle";const ie=s.forwardRef(({bsPrefix:n,className:t,bg:a,text:r,border:o,body:m=!1,children:x,as:h="div",...w},f)=>{const p=j(n,"card");return e.jsx(h,{ref:f,...w,className:C(t,p,a&&`bg-${a}`,r&&`text-${r}`,o&&`border-${o}`),children:m?e.jsx(H,{children:x}):x})});ie.displayName="Card";const D=Object.assign(ie,{Img:te,Title:oe,Subtitle:ae,Body:H,Link:ne,Text:re,Header:ee,Footer:Z,ImgOverlay:se});class X{constructor(t){const{topId:a,id:r,answerTitle:o,answerLink:m}=t;this.chatBotAnswer={topId:a,id:r,answerTitle:o??"",answerLink:m??"",created:t.created,modified:t.modified}}chatBotAnswer}const Ke=()=>{const[n,t]=s.useState(null),[a,r]=s.useState(0),o=async h=>{t(h);let w=!1,f=null;if(h){const{assignedAnswers:p}=h;if(p&&p.length>0){const l=p[0];f=new X(l).chatBotAnswer,w=p.length>1,r(0)}}return{firstChatBotAnswer:f,hasMoreAnswers:w}},m=s.useCallback(async()=>n,[n]),x=s.useCallback(async()=>{const{assignedAnswers:h}=n,w=h.length,f=a+1;return a+1<w?(r(f),{nextChatBotAnswer:new X(h[f]).chatBotAnswer,hasMoreAnswers:f+1<w}):{nextChatBotAnswer:null,hasMoreAnswers:!1}},[n,a]);return[o,m,x]},Le="rgba(255, 192, 203, 0.6)",Me="rgb(224, 207, 252)",qe=s.forwardRef(({allCategoryRows:n},t)=>{const a=ve(),[r,o]=s.useState([]);function m({children:l,eventKey:u,hasSubCategories:y,callback:i}){const{activeEventKey:A}=s.useContext(be),T=ke(String(u??""),()=>i&&i(u)),k=A===u;return e.jsx("button",{type:"button",className:`accordion-button${y?"":" hide-icon"}`,style:{backgroundColor:k?Le:Me},onClick:T,children:l})}const x=({row:l})=>e.jsxs(D,{children:[e.jsx(D.Header,{children:e.jsx(m,{eventKey:l.id,hasSubCategories:l.hasSubCategories,children:l.link?e.jsx(R,{href:"#",variant:"link",className:"cat-link",onClick:()=>a(`${l.link}/from_chat`),children:l.title}):e.jsx("span",{className:"cat-title",children:l.title})})}),e.jsx(V.Collapse,{eventKey:l.id,children:e.jsx(D.Body,{children:l.hasSubCategories&&e.jsx(h,{rows:l.categoryRows})})})]}),h=({rows:l})=>e.jsx(e.Fragment,{children:l.map(u=>e.jsx(x,{row:u},u.id))}),w=async(l,u)=>{const y=l[0];n.find(A=>y===A.id)&&(u.stopPropagation(),u.preventDefault())},f=async l=>{const{id:u}=l;return n.forEach(async y=>{y.id!==u&&y.parentId===u&&(await f(y),l.categoryRows.push(y))}),!0},p=()=>{o([]),n.forEach(async l=>{l.categoryRows=[],l.parentId===null&&(await f(l),o(u=>[...u,l]))})};return s.useImperativeHandle(t,()=>({resetNavigator:p}),[]),e.jsx(V,{defaultActiveKey:"",alwaysOpen:!0,onSelect:w,children:e.jsx(h,{rows:r})})}),Ge=({show:n,onHide:t})=>{let{tekst:a}=Se();const[r,o]=s.useState(a),[m,x,h]=Ke(),[w,f]=s.useState(null),[p,l]=s.useState(1),[u,y]=s.useState(!1),[i,A]=s.useState(null),[T,k]=s.useState(!1),{loadAllCategoryRowsGlobal:K,getQuestion:le,addHistory:L,addHistoryFilter:de,searchQuestions:ce}=Be(),{authUser:I,isDarkMode:ue,allCategoryRowsGlobalLoaded:M,allCategoryRowsGlobal:q}=Re(),[me]=s.useState(!0),[F,O]=s.useState(!0),[$,xe]=s.useState([]),G=s.useRef(null),[he,S]=s.useState([]);let U;(d=>{d[d.AUTO_SUGGEST=0]="AUTO_SUGGEST",d[d.QUESTION=1]="QUESTION",d[d.ANSWER=2]="ANSWER"})(U||(U={})),s.useEffect(()=>{(async()=>M?xe(Array.from(q.values())):await K())()},[M,K]);const fe=async()=>{const d=performance.now();await G?.current?.resetNavigator();const c=performance.now()-d;console.log(`Execution time: ${c} milliseconds`)},ge=s.useRef(null),we=async(d,g)=>{const c=await x();if(c){console.log({questionCurr:c});const v={questionKey:new E(c).questionKey,filter:g,created:{time:new Date,nickName:I.nickName}};await de(v)}if(i){const v={type:2,isDisabled:!0,txt:i.answerTitle,link:i.answerLink};S(Q=>[...Q,v])}const b=await le(d),{question:N}=b;if(!N)return;N.numOfRelatedFilters>0&&o(N.relatedFilters[0].filter);const je=await m(N);let{firstChatBotAnswer:Ce,hasMoreAnswers:Ae}=je;if(N){const v={type:1,isDisabled:!0,txt:N.title,link:null};S(Q=>[...Q,v])}l(v=>v+1),O(!1),f(N),y(!0),k(Ae),A(Ce)},pe=async()=>{const d={type:2,isDisabled:!0,txt:i?i.answerTitle:"no answer title",link:i?i.answerLink:"no answer link",hasMoreAnswers:!0};S(c=>[...c,d]);const g={questionKey:new E(w).questionKey,assignedAnswerKey:{topId:i.topId,id:i.id},userAction:"Fixed",created:{nickName:I.nickName,time:new Date}};L(g),k(!1),A(i),y(!1)},ye=async()=>{const d={type:2,isDisabled:!0,txt:i?i.answerTitle:"no answer",link:i?i.answerLink:"no link",hasMoreAnswers:!0};S(N=>[...N,d]);const g=await h(),{nextChatBotAnswer:c,hasMoreAnswers:b}=g;if(i){const N={questionKey:new E(w).questionKey,assignedAnswerKey:{topId:i.topId,id:i.id},userAction:c?"NotFixed":"NotClicked",created:{nickName:I.nickName,time:new Date}};L(N)}k(b),console.log("----->>>>",{nextChatBotAnswer:c}),A(c)},Ne=d=>{const{txt:g}=d;return e.jsx("div",{id:p.toString(),className:"d-flex flex-row mx-0 justify-content-start align-items-center",children:e.jsxs("div",{className:"d-flex flex-row mx-0 justify-content-start align-items-center",children:[e.jsx("img",{width:"22",height:"18",src:Qe,alt:"Question",className:"ms-1"}),e.jsx("div",{className:"p-1 bg-warning text-light flex-wrap text-wrap border rounded-1",children:g})]})})},z=d=>{console.log("--------------------------------------AnswerComponent",d);const{isDisabled:g,txt:c,link:b}=d;return e.jsx("div",{id:i?.id,className:`${ue?"dark":"light"} mt-1 mx-1 border border-0 rounded-1`,children:e.jsxs("div",{className:"d-flex flex-row mx-0 justify-content-start align-items-center",children:[e.jsxs("div",{className:"d-flex flex-row mx-0 justify-content-start align-items-center",children:[e.jsx("img",{width:"22",height:"18",src:Ie,alt:"Answer",className:"ms-1"}),b?e.jsx("div",{className:"p-1 bg-info text-light flex-wrap text-wrap border rounded-1 ",children:e.jsx("a",{href:b,rel:"noopener noreferrer",target:"_blank",className:"text-light text-decoration-underline",children:c})}):e.jsx("div",{className:"p-1 bg-info text-light flex-wrap text-wrap border rounded-1",children:c})]}),!g&&i&&e.jsxs("div",{children:[e.jsx(R,{size:"sm",type:"button",onClick:pe,disabled:!i,className:"align-middle ms-1 px-1  py-0",variant:"success",children:"Fixed"}),e.jsx(R,{size:"sm",type:"button",onClick:ye,disabled:!i,className:"align-middle ms-1 border border-1 rounded-1 px-1 py-0",variant:"danger",children:"Not fixed"})]})]})})},_=d=>{const{isDisabled:g,txt:c}=d;return e.jsxs("div",{className:"dark",children:[e.jsx("label",{className:"text-warning",children:"Please enter the Question"}),e.jsx("div",{className:"text-start",children:e.jsxs("div",{className:"questions",children:[g&&e.jsx("div",{children:c}),!g&&e.jsx(Ee,{tekst:c,onSelectQuestion:we,allCategoryRows:q,searchQuestions:ce})]})})]})};return console.log("=====================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> rendering ChatBotDlg"),$.length===0?e.jsx("div",{children:"Loading ..."}):e.jsxs("div",{className:"pe-6 overflow-auto chat-bot-dlg",children:[e.jsx("style",{children:`
                .card-header {
                    padding: 0.0rem 0.03rem;
                    padding-right: 0;
                    font-size: 0.8rem;
                }
                // .card-header button  {
                //     border: 0.3px solid silver;
                //     border-radius: 3px;
                //     text-align: left;
                // }

                .card-body {
                    padding: 0.0rem 0.5rem;
                    padding-right: 0;
                    font-size: 0.6rem;
                }

                .accordion-body {
                    padding: 0.3rem 0.3rem;
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

                .accordion-button.hide-icon::after {
                    display: none;
                    padding: 0rem 0.2rem !important;
                    padding-right: 0 !important;
                }
            }

            `}),e.jsxs(B,{show:n,onHide:t,placement:"end",scroll:!0,backdrop:!0,onEntering:fe,children:[" ",e.jsx(B.Header,{closeButton:!0,children:e.jsx(B.Title,{className:"fs-6",children:"I am your Buddy"})}),e.jsx(B.Body,{className:"p-0 border border-1 rounded-3",children:e.jsxs(Te,{id:"container",fluid:!0,className:"text-primary",children:[" ",e.jsx(W,{className:"m-0",children:e.jsx(J,{children:e.jsx(qe,{allCategoryRows:$,ref:G})})}),e.jsx(W,{className:"m-0",children:e.jsxs(J,{className:"border border-0 border-primary mx-1 text-white p-0",children:[e.jsx("div",{className:"history",children:he.map(d=>{switch(d.type){case 0:return e.jsx(_,{...d});case 1:return e.jsx(Ne,{...d});case 2:return e.jsx(z,{...d});default:return e.jsx("div",{children:"unknown"})}})},"history"),u&&e.jsx("div",{children:e.jsx(z,{type:2,isDisabled:!1,txt:i?i.answerTitle:"no answers",hasMoreAnswers:T,link:i?i.answerLink:""})},"answer"),me&&!F&&e.jsx(R,{variant:"secondary",size:"sm",type:"button",onClick:()=>{l(p+1),O(!0)},className:"m-1 border border-1 rounded-1 py-0",children:"New Question"},"newQuestion"),F&&e.jsx("div",{className:"pb-35 questions",children:e.jsx(_,{type:0,isDisabled:!1,txt:r,link:null})}),e.jsx("div",{ref:ge,children:"dno dna"})]})})]})})]})]})};export{Ge as default};
//# sourceMappingURL=ChatBotDlg-B6l-6tl9.js.map
