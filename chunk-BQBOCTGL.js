import{b as re,c as ae,d as se}from"./chunk-36BH25XR.js";import{a as ne}from"./chunk-SH67RCV2.js";import{d as K,e as V}from"./chunk-4ZPAOZ2G.js";import{a as oe}from"./chunk-3M7SKHLC.js";import"./chunk-5J2MJQT5.js";import"./chunk-WY3GIJSF.js";import{C as R,E as x,G as H,H as Y,L as J,N as Q,O as X,P as Z,R as $,S as ee,T as te,U as ie,q,r as P,t as B,x as W,y as z}from"./chunk-D2DYHX5U.js";import"./chunk-B23D77YI.js";import{Y as j,_ as G,aa as U,ca as D,da as O}from"./chunk-FJKCM5SV.js";import{$b as k,Aa as M,Ba as F,Cc as T,Db as L,Gb as y,Hc as N,Ib as S,Sb as v,Ta as o,Tb as s,Ua as w,Vb as I,_b as A,h as C,hb as c,mb as n,qa as b,tb as E,xb as i,ya as h,yb as t,za as _,zb as a}from"./chunk-MRO7MB7O.js";var le=()=>["/register"];function ce(e,m){if(e&1&&(i(0,"angor-alert",39),s(1),t()),e&2){let g=S();n("appearance","outline")("showIcon",!1)("type",g.secAlert.type)("@shake",g.secAlert.type==="error"),o(),I(" ",g.secAlert.message," ")}}function pe(e,m){if(e&1){let g=L();i(0,"div")(1,"div",14),a(2,"div",15),i(3,"div",16),s(4,"Login with extension"),t(),a(5,"div",15),t(),i(6,"div",40)(7,"button",41),y("click",function(){h(g);let d=S();return _(d.loginWithNostrExtension())}),a(8,"mat-icon",42),i(9,"span"),s(10,"Login with Nostr Extension"),t()()(),i(11,"div",14),a(12,"div",15),i(13,"div",16),s(14,"Or"),t(),a(15,"div",15),t()()}e&2&&(o(8),n("svgIcon","feather:zap"))}function de(e,m){e&1&&(i(0,"mat-error"),s(1," Secret key is required "),t())}function ge(e,m){e&1&&a(0,"mat-icon",42),e&2&&n("svgIcon","heroicons_solid:eye")}function ue(e,m){e&1&&a(0,"mat-icon",42),e&2&&n("svgIcon","heroicons_solid:eye-slash")}function fe(e,m){e&1&&(i(0,"mat-error"),s(1," Password is required "),t())}function he(e,m){e&1&&(i(0,"span"),s(1,"Login"),t())}function _e(e,m){e&1&&a(0,"mat-progress-spinner",43)}function ye(e,m){if(e&1&&(i(0,"angor-alert",39),s(1),t()),e&2){let g=S();n("appearance","outline")("showIcon",!1)("type",g.menemonicAlert.type)("@shake",g.menemonicAlert.type==="error"),o(),I(" ",g.menemonicAlert.message," ")}}function ve(e,m){e&1&&(i(0,"mat-error"),s(1," Menemonic is required "),t())}function xe(e,m){e&1&&a(0,"mat-icon",42),e&2&&n("svgIcon","heroicons_solid:eye")}function we(e,m){e&1&&a(0,"mat-icon",42),e&2&&n("svgIcon","heroicons_solid:eye-slash")}function Se(e,m){e&1&&(i(0,"mat-error"),s(1," Passphrase is required "),t())}function Ee(e,m){e&1&&a(0,"mat-icon",42),e&2&&n("svgIcon","heroicons_solid:eye")}function Le(e,m){e&1&&a(0,"mat-icon",42),e&2&&n("svgIcon","heroicons_solid:eye-slash")}function Ie(e,m){e&1&&(i(0,"mat-error"),s(1," Password is required "),t())}function Ce(e,m){e&1&&(i(0,"span"),s(1,"Login"),t())}function be(e,m){e&1&&a(0,"mat-progress-spinner",43)}var me=(()=>{let m=class m{constructor(p,d,r){this._formBuilder=p,this._router=d,this._signerService=r,this.secAlert={type:"error",message:""},this.showSecAlert=!1,this.menemonicAlert={type:"error",message:""},this.showMenemonicAlert=!1,this.loading=!1,this.isInstalledExtension=!1,this.privateKey=new Uint8Array,this.publicKey="",this.npub="",this.nsec=""}ngOnInit(){this.initializeForms(),this.checkNostrExtensionAvailability()}initializeForms(){this.SecretKeyLoginForm=this._formBuilder.group({secretKey:["",[x.required,x.minLength(3)]],password:["",x.required]}),this.MenemonicLoginForm=this._formBuilder.group({menemonic:["",[x.required,x.minLength(3)]],passphrase:[""],password:["",x.required]})}checkNostrExtensionAvailability(){let p=globalThis;p.nostr&&typeof p.nostr.signEvent=="function"?this.isInstalledExtension=!0:this.isInstalledExtension=!1}loginWithSecretKey(){if(this.SecretKeyLoginForm.invalid)return;let p=this.SecretKeyLoginForm.get("secretKey")?.value,d=this.SecretKeyLoginForm.get("password")?.value;this.loading=!0,this.showSecAlert=!1;try{if(this._signerService.handleLoginWithKey(p,d))this._router.navigateByUrl("/home");else throw new Error("Secret key is missing or invalid.")}catch(r){this.loading=!1,this.secAlert.message=r instanceof Error?r.message:"An unexpected error occurred.",this.showSecAlert=!0,console.error("Login error: ",r)}}loginWithMenemonic(){if(this.MenemonicLoginForm.invalid)return;let p=this.MenemonicLoginForm.get("menemonic")?.value,d=this.MenemonicLoginForm.get("passphrase")?.value||"",r=this.MenemonicLoginForm.get("password")?.value;this.loading=!0,this.showMenemonicAlert=!1,this._signerService.handleLoginWithMenemonic(p,d,r)?this._router.navigateByUrl("/home"):(this.loading=!1,this.menemonicAlert.message="Menemonic is missing or invalid.",this.showMenemonicAlert=!0)}loginWithNostrExtension(){return C(this,null,function*(){(yield this._signerService.handleLoginWithExtension())?this._router.navigateByUrl("/home"):console.error("Failed to log in using Nostr extension")})}};m.\u0275fac=function(d){return new(d||m)(w(Z),w(K),w(ne))},m.\u0275cmp=b({type:m,selectors:[["auth-sign-in"]],standalone:!0,features:[A],decls:86,vars:27,consts:[["secretPasswordField",""],["passphraseField",""],["menemonicPasswordField",""],[1,"flex","min-w-0","flex-auto","flex-col","items-center","sm:flex-row","sm:justify-center","md:items-start","md:justify-start"],[1,"w-full","px-4","py-8","sm:bg-card","sm:w-auto","sm:rounded-2xl","sm:p-12","sm:shadow","md:flex","md:h-full","md:w-1/2","md:items-center","md:justify-end","md:rounded-none","md:p-16","md:shadow-none"],[1,"mx-auto","w-full","max-w-80","sm:mx-0","sm:w-80"],[1,"w-12"],["src","images/logo/logo.svg"],[1,"mt-8","text-4xl","font-extrabold","leading-tight","tracking-tight"],[1,"mt-0.5","flex","items-baseline","font-medium"],[1,"ml-1","text-primary-500","hover:underline",3,"routerLink"],["class","mt-8",3,"appearance","showIcon","type",4,"ngIf"],[4,"ngIf"],[1,"mt-8",3,"ngSubmit","formGroup"],[1,"mt-8","flex","items-center"],[1,"mt-px","flex-auto","border-t"],[1,"text-secondary","mx-2"],[1,"w-full"],["matInput","","formControlName","secretKey","autocomplete","secretKey"],["matInput","","type","password","autocomplete","current-password-seckey",3,"formControlName"],["mat-icon-button","","type","button","matSuffix","",3,"click"],["class","icon-size-5",3,"svgIcon",4,"ngIf"],["mat-flat-button","","color","primary",1,"angor-mat-button-large","mt-6","w-full",3,"disabled"],["diameter","24","mode","indeterminate",4,"ngIf"],["matInput","","formControlName","menemonic","autocomplete","menemonic"],["matInput","","type","password","autocomplete","current-passphrase-menemonic",3,"formControlName"],["matInput","","type","password","autocomplete","current-password-menemonic",3,"formControlName"],[1,"relative","hidden","h-full","w-1/2","flex-auto","items-center","justify-center","overflow-hidden","bg-gray-800","p-16","dark:border-l","md:flex","lg:px-28"],["viewBox","0 0 960 540","width","100%","height","100%","preserveAspectRatio","xMidYMax slice","xmlns","http://www.w3.org/2000/svg",1,"absolute","inset-0","pointer-events-none"],["fill","none","stroke","currentColor","stroke-width","100",1,"text-gray-700","opacity-25"],["r","234","cx","196","cy","23"],["r","234","cx","790","cy","491"],["viewBox","0 0 220 192","width","220","height","192","fill","none",1,"absolute","-top-16","-right-16","text-gray-700"],["id","837c3e70-6c3a-44e6-8854-cc48c737b659","x","0","y","0","width","20","height","20","patternUnits","userSpaceOnUse"],["x","0","y","0","width","4","height","4","fill","currentColor"],["width","220","height","192","fill","url(#837c3e70-6c3a-44e6-8854-cc48c737b659)"],[1,"relative","z-10","w-full","max-w-2xl"],[1,"text-7xl","font-bold","leading-none","text-gray-100"],[1,"mt-6","text-lg","leading-6","tracking-tight","text-gray-400"],[1,"mt-8",3,"appearance","showIcon","type"],[1,"mt-8","flex","items-center","space-x-4"],["type","button","mat-stroked-button","",1,"flex-auto","space-x-2",3,"click"],[1,"icon-size-5",3,"svgIcon"],["diameter","24","mode","indeterminate"]],template:function(d,r){if(d&1){let u=L();i(0,"div",3)(1,"div",4)(2,"div",5)(3,"div",6),a(4,"img",7),t(),i(5,"div",8),s(6," Login "),t(),i(7,"div",9)(8,"div"),s(9,"Don't have an account?"),t(),i(10,"a",10),s(11,"Register"),t()(),c(12,ce,2,5,"angor-alert",11)(13,pe,16,1,"div",12),i(14,"form",13),y("ngSubmit",function(){return h(u),_(r.loginWithSecretKey())}),i(15,"div",14),a(16,"div",15),i(17,"div",16),s(18,"Enter secret key"),t(),a(19,"div",15),t(),i(20,"mat-form-field",17)(21,"mat-label"),s(22,"Secret Key"),t(),a(23,"input",18),c(24,de,2,0,"mat-error"),t(),i(25,"mat-form-field",17)(26,"mat-label"),s(27,"Password"),t(),a(28,"input",19,0),i(30,"button",20),y("click",function(){h(u);let l=v(29);return _(l.type==="password"?l.type="text":l.type="password")}),c(31,ge,1,1,"mat-icon",21)(32,ue,1,1,"mat-icon",21),t(),c(33,fe,2,0,"mat-error",12),t(),i(34,"button",22),c(35,he,2,0,"span",12)(36,_e,1,0,"mat-progress-spinner",23),t()(),i(37,"div",14),a(38,"div",15),i(39,"div",16),s(40,"Or enter menemonic"),t(),a(41,"div",15),t(),c(42,ye,2,5,"angor-alert",11),i(43,"form",13),y("ngSubmit",function(){return h(u),_(r.loginWithMenemonic())}),i(44,"mat-form-field",17)(45,"mat-label"),s(46,"Menemonic"),t(),a(47,"input",24),c(48,ve,2,0,"mat-error"),t(),i(49,"mat-form-field",17)(50,"mat-label"),s(51,"Passphrase (Optional)"),t(),a(52,"input",25,1),i(54,"button",20),y("click",function(){h(u);let l=v(53);return _(l.type==="password"?l.type="text":l.type="password")}),c(55,xe,1,1,"mat-icon",21)(56,we,1,1,"mat-icon",21),t(),c(57,Se,2,0,"mat-error",12),t(),i(58,"mat-form-field",17)(59,"mat-label"),s(60,"Password"),t(),a(61,"input",26,2),i(63,"button",20),y("click",function(){h(u);let l=v(62);return _(l.type==="password"?l.type="text":l.type="password")}),c(64,Ee,1,1,"mat-icon",21)(65,Le,1,1,"mat-icon",21),t(),c(66,Ie,2,0,"mat-error",12),t(),i(67,"button",22),c(68,Ce,2,0,"span",12)(69,be,1,0,"mat-progress-spinner",23),t()()()(),i(70,"div",27),M(),i(71,"svg",28)(72,"g",29),a(73,"circle",30)(74,"circle",31),t()(),i(75,"svg",32)(76,"defs")(77,"pattern",33),a(78,"rect",34),t()(),a(79,"rect",35),t(),F(),i(80,"div",36)(81,"div",37)(82,"div"),s(83,"Angor Hub"),t()(),i(84,"div",38),s(85," Angor Hub is a Nostr client customized around the Angor protocol, a decentralized crowdfunding platform. "),t()()()()}if(d&2){let u=v(29),f=v(53),l=v(62);o(10),n("routerLink",k(26,le)),o(2),n("ngIf",r.showSecAlert),o(),n("ngIf",r.isInstalledExtension),o(),n("formGroup",r.SecretKeyLoginForm),o(10),E(r.SecretKeyLoginForm.get("secretKey").hasError("required")?24:-1),o(4),n("formControlName","password"),o(3),n("ngIf",u.type==="password"),o(),n("ngIf",u.type==="text"),o(),n("ngIf",r.SecretKeyLoginForm.get("password").hasError("required")),o(),n("disabled",r.SecretKeyLoginForm.invalid),o(),n("ngIf",!r.loading),o(),n("ngIf",r.loading),o(6),n("ngIf",r.showMenemonicAlert),o(),n("formGroup",r.MenemonicLoginForm),o(5),E(r.MenemonicLoginForm.get("menemonic").hasError("required")?48:-1),o(4),n("formControlName","passphrase"),o(3),n("ngIf",f.type==="password"),o(),n("ngIf",f.type==="text"),o(),n("ngIf",r.MenemonicLoginForm.get("passphrase").hasError("required")),o(4),n("formControlName","password"),o(3),n("ngIf",l.type==="password"),o(),n("ngIf",l.type==="text"),o(),n("ngIf",r.MenemonicLoginForm.get("password").hasError("required")),o(),n("disabled",r.MenemonicLoginForm.invalid),o(),n("ngIf",!r.loading),o(),n("ngIf",r.loading)}},dependencies:[V,oe,$,J,R,H,Y,ee,Q,X,z,W,q,P,B,ie,te,U,j,G,O,D,re,se,ae,N,T],encapsulation:2});let e=m;return e})();var Xe=[{path:"",component:me}];export{Xe as default};
