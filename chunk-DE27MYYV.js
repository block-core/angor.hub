import{a as oe,b as se}from"./chunk-ZPYJINQV.js";import{a as ee,b as te,c as ie,d as ne}from"./chunk-GOA6YN3L.js";import{a as pe}from"./chunk-SH67RCV2.js";import{a as ve}from"./chunk-NE366WXA.js";import{a as Q,b as Z,c as de,d as ce}from"./chunk-Y4AC7KR7.js";import"./chunk-WY3GIJSF.js";import{e as W}from"./chunk-4ZPAOZ2G.js";import"./chunk-TUCIB5XZ.js";import"./chunk-UWWD6MFE.js";import{A as re,T as le,U as me,x as O,y as G,z as ae}from"./chunk-D2DYHX5U.js";import"./chunk-B23D77YI.js";import{Y as V,Z as K,_ as q,aa as J,ca as X,da as $}from"./chunk-FJKCM5SV.js";import{$b as s,Ab as _,Ac as P,Bb as I,Cc as B,Db as T,Gb as R,Hc as N,Ib as w,Lb as h,Ra as b,Sb as m,Sc as Y,Ta as a,Tb as i,Ua as g,Ub as E,Vb as A,_b as z,ac as U,ba as y,h as C,hb as F,ic as D,mb as r,n as M,qa as k,qc as H,xb as e,ya as j,yb as t,za as L,zb as n}from"./chunk-MRO7MB7O.js";var c=()=>["./"],Ce=p=>({"rotate-180":p});function Me(p,u){if(p&1&&(_(0),n(1,"img",169),I()),p&2){let d=w();a(),h("alt",(d.metadata==null?null:d.metadata.display_name)||(d.metadata==null?null:d.metadata.name)||"Avatar"),r("src",d.getSafeUrl(d.metadata==null?null:d.metadata.picture),b)}}function ke(p,u){if(p&1&&n(0,"img",170),p&2){let d=w();h("alt",(d.metadata==null?null:d.metadata.display_name)||(d.metadata==null?null:d.metadata.name)||"Avatar")}}var ue=(()=>{let u=class u{constructor(o,v,l,x,S){this._changeDetectorRef=o,this._metadataService=v,this._signerService=l,this._indexedDBService=x,this._sanitizer=S,this.isLoading=!0,this.errorMessage=null,this._unsubscribeAll=new M}ngOnInit(){this.loadUserProfile(),this._indexedDBService.getMetadataStream().pipe(y(this._unsubscribeAll)).subscribe(o=>{o&&o.pubkey===this.user?.pubkey&&(this.metadata=o.metadata,this._changeDetectorRef.detectChanges())})}ngOnDestroy(){this._unsubscribeAll.next(null),this._unsubscribeAll.complete()}loadUserProfile(){return C(this,null,function*(){this.isLoading=!0,this.errorMessage=null;let o=this._signerService.getPublicKey();if(!o){this.errorMessage="No public key found. Please log in again.",this.isLoading=!1,this._changeDetectorRef.detectChanges();return}this.user={pubkey:o};try{let v=yield this._metadataService.fetchMetadataWithCache(o);v&&(this.metadata=v,this._changeDetectorRef.detectChanges()),this._metadataService.getMetadataStream().pipe(y(this._unsubscribeAll)).subscribe(l=>{l&&l.pubkey===o&&(this.metadata=l,this._changeDetectorRef.detectChanges())})}catch(v){console.error("Failed to load profile data:",v),this.errorMessage="Failed to load profile data. Please try again later.",this._changeDetectorRef.detectChanges()}finally{this.isLoading=!1,this._changeDetectorRef.detectChanges()}})}getSafeUrl(o){return this._sanitizer.bypassSecurityTrustUrl(o)}};u.\u0275fac=function(v){return new(v||u)(g(H),g(ce),g(pe),g(de),g(Y))},u.\u0275cmp=k({type:u,selectors:[["profile"]],standalone:!0,features:[z],decls:958,vars:148,consts:[["defaultAvatar",""],["listCard08Menu","matMenu"],["listCard09Menu","matMenu"],["listCard02Menu","matMenu"],["listCard01Menu","matMenu"],["listCard04Menu","matMenu"],["postCardMenu01","matMenu"],["expandableCard02","angorCard"],["postCardMenu02","matMenu"],["postCardMenu08","matMenu"],["postCardMenu04","matMenu"],["postCardMenu10","matMenu"],["postCardMenu03","matMenu"],["postCardMenu09","matMenu"],[1,"flex","min-w-0","flex-auto","flex-col"],[1,"bg-card","flex","flex-col","shadow"],["onerror","this.onerror=null; this.src='/images/pages/profile/cover.jpg';",1,"h-40","object-cover","lg:h-80",3,"src","alt"],[1,"bg-card","mx-auto","flex","w-full","max-w-5xl","flex-0","flex-col","items-center","px-8","lg:h-18","lg:flex-row"],[1,"-mt-26","rounded-full","lg:-mt-22"],[4,"ngIf","ngIfElse"],[1,"mt-4","flex","flex-col","items-center","lg:ml-8","lg:mt-0","lg:items-start"],[1,"text-lg","font-bold","leading-none"],[1,"text-secondary"],[1,"mx-8","hidden","h-8","border-l-2","lg:flex"],[1,"mt-6","flex","items-center","space-x-6","lg:mt-0"],[1,"flex","flex-col","items-center"],[1,"font-bold"],[1,"text-secondary","text-sm","font-medium"],[1,"mb-4","mt-8","flex","items-center","space-x-6","lg:m-0","lg:ml-auto"],[1,"font-medium",3,"routerLink"],[1,"text-secondary",3,"routerLink"],[1,"mx-auto","flex","w-full","max-w-5xl","flex-auto","justify-center","p-6","sm:p-8"],[1,"mr-8","hidden","flex-col","items-start","lg:flex"],[1,"flex","w-full","max-w-80","flex-col","p-8"],[1,"text-2xl","font-semibold","leading-tight"],[1,"mt-4"],[1,"my-6","w-full","border-t"],[1,"flex","flex-col"],[1,"flex","items-center"],[1,"mr-3","icon-size-5",3,"svgIcon"],[1,"leading-none"],[1,"mt-4","flex","items-center"],["mat-flat-button","",1,"mt-8","px-6",3,"color","routerLink"],[1,"mt-8","flex","w-full","max-w-80","flex-col","px-8","pb-4","pt-6"],[1,"flex","items-center","justify-between"],[1,"-mr-3"],["mat-icon-button","",3,"matMenuTriggerFor"],[1,"icon-size-5",3,"svgIcon"],["mat-menu-item",""],[1,"mt-6","flex","justify-between"],["src","images/avatars/avatar-placeholder.png","alt","Card cover image",1,"h-14","w-14","rounded-full"],[1,"mt-3","flex","justify-between"],[1,"-mx-3","mt-6","flex","items-center"],["mat-button","",1,"px-3",3,"color","routerLink"],["src","images/cards/14-640x480.jpg","alt","Card cover image",1,"h-14","w-14","rounded","object-cover"],["src","images/cards/15-640x480.jpg","alt","Card cover image",1,"h-14","w-14","rounded","object-cover"],["src","images/cards/16-640x480.jpg","alt","Card cover image",1,"h-14","w-14","rounded","object-cover"],["src","images/cards/17-640x480.jpg","alt","Card cover image",1,"h-14","w-14","rounded","object-cover"],["src","images/cards/18-640x480.jpg","alt","Card cover image",1,"h-14","w-14","rounded","object-cover"],["src","images/cards/19-640x480.jpg","alt","Card cover image",1,"h-14","w-14","rounded","object-cover"],["src","images/cards/20-640x480.jpg","alt","Card cover image",1,"h-14","w-14","rounded","object-cover"],["src","images/cards/21-640x480.jpg","alt","Card cover image",1,"h-14","w-14","rounded","object-cover"],["src","images/cards/22-640x480.jpg","alt","Card cover image",1,"h-14","w-14","rounded","object-cover"],["src","images/cards/23-640x480.jpg","alt","Card cover image",1,"h-14","w-14","rounded","object-cover"],["src","images/cards/24-640x480.jpg","alt","Card cover image",1,"h-14","w-14","rounded","object-cover"],["src","images/cards/25-640x480.jpg","alt","Card cover image",1,"h-14","w-14","rounded","object-cover"],["src","images/cards/26-640x480.jpg","alt","Card cover image",1,"h-14","w-14","rounded","object-cover"],["src","images/cards/27-640x480.jpg","alt","Card cover image",1,"h-14","w-14","rounded","object-cover"],["src","images/cards/28-640x480.jpg","alt","Card cover image",1,"h-14","w-14","rounded","object-cover"],["src","images/cards/29-640x480.jpg","alt","Card cover image",1,"h-14","w-14","rounded","object-cover"],[1,"mt-5","flex","flex-col"],["src","images/cards/coffee-shop-01-320x200.jpg","alt","Card cover image",1,"mr-4","h-14","w-14","rounded","object-cover"],[1,"flex","min-w-0","flex-col"],[1,"font-medium","leading-none"],[1,"mt-1","truncate","text-md","leading-none"],[1,"text-secondary","mt-2","text-md","leading-none"],[1,"mt-6","flex","items-center"],["src","images/cards/coffee-shop-02-512x512.jpg","alt","Card cover image",1,"mr-4","h-14","w-14","rounded","object-cover"],["src","images/cards/coffee-shop-03-320x320.jpg","alt","Card cover image",1,"mr-4","h-14","w-14","rounded","object-cover"],["src","images/cards/sneakers-01-320x200.jpg","alt","Card cover image",1,"mr-4","h-14","w-14","rounded","object-cover"],[1,"flex"],[1,"mr-2","mt-0.5","icon-size-5",3,"svgIcon"],[1,"mt-5","flex"],[1,"text-secondary","whitespace-nowrap","hover:underline",3,"routerLink"],[1,"-mx-3","mt-4","flex","items-center"],["src","images/avatars/avatar-placeholder.png","alt","Card cover image",1,"mr-4","h-10","w-10","rounded-full"],[1,"leading-tight"],[1,"mt-8","flex"],[1,"flex","flex-col","items-start"],[1,"flex","w-full","max-w-140","flex-col","p-6","pb-6","sm:p-8"],[1,"text-xl","font-semibold"],[1,"mt-8","flex","flex-col","items-start","sm:flex-row"],[1,"mb-6","flex","items-center","sm:mb-0"],["onerror","this.onerror=null; this.src='/images/avatars/avatar-placeholder.png';",1,"mr-4","h-12","w-12","min-w-12","rounded-full",3,"src","alt"],[1,"sm:hidden"],[1,"w-full",3,"subscriptSizing"],["matInput","","cdkTextareaAutosize","",3,"placeholder","rows"],[1,"-mx-3","mt-6","flex","items-center","sm:mt-8"],["mat-button","",1,"mr-1","px-3"],[1,"ml-2"],["mat-button","",1,"mr-1","hidden","px-3","sm:inline-flex"],["mat-button","",1,"px-3",3,"matMenuTriggerFor"],["mat-menu-item","",1,"sm:hidden"],[1,"mt-8","flex","w-full","max-w-140","flex-col"],[1,"mx-6","mb-4","mt-6","flex","items-center","sm:mx-8"],[1,"font-semibold","leading-none"],[1,"text-secondary","mt-1","text-sm","leading-none"],["mat-icon-button","",1,"-mr-4","ml-auto",3,"matMenuTriggerFor"],[1,"my-2"],[1,"mx-6","mb-6","mt-2","sm:mx-8"],[1,"relative","mb-4"],["src","images/cards/14-640x480.jpg","alt","Card cover image",1,"h-80","object-cover"],[1,"absolute","bottom-0","left-0","m-4","flex","h-8","w-8","cursor-pointer","items-center","justify-center","rounded-full","bg-gray-700",3,"matTooltip","matTooltipPosition"],[1,"text-gray-100","icon-size-4",3,"svgIcon"],[1,"mx-3","flex","items-center","sm:mx-5"],[1,"text-red-500","icon-size-5",3,"svgIcon"],[1,"mx-6","mb-6","mt-4","border-b","sm:mx-8"],[1,"mx-6","mb-4","flex","flex-col","sm:mx-8","sm:mb-6","sm:flex-row","sm:items-center"],["src","images/avatars/avatar-placeholder.png","alt","Card cover image",1,"text-card","m-0.5","h-6","w-6","rounded-full","ring-2","ring-white"],["src","images/avatars/avatar-placeholder.png","alt","Card cover image",1,"text-card","m-0.5","-ml-3","h-6","w-6","rounded-full","ring-2","ring-white"],[1,"ml-3","text-md","tracking-tight"],[1,"hidden","flex-auto","sm:flex"],[1,"mt-4","flex","items-center","sm:mt-0"],["mat-button","",1,"-ml-2","mr-1","px-3","sm:ml-0"],["mat-button","",1,"px-3","sm:-mr-4",3,"click"],[1,"mr-1"],[1,"rotate-0","transition-transform","duration-150","ease-in-out","icon-size-5",3,"ngClass","svgIcon"],["angorCardExpansion",""],[1,"m-0","border-b"],[1,"mx-4","mb-3","mt-6","flex","flex-col","sm:mx-8"],[1,"flex","items-start"],["src","images/avatars/avatar-placeholder.png","alt","Card cover image",1,"mr-5","h-12","w-12","rounded-full"],[1,"-mr-3","ml-auto","mt-3","flex","items-center"],["mat-icon-button",""],[1,"mx-4","my-0","border-b","sm:mx-8"],[1,"max-h-120","overflow-y-auto"],[1,"relative","mx-4","my-6","flex","flex-col","sm:mx-8"],["src","images/avatars/avatar-placeholder.png","alt","Card cover image",1,"mr-4","h-8","w-8","rounded-full"],[1,"mt-0.5","flex","flex-col"],[1,"text-secondary","mt-2","flex","items-center","text-sm"],[1,"mr-2","cursor-pointer","hover:underline"],[1,"mr-2"],[1,"ml-12","mt-8","flex","items-start"],[1,"mt-8","flex","items-start"],[1,"mx-6","mb-1","mt-6","flex","items-center","sm:mx-8"],[1,"m-6","sm:mx-8"],["mat-button","",1,"px-3","sm:-mr-3"],[1,"mx-6","mb-4","flex","sm:mx-8"],[1,"flex","h-80","pr-1"],["src","images/cards/17-640x480.jpg","alt","Card cover image",1,"rounded","object-cover"],[1,"flex","flex-col","pl-1"],[1,"flex","h-40","pb-1"],["src","images/cards/18-640x480.jpg","alt","Card cover image",1,"rounded","object-cover"],[1,"flex","h-40","pt-1"],["src","images/cards/19-640x480.jpg","alt","Card cover image",1,"rounded","object-cover"],[1,"mx-6","mb-4","sm:mx-8"],[1,"flex","flex-col","overflow-hidden","rounded","border"],[1,"flex","h-80"],["src","images/cards/36-640x480.jpg","alt","Card cover image",1,"object-cover"],[1,"m-4"],[1,"text-lg","font-medium"],[1,"text-secondary","mt-1"],[1,"text-hint","mt-2","text-sm"],["src","images/cards/15-640x480.jpg","alt","Card cover image",1,"rounded","object-cover"],[1,"flex","h-80","pl-1"],["src","images/cards/16-640x480.jpg","alt","Card cover image",1,"rounded","object-cover"],[1,"flex","overflow-hidden","rounded","border"],[1,"w-40","flex-0"],["src","images/cards/35-640x480.jpg","alt","Card cover image",1,"h-full","w-full","object-cover"],["onerror","this.onerror=null; this.src='/images/avatars/avatar-placeholder.png';",1,"ring-bg-card","h-32","w-32","rounded-full","ring-4",3,"src","alt"],["src","/images/avatars/avatar-placeholder.png","onerror","this.onerror=null; this.src='/images/avatars/avatar-placeholder.png';",1,"ring-bg-card","h-32","w-32","rounded-full","ring-4",3,"alt"]],template:function(v,l){if(v&1){let x=T();e(0,"div",14)(1,"div",15)(2,"div"),n(3,"img",16),t(),e(4,"div",17)(5,"div",18),F(6,Me,2,2,"ng-container",19)(7,ke,1,1,"ng-template",null,0,D),t(),e(9,"div",20)(10,"div",21),i(11),t(),e(12,"div",22),i(13),t()(),n(14,"div",23),e(15,"div",24)(16,"div",25)(17,"span",26),i(18,"200k"),t(),e(19,"span",27),i(20,"FOLLOWERS"),t()(),e(21,"div",25)(22,"span",26),i(23,"1.2k"),t(),e(24,"span",27),i(25,"FOLLOWING"),t()()(),e(26,"div",28)(27,"a",29),i(28," Notes "),t(),e(29,"a",30),i(30," About "),t(),e(31,"a",30),i(32," Followers "),t(),e(33,"a",30),i(34," Gallery "),t()()()(),e(35,"div",31)(36,"div",32)(37,"angor-card",33)(38,"div",34),i(39,"About Me"),t(),e(40,"div",35),i(41),t(),n(42,"hr",36),e(43,"div",37)(44,"div",38),n(45,"mat-icon",39),e(46,"span",40),i(47,"London, UK"),t()(),e(48,"div",41),n(49,"mat-icon",39),e(50,"span",40),i(51,"ACME Corp. Lead UX Designer"),t()(),e(52,"div",41),n(53,"mat-icon",39),e(54,"span",40),i(55,"April, 24"),t()()(),e(56,"a",42),i(57," See complete bio "),t()(),e(58,"angor-card",43)(59,"div",44)(60,"div",34),i(61," Followers "),t(),e(62,"div",45)(63,"button",46),n(64,"mat-icon",47),t(),e(65,"mat-menu",null,1)(67,"button",48),i(68,"Find friends"),t()()()(),e(69,"div",37)(70,"div",49),n(71,"img",50)(72,"img",50)(73,"img",50)(74,"img",50),t(),e(75,"div",51),n(76,"img",50)(77,"img",50)(78,"img",50)(79,"img",50),t(),e(80,"div",51),n(81,"img",50)(82,"img",50)(83,"img",50)(84,"img",50),t(),e(85,"div",51),n(86,"img",50)(87,"img",50)(88,"img",50)(89,"img",50),t()(),e(90,"div",52)(91,"a",53),i(92," See all followers "),t()()(),e(93,"angor-card",43)(94,"div",44)(95,"div",34),i(96," Gallery "),t(),e(97,"div",45)(98,"button",46),n(99,"mat-icon",47),t(),e(100,"mat-menu",null,2)(102,"button",48),i(103,"Add image"),t(),e(104,"button",48),i(105,"Add video"),t()()()(),e(106,"div",37)(107,"div",49),n(108,"img",54)(109,"img",55)(110,"img",56)(111,"img",57),t(),e(112,"div",51),n(113,"img",58)(114,"img",59)(115,"img",60)(116,"img",61),t(),e(117,"div",51),n(118,"img",62)(119,"img",63)(120,"img",64)(121,"img",65),t(),e(122,"div",51),n(123,"img",66)(124,"img",67)(125,"img",68)(126,"img",69),t()(),e(127,"div",52)(128,"a",53),i(129," See entire gallery "),t()()(),e(130,"angor-card",43)(131,"div",44)(132,"div",34),i(133," Groups "),t(),e(134,"div",45)(135,"button",46),n(136,"mat-icon",47),t(),e(137,"mat-menu",null,3)(139,"button",48),i(140,"Search for groups"),t()()()(),e(141,"div",70)(142,"div",38),n(143,"img",71),e(144,"div",72)(145,"div",73),i(146," The Port Cafe "),t(),e(147,"div",74),i(148," Best cafe of the downtown New York "),t(),e(149,"div",75),i(150," 1.2k followers "),t()()(),e(151,"div",76),n(152,"img",77),e(153,"div",72)(154,"div",73),i(155," Design House LLC. "),t(),e(156,"div",74),i(157," UI/UX, brand and product design "),t(),e(158,"div",75),i(159," 957 followers "),t()()(),e(160,"div",76),n(161,"img",78),e(162,"div",72)(163,"div",73),i(164," Crax Laser Tag "),t(),e(165,"div",74),i(166," 30% off with group of 6 people "),t(),e(167,"div",75),i(168," 342 followers "),t()()(),e(169,"div",76),n(170,"img",79),e(171,"div",72)(172,"div",73),i(173," Roadster Clothing Inc. "),t(),e(174,"div",74),i(175," $25 off on orders $500 and over "),t(),e(176,"div",75),i(177," 4.7k followers "),t()()()(),e(178,"div",52)(179,"a",53),i(180," See all groups "),t()()(),e(181,"angor-card",43)(182,"div",44)(183,"div",34),i(184,"News"),t(),e(185,"div",45)(186,"button",46),n(187,"mat-icon",47),t(),e(188,"mat-menu",null,4)(190,"button",48),i(191,"Mark all as read"),t()()()(),e(192,"div",70)(193,"div",80),n(194,"mat-icon",81),e(195,"div")(196,"b"),i(197,"20% OFF"),t(),i(198," in your favorite hats shop on next Friday. "),t()(),e(199,"div",82),n(200,"mat-icon",81),e(201,"div"),i(202," Upcoming meetups within 20 miles. "),e(203,"a",83),i(204,"See details "),t()()(),e(205,"div",82),n(206,"mat-icon",81),e(207,"div"),i(208," Concerts from your favorite bands available within 100 miles. "),e(209,"a",83),i(210,"See details "),t()()()(),e(211,"div",84)(212,"a",53),i(213," See all news "),t()()(),e(214,"angor-card",43)(215,"div",44)(216,"div",34),i(217," Activity Feed "),t(),e(218,"div",45)(219,"button",46),n(220,"mat-icon",47),t(),e(221,"mat-menu",null,5)(223,"button",48),i(224,"Clear activities"),t()()()(),e(225,"div",70)(226,"div",80),n(227,"img",85),e(228,"div",72)(229,"div",86),i(230," Amelia Edwards commented on John Silverton's photo "),t(),e(231,"div",75),i(232," 4 minutes ago "),t()()(),e(233,"div",87),n(234,"img",85),e(235,"div",72)(236,"div",86),i(237," Lew Silverton changed his profile photo "),t(),e(238,"div",75),i(239," 25 minutes ago "),t()()(),e(240,"div",87),n(241,"img",85),e(242,"div",72)(243,"div",86),i(244," Display Name liked your photo "),t(),e(245,"div",75),i(246," 3 hours ago "),t()()(),e(247,"div",87),n(248,"img",85),e(249,"div",72)(250,"div",86),i(251," Marleah Eagleston commented on John Silverton's photo "),t(),e(252,"div",75),i(253," Yesterday "),t()()()(),e(254,"div",52)(255,"a",53),i(256," See entire activity feed "),t()()()(),e(257,"div",88)(258,"angor-card",89)(259,"div",90),i(260,"Create Post"),t(),e(261,"div",91)(262,"div",92),n(263,"img",93),e(264,"div",94),i(265),t()(),e(266,"mat-form-field",95),n(267,"textarea",96),t()(),e(268,"div",97)(269,"button",98),n(270,"mat-icon",47),e(271,"span",99),i(272,"Photo / Video"),t()(),e(273,"button",100),n(274,"mat-icon",47),e(275,"span",99),i(276,"Tag Friends"),t()(),e(277,"button",100),n(278,"mat-icon",47),e(279,"span",99),i(280,"Feeling"),t()(),e(281,"button",101),n(282,"mat-icon",47),t(),e(283,"mat-menu",null,6)(285,"button",102)(286,"span",38),n(287,"mat-icon",39),e(288,"span"),i(289,"Tag Friends"),t()()(),e(290,"button",102)(291,"span",38),n(292,"mat-icon",39),e(293,"span"),i(294,"Feeling"),t()()(),e(295,"button",48)(296,"span",38),n(297,"mat-icon",39),e(298,"span"),i(299,"Live"),t()()(),e(300,"button",48)(301,"span",38),n(302,"mat-icon",39),e(303,"span"),i(304,"Gif"),t()()(),e(305,"button",48)(306,"span",38),n(307,"mat-icon",39),e(308,"span"),i(309,"Check in"),t()()()()()(),e(310,"angor-card",103,7)(312,"div",104),n(313,"img",85),e(314,"div",37)(315,"span",105),i(316,"Caroline Lundu"),t(),e(317,"span",106),i(318,"29 minutes ago"),t()(),e(319,"button",107),n(320,"mat-icon",47),t(),e(321,"mat-menu",null,8)(323,"button",48)(324,"span",38),n(325,"mat-icon",39),e(326,"span"),i(327,"Save post"),t()()(),e(328,"button",48)(329,"span",38),n(330,"mat-icon",39),e(331,"span"),i(332,"Hide post"),t()()(),e(333,"button",48)(334,"span",38),n(335,"mat-icon",39),e(336,"span"),i(337,"Snooze for 30 days"),t()()(),e(338,"button",48)(339,"span",38),n(340,"mat-icon",39),e(341,"span"),i(342,"Hide all"),t()()(),n(343,"mat-divider",108),e(344,"button",48)(345,"span",38),n(346,"mat-icon",39),e(347,"span"),i(348,"Report post"),t()()(),e(349,"button",48)(350,"span",38),n(351,"mat-icon",39),e(352,"span"),i(353,"Turn on notifications for this post"),t()()()()(),e(354,"div",109),i(355," Look at that sky! I so want to be there.. Can we arrange a trip? Is that a possibility? Please!!! "),t(),e(356,"div",110),n(357,"img",111),e(358,"div",112),n(359,"mat-icon",113),t()(),e(360,"div",114)(361,"button",98),n(362,"mat-icon",115),e(363,"span",99),i(364,"Unlike"),t()(),e(365,"button",98),n(366,"mat-icon",47),e(367,"span",99),i(368,"Comment"),t()(),e(369,"button",98),n(370,"mat-icon",47),e(371,"span",99),i(372,"Share"),t()()(),n(373,"hr",116),e(374,"div",117)(375,"div",38),n(376,"img",118)(377,"img",119)(378,"img",119)(379,"img",119),e(380,"div",120),i(381," You and 24 more liked this "),t()(),n(382,"div",121),e(383,"div",122)(384,"button",123),i(385," 4 shares "),t(),e(386,"button",124),R("click",function(){j(x);let f=m(311);return L(f.expanded=!f.expanded)}),e(387,"span",125),i(388,"5 Comments"),t(),n(389,"mat-icon",126),t()()(),_(390,127),n(391,"hr",128),e(392,"div",129)(393,"div",130),n(394,"img",131),e(395,"mat-form-field",95),n(396,"textarea",96),t()(),e(397,"div",132)(398,"button",133),n(399,"mat-icon",47),t(),e(400,"button",133),n(401,"mat-icon",47),t(),e(402,"button",133),n(403,"mat-icon",47),t()()(),n(404,"hr",134),e(405,"div",135)(406,"div",136)(407,"div",130),n(408,"img",137),e(409,"div",138)(410,"span")(411,"b"),i(412,"Rutherford Brannan"),t(),i(413," Oh, I\u2019m in.. Let\u2019s arrange a trip for the next weekend if you want! "),t(),e(414,"div",139)(415,"span",140),i(416,"Like"),t(),e(417,"span",140),i(418,"Reply"),t(),e(419,"span",140),i(420,"Hide replies"),t(),e(421,"span",141),i(422,"\u2022"),t(),e(423,"span"),i(424,"17 min"),t()()()(),e(425,"div",142),n(426,"img",137),e(427,"div",138)(428,"span")(429,"b"),i(430,"Caroline Lundu"),t(),i(431," Yes!! Let's talk about it on lunch! "),t(),e(432,"div",139)(433,"span",140),i(434,"Like"),t(),e(435,"span",140),i(436,"Reply"),t(),e(437,"span",141),i(438,"\u2022"),t(),e(439,"span"),i(440,"15 min"),t()()()(),e(441,"div",142),n(442,"img",137),e(443,"div",138)(444,"span")(445,"b"),i(446,"Barbara Cotilla"),t(),i(447," Count me in !!! "),t(),e(448,"div",139)(449,"span",140),i(450,"Like"),t(),e(451,"span",140),i(452,"Reply"),t(),e(453,"span",141),i(454,"\u2022"),t(),e(455,"span"),i(456,"12 min"),t()()()(),e(457,"div",143),n(458,"img",137),e(459,"div",138)(460,"span")(461,"b"),i(462,"Alan Marti"),t(),i(463," The color of the sky doesn\u2019t look natural at all, do you really think this is natural? I\u2019d say Photoshop! Your trip isn't going to worth it since you won't be seeing this exact sky. "),t(),e(464,"div",139)(465,"span",140),i(466,"Like"),t(),e(467,"span",140),i(468,"Reply"),t(),e(469,"span",140),i(470,"Hide replies"),t(),e(471,"span",141),i(472,"\u2022"),t(),e(473,"span"),i(474,"24 min"),t()()()(),e(475,"div",142),n(476,"img",137),e(477,"div",138)(478,"span")(479,"b"),i(480,"Caroline Lundu"),t(),i(481," Hey, Alan! You must be fun at parties! "),t(),e(482,"div",139)(483,"span",140),i(484,"Like"),t(),e(485,"span",140),i(486,"Reply"),t(),e(487,"span",141),i(488,"\u2022"),t(),e(489,"span"),i(490,"22 min"),t()()()(),e(491,"div",142),n(492,"img",137),e(493,"div",138)(494,"span")(495,"b"),i(496,"Alan Marti"),t(),i(497," Caroline, I'm telling the truth, and if you cannot stand the truth, maybe we shouldn't be friends anymore... "),t(),e(498,"div",139)(499,"span",140),i(500,"Like"),t(),e(501,"span",140),i(502,"Reply"),t(),e(503,"span",141),i(504,"\u2022"),t(),e(505,"span"),i(506,"20 min"),t()()()(),e(507,"div",142),n(508,"img",137),e(509,"div",138)(510,"span")(511,"b"),i(512,"Caroline Lundu"),t(),i(513," Dude! Relax! I'm just messing with you... "),t(),e(514,"div",139)(515,"span",140),i(516,"Like"),t(),e(517,"span",140),i(518,"Reply"),t(),e(519,"span",141),i(520,"\u2022"),t(),e(521,"span"),i(522,"18 min"),t()()()(),e(523,"div",142),n(524,"img",137),e(525,"div",138)(526,"span")(527,"b"),i(528,"Alan Marti"),t(),i(529," Sorry! I had a bad morning, let's talk about this in couple hours, I need to relax a bit :( "),t(),e(530,"div",139)(531,"span",140),i(532,"Like"),t(),e(533,"span",140),i(534,"Reply"),t(),e(535,"span",141),i(536,"\u2022"),t(),e(537,"span"),i(538,"16 min"),t()()()(),e(539,"div",143),n(540,"img",137),e(541,"div",138)(542,"span")(543,"b"),i(544,"Marleah Eagleston"),t(),i(545," Count me in, too! "),t(),e(546,"div",139)(547,"span",140),i(548,"Like"),t(),e(549,"span",140),i(550,"Reply"),t(),e(551,"span",141),i(552,"\u2022"),t(),e(553,"span"),i(554,"34 min"),t()()()()()(),I(),t(),e(555,"angor-card",103)(556,"div",144),n(557,"img",85),e(558,"div",37)(559,"span",105),i(560,"Caroline Lundu"),t(),e(561,"span",106),i(562,"29 minutes ago"),t()(),e(563,"button",107),n(564,"mat-icon",47),t(),e(565,"mat-menu",null,9)(567,"button",48)(568,"span",38),n(569,"mat-icon",39),e(570,"span"),i(571,"Save post"),t()()(),e(572,"button",48)(573,"span",38),n(574,"mat-icon",39),e(575,"span"),i(576,"Hide post"),t()()(),e(577,"button",48)(578,"span",38),n(579,"mat-icon",39),e(580,"span"),i(581,"Snooze for 30 days"),t()()(),e(582,"button",48)(583,"span",38),n(584,"mat-icon",39),e(585,"span"),i(586,"Hide all"),t()()(),n(587,"mat-divider",108),e(588,"button",48)(589,"span",38),n(590,"mat-icon",39),e(591,"span"),i(592,"Report post"),t()()(),e(593,"button",48)(594,"span",38),n(595,"mat-icon",39),e(596,"span"),i(597,"Turn on notifications for this post"),t()()()()(),e(598,"div",145)(599,"p"),i(600," We'll put a happy little sky in here. We touch the canvas, the canvas takes what it wants. A little happy sunlight shining through there. Let's build some happy little clouds up here. I was blessed with a very steady hand; and it comes in very handy when you're doing these little delicate things. This is the fun part. "),t(),e(601,"p",35),i(602," Isn't it great to do something you can't fail at? Little trees and bushes grow however makes them happy. Trees get lonely too, so we'll give him a little friend. There are no mistakes. You can fix anything that happens. "),t()(),e(603,"div",114)(604,"button",98),n(605,"mat-icon",115),e(606,"span",99),i(607,"Unlike"),t()(),e(608,"button",98),n(609,"mat-icon",47),e(610,"span",99),i(611,"Comment"),t()(),e(612,"button",98),n(613,"mat-icon",47),e(614,"span",99),i(615,"Share"),t()()(),n(616,"hr",116),e(617,"div",117)(618,"div",38),n(619,"img",118)(620,"img",119)(621,"img",119)(622,"img",119),e(623,"div",120),i(624," You and 24 more liked this "),t()(),n(625,"div",121),e(626,"div",122)(627,"button",123),i(628," 4 shares "),t(),e(629,"button",146),i(630," No comments "),t()()()(),e(631,"angor-card",103)(632,"div",104),n(633,"img",85),e(634,"div",37)(635,"span",105),i(636,"Marleah Eagleston"),t(),e(637,"span",106),i(638,"29 minutes ago"),t()(),e(639,"button",107),n(640,"mat-icon",47),t(),e(641,"mat-menu",null,10)(643,"button",48)(644,"span",38),n(645,"mat-icon",39),e(646,"span"),i(647,"Save post"),t()()(),e(648,"button",48)(649,"span",38),n(650,"mat-icon",39),e(651,"span"),i(652,"Hide post"),t()()(),e(653,"button",48)(654,"span",38),n(655,"mat-icon",39),e(656,"span"),i(657,"Snooze for 30 days"),t()()(),e(658,"button",48)(659,"span",38),n(660,"mat-icon",39),e(661,"span"),i(662,"Hide all"),t()()(),n(663,"mat-divider",108),e(664,"button",48)(665,"span",38),n(666,"mat-icon",39),e(667,"span"),i(668,"Report post"),t()()(),e(669,"button",48)(670,"span",38),n(671,"mat-icon",39),e(672,"span"),i(673,"Turn on notifications for this post"),t()()()()(),e(674,"div",109),i(675," Look at that sky! I so want to be there.. Can we arrange a trip? Is that a possibility? Please!!! "),t(),e(676,"div",147)(677,"div",148),n(678,"img",149),t(),e(679,"div",150)(680,"div",151),n(681,"img",152),t(),e(682,"div",153),n(683,"img",154),t()()(),e(684,"div",114)(685,"button",98),n(686,"mat-icon",115),e(687,"span",99),i(688,"Unlike"),t()(),e(689,"button",98),n(690,"mat-icon",47),e(691,"span",99),i(692,"Comment"),t()(),e(693,"button",98),n(694,"mat-icon",47),e(695,"span",99),i(696,"Share"),t()()(),n(697,"hr",116),e(698,"div",117)(699,"div",38),n(700,"img",118)(701,"img",119)(702,"img",119)(703,"img",119),e(704,"div",120),i(705," You and 24 more liked this "),t()(),n(706,"div",121),e(707,"div",122)(708,"button",123),i(709," 4 shares "),t(),e(710,"button",146),i(711," No comments "),t()()()(),e(712,"angor-card",103)(713,"div",104),n(714,"img",85),e(715,"div",37)(716,"span",73),i(717,"Caroline Lundu"),t(),e(718,"span",106),i(719,"29 minutes ago"),t()(),e(720,"button",107),n(721,"mat-icon",47),t(),e(722,"mat-menu",null,11)(724,"button",48)(725,"span",38),n(726,"mat-icon",39),e(727,"span"),i(728,"Save post"),t()()(),e(729,"button",48)(730,"span",38),n(731,"mat-icon",39),e(732,"span"),i(733,"Hide post"),t()()(),e(734,"button",48)(735,"span",38),n(736,"mat-icon",39),e(737,"span"),i(738,"Snooze for 30 days"),t()()(),e(739,"button",48)(740,"span",38),n(741,"mat-icon",39),e(742,"span"),i(743,"Hide all"),t()()(),n(744,"mat-divider",108),e(745,"button",48)(746,"span",38),n(747,"mat-icon",39),e(748,"span"),i(749,"Report post"),t()()(),e(750,"button",48)(751,"span",38),n(752,"mat-icon",39),e(753,"span"),i(754,"Turn on notifications for this post"),t()()()()(),e(755,"div",109),i(756," Hey!! I never saw this one, it was amazing.. I think I\u2019m going to buy myself a set and try his technique at home! "),t(),e(757,"div",155)(758,"div",156)(759,"div",157),n(760,"img",158),t(),e(761,"div",159)(762,"div",160),i(763," Take a look behind the scenes of Rob Boss episodes "),t(),e(764,"div",161),i(765," We'll put a happy little sky in here. We touch the canvas, the canvas takes what it wants. A little happy sunlight shining through there. "),t(),e(766,"div",162),i(767," example.com "),t()()()(),e(768,"div",114)(769,"button",98),n(770,"mat-icon",115),e(771,"span",99),i(772,"Unlike"),t()(),e(773,"button",98),n(774,"mat-icon",47),e(775,"span",99),i(776,"Comment"),t()(),e(777,"button",98),n(778,"mat-icon",47),e(779,"span",99),i(780,"Share"),t()()(),n(781,"hr",116),e(782,"div",117)(783,"div",38),n(784,"img",118)(785,"img",119)(786,"img",119)(787,"img",119),e(788,"div",120),i(789," You and 24 more liked this "),t()(),n(790,"div",121),e(791,"div",122)(792,"button",123),i(793," 4 shares "),t(),e(794,"button",146),i(795," No comments "),t()()()(),e(796,"angor-card",103)(797,"div",104),n(798,"img",85),e(799,"div",37)(800,"span",105),i(801,"Marleah Eagleston"),t(),e(802,"span",106),i(803,"29 minutes ago"),t()(),e(804,"button",107),n(805,"mat-icon",47),t(),e(806,"mat-menu",null,12)(808,"button",48)(809,"span",38),n(810,"mat-icon",39),e(811,"span"),i(812,"Save post"),t()()(),e(813,"button",48)(814,"span",38),n(815,"mat-icon",39),e(816,"span"),i(817,"Hide post"),t()()(),e(818,"button",48)(819,"span",38),n(820,"mat-icon",39),e(821,"span"),i(822,"Snooze for 30 days"),t()()(),e(823,"button",48)(824,"span",38),n(825,"mat-icon",39),e(826,"span"),i(827,"Hide all"),t()()(),n(828,"mat-divider",108),e(829,"button",48)(830,"span",38),n(831,"mat-icon",39),e(832,"span"),i(833,"Report post"),t()()(),e(834,"button",48)(835,"span",38),n(836,"mat-icon",39),e(837,"span"),i(838,"Turn on notifications for this post"),t()()()()(),e(839,"div",109),i(840," Look at that sky! I so want to be there.. Can we arrange a trip? Is that a possibility? Please!!! "),t(),e(841,"div",147)(842,"div",148),n(843,"img",163),t(),e(844,"div",164),n(845,"img",165),t()(),e(846,"div",114)(847,"button",98),n(848,"mat-icon",115),e(849,"span",99),i(850,"Unlike"),t()(),e(851,"button",98),n(852,"mat-icon",47),e(853,"span",99),i(854,"Comment"),t()(),e(855,"button",98),n(856,"mat-icon",47),e(857,"span",99),i(858,"Share"),t()()(),n(859,"hr",116),e(860,"div",117)(861,"div",38),n(862,"img",118)(863,"img",119)(864,"img",119)(865,"img",119),e(866,"div",120),i(867," You and 24 more liked this "),t()(),n(868,"div",121),e(869,"div",122)(870,"button",123),i(871," 4 shares "),t(),e(872,"button",146),i(873," No comments "),t()()()(),e(874,"angor-card",103)(875,"div",104),n(876,"img",85),e(877,"div",37)(878,"span",105),i(879,"Caroline Lundu"),t(),e(880,"span",106),i(881,"29 minutes ago"),t()(),e(882,"button",107),n(883,"mat-icon",47),t(),e(884,"mat-menu",null,13)(886,"button",48)(887,"span",38),n(888,"mat-icon",39),e(889,"span"),i(890,"Save post"),t()()(),e(891,"button",48)(892,"span",38),n(893,"mat-icon",39),e(894,"span"),i(895,"Hide post"),t()()(),e(896,"button",48)(897,"span",38),n(898,"mat-icon",39),e(899,"span"),i(900,"Snooze for 30 days"),t()()(),e(901,"button",48)(902,"span",38),n(903,"mat-icon",39),e(904,"span"),i(905,"Hide all"),t()()(),n(906,"mat-divider",108),e(907,"button",48)(908,"span",38),n(909,"mat-icon",39),e(910,"span"),i(911,"Report post"),t()()(),e(912,"button",48)(913,"span",38),n(914,"mat-icon",39),e(915,"span"),i(916,"Turn on notifications for this post"),t()()()()(),e(917,"div",109),i(918," Hey!! I never saw this episode, it was amazing.. I think I\u2019m going to buy myself a set and try his technique at home! "),t(),e(919,"div",155)(920,"div",166)(921,"div",167),n(922,"img",168),t(),e(923,"div",159)(924,"div",160),i(925," Rob Boss - Season 09 Episode 04 "),t(),e(926,"div",161),i(927," We'll put a happy little sky in here. We touch the canvas, the canvas takes what it wants. A little happy sunlight shining through there. "),t(),e(928,"div",162),i(929," example.com "),t()()()(),e(930,"div",114)(931,"button",98),n(932,"mat-icon",115),e(933,"span",99),i(934,"Unlike"),t()(),e(935,"button",98),n(936,"mat-icon",47),e(937,"span",99),i(938,"Comment"),t()(),e(939,"button",98),n(940,"mat-icon",47),e(941,"span",99),i(942,"Share"),t()()(),n(943,"hr",116),e(944,"div",117)(945,"div",38),n(946,"img",118)(947,"img",119)(948,"img",119)(949,"img",119),e(950,"div",120),i(951," You and 24 more liked this "),t()(),n(952,"div",121),e(953,"div",122)(954,"button",123),i(955," 4 shares "),t(),e(956,"button",146),i(957," No comments "),t()()()()()()()}if(v&2){let x=m(8),S=m(66),f=m(101),ge=m(138),xe=m(189),he=m(222),Se=m(284),fe=m(311),be=m(322),Ee=m(566),ye=m(642),_e=m(723),Ie=m(807),we=m(885);a(3),h("alt",(l.metadata==null?null:l.metadata.display_name)||(l.metadata==null?null:l.metadata.name)||"Banner"),r("src",(l.metadata==null?null:l.metadata.banner)||"/images/pages/profile/cover.jpg",b),a(3),r("ngIf",l.metadata==null?null:l.metadata.picture)("ngIfElse",x),a(5),E((l.metadata==null?null:l.metadata.display_name)||(l.metadata==null?null:l.metadata.name)||"Unknown User"),a(2),E((l.metadata==null?null:l.metadata.username)||(l.metadata==null?null:l.metadata.name)),a(14),r("routerLink",s(134,c)),a(2),r("routerLink",s(135,c)),a(2),r("routerLink",s(136,c)),a(2),r("routerLink",s(137,c)),a(8),A(" ",(l.metadata==null?null:l.metadata.about)||""," "),a(4),r("svgIcon","heroicons_solid:map-pin"),a(4),r("svgIcon","heroicons_solid:briefcase"),a(4),r("svgIcon","heroicons_solid:cake"),a(3),r("color","primary")("routerLink",s(138,c)),a(7),r("matMenuTriggerFor",S),a(),r("svgIcon","heroicons_solid:ellipsis-vertical"),a(27),r("color","primary")("routerLink",s(139,c)),a(7),r("matMenuTriggerFor",f),a(),r("svgIcon","heroicons_solid:ellipsis-vertical"),a(29),r("color","primary")("routerLink",s(140,c)),a(7),r("matMenuTriggerFor",ge),a(),r("svgIcon","heroicons_solid:ellipsis-vertical"),a(43),r("color","primary")("routerLink",s(141,c)),a(7),r("matMenuTriggerFor",xe),a(),r("svgIcon","heroicons_solid:ellipsis-vertical"),a(7),r("svgIcon","heroicons_solid:bell"),a(6),r("svgIcon","heroicons_solid:bell"),a(3),r("routerLink",s(142,c)),a(3),r("svgIcon","heroicons_solid:bell"),a(3),r("routerLink",s(143,c)),a(3),r("color","primary")("routerLink",s(144,c)),a(7),r("matMenuTriggerFor",he),a(),r("svgIcon","heroicons_solid:ellipsis-vertical"),a(35),r("color","primary")("routerLink",s(145,c)),a(8),h("alt",(l.metadata==null?null:l.metadata.display_name)||(l.metadata==null?null:l.metadata.name)||"Avatar"),r("src",(l.metadata==null?null:l.metadata.picture)||"images/avatars/avatar-placeholder.png",b),a(2),E((l.metadata==null?null:l.metadata.name)||"Unknown User"),a(),r("subscriptSizing","dynamic"),a(),r("placeholder","What's on your mind?")("rows",3),a(3),r("svgIcon","heroicons_solid:photo"),a(4),r("svgIcon","heroicons_solid:user-circle"),a(4),r("svgIcon","heroicons_solid:face-smile"),a(3),r("matMenuTriggerFor",Se),a(),r("svgIcon","heroicons_solid:ellipsis-horizontal"),a(5),r("svgIcon","heroicons_solid:user-circle"),a(5),r("svgIcon","heroicons_solid:face-smile"),a(5),r("svgIcon","heroicons_solid:play"),a(5),r("svgIcon","heroicons_solid:sparkles"),a(5),r("svgIcon","heroicons_solid:map-pin"),a(12),r("matMenuTriggerFor",be),a(),r("svgIcon","heroicons_solid:ellipsis-vertical"),a(5),r("svgIcon","heroicons_solid:arrow-up-tray"),a(5),r("svgIcon","heroicons_solid:eye-slash"),a(5),r("svgIcon","heroicons_solid:clock"),a(5),r("svgIcon","heroicons_solid:minus-circle"),a(6),r("svgIcon","heroicons_solid:exclamation-triangle"),a(5),r("svgIcon","heroicons_solid:bell"),a(7),r("matTooltip","Barmouth / UK")("matTooltipPosition","right"),a(),r("svgIcon","heroicons_solid:map-pin"),a(3),r("svgIcon","heroicons_solid:heart"),a(4),r("svgIcon","heroicons_solid:chat-bubble-left-ellipsis"),a(4),r("svgIcon","heroicons_solid:share"),a(19),r("ngClass",U(146,Ce,fe.expanded))("svgIcon","heroicons_mini:chevron-down"),a(6),r("subscriptSizing","dynamic"),a(),r("placeholder","Write a comment...")("rows",3),a(3),r("svgIcon","heroicons_solid:sparkles"),a(2),r("svgIcon","heroicons_solid:face-smile"),a(2),r("svgIcon","heroicons_solid:photo"),a(160),r("matMenuTriggerFor",Ee),a(),r("svgIcon","heroicons_solid:ellipsis-vertical"),a(5),r("svgIcon","heroicons_solid:arrow-up-tray"),a(5),r("svgIcon","heroicons_solid:eye-slash"),a(5),r("svgIcon","heroicons_solid:clock"),a(5),r("svgIcon","heroicons_solid:minus-circle"),a(6),r("svgIcon","heroicons_solid:exclamation-triangle"),a(5),r("svgIcon","heroicons_solid:bell"),a(10),r("svgIcon","heroicons_solid:heart"),a(4),r("svgIcon","heroicons_solid:chat-bubble-left-ellipsis"),a(4),r("svgIcon","heroicons_solid:share"),a(26),r("matMenuTriggerFor",ye),a(),r("svgIcon","heroicons_solid:ellipsis-vertical"),a(5),r("svgIcon","heroicons_solid:arrow-up-tray"),a(5),r("svgIcon","heroicons_solid:eye-slash"),a(5),r("svgIcon","heroicons_solid:clock"),a(5),r("svgIcon","heroicons_solid:minus-circle"),a(6),r("svgIcon","heroicons_solid:exclamation-triangle"),a(5),r("svgIcon","heroicons_solid:bell"),a(15),r("svgIcon","heroicons_solid:heart"),a(4),r("svgIcon","heroicons_solid:chat-bubble-left-ellipsis"),a(4),r("svgIcon","heroicons_solid:share"),a(26),r("matMenuTriggerFor",_e),a(),r("svgIcon","heroicons_solid:ellipsis-vertical"),a(5),r("svgIcon","heroicons_solid:arrow-up-tray"),a(5),r("svgIcon","heroicons_solid:eye-slash"),a(5),r("svgIcon","heroicons_solid:clock"),a(5),r("svgIcon","heroicons_solid:minus-circle"),a(6),r("svgIcon","heroicons_solid:exclamation-triangle"),a(5),r("svgIcon","heroicons_solid:bell"),a(18),r("svgIcon","heroicons_solid:heart"),a(4),r("svgIcon","heroicons_solid:chat-bubble-left-ellipsis"),a(4),r("svgIcon","heroicons_solid:share"),a(26),r("matMenuTriggerFor",Ie),a(),r("svgIcon","heroicons_solid:ellipsis-vertical"),a(5),r("svgIcon","heroicons_solid:arrow-up-tray"),a(5),r("svgIcon","heroicons_solid:eye-slash"),a(5),r("svgIcon","heroicons_solid:clock"),a(5),r("svgIcon","heroicons_solid:minus-circle"),a(6),r("svgIcon","heroicons_solid:exclamation-triangle"),a(5),r("svgIcon","heroicons_solid:bell"),a(12),r("svgIcon","heroicons_solid:heart"),a(4),r("svgIcon","heroicons_solid:chat-bubble-left-ellipsis"),a(4),r("svgIcon","heroicons_solid:share"),a(26),r("matMenuTriggerFor",we),a(),r("svgIcon","heroicons_solid:ellipsis-vertical"),a(5),r("svgIcon","heroicons_solid:arrow-up-tray"),a(5),r("svgIcon","heroicons_solid:eye-slash"),a(5),r("svgIcon","heroicons_solid:clock"),a(5),r("svgIcon","heroicons_solid:minus-circle"),a(6),r("svgIcon","heroicons_solid:exclamation-triangle"),a(5),r("svgIcon","heroicons_solid:bell"),a(18),r("svgIcon","heroicons_solid:heart"),a(4),r("svgIcon","heroicons_solid:chat-bubble-left-ellipsis"),a(4),r("svgIcon","heroicons_solid:share")}},dependencies:[W,ve,$,X,J,K,V,q,ne,te,ee,ie,G,O,me,le,ae,re,se,oe,Z,Q,P,N,B],encapsulation:2,changeDetection:0});let p=u;return p})();var at=[{path:"",component:ue}];export{at as default};
