// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ngCordova', 'starter.controllers','starter.nav', 'starter.services'])
  .value("Luyin",{id:"YANGJIANG",name:"阳江话"})
  .value("lang",{id:"YANGJIANG",name:"阳江话"})
  .value("DialogueLang",{id:"YANGJIANG",name:"阳江话"})
  .value("DeviceStatus", {
    offline: false,
    ready: false
  })
    .run(function ($ionicPlatform,$rootScope,$window,$document,DeviceStatus,TranslateService) {
      TranslateService.load('YANGJIANG');
      localforage.getItem('lang', function(err, value){
          if (err){
          } else if (value == null){
            localforage.setItem('lang', {id:lang.id,name:lang.name});
          } else {
        	lang = value;
        	$rootScope.lang = lang;
          }
        });
      localforage.getItem('yuyin_lang', function(err, value){
          if (err){
          } else if (value == null){
            localforage.setItem('yuyin_lang', {id:Luyin.id,name:Luyin.name});
          } else {
            Luyin = value;
            $rootScope.Luyin = Luyin;
          }
      });

        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });

      $document[0].addEventListener("online", function () {
        $rootScope.$apply(function () {
          DeviceStatus.offline = false;
          console.log("online="+DeviceStatus.offline);
        });
      }, false);

      $document[0].addEventListener("offline", function () {
        $rootScope.$apply(function () {
          DeviceStatus.offline = true;
          console.log("offline="+DeviceStatus.offline);
        });
      }, false);

      $document[0].addEventListener("deviceready", function () {
        //console.log("device capture ="+navigator.device.capture);
        /*Media.prototype.startRecordWithSettings = function(options) {
          console.log("Media.startRecordWithSettings id: " + this.id + " src: " + this.src +
            " options: " + JSON.stringify(options));
          //Cordova.exec(null, null, "AudioRecord","startAudioRecord", [this.id, this.src, options]);
          Cordova.exec(null, this.errorCallback, "Media", "startRecordingAudio", [this.id, this.src,options]);
        };
        Media.prototype.stopRecordWithSettings = function() {
          //Cordova.exec(null, null, "AudioRecord","stopAudioRecord", [this.id, this.src]);
          Cordova.exec(null, this.errorCallback, "Media", "stopRecordingAudio", [this.id]);
        };*/
        $rootScope.$apply(function () {
          DeviceStatus.offline = ($window.navigator.connection.type === $window.Connection.NONE);
          DeviceStatus.ready = true;
          console.log("DeviceStatus.offline="+DeviceStatus.offline);
          console.log("deviceready="+DeviceStatus.ready);
        });
      }, false);
    })

    .config(function ($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
        /*$ionicConfigProvider.platform.ios.tabs.style('standard');
        $ionicConfigProvider.platform.ios.tabs.position('bottom');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.android.tabs.position('standard');

        $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
        $ionicConfigProvider.platform.android.navBar.alignTitle('left');

        $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
        $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

        $ionicConfigProvider.platform.ios.views.transition('ios');
        $ionicConfigProvider.platform.android.views.transition('android');*/
      /*if (ionic.Platform.isAndroid()) {
        $ionicConfigProvider.scrolling.jsScrolling(true);
      };*/


        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

        //setup an abstract state for the tabs directive
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })

            // Each tab has its own nav history stack:

            .state('tab.dash', {
                url: '/dash',
                views: {
                    'tab-dash': {
                        templateUrl: 'templates/tab-dash.html',
                        controller: 'DashCtrl'
                    }
                }
            })

.state('tab.yuyin', {
    url: '/yuyin',
    views: {
      'tab-yuyin': {
        templateUrl: 'templates/tab-yuyin.html',
        controller: 'YuyinCtrl'
      }
    }
  })

            .state('tab.chats', {
                url: '/chats',
                views: {
                    'tab-chats': {
                        templateUrl: 'templates/tab-chats.html',
                        controller: 'ChatsCtrl'
                    }
                }
            })


            .state('tab.chat-detail', {
                url: '/chats/:chatId',
                views: {
                    'tab-chats': {
                        templateUrl: 'templates/chat-detail.html',
                        controller: 'ChatDetailCtrl'
                    }
                }
            })

            .state('tab.dialogues', {
                url: '/dialogues',
                views: {
                    'tab-dialogues': {
                        templateUrl: 'templates/tab-dialogues.html',
                        controller: 'DialoguesCtrl'
                    }
                }
            })
            .state('tab.dialogue-detail', {
                url: '/dialogue/:dialogueId',
                views: {
                    'tab-dialogues': {
                        templateUrl: 'templates/dialogue-detail.html',
                        controller: 'DialogueDetailCtrl'
                    }
                }
            })

            .state('tab.setting', {
                url: '/setting',
                views: {
                    'tab-setting': {
                        templateUrl: 'templates/tab-setting.html',
                        controller: 'SettingCtrl'
                    }
                }
            })

            .state('tab.help', {
                url: '/setting/help',
                views: {
                    'tab-setting': {
                        templateUrl: 'templates/help.html'
                        //controller: 'SettingCtrl'
                    }
                }
            })

            .state('tab.about', {
                url: '/setting/about',
                views: {
                    'tab-setting': {
                        templateUrl: 'templates/about.html'
                        //controller: 'SettingCtrl'
                    }
                }
            })

          .state('tab.download', {
            url: '/setting/download',
            views: {
              'tab-setting': {
                templateUrl: 'templates/download.html',
                controller: 'DownloadCtrl'
              }
            }
          })
          .state('tab.test', {
            views: {
              'tab-setting': {
                templateUrl: 'templates/test.html'
                //controller: 'SettingCtrl'
              }
            }
          })
        ;

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/dash');

    })

    .filter('to_trusted', ['$sce', function ($sce) {
        return function (input) {
            return $sce.trustAsHtml(input);
        }
    }])

    .directive('hideTabs',function($rootScope){
        return {
            restrict: 'A',
            link: function($scope,element,attributes){
              $scope.$on('$ionicView.beforeEnter', function() {
                $scope.$watch(attributes.hideTabs, function(value){
                  $rootScope.hideTabs = 'tabs-item-hide';
                });
              });
              $scope.$on('$ionicView.beforeLeave', function() {
                $scope.$watch(attributes.hideTabs, function(value){
                  $rootScope.hideTabs = 'tabs-item-hide';
                });
                $scope.$watch('$destroy',function(){
                  $rootScope.hideTabs = '';
                });

              });
            }
        };
    })
;
