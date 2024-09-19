import{b as le}from"./chunk-HP2KUAWQ.js";import{a as ue}from"./chunk-4A5M7RW6.js";import{b as ce}from"./chunk-D2DE26MU.js";import{c as pe,d as fe,e as ge,f as je}from"./chunk-LOQWNVM6.js";import{a as I,c as he}from"./chunk-Y2IJV7KJ.js";import"./chunk-NO6YX2BS.js";import"./chunk-EPSS3MK7.js";import{V as de,W as me,t as ee,y as te,z as re}from"./chunk-IXH6PIJ2.js";import"./chunk-6PAL4IQQ.js";import{$ as se,V as X,X as ie,Z as oe,ba as ae,ca as ne}from"./chunk-WKHOS5S7.js";import{Aa as w,Ab as g,Ba as l,Ca as u,Cb as x,D as k,Ib as q,Pa as F,Q as D,Ua as p,W as v,Xb as H,Z as b,a as $,b as B,ba as _,db as n,eb as c,fb as j,fc as W,gb as R,gc as Q,h as d,hb as L,ia as P,ja as S,jb as V,k as A,ka as z,l as U,la as K,lc as G,mb as M,ob as T,pc as Y,q as C,uc as Z,yc as J,zb as O}from"./chunk-IRG7MLS7.js";var ve=(()=>{let i=class i{constructor(e,t,r){this.http=e,this.indexerService=t,this.indexedDBService=r,this.offset=0,this.limit=20,this.totalProjects=0,this.loading=!1,this.projects=[],this.noMoreProjects=!1,this.totalProjectsFetched=!1,this.selectedNetwork="testnet",this.loadNetwork()}loadNetwork(){this.selectedNetwork=this.indexerService.getNetwork()}fetchProjects(){return d(this,null,function*(){if(this.loading||this.noMoreProjects)return[];this.loading=!0;let e=this.indexerService.getPrimaryIndexer(this.selectedNetwork),t=this.totalProjectsFetched?`${e}api/query/Angor/projects?offset=${this.offset}&limit=${this.limit}`:`${e}api/query/Angor/projects?limit=${this.limit}`;try{let r=yield this.http.get(t,{observe:"response"}).toPromise();if(!this.totalProjectsFetched&&r&&r.headers){let m=r.headers.get("pagination-total");this.totalProjects=m?+m:0,this.totalProjectsFetched=!0,this.offset=Math.max(this.totalProjects-this.limit,0)}let s=r?.body||[];if(!s.length)return this.noMoreProjects=!0,[];let a=s.filter(m=>!this.projects.some(y=>y.projectIdentifier===m.projectIdentifier));if(!a.length)return this.noMoreProjects=!0,[];let h=a.map(m=>d(this,null,function*(){yield this.indexedDBService.saveProject(m)})),E=a.map(m=>d(this,null,function*(){try{let y=yield this.fetchProjectDetails(m.projectIdentifier).toPromise();return m.totalInvestmentsCount=y.totalInvestmentsCount,m}catch(y){return console.error(`Error fetching details for project ${m.projectIdentifier}:`,y),m}}));return yield Promise.all([...h,...E]),this.projects=[...this.projects,...a],this.offset=Math.max(this.offset-this.limit,0),a}catch(r){return console.error("Error fetching projects:",r),[]}finally{this.loading=!1}})}fetchProjectStats(e){let r=`${this.indexerService.getPrimaryIndexer(this.selectedNetwork)}api/query/Angor/projects/${e}/stats`;return this.http.get(r).pipe(k(s=>(console.error(`Error fetching stats for project ${e}:`,s),C({}))))}fetchAndSaveProjectStats(e){return d(this,null,function*(){try{let t=yield this.fetchProjectStats(e).toPromise();return t&&(yield this.indexedDBService.saveProjectStats(e,t)),t}catch(t){return console.error(`Error fetching and saving stats for project ${e}:`,t),null}})}fetchProjectDetails(e){let r=`${this.indexerService.getPrimaryIndexer(this.selectedNetwork)}api/query/Angor/projects/${e}`;return this.http.get(r).pipe(k(s=>(console.error(`Error fetching details for project ${e}:`,s),C({}))))}fetchAndSaveProjectDetails(e){return d(this,null,function*(){try{let t=yield this.fetchProjectDetails(e).toPromise();return t&&(yield this.indexedDBService.saveProject(t)),t}catch(t){return console.error(`Error fetching and saving details for project ${e}:`,t),null}})}getAllProjectsFromDB(){return d(this,null,function*(){return this.indexedDBService.getAllProjects()})}getProjectStatsFromDB(e){return d(this,null,function*(){return this.indexedDBService.getProjectStats(e)})}getProjects(){return this.projects}resetProjects(){this.projects=[],this.noMoreProjects=!1,this.offset=0,this.totalProjectsFetched=!1}};i.\u0275fac=function(t){return new(t||i)(b(Y),b(je),b(I))},i.\u0275prov=v({token:i,factory:i.\u0275fac,providedIn:"root"});let o=i;return o})();var xe=(()=>{let i=class i{constructor(){this.projects=[],this.projectsSubject=new U([])}getProjectsObservable(){return this.projectsSubject.asObservable()}setProjects(e){this.projects=e,this.projectsSubject.next(this.projects)}getProjects(){return this.projects}hasProjects(){return this.projects.length>0}updateProject(e){let t=this.projects.findIndex(r=>r.nostrPubKey===e.nostrPubKey);t>-1?this.projects[t]=e:this.projects.push(e),this.projectsSubject.next(this.projects)}getProjectByPubKey(e){return this.projects.find(t=>t.nostrPubKey===e)}};i.\u0275fac=function(t){return new(t||i)},i.\u0275prov=v({token:i,factory:i.\u0275fac,providedIn:"root"});let o=i;return o})();var ye=(()=>{let i=class i{stripHtmlTags(e){if(!e)return"";e=e.replace(/<script.*?>.*?<\/script>/gi,""),e=e.replace(/<style.*?>.*?<\/style>/gi,""),e=e.replace(/<([a-zA-Z][^\s>]*)(\s+[^>]*)?>/gi,(s,a,h)=>(h=h.replace(/\s+(style|class)\s*=\s*"[^"]*"/gi,""),`<${a}${h}>`));let t=/<(?!\/?(br|p|a|ul|ol|li|strong|em|b|i|u|hr|blockquote|img|div|span|table|thead|tbody|tr|td|th)\b)[^>]+>/gi;return e=e.replace(t,""),["h1","h2","h3","h4","h5","h6","p","div","section","article","footer","header","main"].forEach(s=>{let a=new RegExp(`<\\/?${s}[^>]*>`,"gi");e=e.replace(a,"<br />")}),e=e.replace(/<((?!br\s*\/?)[^>]+)>/gi,""),e=e.replace(/(\r?\n){2,}/g,`
`),e=e.replace(/(<br\s*\/?>\s*){2,}/g,"<br />"),e=e.replace(/^\s*<br\s*\/?>\s*|\s*<br\s*\/?>\s*$/g,""),e=e.replace(/\s*(<br\s*\/?>)\s*/g,"$1"),e}};i.\u0275fac=function(t){return new(t||i)},i.\u0275prov=v({token:i,factory:i.\u0275fac,providedIn:"root"});let o=i;return o})();function Ie(o,i){if(o&1&&(R(0),n(1,"angor-card",24)(2,"div",25),j(3,"img",26),c(),n(4,"div",27)(5,"div",28),j(6,"img",29),c()(),n(7,"div",30)(8,"div",31)(9,"div",32)(10,"div",33),g(11),c(),n(12,"div",34),g(13),c()(),n(14,"div",35)(15,"button",36),j(16,"mat-icon",37),c()()(),j(17,"hr",38),n(18,"div",31)(19,"div",39),g(20),c(),n(21,"div",40),j(22,"img",41),c()()()(),L()),o&2){let f=i.$implicit,e=T();l(3),p("src",e.getSafeUrl(f==null?null:f.banner,!0)||"images/pages/profile/cover.jpg",w),l(3),p("src",e.getSafeUrl(f==null?null:f.picture,!1)||"images/avatars/avatar-placeholder.png",w),l(5),x(" ",f.displayName||f.nostrPubKey," "),l(2),x(" ",f.about||"No description available"," "),l(3),p("svgIcon","heroicons_solid:user-plus"),l(4),x(" ",f.totalInvestmentsCount||0," investors "),l(2),p("src","images/avatars/avatar-placeholder.png",w)}}function Ee(o,i){if(o&1&&(n(0,"div",42),g(1),c()),o&2){let f=T();l(),x(" ",f.errorMessage," ")}}var be=(()=>{let i=class i{constructor(e,t,r,s,a,h,E,m){this.projectService=e,this.router=t,this.stateService=r,this.metadataService=s,this.indexedDBService=a,this.changeDetectorRef=h,this.sanitizer=E,this.sanitizerService=m,this.projects=[],this.errorMessage="",this.loading=!1,this.metadataLoadLimit=5,this._unsubscribeAll=new A,this.filteredProjects=[]}ngOnInit(){return d(this,null,function*(){this.loadInitialProjects(),this.subscribeToMetadataUpdates()})}loadInitialProjects(){return d(this,null,function*(){try{if(this.loading=!0,this.projects=this.stateService.getProjects(),this.projects.length===0)yield this.loadProjectsFromService();else{this.filteredProjects=[...this.projects];let e=this.getProjectsWithoutMetadata();e.length>0&&(yield this.loadMetadataForProjects(e))}}catch{this.handleError("Error loading initial projects")}finally{this.loading=!1,this.changeDetectorRef.detectChanges()}})}loadProjectsFromService(){return d(this,null,function*(){try{let e=yield this.projectService.fetchProjects();if(e.length===0){this.errorMessage="No projects found";return}this.projects=e,this.filteredProjects=[...this.projects],this.stateService.setProjects(this.projects);let t=e.map(r=>r.nostrPubKey);yield this.loadMetadataForProjects(t)}catch{this.handleError("Error fetching projects from service")}})}subscribeToMetadataUpdates(){this.indexedDBService.getMetadataStream().pipe(D(this._unsubscribeAll)).subscribe(e=>{if(e){let t=this.projects.find(r=>r.nostrPubKey===e.pubkey);t&&this.updateProjectMetadata(t,e.metadata)}})}getProjectsWithoutMetadata(){return this.projects.filter(e=>!e.displayName||!e.about).map(e=>e.nostrPubKey)}loadMetadataForProjects(e){this.metadataService.fetchMetadataForMultipleKeys(e).then(t=>{t.forEach(r=>{let s=this.projects.find(a=>a.nostrPubKey===r.pubkey);s&&this.updateProjectMetadata(s,r)}),this.changeDetectorRef.detectChanges()}).catch(t=>{console.error("Error fetching metadata for projects:",t)})}loadProjects(){return d(this,null,function*(){this.loading||this.errorMessage==="No more projects found"||(this.loading=!0,this.projectService.fetchProjects().then(e=>d(this,null,function*(){if(e.length===0&&this.projects.length===0)this.errorMessage="No projects found";else if(e.length===0)this.errorMessage="No more projects found";else{this.projects=[...this.projects,...e],this.filteredProjects=[...this.projects];let t=e.map(r=>r.nostrPubKey);yield this.loadMetadataForProjects(t),this.stateService.setProjects(this.projects),this.projects.forEach(r=>this.subscribeToProjectMetadata(r))}this.loading=!1,this.changeDetectorRef.detectChanges()})).catch(e=>{console.error("Error fetching projects:",e),this.errorMessage="Error fetching projects. Please try again later.",this.loading=!1,this.changeDetectorRef.detectChanges()}))})}loadMetadataForProject(e){return d(this,null,function*(){try{let t=yield this.metadataService.fetchMetadataWithCache(e.nostrPubKey);t?this.updateProjectMetadata(e,t):console.warn(`No metadata found for project ${e.nostrPubKey}`)}catch(t){console.error(`Error fetching metadata for project ${e.nostrPubKey}:`,t)}})}updateProjectMetadata(e,t){let r=this.sanitizerService.stripHtmlTags(t.about||"No description available"),s=B($({},e),{displayName:t.name,about:r,picture:t.picture,banner:t.banner}),a=this.projects.findIndex(h=>h.projectIdentifier===e.projectIdentifier);a!==-1&&(this.projects[a]=s,this.projects=[...this.projects]),this.filteredProjects=[...this.projects],this.changeDetectorRef.detectChanges()}subscribeToProjectMetadata(e){this.metadataService.getMetadataStream().pipe(D(this._unsubscribeAll)).subscribe(t=>{t&&t.pubkey===e.nostrPubKey&&this.updateProjectMetadata(e,t.metadata)})}goToProjectDetails(e){this.router.navigate(["/projects",e.projectIdentifier])}filterByQuery(e){if(!e){this.filteredProjects=[...this.projects];return}this.filteredProjects=this.projects.filter(t=>t.displayName?.toLowerCase().includes(e.toLowerCase())||t.about?.toLowerCase().includes(e.toLowerCase()))}toggleCompleted(e){}ngOnDestroy(){this._unsubscribeAll.next(null),this._unsubscribeAll.complete()}handleError(e){console.error(e),this.errorMessage=e,this.loading=!1,this.changeDetectorRef.detectChanges()}getSafeUrl(e,t){if(e&&typeof e=="string"&&this.isImageUrl(e))return this.sanitizer.bypassSecurityTrustUrl(e);{let r=t?"/images/pages/profile/cover.jpg":"images/avatars/avatar-placeholder.png";return this.sanitizer.bypassSecurityTrustUrl(r)}}isImageUrl(e){return/\.(jpeg|jpg|gif|png|svg|bmp|webp|tiff|ico)$/i.test(e)}};i.\u0275fac=function(t){return new(t||i)(u(ve),u(J),u(xe),u(he),u(I),u(H),u(Z),u(ye))},i.\u0275cmp=_({type:i,selectors:[["explore"]],standalone:!0,features:[q],decls:29,vars:7,consts:[["query",""],[1,"absolute","inset-0","flex","min-w-0","flex-col","overflow-y-auto"],[1,"dark","relative","flex-0","overflow-hidden","bg-gray-800","px-4","py-8","sm:p-16"],["viewBox","0 0 960 540","width","100%","height","100%","preserveAspectRatio","xMidYMax slice","xmlns","http://www.w3.org/2000/svg",1,"absolute","inset-0","pointer-events-none"],["fill","none","stroke","currentColor","stroke-width","100",1,"text-gray-700","opacity-25"],["r","234","cx","196","cy","23"],["r","234","cx","790","cy","491"],[1,"relative","z-10","flex","flex-col","items-center"],[1,"text-xl","font-semibold"],[1,"mt-1","text-center","text-4xl","font-extrabold","leading-tight","tracking-tight","sm:text-7xl"],[1,"text-secondary","mt-6","max-w-2xl","text-center","tracking-tight","sm:text-2xl"],[1,"p-6","sm:p-10"],[1,"mx-auto","flex","w-full","max-w-xs","flex-auto","flex-col","sm:max-w-5xl"],[1,"flex","w-full","max-w-xs","flex-col","items-center","justify-between","sm:max-w-none","sm:flex-row"],[1,"mt-4","w-full","sm:mt-0","sm:w-72",3,"subscriptSizing"],["matPrefix","",1,"icon-size-5",3,"svgIcon"],["placeholder","Search ...","matInput","",3,"input"],[1,"mt-8","sm:ml-auto","sm:mt-0",3,"change","color"],[1,"mx-auto","flex","w-full","flex-auto","flex-col","sm:max-w-5xl"],[1,"grid","w-full","min-w-0","grid-cols-1","gap-6","sm:grid-cols-1","md:grid-cols-1","lg:grid-cols-2","mt-10"],[4,"ngFor","ngForOf"],[1,"flex","justify-center","mt-10"],["mat-raised-button","","color","primary",3,"click","disabled"],["class","error-message",4,"ngIf"],[1,"filter-info","flex","w-full","flex-col"],[1,"flex","h-32"],["onerror","this.onerror=null; this.src='/images/pages/profile/cover.jpg';","alt","Card cover image",1,"object-cover",3,"src"],[1,"flex","px-8"],[1,"bg-card","-mt-12","rounded-full","p-1"],["alt","Project logo",1,"h-24","w-24","rounded-full","object-cover",3,"src"],[1,"flex","flex-col","px-8","pb-6","pt-4"],[1,"flex","items-center","justify-between"],[1,"mr-4"],[1,"text-2xl","font-semibold","leading-tight"],[1,"text-secondary","mt-1","leading-tight"],[1,"flex","h-10","w-10","items-center","justify-center","rounded-full","border"],["mat-icon-button",""],[1,"icon-size-5",3,"svgIcon"],[1,"my-6","w-full","border-t"],[1,"text-secondary","mr-3","text-md","font-medium"],[1,"flex","items-center"],["alt","Investor avatar",1,"text-card","ring-bg-card","m-0.5","-ml-3","h-6","w-6","rounded-full","ring-2",3,"src"],[1,"error-message"]],template:function(t,r){if(t&1){let s=V();n(0,"div",1)(1,"div",2),z(),n(2,"svg",3)(3,"g",4),j(4,"circle",5)(5,"circle",6),c()(),K(),n(6,"div",7)(7,"h2",8),g(8,"Explore Projects"),c(),n(9,"div",9),g(10," What\u2019s your next investment? "),c(),n(11,"div",10),g(12," Check out our projects and find your next investment opportunity. "),c()()(),n(13,"div",11)(14,"div",12)(15,"div",13)(16,"mat-form-field",14),j(17,"mat-icon",15),n(18,"input",16,0),M("input",function(){P(s);let h=O(19);return S(r.filterByQuery(h.value))}),c()(),n(20,"mat-slide-toggle",17),M("change",function(h){return P(s),S(r.toggleCompleted(h))}),g(21," Hide completed "),c()()(),n(22,"div",18)(23,"div",19),F(24,Ie,23,7,"ng-container",20),c(),n(25,"div",21)(26,"button",22),M("click",function(){return P(s),S(r.loadProjects())}),g(27),c()(),F(28,Ee,2,1,"div",23),c()()()}t&2&&(l(16),p("subscriptSizing","dynamic"),l(),p("svgIcon","heroicons_solid:magnifying-glass"),l(3),p("color","primary"),l(4),p("ngForOf",r.projects),l(2),p("disabled",r.loading),l(),x(" ",r.loading?"Loading...":"Load More Projects"," "),l(),p("ngIf",!r.loading&&r.errorMessage))},dependencies:[se,ie,oe,ne,ae,ue,re,te,ee,pe,X,me,de,ge,fe,ce,le,G,W,Q],encapsulation:2});let o=i;return o})();var ft=[{path:"",component:be}];export{ft as default};
