import{a as le,b as me,c as de}from"./chunk-VR2WAVZ2.js";import"./chunk-4BKDQFY2.js";import{A as ne,B as re,C as ae,D as se,a as T,b as L,d as G,h as P,i as q,m as $,o as K,q as X,r as Z,v as ee,x as te,y as ie,z as oe}from"./chunk-KIPATDDZ.js";import{$ as z,X as D,Z as Q,ba as O,ca as Y}from"./chunk-532SEEDZ.js";import{a as W}from"./chunk-XPM3L4AO.js";import"./chunk-Z7HY77K5.js";import{b as H,c as J}from"./chunk-5GR7VYEK.js";import{b as V,d as R,e as B}from"./chunk-YP2JDGSS.js";import"./chunk-6GD6B7MT.js";import{$b as I,Aa as _,Ba as b,Db as p,Hb as t,Ib as e,Jb as s,Nb as F,Tb as w,Vb as C,Zb as M,_b as E,ac as S,bb as n,bc as o,cb as u,cc as A,dc as j,ic as U,jc as N,oa as k,ub as f,wb as d,ya as x,za as y}from"./chunk-WYTHB53P.js";var ue=["unlockSessionNgForm"],pe=()=>["/sign-out"];function fe(i,r){if(i&1&&(t(0,"angor-alert",9),o(1),e()),i&2){let g=C();d("appearance","outline")("showIcon",!1)("type",g.alert.type)("@shake",g.alert.type==="error"),n(),j(" ",g.alert.message," ")}}function ge(i,r){i&1&&s(0,"mat-icon",15),i&2&&d("svgIcon","heroicons_solid:eye")}function he(i,r){i&1&&s(0,"mat-icon",15),i&2&&d("svgIcon","heroicons_solid:eye-slash")}function ve(i,r){i&1&&(t(0,"span"),o(1," Unlock your session "),e())}function xe(i,r){i&1&&s(0,"mat-progress-spinner",17),i&2&&d("diameter",24)("mode","indeterminate")}var ce=(()=>{let r=class r{constructor(l,c,a,m,h){this._activatedRoute=l,this._authService=c,this._formBuilder=a,this._router=m,this._userService=h,this.alert={type:"success",message:""},this.showAlert=!1}ngOnInit(){this._userService.user$.subscribe(l=>{this.name=l.name,this._email=l.email}),this.unlockSessionForm=this._formBuilder.group({name:[{value:this.name,disabled:!0}],password:["",K.required]})}unlock(){this.unlockSessionForm.invalid||(this.unlockSessionForm.disable(),this.showAlert=!1,this._authService.unlockSession({email:this._email??"",password:this.unlockSessionForm.get("password").value}).subscribe(()=>{let l=this._activatedRoute.snapshot.queryParamMap.get("redirectURL")||"/signed-in-redirect";this._router.navigateByUrl(l)},l=>{this.unlockSessionForm.enable(),this.unlockSessionNgForm.resetForm({name:{value:this.name,disabled:!0}}),this.alert={type:"error",message:"Invalid password"},this.showAlert=!0}))}};r.\u0275fac=function(c){return new(c||r)(u(V),u(J),u(oe),u(R),u(H))},r.\u0275cmp=k({type:r,selectors:[["auth-unlock-session"]],viewQuery:function(c,a){if(c&1&&M(ue,5),c&2){let m;E(m=I())&&(a.unlockSessionNgForm=m.first)}},standalone:!0,features:[U],decls:60,vars:13,consts:[["unlockSessionNgForm","ngForm"],["passwordField",""],[1,"flex","min-w-0","flex-auto","flex-col","items-center","sm:flex-row","sm:justify-center","md:items-start","md:justify-start"],[1,"w-full","px-4","py-8","sm:bg-card","sm:w-auto","sm:rounded-2xl","sm:p-12","sm:shadow","md:flex","md:h-full","md:w-1/2","md:items-center","md:justify-end","md:rounded-none","md:p-16","md:shadow-none"],[1,"mx-auto","w-full","max-w-80","sm:mx-0","sm:w-80"],[1,"w-12"],["src","images/logo/logo.svg"],[1,"mt-8","text-4xl","font-extrabold","leading-tight","tracking-tight"],[1,"mt-0.5","font-medium"],[1,"mt-8",3,"appearance","showIcon","type"],[1,"mt-8",3,"formGroup"],[1,"w-full"],["id","name","matInput","",3,"formControlName"],["id","password","matInput","","type","password",3,"formControlName"],["mat-icon-button","","type","button","matSuffix","",3,"click"],[1,"icon-size-5",3,"svgIcon"],["mat-flat-button","",1,"angor-mat-button-large","mt-3","w-full",3,"click","color","disabled"],[3,"diameter","mode"],[1,"text-secondary","mt-8","text-md","font-medium"],[1,"ml-1","text-primary-500","hover:underline",3,"routerLink"],[1,"relative","hidden","h-full","w-1/2","flex-auto","items-center","justify-center","overflow-hidden","bg-gray-800","p-16","dark:border-l","md:flex","lg:px-28"],["viewBox","0 0 960 540","width","100%","height","100%","preserveAspectRatio","xMidYMax slice","xmlns","http://www.w3.org/2000/svg",1,"absolute","inset-0","pointer-events-none"],["fill","none","stroke","currentColor","stroke-width","100",1,"text-gray-700","opacity-25"],["r","234","cx","196","cy","23"],["r","234","cx","790","cy","491"],["viewBox","0 0 220 192","width","220","height","192","fill","none",1,"absolute","-top-16","-right-16","text-gray-700"],["id","837c3e70-6c3a-44e6-8854-cc48c737b659","x","0","y","0","width","20","height","20","patternUnits","userSpaceOnUse"],["x","0","y","0","width","4","height","4","fill","currentColor"],["width","220","height","192","fill","url(#837c3e70-6c3a-44e6-8854-cc48c737b659)"],[1,"relative","z-10","w-full","max-w-2xl"],[1,"text-7xl","font-bold","leading-none","text-gray-100"],[1,"mt-6","text-lg","leading-6","tracking-tight","text-gray-400"],[1,"mt-8","flex","items-center"],[1,"flex","flex-0","items-center","-space-x-1.5"],["src","images/avatars/female-18.jpg",1,"h-10","w-10","flex-0","rounded-full","object-cover","ring-4","ring-gray-800","ring-offset-1","ring-offset-gray-800"],["src","images/avatars/female-11.jpg",1,"h-10","w-10","flex-0","rounded-full","object-cover","ring-4","ring-gray-800","ring-offset-1","ring-offset-gray-800"],["src","images/avatars/male-09.jpg",1,"h-10","w-10","flex-0","rounded-full","object-cover","ring-4","ring-gray-800","ring-offset-1","ring-offset-gray-800"],["src","images/avatars/male-16.jpg",1,"h-10","w-10","flex-0","rounded-full","object-cover","ring-4","ring-gray-800","ring-offset-1","ring-offset-gray-800"],[1,"ml-4","font-medium","tracking-tight","text-gray-400"]],template:function(c,a){if(c&1){let m=F();t(0,"div",2)(1,"div",3)(2,"div",4)(3,"div",5),s(4,"img",6),e(),t(5,"div",7),o(6," Unlock your session "),e(),t(7,"div",8),o(8," Your session is locked due to inactivity "),e(),f(9,fe,2,5,"angor-alert",9),t(10,"form",10,0)(12,"mat-form-field",11)(13,"mat-label"),o(14,"Full name"),e(),s(15,"input",12),e(),t(16,"mat-form-field",11)(17,"mat-label"),o(18,"Password"),e(),s(19,"input",13,1),t(21,"button",14),w("click",function(){x(m);let v=S(20);return y(v.type==="password"?v.type="text":v.type="password")}),f(22,ge,1,1,"mat-icon",15)(23,he,1,1,"mat-icon",15),e(),t(24,"mat-error"),o(25," Password is required "),e()(),t(26,"button",16),w("click",function(){return x(m),y(a.unlock())}),f(27,ve,2,0,"span")(28,xe,1,2,"mat-progress-spinner",17),e(),t(29,"div",18)(30,"span"),o(31,"I'm not"),e(),t(32,"a",19),o(33),e()()()()(),t(34,"div",20),_(),t(35,"svg",21)(36,"g",22),s(37,"circle",23)(38,"circle",24),e()(),t(39,"svg",25)(40,"defs")(41,"pattern",26),s(42,"rect",27),e()(),s(43,"rect",28),e(),b(),t(44,"div",29)(45,"div",30)(46,"div"),o(47,"Welcome to"),e(),t(48,"div"),o(49,"our community"),e()(),t(50,"div",31),o(51," Angor helps developers to build organized and well coded dashboards full of beautiful and rich modules. Join us and start building your application today. "),e(),t(52,"div",32)(53,"div",33),s(54,"img",34)(55,"img",35)(56,"img",36)(57,"img",37),e(),t(58,"div",38),o(59," More than 17k people joined us, it's your turn "),e()()()()()}if(c&2){let m=S(20);n(9),p(a.showAlert?9:-1),n(),d("formGroup",a.unlockSessionForm),n(5),d("formControlName","name"),n(4),d("formControlName","password"),n(3),p(m.type==="password"?22:-1),n(),p(m.type==="text"?23:-1),n(3),d("color","primary")("disabled",a.unlockSessionForm.disabled),n(),p(a.unlockSessionForm.disabled?-1:27),n(),p(a.unlockSessionForm.disabled?28:-1),n(4),d("routerLink",N(12,pe)),n(),A(a.name)}},dependencies:[de,ne,ee,$,X,Z,re,te,ie,q,P,T,L,G,se,ae,z,D,Q,Y,O,me,le,B],encapsulation:2,data:{animation:W}});let i=r;return i})();var Pe=[{path:"",component:ce}];export{Pe as default};
