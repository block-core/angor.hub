import{d as A,e as I}from"./chunk-XCEH5654.js";import{j}from"./chunk-DNRPKDOR.js";import{Fb as m,G as d,Jb as n,Kb as i,Lb as _,S as p,Xb as y,ba as f,ca as x,da as g,db as l,dc as o,eb as w,fc as C,kc as S,lc as k,n as c,qa as h,sc as E,uc as L,wb as v,yb as b}from"./chunk-E43IZEHU.js";var D=()=>["/login"];function F(t,e){if(t&1&&(o(0),E(1,"i18nPlural")),t&2){let s=y();C(" Redirecting in ",L(1,1,s.countdown,s.countdownMapping)," ")}}function P(t,e){t&1&&o(0," You are now being redirected! ")}var M=(()=>{let e=class e{constructor(a){this._router=a,this.countdown=5,this.countdownMapping={"=1":"# second",other:"# seconds"},this._unsubscribeAll=new c}ngOnInit(){d(1e3,1e3).pipe(p(()=>{this._router.navigate(["login"])}),x(()=>this.countdown>0),f(this._unsubscribeAll),g(()=>this.countdown--)).subscribe()}ngOnDestroy(){this._unsubscribeAll.next(null),this._unsubscribeAll.complete()}};e.\u0275fac=function(r){return new(r||e)(w(A))},e.\u0275cmp=h({type:e,selectors:[["auth-logout"]],standalone:!0,features:[S],decls:15,vars:4,consts:[[1,"flex","min-w-0","flex-auto","flex-col","items-center","sm:justify-center"],[1,"w-full","px-4","py-8","sm:bg-card","sm:w-auto","sm:rounded-2xl","sm:p-12","sm:shadow"],[1,"mx-auto","w-full","max-w-80","sm:mx-0","sm:w-80"],[1,"mx-auto","w-12"],["src","images/logo/logo.svg"],[1,"mt-8","text-center","text-4xl","font-extrabold","leading-tight","tracking-tight"],[1,"mt-0.5","flex","justify-center","font-medium"],[1,"text-secondary","mt-8","text-center","text-md","font-medium"],[1,"ml-1","text-primary-500","hover:underline",3,"routerLink"]],template:function(r,u){r&1&&(n(0,"div",0)(1,"div",1)(2,"div",2)(3,"div",3),_(4,"img",4),i(),n(5,"div",5),o(6," You have logout! "),i(),n(7,"div",6),v(8,F,2,4)(9,P,1,0),i(),n(10,"div",7)(11,"span"),o(12,"Go to"),i(),n(13,"a",8),o(14,"login "),i()()()()()),r&2&&(l(8),m(u.countdown>0?8:-1),l(),m(u.countdown===0?9:-1),l(4),b("routerLink",k(3,D)))},dependencies:[I,j],encapsulation:2});let t=e;return t})();var U=[{path:"",component:M}];export{U as default};
