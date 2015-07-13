angular.module('MyApp')
  //.controller('DetailCtrl', ['$scope', '$rootScope', '$routeParams', 'Show', 'Subscription',
    .controller('DetailCtrl', ['$scope', '$rootScope', '$routeParams', 'Show', function($scope, $rootScope, $routeParams, Show) {
      /*Show.query({ seriesId: $routeParams.seriesId }, function(show) {
        $scope.show = show[0];
        //console.log(show);
        //console.log(show[0].name);

        $scope.isSubscribed = function() {
          return $scope.show.subscribers.indexOf($rootScope.currentUser._id) !== -1;
        };

        $scope.subscribe = function() {
          Subscription.subscribe(show).success(function() {
            $scope.show.subscribers.push($rootScope.currentUser._id);
          });
        };

        $scope.unsubscribe = function() {
          Subscription.unsubscribe(show).success(function() {
            var index = $scope.show.subscribers.indexOf($rootScope.currentUser._id);
            $scope.show.subscribers.splice(index, 1);
          });
        };

        $scope.nextEpisode = show.episodes.filter(function(episode) {
          return new Date(episode.firstAired) > new Date();
        })[0];
      });*/
          Show.query({ seriesId: $routeParams.seriesId }, function(entry) {
          console.log(entry[0]);
          $scope.show = entry[0];
        }); 

    }])