Poem = new Mongo.Collection("poem");

function poemContent(html) {
    html = typeof html != 'undefined' ? html:false;
    if (html) {
      pw = Poem.findOne({}).words.split("\n");
    } else {
      pw = Poem.findOne({}).words;
    }

    return pw;
}

Router.route('/teste', function () {

  Session.setDefault("counter", 0);

  Template.hello.helpers({
    poemHtml: function () {
      pw = poemContent(true);
      return pw;
    },
    poem: function () {
      pw = poemContent();
      return pw;
    }
  });

  Template.hello.events({
    'click button': function () {
      p = Poem.findOne();
      words = $('#poemBox').val().replace(/^\s+|\s+$/g, '');
      Poem.update(p._id, {$set: {words: words}});
    },
  });

  this.layout('hello');

});

/*
if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault("counter", 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get("counter");
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set("counter", Session.get("counter") + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
} */
