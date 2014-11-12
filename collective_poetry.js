Poem = new Mongo.Collection("poem");

Meteor.methods({
    updateWord: function (query, newData) {
        Poem.update(query, newData);
    }

});

function poemContent() {
    pw = Poem.findOne({}).words.sort(function (a,b) { return a.pos - b.pos; });
    return pw;
}

Router.route('/teste', function () {

  Session.set("poem_id", Poem.findOne()._id);

  Template.hello.helpers({
    poemHtml: function () {
      pw = poemContent(true);
      return pw;
    },
    poem: function () {
      pw = poemContent();
      return pw;
    },
    words: function () {
      pw = poemContent();
      return pw;
    }

  });

  Template.hello.events({
    'click button': function () {
      p = Poem.findOne();
      words = $('#poemBox').val().replace(/^\s+|\s+$/g, '');
    },
    'click .word-text': function (event) {
        var wordDOM = $(event.currentTarget);
        var wordEditDOM = wordDOM.next();
        wordDOM.toggle();
        wordEditDOM.toggle();
        $("input", wordEditDOM).focus();
    },
    'keypress .word-input': function (event) {
        if (event.which == 13) {
            newWord = $(event.target).val();
            this.word = newWord;
            Meteor.call("updateWord", {"words.pos": this.pos}, {$set: {"words.$.word": newWord}});
            var wordDOM = $(event.currentTarget).parent();
            var wordEditDOM = wordDOM.prev();
            wordDOM.toggle();
            wordEditDOM.toggle();
        }
    },
    'click .line-break': function (event) {
        pw = poemContent();
        console.log(pw[pw.length -1]);
    }
  });

  Template.hello.rendered = function () {
      $('.word-edit').toggle();
  }

  Template.word.helpers({
      wordText: function () {
        return this.word;
      }
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
