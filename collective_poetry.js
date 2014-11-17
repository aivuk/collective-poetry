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

        p.words = nw;
        Poem.update({}, p);
    },
    insertLineBreak: function (position) {
        p = Poem.findOne();
        var nw = p.words;

        for (var i = 0; i < nw.length; ++i) {
            if(nw[i].pos >= position) {
                nw[i].pos += 1;
            }
        }

        nw.push({"lineBreak": true, "pos": position});
        p.words = nw;
        Poem.update({}, p);
    }

});

Router.route('/poem', function () {
  poem = Poem.findOne({});

  this.render('poem');

});


if (Meteor.isClient) {
    var editPosition = 0;

    Template.poem.helpers({
        'poem': function () {
            return poemContent();
        },
        'editPosition': function() {
            return editPosition;
        }
    })

    Template.poem.events({
       'click .word-text': function (event) {
          Session.set("editWord", this.pos);
          $(".hidden-word").text(this.word);
          var wordDOM = $(event.currentTarget);
          var wordEditDOM = wordDOM.next();
          wordDOM.toggle();
          wordEditDOM.toggle();
          console.log($('.hidden-word').width());
          $("input", wordEditDOM).css('width', $('.hidden-word').width() + 20);
          $("input", wordEditDOM).focus();
      },
      'keypress .word-input': function (event) {
          if (event.which == 13 || event.which == 32) {
              newWord = $(event.target).val();
              if (newWord == '') {
                  Meteor.call("removeWord", this.pos);
              } else {
                  this.word = newWord;
                  Meteor.call("updateWord", {"words.pos": this.pos}, {$set: {"words.$.word": newWord}});
                  if (event.which == 32) {
                      Meteor.call("insertWord", "", this.pos + 1);
                      Session.set("editWord", this.pos + 1);
                      return;
                  }
              }
              Session.set("editWord", 0);
          }
      },
      'click .space': function (event) {
          Session.set("editWord", this.pos);
          Meteor.call("insertWord", "", this.pos)
      },
      'click .line-break': function (event) {
          Meteor.call("insertLineBreak", this.pos);
          Meteor.call("insertWord", "", this.pos + 1);
          Session.set("editWord", this.pos + 1);
      }
    });

    Template.wordEdit.rendered = function () {
        this.$("input").css('width', $(".hidden-word").width() + 20);
        this.$("input").focus();
    }

    Template.wordEdit.events({
        'keyup input': function (event) {
            $(".hidden-word").text($(event.currentTarget).val());
            $(event.currentTarget).animate({'width': $(".hidden-word").width() + 20}, 100);
        },
    });

    Template.word.helpers({
        wordText: function () {
          return this.word;
        },
        editMode: function () {
          return this.pos == Session.get("editWord");
        }
    });

    function poemContent() {
        pw = Poem.findOne({}).words.sort(function (a,b) { return a.pos - b.pos; });
        return pw;
    }

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
