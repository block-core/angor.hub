import{a as ne}from"./chunk-2JL3FDMX.js";import{a as oe,c as re,d as ae,e as se}from"./chunk-YKVPUU23.js";import"./chunk-YT4QGOI5.js";import"./chunk-KQX6Z6FU.js";import{d as N,e as V}from"./chunk-XCEH5654.js";import{C as R,E as x,G as H,H as Y,L as J,N as Q,O as X,P as Z,R as $,S as ee,T as te,U as ie,q,r as P,t as B,x as W,y as z}from"./chunk-FOIKTNAL.js";import{$ as U,X as j,Z as G,ba as D,ca as O}from"./chunk-UUQOEFCO.js";import{f as T,k as K}from"./chunk-DNRPKDOR.js";import{Aa as h,Ba as _,Ca as M,Da as F,Fb as E,Jb as i,Kb as t,Lb as a,Pb as L,Vb as y,Xb as S,cc as v,db as o,dc as m,eb as w,fc as I,h as C,kc as A,lc as k,qa as b,wb as c,yb as n}from"./chunk-E43IZEHU.js";var le=()=>["/register"];function ce(e,s){if(e&1&&(i(0,"angor-alert",39),m(1),t()),e&2){let g=S();n("appearance","outline")("showIcon",!1)("type",g.secAlert.type)("@shake",g.secAlert.type==="error"),o(),I(" ",g.secAlert.message," ")}}function pe(e,s){e&1&&(i(0,"mat-error"),m(1," Secret key is required "),t())}function de(e,s){e&1&&a(0,"mat-icon",40),e&2&&n("svgIcon","heroicons_solid:eye")}function ge(e,s){e&1&&a(0,"mat-icon",40),e&2&&n("svgIcon","heroicons_solid:eye-slash")}function ue(e,s){e&1&&(i(0,"mat-error"),m(1," Password is required "),t())}function fe(e,s){e&1&&(i(0,"span"),m(1,"Login"),t())}function he(e,s){e&1&&a(0,"mat-progress-spinner",41)}function _e(e,s){if(e&1&&(i(0,"angor-alert",39),m(1),t()),e&2){let g=S();n("appearance","outline")("showIcon",!1)("type",g.menemonicAlert.type)("@shake",g.menemonicAlert.type==="error"),o(),I(" ",g.menemonicAlert.message," ")}}function ye(e,s){e&1&&(i(0,"mat-error"),m(1," Menemonic is required "),t())}function ve(e,s){e&1&&a(0,"mat-icon",40),e&2&&n("svgIcon","heroicons_solid:eye")}function xe(e,s){e&1&&a(0,"mat-icon",40),e&2&&n("svgIcon","heroicons_solid:eye-slash")}function we(e,s){e&1&&(i(0,"mat-error"),m(1," Passphrase is required "),t())}function Se(e,s){e&1&&a(0,"mat-icon",40),e&2&&n("svgIcon","heroicons_solid:eye")}function Ee(e,s){e&1&&a(0,"mat-icon",40),e&2&&n("svgIcon","heroicons_solid:eye-slash")}function Le(e,s){e&1&&(i(0,"mat-error"),m(1," Password is required "),t())}function Ie(e,s){e&1&&(i(0,"span"),m(1,"Login"),t())}function Ce(e,s){e&1&&a(0,"mat-progress-spinner",41)}function be(e,s){if(e&1){let g=L();i(0,"div")(1,"div",13),a(2,"div",14),i(3,"div",15),m(4,"Or login with extension"),t(),a(5,"div",14),t(),i(6,"div",42)(7,"button",43),y("click",function(){h(g);let d=S();return _(d.loginWithNostrExtension())}),a(8,"mat-icon",40),t()()()}e&2&&(o(8),n("svgIcon","feather:zap"))}var me=(()=>{let s=class s{constructor(p,d,r){this._formBuilder=p,this._router=d,this._signerService=r,this.secAlert={type:"error",message:""},this.showSecAlert=!1,this.menemonicAlert={type:"error",message:""},this.showMenemonicAlert=!1,this.loading=!1,this.isInstalledExtension=!1,this.privateKey=new Uint8Array,this.publicKey="",this.npub="",this.nsec=""}ngOnInit(){this.initializeForms(),this.checkNostrExtensionAvailability()}initializeForms(){this.SecretKeyLoginForm=this._formBuilder.group({secretKey:["",[x.required,x.minLength(3)]],password:["",x.required]}),this.MenemonicLoginForm=this._formBuilder.group({menemonic:["",[x.required,x.minLength(3)]],passphrase:[""],password:["",x.required]})}checkNostrExtensionAvailability(){let p=globalThis;p.nostr&&typeof p.nostr.signEvent=="function"?this.isInstalledExtension=!0:this.isInstalledExtension=!1}loginWithSecretKey(){if(this.SecretKeyLoginForm.invalid)return;let p=this.SecretKeyLoginForm.get("secretKey")?.value,d=this.SecretKeyLoginForm.get("password")?.value;this.loading=!0,this.showSecAlert=!1;try{if(this._signerService.handleLoginWithKey(p))this._router.navigateByUrl("/home");else throw new Error("Secret key is missing or invalid.")}catch(r){this.loading=!1,this.secAlert.message=r instanceof Error?r.message:"An unexpected error occurred.",this.showSecAlert=!0,console.error("Login error: ",r)}}loginWithMenemonic(){if(this.MenemonicLoginForm.invalid)return;let p=this.MenemonicLoginForm.get("menemonic")?.value,d=this.MenemonicLoginForm.get("passphrase")?.value||"",r=this.MenemonicLoginForm.get("password")?.value;this.loading=!0,this.showMenemonicAlert=!1,this._signerService.handleLoginWithMenemonic(p,d)?this._router.navigateByUrl("/home"):(this.loading=!1,this.menemonicAlert.message="Menemonic is missing or invalid.",this.showMenemonicAlert=!0)}loginWithNostrExtension(){return C(this,null,function*(){(yield this._signerService.handleLoginWithExtension())?this._router.navigateByUrl("/home"):console.error("Failed to log in using Nostr extension")})}};s.\u0275fac=function(d){return new(d||s)(w(Z),w(N),w(ne))},s.\u0275cmp=b({type:s,selectors:[["auth-sign-in"]],standalone:!0,features:[A],decls:86,vars:27,consts:[["secretPasswordField",""],["passphraseField",""],["menemonicPasswordField",""],[1,"flex","min-w-0","flex-auto","flex-col","items-center","sm:flex-row","sm:justify-center","md:items-start","md:justify-start"],[1,"w-full","px-4","py-8","sm:bg-card","sm:w-auto","sm:rounded-2xl","sm:p-12","sm:shadow","md:flex","md:h-full","md:w-1/2","md:items-center","md:justify-end","md:rounded-none","md:p-16","md:shadow-none"],[1,"mx-auto","w-full","max-w-80","sm:mx-0","sm:w-80"],[1,"w-12"],["src","images/logo/logo.svg"],[1,"mt-8","text-4xl","font-extrabold","leading-tight","tracking-tight"],[1,"mt-0.5","flex","items-baseline","font-medium"],[1,"ml-1","text-primary-500","hover:underline",3,"routerLink"],["class","mt-8",3,"appearance","showIcon","type",4,"ngIf"],[1,"mt-8",3,"ngSubmit","formGroup"],[1,"mt-8","flex","items-center"],[1,"mt-px","flex-auto","border-t"],[1,"text-secondary","mx-2"],[1,"w-full"],["matInput","","formControlName","secretKey","autocomplete","secretKey"],["matInput","","type","password","autocomplete","current-password-seckey",3,"formControlName"],["mat-icon-button","","type","button","matSuffix","",3,"click"],["class","icon-size-5",3,"svgIcon",4,"ngIf"],[4,"ngIf"],["mat-flat-button","","color","primary",1,"angor-mat-button-large","mt-6","w-full",3,"disabled"],["diameter","24","mode","indeterminate",4,"ngIf"],["matInput","","formControlName","menemonic","autocomplete","menemonic"],["matInput","","type","password","autocomplete","current-passphrase-menemonic",3,"formControlName"],["matInput","","type","password","autocomplete","current-password-menemonic",3,"formControlName"],[1,"relative","hidden","h-full","w-1/2","flex-auto","items-center","justify-center","overflow-hidden","bg-gray-800","p-16","dark:border-l","md:flex","lg:px-28"],["viewBox","0 0 960 540","width","100%","height","100%","preserveAspectRatio","xMidYMax slice","xmlns","http://www.w3.org/2000/svg",1,"absolute","inset-0","pointer-events-none"],["fill","none","stroke","currentColor","stroke-width","100",1,"text-gray-700","opacity-25"],["r","234","cx","196","cy","23"],["r","234","cx","790","cy","491"],["viewBox","0 0 220 192","width","220","height","192","fill","none",1,"absolute","-top-16","-right-16","text-gray-700"],["id","837c3e70-6c3a-44e6-8854-cc48c737b659","x","0","y","0","width","20","height","20","patternUnits","userSpaceOnUse"],["x","0","y","0","width","4","height","4","fill","currentColor"],["width","220","height","192","fill","url(#837c3e70-6c3a-44e6-8854-cc48c737b659)"],[1,"relative","z-10","w-full","max-w-2xl"],[1,"text-7xl","font-bold","leading-none","text-gray-100"],[1,"mt-6","text-lg","leading-6","tracking-tight","text-gray-400"],[1,"mt-8",3,"appearance","showIcon","type"],[1,"icon-size-5",3,"svgIcon"],["diameter","24","mode","indeterminate"],[1,"mt-8","flex","items-center","space-x-4"],["type","button","mat-stroked-button","",1,"flex-auto",3,"click"]],template:function(d,r){if(d&1){let u=L();i(0,"div",3)(1,"div",4)(2,"div",5)(3,"div",6),a(4,"img",7),t(),i(5,"div",8),m(6," Login "),t(),i(7,"div",9)(8,"div"),m(9,"Don't have an account?"),t(),i(10,"a",10),m(11,"Register"),t()(),c(12,ce,2,5,"angor-alert",11),i(13,"form",12),y("ngSubmit",function(){return h(u),_(r.loginWithSecretKey())}),i(14,"div",13),a(15,"div",14),i(16,"div",15),m(17,"Enter secret key"),t(),a(18,"div",14),t(),i(19,"mat-form-field",16)(20,"mat-label"),m(21,"Secret Key"),t(),a(22,"input",17),c(23,pe,2,0,"mat-error"),t(),i(24,"mat-form-field",16)(25,"mat-label"),m(26,"Password"),t(),a(27,"input",18,0),i(29,"button",19),y("click",function(){h(u);let l=v(28);return _(l.type==="password"?l.type="text":l.type="password")}),c(30,de,1,1,"mat-icon",20)(31,ge,1,1,"mat-icon",20),t(),c(32,ue,2,0,"mat-error",21),t(),i(33,"button",22),c(34,fe,2,0,"span",21)(35,he,1,0,"mat-progress-spinner",23),t()(),i(36,"div",13),a(37,"div",14),i(38,"div",15),m(39,"Or enter menemonic"),t(),a(40,"div",14),t(),c(41,_e,2,5,"angor-alert",11),i(42,"form",12),y("ngSubmit",function(){return h(u),_(r.loginWithMenemonic())}),i(43,"mat-form-field",16)(44,"mat-label"),m(45,"Menemonic"),t(),a(46,"input",24),c(47,ye,2,0,"mat-error"),t(),i(48,"mat-form-field",16)(49,"mat-label"),m(50,"Passphrase (Optional)"),t(),a(51,"input",25,1),i(53,"button",19),y("click",function(){h(u);let l=v(52);return _(l.type==="password"?l.type="text":l.type="password")}),c(54,ve,1,1,"mat-icon",20)(55,xe,1,1,"mat-icon",20),t(),c(56,we,2,0,"mat-error",21),t(),i(57,"mat-form-field",16)(58,"mat-label"),m(59,"Password"),t(),a(60,"input",26,2),i(62,"button",19),y("click",function(){h(u);let l=v(61);return _(l.type==="password"?l.type="text":l.type="password")}),c(63,Se,1,1,"mat-icon",20)(64,Ee,1,1,"mat-icon",20),t(),c(65,Le,2,0,"mat-error",21),t(),i(66,"button",22),c(67,Ie,2,0,"span",21)(68,Ce,1,0,"mat-progress-spinner",23),t()(),c(69,be,9,1,"div",21),t()(),i(70,"div",27),M(),i(71,"svg",28)(72,"g",29),a(73,"circle",30)(74,"circle",31),t()(),i(75,"svg",32)(76,"defs")(77,"pattern",33),a(78,"rect",34),t()(),a(79,"rect",35),t(),F(),i(80,"div",36)(81,"div",37)(82,"div"),m(83,"Angor Hub"),t()(),i(84,"div",38),m(85," Angor Hub is a Nostr client customized around the Angor protocol, a decentralized crowdfunding platform. "),t()()()()}if(d&2){let u=v(28),f=v(52),l=v(61);o(10),n("routerLink",k(26,le)),o(2),n("ngIf",r.showSecAlert),o(),n("formGroup",r.SecretKeyLoginForm),o(10),E(r.SecretKeyLoginForm.get("secretKey").hasError("required")?23:-1),o(4),n("formControlName","password"),o(3),n("ngIf",u.type==="password"),o(),n("ngIf",u.type==="text"),o(),n("ngIf",r.SecretKeyLoginForm.get("password").hasError("required")),o(),n("disabled",r.SecretKeyLoginForm.invalid),o(),n("ngIf",!r.loading),o(),n("ngIf",r.loading),o(6),n("ngIf",r.showMenemonicAlert),o(),n("formGroup",r.MenemonicLoginForm),o(5),E(r.MenemonicLoginForm.get("menemonic").hasError("required")?47:-1),o(4),n("formControlName","passphrase"),o(3),n("ngIf",f.type==="password"),o(),n("ngIf",f.type==="text"),o(),n("ngIf",r.MenemonicLoginForm.get("passphrase").hasError("required")),o(4),n("formControlName","password"),o(3),n("ngIf",l.type==="password"),o(),n("ngIf",l.type==="text"),o(),n("ngIf",r.MenemonicLoginForm.get("password").hasError("required")),o(),n("disabled",r.MenemonicLoginForm.invalid),o(),n("ngIf",!r.loading),o(),n("ngIf",r.loading),o(),n("ngIf",r.isInstalledExtension)}},dependencies:[V,oe,$,J,R,H,Y,ee,Q,X,z,W,q,P,B,ie,te,U,j,G,O,D,re,se,ae,K,T],encapsulation:2});let e=s;return e})();var Xe=[{path:"",component:me}];export{Xe as default};
