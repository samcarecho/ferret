"use strict";var dwnet=angular.module("dwnet",["ngSanitize","ui.bootstrap","ngRoute","pascalprecht.translate","ezfb","ngAnimate","ngTouch"]).config(["$routeProvider","$locationProvider","$translateProvider","$FBProvider",function($routeProvider,$locationProvider,$translateProvider,$FBProvider){$routeProvider.when("/",{templateUrl:"views/home.html",controller:"HomeControl"}).when("/login",{templateUrl:"views/login.html",controller:"LoginControl"}).when("/about",{templateUrl:"views/about.html",controller:"AboutControl"}).when("/privacy-policy",{templateUrl:"views/privacy_policy.html",controller:"PrivacyPolicy"}).when("/terms-of-service",{templateUrl:"views/terms_of_service.html",controller:"TermsOfService"}).when("/not-supported",{templateUrl:"views/not_supported.html",controller:"NotIE"}).otherwise({redirectTo:"/"});var reEn=/-|_/i,lang=navigator.language.split(reEn)[0];switch(lang){case"en":lang="en_US";break;case"pt":lang="pt_BR";break;case"de":lang="de_AT";break;case"es":lang="es";break;default:lang="en_US"}$translateProvider.preferredLanguage(lang),$translateProvider.useStaticFilesLoader({prefix:"lib/languages/",suffix:".json"}),$FBProvider.setInitParams({appId:"1403687853196208"})}]).run(["$rootScope","$location",function($rootScope,$location){$rootScope.wColumn=1,$rootScope.hide=1,isIE()&&$location.path("/not-supported")}]);dwnet.factory("Config",[function(){return{wapp:{title:"TrustFerret",subtitle:"The Social Trust Platform"},friendsView:{limit:10,lowRes:30,highRes:200}}}]),dwnet.controller("HomeControl",["$scope","Config","$FB","$timeout","$rootScope","$window","$location",function($scope,Config,$FB,$timeout,$rootScope,$window,$location){function getFriendCount($FB,$rootScope){$FB.api("/fql",{q:"SELECT friend_count FROM user WHERE uid = "+$rootScope.apiMe.id},function(result){$rootScope.apiMe.friend_count=result.data[0].friend_count})}function updateLoginStatus(more){$FB.getLoginStatus(function(res){$rootScope.loginStatus=res,"connected"!=res.status&&($scope.welcome="",$rootScope.wColumn=0,$location.path("/login")),"connected"===res.status&&($scope.welcome="hidden",$rootScope.wColumn=1),(more||angular.noop)()})}function updateApiMe(){$FB.api("/me",function(res){$rootScope.apiMe=res,gapi.client.trustferret.user.get({id:res.id}).execute(function(resp){resp.error&&404==resp.code&&gapi.client.trustferret.user.insert({userData:JSON.stringify(res)}).execute(function(){}),(void 0==$rootScope.userVotes||null==$rootScope.userVotes)&&gapi.client.trustferret.votes.list({id:$rootScope.apiMe.id,limit:5e3}).execute(function(resp){$rootScope.userVotes=resp.hasOwnProperty("votes")?resp.votes:[],getFriendCount($FB,$rootScope),$rootScope.getPagingData($FB,Config,$timeout,$rootScope)})}),gapi.client.trustferret.token.insert({authResponse:JSON.stringify($rootScope.loginStatus.authResponse)}).execute(function(){})})}$scope.welcome="hidden",$scope.$parent.activeTab="start",$scope.wapp=Config.wapp,$rootScope.hide=0,$rootScope.pagingAction="none",$rootScope.pagingButton={},$rootScope.friendsView={},$rootScope.pagingOptions={},$FB.getLoginStatus(function(res){$rootScope.loginStatus=res,"connected"!=res.status&&($rootScope.wColumn=0),"connected"===res.status&&($rootScope.wColumn=1)});var innerWidth=$window.innerWidth,heightDifference=0;992>innerWidth&&(heightDifference=-52);var stageWidth=parseInt(document.querySelector("div#main-stage").clientWidth);$rootScope.stageWidth=stageWidth;var stageHeight=parseInt(document.querySelector("div#main-stage").clientHeight);$rootScope.stageHeight=stageHeight,$rootScope.friendsView.containerVerticalPadding=0,$rootScope.friendsView.containerHorizontalPadding=0,$rootScope.friendsView.getFitsOnStage=function(){var horizontalSize=220,verticalSize=255,innerWidth=$window.innerWidth;992>innerWidth&&(horizontalSize=160,verticalSize=180),$rootScope.friendsView.horizontalFit=parseInt(stageWidth/horizontalSize),$rootScope.friendsView.verticalFit=parseInt((stageHeight+heightDifference)/verticalSize),$rootScope.friendsView.limit=$rootScope.friendsView.horizontalFit*$rootScope.friendsView.verticalFit+2*$rootScope.friendsView.horizontalFit,$rootScope.friendsView.containerWidth=parseInt($rootScope.friendsView.horizontalFit*horizontalSize),$rootScope.friendsView.containerVerticalPadding=parseInt(($rootScope.stageHeight+heightDifference-verticalSize*$rootScope.friendsView.verticalFit)/2)},$rootScope.friendsView.getFitsOnStage(),$rootScope.decompFBPaging=function(uri){var fbUri=new Uri(uri);$rootScope.pagingOptions.token=fbUri.getQueryParamValue("access_token"),$rootScope.pagingOptions.afterId=fbUri.getQueryParamValue("__after_id"),$rootScope.pagingOptions.offset=fbUri.getQueryParamValue("offset")},$rootScope.getPagingData=function($FB,Config,$timeout,$rootScope){$FB.getLoginStatus(function(response){if("connected"===response.status){var optionsLow={},optionsHigh={};if("none"==$rootScope.pagingAction&&($rootScope.paginationAnin="easy-in",optionsLow={fields:"name,id,picture.height("+Config.friendsView.lowRes+").width("+Config.friendsView.lowRes+")",limit:$rootScope.friendsView.limit},optionsHigh={fields:"id,picture.height("+Config.friendsView.highRes+").width("+Config.friendsView.highRes+")",limit:$rootScope.friendsView.limit}),"next"===$rootScope.pagingAction||"limit"===$rootScope.pagingAction){var afterId=$rootScope.pagingOptions.afterId,offset=$rootScope.pagingOptions.offset;"limit"!==$rootScope.pagingAction&&($rootScope.decompFBPaging($rootScope.paging[$rootScope.pagingAction]),afterId=$rootScope.pagingOptions.afterId,offset=$rootScope.pagingOptions.offset),"limit"===$rootScope.pagingAction&&($rootScope.paginationAnin="",offset=0),optionsLow={fields:"name,id,picture.height("+Config.friendsView.lowRes+").width("+Config.friendsView.lowRes+")",limit:$rootScope.friendsView.limit,access_token:response.authResponse.accessToken,__after_id:afterId,offset:offset},optionsHigh={fields:"id,picture.height("+Config.friendsView.highRes+").width("+Config.friendsView.highRes+")",limit:$rootScope.friendsView.limit,access_token:response.authResponse.accessToken,__after_id:afterId,offset:offset}}$FB.api("/me/friends",optionsLow,function(result){$rootScope.scroll.loading=!1;var loopVotes=function(votes){for(var d in result.data)for(var v in votes)if(result.data[d].id==votes[v].id){result.data[d].vote=votes[v].vote,votes.splice(v,1);break}};if(""!=$rootScope.userVotes&&void 0!=$rootScope.userVotes&&null!=$rootScope.userVotes&&loopVotes(JSON.parse(JSON.stringify($rootScope.userVotes))),"next"===$rootScope.pagingAction){for(var i=0;i<result.data.length;i++)$rootScope.friends.data.push(result.data[i]);$rootScope.friends.paging=result.paging}else $rootScope.friends=result;$rootScope.paging=result.paging,$rootScope.scroll.suspended=!1}).then($timeout(function(){$FB.api("/me/friends",optionsHigh,function(result){for(var iOld in $rootScope.friends.data)for(var iNew in result.data)$rootScope.friends.data[iOld].id===result.data[iNew].id&&($rootScope.friends.data[iOld].picture=result.data[iNew].picture)})},1500)).then($timeout(function(){$rootScope.pagingButton.executing=0},1500))}})},$scope.login=function(){$FB.login(function(res){res.authResponse&&($rootScope.loginStatus=res,updateLoginStatus(updateApiMe))},{scope:"email,user_likes"})},updateLoginStatus(updateApiMe)}]),dwnet.controller("LoginControl",["$scope","Config","$FB","$rootScope","$location",function($scope,Config,$FB,$rootScope,$location){$scope.login=function(){$FB.login(function(res){res.authResponse&&($rootScope.loginStatus=res,$rootScope.wColumn=1,$location.path("/"))},{scope:"email,user_likes"})}}]),dwnet.controller("MenuControl",["$scope","Config","$translate","$FB","$rootScope","$window",function($scope,Config,$translate,$FB,$rootScope,$window){function updateLoginStatus(more){$FB.getLoginStatus(function(res){$scope.loginStatus=res,(more||angular.noop)()})}function updateApiMe(){$FB.api("/me",function(res){$scope.apiMe=res})}$scope.changeLanguage=function(langKey){$translate.uses(langKey),$scope.activeLang=langKey},updateLoginStatus(updateApiMe);var reEn=/-|_/i,lang=navigator.language.split(reEn)[0];switch(lang){case"en":lang="en_US";break;case"pt":lang="pt_BR";break;case"de":lang="de_AT";break;case"es":lang="es";break;default:lang="en_US"}$rootScope.activeLang=lang,$scope.verticalPaging=function(){return $window.innerWidth}}]),dwnet.controller("AboutControl",["$scope","$translate",function($scope){$scope.$parent.activeTab="about"}]),dwnet.controller("PrivacyPolicy",["$scope","$translate",function($scope){$scope.$parent.activeTab="privacy-policy"}]),dwnet.controller("TermsOfService",["$scope","$translate",function($scope){$scope.$parent.activeTab="terms-of-service"}]),dwnet.controller("NotIE",["$scope","$translate","$rootScope","$location",function($scope,$translate,$rootScope){$rootScope.wColumn=0}]),dwnet.directive("friendContainer",["$rootScope","$FB","Config","$timeout","$window",function($rootScope,$FB,Config,$timeout,$window){return{restrict:"E",scope:!0,controller:function($scope){var w=w||window,doc=(w.document,document.documentElement);switch($rootScope.innerWidth=$window.innerWidth,window.onresize=function(){var innerWidth=$window.innerWidth;if(Math.abs(innerWidth-$rootScope.innerWidth)>50){$rootScope.innerWidth=$window.innerWidth,$rootScope.scroll.ended=!1,document.querySelector("div#friends-container").style.visibility="hidden";try{doc.scrollTop=0}catch(e){console.log(e)}try{window.pageYOffset=0}catch(e){console.log(e)}var horizontalSize=220,verticalSize=255,heightDifference=0;992>innerWidth&&(heightDifference=-52,horizontalSize=160,verticalSize=180);var containerHeight=document.querySelector("div#stage-view").clientHeight,containerWidth=document.querySelector("div#stage-view").clientWidth,horizontalFit=parseInt(containerWidth/horizontalSize),verticalFit=parseInt((containerHeight+heightDifference)/verticalSize),newLimit=horizontalFit*verticalFit+2*horizontalFit,oldLimit=$rootScope.friendsView.limit;$rootScope.friendsView.limitDifference=oldLimit-newLimit,newLimit!=oldLimit&&($rootScope.pagingAction="limit",$rootScope.friendsView.limit=newLimit,$rootScope.friendsView.containerWidth=parseInt(horizontalFit*horizontalSize),$rootScope.friendsView.containerVerticalPadding=parseInt((containerHeight+heightDifference-verticalSize*verticalFit)/2),$rootScope.getPagingData($FB,Config,$timeout,$rootScope),document.querySelector("div#friends-container").style.width=$rootScope.friendsView.containerWidth,document.querySelector("div#friends-container").style.margin=$rootScope.friendsView.containerVerticalPadding+"px 0px"),$timeout(function(){document.querySelector("div#friends-container").style.visibility="visible"},2500)}},$rootScope.friendWrapper="friend-wrapper",$scope.friendInfoWrapper="friend-info-wrapper",$scope.friendPic="friend-pic",$scope.friendNameWrapper="friend-name-wrapper",$scope.friendName="friend-name",$scope.friendVoting="friend-voting",$rootScope.btnTrust="btn-trust",992>innerWidth&&($rootScope.friendWrapper="friend-wrapper-sm",$scope.friendInfoWrapper="friend-info-wrapper-sm",$scope.friendPic="friend-pic-sm",$scope.friendNameWrapper="friend-name-wrapper-sm",$scope.friendName="friend-name-sm",$scope.friendVoting="friend-voting-sm",$rootScope.btnTrust="btn-trust-sm"),$scope.friend.vote){case"-1":$scope.BgColorStyle="background-color: rgba(189,54,47, 0.7)";break;case"0":$scope.BgColorStyle="background-color: rgba(248,148,6, 0.7)";break;case"1":$scope.BgColorStyle="background-color: rgba(81,163,81, 0.7)";break;default:$scope.BgColorStyle="background-color: rgba(0,0,0, 0.5)"}},template:'<div class="{{friendInfoWrapper}}"><img fbid="{{ friend.id }}" class="{{friendPic}} img-thumbnail no-drag" ng-src="{{ friend.picture.data.url }}" friend-pict-hi-res/><div id="fnw-{{friend.id}}" class="{{friendNameWrapper}}" voted="{{friend.vote}}" style="{{BgColorStyle}} !important;"><span class="{{friendName}}">{{ friend.name }}</span></div></div><div class="{{friendVoting}}"><vote-button-no vote="-1" fbid="{{ friend.id }}" vote-button></vote-button-no><vote-button-neutral vote="0" fbid="{{ friend.id }}" vote-button></vote-button-neutral><vote-button-yes vote="1" fbid="{{ friend.id }}" vote-button></vote-button-yes></div>'}}]),dwnet.directive("infiniteScroll",["$window","$rootScope","$FB","$timeout","Config",function($window,$rootScope,$FB,$timeout,Config){return{link:function(scope,element){var w=(element[0],w||window),d=w.document,doc=document.documentElement;$rootScope.scroll={},$rootScope.scroll.threshold=300,$rootScope.scroll.suspended=!1;var handler=function(){var tScroll=(window.pageYOffset||doc.scrollTop)-(doc.clientTop||0),scrollDelta=parseInt(d.body.clientHeight+tScroll);scrollDelta+$rootScope.scroll.threshold>=d.body.scrollHeight&&scrollDelta+$rootScope.scroll.threshold<d.body.scrollHeight+$rootScope.scroll.threshold&&0!=tScroll&&!$rootScope.scroll.suspended&&void 0!=$rootScope.paging.next&&($rootScope.scroll.suspended=!0,$rootScope.pagingAction="next",$rootScope.paginationAnin="easy-in",$rootScope.scroll.loading=!0,scope.$apply($rootScope.getPagingData($FB,Config,$timeout,$rootScope)))};angular.element($window).bind("scroll",handler)}}}]),dwnet.directive("slideFriends",["$swipe","$rootScope","$FB","$timeout","$compile","Config",function($swipe,$rootScope,$FB,$timeout,$compile,Config){return{restrict:"A",controller:function(){},link:function(scope,ele){var startX,startY;scope.friendContainers=document.querySelector("div#friends-container").children,$swipe.bind(ele,{start:function(coords){startX=coords.x,startY=coords.y},move:function(coords){var deltaH=(coords.x-startX)/2;if(Math.abs(deltaH)>5&&Math.abs(deltaH)<40)for(var i=scope.friendContainers.length;i>0;i--)scope.friendContainers[i-1].style.left=parseInt(deltaH)+"px"},end:function(coords){var deltaH=startX-coords.x,deltaAbsH=Math.abs(deltaH);deltaAbsH>20&&($rootScope.paginationAnin="hidden",deltaH>0&&($rootScope.pagingAction="next",$rootScope.getPagingData($FB,Config,$timeout,$rootScope),$rootScope.paginationAnin="in-left"),0>deltaH&&($rootScope.pagingAction="previous",$rootScope.getPagingData($FB,Config,$timeout,$rootScope),$rootScope.paginationAnin="in-right"))},cancel:function(){}})}}}]),dwnet.directive("pagingFriends",["$swipe","$rootScope","$FB","$timeout","$compile","Config",function($swipe,$rootScope,$FB,$timeout,$compile,Config){return{restrict:"A",controller:function(){},link:function(scope,ele,attrs){var w=w||window,d=w.document,doc=document.documentElement;ele.bind("click",function(){if(void 0===$rootScope.pagingButton.executing||0===$rootScope.pagingButton.executing){$rootScope.pagingButton.executing=1,$rootScope.pagingAction=attrs.direction;var tScroll=(window.pageYOffset||doc.scrollTop)-(doc.clientTop||0);if("next"===attrs.direction){try{window.pageYOffset=window.pageYOffset+d.body.clientHeight}catch(e){console.log(e)}try{doc.scrollTop=doc.scrollTop+d.body.clientHeight}catch(e){console.log(e)}tScroll=(window.pageYOffset||doc.scrollTop)-(doc.clientTop||0);var scrollDelta=parseInt(d.body.clientHeight+tScroll);scrollDelta+$rootScope.scroll.threshold>=d.body.scrollHeight&&void 0!=$rootScope.paging.next?($rootScope.paginationAnin="easy-in",$rootScope.scroll.loading=!0,$rootScope.scroll.suspended=!0,$rootScope.getPagingData($FB,Config,$timeout,$rootScope)):$rootScope.pagingButton.executing=0}if("previous"===attrs.direction){try{window.pageYOffset=window.pageYOffset-d.body.clientHeight}catch(e){console.log(e)}try{doc.scrollTop=doc.scrollTop-d.body.clientHeight}catch(e){console.log(e)}if(tScroll=(window.pageYOffset||doc.scrollTop)-(doc.clientTop||0),tScroll-d.body.clientHeight<0){try{doc.scrollTop=0}catch(e){console.log(e)}try{window.pageYOffset=0}catch(e){console.log(e)}}$rootScope.pagingButton.executing=0}}})}}}]),dwnet.directive("userChart",["$window",function(){return{restrict:"A",controller:function($scope,$element){var parentWidth=document.querySelector("#user-chart-container").clientWidth;$element[0].width=parentWidth,$element[0].height="80";var ctx=$element[0].getContext("2d"),data={labels:["","","","","","","","","",""],datasets:[{fillColor:"rgba(220,220,220,0.5)",strokeColor:"rgba(220,220,220,1)",data:[65,59,90,81,56,55,40,60,70,80]}]},options={scaleOverlay:!1,scaleOverride:!1,scaleSteps:null,scaleStepWidth:null,scaleStartValue:null,scaleLineColor:"rgba(0,0,0,.1)",scaleLineWidth:1,scaleShowLabels:!1,scaleLabel:"<%=value%>",scaleFontFamily:"'Arial'",scaleFontSize:12,scaleFontStyle:"normal",scaleFontColor:"#666",scaleShowGridLines:!1,scaleGridLineColor:"rgba(0,0,0,.05)",scaleGridLineWidth:1,barShowStroke:!0,barStrokeWidth:1,barValueSpacing:3,barDatasetSpacing:1,animation:!0,animationSteps:60,animationEasing:"easeOutQuart",onAnimationComplete:null};new Chart(ctx).Bar(data,options)}}}]),dwnet.directive("voteButton",["$FB","$compile","$rootScope",function($FB,$compile,$rootScope){return{restrict:"A",scope:!0,controller:function($scope,$element,$attrs){$scope.friendPictBg=function(vote){switch(vote){case"-1":return"background-color: rgba(189,54,47, 0.7)";case"0":return"background-color: rgba(248,148,6, 0.7)";case"1":return"background-color: rgba(81,163,81, 0.7)";default:return"background-color: rgba(0,0,0, 0.5)"}},$scope.isInVotes=function(castedVote){var len=$rootScope.userVotes.length;if(0==len)return $rootScope.userVotes.push(castedVote),null;for(var i=0;len>i;i++)if($rootScope.userVotes[i].id==castedVote.id)return $rootScope.userVotes[i].vote=castedVote.vote,null;return $rootScope.userVotes.push(castedVote),null},$scope.vote=function(){var fbID=$attrs.fbid,vote=$attrs.vote;gapi.client.trustferret.vote.insert({userID:$rootScope.apiMe.id,friendID:fbID,vote:vote}).execute(function(resp){if("1"==resp.status){var castedVote={};castedVote.id=resp.id,castedVote.vote=resp.vote,"undefined"!=typeof $rootScope.userVotes&&$scope.isInVotes(castedVote),$rootScope.userVotes.push(castedVote);var el=angular.element(document.querySelector("#fnw-"+fbID));el.attr("voted",vote),el.attr("style",$scope.friendPictBg(vote))}})},$scope.changePictureBackground=function(toggleSwitch){var fbID=$attrs.fbid,vote=$attrs.vote,el=angular.element(document.querySelector("#fnw-"+fbID)),voted=el.attr("voted");switch(toggleSwitch){case 1:el.attr("style",$scope.friendPictBg(vote));break;case 0:el.attr("style",$scope.friendPictBg(voted))}}},link:function(scope,element){element.bind("click",function(){scope.vote()}),element.bind("mouseover",function(){scope.changePictureBackground(1)}),element.bind("mouseleave",function(){scope.changePictureBackground(0)})}}}]),dwnet.directive("voteButtonNeutral",[function(){return{restrict:"E",scope:!0,template:'<a class="btn-warning {{btnTrust}}" title="{{ \'NEUTRAL\' | translate }}"><span class="glyphicon glyphicon-adjust"></span></a>'}}]),dwnet.directive("voteButtonNo",[function(){return{restrict:"E",scope:!0,template:'<a class="btn-danger {{btnTrust}}" title="{{ \'DONT_TRUST\' | translate }}"><span class="glyphicon glyphicon-thumbs-down"></span></a>'}}]),dwnet.directive("voteButtonYes",[function(){return{restrict:"E",scope:!0,template:'<a class="btn-success {{btnTrust}}" title="{{ \'TRUST\' | translate }}"><span class="glyphicon glyphicon-thumbs-up"></span></a>'}}]),dwnet.animation(".in-left",[function(){var duration=.5,duration2=.5;return{enter:function(element,done){var random=100;TweenMax.set(element,{opacity:0,left:random+"px",display:"none"});var random2=.5;TweenMax.to(element,duration,{opacity:1,left:"0px",display:"inline-block",ease:Back.easeInOut,delay:random2,onComplete:done})},leave:function(element,done){{var parentWidth=element.parent()[1].clientWidth;element.parent()[1].clientHeight}TweenMax.set(element,{zIndex:5}),TweenMax.to(element,duration2,{opacity:0,left:"-"+parentWidth+"px",display:"none",onComplete:done})}}}]),dwnet.animation(".in-right",[function(){var duration=.4,duration2=.5;return{enter:function(element,done){var random=100;TweenMax.set(element,{opacity:0,right:random+"px",display:"none"});var random2=.5;TweenMax.to(element,duration,{opacity:1,right:"0px",display:"inline-block",ease:Back.easeInOut,delay:random2,onComplete:done})},leave:function(element,done){{var parentWidth=element.parent()[1].clientWidth;element.parent()[1].clientHeight}TweenMax.set(element,{zIndex:5}),TweenMax.to(element,duration2,{opacity:0,left:parentWidth+"px",display:"none",onComplete:done})}}}]);