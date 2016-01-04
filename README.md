:meteor-tv
A Synchtube-like site written in Meteor.

Bare bones for now, but currently playing video is synchronized (in very few lines of code).
```
Tracker.autorun(function (){
    var vid = Videos.findOne({playing: true});
    if (vid){
        player.loadVideoById(vid.ytUrl);
    }
});
```
