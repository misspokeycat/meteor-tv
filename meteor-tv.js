Videos = new Mongo.Collection('videos');

Meteor.methods({
   addVideo : function (video) {
       Videos.insert(video);
   },
   removeVideo : function(video) {
       Videos.remove(video);
   },
   stopPlayingCurrent : function(){
       var nowPlaying = Videos.findOne({playing: true});
       Videos.update(nowPlaying, {$set:{playing: false}});
   },
   playNext : function(){
        //Finds currently playing video, and plays a different video.
        var nowPlaying = Videos.findOne({playing: true});
        Meteor.call('stopPlayingCurrent');
        Videos.update(Videos.findOne({_id: {$ne: nowPlaying._id}})._id , {$set : {playing: true}});
        nowPlaying = Videos.findOne({playing: true});
   }, playVideo : function(video){
        Meteor.call('stopPlayingCurrent');
        Videos.update(video, {$set:{playing : true}})
    }
});

if (Meteor.isClient) {
  Meteor.subscribe("videos", null, function(){
      YT.load();
  });

  Template.body.helpers({
    'playlist' : function(){
        return Videos.find({});
    }
  });
    onYouTubeIframeAPIReady = function () {
        player = new YT.Player("player", {
            width : 600,
            height : 400,
            videoId : Videos.findOne({playing: true}).ytUrl,
            events : {
                onReady: function (event){
                    //magical reactive sync code :D
                    Tracker.autorun(function (){
                        var vid = Videos.findOne({playing: true});
                        if (vid){
                            player.loadVideoById(vid.ytUrl);
                        }
                    });
                },
                onStateChange: function (event){
                    if (event.data == 0){ //On end
                        Meteor.call('playNext');
                    }
                }
            }
        });
    };

    Template.body.events({
        "submit .yt-url" : function(event) {
            event.preventDefault();
            var text = event.target.text.value;
            //player.loadVideoById({videoId:text});
            Meteor.call('addVideo', {
                ytUrl: text,
                playing : false
            });

            event.target.text.value = "";
        },
        "click #delete" : function(event){
            if (Videos.findOne(this._id).playing){
                //Stops current video playback in DB.
                Meteor.call('stopPlayingCurrent');
                //Plays another video in the playlist.
                Meteor.call('playNext');
            }
            Meteor.call('removeVideo', this);
        },
        "click #play" : function(event){
            Meteor.call('stopPlayingCurrent');
            Meteor.call('playVideo', this);
            //player.loadVideoById({videoId : this.ytUrl});
        }
    });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    if (!Videos.findOne({playing: true})){
        Videos.insert({playing:true, ytUrl: 'ih2xubMaZW'})
    }
    Meteor.publish("videos", function(){
        return Videos.find();
    });
  });
}
