import{a as M}from"./chunk-MRA4DDEZ.js";import"./chunk-ESELKVAP.js";import{d as I,e as A}from"./chunk-TYJTVVSW.js";import{Bc as j,G as p,Gb as S,Pb as r,Ra as l,Rb as y,Sa as s,T as g,Wb as C,Xb as k,bc as E,ca as f,da as x,dc as L,ea as h,ib as w,kb as b,n as d,qa as v,rb as m,vb as n,wb as o,xb as _}from"./chunk-PLEXPVNT.js";var F=()=>["/login"];function P(t,e){if(t&1&&(r(0),E(1,"i18nPlural")),t&2){let c=S();y(" Redirecting in ",L(1,1,c.countdown,c.countdownMapping)," ")}}function R(t,e){t&1&&r(0," You are now being redirected! ")}var D=(()=>{let e=class e{constructor(a,i){this._router=a,this._signerService=i,this.countdown=5,this.countdownMapping={"=1":"# second",other:"# seconds"},this._unsubscribeAll=new d}ngOnInit(){p(1e3,1e3).pipe(x(()=>this.countdown>0),f(this._unsubscribeAll),h(()=>this.countdown--),g(()=>{this.logout(),this._router.navigate(["login"])})).subscribe()}ngOnDestroy(){this._unsubscribeAll.next(null),this._unsubscribeAll.complete()}logout(){this._signerService.logout(),console.log("User logged out and keys removed from localStorage.")}};e.\u0275fac=function(i){return new(i||e)(s(I),s(M))},e.\u0275cmp=v({type:e,selectors:[["auth-logout"]],standalone:!0,features:[C],decls:15,vars:4,consts:[[1,"flex","min-w-0","flex-auto","flex-col","items-center","sm:justify-center"],[1,"w-full","px-4","py-8","sm:bg-card","sm:w-auto","sm:rounded-2xl","sm:p-12","sm:shadow"],[1,"mx-auto","w-full","max-w-80","sm:mx-0","sm:w-80"],[1,"mx-auto","w-12"],["src","images/logo/logo.svg"],[1,"mt-8","text-center","text-4xl","font-extrabold","leading-tight","tracking-tight"],[1,"mt-0.5","flex","justify-center","font-medium"],[1,"text-secondary","mt-8","text-center","text-md","font-medium"],[1,"ml-1","text-primary-500","hover:underline",3,"routerLink"]],template:function(i,u){i&1&&(n(0,"div",0)(1,"div",1)(2,"div",2)(3,"div",3),_(4,"img",4),o(),n(5,"div",5),r(6," You have logout! "),o(),n(7,"div",6),w(8,P,2,4)(9,R,1,0),o(),n(10,"div",7)(11,"span"),r(12,"Go to"),o(),n(13,"a",8),r(14,"login "),o()()()()()),i&2&&(l(8),m(u.countdown>0?8:-1),l(),m(u.countdown===0?9:-1),l(4),b("routerLink",k(3,F)))},dependencies:[A,j],encapsulation:2});let t=e;return t})();var W=[{path:"",component:D}];export{W as default};
