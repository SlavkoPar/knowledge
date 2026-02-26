const c=e=>e?new Date(e).toLocaleDateString()+" "+new Date(e).toLocaleTimeString():"",n=e=>e?new Date(e).toLocaleString([],{dateStyle:"short",timeStyle:"short"}):"",l=e=>e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");function s(e,a=20){let t;return(...o)=>{clearTimeout(t),t=setTimeout(()=>e(...o),a)}}export{n as a,s as d,l as e,c as f};
//# sourceMappingURL=utilities.js.map
