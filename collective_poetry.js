Poem = new Mongo.Collection("poem");



Meteor.methods({
    updateWord: function (query, newData) {
        Poem.update(query, newData);
    },
    insertWord: function (word, position) {
        p = Poem.findOne();
        var nw = p.words;

        for (var i = 0; i < nw.length; ++i) {
            if(nw[i].pos >= position) {
                nw[i].pos += 1;
            }
        }

        nw.push({"word": word, "pos": position});
        p.words = nw;
        Poem.update({}, p);
    },
    removeWord: function (position) {
        p = Poem.findOne();
        var nw = p.words.filter(function (x) { return x.pos != position; });

        for (var i = 0; i < nw.length; ++i) {
            if(nw[i].pos > position) {
                nw[i].pos -= 1;
            }
        }

        console.log(nw);

        p.words = nw;
        Poem.update({}, p);
    }

});

function poemContent() {
    pw = Poem.findOne({}).words.sort(function (a,b) { return a.pos - b.pos; });
    return pw;
}

Router.route('/poem', function () {

  Session.set("poem_id", Poem.findOne()._id);

  Template.hello.helpers({
    poem: function () {
      pw = poemContent();
      return pw;
    },
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
        console.log( wordDOM.width() + 10);
        $("input", wordEditDOM).css('width', wordDOM.width() + 5);
        $("input", wordEditDOM).focus();
    },
    'keypress .word-input': function (event) {
        if (event.which == 13) {
            newWord = $(event.target).val();
            if (newWord == '') {
                Meteor.call("removeWord", this.pos);
            } else {
                this.word = newWord;
                Meteor.call("updateWord", {"words.pos": this.pos}, {$set: {"words.$.word": newWord}});
            }
            var wordDOM = $(event.currentTarget).parent();
            var wordEditDOM = wordDOM.prev();
            wordDOM.toggle();
            wordEditDOM.toggle();
        }
    },
    'click .space': function (event) {
        Meteor.call("insertWord", "N", this.pos)
//        console.log(this.pos);
    },
    'click .line-break': function (event) {
        pw = poemContent();
        console.log(pw[pw.length -1]);
    }
  });

  Template.hello.rendered = function () {
  }

  Template.word.helpers({
      wordText: function () {
        return this.word;
      }
  });

  insertWord = function (word, position) {
      Meteor.call("insertWord", word, position);
  }

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
