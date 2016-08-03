angular.module('starter.controllers', [])

  .controller('DashCtrl', function ($scope, $timeout,$ionicPopup, ServerData, TranslateService,
                                    lang, $ionicModal,$ionicListDelegate,$ionicLoading) {
    $scope.lang = lang;
    $scope.model = {message: ""};
    $scope.translate = {message: "", result: []};
    $scope.hideLogo = function () {
      $scope.logoHide = true;
      $scope.hasTranslate = false;
    };
    $scope.showLogo = function () {
      $scope.logoHide = false;
    };
    $scope.close = function () {
      $scope.model.message = "";
      $scope.logoHide = false;
      $scope.hasTranslate = false;
    };
    $scope.loadMore = function () {
      $scope.$broadcast('scroll.infiniteScrollComplete');
    };
    $scope.clear = function () {
      $scope.model.message = "";
      $scope.hasTranslate = false;
      $scope.logoHide = false;
      ///$scope.close();
    };
    $scope.translate = function () {
      $scope.translate.result = [];
      if (!TranslateService.hasLang($scope.lang.id)) {
        ServerData.alert('请前往设置窗口下载数据包:&nbsp;' + $scope.lang.name);
      } else if ($scope.model.message.trim() == '') {
        ServerData.alert('翻译内容不能为空。');
      } else {
        $scope.translate.message = $scope.model.message;
        //$scope.model.message = "";
        //$scope.logoHide = false;
        this.addData();
        $ionicLoading.show();
        var promise = TranslateService.translate($scope.translate.message, $scope.lang.id);
        promise.then(function (data) {
          var test = [];
          for(var i in data){
            if(data[i] !=null){
              test.push(data[i])
            }else{
              //test.push("null");
            }
          }
          test = "[" + test + "]";
          console.log("test=" + test);
          $timeout(function(){
            $scope.hasTranslate = true;
            $scope.translate.result = JSON.parse(test);
            $ionicLoading.hide();
          },500);
        });
      }
      ;

    };
    $scope.resub = function () {
      $scope.hasTranslate = false;
    };
    $scope.reTranslate = function (index) {
      var idx = $scope.storedData.length - index - 1;
      $scope.model.message = $scope.storedData[idx];
      this.translate();
    };

    var audio = document.getElementById('fr').contentWindow.document.getElementById('audio');
    var timer;
    $scope.playAudio =  function(){
      var medias = $scope.translate.result;
      $scope.audioLength = medias.length;
      if(medias.length >0){
        audio.src = medias[0].audio;
        audio.play();
        var j = 0;
        audio.addEventListener('ended',function(){
          $scope.$apply(function(){
            j++;
            if(j < $scope.audioLength){
              audio.src = medias[j].audio;
              audio.playbackRate = 1;
              audio.play();
            }

          });
        },false);
      }

    };

    $scope.$on('$ionicView.enter', function () {
      console.log("dash enter");
      localforage.getItem('storedDataForage', function (err, value) {
        if (err) {
          $scope.storedData = [];
        } else if (value == null) {
          localforage.setItem('storedDataForage', []);
          $scope.storedData = [];
        } else {
          $scope.storedData = value;
        }
      });
    });
    //Add data to localForage
    $scope.addData = function () {
      if ($scope.storedData.length >= 10) {
        this.removeData(9);
      }
      $scope.storedData.push($scope.translate.message);
      localforage.setItem('storedDataForage', $scope.storedData).then(function (value) {
        //console.log($scope.translate.message + ' was added!');
      }, function (error) {
        console.error(error);
      });
    };

    //Remove data to localForage
    $scope.removeData = function (index) {
      var idx = $scope.storedData.length - index -1;
      console.log("index="+index+",idx="+idx);
      $scope.storedData.splice(idx, 1);
      $ionicListDelegate.closeOptionButtons();
      localforage.setItem('storedDataForage', $scope.storedData);
    };
    $scope.clearData = function () {
      console.log("clear history");
      $scope.storedData = [];
      localforage.setItem('storedDataForage', $scope.storedData);
    };

    //Modal................................................................
    $ionicModal.fromTemplateUrl('templates/lang.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    })
    $scope.openModal = function () {
      $scope.modal.show();
    }
    $scope.sltLang = function () {
      lang.name = TranslateService.getNamebyId(lang.id);
      $scope.lang = lang;
      localforage.setItem('lang', {id: lang.id, name: lang.name});
      $scope.modal.hide();
      if (TranslateService.hasLang(lang.id)) {
      } else {
        ServerData.alert('请前往设置窗口下载数据包:&nbsp;' + lang.name);
      }
    };
    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });
  })

  .controller('DialoguesCtrl', function ($http, $scope,$state,$ionicModal,ServerData,
                                         TranslateService,DialogueService,DialogueLang) {
    $scope.DialogueLang = DialogueLang;

    $scope.$on('$ionicView.enter', function () {
      if (TranslateService.hasLang(DialogueLang.id)) {
        //console.log("true");
      } else {
        //console.log("false");
        ServerData.alert('请前往设置窗口下载情景对话数据包:&nbsp;' + DialogueLang.name);
      }

    });

    DialogueService.all().success(function (response) {
      DialogueService.setDia(response.results);
      $scope.dialogues = response.results;
    }).error(function () {

    });

    $scope.gotoDetail = function(dialogueId){
      if (TranslateService.hasLang(DialogueLang.id)) {
        $state.go("tab.dialogue-detail",{dialogueId:dialogueId});
      } else {
        ServerData.alert('请前往设置窗口下载情景对话数据包:&nbsp;' + DialogueLang.name);
      }
    };

    /*Modal                        ************************************************************************/
    $ionicModal.fromTemplateUrl('templates/lang-dialogue.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    }) ;

    $scope.openModal = function() {
      $scope.modal.show();
    };

    $scope.sltLang = function() {
      DialogueLang.name = TranslateService.getNamebyId(DialogueLang.id);
      $scope.DialogueLang = DialogueLang;
      localforage.setItem('lang_dia', {id:DialogueLang.id,name:DialogueLang.name});
      $scope.modal.hide();
      if(TranslateService.hasLang(DialogueLang.id)){
        //console.log("sltLang - true");
      }else{
        //console.log("sltLang - false");
        ServerData.alert('请前往设置窗口下载情景对话数据包:&nbsp;'+DialogueLang.name);
      }
    };
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    /*Modal                        ************************************************************************/

  })

  .controller('DialogueDetailCtrl', function (DialogueLang,$scope, $stateParams, DialogueService, $timeout,Speed) {
    $scope.dialogue = DialogueService.get($stateParams.dialogueId);
    $scope.details = $scope.dialogue.subList;
    $scope.DialogueLang = DialogueLang;

    //$scope.details = DialogueService.get($stateParams.dialogueId).subList;

    var audio = document.getElementById('fr').contentWindow.document.getElementById('audio');
    audio.addEventListener('play', function () {
      $scope.$apply(function () {
        $scope.details[$scope.detail_subid].playing = true;
      })
    }, false);
    audio.addEventListener('ended', function () {
      $scope.$apply(function () {
        $scope.details[$scope.detail_subid].playing = false;
      })
    }, false);
    $scope.playfor = function (id, subAudio) {
      $scope.detail_subid = id;
      audio.src = subAudio;
      audio.playbackRate = Speed.value;
      audio.play();
    };

  })

  .controller('YuyinCtrl', function ($scope, $ionicSideMenuDelegate, $state,
                                     $rootScope ,$ionicModal, TranslateService, ServerData, YuyinLang) {
    $scope.goBack = function () {
      //console.log("right");
      /* $scope.$on('$destroy',function(){
       $rootScope.hideTabs = '';
       });*/
      /* $scope.hideTabs = '';*/
      $rootScope.hideTabs = '';
      $state.go("tab.dash");
    };

    $scope.$on('$ionicView.enter', function () {
      /*localforage.getItem('yuyin_lang', function(err, value){
       if (err){
       console.log("yuyin enter err");
       //$scope.yuyin_lang = {id:"YANGJIANG",name:"阳江话"};
       $scope.Luyin = Luyin;
       } else if (value == null){
       console.log("yuyin enter null");
       $scope.Luyin = Luyin;
       localforage.setItem('yuyin_lang', {id:Luyin.id,name:Luyin.name});
       //$scope.yuyin_lang = {id:"YANGJIANG",name:"阳江话"};

       } else {
       console.log("yuyin enter");
       Luyin = value;
       $scope.Luyin = Luyin;
       }
       if(TranslateService.hasLang(Luyin.id)){
       //console.log("true");
       }else{
       //console.log("false");
       ServerData.alert('请前往设置窗口下载数据包:&nbsp;'+Luyin.name);
       }
       });*/

      if (TranslateService.hasLang(YuyinLang.id)) {
        //console.log("true");
      } else {
        //console.log("false");
        ServerData.alert('请前往设置窗口下载数据包:&nbsp;' + YuyinLang.name);
      }

    });
  })

  .controller('SpeakCtrl', function ($scope, $ionicSideMenuDelegate) {
    /*$scope.toggleLeft = function() {
     $ionicSideMenuDelegate.toggleLeft();
     };*/

    console.log("SpeakCtrl");
  })

  .controller('SettingCtrl', function ($scope,Speed) {
    $scope.speedRate = Speed.value;

    $scope.speedChange = function (rate) {
      $scope.speedRate = rate;
      Speed.value = $scope.speedRate;
      console.log("rate="+rate+",speedRate="+$scope.speedRate);
    };
  })

  .controller('DownloadCtrl', function ($scope, $ionicSlideBoxDelegate,$ionicPopup, $timeout, langlist,lang_dialogues) {
    $scope.langlist = langlist;
    $scope.lang_dialogues = lang_dialogues;
    $scope.slideIndex = 0;
    $scope.lockSlide = function () {
      $ionicSlideBoxDelegate.enableSlide(false);
    }
    // Called each time the slide changes
    $scope.slideChanged = function (index) {
      $scope.slideIndex = index;
      console.log("slide Change");
      if ($scope.slideIndex == 0) {
        console.log("slide 1");
      }

      else if ($scope.slideIndex == 1) {
        console.log("slide 2");
      }

      else if ($scope.slideIndex == 2) {
        console.log("slide 3");
      }

    };

    $scope.activeSlide = function (index) {
      $ionicSlideBoxDelegate.slide(index);

    };

    $scope.download = function (langId) {
        if(langlist[langId].dwnstatus == 'download'){
          langlist[langId].dwnstatus = 'downing';
          this.showPopup('你选择的语音包已经加入到下载队列');
        }else if(langlist[langId].dwnstatus == 'success'){
          this.showPopup('该语音包已经完成下载');
        }else if(langlist[langId].dwnstatus == 'downing'){
          this.showPopup('该语音包正在下载');
        }else if(langlist[langId].dwnstatus == 'waiting'){
          this.showPopup('该语音包等待下载中');
        }else if(langlist[langId].dwnstatus == 'pause'){
          this.showPopup('该语音包已经暂停下载');
        }


    };

    $scope.showPopup = function (value){
      var myPopup = $ionicPopup.show({
        cssClass:'er-popup',
        content: value
      });

      $timeout(function(){
        myPopup.close();
      },1000);
    };

  })

  .controller('actionsheetCtl', function ($scope, $ionicActionSheet, $timeout, ServerData, $ionicPopup) {
    $scope.show = function () {

      var hideSheet = $ionicActionSheet.show({
        /*buttons: [
         { text: 'Move' }
         ],*/
        destructiveText: '<b>确定清除历史记录</b>',
        /*titleText: 'Modify your album',*/
        cancelText: '<b>取消</b>',
        cancel: function () {
          // add cancel code..
        },
        destructiveButtonClicked: function () {
          //console.log("delete historys.");
          //return true;
          $scope.storedData = [];
          localforage.setItem('storedDataForage', []);
          ServerData.alert('清除成功！');
          return true;

        },
        buttonClicked: function (index) {
          return true;
        }
      });

      /*$timeout(function() {
       hideSheet();
       }, 2000);*/

    };
  });

