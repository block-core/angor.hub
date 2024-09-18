import{b as le}from"./chunk-5VABNNSA.js";import{a as ge}from"./chunk-NE366WXA.js";import{b as ce,c as M,d as he}from"./chunk-Y4AC7KR7.js";import"./chunk-WY3GIJSF.js";import{d as X}from"./chunk-4ZPAOZ2G.js";import{c as pe,d as fe,e as ue}from"./chunk-OQJK6VTD.js";import"./chunk-TUCIB5XZ.js";import"./chunk-UWWD6MFE.js";import{T as de,U as me,s as ee,x as te,y as re}from"./chunk-D2DYHX5U.js";import"./chunk-B23D77YI.js";import{W as Z,Y as ie,_ as oe,aa as se,ca as ne,da as ae}from"./chunk-FJKCM5SV.js";import{Aa as L,Ab as z,Ba as $,Bb as O,Bc as H,Cc as J,Db as R,Gb as w,Hc as Q,Ib as k,K as C,Mc as G,Ra as b,Sb as V,Sc as Y,Ta as l,Tb as f,Ua as u,Vb as y,_b as q,a as T,b as B,ba as D,h as d,ha as x,hb as F,ma as P,mb as h,n as U,o as _,qa as A,qc as W,t as K,xb as n,ya as I,yb as a,za as S,zb as g}from"./chunk-MRO7MB7O.js";var je=(()=>{let i=class i{constructor(){this.mainnetLocalStorageKey="mainnetIndexers",this.testnetLocalStorageKey="testnetIndexers",this.mainnetPrimaryIndexerKey="mainnetPrimaryIndexer",this.testnetPrimaryIndexerKey="testnetPrimaryIndexer",this.networkStorageKey="selectedNetwork",this.defaultMainnetIndexer="https://btc.indexer.angor.io/",this.defaultTestnetIndexer="https://tbtc.indexer.angor.io/",this.initializeDefaultIndexers()}initializeDefaultIndexers(){this.getIndexers("mainnet").length===0&&(this.addIndexer(this.defaultMainnetIndexer,"mainnet"),this.setPrimaryIndexer(this.defaultMainnetIndexer,"mainnet")),this.getIndexers("testnet").length===0&&(this.addIndexer(this.defaultTestnetIndexer,"testnet"),this.setPrimaryIndexer(this.defaultTestnetIndexer,"testnet"))}addIndexer(e,t){let r=this.getIndexers(t);r.includes(e)||(r.push(e),this.saveIndexers(r,t))}getIndexers(e){let t=e==="mainnet"?this.mainnetLocalStorageKey:this.testnetLocalStorageKey;return JSON.parse(localStorage.getItem(t)||"[]")}saveIndexers(e,t){let r=t==="mainnet"?this.mainnetLocalStorageKey:this.testnetLocalStorageKey;localStorage.setItem(r,JSON.stringify(e))}setPrimaryIndexer(e,t){if(this.getIndexers(t).includes(e)){let r=t==="mainnet"?this.mainnetPrimaryIndexerKey:this.testnetPrimaryIndexerKey;localStorage.setItem(r,e)}}getPrimaryIndexer(e){let t=e==="mainnet"?this.mainnetPrimaryIndexerKey:this.testnetPrimaryIndexerKey;return localStorage.getItem(t)}removeIndexer(e,t){let r=this.getIndexers(t),s=r.indexOf(e);if(s!==-1&&(r.splice(s,1),this.saveIndexers(r,t),e===this.getPrimaryIndexer(t))){let c=t==="mainnet"?this.mainnetPrimaryIndexerKey:this.testnetPrimaryIndexerKey;localStorage.removeItem(c)}}clearAllIndexers(e){let t=e==="mainnet"?this.mainnetLocalStorageKey:this.testnetLocalStorageKey,r=e==="mainnet"?this.mainnetPrimaryIndexerKey:this.testnetPrimaryIndexerKey;localStorage.removeItem(t),localStorage.removeItem(r)}setNetwork(e){localStorage.setItem(this.networkStorageKey,e)}getNetwork(){return localStorage.getItem(this.networkStorageKey)||"testnet"}};i.\u0275fac=function(t){return new(t||i)},i.\u0275prov=x({token:i,factory:i.\u0275fac,providedIn:"root"});let o=i;return o})();var xe=(()=>{let i=class i{constructor(e,t,r){this.http=e,this.indexerService=t,this.indexedDBService=r,this.offset=0,this.limit=21,this.totalProjects=0,this.loading=!1,this.projects=[],this.noMoreProjects=!1,this.totalProjectsFetched=!1,this.selectedNetwork="testnet",this.loadNetwork()}loadNetwork(){this.selectedNetwork=this.indexerService.getNetwork()}fetchProjects(){return d(this,null,function*(){if(this.loading||this.noMoreProjects)return[];this.loading=!0;let e=this.indexerService.getPrimaryIndexer(this.selectedNetwork),t=this.totalProjectsFetched?`${e}api/query/Angor/projects?offset=${this.offset}&limit=${this.limit}`:`${e}api/query/Angor/projects?limit=${this.limit}`;try{let r=yield this.http.get(t,{observe:"response"}).toPromise();if(!this.totalProjectsFetched&&r&&r.headers){let m=r.headers.get("pagination-total");this.totalProjects=m?+m:0,this.totalProjectsFetched=!0,this.offset=Math.max(this.totalProjects-this.limit,0)}let s=r?.body||[];if(!s.length)return this.noMoreProjects=!0,[];let c=s.filter(m=>!this.projects.some(v=>v.projectIdentifier===m.projectIdentifier));if(!c.length)return this.noMoreProjects=!0,[];let j=c.map(m=>d(this,null,function*(){yield this.indexedDBService.saveProject(m)})),E=c.map(m=>d(this,null,function*(){try{let v=yield this.fetchProjectDetails(m.projectIdentifier).toPromise();return m.totalInvestmentsCount=v.totalInvestmentsCount,m}catch(v){return console.error(`Error fetching details for project ${m.projectIdentifier}:`,v),m}}));return yield Promise.all([...j,...E]),this.projects=[...this.projects,...c],this.offset=Math.max(this.offset-this.limit,0),c}catch(r){return console.error("Error fetching projects:",r),[]}finally{this.loading=!1}})}fetchProjectStats(e){let r=`${this.indexerService.getPrimaryIndexer(this.selectedNetwork)}api/query/Angor/projects/${e}/stats`;return this.http.get(r).pipe(C(s=>(console.error(`Error fetching stats for project ${e}:`,s),K({}))))}fetchAndSaveProjectStats(e){return d(this,null,function*(){try{let t=yield this.fetchProjectStats(e).toPromise();return t&&(yield this.indexedDBService.saveProjectStats(e,t)),t}catch(t){return console.error(`Error fetching and saving stats for project ${e}:`,t),null}})}fetchProjectDetails(e){let r=`${this.indexerService.getPrimaryIndexer(this.selectedNetwork)}api/query/Angor/projects/${e}`;return this.http.get(r).pipe(C(s=>(console.error(`Error fetching details for project ${e}:`,s),K({}))))}fetchAndSaveProjectDetails(e){return d(this,null,function*(){try{let t=yield this.fetchProjectDetails(e).toPromise();return t&&(yield this.indexedDBService.saveProject(t)),t}catch(t){return console.error(`Error fetching and saving details for project ${e}:`,t),null}})}getAllProjectsFromDB(){return d(this,null,function*(){return this.indexedDBService.getAllProjects()})}getProjectStatsFromDB(e){return d(this,null,function*(){return this.indexedDBService.getProjectStats(e)})}getProjects(){return this.projects}resetProjects(){this.projects=[],this.noMoreProjects=!1,this.offset=0,this.totalProjectsFetched=!1}};i.\u0275fac=function(t){return new(t||i)(P(G),P(je),P(M))},i.\u0275prov=x({token:i,factory:i.\u0275fac,providedIn:"root"});let o=i;return o})();var ye=(()=>{let i=class i{constructor(){this.projects=[],this.projectsSubject=new _([])}getProjectsObservable(){return this.projectsSubject.asObservable()}setProjects(e){this.projects=e,this.projectsSubject.next(this.projects)}getProjects(){return this.projects}hasProjects(){return this.projects.length>0}updateProject(e){let t=this.projects.findIndex(r=>r.nostrPubKey===e.nostrPubKey);t>-1?this.projects[t]=e:this.projects.push(e),this.projectsSubject.next(this.projects)}getProjectByPubKey(e){return this.projects.find(t=>t.nostrPubKey===e)}};i.\u0275fac=function(t){return new(t||i)},i.\u0275prov=x({token:i,factory:i.\u0275fac,providedIn:"root"});let o=i;return o})();function we(o,i){if(o&1&&(z(0),n(1,"angor-card",23)(2,"div",24),g(3,"img",25),a(),n(4,"div",26)(5,"div",27),g(6,"img",28),a()(),n(7,"div",29)(8,"div",30)(9,"div",31)(10,"div",32),f(11),a(),n(12,"div",33),f(13),a()(),n(14,"div",34)(15,"button",35),g(16,"mat-icon",36),a()()(),g(17,"hr",37),n(18,"div",30)(19,"div",38),f(20),a(),n(21,"div",39),g(22,"img",40),a()()()(),O()),o&2){let p=i.$implicit,e=k();l(3),h("src",e.getSafeUrl(p==null?null:p.banner,!0)||"images/pages/profile/cover.jpg",b),l(3),h("src",e.getSafeUrl(p==null?null:p.picture,!1)||"images/avatars/avatar-placeholder.png",b),l(5),y(" ",p.displayName||p.nostrPubKey," "),l(2),y(" ",p.about||"No description available"," "),l(3),h("svgIcon","heroicons_solid:user-plus"),l(4),y(" ",p.totalInvestmentsCount||0," investors "),l(2),h("src","images/avatars/avatar-placeholder.png",b)}}function Me(o,i){if(o&1&&(n(0,"div",41),f(1),a()),o&2){let p=k();l(),y(" ",p.errorMessage," ")}}var ve=(()=>{let i=class i{constructor(e,t,r,s,c,j,E){this.projectService=e,this.router=t,this.stateService=r,this.metadataService=s,this.indexedDBService=c,this.changeDetectorRef=j,this.sanitizer=E,this.projects=[],this.errorMessage="",this.loading=!1,this.metadataLoadLimit=5,this._unsubscribeAll=new U,this.filteredProjects=[]}ngOnInit(){this.loadInitialProjects(),this.subscribeToMetadataUpdates()}loadInitialProjects(){return d(this,null,function*(){try{if(this.loading=!0,this.projects=this.stateService.getProjects(),this.projects.length===0)yield this.loadProjectsFromService();else{this.filteredProjects=[...this.projects];let e=this.getProjectsWithoutMetadata();e.length>0&&(yield this.loadMetadataForProjects(e))}}catch{this.handleError("Error loading initial projects")}finally{this.loading=!1,this.changeDetectorRef.detectChanges()}})}loadProjectsFromService(){return d(this,null,function*(){try{let e=yield this.projectService.fetchProjects();if(e.length===0){this.errorMessage="No projects found";return}this.projects=e,this.filteredProjects=[...this.projects],this.stateService.setProjects(this.projects);let t=e.map(r=>r.nostrPubKey);yield this.loadMetadataForProjects(t)}catch{this.handleError("Error fetching projects from service")}})}subscribeToMetadataUpdates(){this.indexedDBService.getMetadataStream().pipe(D(this._unsubscribeAll)).subscribe(e=>{if(e){let t=this.projects.find(r=>r.nostrPubKey===e.pubkey);t&&this.updateProjectMetadata(t,e.metadata)}})}getProjectsWithoutMetadata(){return this.projects.filter(e=>!e.displayName||!e.about).map(e=>e.nostrPubKey)}loadMetadataForProjects(e){this.metadataService.fetchMetadataForMultipleKeys(e).then(t=>{t.forEach(r=>{let s=this.projects.find(c=>c.nostrPubKey===r.pubkey);s&&this.updateProjectMetadata(s,r)}),this.changeDetectorRef.detectChanges()}).catch(t=>{console.error("Error fetching metadata for projects:",t)})}loadProjects(){return d(this,null,function*(){this.loading||this.errorMessage==="No more projects found"||(this.loading=!0,this.projectService.fetchProjects().then(e=>d(this,null,function*(){if(e.length===0&&this.projects.length===0)this.errorMessage="No projects found";else if(e.length===0)this.errorMessage="No more projects found";else{this.projects=[...this.projects,...e],this.filteredProjects=[...this.projects];let t=e.map(r=>r.nostrPubKey);yield this.loadMetadataForProjects(t),this.stateService.setProjects(this.projects),this.projects.forEach(r=>this.subscribeToProjectMetadata(r))}this.loading=!1,this.changeDetectorRef.detectChanges()})).catch(e=>{console.error("Error fetching projects:",e),this.errorMessage="Error fetching projects. Please try again later.",this.loading=!1,this.changeDetectorRef.detectChanges()}))})}loadMetadataForProject(e){return d(this,null,function*(){try{let t=yield this.metadataService.fetchMetadataWithCache(e.nostrPubKey);t?this.updateProjectMetadata(e,t):console.warn(`No metadata found for project ${e.nostrPubKey}`)}catch(t){console.error(`Error fetching metadata for project ${e.nostrPubKey}:`,t)}})}updateProjectMetadata(e,t){let r=B(T({},e),{displayName:t.name,about:t.about,picture:t.picture,banner:t.banner}),s=this.projects.findIndex(c=>c.projectIdentifier===e.projectIdentifier);s!==-1&&(this.projects[s]=r,this.projects=[...this.projects]),this.filteredProjects=[...this.projects],this.changeDetectorRef.detectChanges()}subscribeToProjectMetadata(e){this.metadataService.getMetadataStream().pipe(D(this._unsubscribeAll)).subscribe(t=>{t&&t.pubkey===e.nostrPubKey&&this.updateProjectMetadata(e,t.metadata)})}goToProjectDetails(e){this.router.navigate(["/projects",e.projectIdentifier])}filterByQuery(e){if(!e){this.filteredProjects=[...this.projects];return}this.filteredProjects=this.projects.filter(t=>t.displayName?.toLowerCase().includes(e.toLowerCase())||t.about?.toLowerCase().includes(e.toLowerCase()))}toggleCompleted(e){}ngOnDestroy(){this._unsubscribeAll.next(null),this._unsubscribeAll.complete()}handleError(e){console.error(e),this.errorMessage=e,this.loading=!1,this.changeDetectorRef.detectChanges()}getSafeUrl(e,t){if(e&&typeof e=="string"&&this.isImageUrl(e))return this.sanitizer.bypassSecurityTrustUrl(e);{let r=t?"/images/pages/profile/cover.jpg":"images/avatars/avatar-placeholder.png";return this.sanitizer.bypassSecurityTrustUrl(r)}}isImageUrl(e){return/\.(jpeg|jpg|gif|png|svg|bmp|webp|tiff|ico)$/i.test(e)}};i.\u0275fac=function(t){return new(t||i)(u(xe),u(X),u(ye),u(he),u(M),u(W),u(Y))},i.\u0275cmp=A({type:i,selectors:[["explore"]],standalone:!0,features:[q],decls:28,vars:7,consts:[["query",""],[1,"absolute","inset-0","flex","min-w-0","flex-col","overflow-y-auto"],[1,"dark","relative","flex-0","overflow-hidden","bg-gray-800","px-4","py-8","sm:p-16"],["viewBox","0 0 960 540","width","100%","height","100%","preserveAspectRatio","xMidYMax slice","xmlns","http://www.w3.org/2000/svg",1,"absolute","inset-0","pointer-events-none"],["fill","none","stroke","currentColor","stroke-width","100",1,"text-gray-700","opacity-25"],["r","234","cx","196","cy","23"],["r","234","cx","790","cy","491"],[1,"relative","z-10","flex","flex-col","items-center"],[1,"text-xl","font-semibold"],[1,"mt-1","text-center","text-4xl","font-extrabold","leading-tight","tracking-tight","sm:text-7xl"],[1,"text-secondary","mt-6","max-w-2xl","text-center","tracking-tight","sm:text-2xl"],[1,"flex","flex-auto","p-6","sm:p-10"],[1,"mx-auto","flex","w-full","max-w-xs","flex-auto","flex-col","sm:max-w-5xl"],[1,"flex","w-full","max-w-xs","flex-col","items-center","justify-between","sm:max-w-none","sm:flex-row"],[1,"mt-4","w-full","sm:mt-0","sm:w-72",3,"subscriptSizing"],["matPrefix","",1,"icon-size-5",3,"svgIcon"],["placeholder","Search ...","matInput","",3,"input"],[1,"mt-8","sm:ml-auto","sm:mt-0",3,"change","color"],[1,"grid","w-full","min-w-0","grid-cols-1","gap-6","sm:grid-cols-2","md:grid-cols-2","lg:grid-cols-3","mt-10"],[4,"ngFor","ngForOf"],[1,"flex","justify-center","mt-10"],["mat-raised-button","","color","primary",3,"click","disabled"],["class","error-message",4,"ngIf"],[1,"filter-info","flex","w-full","flex-col"],[1,"flex","h-32"],["onerror","this.onerror=null; this.src='/images/pages/profile/cover.jpg';","alt","Card cover image",1,"object-cover",3,"src"],[1,"flex","px-8"],[1,"bg-card","-mt-12","rounded-full","p-1"],["alt","Project logo",1,"h-24","w-24","rounded-full",3,"src"],[1,"flex","flex-col","px-8","pb-6","pt-4"],[1,"flex","items-center","justify-between"],[1,"mr-4"],[1,"text-2xl","font-semibold","leading-tight"],[1,"text-secondary","mt-1","leading-tight"],[1,"flex","h-10","w-10","items-center","justify-center","rounded-full","border"],["mat-icon-button",""],[1,"icon-size-5",3,"svgIcon"],[1,"my-6","w-full","border-t"],[1,"text-secondary","mr-3","text-md","font-medium"],[1,"flex","items-center"],["alt","Investor avatar",1,"text-card","ring-bg-card","m-0.5","-ml-3","h-6","w-6","rounded-full","ring-2",3,"src"],[1,"error-message"]],template:function(t,r){if(t&1){let s=R();n(0,"div",1)(1,"div",2),L(),n(2,"svg",3)(3,"g",4),g(4,"circle",5)(5,"circle",6),a()(),$(),n(6,"div",7)(7,"h2",8),f(8,"Explore Projects"),a(),n(9,"div",9),f(10," What\u2019s your next investment? "),a(),n(11,"div",10),f(12," Check out our projects and find your next investment opportunity. "),a()()(),n(13,"div",11)(14,"div",12)(15,"div",13)(16,"mat-form-field",14),g(17,"mat-icon",15),n(18,"input",16,0),w("input",function(){I(s);let j=V(19);return S(r.filterByQuery(j.value))}),a()(),n(20,"mat-slide-toggle",17),w("change",function(j){return I(s),S(r.toggleCompleted(j))}),f(21," Hide completed "),a()(),n(22,"div",18),F(23,we,23,7,"ng-container",19),a(),n(24,"div",20)(25,"button",21),w("click",function(){return I(s),S(r.loadProjects())}),f(26),a()(),F(27,Me,2,1,"div",22),a()()()}t&2&&(l(16),h("subscriptSizing","dynamic"),l(),h("svgIcon","heroicons_solid:magnifying-glass"),l(3),h("color","primary"),l(3),h("ngForOf",r.projects),l(2),h("disabled",r.loading),l(),y(" ",r.loading?"Loading...":"Load More Projects"," "),l(),h("ngIf",!r.loading&&r.errorMessage))},dependencies:[se,ie,oe,ae,ne,ge,re,te,ee,pe,Z,me,de,ue,fe,ce,le,Q,H,J],encapsulation:2});let o=i;return o})();var ht=[{path:"",component:ve}];export{ht as default};
